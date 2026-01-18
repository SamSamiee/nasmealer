const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const days = [
   "monday",
   "tuesday",
   "wednesday",
   "thursday",
   "friday",
   "saturday",
   "sunday",
];

// ======================== RULE ==============================================
// in friendship table request id should always be smaller than the friend_id
// ============================================================================

function normalizeUsers(U1, U2) {
   // Ensure UUIDs are strings and normalize to lowercase for consistent comparison
   const u1 = String(U1).toLowerCase().trim();
   const u2 = String(U2).toLowerCase().trim();
   const userId = u1 < u2 ? u1 : u2;
   const friendId = u1 < u2 ? u2 : u1;
   return { userId, friendId };
}

const {
   authenticate,
} = require("../middlewares/auth.middleware.js");

// FIND A USER
router.get(
   "/search",
   authenticate,
   async (req, res, next) => {
      const targetUsername =
         req.query.username || req.query.q;

      if (!targetUsername) {
         return res.status(400).json({
            error: "Username parameter is required",
         });
      }

      try {
         const result = await pool.query(
            `
         SELECT id, username, name
         FROM users
         WHERE username ILIKE $1
         LIMIT 20
         `,
            [`%${targetUsername}%`]
         );

         if (result.rows.length === 0) {
            return res.status(200).json({
               users: [],
               message: "No users found",
            });
         }

         return res.status(200).json({
            users: result.rows,
         });
      } catch (err) {
         next(err);
      }
   }
);

//GET ALL FRIENDS OF A USER
router.get("/", authenticate, async (req, res, next) => {
   const userId = req.user.userId;

   try {
      const result = await pool.query(
         `
            SELECT u.name, u.id, u.username, f.updated_at FROM friendships f
            JOIN users u ON 
                (f.user_id = $1 AND f.friend_id = u.id) OR
                (f.friend_id = $1 AND f.user_id = u.id)
            WHERE
                (f.user_id = $1 OR
                f.friend_id = $1)
                AND f.status = 'accepted'
            ORDER BY f.updated_at DESC
            `,
         [userId]
      );

      const friends = [];
      result.rows.forEach(({ name, id, updated_at, username }) =>
         friends.push({ name, username, id, updated_at })
      );

      return res.status(200).json({friends});
   } catch (err) {
      next(err);
   }
});

