import React from "react";
import { SERVER_URL } from "../../config/api.js";
import CartItem from "../../components/CartItem";

function Cart() {
  const [loading, setLoading] = React.useState(false);
  const [ingredientList, setIngredientList] = React.useState([]);
  const [productList, setProductList] = React.useState([]);
  const [doneList, setDoneList] = React.useState([]);

  // GET AND SORT ITEMS
  React.useEffect(() => {
    async function getItems() {
      try {
        setLoading(true);
        const result = await fetch(`${SERVER_URL}/cart`, {
          method: "GET",
          credentials: "include",
        });
        if (!result.ok) {
          throw new Error("failed fetching cart items");
        }
        const json = await result.json();

        // placeholders
        const ingredients = [];
        const products = [];
        const dones = [];

        // initial sorting
        json.data.forEach((i) => {
          const { type, status } = i;
          if (type === "meal" && status === "pending") {
            ingredients.push(i);
          }
          if (type === "extra" && status === "pending") {
            products.push(i);
          }
          if (status === "done") {
            dones.push(i);
          }
        });

        // change state
        setIngredientList(ingredients);
        setProductList(products);
        setDoneList(dones);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getItems();
  }, []);

  // CHANGE STATUS WITH OPTIMISTIC UPDATES
  async function toggleStatus(item) {
    const { id, type, status: currentStatus } = item;
    const newStatus = currentStatus === "pending" ? "done" : "pending";

    // Optimistic update: move item immediately
    if (currentStatus === "pending") {
      // Moving from pending to done
      if (type === "meal") {
        setIngredientList((prev) => prev.filter((i) => i.id !== id));
      } else if (type === "extra") {
        setProductList((prev) => prev.filter((i) => i.id !== id));
      }
      setDoneList((prev) => [...prev, { ...item, status: newStatus }]);
    } else {
      // Moving from done back to pending
      setDoneList((prev) => prev.filter((i) => i.id !== id));
      const updatedItem = { ...item, status: newStatus };
      if (type === "meal") {
        setIngredientList((prev) => [...prev, updatedItem]);
      } else if (type === "extra") {
        setProductList((prev) => [...prev, updatedItem]);
      }
    }

    // Make API call
    try {
      const result = await fetch(`${SERVER_URL}/cart`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          status: newStatus,
        }),
      });

      if (!result.ok) {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      // Rollback: revert the optimistic update
      if (currentStatus === "pending") {
        // Rollback: move back from done to pending
        setDoneList((prev) => prev.filter((i) => i.id !== id));
        if (type === "meal") {
          setIngredientList((prev) => [...prev, item]);
        } else if (type === "extra") {
          setProductList((prev) => [...prev, item]);
        }
      } else {
        // Rollback: move back from pending to done
        if (type === "meal") {
          setIngredientList((prev) => prev.filter((i) => i.id !== id));
        } else if (type === "extra") {
          setProductList((prev) => prev.filter((i) => i.id !== id));
        }
        setDoneList((prev) => [...prev, item]);
      }
      // Show error to user
      window.alert("Failed to update item status. Please try again.");
    }
  }

  // CLEAR ALL DONE ITEMS
  async function clearDoneItems() {
    if (doneList.length === 0) {
      return;
    }

    // Store the current done list for rollback
    const previousDoneList = [...doneList];

    // Optimistic update: clear done list immediately
    setDoneList([]);

    // Make API call
    try {
      const result = await fetch(`${SERVER_URL}/cart`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!result.ok) {
        throw new Error("Failed to delete done items");
      }
    } catch (err) {
      console.error(err);
      // Rollback: restore the done list
      setDoneList(previousDoneList);
      window.alert("Failed to clear done items. Please try again.");
    }
  }

  return loading ? (
    <p>loading</p>
  ) : (
    <div>
      {ingredientList.length > 0 && (
        <div>
          <h3>ingredients</h3>
          {ingredientList.map((item) => {
            const { status, id, item_name, quantity, unit, type } = item;
            return (
              <CartItem
                key={id}
                type={type}
                quantity={quantity}
                unit={unit}
                name={item_name}
                status={status}
                onClick={() => toggleStatus(item)}
              />
            );
          })}
        </div>
      )}
      {productList.length > 0 && (
        <div>
          <h3>products</h3>
          {productList.map((item) => {
            const { status, id, item_name, quantity, unit, type } = item;
            return (
              <CartItem
                key={id}
                type={type}
                quantity={quantity}
                unit={unit}
                name={item_name}
                status={status}
                onClick={() => toggleStatus(item)}
              />
            );
          })}
        </div>
      )}
      {doneList.length > 0 && (
        <div>
          <h3>completed</h3>
          {doneList.map((item) => {
            const { status, id, item_name, quantity, unit, type } = item;
            return (
              <CartItem
                key={id}
                type={type}
                quantity={quantity}
                unit={unit}
                name={item_name}
                status={status}
                onClick={() => toggleStatus(item)}
              />
            );
          })}
          <button onClick={clearDoneItems}>Clear</button>
        </div>
      )}
    </div>
  );
}

export default Cart;
