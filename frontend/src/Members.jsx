
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Members() {
  const { t } = useTranslation();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortOption, setSortOption] =
    useState("name-asc");

  // Add/Edit form visibility
  const [showForm, setShowForm] = useState(false);

  // Current member being edited
  const [editingMember, setEditingMember] =
    useState(null);

  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    telegram_username: "",
  });

  const [saving, setSaving] = useState(false);

  // ============================================================
  // GET MEMBERS
  // ============================================================

  const getMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/members"
      );

      const data =
        response.data?.data ||
        response.data?.members ||
        response.data;

      setMembers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Members error:",
        err
      );

      if (err.response) {
        setError(
          t(
            "members.errors.server",
            {
              status:
                err.response.status,
              statusText:
                err.response.statusText,
            }
          )
        );
      } else if (err.request) {
        setError(
          t(
            "members.errors.connection"
          )
        );
      } else {
        setError(
          t(
            "members.errors.unexpected",
            {
              message:
                err.message,
            }
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD MEMBERS ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    getMembers();
  }, []);

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ============================================================
  // OPEN ADD MEMBER FORM
  // ============================================================

  const openAddForm = () => {
    setEditingMember(null);

    setFormData({
      full_name: "",
      phone: "",
      telegram_username: "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // ============================================================
  // OPEN EDIT MEMBER FORM
  // ============================================================

  const openEditForm = (member) => {
    setEditingMember(member);

    setFormData({
      full_name:
        member.full_name || "",
      phone:
        member.phone || "",
      telegram_username:
        member.telegram_username || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // ============================================================
  // SAVE MEMBER
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName =
      formData.full_name.trim();

    if (!fullName) {
      setError(
        t(
          "members.errors.fullNameRequired"
        )
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // --------------------------------------------------------
      // UPDATE MEMBER
      // --------------------------------------------------------

      if (editingMember) {
        await axios.put(
          `/api/members/${editingMember.id}`,
          {
            full_name:
              fullName,

            phone:
              formData.phone.trim(),

            telegram_username:
              formData.telegram_username.trim(),
          }
        );

        setSuccess(
          t(
            "members.messages.updated"
          )
        );
      }

      // --------------------------------------------------------
      // ADD MEMBER
      // --------------------------------------------------------

      else {
        await axios.post(
          "/api/members",
          {
            full_name:
              fullName,

            phone:
              formData.phone.trim(),

            telegram_username:
              formData.telegram_username.trim(),
          }
        );

        setSuccess(
          t(
            "members.messages.added"
          )
        );
      }

      // Reset form
      setFormData({
        full_name: "",
        phone: "",
        telegram_username: "",
      });

      setEditingMember(null);
      setShowForm(false);

      // Reload members
      await getMembers();
    } catch (err) {
      console.error(
        "Save member error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            t(
              "members.errors.server",
              {
                status:
                  err.response.status,
                statusText:
                  err.response.statusText,
              }
            )
        );
      } else if (err.request) {
        setError(
          t(
            "members.errors.connection"
          )
        );
      } else {
        setError(
          t(
            "members.errors.unexpected",
            {
              message:
                err.message,
            }
          )
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL FORM
  // ============================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);

    setFormData({
      full_name: "",
      phone: "",
      telegram_username: "",
    });

    setError("");
    setSuccess("");
  };

  // ============================================================
  // CHANGE MEMBER STATUS
  // ============================================================

  const toggleMemberStatus = async (
    member
  ) => {
    const newStatus =
      member.status === "active"
        ? "inactive"
        : "active";

    const confirmed =
      window.confirm(
        newStatus === "active"
          ? t(
              "members.confirm.activate",
              {
                name:
                  member.full_name,
              }
            )
          : t(
              "members.confirm.deactivate",
              {
                name:
                  member.full_name,
              }
            )
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.patch(
        `/api/members/${member.id}/status`,
        {
          status: newStatus,
        }
      );

      setSuccess(
        newStatus === "active"
          ? t(
              "members.messages.activated",
              {
                name:
                  member.full_name,
              }
            )
          : t(
              "members.messages.deactivated",
              {
                name:
                  member.full_name,
              }
            )
      );

      await getMembers();
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            t(
              "members.errors.server",
              {
                status:
                  err.response.status,
                statusText:
                  err.response.statusText,
              }
            )
        );
      } else if (err.request) {
        setError(
          t(
            "members.errors.connection"
          )
        );
      } else {
        setError(
          t(
            "members.errors.unexpected",
            {
              message:
                err.message,
            }
          )
        );
      }
    }
  };

  // ============================================================
  // MEMBER STATISTICS
  // ============================================================

  const totalMembers =
    members.length;

  const activeMembers =
    members.filter(
      (member) =>
        member.status === "active"
    ).length;

  const inactiveMembers =
    members.filter(
      (member) =>
        member.status !== "active"
    ).length;

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredMembers =
    members.filter((member) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        (member.full_name || "")
          .toLowerCase()
          .includes(search) ||

        (member.phone || "")
          .toLowerCase()
          .includes(search) ||

        (
          member.telegram_username ||
          ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  // ============================================================
  // SORT
  // ============================================================

  const sortedMembers =
    [...filteredMembers].sort(
      (a, b) => {
        if (
          sortOption ===
          "name-asc"
        ) {
          return (
            a.full_name || ""
          ).localeCompare(
            b.full_name || ""
          );
        }

        if (
          sortOption ===
          "name-desc"
        ) {
          return (
            b.full_name || ""
          ).localeCompare(
            a.full_name || ""
          );
        }

        if (
          sortOption ===
          "newest"
        ) {
          return (
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
          );
        }

        if (
          sortOption ===
          "oldest"
        ) {
          return (
            new Date(
              a.created_at || 0
            ) -
            new Date(
              b.created_at || 0
            )
          );
        }

        return 0;
      }
    );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="members-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="members-header">
        <div>
          <h1>
            {t("members.title")}
          </h1>

          <p>
            {t(
              "members.description"
            )}
          </p>
        </div>

        <button
          className="add-button"
          onClick={openAddForm}
        >
          + {t("members.addMember")}
        </button>
      </div>

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ======================================================
          ADD / EDIT FORM
      ====================================================== */}

      {showForm && (
        <div className="form-card">

          <div className="form-header">
            <div>
              <h2>
                {editingMember
                  ? t(
                      "members.form.editTitle"
                    )
                  : t(
                      "members.form.addTitle"
                    )}
              </h2>

              <p>
                {editingMember
                  ? t(
                      "members.form.editDescription"
                    )
                  : t(
                      "members.form.addDescription"
                    )}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
          >

            {/* Full Name */}

            <div className="form-group">
              <label>
                {t(
                  "members.form.fullName"
                )}
              </label>

              <input
                type="text"
                name="full_name"
                value={
                  formData.full_name
                }
                onChange={
                  handleChange
                }
                placeholder={t(
                  "members.form.fullNamePlaceholder"
                )}
                required
              />
            </div>

            {/* Phone */}

            <div className="form-group">
              <label>
                {t(
                  "members.form.phone"
                )}
              </label>

              <input
                type="text"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder={t(
                  "members.form.phonePlaceholder"
                )}
              />
            </div>

            {/* Telegram */}

            <div className="form-group">
              <label>
                {t(
                  "members.form.telegram"
                )}
              </label>

              <input
                type="text"
                name="telegram_username"
                value={
                  formData.telegram_username
                }
                onChange={
                  handleChange
                }
                placeholder="@username"
              />
            </div>

            {/* Buttons */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                {t(
                  "members.form.cancel"
                )}
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? t(
                      "members.form.saving"
                    )
                  : editingMember
                  ? t(
                      "members.form.update"
                    )
                  : t(
                      "members.form.save"
                    )}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================================
          MEMBER STATISTICS
      ====================================================== */}

      <div className="member-stats-grid">

        <div className="member-stat-card">
          <div className="member-stat-icon total">
            {"\u{1F465}"}
          </div>

          <div className="member-stat-content">
            <span>
              {t(
                "members.statistics.total"
              )}
            </span>

            <strong>
              {totalMembers}
            </strong>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="member-stat-icon active">
            {"\u{2713}"}
          </div>

          <div className="member-stat-content">
            <span>
              {t(
                "members.statistics.active"
              )}
            </span>

            <strong>
              {activeMembers}
            </strong>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="member-stat-icon inactive">
            {"\u{25CB}"}
          </div>

          <div className="member-stat-content">
            <span>
              {t(
                "members.statistics.inactive"
              )}
            </span>

            <strong>
              {inactiveMembers}
            </strong>
          </div>
        </div>

      </div>

      {/* ======================================================
          MEMBERS CARD
      ====================================================== */}

      <div className="members-card">

        <div className="members-card-header">

          <div>
            <h2>
              {t(
                "members.list.title"
              )}
            </h2>

            <span>
              {t(
                "members.list.count",
                {
                  visible:
                    filteredMembers.length,
                  total:
                    members.length,
                }
              )}
            </span>
          </div>

          {/* Sort */}

          <div className="member-sort">
            <label htmlFor="member-sort-select">
              {t(
                "members.sort.label"
              )}
            </label>

            <select
              id="member-sort-select"
              value={sortOption}
              onChange={(
                event
              ) =>
                setSortOption(
                  event.target.value
                )
              }
            >
              <option value="name-asc">
                {t(
                  "members.sort.nameAsc"
                )}
              </option>

              <option value="name-desc">
                {t(
                  "members.sort.nameDesc"
                )}
              </option>

              <option value="newest">
                {t(
                  "members.sort.newest"
                )}
              </option>

              <option value="oldest">
                {t(
                  "members.sort.oldest"
                )}
              </option>
            </select>
          </div>

          {/* Search */}

          <div className="member-search">

            <span className="search-icon">
              {"\u{1F50E}"}
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder={t(
                "members.search.placeholder"
              )}
              aria-label={t(
                "members.search.ariaLabel"
              )}
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label={t(
                  "members.search.clear"
                )}
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="loading">
            {t(
              "members.loading"
            )}
          </div>
        ) : members.length === 0 ? (

          <div className="empty">
            {t(
              "members.empty"
            )}
          </div>

        ) : filteredMembers.length === 0 ? (

          <div className="empty">
            {t(
              "members.noSearchResults"
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
                      "members.table.name"
                    )}
                  </th>

                  <th>
                    {t(
                      "members.table.phone"
                    )}
                  </th>

                  <th>
                    {t(
                      "members.table.telegram"
                    )}
                  </th>

                  <th>
                    {t(
                      "members.table.status"
                    )}
                  </th>

                  <th>
                    {t(
                      "members.table.actions"
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>

                {sortedMembers.map(
                  (
                    member,
                    index
                  ) => (

                    <tr
                      key={member.id}
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {
                            member.full_name
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          member.phone ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          member.telegram_username ||
                          "-"
                        }
                      </td>

                      <td>
                        <span
                          className={
                            member.status ===
                            "active"
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {member.status ===
                          "active"
                            ? t(
                                "members.status.active"
                              )
                            : t(
                                "members.status.inactive"
                              )}
                        </span>
                      </td>

                      <td>

                        <div className="member-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditForm(
                                member
                              )
                            }
                          >
                            {t(
                              "members.actions.edit"
                            )}
                          </button>

                          <button
                            className={
                              member.status ===
                              "active"
                                ? "deactivate-button"
                                : "activate-button"
                            }
                            onClick={() =>
                              toggleMemberStatus(
                                member
                              )
                            }
                          >
                            {member.status ===
                            "active"
                              ? t(
                                  "members.actions.deactivate"
                                )
                              : t(
                                  "members.actions.activate"
                                )}
                          </button>

                        </div>

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

export default Members;

