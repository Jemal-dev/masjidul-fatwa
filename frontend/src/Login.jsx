import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Login({ onLogin, onBack }) {
  const { t, i18n } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentLanguage =
    i18n.resolvedLanguage ||
    i18n.language ||
    "en";

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setError("");
  };

  const getTranslatedError = (message) => {
    const normalized =
      String(message || "")
        .trim()
        .toLowerCase();

    if (
      normalized ===
        "invalid username or password" ||
      normalized.includes(
        "invalid username or password"
      )
    ) {
      return t("login.errors.invalidCredentials");
    }

    if (
      normalized.includes(
        "inactive"
      )
    ) {
      return t("login.errors.inactive");
    }

    if (
      normalized.includes(
        "login failed"
      )
    ) {
      return t("login.errors.loginFailed");
    }

    return message || t("login.errors.server");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError(
        t("login.errors.required")
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/auth/login",
        {
          username,
          password,
        }
      );

      if (response.data.success) {
        localStorage.setItem(
          "adminToken",
          response.data.token
        );

        localStorage.setItem(
          "adminUser",
          JSON.stringify(
            response.data.user
          )
        );

        onLogin(response.data.user);
      }
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      if (err.response?.data?.message) {
        setError(
          getTranslatedError(
            err.response.data.message
          )
        );
      } else if (err.request) {
        setError(
          t("login.errors.server")
        );
      } else {
        setError(
          t("login.errors.unexpected")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-language-selector">
          <span>
            {t("language.title")}
          </span>

          <div>
            <button
              type="button"
              className={
                currentLanguage === "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("en")
              }
            >
              English
            </button>

            <button
              type="button"
              className={
                currentLanguage === "om"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("om")
              }
            >
              Afaan Oromoo
            </button>

            <button
              type="button"
              className={
                currentLanguage === "am"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("am")
              }
            >
              አማርኛ
            </button>

            <button
              type="button"
              className={
                currentLanguage === "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("ar")
              }
            >
              العربية
            </button>
          </div>
        </div>

        <div className="login-logo">
          {"\u{263E}"}
        </div>

        <div className="login-heading">
          <span>
            MASJIDUL-FATWA
          </span>

          <h1>
            {t("login.title")}
          </h1>

          <p>
            {t("login.description")}
          </p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <label htmlFor="username">
              {t("login.username")}
            </label>

            <input
              id="username"
              type="text"
              placeholder={t(
                "login.usernamePlaceholder"
              )}
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              {t("login.password")}
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder={t(
                  "login.passwordPlaceholder"
                )}
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              >
                {showPassword
                  ? "\u{1F648}"
                  : "\u{1F441}"}
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? t("login.signingIn")
              : t("login.signIn")}
          </button>

        </form>

        <button
          type="button"
          className="login-back-button"
          onClick={onBack}
          disabled={loading}
        >
          {"\u{2190}"}{" "}
          {t("login.backToWebsite")}
        </button>

      </div>
    </div>
  );
}

export default Login;