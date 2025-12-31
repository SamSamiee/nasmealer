import React from "react";
import styles from "./CartItem.module.css";

function CartItem({ type, name, quantity, unit, onClick, status, isPending }) {
  return (
    <div className={isPending ? styles.pending : ""}>
      <div>{name}</div>
      <div>
        <span>{quantity}</span>
        <span>{unit}</span>
      </div>
      <button onClick={onClick} disabled={isPending}>
        {status === "pending" ? "Mark as done" : "Mark as pending"}
      </button>
    </div>
  );
}

export default CartItem;
