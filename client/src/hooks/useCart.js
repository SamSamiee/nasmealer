import React from "react";
import { SERVER_URL } from "../config/api.js";

export function useCart() {
  const [loading, setLoading] = React.useState(false);
  const [ingredientList, setIngredientList] = React.useState([]);
  const [productList, setProductList] = React.useState([]);
  const [doneList, setDoneList] = React.useState([]);
  const units = ["gr", "kg", "pieces", "ml", "liters"];
  const [extraName, setExtraName] = React.useState("");
  const [unit, setUnit] = React.useState("pieces");
  const [quantity, setQuantity] = React.useState(1);

  // GET AND SORT ITEMS
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

  React.useEffect(() => {
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

  //ADD PRODUCT
  async function addProduct() {
    // Validate input
    if (!extraName || extraName.trim() === "") {
      window.alert("Please enter a product name!");
      return;
    }

    //make the new object (matching server response structure)
    const newObject = {
      item_name: extraName,  // Use item_name to match CartItem expectations
      unit,
      quantity,
      type: "extra",
      status: "pending",
      id: crypto.randomUUID(),  // Temporary ID
      item_id: null,  // Will be set by server
    };

    // productList backup
    const previousProductList = [...productList];
    // add the new object to the productList
    setProductList((prev) => [...prev, newObject]);

    // API call
    try {
      const result = await fetch(`${SERVER_URL}/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: extraName,  // Server expects 'name'
            quantity,
            unit
          }
        }),
      });

      if (!result.ok) {
        throw new Error("could not send product to database");
      }

      const json = await result.json();  // Fix: added parentheses
      console.log(json);

      // Refetch cart items to get real database IDs
      await getItems();

      // Clear the form
      setExtraName("");
      setQuantity(1);
      setUnit("pieces");
    } catch (err) {
      setProductList(previousProductList);  // Fix: removed extra array wrapping
      window.alert("could not add product :( try again");
      console.error(err);
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

  return {
    loading,
    ingredientList,
    productList,
    doneList,
    units,
    extraName,
    setExtraName,
    unit,
    setUnit,
    quantity,
    setQuantity,
    toggleStatus,
    addProduct,
    clearDoneItems,
  };
}

