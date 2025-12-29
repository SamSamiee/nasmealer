import React from "react";
import { Navigate } from "react-router-dom";
import { SERVER_URL } from "../../config/api.js";
import { UserContext } from "../../context/UserProvider";

function Login() {
  const { isAuthenticated, getUser } = React.useContext(UserContext);

  // idle, loading, success, error
  const [status, setStatus] = React.useState("idle");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  React.useEffect(() => {
    if (isAuthenticated) {
      setStatus("success");
    } else {
      setStatus("idle");
    }
    console.log("the status is:", status);
    console.log("authentication is ", isAuthenticated);
  }, [isAuthenticated]);

  // id for the inputs
  const usernameId = React.useId();
  const passwordId = React.useId();

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      setStatus("loading");
      const result = await fetch(`${SERVER_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await result.json();
      if (result.ok) {
        setStatus("success");
        getUser();
      } else {
        setStatus("error");
        setPassword("");
        setUsername("");
      }
    } catch {
      setStatus("failed");
    }
  }

  return status === "success" ? (
    <Navigate to="/" />
  ) : (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor={usernameId}>username</label>
        <input
          id={usernameId}
          type="text"
          placeholder="insert your username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={status === "loading"}
        />
        <label htmlFor={passwordId}>password</label>
        <input
          id={passwordId}
          type="password"
          placeholder="insert your password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
        >
          Log In
        </button>
      </form>
      {status === "error" && <p>wrong username or password</p>}
      {status === "failed" && <p>could not hit the server</p>}
    </>
  );
}

export default Login;
