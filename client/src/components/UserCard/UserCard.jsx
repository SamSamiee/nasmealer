import React from "react";
import styles from "./UserCard.module.css";

function UserCard({ username, name }) {
   return (
      <div className={styles.wrapper}>
         <p className={styles.username}>{username}</p>
         <p className={styles.name}>{name}</p>
      </div>
   );
}

export default UserCard;
