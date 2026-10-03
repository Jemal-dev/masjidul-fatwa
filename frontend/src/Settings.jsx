
import { useEffect, useState } from "react";
import axios from "axios";

function Settings() {
  // =====================================================
  // STORED ADMIN
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const token = localStorage.getItem("adminToken");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // CONTRIBUTION SETTINGS
  // =====================================================

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAmount, setSavingAmount] = useState(false);

  // =====================================================
  // CLEAR CONTRIBUTIONS
  // =====================================================

  const [clearingContributions, setClearingContributions] =
    useState(false);

  const [showClearModal, setShowClearModal] =
    useState(false);

  // =====================================================
  // ACCOUNT SETTINGS
  // =====================================================

  const [username, setUsername] = useState(
    storedUser.username || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [savingAccount, setSavingAccount] =
    useState(false);

  // =====================================================
  // MESSAGES
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET CONTRIBUTION SETTINGS
  // =====================================================

  const getSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/settings/contribution-amount",
        axiosConfig
      );

      setAmount(response.data.amount);
    } catch (err) {
      console.error("Settings load error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE CONTRIBUTION AMOUNT
  // =====================================================

  const handleSaveAmount = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Contribution amount must be greater than 0."
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
        axiosConfig
      );

      setSuccess(
        "Weekly contribution amount updated successfully."
      );
    } catch (err) {
      console.error(
        "Update contribution settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update contribution amount."
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
        axiosConfig
      );

      setShowClearModal(false);

      setSuccess(
        response.data.message ||
          "All old contributions cleared successfully."
      );
    } catch (err) {
      console.error(
        "Clear contributions error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to clear contributions."
      );
    } finally {
      setClearingContributions(false);
    }
  };

  // =====================================================
  // UPDATE ACCOUNT
  // =====================================================

  const handleSaveAccount = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = username.trim();

    // Username validation
    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    // Password validation
    if (
      newPassword &&
      newPassword.length < 6
    ) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    // Password confirmation
    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation password do not match."
      );
      return;
    }

    // Logged-in account validation
    if (!storedUser.id) {
      setError(
        "Your account information could not be found. Please log in again."
      );
      return;
    }

    try {
      setSavingAccount(true);

      const response = await axios.put(
        `/api/admins/${storedUser.id}`,
        {
          full_name:
            storedUser.full_name || "",

          username: cleanUsername,

          password: newPassword,

          role: storedUser.role || "admin",
        },
        axiosConfig
      );

      if (response.data.success) {
        // Never store password in localStorage
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
          "Account settings updated successfully."
        );
      }
    } catch (err) {
      console.error(
        "Account update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update account settings."
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
          Loading settings...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page settings-page">

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage system settings and your account.
          </p>
        </div>
      </div>

      {/* =================================================
          GLOBAL MESSAGES
      ================================================== */}

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>✓</span>
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

              <span className="settings-icon">
                👤
              </span>

              <h2>Account Settings</h2>
            </div>

            <p>
              Update your administrator username
              and password.
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
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
            />

          </div>

          {/* NEW PASSWORD */}

          <div className="form-group">

            <label htmlFor="new-password">
              New Password
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
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>

            <small className="form-help">
              Leave blank if you only want to
              change the username.
            </small>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label htmlFor="confirm-password">
              Confirm New Password
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
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁"}
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
                ? "Saving..."
                : "Update Account"}
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

              <span className="settings-icon">
                💰
              </span>

              <h2>
                Weekly Contribution
              </h2>

            </div>

            <p>
              Set the amount members should contribute
              every Friday.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleSaveAmount}
          className="settings-form"
        >

          <div className="form-group">

            <label htmlFor="contribution-amount">
              Weekly Contribution Amount
            </label>

            <div className="amount-input">

              <input
                id="contribution-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter amount"
              />

              <span>ETB</span>

            </div>

          </div>

          <div className="settings-actions">

            <button
              type="submit"
              className="save-button"
              disabled={savingAmount}
            >
              {savingAmount
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

      {/* =================================================
          CONTRIBUTION MANAGEMENT
      ================================================== */}

      {storedUser.role === "super_admin" && (
        <div className="danger-zone-card">

          {/* HEADER */}

          <div className="danger-zone-header">

            <div className="danger-zone-icon">
              🗑️
            </div>

            <div className="danger-zone-heading">

              <div className="danger-zone-title-row">

                <h2>
                  Contribution Management
                </h2>

                <span className="danger-zone-badge">
                  Super Admin
                </span>

              </div>

              <p>
                Manage contribution records and
                prepare the system for a new
                contribution period.
              </p>

            </div>

          </div>

          {/* CONTENT */}

          <div className="danger-zone-content">

            <div className="danger-zone-warning">

              <div className="warning-icon">
                ⚠️
              </div>

              <div className="warning-text">

                <strong>
                  Clear old contributions
                </strong>

                <p>
                  This will permanently remove all
                  existing contribution records
                  from the system.
                </p>

              </div>

            </div>

            <div className="danger-zone-action">

              <div className="danger-zone-info">

                <span className="danger-zone-dot"></span>

                <span>
                  This action cannot be undone
                </span>

              </div>

              <button
                type="button"
                onClick={openClearModal}
                className="danger-button"
                disabled={clearingContributions}
              >
                <span className="danger-button-icon">
                  🗑️
                </span>

                <span>
                  Clear Old Contributions
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
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
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

            <div className="clear-modal-icon">
              🗑️
            </div>

            <h2 id="clear-modal-title">
              Clear all contributions?
            </h2>

            <p className="clear-modal-description">
              You are about to permanently delete
              all contribution records from the
              system.
            </p>

            <div className="clear-modal-warning">
              <span>⚠️</span>

              <div>
                <strong>
                  This action cannot be undone.
                </strong>

                <p>
                  Make sure you have completed any
                  reports or records you need before
                  continuing.
                </p>
              </div>
            </div>

            <div className="clear-modal-actions">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={closeClearModal}
                disabled={clearingContributions}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-danger-button"
                onClick={clearContributions}
                disabled={clearingContributions}
              >

                <span>
                  {clearingContributions
                    ? "Clearing..."
                    : "🗑️ Clear Records"}
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

