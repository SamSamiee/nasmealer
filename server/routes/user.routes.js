const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// SIGNUP ROUTE
router.post("/signup", async (req, res, next) => {
  const { username, password, name, age, email } = req.body;
  try {
    // check for the required fields
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "an email, username, and password are required." });
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
        .json({ error: "the username or email is already taken." });
    }
    // create new user
    const newUser = await pool.query(
      "INSERT INTO users (username, password, name, age, email, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [username, password, name, age, email, "user"]
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
  const { username, password } = req.body;
  // check for requried fields
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: " username and password are required." });
  }
  try {
    // check if the user exists
    const user = await pool.query(
      "SELECT username, password, id FROM users WHERE username = $1",
      [username]
    );
    // if does not exist, return error
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "invalid username or password" });
    }
    //password check
    const userPassword = user.rows[0].password;
    if (userPassword !== password) {
      return res.status(400).json({ error: "invalid username or password" });
    }

    const userId = user.rows[0].id;
    const session = await pool.query(
      "INSERT INTO user_sessions (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
    const sessionId = session.rows[0].id;
    // set a cookie
    res.cookie("session_id", sessionId, {
      httpOnly: true, // not accessible by JS on frontend
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      sameSite: "strict", // protects against CSRF
    });
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
    await pool.query("DELETE FROM user_sessions WHERE id = $1", [
      req.user.sessionId,
    ]);
    return res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    next();
  }
});

module.exports = router;
