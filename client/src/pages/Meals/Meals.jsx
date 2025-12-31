import React from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../../components/MealCard";
import { SERVER_URL } from "../../config/api.js";
import PIP from "../../components/PIP";
import styles from "./Meals.module.css";

function Meals() {
  const [mealsList, setMealsList] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  // get all meals
  async function getAllMeals() {
    setIsLoading(true);
    try {
      const result = await fetch(`${SERVER_URL}/meals`, {
        method: "GET",
        credentials: "include",
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
    getAllMeals();
  }, []);

  // DELETE MEAL WITH OPTIMISTIC RENDERING
  async function handleDeleteMeal(mealId) {
    // Backup current data for rollback
    const previousMealsList = [...mealsList];

    // Optimistic update: remove meal from list immediately
    setMealsList((prev) => prev.filter((meal) => meal.id !== mealId));

    // Make API call
    try {
      const result = await fetch(`${SERVER_URL}/meals/${mealId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!result.ok) {
        throw new Error("Failed to delete meal");
      }
    } catch (err) {
      console.error(err);
      // Rollback: restore the previous meals list
      setMealsList(previousMealsList);
      window.alert("Failed to delete meal. Please try again.");
    }
  }

  return isLoading ? (
    <PIP
      header="..."
      footer="loading..."
    />
  ) : (
    <div className={styles.container}>
      {mealsList.length > 0 ? (
        <div>
          <div className={styles.header}>
            <button className={styles.newMealButton} onClick={() => navigate("/newmeal")}>new meal</button>
          </div>
          <div className={styles.mealsList}>
            {mealsList.map(({ name, id, ingredients }) => (
              <MealCard
                key={id}
                name={name}
                list={ingredients}
                fnRemove={() => handleDeleteMeal(id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <PIP
          header=":("
          footer="you don't have any meals"
        >
          <button onClick={() => navigate("/newmeal")}>make a new meal</button>
        </PIP>
      )}
    </div>
  );
}

export default Meals;
