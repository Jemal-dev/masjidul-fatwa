import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Reports() {
  const { t, i18n } = useTranslation();

  // ============================================================
  // DATE / NUMBER FORMATTING
  // ============================================================

  const localeMap = {
    en: "en-US",
    om: "om-ET",
    am: "am-ET",
    ar: "ar",
  };

  const currentLocale =
    localeMap[i18n.language] || "en-US";

  const generatedDate = new Date().toLocaleDateString(
    currentLocale
  );

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const dateText = String(value).substring(0, 10);

    const parts = dateText.split("-");

    if (parts.length !== 3) {
      return dateText;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return dateText;
    }

    return date.toLocaleDateString(currentLocale);
  };

  const formatMonth = (value) => {
    if (!value) {
      return "-";
    }

    const parts = String(value).split("-");

    if (parts.length !== 2) {
      return value;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    const date = new Date(year, month - 1, 1);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(currentLocale, {
      year: "numeric",
      month: "long",
    });
  };

  const formatAmount = (value) => {
    const amount = Number(value || 0);

    return amount.toLocaleString(currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // ============================================================
  // WEEKLY REPORT STATES
  // ============================================================

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // MONTHLY REPORT STATES
  // ============================================================

  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [monthlyReport, setMonthlyReport] =
    useState(null);

  const [monthlyLoading, setMonthlyLoading] =
    useState(false);

  const [monthlyError, setMonthlyError] =
    useState("");

  // ============================================================
  // MEMBER REPORT STATES
  // ============================================================

  const [memberList, setMemberList] = useState([]);

  const [selectedMemberId, setSelectedMemberId] =
    useState("");

  const [memberReport, setMemberReport] =
    useState(null);

  const [memberLoading, setMemberLoading] =
    useState(false);

  const [memberError, setMemberError] =
    useState("");

  // ============================================================
  // GET MEMBERS
  // ============================================================

  const getMembers = async () => {
    try {
      setMemberError("");

      const response = await axios.get(
        "/api/members"
      );

      const members =
        response.data.members ||
        response.data.data ||
        response.data;

      const membersArray = Array.isArray(members)
        ? members
        : [];

      setMemberList(membersArray);
    } catch (err) {
      console.error(
        "Get members error:",
        err
      );

      setMemberError(
        err.response?.data?.message ||
          t("reports.errors.loadMembers")
      );
    }
  };

  // ============================================================
  // GET WEEKLY REPORT
  // ============================================================

  const getWeeklyReport = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await axios.get(
        `/api/reports/weekly?date=${reportDate}`
      );

      console.log(
        "Weekly report:",
        response.data
      );

      setReport(response.data);
    } catch (err) {
      console.error(
        "Weekly report error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t("reports.errors.weekly")
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET MONTHLY REPORT
  // ============================================================

  const getMonthlyReport = async () => {
    try {
      setMonthlyLoading(true);
      setMonthlyError("");
      setMonthlyReport(null);

      const [year, month] =
        reportMonth.split("-");

      const response = await axios.get(
        `/api/reports/monthly?year=${year}&month=${month}`
      );

      console.log(
        "Monthly report:",
        response.data
      );

      setMonthlyReport(response.data);
    } catch (err) {
      console.error(
        "Monthly report error:",
        err
      );

      setMonthlyError(
        err.response?.data?.message ||
          t("reports.errors.monthly")
      );
    } finally {
      setMonthlyLoading(false);
    }
  };

  // ============================================================
  // GET MEMBER REPORT
  // ============================================================

  const getMemberReport = async () => {
    if (
      selectedMemberId === "" ||
      selectedMemberId === null ||
      selectedMemberId === undefined
    ) {
      setMemberError(
        t("reports.errors.selectMember")
      );
      return;
    }

    try {
      setMemberLoading(true);
      setMemberError("");
      setMemberReport(null);

      const response = await axios.get(
        `/api/reports/member/${selectedMemberId}`
      );

      console.log(
        "Member report:",
        response.data
      );

      setMemberReport(response.data);
    } catch (err) {
      console.error(
        "Member report error:",
        err
      );

      setMemberError(
        err.response?.data?.message ||
          t("reports.errors.member")
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // ============================================================
  // LOAD MEMBERS ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    getMembers();
  }, []);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="reports-page">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="page-header">
        <div>
          <h1>{t("reports.title")}</h1>

          <p>
            {t("reports.description")}
          </p>
        </div>
      </div>

      {/* ========================================================
          WEEKLY REPORT GENERATOR
      ======================================================== */}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>
              {t("reports.weekly.title")}
            </h2>

            <p>
              {t("reports.weekly.description")}
            </p>
          </div>
        </div>

        <div className="report-filter">
          <div className="form-group">
            <label htmlFor="report-date">
              {t("reports.weekly.date")}
            </label>

            <input
              id="report-date"
              type="date"
              value={reportDate}
              onChange={(e) =>
                setReportDate(e.target.value)
              }
            />
          </div>

          <button
            className="save-button"
            onClick={getWeeklyReport}
            disabled={loading}
          >
            {loading
              ? t("reports.common.loading")
              : t("reports.weekly.generate")}
          </button>
        </div>
      </div>

      {/* ========================================================
          WEEKLY ERROR
      ======================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ========================================================
          WEEKLY REPORT RESULT
      ======================================================== */}

      {report && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>
                {t("reports.weekly.resultTitle")}
              </h2>

              <p>
                {t("reports.common.date")}:{" "}
                {formatDate(report.date)}
              </p>
            </div>

            <button
              className="save-button"
              onClick={() => window.print()}
            >
              {t("reports.common.print")}
            </button>
          </div>

          {/* ====================================================
              WEEKLY PRINT HEADER
          ==================================================== */}

          <div className="print-header">
            <div className="print-mosque-icon">
              {"\u{1F54C}"}
            </div>

            <h2>
              {t("reports.print.systemName")}
            </h2>

            <h3>
              {t("reports.print.weeklyTitle")}
            </h3>

            <p>
              {t("reports.common.date")}:{" "}
              {formatDate(report.date)}
            </p>
          </div>

          {/* ====================================================
              WEEKLY SUMMARY
          ==================================================== */}

          <div className="payment-status">
            {/* Total Members */}

            <div className="status-box">
              <span>{"\u{1F465}"}</span>

              <div>
                <strong>
                  {report.total_members ?? 0}
                </strong>

                <p>
                  {t("reports.weekly.totalMembers")}
                </p>
              </div>
            </div>

            {/* Paid */}

            <div className="status-box paid">
              <span>✓</span>

              <div>
                <strong>
                  {report.paid_count ?? 0}
                </strong>

                <p>
                  {t("reports.weekly.paid")}
                </p>
              </div>
            </div>

            {/* Unpaid */}

            <div className="status-box unpaid">
              <span>!</span>

              <div>
                <strong>
                  {report.unpaid_count ?? 0}
                </strong>

                <p>
                  {t("reports.weekly.unpaid")}
                </p>
              </div>
            </div>

            {/* Total Collection */}

            <div className="status-box">
              <span>{"\u{1F4B0}"}</span>

              <div>
                <strong>
                  {formatAmount(
                    report.total_collection
                  )}{" "}
                  ETB
                </strong>

                <p>
                  {t(
                    "reports.weekly.totalCollection"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              PAID MEMBERS
          ==================================================== */}

          <div className="report-section">
            <h3>
              {t("reports.weekly.paidMembers")}
            </h3>

            {Array.isArray(
              report.paid_members
            ) &&
            report.paid_members.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>
                        {t(
                          "reports.table.member"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.phone"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.amount"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.date"
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.paid_members.map(
                      (member, index) => (
                        <tr
                          key={
                            member.member_id ??
                            index
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {member.full_name ||
                                t(
                                  "reports.common.unknownMember"
                                )}
                            </strong>
                          </td>

                          <td>
                            {member.phone || "-"}
                          </td>

                          <td>
                            {formatAmount(
                              member.amount
                            )}{" "}
                            ETB
                          </td>

                          <td>
                            {formatDate(
                              member.contribution_date
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                {t(
                  "reports.weekly.noPaidMembers"
                )}
              </div>
            )}
          </div>

          {/* ====================================================
              UNPAID MEMBERS
          ==================================================== */}

          <div className="report-section">
            <h3>
              {t("reports.weekly.unpaidMembers")}
            </h3>

            {Array.isArray(
              report.unpaid_members
            ) &&
            report.unpaid_members.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>
                        {t(
                          "reports.table.member"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.phone"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.status"
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.unpaid_members.map(
                      (member, index) => (
                        <tr
                          key={
                            member.member_id ??
                            index
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {member.full_name ||
                                t(
                                  "reports.common.unknownMember"
                                )}
                            </strong>
                          </td>

                          <td>
                            {member.phone || "-"}
                          </td>

                          <td>
                            <span className="status-inactive">
                              !{" "}
                              {t(
                                "reports.weekly.unpaid"
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                {t(
                  "reports.weekly.allPaid"
                )}
              </div>
            )}
          </div>

          {/* ====================================================
              WEEKLY PRINT FOOTER
          ==================================================== */}

          <div className="print-footer">
            <div>
              <strong>
                {t(
                  "reports.print.generatedDate"
                )}
                :
              </strong>{" "}
              {generatedDate}
            </div>

            <div className="print-signatures">
              <div>
                <span>
                  {t(
                    "reports.print.administrator"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.treasurer"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.shababRepresentative"
                  )}
                </span>
                <div className="signature-line" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MONTHLY REPORT GENERATOR
      ======================================================== */}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>
              {t("reports.monthly.title")}
            </h2>

            <p>
              {t(
                "reports.monthly.description"
              )}
            </p>
          </div>
        </div>

        <div className="report-filter">
          <div className="form-group">
            <label htmlFor="report-month">
              {t("reports.monthly.month")}
            </label>

            <input
              id="report-month"
              type="month"
              value={reportMonth}
              onChange={(e) =>
                setReportMonth(e.target.value)
              }
            />
          </div>

          <button
            className="save-button"
            onClick={getMonthlyReport}
            disabled={monthlyLoading}
          >
            {monthlyLoading
              ? t("reports.common.loading")
              : t("reports.monthly.generate")}
          </button>
        </div>
      </div>

      {/* ========================================================
          MONTHLY ERROR
      ======================================================== */}

      {monthlyError && (
        <div className="error-message">
          {monthlyError}
        </div>
      )}

      {/* ========================================================
          MONTHLY REPORT RESULT
      ======================================================== */}

      {monthlyReport && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>
                {t(
                  "reports.monthly.resultTitle"
                )}
              </h2>

              <p>
                {t("reports.common.month")}:{" "}
                {formatMonth(reportMonth)}
              </p>
            </div>

            <button
              className="save-button"
              onClick={() => window.print()}
            >
              {t("reports.common.print")}
            </button>
          </div>

          {/* ====================================================
              MONTHLY PRINT HEADER
          ==================================================== */}

          <div className="print-header">
            <div className="print-mosque-icon">
              {"\u{1F54C}"}
            </div>

            <h2>
              {t("reports.print.systemName")}
            </h2>

            <h3>
              {t("reports.print.monthlyTitle")}
            </h3>

            <p>
              {t("reports.common.month")}:{" "}
              {formatMonth(reportMonth)}
            </p>
          </div>

          {/* ====================================================
              MONTHLY SUMMARY
          ==================================================== */}

          <div className="payment-status">
            {/* Contribution Count */}

            <div className="status-box">
              <span>{"\u{1F4CB}"}</span>

              <div>
                <strong>
                  {monthlyReport.contribution_count ??
                    0}
                </strong>

                <p>
                  {t(
                    "reports.monthly.contributions"
                  )}
                </p>
              </div>
            </div>

            {/* Total Collection */}

            <div className="status-box paid">
              <span>{"\u{1F4B0}"}</span>

              <div>
                <strong>
                  {formatAmount(
                    monthlyReport.total_collection
                  )}{" "}
                  ETB
                </strong>

                <p>
                  {t(
                    "reports.monthly.totalCollection"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              MONTHLY CONTRIBUTION RECORDS
          ==================================================== */}

          <div className="report-section">
            <h3>
              {t(
                "reports.monthly.records"
              )}
            </h3>

            {Array.isArray(
              monthlyReport.contributions
            ) &&
            monthlyReport.contributions.length >
              0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>
                        {t(
                          "reports.table.member"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.amount"
                        )}
                      </th>
                      <th>
                        {t(
                          "reports.table.date"
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyReport.contributions.map(
                      (contribution, index) => (
                        <tr
                          key={
                            contribution.id ??
                            index
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {contribution.full_name ||
                                contribution.member_name ||
                                t(
                                  "reports.common.unknownMember"
                                )}
                            </strong>
                          </td>

                          <td>
                            {formatAmount(
                              contribution.amount
                            )}{" "}
                            ETB
                          </td>

                          <td>
                            {formatDate(
                              contribution.contribution_date
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                {t(
                  "reports.monthly.noRecords"
                )}
              </div>
            )}
          </div>

          {/* ====================================================
              MONTHLY PRINT FOOTER
          ==================================================== */}

          <div className="print-footer">
            <div>
              <strong>
                {t(
                  "reports.print.generatedDate"
                )}
                :
              </strong>{" "}
              {generatedDate}
            </div>

            <div className="print-signatures">
              <div>
                <span>
                  {t(
                    "reports.print.administrator"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.treasurer"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.shababRepresentative"
                  )}
                </span>
                <div className="signature-line" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MEMBER REPORT GENERATOR
      ======================================================== */}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>
              {t("reports.member.title")}
            </h2>

            <p>
              {t(
                "reports.member.description"
              )}
            </p>
          </div>
        </div>

        <div className="report-filter">
          <div className="form-group">
            <label htmlFor="member-report">
              {t(
                "reports.member.selectMember"
              )}
            </label>

            <select
              id="member-report"
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(
                  e.target.value
                );
                setMemberError("");
              }}
            >
              <option value="">
                {t(
                  "reports.member.chooseMember"
                )}
              </option>

              {memberList.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.full_name}
                  {member.phone
                    ? ` - ${member.phone}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            className="save-button"
            onClick={getMemberReport}
            disabled={memberLoading}
          >
            {memberLoading
              ? t("reports.common.loading")
              : t("reports.member.generate")}
          </button>
        </div>
      </div>

      {/* ========================================================
          MEMBER ERROR
      ======================================================== */}

      {memberError && (
        <div className="error-message">
          {memberError}
        </div>
      )}

      {/* ========================================================
          MEMBER REPORT RESULT
      ======================================================== */}

      {memberReport && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>
                {t(
                  "reports.member.resultTitle"
                )}
              </h2>

              <p>
                {t(
                  "reports.member.selected"
                )}
                :{" "}
                {memberReport.member?.full_name ||
                  "-"}
              </p>
            </div>

            <button
              className="save-button"
              onClick={() => window.print()}
            >
              {t("reports.common.print")}
            </button>
          </div>

          {/* ====================================================
              MEMBER PRINT HEADER
          ==================================================== */}

          <div className="print-header">
            <div className="print-mosque-icon">
              {"\u{1F54C}"}
            </div>

            <h2>
              {t("reports.print.systemName")}
            </h2>

            <h3>
              {t("reports.print.memberTitle")}
            </h3>

            <p>
              {memberReport.member?.full_name ||
                "-"}
            </p>
          </div>

          {/* ====================================================
              MEMBER SUMMARY
          ==================================================== */}

          <div className="payment-status">
            <div className="status-box">
              <span>{"\u{1F4CB}"}</span>

              <div>
                <strong>
                  {memberReport.contribution_count ??
                    0}
                </strong>

                <p>
                  {t(
                    "reports.member.contributions"
                  )}
                </p>
              </div>
            </div>

            <div className="status-box paid">
              <span>{"\u{1F4B0}"}</span>

              <div>
                <strong>
                  {formatAmount(
                    memberReport.total_collection
                  )}{" "}
                  ETB
                </strong>

                <p>
                  {t(
                    "reports.member.totalCollection"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================
              MEMBER INFORMATION
          ==================================================== */}

          <div className="report-section">
            <h3>
              {t(
                "reports.member.memberInformation"
              )}
            </h3>

            <div className="table-container">
              <table>
                <tbody>
                  <tr>
                    <th>
                      {t(
                        "reports.member.fullName"
                      )}
                    </th>

                    <td>
                      {memberReport.member
                        ?.full_name || "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {t(
                        "reports.member.phone"
                      )}
                    </th>

                    <td>
                      {memberReport.member
                        ?.phone || "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {t(
                        "reports.member.telegram"
                      )}
                    </th>

                    <td>
                      {memberReport.member
                        ?.telegram_username ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {t(
                        "reports.member.status"
                      )}
                    </th>

                    <td>
                      {memberReport.member
                        ?.status || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ====================================================
              CONTRIBUTION HISTORY
          ==================================================== */}

          <div className="report-section">
            <h3>
              {t(
                "reports.member.history"
              )}
            </h3>

            {Array.isArray(
              memberReport.contributions
            ) &&
            memberReport.contributions.length >
              0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>

                      <th>
                        {t(
                          "reports.table.amount"
                        )}
                      </th>

                      <th>
                        {t(
                          "reports.table.date"
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {memberReport.contributions.map(
                      (contribution, index) => (
                        <tr
                          key={
                            contribution.id ??
                            index
                          }
                        >
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {formatAmount(
                              contribution.amount
                            )}{" "}
                            ETB
                          </td>

                          <td>
                            {formatDate(
                              contribution.contribution_date
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                {t(
                  "reports.member.noHistory"
                )}
              </div>
            )}
          </div>

          {/* ====================================================
              MEMBER PRINT FOOTER
          ==================================================== */}

          <div className="print-footer">
            <div>
              <strong>
                {t(
                  "reports.print.generatedDate"
                )}
                :
              </strong>{" "}
              {generatedDate}
            </div>

            <div className="print-signatures">
              <div>
                <span>
                  {t(
                    "reports.print.administrator"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.treasurer"
                  )}
                </span>
                <div className="signature-line" />
              </div>

              <div>
                <span>
                  {t(
                    "reports.print.shababRepresentative"
                  )}
                </span>
                <div className="signature-line" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;