import React from "react";
import styles from "./RadioButton.module.css";

function RadioButton() {
   const [active, setActive] = React.useState(false);
   return (
      <div className={styles.wrapper} onClick={()=>setActive((e)=>!e)}>
         <button
            className={`${styles.button} ${
               active && styles.active
            }`}>
            <div className={`${styles.circle} ${
               active && styles.active
            }`}></div>
         </button>
      </div>
   );
}

export default RadioButton;
