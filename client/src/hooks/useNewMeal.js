import React from "react";
import { useParams } from "react-router-dom";
import { SERVER_URL, getAuthHeaders } from "../config/api.js";
import {useNavigate} from "react-router-dom";

export function useNewMeal(initial) {
  const units = ["gr", "kg", "pieces", "ml", "liters", "any"];

  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);

  const { mealId } = useParams();

  // get the meal by id (if id exists)
  async function getMealById() {
    try {
      setIsLoading(true);
      const result = await fetch(`${SERVER_URL}/meals/${mealId}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const json = await result.json();
      if (result.ok) {
        setData(json);
      }

    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  // get the meal on mount if the mealId is present
  React.useEffect(() => {
    if (mealId) {
      getMealById();
    }
  }, [mealId]);

  // Transform initial meal data if it comes from friend's meal
  // Friend meal format: { mealName, list: [{ name, unit, quantity }] }
  // Need to add id to list items and check for name conflicts
  const [transformedInitial, setTransformedInitial] = React.useState(null);
  const [checkingName, setCheckingName] = React.useState(false);

  // Check for name conflicts and transform initial meal data
  React.useEffect(() => {
    async function transformAndCheckName() {
      if (!initial || mealId) {
        // If mealId exists, data will be fetched separately
        return;
      }

      setCheckingName(true);
      try {
        // Fetch all user meals to check for name conflicts
        const result = await fetch(`${SERVER_URL}/meals`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        });

        if (result.ok) {
          const json = await result.json();
          const existingMeals = json.meals || [];
          
          // Transform ingredients to include id field
          const transformedList = (initial.list || []).map((ing) => ({
            name: ing.name,
            unit: ing.unit,
            quantity: ing.quantity,
            id: ing.id || crypto.randomUUID(),
          }));

          // Check for name conflicts and add (n) prefix if needed
          let finalMealName = initial.mealName || "";
          if (finalMealName) {
            const existingNames = existingMeals.map((m) => m.name.toLowerCase());
            let testName = finalMealName;
            let counter = 1;
            
            // Keep adding (n) prefix until we find a unique name
            while (existingNames.includes(testName.toLowerCase())) {
              testName = `(${counter})${finalMealName}`;
              counter++;
            }
            finalMealName = testName;
          }

          setTransformedInitial({
            mealName: finalMealName,
            list: transformedList,
          });
        }
      } catch (err) {
        console.error("Error checking meal name:", err);
        // On error, still use initial data but transform list
        const transformedList = (initial.list || []).map((ing) => ({
          name: ing.name,
          unit: ing.unit,
          quantity: ing.quantity,
          id: ing.id || crypto.randomUUID(),
        }));
        setTransformedInitial({
          mealName: initial.mealName || "",
          list: transformedList,
        });
      } finally {
        setCheckingName(false);
      }
    }

    transformAndCheckName();
  }, [initial, mealId]);

  // if meal id is present the initial meal would be the result of fetch
  // Otherwise, use transformed initial or initial as-is
  const initialMeal = mealId 
    ? data 
    : (transformedInitial || initial);

  // form states
  const [mealName, setMealName] = React.useState(initialMeal?.mealName || "");
  const [name, setName] = React.useState(initialMeal?.name || "");
  const [unit, setUnit] = React.useState(initialMeal?.unit || "gr");
  const [quantity, setQuantity] = React.useState(initialMeal?.quantity || "");
  const [list, setList] = React.useState(initialMeal?.list || []);

  // update the form fields when ever the initial meal arrives (in case of fetching)
  React.useEffect(() => {
    if (!initialMeal) {
      return;
    }
    setMealName(initialMeal.mealName ?? "");
    setName(initialMeal.name ?? "");
    setUnit(initialMeal.unit ?? "gr");
    setQuantity(initialMeal.quantity ?? 0);
    setList(initialMeal.list ?? []);
  }, [initialMeal]);

  // reset all the form fields
  function handleReset() {
    setName("");
    setQuantity("");
  }

  // handle submit
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_URL}/meals`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: mealName,
          ingredients: list,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save the meal");
      }

      const data = await res.json();
      handleReset()
      setMealName("")
      navigate("/meals")
    } catch (err) {
      console.error(err);
    }
  }

  return {
    isLoading: isLoading || checkingName,
    units,
    handleSubmit,
    mealName,
    setMealName,
    name,
    setName,
    unit,
    setUnit,
    quantity,
    setQuantity,
    list,
    setList,
    handleReset,
  };
}
