import React from "react";
import { SERVER_URL } from "../../config/api.js";
import Card from "../../components/Card";
import {Navigate} from "react-router-dom"
import styles from "./Home.module.css";

function Home() {
  const [data, setData] = React.useState(null);
  const [newMealPage, setNewMealPage] = React.useState(false)
  const [newPlanPage, setNewPlanPage] = React.useState(false)
  React.useEffect(() => {
    async function getData() {
      try {
        const response = await fetch(`${SERVER_URL}/user`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("request failed");
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    }
    getData();
  }, []);

  if(newMealPage){
    return <Navigate to="/newmeal" />
  }

  if(newPlanPage){
    return <Navigate to="/newplan" />
  }

  return (
    <div className={styles.container}>
      <div className={styles.cardsContainer}>
        <Card
          header={data?.number_of_pending_cart_items || 0}
          footer="items"
          path="cart"
        />
        <Card
          header={data?.number_of_meals || 0}
          footer="meals"
          path="meals"
        />
        <Card
          header={data?.number_of_plans || 0}
          footer="plans"
          path="plans"
        />
      </div>
      <div className={styles.actionsContainer}>
        <button onClick={()=>setNewMealPage(true)}>new meal</button>
        <button onClick={()=>setNewPlanPage(true)}>new plan</button>
      </div>
    </div>
  );
}
  
export default Home;
