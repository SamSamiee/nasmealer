import React from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../../components/MealCard";
import { SERVER_URL } from "../../config/api.js";

function Meals() {
  const [mealsList, setMealsList] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  // get all meals on mount
  React.useEffect(() => {
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
        console.log(json);
        setMealsList(json.meals);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getAllMeals();
  }, []);

  return isLoading ? (
    <p>loading</p>
  ) : (
    <div>
      {mealsList?.map(({ name, id, ingredients }) => (
        <MealCard
          key={id}
          name={name}
          list={ingredients}
        />
      ))}
    </div>
  );
}

export default Meals;
