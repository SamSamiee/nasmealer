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
import Plans from "../../pages/Plans";
import { useNavigate } from "react-router-dom";

function UserPage() {
   const { userId, username, name } = useParams();
   const [state, setState] = React.useState("idle");
   const [meals, setMeals] = React.useState([]);
   const [plans, setPlans] = React.useState([]);
   const [status, setStatus] = React.useState("");
   const [showMeals, setShowMeals] = React.useState(false);
   const [showPlans, setShowPlans] = React.useState(false);
   const [friendCount, setFriendCount] = React.useState(0);

   async function unfollow() {
      const lastStatus = status;
      setStatus("");
      setState("loading");
      try {
         const result = await fetch(
            `${SERVER_URL}/friend`,
            {
               method: "DELETE",
               credentials: "include",
               headers: getAuthHeaders(),
               body: JSON.stringify({
                  target_user_id: userId,
               }),
            }
         );

         if (!result.ok) {
            throw new Error("operation canceled.");
         }

         // Update status to empty string after successful unfollow
         setStatus("");
      } catch (err) {
         setStatus(lastStatus);
         console.error(err);
      } finally {
         setState("idle");
      }
   }

   async function cancelRequest() {
      const lastStatus = status;

      try {
         setStatus("");
         setState("loading");

         const result = await fetch(
            `${SERVER_URL}/friend`,
            {
               method: "PATCH",
               credentials: "include",
               headers: getAuthHeaders(),
               body: JSON.stringify({
                  target_user_id: userId,
               }),
            }
         );

         if (!result.ok) {
            throw new Error("could not cancel request");
         }
      } catch (err) {
         console.error(err);
         setStatus(lastStatus);
      } finally {
         setState("idle");
      }
   }

   async function sendRequest() {
      const lastStatus = status;
      setState("loading");

      try {
         const result = await fetch(
            `${SERVER_URL}/friend`,
            {
               method: "POST",
               credentials: "include",
               headers: getAuthHeaders(),
               body: JSON.stringify({
                  target_user_id: userId,
               }),
            }
         );

         if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            throw new Error(
               errorData.error || "something went wrong, could not send friend request"
            );
         }

         setStatus("pending");
      } catch (err) {
         setStatus(lastStatus);
         console.error("Error sending friend request:", err);
      } finally {
         setState("idle");
      }
   }

   function handleClick() {
      if (status === "accepted") {
         // remove friend
         unfollow();
      } else if (status === "pending") {
         // remove request
         cancelRequest();
      } else {
         // send request
         sendRequest();
      }
   }

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

            setStatus(status !== undefined && status !== null ? status : "");
            friend_meals && setMeals(friend_meals);
            friend_plans && setPlans(friend_plans);

            setState("idle");
         } catch (err) {
            console.error(err);
            setState("error");
         }
      }

      getUser();
      // Note: Friend count for other users is not available via API
      // Setting to 0 for now - can be enhanced if API is updated
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

   if (showPlans) {
      return (
         <Plans
            allPlans={plans}
            friend={true}
            backButton={setShowPlans}
            friendMeals={meals}
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
                     footer={friendCount}
                  />
                  <Card
                     header="plans"
                     footer={plans.length || 0}
                     onClick={() => setShowPlans(true)}
                  />
                  <Card
                     header="meals"
                     footer={meals.length || 0}
                     onClick={() => setShowMeals(true)}
                  />
               </div>
               <button
                  onClick={handleClick}
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
      </div>
   );
}

export default UserPage;
