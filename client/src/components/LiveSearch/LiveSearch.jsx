import React from "react";
import styles from "./LiveSearch.module.css";
import UserCard from "../UserCard";
import { useNavigate } from "react-router-dom";

function LiveSearch({
   state,
   button,
   list,
   input,
   setInput,
}) {
   const navigate = useNavigate();

   return (
      <div className={styles.wrapper}>
         <div className={styles.inputGroup}>
            <input
               className={styles.input}
               type="text"
               placeholder="search a username"
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
            ) : list?.length > 0 ? (
               list.map((i) => (
                  <UserCard
                     key={i.id}
                     name={i.name}
                     username={i.username}
                     onClick={() =>
                        navigate(
                           `/user/${i.id}/${i.username}/${i.name}`
                        )
                     }
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
