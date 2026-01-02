import styles from "./CartItem.module.css";
import { FaUndo } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";

function CartItem({
   type,
   name,
   quantity,
   unit,
   onClick,
   status,
   isPending,
}) {
   return (
      <div className={isPending ? styles.pending : ""}>
         <div
            className={
               status === "done"
                  ? styles.done
                  : type === "meal"
                  ? styles.meal
                  : styles.extra
            }>
            <div className={styles.name}>{name}</div>
            <div className={styles.details}>
               <div className={styles.quantityUnit}>
                  <span className={styles.quantity}>
                     {quantity}
                  </span>
                  <span className={styles.unit}>
                     {unit}
                  </span>
               </div>
               <button
                  className={styles.button}
                  onClick={onClick}
                  disabled={isPending}>
                  {status === "pending" ? (
                     <MdOutlineDone />
                  ) : (
                     <FaUndo />
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}

export default CartItem;
