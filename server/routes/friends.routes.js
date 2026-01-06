const express = require("express");
const router = express.Router();
const pool = require("../db.js");

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

module.exports = router;
