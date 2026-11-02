
import { useState } from "react";
import "./App.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("clinic");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isOwner = loginType === "owner";

      const endpoint = isOwner
        ? "http://localhost:5000/api/auth/owner-login"
        : "http://localhost:5000/api/clinics/login";

      const requestBody = isOwner
        ? {
            username: username.trim(),
            email: username.trim(),
            password,
          }
        : {
            login_id: username.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Login API route sapadla nahi. Backend route तपासा."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Login failed.");
      }

      const user = data.user || data.data?.user || data.data;

      if (!user) {
        throw new Error("Login response madhye user data nahi.");
      }

      if (typeof onLogin !== "function") {
        throw new Error("App.jsx madhye onLogin handler sapadla nahi.");
      }

      onLogin(user);
    } catch (err) {
      setError(err.message || "Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-login-page">
      <form className="simple-login-card" onSubmit={handleSubmit}>
        <div className="simple-login-icon">+</div>

        <h1>Small Clinic</h1>
        <p className="simple-login-subtitle">
          Management System
        </p>

        <h2>Login</h2>

        <label htmlFor="loginType">Login as</label>
        <select
          id="loginType"
          value={loginType}
          onChange={(e) => {
            setLoginType(e.target.value);
            setError("");
          }}
        >
          <option value="owner">Main Owner</option>
          <option value="clinic">Clinic</option>
        </select>

        <label htmlFor="username">
          {loginType === "clinic" ? "Clinic Login ID" : "Username / Email"}
        </label>

        <input
          id="username"
          type="text"
          placeholder={
            loginType === "clinic"
              ? "Enter clinic login ID"
              : "Enter username or email"
          }
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="simple-login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="simple-login-footer">
          Authorized users only
        </p>
      </form>
    </div>
  );
}

export default Login;