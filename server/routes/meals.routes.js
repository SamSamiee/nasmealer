const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// GET ALL USER MEALS
router.get("/", authenticate, async (req, res) => {
  try {
    const meals = await pool.query(
      "SELECT * FROM meals WHERE created_by = $1",
      [req.user.userId]
    );
    return res.json({ meals: meals.rows });
  } catch (err) {
    return res.json({
      message: "error in GET ALL USER MEALS",
      error: err.message,
    });
  }
});

// GET A USER MEAL
router.get("/:mealID", authenticate, async (req, res) => {
  const { mealID } = req.params;
  try {
    const meal = await pool.query(
      "SELECT * FROM meals WHERE id = $1 AND created_by = $2",
      [mealID, req.user.userId]
    );
    if (meal.rows.length === 0) {
      return res.status(404).json({ error: "meal not found" });
    }
    return res.json({ meal: meal.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ADD A USER MEAL
router.post("/", authenticate, async (req, res) => {
  const { name, ingredients } = req.body;
  const created_by = req.user.userId;

  if (!name) {
    return res.status(400).json({ error: "meal name is required" });
  }

  try {
    const mealResult = await pool.query(
      "INSERT INTO meals (name, created_by) VALUES ($1, $2) RETURNING id",
      [name, created_by]
    );
    const mealId = mealResult.rows[0].id;

    let queries = [];
    if (Array.isArray(ingredients) && ingredients.length) {
      queries = ingredients.map((ing) => {
        return pool.query(
          "INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4)",
          [mealId, ing.id, ing.quantity, ing.unit]
        );
      });
    }

    await Promise.all(queries);

    return res.status(201).json({
      status: "success",
      message: "meal added successfully",
      id: mealId,
      name,
      ingredients: ingredients || [],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE A USER MEAL
router.delete("/:mealID", authenticate, async (req, res) => {
  const mealID = req.params.mealID;
  if (!mealID) return res.status(400).json({ error: "mealID is required" });
  try {
    const meal = await pool.query(
      "DELETE FROM meals WHERE id = $1 AND created_by = $2 RETURNING *",
      [mealID, req.user.userId]
    );
    return res.status(200).json({ message: "meal deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
