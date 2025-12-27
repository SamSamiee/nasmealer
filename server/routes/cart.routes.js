const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// GET CART ITEMS
router.get("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const { rows } = await pool.query(
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
WHERE c.created_by = $1;
`,
      [userId]
    );

    return res.status(200).json({ status: "success", data: rows });
  } catch (err) {
    next(err);
  }
});

// ADD MEALS INGREDIENT TO CART
router.post("/meals", authenticate, async (req, res, next) => {
  const meals = req.body.meals;
  const userId = req.user.userId;
  if (!Array.isArray(meals)) {
    return res.status(400).json({
      status: "failed",
      message: "meals should be provided as a list.",
    });
  }
  let client;
  try {
    client = await pool.connect(); // register a client
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
    for (const { id, quantity, unit } of ingredients) {
      await client.query(
        "INSERT INTO cart_items (cart_id, product_id, ingredient_id, quantity, unit, type, status) VALUES ($1, NULL, $2, $3, $4, $5, $6)",
        [cartId, id, quantity, unit, "meal", "pending"]
      );
    }
    await client.query("COMMIT"); // commit changes
    res.status(201).json({ status: "success", ingredients });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK"); //undo changes
    }
    next(err);
  } finally {
    if (client) {
      client.release(); // release client
    }
  }
});

// ADD PRODUCTS TO CART
router.post("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;
  const product = req.body.product;
  if (!(product && typeof product === "object" && !Array.isArray(product))) {
    return res.status(400).json({
      status: "failed",
      message: "product must be provided as an object.",
    });
  }

  const { name, quantity, unit } = product;
  if (!name) {
    return res
      .status(400)
      .json({ status: "failed", message: "product name is required." });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const {
      rows: [{ id: cartId }],
    } = await client.query(
      "INSERT INTO carts (created_by) VALUES ($1) ON CONFLICT (created_by) DO UPDATE SET created_by = EXCLUDED.created_by RETURNING id",
      [userId]
    );

    const {
      rows: [{ id: productId }],
    } = await client.query(
      "INSERT INTO products (name, created_by) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT unique_name_per_user DO UPDATE SET name = EXCLUDED.name RETURNING id",
      [name, userId]
    );

    await client.query(
      "INSERT INTO cart_items (cart_id, product_id, ingredient_id, quantity, unit) VALUES($1, $2, NULL, $3, $4)",
      [cartId, productId, quantity, unit]
    );
    await client.query("COMMIT");
    res
      .status(201)
      .json({ status: "success", message: "product inserted in to cart." });
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

// CHANGE STATUS OF CART ITEMS
router.patch("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;
  const id = req.body.id;
  const status = req.body.status;

  if (status !== "pending" && status !== "done") {
    return res
      .status(400)
      .json({ status: "failed", message: "invalid status" });
  }

  if (!id) {
    return res
      .status(400)
      .json({ status: "failed", message: "invalid item id" });
  }

  try {
    const query = await pool.query(
      `UPDATE cart_items ci
SET status = $1
FROM carts c
WHERE ci.id = $2
  AND ci.cart_id = c.id
  AND c.created_by = $3;`,
      [status, id, userId]
    );
    if (query.rowCount === 0) {
      return res
        .status(400)
        .json({ status: "failed", message: "not allowed to update this item" });
    }
    return res
      .status(200)
      .json({ status: "success", message: "cart item updated successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE ITEMS FROM CART
router.delete("/", authenticate, async (req, res, next) => {
  const userId = req.user.userId;
  try {
    await pool.query(
      "DELETE FROM cart_items ci USING carts c WHERE ci.cart_id = c.id AND c.created_by = $1",
      [userId]
    );
    return res
      .status(200)
      .json({ status: "success", message: "cart items deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
