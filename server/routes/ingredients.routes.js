const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// ADD AN INGREDIENT
router.post("/", authenticate, async (req, res) => {
  const name = req.body.name;
  if (!name) {
    return res
      .status(400)
      .json({ status: "failed", message: "name is required." });
  }
  try {
    const ingredient = await pool.query(
      "INSERT INTO ingredients (name, created_by) VALUES ($1, $2) RETURNING id",
      [name, req.user.userId]
    );
    const id = ingredient.rows[0].id;
    return res.status(201).json({ status: "success", id, name });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "internal server error",
      error: err.message,
    });
  }
});

// GET ALL INGREDIENTS
router.get("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      "SELECT name, id FROM ingredients WHERE created_by = $1",
      [userId]
    );

    return res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET AN INGREDIENT
router.get("/:ingId", authenticate, async (req, res) => {
  const { ingId } = req.params;
  try {
    const ingredient = await pool.query(
      "SELECT * FROM ingredients WHERE id = $1 AND created_by = $2",
      [ingId, req.user.userId]
    );

    if (ingredient.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "ingredient not found" });
    }

    return res
      .status(200)
      .json({ status: "success", ingredient: ingredient.rows[0] });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "internal server error",
      error: err.message,
    });
  }
});

// DELETE AN INGREDIENT
router.delete("/:ingId", authenticate, async (req, res, next) => {
  const { ingId } = req.params;
  const userId = req.user.userId;
  if (!ingId) {
    return res.status(400).json({ status: "failed", message: "provide Id" });
  }
  try {
    await pool.query(
      "DELETE FROM ingredients WHERE id = $1 AND created_by = $2",
      [ingId, userId]
    );
    return res
      .status(200)
      .json({ status: "success", message: "ingredient successfully deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
