import React from "react";
import styles from "./Ingredient.module.css";

function Ingredient({ name }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{name}</h3>
    </div>
  );
}

export default Ingredient;
