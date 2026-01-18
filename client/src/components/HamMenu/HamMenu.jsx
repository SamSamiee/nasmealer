import React from "react";
import { Link } from "react-router-dom";
import { useHamMenu } from "../../hooks/useHamMenu.js";
import styles from "./HamMenu.module.css";
import { HiMenu } from "react-icons/hi";

const links = [
   { name: "home", to: "/" },
   { name: "plans", to: "/plans" },
   { name: "cart", to: "/cart" },
   { name: "meals", to: "/meals" },
   { name: "settings", to: "/settings" },
   { name: "requests", to: "/requests" },
];

function HamMenu({ children }) {
   const [loading, setLoading] = React.useState(false);
   const {
      visible,
      setVisible,
      containerRef,
      buttonRef,
      handleLogOut,
   } = useHamMenu(loading, setLoading);

   return (
      <div className={styles.wrapper}>
         <button
            className={styles.button}
            ref={buttonRef}
            onClick={() =>
               setVisible((current) => !current)
            }
            aria-label="Menu">
            <HiMenu
               size={24}
               color="#ffffff"
            />
         </button>
         {visible && (
            <div
               ref={containerRef}
               className={styles.container}>
               <ul>
                  {links.map((item) => (
                     <li key={item.name}>
                        <Link
                           onClick={() => setVisible(false)}
                           to={item.to}>
                           {item.name}
                        </Link>
                     </li>
                  ))}
               </ul>
               <button
                  disabled={loading}
                  onClick={handleLogOut}>
                  Log Out
               </button>
            </div>
         )}
      </div>
   );
}

export default HamMenu;
