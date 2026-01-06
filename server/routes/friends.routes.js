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
   const u1 = String(U1);
   const u2 = String(U2);
   const userId = u1 < u2 ? u1 : u2;
   const friendId = u1 < u2 ? u2 : u1;
   return { userId, friendId };
}

const {
   authenticate,
} = require("../middlewares/auth.middleware.js");

//GET ALL FRIENDS OF A USER
router.get("/", authenticate, async (req, res, next) => {
   const userId = req.user.userId;

   try {
      const result = await pool.query(
         `
            SELECT u.name, u.id, f.updated_at FROM friendships f
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
      result.rows.forEach(({ name, id, updated_at }) =>
         friends.push({ name, id, updated_at })
      );

      return res.status(200).json(friends);
   } catch (err) {
      next(err);
   }
});

// ADD A FRIEND
router.post("/", authenticate, async (req, res, next) => {
   const userAId = req.user.userId;
   const userBId = req.body?.target_user_id;

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

   // normalize requstId and friend_id
   const { userId, friendId } = normalizeUsers(
      userAId,
      userBId
   );

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
               `
                UPDATE friendships
                SET 
                    status='pending',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id=$1 AND 
                friend_id=$2
                RETURNING id
                `,
               [userId, friendId]
            );
            const {
               rows: [{ id }],
            } = result;

            return res
               .status(200)
               .json({ message: "request sent", id });
         }
      } else {
         const result = await pool.query(
            `
        INSERT INTO friendships (user_id, friend_id) 
        VALUES ($1, $2)
        RETURNING id
        `,
            [userId, friendId]
         );

         const {
            rows: [{ id }],
         } = result;

         return res
            .status(201)
            .json({ message: "request sent", id });
      }
   } catch (err) {
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

// GET A FRIEND
// GET A FRIEND
router.get(
   "/:userBId",
   authenticate,
   async (req, res, next) => {
      const userAId = req.user.userId;
      const userBId = req.params.userBId;

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
         const friendQuery = await pool.query(
            `
            SELECT
                u.name AS friend_name, 
                u.id AS friend_id 
            FROM friendships f
            JOIN users u ON
                (f.user_id = $1 AND f.friend_id = u.id)
                OR
                (f.friend_id = $1 AND f.user_id = u.id)
            WHERE
                (f.user_id = $1 OR f.friend_id = $1)
                AND f.status = 'accepted'
                AND u.id = $2
            `,
            [userId, userBId] // Check normalized pair, but verify userBId matches
         );

         // Validate friendQuery
         if (friendQuery.rows.length === 0) {
            return res.status(404).json({
               error: "Friend not found or not accepted",
            });
         }

         // Get friend info
         const {
            rows: [{ friend_name, friend_id }],
         } = friendQuery;

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
         });
      } catch (err) {
         next(err);
      }
   }
);



module.exports = router;
