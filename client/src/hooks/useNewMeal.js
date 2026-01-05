import React from "react";
import { useParams } from "react-router-dom";
import { SERVER_URL, getAuthHeaders } from "../config/api.js";
import {useNavigate} from "react-router-dom";

export function useNewMeal(initial) {
  const units = ["gr", "kg", "pieces", "ml", "liters"];

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
      if (result.ok) {
        setData(json);
      }
      const json = await result.json();

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

  // if meal id is present the initial meal would be the result of fetch
  const initialMeal = mealId ? data : initial;

  // form states
  const [mealName, setMealName] = React.useState(initialMeal?.mealName || "");
  const [name, setName] = React.useState(initialMeal?.name || "");
  const [unit, setUnit] = React.useState(initialMeal?.unit || "gr");
  const [quantity, setQuantity] = React.useState(initialMeal?.quantity || 1);
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
    setQuantity(1);
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
    isLoading,
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
