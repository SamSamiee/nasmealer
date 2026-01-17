import React from "react";
import styles from "./UserCard.module.css";
import { IoPersonSharp } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import Picture from "../Picture";

function UserCard({
   username,
   name,
   onClick,
   accFn,
   ignFn,
}) {
   return (
      <div
         onClick={onClick}
         className={styles.wrapper}>
         <Picture />
         <div className={styles.details}>
            <p className={styles.username}>{username}</p>
            <p className={styles.name}>{name}</p>
         </div>
         <div className={styles.buttons}>
            {accFn && (
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     accFn();
                  }}>
                  <FiCheck />
               </button>
            )}
            {ignFn && (
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     ignFn();
                  }}>
                  <FiX />
               </button>
            )}
         </div>
      </div>
   );
}

export default UserCard;
