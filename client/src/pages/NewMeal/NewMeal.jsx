import React from "react";
import IngredientCard from "../../components/IngredientCard";
import { useNewMeal } from "../../hooks/useNewMeal.js";
import styles from "./NewMeal.module.css";

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
  } = useNewMeal(initial);

  return isLoading ? (
    <p className={styles.loading}>loading</p>
  ) : (
    <div className={styles.container}>
      <h1 className={styles.title}>{mealName || "New Meal"}</h1>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <input
          className={styles.mealNameInput}
          type="text"
          required
          placeholder="kabab tabeE"
          value={mealName}
          onChange={(e) => setMealName(e?.target?.value || "")}
        />
        <div className={styles.ingredientsSection}>
          <h2 className={styles.ingredientsSectionTitle}>Ingredients</h2>
          <div className={styles.ingredientForm}>
            <div className={styles.formGroup}>
              <label htmlFor="ingredient-name">Name</label>
              <input
                type="text"
                name="ingredient-name"
                id="ingredient-name"
                placeholder="tomato"
                value={name}
                onChange={(e) => setName(e?.target?.value)}
              />
            </div>
            <div className={styles.formGroupRow}>
              <div className={styles.formGroup}>
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
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            <button
              className={styles.addButton}
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
          </div>

          {list.length > 0 && (
            <div className={styles.ingredientsList}>
              {list.map(({ name, unit, quantity, id }) => {
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
            </div>
          )}
        </div>
        <button
          className={styles.saveButton}
          type="submit"
        >
          save
        </button>
      </form>
    </div>
  );
}

export default NewMeal;
