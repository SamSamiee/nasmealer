import {
   SERVER_URL,
   getAuthHeaders,
} from "../config/api.js";
import React from "react";
import { useNavigate } from "react-router-dom";

export function useMeals(allMeals) {
   const [mealsList, setMealsList] = React.useState(allMeals || []);
   const [isLoading, setIsLoading] = React.useState(false);
   const navigate = useNavigate();

   // get all meals
   async function getAllMeals() {
      setIsLoading(true);
      try {
         const result = await fetch(`${SERVER_URL}/meals`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
         });
         const json = await result.json();
         if (!result.ok) {
            throw new Error("fetching failed");
         }
         console.log(json.meals);
         setMealsList(json.meals);
      } catch (err) {
         console.error(err);
      } finally {
         setIsLoading(false);
      }
   }

   React.useEffect(() => {
      if(allMeals === undefined){
         getAllMeals()
      }
   }, []);

   React.useEffect(() => {
      if (Array.isArray(allMeals) && allMeals.length > 0) {
         setMealsList(allMeals);
      }
   }, [allMeals]);

   // DELETE MEAL WITH OPTIMISTIC RENDERING
   async function handleDeleteMeal(mealId) {
      // Backup current data for rollback
      const previousMealsList = [...mealsList];

      // Optimistic update: remove meal from list immediately
      setMealsList((prev) =>
         prev.filter((meal) => meal.id !== mealId)
      );

      // Make API call
      try {
         const result = await fetch(
            `${SERVER_URL}/meals/${mealId}`,
            {
               method: "DELETE",
               credentials: "include",
               headers: getAuthHeaders(),
            }
         );

         if (!result.ok) {
            throw new Error("Failed to delete meal");
         }
      } catch (err) {
         console.error(err);
         // Rollback: restore the previous meals list
         setMealsList(previousMealsList);
         window.alert(
            "Failed to delete meal. Please try again."
         );
      }
   }
   return {
      isLoading,
      mealsList,
      navigate,
      handleDeleteMeal,
   };
}
