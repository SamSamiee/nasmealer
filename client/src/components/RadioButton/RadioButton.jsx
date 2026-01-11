import React from "react";
import styles from "./RadioButton.module.css";

function RadioButton({ value = false, onClick }) {
   return (
      <div
         className={styles.wrapper}
         onClick={onClick}>
         <button
            disabled={value === "disabled"}
            className={`${styles.button} ${
               value === true
                  ? styles.active
                  : value === "disabled"
                  ? styles.disabled
                  : ""
            }`}
            onClick={onClick}>
            <div
               className={`${styles.circle} ${
                  value === true
                     ? styles.active
                     : value === "disabled"
                     ? styles.disabled
                     : ""
               }`}></div>
         </button>
      </div>
   );
}

export default RadioButton;
