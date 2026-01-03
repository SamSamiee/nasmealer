import React from "react";
import { SERVER_URL, getAuthHeaders } from "../../config/api.js";
export const UserContext = React.createContext();

function UserProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [user, setUser] = React.useState(null);

  async function getUser() {
    try {
      setIsLoading(true);
      const response = await fetch(SERVER_URL, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const json = await response.json();
        setUser(json.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    getUser();
  }, []);

  function logUserOut() {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("sessionId"); // Clear sessionId from localStorage
  }

  return (
    <UserContext.Provider
      value={{ user: user, isAuthenticated, isLoading, logUserOut, getUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
