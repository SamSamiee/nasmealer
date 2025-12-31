import React from "react";
import Meal from "../Meal";
import styles from "./Day.module.css";

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
    <div className={styles.container}>
      <h2 className={styles.dayTitle}>{DAY}</h2>
      <div className={styles.mealsContainer}>
        <Meal
          availableMeals={availableMeals}
          edit={edit}
          status="breakfast"
          val={breakfast}
          onChange={(val) => onChange("breakfast", val)}
        />
        <Meal
          availableMeals={availableMeals}
          edit={edit}
          status="lunch"
          val={lunch}
          onChange={(val) => onChange("lunch", val)}
        />
        <Meal
          availableMeals={availableMeals}
          edit={edit}
          status="dinner"
          val={dinner}
          onChange={(val) => onChange("dinner", val)}
        />
      </div>
    </div>
  );
}

export default Day;
