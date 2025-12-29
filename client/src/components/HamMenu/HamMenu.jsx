import React from "react";
import { SERVER_URL } from "../../config/api.js";
import { UserContext } from "../../context/UserProvider";
import { Link } from "react-router-dom";

const links = [
  { name: "home", to: "/" },
  { name: "plans", to: "/plans" },
  { name: "cart", to: "/cart" },
  { name: "meals", to: "/meals" },
];

function HamMenu({ children }) {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { logUserOut } = React.useContext(UserContext);

  async function handleLogOut() {
    try {
      setLoading(true);
      const result = await fetch(`${SERVER_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (result.ok) {
        setLoading(false);
        logUserOut();
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={() => setVisible((current) => !current)}>
        {children}
      </button>
      {visible && (
        <>
          <ul>
            {links.map((item) => (
              <li key={item.name}>
                <Link to={item.to}>{item.name}</Link>
              </li>
            ))}
          </ul>
          <button
            disabled={loading}
            onClick={handleLogOut}
          >
            Log Out
          </button>
        </>
      )}
    </div>
  );
}

export default HamMenu;
