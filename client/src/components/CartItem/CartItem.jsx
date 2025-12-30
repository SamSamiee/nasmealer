import React from "react";

function CartItem({ type, name, quantity, unit }) {
  return (
    <div>
      <div>{name}</div>
      <div>
        <span>{quantity}</span>
        <span>{unit}</span>
      </div>
      <button>-</button>
    </div>
  );
}

export default CartItem;
