import React from "react";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";
import WeekTable from "../../components/WeekTable";
import PIP from "../../components/PIP";
import { useNavigate } from "react-router-dom";
import styles from "./Plans.module.css";

function Plans({ friend = false, allPlans, backButton }) {
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
