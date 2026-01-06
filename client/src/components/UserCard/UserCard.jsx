import React from "react";
import styles from "./UserCard.module.css";
import { IoPersonSharp } from "react-icons/io5";

function UserCard({ username, name }) {
   return (
      <div className={styles.wrapper}>
         <div className={styles.picture}>
            <IoPersonSharp size="2em"/>
         </div>
         <div className={styles.details}>
            <p className={styles.username}>{username}</p>
            <p className={styles.name}>{name}</p>
         </div>
      </div>
   );
}

export default UserCard;
