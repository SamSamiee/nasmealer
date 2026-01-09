import React from "react";
import {
   getAuthHeaders,
   SERVER_URL,
} from "../../config/api.js";
import { useParams } from "react-router-dom";
import styles from "./UserPage.module.css";
import PIP from "../../components/PIP";
import Picture from "../../components/Picture";
import Card from "../../components/Card";
import Meals from "../../pages/Meals";
import { useNavigate } from "react-router-dom";

function UserPage() {
   const { userId, username, name } = useParams();
   const [state, setState] = React.useState("idle");
   const [meals, setMeals] = React.useState([]);
   const [plans, setPlans] = React.useState([]);
   const [status, setStatus] = React.useState("");
   const [showMeals, setShowMeals] = React.useState(false);

   React.useEffect(() => {
      async function getUser() {
         try {
            const result = await fetch(
               `${SERVER_URL}/friend/${userId}`,
               {
                  credentials: "include",
                  headers: getAuthHeaders(),
               }
            );
            const json = await result.json();

            const { friend_meals, friend_plans, status } =
               json;

            status && setStatus(status);
            friend_meals && setMeals(friend_meals);
            friend_plans && setPlans(friend_plans);

            setState("idle");
         } catch (err) {
            console.error(err);
            setState("error");
         }
      }

      getUser();
   }, [userId]);

   if (state === "error") {
      return (
         <PIP
            header=":("
            footer="Something went wrong..."
         />
      );
   }

   if (showMeals) {
      return (
         <Meals
            allMeals={meals}
            friend={true}
            backButton={setShowMeals}
         />
      );
   }

   return (
      <div className={styles.wrapper}>
         <div className={styles.header}>
            <div className={styles.details}>
               <div className={styles.picture}>
                  <Picture />
               </div>
               <div className={styles.names}>
                  <h1 className={styles.username}>
                     {username}
                  </h1>
                  <h2 className={styles.name}>{name}</h2>
               </div>
            </div>
            <div className={styles.center}>
               <div className={styles.numbers}>
                  <Card
                     header="friends"
                     footer="2"
                  />
                  <Card
                     header="plans"
                     footer="2"
                  />
                  <Card
                     header="meals"
                     footer="2"
                     onClick={() => setShowMeals(true)}
                  />
               </div>
               <button
                  disabled={
                     status === "pending" ||
                     state === "loading"
                  }>
                  {status === "accepted"
                     ? "following"
                     : status === "pending"
                     ? "pending"
                     : "follow"}
               </button>
            </div>
         </div>

         {plans.length > 0 && (
            <div className={styles.plans}>
               plans go here
            </div>
         )}
         {meals.length > 0 && (
            <div className={styles.meals}>
               meals go here
            </div>
         )}
      </div>
   );
}

export default UserPage;
