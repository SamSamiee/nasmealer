const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// Health check endpoint - test DB connection
router.get("/health", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
    return res.status(200).json({ 
      status: "ok", 
      database: "connected",
      time: result.rows[0].current_time,
      pgVersion: result.rows[0].pg_version
    });
  } catch (err) {
    return res.status(500).json({ 
      status: "error", 
      database: "disconnected",
      error: err.message 
    });
  }
});

router.get("/", authenticate, async (req, res, next) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
