import React from "react";
import styles from "./Card.module.css";
function Card({ header, footer }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>{header}</div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}

export default Card;
