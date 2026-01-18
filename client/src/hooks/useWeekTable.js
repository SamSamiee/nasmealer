import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SERVER_URL, getAuthHeaders } from "../config/api.js";

// Function to create a fresh copy of the plan template
function getEmptyPlan() {
  return [
    {
      day: "monday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "tuesday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "wednesday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "thursday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "friday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "saturday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
    {
      day: "sunday",
      meals: [
        { type: "breakfast", meal_name: "", meal_id: "" },
        { type: "lunch", meal_name: "", meal_id: "" },
        { type: "dinner", meal_name: "", meal_id: "" },
      ],
    },
  ];
}

export function useWeekTable(mainPlan, tableName, initialPlan) {
  const location = useLocation();
  const [weekMeals, setWeekMeals] = React.useState(() => {
    // Initialize with mainPlan if provided, otherwise use fresh empty plan
    return mainPlan ? JSON.parse(JSON.stringify(mainPlan)) : getEmptyPlan();
  });
  const [allMeals, setAllMeals] = React.useState([]);
  const [allPlans, setAllPlans] = React.useState([]);
  const [name, setName] = React.useState(tableName || "");
  const [initialPlanProcessed, setInitialPlanProcessed] = React.useState(false);

  // Reset state when navigating to new plan page (no mainPlan and no tableName and no initialPlan)
  React.useEffect(() => {
    if (!mainPlan && !tableName && !initialPlan && location.pathname === "/newplan") {
      // New plan - reset to empty state with fresh copy
      setWeekMeals(getEmptyPlan());
      setName("");
      setInitialPlanProcessed(false);
    }
  }, [location.pathname, mainPlan, tableName, initialPlan]);

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
          headers: getAuthHeaders(),
        });

        if (!result.ok) {
          throw new Error("fetching failed");
        }

        const json = await result.json();
        setAllMeals(json.meals);
        
        // Process initial plan if provided and meals are loaded
        if (initialPlan && !initialPlanProcessed && json.meals.length > 0) {
          // Transform week_table to use user's meal IDs by matching names
          const transformedWeekTable = initialPlan.week_table.map(({ day, meals }) => ({
            day,
            meals: meals.map(({ type, meal_name, meal_id }) => {
              // Find user's meal by name
              const userMeal = json.meals.find((m) => m.name === meal_name);
              return {
                type,
                meal_name: meal_name || "",
                meal_id: userMeal?.id || "",
              };
            }),
          }));
          
          setWeekMeals(transformedWeekTable);
          
          // Check for name conflicts and set plan name
          const allPlansResult = await fetch(`${SERVER_URL}/plans`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
          });
          
          if (allPlansResult.ok) {
            const plansJson = await allPlansResult.json();
            const existingPlanNames = (plansJson.data || []).map((p) => p.plan_name.toLowerCase());
            let finalPlanName = initialPlan.planName || "";
            
            if (finalPlanName) {
              let testName = finalPlanName;
              let counter = 1;
              
              // Keep adding (n) prefix until we find a unique name
              while (existingPlanNames.includes(testName.toLowerCase())) {
                testName = `(${counter})${finalPlanName}`;
                counter++;
              }
              finalPlanName = testName;
            }
            
            setName(finalPlanName);
          }
          
          setInitialPlanProcessed(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    getAllMeals();
  }, [initialPlan, initialPlanProcessed]);

  // fetch all the plans
  React.useEffect(() => {
    async function getAllPlans() {
      try {
        const result = await fetch(`${SERVER_URL}/plans`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
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

  function handleReset() {
    // Reset to a fresh empty plan template
    setWeekMeals(getEmptyPlan());
    setName(""); // Also reset the plan name
  }

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
        headers: getAuthHeaders(),
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
      // Reset form after successful save
      handleReset();
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
        headers: getAuthHeaders(),
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

  return {
    updateMeal,
    handleSave,
    handleReset,
    handleMealToCart,
    weekMeals,
    setWeekMeals,
    allMeals,
    name,
    setName,
  };
}
