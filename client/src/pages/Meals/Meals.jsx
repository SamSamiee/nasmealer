import React from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../../components/MealCard";

function Meals({ mealsList }) {
  const navigate = useNavigate();

  function editMeal(id) {
    navigate(`/meals/${id}/edit`);
  }

  return (
    <div>
      {mealsList?.map(({ title, price, list, id }) => (
        <MealCard
          key={id}
          title={title}
          price={price}
          list={list}
          fnEdit={() => editMeal(id)}
        />
      ))}
    </div>
  );
}

export default Meals;
