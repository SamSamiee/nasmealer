const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const { authenticate } = require("../middlewares/auth.middleware.js");
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

// MAKE A PLAN
router.post("/", authenticate, async (req, res) => {
  const planName = req.body.plan_name;
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

    for (const row of result.rows) {
      const { plan_id, name: plan_name, day, type, meal_id, meal_name } = row;

      // find or create plan
      let plan = data.find((p) => p.plan_id === plan_id);
      if (!plan) {
        plan = {
          plan_id,
          plan_name,
          week_table: days.map((d) => ({
            day: d,
            meals: mealTypes.map((t) => ({
              type: t,
              meal_id: null,
              meal_name: null,
            })),
          })),
        };
        data.push(plan);
      }

      // find day
      const dayObj = plan.week_table.find((d) => d.day === day);
      if (!dayObj) continue;

      // find meal slot
      const mealSlot = dayObj.meals.find((m) => m.type === type);
      if (!mealSlot) continue;

      // fill it
      mealSlot.meal_id = meal_id;
      mealSlot.meal_name = meal_name;
    }

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
router.delete("/", authenticate, async (req, res) => {
  const planId = req.body.planId;
  if (!planId) {
    return res
      .status(400)
      .json({ status: "failed", message: "invalid planId" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM plans WHERE id = $1 RETURNING id",
      [planId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "failed", message: "plan not found" });
    }

    return res
      .status(200)
      .json({ status: "success", planId: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ status: "failed", error: err.message });
  }
});

module.exports = router;
