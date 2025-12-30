import React from "react";
import { SERVER_URL } from "../../config/api.js";
import CartItem from "../../components/CartItem";

function Cart() {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
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
        setItems(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getItems();
  }, []);

  return loading ? (
    <p>loading</p>
  ) : (
    <div>
      {items.map(({ status, id, item_id, item_name, quantity, unit, type }) => {
        return (
          <CartItem
            key={id}
            type={type}
            quantity={quantity}
            unit={unit}
            name={item_name}
          />
        );
      })}
    </div>
  );
}

export default Cart;
