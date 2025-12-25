import React from "react";
import IngredientCard from "../../components/IngredientCard";
import { useParams } from "react-router-dom";
const units = ["gr", "Kg", "one(s)"];

// later the fetching should be implied fo this component
// all meals could later be used for the fetched data
// example
const allMeals = [{ id: 1, name: "kabab" }];

function NewMeal({ initial }) {
  const { mealId } = useParams();
  const initialMeal = React.useMemo(() => {
    if (!mealId) {
      return initial;
    } else {
      return allMeals.find((meal) => meal.id === Number(mealId));
    }
  }, [initial, mealId]);

  const [mealName, setMealName] = React.useState(initialMeal?.mealName || "");
  const [name, setName] = React.useState(initialMeal?.name || "");
  const [unit, setUnit] = React.useState(initialMeal?.unit || "gr");
  const [quantity, setQuantity] = React.useState(initialMeal?.quantity || 1);
  const [price, setPrice] = React.useState(initialMeal?.price || 0.0);
  const [list, setList] = React.useState(initialMeal?.list || []);

  React.useEffect(() => {
    if (!initialMeal) {
      return;
    }
    setMealName(initialMeal.mealName ?? "");
    setName(initialMeal.name ?? "");
    setUnit(initialMeal.unit ?? "gr");
    setQuantity(initialMeal.quantity ?? 0);
    setPrice(initialMeal.price ?? 0.0);
    setList(initialMeal.list ?? []);
  }, [mealId, initialMeal]);

  function handleReset() {
    setMealName("");
    setName("");
    setQuantity(1);
    setPrice(0.0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/newmeal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealName,
          ingredients: list,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save the meal");
      }
      const data = await res.json();
      console.log("saved", data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1>{mealName || "New Meal"}</h1>
      <form onSubmit={() => handleSubmit(e)}>
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
          required
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
        <label htmlFor="price-per-unit">Price</label>
        <input
          id="price-per-unit"
          name="price-per-unit"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <p>Sub-total:</p>
        <p>{price * quantity}</p>
        <button
          type="button"
          onClick={() => {
            setList((prev) => [
              ...prev,
              { name, unit, quantity, price, id: crypto.randomUUID() },
            ]);
            handleReset();
          }}
        >
          +
        </button>

        <br />
        {list.length > 0 &&
          list.map(({ name, unit, quantity, price, id }) => {
            return (
              <IngredientCard
                key={id}
                unit={unit}
                quantity={quantity}
                price={price}
                tag="-"
                children={name}
                onClick={() =>
                  setList((prev) => prev.filter((i) => i.id !== id))
                }
              />
            );
          })}
        <p>
          Total Price:{" "}
          {list.reduce((sum, { price, quantity }) => {
            return sum + quantity * price;
          }, 0)}
        </p>
        <button type="submit">save</button>
      </form>
    </div>
  );
}

export default NewMeal;
