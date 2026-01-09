const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const {
   authenticate,
} = require("../middlewares/auth.middleware.js");
const bcrypt = require("bcrypt");

// HOMEPAGE
router.get("/", authenticate, async (req, res, next) => {
   const userId = req.user.userId;
   try {
      // getting n.meals
      const meals = await pool.query(
         `SELECT COUNT(*) FROM meals WHERE created_by = $1`,
         [userId]
      );
      const number_of_meals = meals.rows[0].count;

      // getting n.cart items (pending)
      const pending_cart_items = await pool.query(
         `SELECT COUNT(*) as count FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE c.created_by = $1 AND ci.status = 'pending'`,
         [userId]
      );
      const number_of_pending_cart_items = parseInt(
         pending_cart_items.rows[0]?.count || 0,
         10
      );

      // getting n.plans
      const plans = await pool.query(
         `SELECT COUNT(*) FROM plans WHERE created_by = $1`,
         [userId]
      );
      const number_of_plans = plans.rows[0].count;

      // getting cart_items
      const cart_items_query = await pool.query(
         `SELECT
        ci.id,
        CASE
            WHEN ci.ingredient_id IS NOT NULL THEN ci.ingredient_id
            ELSE ci.product_id
        END AS item_id,
        CASE
            WHEN ci.ingredient_id IS NOT NULL THEN ingredients.name
            ELSE products.name
        END AS item_name,
        ci.quantity,
        ci.unit,
        ci.created_at,
        ci.type,
        ci.status
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      LEFT JOIN products ON products.id = ci.product_id
      LEFT JOIN ingredients ON ingredients.id = ci.ingredient_id
      WHERE c.created_by = $1
      AND ci.status <> 'done'
      ORDER BY ci.created_at DESC
    `,
         [userId]
      );
      const cart_items = cart_items_query.rows;

      // getting the last plan
      const result = await pool.query(
         "SELECT plans.name AS plan_name, mip.plan_id AS plan_id, mip.meal_id AS meal_id, mip.type AS type, mip.day AS day, meals.name AS meal_name FROM plans JOIN meals_in_plan mip ON plans.id = mip.plan_id JOIN meals ON meals.id = mip.meal_id WHERE plans.created_by = $1 ORDER BY plans.created_at DESC LIMIT 1",
         [userId]
      );

      let last_plan;
      if (result.rows.length === 0) {
         last_plan = null;
      } else {
         const { plan_name, plan_id } = result.rows[0];
         const meals = [];
         result.rows.forEach(
            ({ meal_id, meal_name, day, type }) =>
               meals.push({ meal_id, meal_name, day, type })
         );
         last_plan = { plan_name, plan_id, meals };
      }

      return res.status(200).json({
         number_of_pending_cart_items,
         number_of_meals,
         number_of_plans,
         last_plan,
         cart_items,
      });
   } catch (err) {
      next(err);
   }
});

// SIGNUP ROUTE
router.post("/signup", async (req, res, next) => {
   const { username, password, name, age, email } =
      req.body;
   try {
      // check for the required fields
      if (!email || !username || !password) {
         return res
            .status(400)
            .json({
               error: "an email, username, and password are required.",
            });
      }
      // check if the username or email already exists
      const existingUser = await pool.query(
         "SELECT * FROM users WHERE email = $1 OR username = $2",
         [email, username]
      );
      // if exits, return error
      if (existingUser.rows.length > 0) {
         return res
            .status(400)
            .json({
               error: "the username or email is already taken.",
            });
      }
      // hash the password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
         password,
         saltRounds
      );
      // create new user
      const newUser = await pool.query(
         "INSERT INTO users (username, password, name, age, email, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
         [
            username,
            hashedPassword,
            name,
            age,
            email,
            "user",
         ]
      );
      return res.status(201).json({
         status: "success",
         message: "user created successfully",
         data: newUser.rows[0],
      });
   } catch (err) {
      return res.json({ message: err.message });
   }
});

// LOGIN ROUTE
router.post("/login", async (req, res, next) => {
   // Trim whitespace from username/password (common issue on mobile)
   const username = req.body.username?.trim();
   const password = req.body.password?.trim();

   // check for requried fields
   if (!username || !password) {
      return res
         .status(400)
         .json({
            error: " username and password are required.",
         });
   }
   try {
      console.log(
         `Login attempt for username: "${username}" (length: ${
            username.length
         }), from origin: ${
            req.headers.origin || "no origin"
         }, user-agent: ${req.headers[
            "user-agent"
         ]?.substring(0, 50)}`
      );
      // check if the user exists
      const user = await pool.query(
         "SELECT username, password, id FROM users WHERE username = $1",
         [username]
      );
      // if does not exist, return error
      if (user.rows.length === 0) {
         console.log(
            `Login failed: User "${username}" not found`
         );
         return res
            .status(400)
            .json({
               error: "invalid username or password",
            });
      }
      //password check - compare hashed password with provided password
      const hashedPassword = user.rows[0].password;
      const isPasswordValid = await bcrypt.compare(
         password,
         hashedPassword
      );
      if (!isPasswordValid) {
         console.log(
            `Login failed: Invalid password for user "${username}"`
         );
         return res
            .status(400)
            .json({
               error: "invalid username or password",
            });
      }
      console.log(
         `Login successful for user "${username}"`
      );

      const userId = user.rows[0].id;
      const session = await pool.query(
         "INSERT INTO user_sessions (user_id) VALUES ($1) RETURNING id",
         [userId]
      );
      const sessionId = session.rows[0].id;
      // set a cookie
      // For cross-origin cookies (Vercel ↔ Railway), we need sameSite: "none" with secure: true
      // Check if we're in production (Railway) or if CLIENT_ORIGIN is set (deployed environment)
      const isProduction =
         process.env.NODE_ENV === "production" ||
         !!process.env.CLIENT_ORIGIN;
      const userAgent = req.headers["user-agent"] || "";
      const isSafari = /iPhone|iPad|iPod|Safari/i.test(
         userAgent
      );

      const cookieOptions = {
         httpOnly: true, // not accessible by JS on frontend
         secure: isProduction, // MUST be true when sameSite is "none"
         sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in prod, "lax" for dev
         path: "/", // ensure cookie is available for all paths
         // Note: Safari on iOS blocks third-party cookies even with sameSite: 'none'
         // This is a known limitation - users may need to enable cookies in Safari settings
      };

      console.log(
         `Setting cookie for ${
            isSafari ? "Safari" : "non-Safari"
         } browser with options:`,
         cookieOptions
      );
      res.cookie("session_id", sessionId, cookieOptions);

      // Also set it as a header for debugging (will be removed in production)
      res.setHeader(
         "X-Set-Cookie-Debug",
         `session_id=${sessionId}; HttpOnly; Secure; SameSite=None; Path=/`
      );
      // respond with success
      return res.status(201).json({
         status: "success",
         sessionId,
         userId,
         message: "Logged in successfully",
      });
   } catch (err) {
      return res.json({ message: err.message });
   }
});

// LOGOUT ROUTE
router.post("/logout", authenticate, async (req, res) => {
   try {
      await pool.query(
         "DELETE FROM user_sessions WHERE id = $1",
         [req.user.sessionId]
      );
      return res
         .status(200)
         .json({
            status: "success",
            message: "Logged out successfully",
         });
   } catch (err) {
      next();
   }
});

// GET ALL PENDING REQUESETS
router.get(
   "/pending",
   authenticate,
   async (req, res, next) => {
      const userId = req.user.userId;
      try {
      } catch (err) {
         next(err);
      }
   }
);

module.exports = router;
