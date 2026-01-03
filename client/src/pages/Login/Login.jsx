import React from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../config/api.js";
import { UserContext } from "../../context/UserProvider";
import styles from "./Login.module.css";

function Login() {
  const { isAuthenticated, getUser } = React.useContext(UserContext);
  const navigate = useNavigate();
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
        // Store sessionId in localStorage as fallback for Safari (which blocks third-party cookies)
        if (json.sessionId) {
          localStorage.setItem("sessionId", json.sessionId);
        }
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
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
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
        </div>
        <div className={styles.formGroup}>
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
        </div>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={status === "loading"}
        >
          Log In
        </button>
      </form>
      {status === "error" && <p className={styles.errorMessage}>wrong username or password</p>}
      {status === "failed" && <p className={styles.errorMessage}>could not hit the server</p>}
      <button
        className={styles.signUpButton}
        type="button"
        onClick={() => navigate("/signup")}
      >
        Sign Up
      </button>
    </div>
  );
}

export default Login;
