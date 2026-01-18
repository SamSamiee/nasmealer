import React from "react";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";
import WeekTable from "../../components/WeekTable";
import PIP from "../../components/PIP";
import { useNavigate } from "react-router-dom";
import styles from "./Plans.module.css";

function Plans({ friend = false, allPlans, backButton, friendMeals = [] }) {
   const [loading, setLoading] = React.useState(false);
   const [data, setData] = React.useState([]);
   const navigate = useNavigate();

   // GET ALL PLANS
   async function getAllPlans() {
      setLoading(true);
      try {
         const result = await fetch(`${SERVER_URL}/plans`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
         });

         if (!result.ok) {
            throw new Error("failed fetching data");
         }

         const json = await result.json();
         const raw = json.data;
         setData(raw);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }

   React.useEffect(() => {
      if (allPlans === undefined) {
         getAllPlans();
      } else {
         setData(allPlans);
      }
   }, [allPlans]);

   // HANDLE ADDING FRIEND PLAN
   async function handleAddPlan(plan) {
      try {
         // First, get all unique meals from the plan
         const planMeals = new Map();
         plan.week_table.forEach(({ day, meals }) => {
            meals.forEach(({ meal_name, meal_id }) => {
               if (meal_name && !planMeals.has(meal_name)) {
                  planMeals.set(meal_name, { meal_name, meal_id });
               }
            });
         });

         // Get user's existing meals to check for duplicates
         const userMealsResult = await fetch(`${SERVER_URL}/meals`, {
            method: "GET",
            credentials: "include",
            headers: getAuthHeaders(),
         });
         const userMealsJson = await userMealsResult.json();
         const existingMealNames = new Set(
            (userMealsJson.meals || []).map((m) => m.name.toLowerCase())
         );

         // Add each meal that doesn't exist yet
         const mealsToAdd = [];
         for (const [mealName, { meal_id: friendMealId }] of planMeals.entries()) {
            if (!existingMealNames.has(mealName.toLowerCase())) {
               // Find the full meal data from friendMeals
               const friendMeal = friendMeals.find(
                  (m) => m.name === mealName || m.id === friendMealId
               );
               if (friendMeal) {
                  mealsToAdd.push(friendMeal);
               }
            }
         }

         // Add all meals that don't exist
         for (const meal of mealsToAdd) {
            try {
               await fetch(`${SERVER_URL}/meals`, {
                  method: "POST",
                  credentials: "include",
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                     name: meal.name,
                     ingredients: meal.ingredients || [],
                  }),
               });
            } catch (err) {
               console.error(`Error adding meal ${meal.name}:`, err);
            }
         }

         // Wait a bit for meals to be added, then navigate to NewPlan
         // Navigate with plan data
         navigate("/newplan", {
            state: {
               plan: {
                  planName: plan.plan_name,
                  week_table: plan.week_table,
               },
            },
         });
      } catch (err) {
         console.error("Error adding friend plan:", err);
         window.alert("Failed to add plan. Please try again.");
      }
   }

   // DELETE PLAN WITH OPTIMISTIC RENDERING
   async function handleDeletePlan(planId) {
      // Backup current data for rollback
      const previousData = [...data];

      // Optimistic update: remove plan from list immediately
      setData((prev) =>
         prev.filter((plan) => plan.plan_id !== planId)
      );

      // Make API call
      try {
         const result = await fetch(`${SERVER_URL}/plans`, {
            method: "DELETE",
            credentials: "include",
            headers: getAuthHeaders(),
            body: JSON.stringify({ planId }),
         });

         if (!result.ok) {
            throw new Error("Failed to delete plan");
         }
      } catch (err) {
         console.error(err);
         // Rollback: restore the previous data
         setData(previousData);
         window.alert(
            "Failed to delete plan. Please try again."
         );
      }
   }

   if (loading) {
      return (
         <PIP
            header="..."
            footer="loading..."
         />
      );
   }

   return (
      <div className={styles.container}>
         {friend && (
            <button
               className={styles.backButton}
               onClick={() => backButton(false)}>
               back
            </button>
         )}
         {data.length > 0 ? (
            <div>
               {!friend && (
                  <div className={styles.header}>
                     <button
                        className={styles.newPlanButton}
                        onClick={() => navigate("/newplan")}>
                        new plan
                     </button>
                  </div>
               )}
               <div className={styles.plansList}>
                  {data.map(
                     ({
                        plan_name,
                        plan_id,
                        week_table,
                     }) => {
                        return (
                           <WeekTable
                              tableName={plan_name}
                              key={plan_id}
                              planId={plan_id}
                              mainPlan={week_table}
                              edit={false}
                              onDelete={!friend ? handleDeletePlan : undefined}
                              friend={friend}
                              onAdd={friend ? () => handleAddPlan({ plan_name, week_table }) : undefined}
                           />
                        );
                     }
                  )}
               </div>
            </div>
         ) : !friend ? (
            <PIP
               header=":("
               footer="you don't have any plans">
               <button
                  onClick={() => {
                     navigate("/newplan");
                  }}>
                  make a new one
               </button>
            </PIP>
         ) : (
            <PIP
               header=":Q"
               footer="no meals for them">
               <button
                  onClick={() => {
                     backButton(false);
                  }}>
                  go back
               </button>
            </PIP>
         )}
      </div>
   );
}

export default Plans;
