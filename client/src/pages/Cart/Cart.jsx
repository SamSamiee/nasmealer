import React from "react";
import CartItem from "../../components/CartItem";
import { useCart } from "../../hooks/useCart";
import styles from "./Cart.module.css";

function Cart() {
  const {
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
  } = useCart();

  return loading ? (
    <p className={styles.loading}>loading</p>
  ) : (
    <div className={styles.container}>
      {ingredientList.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>ingredients</h3>
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
      <div className={styles.addItemForm}>
        <input
          type="text"
          placeholder="add extra items"
          value={extraName}
          onChange={(e) => setExtraName(e.target.value)}
        />
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
        <input
          name="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button
          type="button"
          onClick={() => addProduct()}
        >
          +
        </button>
      </div>
      {productList.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>products</h3>
          {productList.map((item) => {
            const { status, id, item_name, quantity, unit, type, isPending } = item;
            return (
              <CartItem
                key={id}
                type={type}
                quantity={quantity}
                unit={unit}
                name={item_name}
                status={status}
                isPending={isPending}
                onClick={() => toggleStatus(item)}
              />
            );
          })}
        </div>
      )}
      {doneList.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>completed</h3>
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
          <button className={styles.clearButton} onClick={clearDoneItems}>Clear</button>
        </div>
      )}
    </div>
  );
}

export default Cart;
