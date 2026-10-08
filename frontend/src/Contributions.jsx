import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function getLocalDateString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Contributions() {
  const { t } = useTranslation();

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
    contribution_date: getLocalDateString(),
  });

  // ==========================================
  // GET ACTIVE MEMBERS
  // ==========================================

  const getMembers = async () => {
    try {
      const response = await axios.get("/api/members");

      const allMembers = response.data.data || response.data;

      const activeMembers = Array.isArray(allMembers)
        ? allMembers.filter(
            (member) => member.status === "active"
          )
        : [];

      setMembers(activeMembers);
    } catch (err) {
      console.error("Members error:", err);

      setError(t("contributions.errors.loadMembers"));
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

      const data = response.data.data || response.data;

      setContributions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Contributions error:", err);

      setError(
        t("contributions.errors.loadContributions")
      );
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

      const amount = Number(response.data.amount);

      if (amount > 0) {
        setContributionAmount(amount);

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
        t("contributions.errors.loadAmount")
      );
    }
  };

  // ==========================================
  // GET PAYMENT STATUS
  // ==========================================

  const getPaymentStatus = async () => {
    if (!formData.contribution_date) {
      return;
    }

    try {
      setStatusLoading(true);

      const response = await axios.get(
        `/api/reports/weekly?date=${formData.contribution_date}`
      );

      setPaidMembers(
        Array.isArray(response.data.paid_members)
          ? response.data.paid_members
          : []
      );

      setUnpaidMembers(
        Array.isArray(response.data.unpaid_members)
          ? response.data.unpaid_members
          : []
      );
    } catch (err) {
      console.error(
        "Payment status error:",
        err
      );

      setError(
        t("contributions.errors.loadStatus")
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // ==========================================
  // RECORD PAYMENT FOR UNPAID MEMBER
  // ==========================================

  const recordForMember = async (member) => {
    const memberId = Number(
      member.member_id ?? member.id
    );

    if (!memberId) {
      setError(
        t("contributions.errors.invalidMember")
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axios.post(
        "/api/contributions",
        {
          member_id: memberId,
          amount: Number(contributionAmount),
          contribution_date:
            formData.contribution_date,
        }
      );

      setSuccess(
        t("contributions.messages.memberRecorded", {
          name: member.full_name,
        })
      );

      await getContributions();
      await getPaymentStatus();
    } catch (err) {
      console.error(
        "Record contribution error:",
        err
      );

      if (err.response) {
        const message =
          err.response.data?.message || "";

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("duplicate") ||
          lowerMessage.includes("unique")
        ) {
          setError(
            t("contributions.errors.duplicateMember", {
              name: member.full_name,
            })
          );
        } else {
          setError(
            message ||
              t(
                "contributions.errors.recordContribution"
              )
          );
        }
      } else if (err.request) {
        setError(
          t("contributions.errors.connection")
        );
      } else {
        setError(
          t("contributions.errors.unexpected", {
            message: err.message,
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOAD INITIAL DATA
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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      setError(
        t("contributions.errors.selectMember")
      );
      return;
    }

    // Validate amount
    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError(
        t("contributions.errors.invalidAmount")
      );
      return;
    }

    // Validate date
    if (!formData.contribution_date) {
      setError(
        t("contributions.errors.selectDate")
      );
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
        t("contributions.messages.recorded")
      );

      setFormData((previous) => ({
        ...previous,
        member_id: "",
      }));

      await getContributions();
      await getPaymentStatus();
    } catch (err) {
      console.error(
        "Contribution error:",
        err
      );

      if (err.response) {
        const message =
          err.response.data?.message || "";

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("duplicate") ||
          lowerMessage.includes("unique")
        ) {
          setError(
            t("contributions.errors.duplicate")
          );
        } else {
          setError(
            message ||
              t(
                "contributions.errors.recordContribution"
              )
          );
        }
      } else if (err.request) {
        setError(
          t("contributions.errors.connection")
        );
      } else {
        setError(
          t("contributions.errors.unexpected", {
            message: err.message,
          })
        );
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
          <h1>
            {t("contributions.title")}
          </h1>

          <p>
            {t("contributions.description")}
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
              {t("contributions.form.title")}
            </h2>

            <p>
              {t("contributions.form.weeklyAmount")}{" "}
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
              {t("contributions.form.member")}
            </label>

            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
            >
              <option value="">
                {t(
                  "contributions.form.selectMember"
                )}
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
              {t("contributions.form.amount")}
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
              {t("contributions.form.date")}
            </label>

            <input
              type="date"
              name="contribution_date"
              value={formData.contribution_date}
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
                ? t(
                    "contributions.form.saving"
                  )
                : t(
                    "contributions.form.record"
                  )}
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
              {t(
                "contributions.status.title"
              )}
            </h2>

            <p>
              {t(
                "contributions.status.description"
              )}{" "}
              {formData.contribution_date}
            </p>
          </div>

          <button
            type="button"
            className="save-button"
            onClick={getPaymentStatus}
            disabled={statusLoading}
          >
            {statusLoading
              ? t(
                  "contributions.status.loading"
                )
              : t(
                  "contributions.status.refresh"
                )}
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

              <p>
                {t(
                  "contributions.status.paid"
                )}
              </p>
            </div>
          </div>

          <div className="status-box unpaid">
            <span>!</span>

            <div>
              <strong>
                {unpaidMembers.length}
              </strong>

              <p>
                {t(
                  "contributions.status.unpaid"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Members Table */}
        {statusLoading ? (
          <div className="loading">
            {t(
              "contributions.status.loadingMembers"
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    {t(
                      "contributions.status.table.member"
                    )}
                  </th>
                  <th>
                    {t(
                      "contributions.status.table.phone"
                    )}
                  </th>
                  <th>
                    {t(
                      "contributions.status.table.status"
                    )}
                  </th>
                  <th>
                    {t(
                      "contributions.status.table.action"
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Paid Members */}
                {paidMembers.map(
                  (member, index) => (
                    <tr
                      key={`paid-${
                        member.member_id ??
                        member.id ??
                        index
                      }`}
                    >
                      <td>{index + 1}</td>

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
                          ✓{" "}
                          {t(
                            "contributions.status.paid"
                          )}
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
                      key={`unpaid-${
                        member.member_id ??
                        member.id ??
                        index
                      }`}
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
                          !{" "}
                          {t(
                            "contributions.status.unpaid"
                          )}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="record-button"
                          onClick={() =>
                            recordForMember(
                              member
                            )
                          }
                          disabled={saving}
                        >
                          {saving
                            ? t(
                                "contributions.status.recording"
                              )
                            : t(
                                "contributions.status.recordAmount",
                                {
                                  amount:
                                    contributionAmount,
                                }
                              )}
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {/* No members */}
                {paidMembers.length === 0 &&
                  unpaidMembers.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty">
                          {t(
                            "contributions.status.noMembers"
                          )}
                        </div>
                      </td>
                    </tr>
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
              {t(
                "contributions.recent.title"
              )}
            </h2>
          </div>

          <span>
            {t(
              "contributions.recent.count",
              {
                count: contributions.length,
              }
            )}
          </span>
        </div>

        {loading ? (
          <div className="loading">
            {t(
              "contributions.recent.loading"
            )}
          </div>
        ) : contributions.length === 0 ? (
          <div className="empty">
            {t(
              "contributions.recent.empty"
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>
                    {t(
                      "contributions.recent.table.member"
                    )}
                  </th>

                  <th>
                    {t(
                      "contributions.recent.table.amount"
                    )}
                  </th>

                  <th>
                    {t(
                      "contributions.recent.table.date"
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {contributions.map(
                  (contribution, index) => (
                    <tr
                      key={
                        contribution.id ??
                        `${contribution.member_id}-${index}`
                      }
                    >
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {contribution.full_name ||
                            contribution.member_name ||
                            t(
                              "contributions.recent.memberFallback",
                              {
                                id: contribution.member_id,
                              }
                            )}
                        </strong>
                      </td>

                      <td>
                        {contribution.amount} ETB
                      </td>

                      <td>
                        {String(
                          contribution.contribution_date ||
                            ""
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