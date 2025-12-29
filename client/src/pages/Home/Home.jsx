import React from "react";
import { SERVER_URL } from "../../config/api.js";
import Card from "../../components/Card";
import {Navigate} from "react-router-dom"

function Home() {
  const [data, setData] = React.useState(null);
  const [newMealPage, setNewMealPage] = React.useState(false)

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

  return (
    <div>
      <div>
        <Card
          header={data?.number_of_ingredients}
          footer="ingredients"
        />
        <Card
          header={data?.number_of_meals}
          footer="meals"
        />
        <Card
          header={data?.number_of_plans}
          footer="plans"
        />
      </div>
      <div>
        <button onClick={()=>setNewMealPage(true)}>add a new meal</button>
      </div>
    </div>
  );
}

export default Home;
