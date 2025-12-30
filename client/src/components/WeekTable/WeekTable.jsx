import React from "react";
import Meal from "../Meal";
import Day from "../Day";
import { useWeekTable } from "../../hooks/useWeekTable";

function WeekTable({ tableName, mainPlan, edit = true, planId, onDelete }) {
  const {
    updateMeal,
    handleSave,
    handleReset,
    handleMealToCart,
    weekMeals,
    setWeekMeals,
    allMeals,
    name,
    setName,
  } = useWeekTable(mainPlan, tableName);

  return (
    <>
      <h2>
        {tableName || (
          <input
            type="text"
            required
            placeholder="give your plan a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
      </h2>
      {weekMeals.map(({ day, meals }) => {
        const breakfast =
          meals.filter((i) => i.type === "breakfast")[0]?.meal_name || "";
        const lunch =
          meals.filter((i) => i.type === "lunch")[0]?.meal_name || "";
        const dinner =
          meals.filter((i) => i.type === "dinner")[0]?.meal_name || "";

        return (
          <Day
            availableMeals={allMeals}
            day={day}
            key={day}
            breakfast={breakfast}
            lunch={lunch}
            dinner={dinner}
            edit={edit}
            onChange={(status, val) => {
              const selectedMeal = allMeals.find((m) => m.name === val);
              updateMeal(weekMeals, day, status, val, selectedMeal?.id);
            }}
          />
        );
      })}
      {edit ? (
        <div>
          <button onClick={handleSave}>save</button>
          <button onClick={handleReset}>reset</button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleMealToCart}
          >
            add to cart
          </button>
          {onDelete && planId && (
            <button
              type="button"
              onClick={() => onDelete(planId)}
            >
              delete
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default WeekTable;
