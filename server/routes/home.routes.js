const express = require("express");
const router = express.Router();
const { pool } = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

router.get("/", authenticate, async (req, res, next) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
