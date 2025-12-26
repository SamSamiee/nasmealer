const express = require("express");
const router = express.router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// CART = [
//     {id: l2k3j4, name: khiar, quantity: 23, unit: kg, price: 23, status: pending, box: meals},
//     {id: l2k3j4, name: khiar, quantity: 23, unit: kg, price: 23, status: pending, box: meals},
//     {id: l2k3j4, name: khiar, quantity: 23, unit: kg, price: 23, status: pending, box: meals},
// ]

// ADD MEALS INGREDIENT TO CART
router.post("/", authenticate, async (req, res) => {
  const meals = req.body.meals;
  const userId = req.user.userId;
  if (!Array.isArray(meals)) {
    return res.status(400).json({
      status: "failed",
      message: "meals should be provided as a list.",
    });
  }
  try {
    const client = await pool.connect(); // register a client
    await client.query("BEGIN"); // begin transaction
    // query every ingredient inside the list
    const ingredientResults = await Promise.all(
      meals.map((id) =>
        client.query(
          "SELECT m.name AS meal_name, mi.meal_id AS meal_id, mi.ingredient_id AS ingredient_id, mi.quantity AS quantity, mi.unit AS unit, i.name AS ingredient_name FROM meal_ingredients mi JOIN ingredients i ON i.id = mi.ingredient_id JOIN meals m ON mi.meal_id = m.id WHERE meal_id = $1",
          [id]
        )
      )
    );
    const rows = ingredientResults.flatMap((result) => result.rows);
    const ingredients = [];

    rows.forEach(
      ({
        meal_name,
        meal_id,
        ingredient_id,
        quantity,
        unit,
        ingredient_name,
      }) => {
        let ingredient = ingredients.find(
          (i) => i.id === ingredient_id && i.unit === unit
        );
        if (!ingredient) {
          ingredient = {
            name: ingredient_name,
            id: ingredient_id,
            used_in: [meal_name],
            unit,
            quantity,
          };
          ingredients.push(ingredient);
        } else {
          ingredient.quantity += quantity;
          if (!ingredient.used_in.includes(meal_name)) {
            ingredient.used_in.push(meal_name);
          }
        }
      }
    );

    const {
      rows: [{ id: cartId }],
    } = await client.query(
      "INSERT INTO carts (created_by) VALUES ($1) ON CONFLICT (created_by) DO UPDATE SET created_by = EXCLUDED.created_by RETURNING id",
      [userId]
    );

    // add the ingredients to the cart
    for (const { id, quantity, unit, type, status } of ingredients) {
      await client.query(
        "NSERT INTO cart_items (cart_id, product_id, ingredient_id, quantity, unit, type, status) VALUES ($1, NULL, $2, $3, $4, $5, $6)",
        [cartId, id, quantity, unit, "meal", "pending"]
      );
    }
    await client.query("COMMIT"); // commit changes
    res.status(201).json({ status: "success", ingredients });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "internal server error",
      error: err.message,
    });
    await client.query("ROLLBACK"); //undo changes
  } finally {
    client.release(); // release client
  }
});

// ADD PRODUCTS TO CART

// CHANGE STATUS OF CART ITEMS

// DELETE ITEMS FROM CART

module.exports = router;
