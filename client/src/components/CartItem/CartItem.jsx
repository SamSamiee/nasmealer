import React from "react";

function CartItem({ type, name, quantity, unit, onClick, status }) {
  return (
    <div>
      <div>{name}</div>
      <div>
        <span>{quantity}</span>
        <span>{unit}</span>
      </div>
      <button onClick={onClick}>
        {status === "pending" ? "Mark as done" : "Mark as pending"}
      </button>
    </div>
  );
}

export default CartItem;