// ADD A FRIEND
router.post("/", authenticate, async (req, res, next) => {
   const userAId = req.user?.userId;
   const userBId = req.body?.target_user_id;

   // Validate userAId (authenticated user)
   if (!userAId) {
      console.error("POST /friend - userAId is missing from req.user:", req.user);
      return res.status(401).json({
         error: "Authentication failed - user ID not found",
      });
   }

   if (!userBId) {
      return res
         .status(400)
         .json({ error: "invalid target_user_id" });
   }

   // Prevent self-friending
   if (userAId === userBId) {
      return res.status(400).json({
         error: "You cannot send a friend request to yourself",
      });
   }

   // normalize userId and friend_id (ensure UUIDs are valid strings)
   if (typeof userAId !== 'string' || typeof userBId !== 'string') {
      console.error("POST /friend - Invalid UUID types:", { userAId, userBId, userAType: typeof userAId, userBType: typeof userBId });
      return res.status(400).json({
         error: "Invalid user ID format",
      });
   }

   const { userId, friendId } = normalizeUsers(
      userAId,
      userBId
   );

   // Validate normalized IDs
   if (!userId || !friendId) {
      console.error("POST /friend - Normalized IDs are invalid:", { userAId, userBId, userId, friendId });
      return res.status(400).json({
         error: "Invalid user ID format after normalization",
      });
   }

   // Ensure requester_id is set correctly (should be userAId, not normalized)
   const requesterId = String(userAId).trim();
   
   if (!requesterId) {
      console.error("POST /friend - requesterId is empty after string conversion:", { userAId, userId, friendId });
      return res.status(500).json({
         error: "Internal server error - invalid requester ID",
      });
   }

   try {
      // Check if friendship already exists
      const existing = await pool.query(
         `
         SELECT id, status FROM friendships 
         WHERE user_id = $1 AND friend_id = $2
         `,
         [userId, friendId]
      );

      if (existing.rows.length > 0) {
         const existingStatus = existing.rows[0].status;
         if (existingStatus === "accepted") {
            return res.status(409).json({
               error: "You are already friends with this user",
            });
         } else if (existingStatus === "pending") {
            return res.status(409).json({
               error: "Friend request already sent",
            });
         } else if (existingStatus === "rejected") {
            const result = await pool.query(
               `UPDATE friendships
               SET 
                  status='pending',
                  requester_id=$3,
                  updated_at = CURRENT_TIMESTAMP
               WHERE user_id=$1 AND 
               friend_id=$2
               RETURNING id
               `,
               [userId, friendId, requesterId]
            );
            const {
               rows: [{ id }],
            } = result;

            return res
               .status(200)
               .json({ message: "request sent", id });
         }
      } else {
         // Double-check that requesterId is not null/undefined before insert
         if (!requesterId) {
            console.error("POST /friend - requesterId is null/undefined before insert:", { userAId, userId, friendId, requesterId });
            return res.status(500).json({
               error: "Internal server error - requester ID is missing",
            });
         }

         const result = await pool.query(
            `
        INSERT INTO friendships (user_id, friend_id, requester_id) 
        VALUES ($1, $2, $3)
        RETURNING id
        `,
            [userId, friendId, requesterId]
         );

         const {
            rows: [{ id }],
         } = result;

         return res
            .status(201)
            .json({ message: "request sent", id });
      }
   } catch (err) {
      console.error("Error in POST /friend route:", err);
      // Log more details if it's a database constraint error
      if (err.code === '23503') { // Foreign key violation
         console.error("Foreign key constraint violation - user might not exist");
      } else if (err.code === '23505') { // Unique violation
         console.error("Unique constraint violation - friendship already exists");
      }
      next(err);
   }
});

// REMOVE A FRIEND
router.delete("/", authenticate, async (req, res, next) => {
   const userAId = req.user.userId;
   const userBId = req.body?.target_user_id;

   if (!userBId) {
      return res
         .status(400)
         .json({ error: "invalid target_user_id" });
   }

   if (userAId === userBId) {
      return res
         .status(400)
         .json({ error: "can not remove yourself" });
   }

   const { userId, friendId } = normalizeUsers(
      userAId,
      userBId
   );

   try {
      const result = await pool.query(
         `
        DELETE FROM friendships
        WHERE user_id = $1 AND friend_id = $2
        RETURNING id
        `,
         [userId, friendId]
      );

      if (result.rows.length === 0) {
         return res
            .status(404)
            .json({ error: "friendship not found" });
      }

      const {
         rows: [{ id }],
      } = result;

      return res.status(200).json({
         message: "friend successfully removed",
         id,
      });
   } catch (err) {
      next(err);
   }
});

// GET ALL PENDING REQUESTS (must be before /:userBId route)
router.get(
   "/pending",
   authenticate,
   async (req, res, next) => {
      const userId = req.user.userId;
      try {
         const data = await pool.query(
            `SELECT
               f.requester_id,
               u.name AS requester_name,
               u.username AS requester_username 
            FROM friendships f
            JOIN users u ON u.id = f.requester_id
            WHERE
               (f.user_id = $1 OR f.friend_id = $1) AND
               f.status = 'pending' AND
               f.requester_id != $1
            ORDER BY f.updated_at DESC`,
            [userId]
         );

         if (data.rows.length === 0) {
            return res.status(200).json({ data: [] });
         }

         return res.status(200).json({ data: data.rows });
      } catch (err) {
         next(err);
      }
   }
);

