const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");

// MAKE A PLAN
router.post("/", authenticate, async (req, res) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "dinner"];
  const planName = req.body.planName;
  const meals = req.body.meals;
  if (!planName || !Array.isArray(meals)) {
    return res
      .status(400)
      .json({ status: "failed", message: "name and meals are required" });
  }
  const client = await pool.connect(); // make transaction client
  try {
    await client.query("BEGIN"); // begin transaction
    const plan = await client.query(
      "INSERT INTO plans (name, created_by) VALUES ($1, $2) RETURNING id",
      [planName, req.user.userId]
    );
    const planId = plan.rows[0].id;
    // validate meals first
    for (const meal of meals) {
      if (!days.includes(meal.day) || !mealTypes.includes(meal.type)) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ status: "failed", message: "invalid meal structure." });
      }
    }
    // add the meals
    const queries = meals.map((meal) => {
      return client.query(
        "INSERT INTO meals_in_plan (meal_id, plan_id, type, day) VALUES ($1, $2, $3, $4)",
        [meal.id, planId, meal.type, meal.day]
      );
    });
    await Promise.all(queries);
    await client.query("COMMIT"); // commit changes
    res.status(201).json({
      status: "success",
      message: "plan successfully created.",
      plan_id: planId,
    });
  } catch (err) {
    await client.query("ROLLBACK"); // undo everything
    res.status(500).json({
      status: "failed",
      message: "server internal error",
      error: err.message,
    });
  } finally {
    client.release(); // release the client
  }
});

// GET ALL PLANS
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT plans.name AS name, mip.plan_id AS plan_id, mip.meal_id AS meal_id, mip.type AS type, mip.day AS day, meals.name AS meal_name FROM plans JOIN meals_in_plan mip ON plans.id = plan_id JOIN meals ON meals.id = meal_id WHERE plans.created_by = $1",
      [req.user.userId]
    );

    const data = [];
    result.rows.forEach(({ name, plan_id, meal_id, meal_name, type, day }) => {
      let plan = data.find((i) => i.plan_id === plan_id);
      if (!plan) {
        plan = { name, plan_id, meals: [] };
        data.push(plan);
      }
      plan.meals.push({ meal_id, meal_name, type, day });
    });

    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "server internal error",
      error: err.message,
    });
  }
});

// GET A PLAN
router.get("/:planId", authenticate, async (req, res) => {
  const { planId } = req.params;
  try {
    const result = await pool.query(
      "SELECT plans.name AS name, mip.plan_id AS plan_id, mip.meal_id AS meal_id, mip.type AS type, mip.day AS day, meals.name AS meal_name FROM plans JOIN meals_in_plan mip ON plans.id = plan_id JOIN meals ON meals.id = meal_id WHERE plans.created_by = $1 AND plan_id = $2",
      [req.user.userId, planId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "plan not found" });
    }

    const { name, plan_id } = result.rows[0];
    const meals = [];
    result.rows.forEach(({ meal_id, meal_name, day, type }) =>
      meals.push({ meal_id, meal_name, day, type })
    );
    const data = { name, plan_id, meals };
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "internal server error",
      error: err.message,
    });
  }
});

// EDIT A PLAN

// DELETE A PLAN

module.exports = router;
