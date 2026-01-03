import React from "react";
import { UserContext } from "../context/UserProvider";
import { SERVER_URL, getAuthHeaders } from "../config/api.js";

export function useHamMenu(loading, setLoading) {
  const [visible, setVisible] = React.useState(false);
  const { logUserOut } = React.useContext(UserContext);

  // adding click logic
  const buttonRef = React.useRef(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClick(e) {
      if (!visible) {
        return;
      }

      const buttonClicks = buttonRef.current?.contains(e.target);
      const containerClicks = containerRef.current?.contains(e.target);

      if (!buttonClicks && !containerClicks) {
        setVisible(false);
      }
    }

    // adding listener
    document.addEventListener("click", handleClick);

    // clean up
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [visible]);

  async function handleLogOut() {
    try {
      setLoading(true);
      const result = await fetch(`${SERVER_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (result.ok) {
        setLoading(false);
        logUserOut();
      }
    } catch(err) {
      console.error(err)
      setLoading(false);
    }
  }

  return { visible, setVisible, containerRef, buttonRef, handleLogOut };
}
