import React from "react";
import { Link } from "react-router-dom";
import { useHamMenu } from "../../hooks/useHamMenu.js";
import styles from "./HamMenu.module.css";

const links = [
  { name: "home", to: "/" },
  { name: "plans", to: "/plans" },
  { name: "cart", to: "/cart" },
  { name: "meals", to: "/meals" },
];

function HamMenu({ children }) {
  const [loading, setLoading] = React.useState(false);
  const { visible, setVisible, containerRef, buttonRef, handleLogOut } =
    useHamMenu();

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={() => setVisible((current) => !current)}
      >
        {children}
      </button>
      {visible && (
        <div
          ref={containerRef}
          className={styles.container}
        >
          <ul>
            {links.map((item) => (
              <li key={item.name}>
                <Link
                  onClick={() => setVisible(false)}
                  to={item.to}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <button
            disabled={loading}
            onClick={handleLogOut}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default HamMenu;
