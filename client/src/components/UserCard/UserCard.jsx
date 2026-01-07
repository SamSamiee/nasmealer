import React from "react";
import styles from "./UserCard.module.css";
import { IoPersonSharp } from "react-icons/io5";
import Picture from "../Picture";

function UserCard({ username, name, onClick }) {
   return (
      <div
         onClick={onClick}
         className={styles.wrapper}>
         <Picture />
         <div className={styles.details}>
            <p className={styles.username}>{username}</p>
            <p className={styles.name}>{name}</p>
         </div>
      </div>
   );
}

export default UserCard;
