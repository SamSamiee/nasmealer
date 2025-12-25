import React from "react";
import Meal from "../Meal";
import Day from "../Day";
const plan = [
  { day: "MON", id: 0, breakfast: "", lunch: "", dinner: "" },
  { day: "TUE", id: 1, breakfast: "", lunch: "", dinner: "" },
  { day: "WED", id: 2, breakfast: "", lunch: "", dinner: "" },
  { day: "THU", id: 3, breakfast: "", lunch: "", dinner: "" },
  { day: "FRI", id: 4, breakfast: "", lunch: "", dinner: "" },
  { day: "SAT", id: 5, breakfast: "", lunch: "", dinner: "" },
  { day: "SUN", id: 6, breakfast: "", lunch: "", dinner: "" },
];

function WeekTable({ tableNumber, mainPlan, edit = true }) {
  const [weekMeals, setWeekMeals] = React.useState(mainPlan || plan);
  function updateMeal(plan, day, status, meal) {
    const newPlan = plan.map((i) => {
      if (i.day !== day) {
        return i;
      }
      return { ...i, [status]: meal };
    });
    setWeekMeals(newPlan);
  }

  return (
    <>
      <h2>{tableNumber}</h2>
      {weekMeals.map(({ day, id, breakfast, lunch, dinner }) => (
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
      ))}
      {edit ? (
      <div>
        <button>save</button>
        <button
          onClick={() =>
            setWeekMeals((prev) => {
              return prev.map((i) => {
                return { ...i, breakfast: "", lunch: "", dinner: "" };
              });
            })
          }
        >
          reset
        </button>
      </div>
      )
    :
    (<div>
      <button type="button">edit</button>
      <button type="button">add to cart</button>
    </div>)}
    </>
  );
}

export default WeekTable;
