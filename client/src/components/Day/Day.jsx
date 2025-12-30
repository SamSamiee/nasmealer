import React from "react";
import Meal from "../Meal";
function Day({
  availableMeals,
  day,
  breakfast,
  lunch,
  dinner,
  onChange,
  edit,
}) {
  let DAY;
  switch (day) {
    case "monday":
      DAY = "MON";
      break;
    case "tuesday":
      DAY = "TUE";
      break;
    case "wednesday":
      DAY = "WED";
      break;
    case "thursday":
      DAY = "THU";
      break;
    case "friday":
      DAY = "FRI";
      break;
    case "saturday":
      DAY = "SAT";
      break;
    case "sunday":
      DAY = "SUN";
      break;
    default:
      DAY = "DAY";
  }

  return (
    <div>
      <h2>{DAY}</h2>
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
