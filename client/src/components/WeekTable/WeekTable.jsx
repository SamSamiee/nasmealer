import React from "react";
import Meal from "../Meal";
import Day from "../Day";
const plan = [
  {
    day: "monday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "tuesday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "wednesday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "thursday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "friday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "saturday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
  {
    day: "sunday",
    meals: [
      { type: "breakfast", meal_name: "", meal_id: "" },
      { type: "lunch", meal_name: "", meal_id: "" },
      { type: "dinner", meal_name: "", meal_type: "" },
    ],
  },
];

function WeekTable({ tableName, mainPlan, edit = true }) {
  const [weekMeals, setWeekMeals] = React.useState(mainPlan || plan);

  // handle update
  function updateMeal(plan, day, type, meal, id) {
    const newPlan = [...weekMeals];
    const target = newPlan
      .find((i) => i.day === day)
      .meals.find((i) => i.type === type);
    target.meal_name = meal;
    target.meal_id = id;
    setWeekMeals(newPlan);
  }

  return (
    <>
      <h2>{tableName}</h2>
      {weekMeals.map(({ day, meals }) => {
        const breakfast = meals.filter((i) => i.type === "breakfast")[0]?.meal_name || "";
        const lunch = meals.filter((i) => i.type === "lunch")[0]?.meal_name || "";
        const dinner = meals.filter((i) => i.type === "dinner")[0]?.meal_name || "";

        return (
          <Day
            day={day}
            breakfast={breakfast}
            lunch={lunch}
            dinner={dinner}
            edit={edit}
            onChange={(status, val) => {
              updateMeal(weekMeals, day, status, val);
            }}
          />
        );
      })}
      {edit ? (
        <div>
          <button>save</button>
          <button
            onClick={() =>
              setWeekMeals((prev) => {
                return prev.map((dayObj) => ({
                  ...dayObj,
                  meals: dayObj.meals.map((meal) => ({
                    ...meal,
                    meal_name: "",
                    meal_id: null,
                  })),
                }));
              })
            }
          >
            reset
          </button>
        </div>
      ) : (
        <div>
          <button type="button">edit</button>
          <button type="button">add to cart</button>
        </div>
      )}
    </>
  );
}

export default WeekTable;
