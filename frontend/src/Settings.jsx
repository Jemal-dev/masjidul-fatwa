import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Settings() {
  const { t, i18n } = useTranslation();

  // =====================================================
  // STORED ADMIN
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const getAxiosConfig = () => {
    const token =
      localStorage.getItem("adminToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =====================================================
  // CONTRIBUTION SETTINGS
  // =====================================================

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAmount, setSavingAmount] =
    useState(false);

  // =====================================================
  // CLEAR CONTRIBUTIONS
  // =====================================================

  const [
    clearingContributions,
    setClearingContributions,
  ] = useState(false);

  const [showClearModal, setShowClearModal] =
    useState(false);

  // =====================================================
  // ACCOUNT SETTINGS
  // =====================================================

  const [username, setUsername] = useState(
    storedUser.username || ""
  );

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [savingAccount, setSavingAccount] =
    useState(false);

  // =====================================================
  // MESSAGES
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET DATE LOCALE
  // =====================================================

  const getDateLocale = () => {
    const language = i18n.language || "en";

    const localeMap = {
      en: "en-US",
      om: "om-ET",
      am: "am-ET",
      ar: "ar",
    };

    return (
      localeMap[language] || "en-US"
    );
  };

  // =====================================================
  // GET CONTRIBUTION SETTINGS
  // =====================================================

  const getSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/settings/contribution-amount",
        getAxiosConfig()
      );

      setAmount(
        response.data?.amount ?? ""
      );
    } catch (err) {
      console.error(
        "Settings load error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t("settings.errors.load")
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE CONTRIBUTION AMOUNT
  // =====================================================

  const handleSaveAmount = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        t("settings.errors.invalidAmount")
      );
      return;
    }

    try {
      setSavingAmount(true);

      await axios.put(
        "/api/settings/contribution-amount",
        {
          amount: numericAmount,
        },
        getAxiosConfig()
      );

      setSuccess(
        t(
          "settings.messages.amountUpdated"
        )
      );
    } catch (err) {
      console.error(
        "Update contribution settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t("settings.errors.save")
      );
    } finally {
      setSavingAmount(false);
    }
  };

  // =====================================================
  // OPEN CLEAR CONTRIBUTIONS MODAL
  // =====================================================

  const openClearModal = () => {
    setError("");
    setSuccess("");
    setShowClearModal(true);
  };

  // =====================================================
  // CLOSE CLEAR CONTRIBUTIONS MODAL
  // =====================================================

  const closeClearModal = () => {
    if (clearingContributions) {
      return;
    }

    setShowClearModal(false);
  };

  // =====================================================
  // CLEAR ALL CONTRIBUTIONS
  // =====================================================

  const clearContributions = async () => {
    try {
      setClearingContributions(true);
      setError("");
      setSuccess("");

      const response = await axios.delete(
        "/api/contributions/clear",
        getAxiosConfig()
      );

      setShowClearModal(false);

      setSuccess(
        response.data?.message ||
          t(
            "settings.messages.contributionsCleared",
            { count: 0 }
          )
      );
    } catch (err) {
      console.error(
        "Clear contributions error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t(
            "settings.errors.clearContributions"
          )
      );
    } finally {
      setClearingContributions(false);
    }
  };

  // =====================================================
  // UPDATE ACCOUNT
  // =====================================================

  const handleSaveAccount = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = username.trim();

    // Username validation
    if (!cleanUsername) {
      setError(
        t(
          "settings.account.errors.usernameRequired"
        )
      );
      return;
    }

    // Password validation
    if (
      newPassword &&
      newPassword.length < 6
    ) {
      setError(
        t(
          "settings.account.errors.passwordMin"
        )
      );
      return;
    }

    // Password confirmation
    if (
      newPassword !== confirmPassword
    ) {
      setError(
        t(
          "settings.account.errors.passwordMismatch"
        )
      );
      return;
    }

    // Logged-in account validation
    if (!storedUser.id) {
      setError(
        t(
          "settings.account.errors.accountNotFound"
        )
      );
      return;
    }

    try {
      setSavingAccount(true);

      const updateData = {
        full_name:
          storedUser.full_name || "",

        username: cleanUsername,

        password: newPassword,

        role:
          storedUser.role || "admin",
      };

      const response = await axios.put(
        `/api/admins/${storedUser.id}`,
        updateData,
        getAxiosConfig()
      );

      if (response.data.success) {
        // Never store password in localStorage.
        const updatedUser = {
          ...storedUser,
          username: cleanUsername,
        };

        localStorage.setItem(
          "adminUser",
          JSON.stringify(updatedUser)
        );

        setUsername(cleanUsername);
        setNewPassword("");
        setConfirmPassword("");

        setSuccess(
          t(
            "settings.account.messages.updated"
          )
        );
      } else {
        setError(
          response.data?.message ||
            t(
              "settings.account.errors.update"
            )
        );
      }
    } catch (err) {
      console.error(
        "Account update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t(
            "settings.account.errors.update"
          )
      );
    } finally {
      setSavingAccount(false);
    }
  };

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    getSettings();
  }, []);

  // =====================================================
  // CLOSE MODAL WITH ESC KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        showClearModal &&
        !clearingContributions
      ) {
        setShowClearModal(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    showClearModal,
    clearingContributions,
  ]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          {t("settings.loading")}
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page settings-page">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>
            {t("settings.title")}
          </h1>

          <p>
            {t("settings.description")}
          </p>
        </div>
      </div>

      {/* GLOBAL MESSAGES */}

      {error && (
        <div className="error-message">
          <span aria-hidden="true">
            {"!"}
          </span>

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span aria-hidden="true">
            {"\u2713"}
          </span>

          <span>{success}</span>
        </div>
      )}

      {/* =================================================
          ACCOUNT SETTINGS
      ================================================== */}

      <div className="section-card settings-card">
        <div className="section-header settings-section-header">
          <div>
            <div className="settings-title-row">
              <span
                className="settings-icon"
                aria-hidden="true"
              >
                {"\u{1F464}"}
              </span>

              <h2>
                {t(
                  "settings.account.title"
                )}
              </h2>
            </div>

            <p>
              {t(
                "settings.account.description"
              )}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveAccount}
          className="settings-form"
        >
          {/* USERNAME */}

          <div className="form-group">
            <label htmlFor="username">
              {t(
                "settings.account.username"
              )}
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder={t(
                "settings.account.usernamePlaceholder"
              )}
              autoComplete="username"
              disabled={savingAccount}
            />
          </div>

          {/* NEW PASSWORD */}

          <div className="form-group">
            <label htmlFor="new-password">
              {t(
                "settings.account.newPassword"
              )}
            </label>

            <div className="password-input-wrapper">
              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder={t(
                  "settings.account.newPasswordPlaceholder"
                )}
                autoComplete="new-password"
                disabled={savingAccount}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={savingAccount}
                aria-label={
                  showPassword
                    ? t(
                        "settings.account.hidePassword"
                      )
                    : t(
                        "settings.account.showPassword"
                      )
                }
              >
                {showPassword
                  ? "\u{1F648}"
                  : "\u{1F441}\uFE0F"}
              </button>
            </div>

            <small className="form-help">
              {t(
                "settings.account.passwordHelp"
              )}
            </small>
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label htmlFor="confirm-password">
              {t(
                "settings.account.confirmPassword"
              )}
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder={t(
                  "settings.account.confirmPasswordPlaceholder"
                )}
                autoComplete="new-password"
                disabled={savingAccount}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                disabled={savingAccount}
                aria-label={
                  showConfirmPassword
                    ? t(
                        "settings.account.hidePassword"
                      )
                    : t(
                        "settings.account.showPassword"
                      )
                }
              >
                {showConfirmPassword
                  ? "\u{1F648}"
                  : "\u{1F441}\uFE0F"}
              </button>
            </div>
          </div>

          {/* ACCOUNT BUTTON */}

          <div className="settings-actions">
            <button
              type="submit"
              className="save-button"
              disabled={savingAccount}
            >
              {savingAccount
                ? t(
                    "settings.common.saving"
                  )
                : t(
                    "settings.account.updateButton"
                  )}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
          WEEKLY CONTRIBUTION
      ================================================== */}

      <div className="section-card settings-card">
        <div className="section-header settings-section-header">
          <div>
            <div className="settings-title-row">
              <span
                className="settings-icon"
                aria-hidden="true"
              >
                {"\u{1F4B0}"}
              </span>

              <h2>
                {t(
                  "settings.contribution.title"
                )}
              </h2>
            </div>

            <p>
              {t(
                "settings.contribution.description"
              )}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveAmount}
          className="settings-form"
        >
          <div className="form-group">
            <label htmlFor="contribution-amount">
              {t(
                "settings.contribution.amountLabel"
              )}
            </label>

            <div className="amount-input">
              <input
                id="contribution-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder={t(
                  "settings.contribution.amountPlaceholder"
                )}
                disabled={savingAmount}
              />

              <span>ETB</span>
            </div>

            <small className="form-help">
              {t(
                "settings.contribution.amountHelp"
              )}
            </small>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="save-button"
              disabled={savingAmount}
            >
              {savingAmount
                ? t(
                    "settings.common.saving"
                  )
                : t(
                    "settings.common.saveChanges"
                  )}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
          CONTRIBUTION MANAGEMENT
      ================================================== */}

      {storedUser.role ===
        "super_admin" && (
        <div className="danger-zone-card">
          {/* HEADER */}

          <div className="danger-zone-header">
            <div
              className="danger-zone-icon"
              aria-hidden="true"
            >
              {"\u{1F5D1}\uFE0F"}
            </div>

            <div className="danger-zone-heading">
              <div className="danger-zone-title-row">
                <h2>
                  {t(
                    "settings.danger.title"
                  )}
                </h2>

                <span className="danger-zone-badge">
                  {t(
                    "settings.danger.superAdminOnly"
                  )}
                </span>
              </div>

              <p>
                {t(
                  "settings.danger.description"
                )}
              </p>
            </div>
          </div>

          {/* CONTENT */}

          <div className="danger-zone-content">
            <div className="danger-zone-warning">
              <div
                className="warning-icon"
                aria-hidden="true"
              >
                {"!"}
              </div>

              <div className="warning-text">
                <strong>
                  {t(
                    "settings.danger.warningTitle"
                  )}
                </strong>

                <p>
                  {t(
                    "settings.danger.warningDescription"
                  )}
                </p>
              </div>
            </div>

            <div className="danger-zone-action">
              <div className="danger-zone-info">
                <span className="danger-zone-dot"></span>

                <span>
                  {t(
                    "settings.danger.irreversible"
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  openClearModal
                }
                className="danger-button"
                disabled={
                  clearingContributions
                }
              >
                <span
                  className="danger-button-icon"
                  aria-hidden="true"
                >
                  {"\u{1F5D1}\uFE0F"}
                </span>

                <span>
                  {t(
                    "settings.danger.clearButton"
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CLEAR CONTRIBUTIONS MODAL
      ================================================== */}

      {showClearModal && (
        <div
          className="clear-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !clearingContributions
            ) {
              closeClearModal();
            }
          }}
        >
          <div
            className="clear-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
          >
            <div
              className="clear-modal-icon"
              aria-hidden="true"
            >
              {"\u{1F5D1}\uFE0F"}
            </div>

            <h2 id="clear-modal-title">
              {t(
                "settings.modal.title"
              )}
            </h2>

            <p className="clear-modal-description">
              {t(
                "settings.modal.description"
              )}
            </p>

            <div className="clear-modal-warning">
              <span aria-hidden="true">
                {"!"}
              </span>

              <div>
                <strong>
                  {t(
                    "settings.modal.warningTitle"
                  )}
                </strong>

                <p>
                  {t(
                    "settings.modal.warningDescription"
                  )}
                </p>
              </div>
            </div>

            <div className="clear-modal-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={
                  closeClearModal
                }
                disabled={
                  clearingContributions
                }
              >
                {t(
                  "settings.common.cancel"
                )}
              </button>

              <button
                type="button"
                className="modal-danger-button"
                onClick={
                  clearContributions
                }
                disabled={
                  clearingContributions
                }
              >
                <span>
                  {clearingContributions
                    ? t(
                        "settings.modal.clearing"
                      )
                    : t(
                        "settings.modal.confirm"
                      )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;