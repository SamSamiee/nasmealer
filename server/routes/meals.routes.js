const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// GET ALL USER MEALS
router.get("/", authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT mi.quantity AS quantity, mi.unit AS unit, m.id AS meal_id, m.name AS meal_name, mi.ingredient_id AS ingredient_id, i.name AS ingredient_name FROM meals m LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id LEFT JOIN ingredients i ON mi.ingredient_id = i.id WHERE m.created_by = $1 ORDER BY m.created_at DESC, m.name",
      [req.user.userId]
    );

    const meals = [];

    result.rows.forEach(
      ({
        quantity,
        unit,
        meal_id,
        meal_name,
        ingredient_id,
        ingredient_name,
      }) => {
        let meal = meals.find((i) => i.id === meal_id);
        if (!meal) {
          meal = { name: meal_name, id: meal_id, ingredients: [] };
          meals.push(meal);
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

    return res.json({ meals });
  } catch (err) {
    next(err);
  }
});

// GET A USER MEAL
router.get("/:mealID", authenticate, async (req, res, next) => {
  const { mealID } = req.params;
  try {
    // First check if meal exists
    const mealCheck = await pool.query(
      "SELECT id, name FROM meals WHERE id = $1 AND created_by = $2",
      [mealID, req.user.userId]
    );

    if (mealCheck.rows.length === 0) {
      return res.status(404).json({ error: "meal not found" });
    }

    // Get ingredients with LEFT JOIN to include meals without ingredients
    const result = await pool.query(
      "SELECT mi.quantity AS quantity, mi.unit AS unit, m.id AS meal_id, m.name AS meal_name, mi.ingredient_id AS ingredient_id, i.name AS ingredient_name FROM meals m LEFT JOIN meal_ingredients mi ON m.id = mi.meal_id LEFT JOIN ingredients i ON mi.ingredient_id = i.id WHERE m.id = $1 AND m.created_by = $2",
      [mealID, req.user.userId]
    );

    const ingredients = [];
    const meal = {
      name: result.rows[0].meal_name,
      id: result.rows[0].meal_id,
      ingredients,
    };

    result.rows.forEach((row) => {
      // Only add ingredient if it exists (not null)
      if (row.ingredient_id && row.ingredient_name) {
        ingredients.push({
          name: row.ingredient_name,
          id: row.ingredient_id,
          quantity: row.quantity,
          unit: row.unit,
        });
      }
    });

    return res.json({ meal });
  } catch (err) {
    next(err);
  }
});

// ADD A USER MEAL
router.post("/", authenticate, async (req, res, next) => {
  const { name, ingredients } = req.body;
  const created_by = req.user.userId;

  if (!name) {
    return res.status(400).json({ error: "meal name is required" });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const mealResult = await client.query(
      "INSERT INTO meals (name, created_by) VALUES ($1, $2) RETURNING id",
      [name, created_by]
    );

    const mealId = mealResult.rows[0].id;

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      for (const ing of ingredients) {
        const query = await client.query(
          `INSERT INTO ingredients (name, created_by) VALUES ($1, $2) ON CONFLICT (name, created_by) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [ing.name, created_by]
        );

        await client.query(
          "INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4)",
          [mealId, query.rows[0].id, ing.quantity, ing.unit]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      status: "success",
      message: "meal added successfully",
      id: mealId,
      name,
      ingredients: ingredients || [],
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
});

// DELETE A USER MEAL
router.delete("/:mealID", authenticate, async (req, res, next) => {
  const mealID = req.params.mealID;
  if (!mealID) return res.status(400).json({ error: "mealID is required" });
  try {
    const meal = await pool.query(
      "DELETE FROM meals WHERE id = $1 AND created_by = $2 RETURNING *",
      [mealID, req.user.userId]
    );
    return res.status(200).json({ message: "meal deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
