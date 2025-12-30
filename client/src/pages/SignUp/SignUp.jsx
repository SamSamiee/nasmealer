import React from "react";
import { SERVER_URL } from "../../config/api.js";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider/UserProvider";

function SignUp() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(23);
  const [password, setPassword] = React.useState("");
  const { getUser } = React.useContext(UserContext);

  const usernameId = React.useId();
  const emailId = React.useId();
  const nameId = React.useId();
  const ageId = React.useId();
  const passwordId = React.useId();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Step 1: Create the user account
      const signupResult = await fetch(`${SERVER_URL}/user/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name,
          email,
          age,
        }),
      });

      if (!signupResult.ok) {
        const errorData = await signupResult.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create account");
      }

      // Step 2: Automatically log the user in
      const loginResult = await fetch(`${SERVER_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!loginResult.ok) {
        // Account created but login failed - redirect to login page
        navigate("/login");
        return;
      }

      // Step 3: Update auth state and navigate to home
      await getUser();
      navigate("/");
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to create account. Please try again.");
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor={usernameId}>username</label>
        <input
          type="text"
          id={usernameId}
          required
          placeholder="insert your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor={emailId}>email</label>
        <input
          type="email"
          id={emailId}
          required
          placeholder="insert your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor={nameId}>name</label>
        <input
          type="text"
          id={nameId}
          placeholder="insert your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor={ageId}>age</label>
        <input
          type="number"
          id={ageId}
          placeholder="insert your age"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
        <label htmlFor={passwordId}>password</label>
        <input
          type="password"
          required
          id={passwordId}
          placeholder="insert your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
