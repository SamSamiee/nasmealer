import React from "react";
import HamMenu from "../HamMenu";
import { UserContext } from "../../context/UserProvider";
import styles from "./Navbar.module.css";
import { FaUserFriends } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";

function Navbar({}) {
   const { isAuthenticated } =
      React.useContext(UserContext);
   return (
      isAuthenticated && (
         <div className={styles.container}>
            <nav className={styles.nav}>
              <Link to="/">
               <div className={styles.logo}>Nasmealer</div>
              </Link>
               <div className={styles.buttons}>
                  <Link to="/search">
                     <IoIosSearch
                        size={24}
                        color="#ffffff"
                     />
                  </Link>
                  <Link to="/friends">
                     <FaUserFriends
                        size={24}
                        color="#ffffff"
                     />
                  </Link>
                  <HamMenu />
               </div>
            </nav>
         </div>
      )
   );
}

export default Navbar;
