import React from "react";
import Meal from "../Meal";
function Day({
  availableMeals,
  day = "Day",
  breakfast,
  lunch,
  dinner,
  onChange,
  edit,
}) {
  return (
    <div>
      <h2>{day}</h2>
      <Meal
        availableMeals={availableMeals}
        edit={edit}
        status="breakfast"
        val={breakfast}
        onChange={(val) => onChange((status = "breakfast"), val)}
      />
      <Meal
        availableMeals={availableMeals}
        edit={edit}
        status="lunch"
        val={lunch}
        onChange={(val) => onChange((status = "lunch"), val)}
      />
      <Meal
        availableMeals={availableMeals}
        edit={edit}
        status="dinner"
        val={dinner}
        onChange={(val) => onChange((status = "dinner"), val)}
      />
    </div>
  );
}

export default Day;
