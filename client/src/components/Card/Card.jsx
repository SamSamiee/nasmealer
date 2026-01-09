import React from "react";
import styles from "./Card.module.css";
import { useNavigate } from "react-router-dom";
function Card({ header, footer, path, onClick }) {
   const navigate = useNavigate();
   const handleClick = () => {
      if (path) {
         navigate(`/${path}`);
      }
      if (onClick) {
         onClick();
      }
   };
   return (
      <div
         className={styles.wrapper}
         onClick={handleClick}>
         <div className={styles.header}>{header}</div>
         <div className={styles.footer}>{footer}</div>
      </div>
   );
}

export default Card;
