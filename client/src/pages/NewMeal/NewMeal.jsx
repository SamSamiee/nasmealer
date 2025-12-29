import React from "react";
import IngredientCard from "../../components/IngredientCard";

import { useNewMeal } from "../../hooks/useNewMeal.js";

function NewMeal({ initial }) {
  const {
    isLoading,
    units,
    handleSubmit,
    mealName,
    setMealName,
    name,
    setName,
    unit,
    setUnit,
    quantity,
    setQuantity,
    list,
    setList,
    handleReset,
  } = useNewMeal();

  return isLoading ? (
    <p>loading</p>
  ) : (
    <div>
      <h1>{mealName || "New Meal"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          required
          placeholder="kabab tabeE"
          value={mealName}
          onChange={(e) => setMealName(e?.target?.value || "")}
        />
        <h2>Ingredients</h2>
        <label htmlFor="ingredient-name">Name</label>
        <input
          type="text"
          name="ingredient-name"
          id="ingredient-name"
          placeholder="tomato"
          value={name}
          onChange={(e) => setName(e?.target?.value)}
        />
        <label htmlFor="unit">Unit</label>
        <select
          id="unit"
          name="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {units.map((i) => {
            return (
              <option
                key={i}
                value={i}
              >
                {i}
              </option>
            );
          })}
        </select>
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button
          type="button"
          onClick={() => {
            setList((prev) => [
              ...prev,
              { name, unit, quantity, id: crypto.randomUUID() },
            ]);
            handleReset();
          }}
        >
          +
        </button>

        <br />
        {list.length > 0 &&
          list.map(({ name, unit, quantity, id }) => {
            return (
              <IngredientCard
                key={id}
                unit={unit}
                quantity={quantity}
                tag="-"
                children={name}
                onClick={() =>
                  setList((prev) => prev.filter((i) => i.id !== id))
                }
              />
            );
          })}
        <button type="submit">save</button>
      </form>
    </div>
  );
}

export default NewMeal;
