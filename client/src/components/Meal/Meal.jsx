import React from "react";
import styles from "./Meal.module.css";

function Meal({
  availableMeals,
  status,
  val = "",
  onChange,
  edit = true,
  placeholder = "...",
}) {
  // set the status for whether the meal is a breakfast, lunch, or dinner
  let mealStatus = "";
  switch (status) {
    case "breakfast":
      mealStatus = styles.breakfast;
      break;
    case "lunch":
      mealStatus = styles.lunch;
      break;
    case "dinner":
      mealStatus = styles.dinner;
      break;
    default:
      mealStatus = "";
  }

  return edit ? (
    <div>
      <select
        value={val}
        className={mealStatus}
        onChange={(e) => onChange(e.target.value)}
      >
        {!val && (
          <option
            disabled
            value=""
          >
            {placeholder}
          </option>
        )}
        {val && <option value={val}>{val}</option>}
        <optgroup label="Meals">
          {availableMeals?.map((meal) => {
            return (
              <option
                value={meal.name}
                key={meal.id}
              >
                {meal.name}
              </option>
            );
          })}
        </optgroup>
      </select>
    </div>
  ) : (
    <div>
      <p className={mealStatus}>{val || placeholder}</p>
    </div>
  );
}

export default Meal;
