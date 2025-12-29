import React from "react";
import { SERVER_URL } from "../../config/api.js";
import { UserContext } from "../../context/UserProvider";

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
            <li>
              <a href="/">home</a>
            </li>
            <li>
              <a href="/plans">plans</a>
            </li>
            <li>
              <a href="/cart">cart</a>
            </li>
            <li>
              <a href="/meals">meals</a>
            </li>
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
