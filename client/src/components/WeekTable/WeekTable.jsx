import React from "react";
import Meal from "../Meal";
import Day from "../Day";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../config/api.js";
const plan = [
  {
    day: "monday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "tuesday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "wednesday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "thursday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "friday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "saturday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "sunday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
];

function WeekTable({ tableName, mainPlan, edit = true }) {
  const [weekMeals, setWeekMeals] = React.useState(mainPlan || plan);
  const [allMeals, setAllMeals] = React.useState([]);
  const [allPlans, setAllPlans] = React.useState([]);
  const [name, setName] = React.useState(tableName || "");

  const navigate = useNavigate();

  // handle update
  function updateMeal(plan, day, type, meal, id) {
    const newPlan = [...weekMeals];
    const target = newPlan
      .find((i) => i.day === day)
      .meals.find((i) => i.type === type);
    target.meal_name = meal;
    target.meal_id = id;
    setWeekMeals(newPlan);
  }

  // fetch all the meals
  React.useEffect(() => {
    async function getAllMeals() {
      try {
        const result = await fetch(`${SERVER_URL}/meals`, {
          method: "GET",
          credentials: "include",
        });

        if (!result.ok) {
          throw new Error("fetching failed");
        }

        const json = await result.json();
        setAllMeals(json.meals);
      } catch (err) {
        console.error(err);
      }
    }
    getAllMeals();
  }, []);

  // fetch all the plans
  React.useEffect(() => {
    async function getAllPlans() {
      try {
        const result = await fetch(`${SERVER_URL}/plans`, {
          method: "GET",
          credentials: "include",
        });

        if (!result.ok) {
          throw new Error("fetching failed");
        }

        const json = await result.json();
        setAllPlans(json.data);
      } catch (err) {
        console.error(err);
      }
    }
    getAllPlans();
  }, []);

  //upload new plan
  async function handleSave() {
    // Validate name
    if (!name || name.trim() === "") {
      window.alert("Please enter a plan name!");
      return;
    }

    const existingPlan = allPlans.find((plan) => plan.plan_name === name);
    if (existingPlan) {
      window.alert("You have another plan with the same name!");
      setName("");
      return;
    }

    // structure the meals
    const MEALS = [];
    weekMeals.forEach(({ day, meals }) => {
      meals.forEach(({ type, meal_name, meal_id }) => {
        // Only include meals with valid UUIDs (non-empty string)
        if (
          meal_id &&
          meal_id !== "" &&
          meal_id !== null &&
          meal_id !== undefined
        ) {
          MEALS.push({ id: meal_id, type, day });
        }
      });
    });

    // Validate that at least one meal is selected
    if (MEALS.length === 0) {
      window.alert("Please select at least one meal for your plan!");
      return;
    }

    const requestBody = {
      plan_name: name.trim(),
      meals: MEALS,
    };

    try {
      const result = await fetch(`${SERVER_URL}/plans`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!result.ok) {
        const errorData = await result
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "failed making plan");
      }

      const json = await result.json();
      console.log(json);
      navigate("/plans");
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to save plan. Please try again.");
    }
  }

  async function handleMealToCart() {
    try {
      // list of ids to be sent
      const idList = [];

      // add ids in the plan to the list
      weekMeals.forEach(({ date, meals }) => {
        meals.forEach(({ meal_id }) => {
          if (meal_id) {
            idList.push(meal_id);
          }
        });
      });

      // send the list
      const result = await fetch(`${SERVER_URL}/cart/meals`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: idList,
        }),
      });

      if (!result.ok) {
        throw new Error("failed adding plan to the cart");
      }

      navigate("/cart");

      const json = await result.json();
      console.log(json?.message);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <h2>
        {tableName || (
          <input
            type="text"
            required
            placeholder="give your plan a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
      </h2>
      {weekMeals.map(({ day, meals }) => {
        const breakfast =
          meals.filter((i) => i.type === "breakfast")[0]?.meal_name || "";
        const lunch =
          meals.filter((i) => i.type === "lunch")[0]?.meal_name || "";
        const dinner =
          meals.filter((i) => i.type === "dinner")[0]?.meal_name || "";

        return (
          <Day
            availableMeals={allMeals}
            day={day}
            key={day}
            breakfast={breakfast}
            lunch={lunch}
            dinner={dinner}
            edit={edit}
            onChange={(status, val) => {
              const selectedMeal = allMeals.find((m) => m.name === val);
              updateMeal(weekMeals, day, status, val, selectedMeal?.id);
            }}
          />
        );
      })}
      {edit ? (
        <div>
          <button onClick={() => handleSave()}>save</button>
          <button
            onClick={() =>
              setWeekMeals((prev) => {
                return prev.map((dayObj) => ({
                  ...dayObj,
                  meals: dayObj.meals.map((meal) => ({
                    ...meal,
                    meal_name: "",
                    meal_id: null,
                  })),
                }));
              })
            }
          >
            reset
          </button>
        </div>
      ) : (
        <div>
          <button type="button">edit</button>
          <button
            type="button"
            onClick={handleMealToCart}
          >
            add to cart
          </button>
        </div>
      )}
    </>
  );
}

export default WeekTable;
