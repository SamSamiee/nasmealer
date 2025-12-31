import React from "react";
import HamMenu from "../HamMenu";
import { UserContext } from "../../context/UserProvider";
import styles from "./navbar.module.css";

function Navbar({}) {
  const { isAuthenticated } = React.useContext(UserContext);
  return isAuthenticated && (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Nasmealer</div>
        <HamMenu />
      </nav>
    </div>
  );
}

export default Navbar;
