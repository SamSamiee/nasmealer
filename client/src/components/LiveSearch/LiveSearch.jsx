import React from "react";
import styles from "./LiveSearch.module.css";

import UserCard from "../UserCard"

function LiveSearch({
   state,
   button,
   list,
   input,
   setInput,
}) {
   return (
      <div className={styles.wrapper}>
         <div className={styles.inputGroup}>
            <input
               type="text"
               value={input}
               onChange={(e) => {
                  setInput(e.target.value);
               }}
            />
            {button && (
               <button type="button">{button}</button>
            )}
         </div>
         <div className={styles.results}>
            {state === "loading" ? (
               <p>loading</p>
            ) : input.trim() === "" ? (
               <div></div>
            ) : list.length > 0 ? (
               list.map((i) => (
                  <UserCard
                     name={i.name}
                     username={i.username}
                  />
               ))
            ) : (
               <p>nothing found</p>
            )}
         </div>
      </div>
   );
}

export default LiveSearch;
