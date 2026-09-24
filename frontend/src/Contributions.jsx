import { useEffect, useState } from "react";
import axios from "axios";

function Contributions() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);

  // Weekly contribution amount from Settings
  const [contributionAmount, setContributionAmount] = useState(20);

  const [paidMembers, setPaidMembers] = useState([]);
  const [unpaidMembers, setUnpaidMembers] = useState([]);

  const [statusLoading, setStatusLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    member_id: "",
    amount: "20",
    contribution_date: new Date()
      .toISOString()
      .split("T")[0],
  });

  // ==========================================
  // GET ACTIVE MEMBERS
  // ==========================================

  const getMembers = async () => {
    try {
      const response = await axios.get("/api/members");

      console.log("Members from backend:", response.data);

      const allMembers =
        response.data.data || response.data;

      const activeMembers = allMembers.filter(
        (member) => member.status === "active"
      );

      console.log("Active members:", activeMembers);

      setMembers(activeMembers);
    } catch (err) {
      console.error("Members error:", err);

      setError("Failed to load members.");
    }
  };

  // ==========================================
  // GET CONTRIBUTIONS
  // ==========================================

  const getContributions = async () => {
    try {
      const response = await axios.get(
        "/api/contributions"
      );

      setContributions(
        response.data.data || response.data
      );
    } catch (err) {
      console.error(
        "Contributions error:",
        err
      );

      setError("Failed to load contributions.");
    }
  };

  // ==========================================
  // GET WEEKLY CONTRIBUTION AMOUNT
  // ==========================================

  const getContributionAmount = async () => {
    try {
      const response = await axios.get(
        "/api/settings/contribution-amount"
      );

      console.log(
        "Contribution amount from backend:",
        response.data
      );

      const amount = Number(response.data.amount);

      if (amount > 0) {
        setContributionAmount(amount);

        // Also update the normal form amount
        setFormData((previous) => ({
          ...previous,
          amount: String(amount),
        }));
      }
    } catch (err) {
      console.error(
        "Contribution amount error:",
        err
      );

      setError(
        "Failed to load contribution amount."
      );
    }
  };

  // ==========================================
  // GET PAYMENT STATUS
  // ==========================================

  const getPaymentStatus = async () => {
    try {
      setStatusLoading(true);
      setError("");

      const response = await axios.get(
        `/api/reports/weekly?date=${formData.contribution_date}`
      );

      console.log(
        "Weekly payment status:",
        response.data
      );

      setPaidMembers(
        response.data.paid_members || []
      );

      setUnpaidMembers(
        response.data.unpaid_members || []
      );
    } catch (err) {
      console.error(
        "Payment status error:",
        err
      );

      setError(
        "Failed to load payment status."
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // ==========================================
  // RECORD PAYMENT FOR UNPAID MEMBER
  // ==========================================

  const recordForMember = async (member) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axios.post(
        "/api/contributions",
        {
          member_id: Number(member.member_id),
          amount: Number(contributionAmount),
          contribution_date:
            formData.contribution_date,
        }
      );

      setSuccess(
        `${member.full_name} has been recorded as paid.`
      );

      // Refresh contributions
      await getContributions();

      // Refresh paid/unpaid status
      await getPaymentStatus();
    } catch (err) {
      console.error(
        "Record contribution error:",
        err
      );

      if (err.response) {
        const message =
          err.response.data?.message || "";

        if (
          message
            .toLowerCase()
            .includes("duplicate") ||
          message
            .toLowerCase()
            .includes("unique")
        ) {
          setError(
            `${member.full_name} has already paid for this date.`
          );
        } else {
          setError(
            message ||
              "Failed to record contribution."
          );
        }
      } else {
        setError(
          "Could not connect to the server."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        getMembers(),
        getContributions(),
        getContributionAmount(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================================
  // LOAD PAYMENT STATUS WHEN DATE CHANGES
  // ==========================================

  useEffect(() => {
    if (formData.contribution_date) {
      getPaymentStatus();
    }
  }, [formData.contribution_date]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==========================================
  // SAVE CONTRIBUTION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Validate member
    if (!formData.member_id) {
      setError("Please select a member.");
      return;
    }

    // Validate amount
    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    // Validate date
    if (!formData.contribution_date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        "/api/contributions",
        {
          member_id: Number(formData.member_id),
          amount: Number(formData.amount),
          contribution_date:
            formData.contribution_date,
        }
      );

      setSuccess(
        "Contribution recorded successfully."
      );

      // Reset selected member
      setFormData((previous) => ({
        ...previous,
        member_id: "",
      }));

      // Refresh contributions
      await getContributions();

      // Refresh payment status
      await getPaymentStatus();
    } catch (err) {
      console.error(
        "Contribution error:",
        err
      );

      if (err.response) {
        const message =
          err.response.data?.message || "";

        if (
          message
            .toLowerCase()
            .includes("duplicate") ||
          message
            .toLowerCase()
            .includes("unique")
        ) {
          setError(
            "This member has already made a contribution for this date."
          );
        } else {
          setError(
            message ||
              `Server error: ${err.response.status}`
          );
        }
      } else if (err.request) {
        setError(
          "Cannot connect to the backend server."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="contributions-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Contributions</h1>

          <p>
            Record and manage weekly Shabab
            contributions.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ======================================
          CONTRIBUTION FORM
      ====================================== */}

      <div className="section-card">

        <div className="section-header">

          <div>
            <h2>
              Record Contribution
            </h2>

            <p>
              Weekly contribution amount:{" "}
              <strong>
                {contributionAmount} ETB
              </strong>
            </p>
          </div>

        </div>

        <form
          className="contribution-form"
          onSubmit={handleSubmit}
        >

          {/* Member */}
          <div className="form-group">

            <label>
              Member
            </label>

            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
            >

              <option value="">
                Select member
              </option>

              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.full_name}
                </option>
              ))}

            </select>

          </div>

          {/* Amount */}
          <div className="form-group">

            <label>
              Amount (ETB)
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
            />

          </div>

          {/* Date */}
          <div className="form-group">

            <label>
              Contribution Date
            </label>

            <input
              type="date"
              name="contribution_date"
              value={
                formData.contribution_date
              }
              onChange={handleChange}
            />

          </div>

          {/* Submit */}
          <div className="form-submit">

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Record Contribution"}
            </button>

          </div>

        </form>

      </div>

      {/* ======================================
          FRIDAY PAYMENT STATUS
      ====================================== */}

      <div className="section-card">

        <div className="section-header">

          <div>

            <h2>
              Friday Payment Status
            </h2>

            <p>
              Payment status for{" "}
              {formData.contribution_date}
            </p>

          </div>

          <button
            className="save-button"
            onClick={getPaymentStatus}
            disabled={statusLoading}
          >
            {statusLoading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* Summary */}
        <div className="payment-status">

          <div className="status-box paid">

            <span>✓</span>

            <div>

              <strong>
                {paidMembers.length}
              </strong>

              <p>Paid</p>

            </div>

          </div>

          <div className="status-box unpaid">

            <span>!</span>

            <div>

              <strong>
                {unpaidMembers.length}
              </strong>

              <p>Unpaid</p>

            </div>

          </div>

        </div>

        {/* Members Table */}
        {statusLoading ? (

          <div className="loading">
            Loading payment status...
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {/* Paid Members */}
                {paidMembers.map(
                  (member, index) => (

                    <tr
                      key={`paid-${member.member_id}`}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {member.full_name}
                        </strong>
                      </td>

                      <td>
                        {member.phone || "-"}
                      </td>

                      <td>
                        <span className="status-active">
                          ✓ Paid
                        </span>
                      </td>

                      <td>
                        {member.amount} ETB
                      </td>

                    </tr>
                  )
                )}

                {/* Unpaid Members */}
                {unpaidMembers.map(
                  (member, index) => (

                    <tr
                      key={`unpaid-${member.member_id}`}
                    >

                      <td>
                        {paidMembers.length +
                          index +
                          1}
                      </td>

                      <td>
                        <strong>
                          {member.full_name}
                        </strong>
                      </td>

                      <td>
                        {member.phone || "-"}
                      </td>

                      <td>
                        <span className="status-inactive">
                          ! Unpaid
                        </span>
                      </td>

                      <td>

                        <button
                          type="button"
                          className="record-button"
                          onClick={() =>
                            recordForMember(member)
                          }
                          disabled={saving}
                        >
                          {saving
                            ? "Recording..."
                            : `Record ${contributionAmount} ETB`}
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================
          RECENT CONTRIBUTIONS
      ====================================== */}

      <div className="members-card">

        <div className="members-card-header">

          <div>
            <h2>
              Recent Contributions
            </h2>
          </div>

          <span>
            {contributions.length} records
          </span>

        </div>

        {loading ? (

          <div className="loading">
            Loading contributions...
          </div>

        ) : contributions.length === 0 ? (

          <div className="empty">
            No contributions found.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Member
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {contributions.map(
                  (contribution, index) => (

                    <tr
                      key={contribution.id}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {contribution.full_name ||
                            contribution.member_name ||
                            `Member #${contribution.member_id}`}
                        </strong>
                      </td>

                      <td>
                        {contribution.amount} ETB
                      </td>

                      <td>
                        {String(
                          contribution.contribution_date
                        ).substring(0, 10)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Contributions;