const express = require("express");
const router = express.Router();
const { pool } = require("../db.js");
const { isAdmin, authenticate } = require("../middlewares/auth.middleware.js");

//GET ALL INGREDIENTS
router.get("/ingredients", authenticate, isAdmin, async (req, res, next) => {
  try {
    const query = await pool.query(`
            SELECT i.name AS ingredient_name, u.username AS username
            FROM ingredients i
            JOIN users u ON u.id = i.created_by
            `);
    return res.status(200).json({ data: query.rows });
  } catch (err) {
    next(err);
  }
});

//GET ALL MEALS
router.get("/meals", authenticate, isAdmin, async (req, res, next) => {
  try {
      const query = await pool.query(
        "SELECT mi.quantity AS quantity, mi.unit AS unit, m.id AS meal_id, m.name AS meal_name, mi.ingredient_id AS ingredient_id, i.name AS ingredient_name FROM meals m JOIN meal_ingredients mi ON m.id = mi.meal_id JOIN ingredients i ON mi.ingredient_id = i.id"

      );

      const meals = [];

      query.rows.forEach(
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

          meal.ingredients.push({
            name: ingredient_name,
            id: ingredient_id,
            unit,
            quantity,
          });
        }
      );

      return res.json({ meals });
  } catch (err) {
    next(err);
  }
});

//GET ALL PRODUCTS
router.get("/products", authenticate, isAdmin, async (req, res, next) => {
  try {
    const query = await pool.query(`
            SELECT p.name AS product_name, u.username AS username
            FROM products p
            JOIN users u ON u.id = p.created_by
            `);
    return res.status(200).json({ data: query.rows });
  } catch (err) {
    next(err);
  }
});

//GET ALL USERS
router.get("/users", authenticate, isAdmin, async (req, res, next) => {});

//GET ALL PLANS
router.get("/plans", authenticate, isAdmin, async (req, res, next) => {});

//REMOVE A USER
router.get("/ingredients", authenticate, isAdmin, async (req, res, next) => {});

module.exports = router;