// GET A FRIEND
router.get(
   "/:userBId",
   authenticate,
   async (req, res, next) => {
      const userAId = req.user.userId;
      const userBId = req.params.userBId;

      // Validate UUID format (basic check - UUIDs are 36 characters with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userBId)) {
         return res.status(400).json({
            error: "Invalid user ID format",
         });
      }

      if (userAId === userBId) {
         return res.status(400).json({
            error: "Cannot get yourself as a friend",
         });
      }

      const { userId, friendId } = normalizeUsers(
         userAId,
         userBId
      );

      try {
         // Check if they are actually friends (status = 'accepted')
         // Since friendships are stored with user_id < friend_id (normalized),
         // we explicitly check the normalized pair
         const friendQuery = await pool.query(
            `
            SELECT
                u.name AS friend_name, 
                u.id AS friend_id,
                f.status 
            FROM friendships f
            JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
            WHERE
                f.user_id = $1 AND f.friend_id = $2
                AND u.id = $3
            `,
            [userId, friendId, userBId] // Use normalized pair (userId, friendId) and verify userBId matches
         );

         // If no friendship record exists, check if user exists
         if (friendQuery.rows.length === 0) {
            const result = await pool.query(
               `
               SELECT name, username, id
               FROM users
               WHERE id = $1
               `,
               [userBId]
            );

            // If user doesn't exist, return 404
            if (result.rows.length === 0) {
               return res
                  .status(404)
                  .json({ error: "User not found" });
            }

            // User exists but no friendship - return basic info
            const { name, username, id } = result.rows[0];
            return res.status(200).json({
               name,
               username,
               id,
               status: "",
            });
         }

         // Friendship exists - get the data
         const {
            rows: [{ friend_name, friend_id, status }],
         } = friendQuery;

         // If not accepted friends, return only basic info
         if (status !== "accepted") {
            return res.status(200).json({
               friend_name,
               friend_id,
               status,
            });
         }

         // Get all meals of friend (only if public)
         const mealQuery = await pool.query(
            `SELECT 
                mi.quantity AS quantity, 
                mi.unit AS unit,
                m.id AS meal_id,
                m.name AS meal_name,
                mi.ingredient_id AS ingredient_id,
                i.name AS ingredient_name
            FROM meals m
            LEFT JOIN meal_ingredients mi ON 
                m.id = mi.meal_id 
            LEFT JOIN ingredients i ON
                mi.ingredient_id = i.id
            LEFT JOIN user_privacy up ON
                up.user_id = m.created_by
            WHERE
                m.created_by = $1 AND
                (up.public_meals = true OR up.public_meals IS NULL)
            ORDER BY m.name ASC
            `,
            [friend_id] // Use friend_id from query result
         );

         // Structure the result
         const friend_meals = [];

         mealQuery.rows.forEach(
            ({
               quantity,
               unit,
               meal_id,
               meal_name,
               ingredient_id,
               ingredient_name,
            }) => {
               let meal = friend_meals.find(
                  (i) => i.id === meal_id
               );
               if (!meal) {
                  meal = {
                     name: meal_name,
                     id: meal_id,
                     ingredients: [],
                  };
                  friend_meals.push(meal);
               }

               // Only add ingredient if it exists (not null)
               if (ingredient_id && ingredient_name) {
                  meal.ingredients.push({
                     name: ingredient_name,
                     id: ingredient_id,
                     unit,
                     quantity,
                  });
               }
            }
         );

         // Get all friend plans (only if public)
         const mealTypes = ["breakfast", "lunch", "dinner"]; // Define mealTypes

         const planQuery = await pool.query(
            `
            SELECT
                plans.name AS name,
                mip.plan_id AS plan_id,
                mip.meal_id AS meal_id,
                mip.type AS type,
                mip.day AS day,
                meals.name AS meal_name
            FROM plans
            JOIN meals_in_plan mip ON 
                plans.id = mip.plan_id
            JOIN meals ON
                meals.id = mip.meal_id
            LEFT JOIN user_privacy up ON
                up.user_id = plans.created_by
            WHERE
                plans.created_by = $1 AND
                (up.public_plans = true OR up.public_plans IS NULL)
            `,
            [friend_id] // Use friend_id from query result
         );

         // Structure the data
         const friend_plans = [];

         for (const row of planQuery.rows) {
            const {
               plan_id,
               name: plan_name,
               day,
               type,
               meal_id,
               meal_name,
            } = row;

            // Find or create plan
            let plan = friend_plans.find(
               (p) => p.plan_id === plan_id
            );
            if (!plan) {
               plan = {
                  plan_id,
                  plan_name,
                  week_table: days.map((d) => ({
                     day: d,
                     meals: mealTypes.map((t) => ({
                        type: t,
                        meal_id: null,
                        meal_name: null,
                     })),
                  })),
               };
               friend_plans.push(plan);
            }

            // Find day
            const dayObj = plan.week_table.find(
               (d) => d.day === day
            );
            if (!dayObj) continue;

            // Find meal slot
            const mealSlot = dayObj.meals.find(
               (m) => m.type === type
            );
            if (!mealSlot) continue;

            // Fill it
            mealSlot.meal_id = meal_id;
            mealSlot.meal_name = meal_name;
         }

         return res.status(200).json({
            friend_id,
            friend_name,
            friend_meals,
            friend_plans,
            status,
         });
      } catch (err) {
         next(err);
      }
   }
);

