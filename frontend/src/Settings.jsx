import { useEffect, useState } from "react";
import axios from "axios";

function Settings() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get current contribution amount
  const getSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/settings/contribution-amount"
      );

      setAmount(response.data.amount);

    } catch (err) {
      console.error("Settings error:", err);

      setError("Failed to load settings.");

    } finally {
      setLoading(false);
    }
  };

  // Update contribution amount
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        setError(
          "Contribution amount must be greater than 0."
        );
        return;
      }

      await axios.put(
        "/api/settings/contribution-amount",
        {
          amount: numericAmount,
        }
      );

      setSuccess(
        "Weekly contribution amount updated successfully."
      );

    } catch (err) {
      console.error("Update settings error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to update contribution amount."
      );

    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage system settings
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Contribution Settings */}
      <div className="section-card">

        <div className="section-header">
          <div>
            <h2>
              Weekly Contribution
            </h2>

            <p>
              Set the amount members should contribute
              every Friday.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>

          <div className="form-group">

            <label>
              Weekly Contribution Amount
            </label>

            <div className="amount-input">

              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <span>ETB</span>

            </div>

          </div>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Settings;