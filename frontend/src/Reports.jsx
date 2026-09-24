import { useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  // ==================================================
  // PRINT INFORMATION
  // ==================================================

  const generatedDate = new Date().toLocaleDateString("en-GB");

  // ==================================================
  // WEEKLY REPORT STATES
  // ==================================================

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // MONTHLY REPORT STATES
  // ==================================================

  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState("");

  // ==================================================
  // MEMBER REPORT STATES
  // ==================================================

  const [memberList, setMemberList] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberReport, setMemberReport] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  // ==================================================
  // GET MEMBERS
  // ==================================================

  const getMembers = async () => {
    try {
      setMemberError("");

      const response = await axios.get("/api/members");

      console.log("Members API response:", response.data);

      const members =
        response.data.members ||
        response.data.data ||
        response.data;

      const membersArray = Array.isArray(members)
        ? members
        : [];

      console.log("Members loaded:", membersArray);

      setMemberList(membersArray);
    } catch (err) {
      console.error("Failed to load members:", err);

      setMemberError(
        err.response?.data?.message ||
          "Failed to load members."
      );
    }
  };

  // ==================================================
  // GET WEEKLY REPORT
  // ==================================================

  const getWeeklyReport = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await axios.get(
        `/api/reports/weekly?date=${reportDate}`
      );

      console.log("Weekly report:", response.data);

      setReport(response.data);
    } catch (err) {
      console.error("Weekly report error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load weekly report."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // GET MONTHLY REPORT
  // ==================================================

  const getMonthlyReport = async () => {
    try {
      setMonthlyLoading(true);
      setMonthlyError("");
      setMonthlyReport(null);

      const [year, month] = reportMonth.split("-");

      const response = await axios.get(
        `/api/reports/monthly?year=${year}&month=${month}`
      );

      console.log("Monthly report:", response.data);

      setMonthlyReport(response.data);
    } catch (err) {
      console.error(
        "Monthly report error:",
        err
      );

      setMonthlyError(
        err.response?.data?.message ||
          "Failed to load monthly report."
      );
    } finally {
      setMonthlyLoading(false);
    }
  };

  // ==================================================
  // GET MEMBER REPORT
  // ==================================================

  const getMemberReport = async () => {
    console.log(
      "Selected member ID:",
      selectedMemberId
    );

    if (
      selectedMemberId === "" ||
      selectedMemberId === null ||
      selectedMemberId === undefined
    ) {
      setMemberError("Please select a member.");
      return;
    }

    try {
      setMemberLoading(true);
      setMemberError("");
      setMemberReport(null);

      console.log(
        "Requesting member report for ID:",
        selectedMemberId
      );

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
          "Failed to load member report."
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // ==================================================
  // LOAD MEMBERS WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    getMembers();
  }, []);

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="reports-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header">
        <div>
          <h1>Reports</h1>

          <p>
            View and manage Shabab contribution
            reports.
          </p>
        </div>
      </div>

      {/* ==================================================
          WEEKLY REPORT GENERATOR
      ================================================== */}

      <div className="section-card">

        <div className="section-header">
          <div>
            <h2>
              Weekly Contribution Report
            </h2>

            <p>
              Select a date to view the payment
              status.
            </p>
          </div>
        </div>

        <div className="report-filter">

          <div className="form-group">

            <label>
              Report Date
            </label>

            <input
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
              ? "Loading..."
              : "Generate Report"}
          </button>

        </div>

      </div>

      {/* ==================================================
          WEEKLY ERROR
      ================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ==================================================
          WEEKLY REPORT RESULT
      ================================================== */}

      {report && (

        <div className="section-card">

          {/* PRINT HEADER */}

          <div className="print-report-header">

            <div className="print-logo">
              🕌
            </div>

            <h1>
              MASJIDUL-FATWA SHABAB
            </h1>

            <h2>
              Contribution Management System
            </h2>

            <div className="print-divider"></div>

            <h3>
              WEEKLY CONTRIBUTION REPORT
            </h3>

            <p>
              Contribution Date:{" "}
              <strong>
                {report.date}
              </strong>
            </p>

          </div>

          {/* REPORT HEADER */}

          <div className="section-header">

            <div>

              <h2>
                Weekly Report
              </h2>

              <p>
                Date: {report.date}
              </p>

            </div>

            <button
              className="save-button"
              onClick={() =>
                window.print()
              }
            >
              Print Report
            </button>

          </div>

          {/* SUMMARY */}

          <div className="payment-status">

            <div className="status-box">

              <span>👥</span>

              <div>

                <strong>
                  {report.total_members}
                </strong>

                <p>
                  Total Members
                </p>

              </div>

            </div>

            <div className="status-box paid">

              <span>✓</span>

              <div>

                <strong>
                  {report.paid_count}
                </strong>

                <p>
                  Paid
                </p>

              </div>

            </div>

            <div className="status-box unpaid">

              <span>!</span>

              <div>

                <strong>
                  {report.unpaid_count}
                </strong>

                <p>
                  Unpaid
                </p>

              </div>

            </div>

            <div className="status-box">

              <span>💰</span>

              <div>

                <strong>
                  {report.total_collection} ETB
                </strong>

                <p>
                  Total Collection
                </p>

              </div>

            </div>

          </div>

          {/* PAID MEMBERS */}

          <div className="report-section">

            <h3>
              Paid Members
            </h3>

            {report.paid_members &&
            report.paid_members.length > 0 ? (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Member</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>

                  </thead>

                  <tbody>

                    {report.paid_members.map(
                      (member, index) => (

                        <tr
                          key={
                            member.member_id ||
                            member.id ||
                            index
                          }
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
                            {member.amount} ETB
                          </td>

                          <td>
                            {String(
                              member.contribution_date
                            ).substring(0, 10)}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty">
                No paid members found.
              </div>

            )}

          </div>

          {/* UNPAID MEMBERS */}

          <div className="report-section">

            <h3>
              Unpaid Members
            </h3>

            {report.unpaid_members &&
            report.unpaid_members.length > 0 ? (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Member</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {report.unpaid_members.map(
                      (member, index) => (

                        <tr
                          key={
                            member.member_id ||
                            member.id ||
                            index
                          }
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
                            <span className="status-inactive">
                              ! Unpaid
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
                All members have paid.
              </div>

            )}

          </div>

          {/* PRINT FOOTER */}

          <div className="print-footer">

            <p>
              Generated on:{" "}
              <strong>
                {generatedDate}
              </strong>
            </p>

            <div className="print-signatures">

              <div className="signature-box">

                <div className="signature-line">
                  Administrator
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Treasurer
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Shabab Representative
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          MONTHLY REPORT
      ================================================== */}

      <div className="section-card">

        <div className="section-header">

          <div>

            <h2>
              Monthly Contribution Report
            </h2>

            <p>
              View contribution records for a
              selected month.
            </p>

          </div>

        </div>

        <div className="report-filter">

          <div className="form-group">

            <label>
              Report Month
            </label>

            <input
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
              ? "Loading..."
              : "Generate Monthly Report"}
          </button>

        </div>

      </div>

      {/* ==================================================
          MONTHLY ERROR
      ================================================== */}

      {monthlyError && (
        <div className="error-message">
          {monthlyError}
        </div>
      )}

      {/* ==================================================
          MONTHLY REPORT RESULT
      ================================================== */}

      {monthlyReport && (

        <div className="section-card">

          {/* PRINT HEADER */}

          <div className="print-report-header">

            <div className="print-logo">
              🕌
            </div>

            <h1>
              MASJIDUL-FATWA SHABAB
            </h1>

            <h2>
              Contribution Management System
            </h2>

            <div className="print-divider"></div>

            <h3>
              MONTHLY CONTRIBUTION REPORT
            </h3>

            <p>
              Report Month:{" "}
              <strong>
                {reportMonth}
              </strong>
            </p>

          </div>

          {/* REPORT HEADER */}

          <div className="section-header">

            <div>

              <h2>
                Monthly Report
              </h2>

              <p>
                Month: {reportMonth}
              </p>

            </div>

            <button
              className="save-button"
              onClick={() =>
                window.print()
              }
            >
              Print Report
            </button>

          </div>

          {/* SUMMARY */}

          <div className="payment-status">

            <div className="status-box">

              <span>📋</span>

              <div>

                <strong>
                  {
                    monthlyReport.total_contributions
                  }
                </strong>

                <p>
                  Contributions
                </p>

              </div>

            </div>

            <div className="status-box paid">

              <span>💰</span>

              <div>

                <strong>
                  {monthlyReport.total_amount} ETB
                </strong>

                <p>
                  Total Collection
                </p>

              </div>

            </div>

          </div>

          {/* CONTRIBUTION RECORDS */}

          <div className="report-section">

            <h3>
              Contribution Records
            </h3>

            {monthlyReport.contributions &&
            monthlyReport.contributions.length > 0 ? (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Member</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>

                  </thead>

                  <tbody>

                    {monthlyReport.contributions.map(
                      (contribution, index) => (

                        <tr
                          key={
                            contribution.id ||
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

            ) : (

              <div className="empty">
                No contributions found for this
                month.
              </div>

            )}

          </div>

          {/* PRINT FOOTER */}

          <div className="print-footer">

            <p>
              Generated on:{" "}
              <strong>
                {generatedDate}
              </strong>
            </p>

            <div className="print-signatures">

              <div className="signature-box">

                <div className="signature-line">
                  Administrator
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Treasurer
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Shabab Representative
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          MEMBER REPORT
      ================================================== */}

      <div className="section-card">

        <div className="section-header">

          <div>

            <h2>
              Member Report
            </h2>

            <p>
              View the contribution history of
              a specific member.
            </p>

          </div>

        </div>

        {/* MEMBER SELECTION */}

        <div className="report-filter">

          <div className="form-group">

            <label>
              Select Member
            </label>

            <select
              value={selectedMemberId}
              onChange={(e) => {

                const memberId =
                  e.target.value;

                console.log(
                  "Member selected:",
                  memberId
                );

                setSelectedMemberId(
                  memberId
                );

                setMemberReport(null);
                setMemberError("");
              }}
            >

              <option value="">
                Select a member
              </option>

              {memberList.map((member) => {

                const memberId =
                  member.id ??
                  member.member_id;

                const memberName =
                  member.full_name ??
                  member.name ??
                  member.member_name ??
                  `Member #${memberId}`;

                return (
                  <option
                    key={memberId}
                    value={String(memberId)}
                  >
                    {memberName}
                  </option>
                );
              })}

            </select>

          </div>

          <button
            className="save-button"
            onClick={getMemberReport}
            disabled={memberLoading}
          >
            {memberLoading
              ? "Loading..."
              : "Generate Member Report"}
          </button>

        </div>

      </div>

      {/* ==================================================
          MEMBER REPORT ERROR
      ================================================== */}

      {memberError && (
        <div className="error-message">
          {memberError}
        </div>
      )}

      {/* ==================================================
          MEMBER REPORT RESULT
      ================================================== */}

      {memberReport && (

        <div className="section-card">

          {/* PRINT HEADER */}

          <div className="print-report-header">

            <div className="print-logo">
              🕌
            </div>

            <h1>
              MASJIDUL-FATWA SHABAB
            </h1>

            <h2>
              Contribution Management System
            </h2>

            <div className="print-divider"></div>

            <h3>
              MEMBER CONTRIBUTION REPORT
            </h3>

            <p>
              Member:{" "}
              <strong>
                {memberReport.member?.full_name ||
                  memberReport.full_name ||
                  "Member"}
              </strong>
            </p>

          </div>

          {/* REPORT HEADER */}

          <div className="section-header">

            <div>

              <h2>
                Member Report
              </h2>

              <p>
                {memberReport.member?.full_name ||
                  memberReport.full_name ||
                  "Member"}
              </p>

            </div>

            <button
              className="save-button"
              onClick={() =>
                window.print()
              }
            >
              Print Report
            </button>

          </div>

          {/* SUMMARY */}

          <div className="payment-status">

            <div className="status-box">

              <span>👤</span>

              <div>

                <strong>
                  {memberReport.member?.full_name ||
                    memberReport.full_name ||
                    "Member"}
                </strong>

                <p>
                  Member
                </p>

              </div>

            </div>

            <div className="status-box">

              <span>📋</span>

              <div>

                <strong>
                  {memberReport.total_contributions ??
                    memberReport.totalContributions ??
                    0}
                </strong>

                <p>
                  Total Contributions
                </p>

              </div>

            </div>

            <div className="status-box paid">

              <span>💰</span>

              <div>

                <strong>
                  {memberReport.total_amount ??
                    memberReport.totalAmount ??
                    0} ETB
                </strong>

                <p>
                  Total Amount
                </p>

              </div>

            </div>

          </div>

          {/* MEMBER INFORMATION */}

          <div className="report-section">

            <h3>
              Member Information
            </h3>

            <div className="table-container">

              <table>

                <tbody>

                  <tr>

                    <th>
                      Full Name
                    </th>

                    <td>
                      {memberReport.member?.full_name ||
                        memberReport.full_name ||
                        "-"}
                    </td>

                  </tr>

                  <tr>

                    <th>
                      Phone
                    </th>

                    <td>
                      {memberReport.member?.phone ||
                        memberReport.phone ||
                        "-"}
                    </td>

                  </tr>

                  <tr>

                    <th>
                      Telegram
                    </th>

                    <td>
                      {memberReport.member
                        ?.telegram_username ||
                        memberReport.telegram_username ||
                        "-"}
                    </td>

                  </tr>

                  <tr>

                    <th>
                      Status
                    </th>

                    <td>
                      {memberReport.member?.status ||
                        memberReport.status ||
                        "active"}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          {/* CONTRIBUTION HISTORY */}

          <div className="report-section">

            <h3>
              Contribution History
            </h3>

            {(
              memberReport.contributions ||
              memberReport.history ||
              []
            ).length > 0 ? (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>

                  </thead>

                  <tbody>

                    {(
                      memberReport.contributions ||
                      memberReport.history ||
                      []
                    ).map(
                      (contribution, index) => (

                        <tr
                          key={
                            contribution.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {String(
                              contribution.contribution_date ||
                                contribution.date ||
                                ""
                            ).substring(0, 10)}
                          </td>

                          <td>
                            {contribution.amount} ETB
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty">
                No contribution records found
                for this member.
              </div>

            )}

          </div>

          {/* PRINT FOOTER */}

          <div className="print-footer">

            <p>
              Generated on:{" "}
              <strong>
                {generatedDate}
              </strong>
            </p>

            <div className="print-signatures">

              <div className="signature-box">

                <div className="signature-line">
                  Administrator
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Treasurer
                </div>

              </div>

              <div className="signature-box">

                <div className="signature-line">
                  Shabab Representative
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Reports;