import React from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider";
function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = React.useContext(UserContext);

  if (isLoading) {
    return <h1>loading</h1>;
  } else if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
