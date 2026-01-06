const express = require("express");
const router = express.Router();
const pool = require("../db.js");

// ======================== RULE ==============================================
// in friendship table request id should always be smaller than the friend_id
// ============================================================================

const {
   authenticate,
} = require("../middlewares/auth.middleware.js");

//GET ALL FRIENDS OF A USER

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
   const userId = userAId < userBId ? userAId : userBId;
   const friendId = userAId < userBId ? userBId : userAId;

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
            pool.query(
               `
                UPDATE friendships 
                SET stauts='pending' 
                WHERE user_id=$1 AND 
                friend_id=$2
                `,
               [userId, friendId]
            );
         }

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
            .status(204)
            .json({ message: "request sent", id });
      }
   } catch (err) {
      next(err);
   }
});

// REMOVE A FRIEND

// GET ALL PENDING REQUESTS

// GET A FRIEND

module.exports = router;
