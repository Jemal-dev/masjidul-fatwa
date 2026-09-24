
import { useState } from "react";
import axios from "axios";

function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);

        localStorage.setItem(
          "adminUser",
          JSON.stringify(response.data.user)
        );

        onLogin(response.data.user);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Cannot connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          ☪
        </div>

        {/* Brand */}
        <div className="login-brand">
          MASJIDUL-FATWA
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Admin Login</h1>

          <p>
            Sign in to manage the Shabab contribution system.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div className="login-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
  type="submit"
  className="login-button"
  disabled={loading}
>
  {loading ? (
    <>
      <span className="login-spinner"></span>
      Signing in...
    </>
  ) : (
    "Sign In"
  )}
</button>

        </form>

        {/* Back to Website */}
        <button
          type="button"
          className="login-back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to Website
        </button>

      </div>
    </div>
  );
}

export default Login;

