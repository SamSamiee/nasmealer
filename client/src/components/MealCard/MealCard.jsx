import { IoRemoveCircleOutline } from "react-icons/io5";
import styles from "./MealCard.module.css";

function MealCard({ name, list, fnEdit, fnRemove }) {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <h4 className={styles.title}>{name}</h4>
            {(fnEdit || fnRemove) && (
               <div className={styles.actions}>
                  {fnEdit && (
                     <button
                        className={styles.actionButton}
                        type="button"
                        onClick={() => fnEdit()}>
                        edit
                     </button>
                  )}
                  {fnRemove && (
                     <button
                        className={styles.actionButton}
                        type="button"
                        onClick={() => fnRemove()}>
                        <IoRemoveCircleOutline />
                     </button>
                  )}
               </div>
            )}
         </div>
         {list && (
            <p className={styles.ingredients}>
               {list.slice(0, 3).map((item) => (
                  <span key={item.id}>{item.name}, </span>
               ))}
               {list.length > 3 && "..."}
            </p>
         )}
      </div>
   );
}

export default MealCard;
