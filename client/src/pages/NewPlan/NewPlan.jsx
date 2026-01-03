import React from "react";
import WeekTable from "../../components/WeekTable";
import PIP from "../../components/PIP";
import { SERVER_URL, getAuthHeaders } from "../../config/api.js";
import { useNavigate } from "react-router-dom";
import styles from "./NewPlan.module.css";

function NewPlan() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // GET ALL MEALS
  async function getAllMeals() {
    setLoading(true);
    try {
      const result = await fetch(`${SERVER_URL}/meals`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!result.ok) {
        throw new Error("failed fetching data");
      }

      const json = await result.json();
      const raw = json.meals;
      setData(raw);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getAllMeals();
  }, []);

  if (loading) {
    return (
      <PIP
        header="^...^"
        footer="loading..."
      />
    );
  }

  if (!data?.length > 0) {
    return (
      <PIP
        header=":P"
        footer="no meals yet"
      >
        <p>
          to make your plan start by{" "}
          <span>
            <button onClick={() => navigate("/newmeal")}>making a meal</button>
          </span>{" "}
          first
        </p>
      </PIP>
    );
  }

  return (
    <div className={styles.container}>
      <WeekTable />
    </div>
  );
}

export default NewPlan;