// CANCEL PENDING REQUEST
router.patch("/", authenticate, async (req, res, next) => {
   const userAId = req.user.userId;
   const userBId = req.body?.target_user_id;

   if (!userBId) {
      return res
         .status(400)
         .json({ error: "target_user_id is required" });
   }

   // Prevent self-operation
   if (userAId === userBId) {
      return res.status(400).json({
         error: "Cannot cancel request to yourself",
      });
   }

   // Normalize user IDs for consistent lookup
   const { userId, friendId } = normalizeUsers(
      userAId,
      userBId
   );

   try {
      const result = await pool.query(
         `
         DELETE FROM friendships
         WHERE
            user_id = $1 AND
            friend_id = $2 AND
            requester_id = $3 AND
            status = 'pending'
         RETURNING id
         `,
         [userId, friendId, userAId]
      );

      if (result.rows.length === 0) {
         return res.status(404).json({
            error: "No pending request found to cancel",
         });
      }

      return res.status(200).json({
         message: "Request successfully canceled",
         id: result.rows[0].id,
      });
   } catch (err) {
      console.error(err);
      next(err);
   }
});

router.patch(
   "/request",
   authenticate,
   async (req, res, next) => {
      const userAId = req.user.userId;  // The person responding (recipient)
      const userBId = req.body?.target_user_id;  // The requester
      const command = req.body?.command;

      if (!userBId) {
         return res
            .status(400)
            .json({ error: "target_id not provided." });
      }

      // Fix: Changed || to && - command must be one of the valid values
      if (
         command !== "accepted" &&
         command !== "rejected"
      ) {
         return res
            .status(400)
            .json({ error: "invalid command" });
      }

      // Normalize user IDs
      const { userId, friendId } = normalizeUsers(
         userAId,
         userBId
      );

      try {
         const result = await pool.query(
            `
            UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE
               user_id = $2 AND
               friend_id = $3 AND
               requester_id = $4 AND
               status = 'pending'
            RETURNING id
            `,
            [command, userId, friendId, userBId]
         );

         if (result.rows.length === 0) {
            return res.status(404).json({
               error: "No pending request found"
            });
         }

         return res.status(200).json({
            message: `Request ${command} successfully`,
            id: result.rows[0].id,
         });
      } catch (err) {
         console.error(err);
         next(err);
      }
   }
);

module.exports = router;
