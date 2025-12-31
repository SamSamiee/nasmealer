import React from 'react';
import styles from './IngredientCard.module.css';

function IngredientCard({children, quantity, unit, onClick, tag}) {
  return (
    <div className={styles.container}>
      <div className={styles.name}>
        {children}
      </div>
      <div className={styles.quantity}>
        {quantity} {unit}
      </div>
      <button className={styles.button} onClick={onClick}>{tag}</button>
    </div>
  );
}

export default IngredientCard;
