import { useEffect, useState } from "react";
import axios from "axios";

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  const [sortOption, setSortOption] = useState("name-asc");

  // Add/Edit form visibility
  const [showForm, setShowForm] = useState(false);

  // Know whether we are adding or editing
  const [editingMember, setEditingMember] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    telegram_username: "",
  });

  const [saving, setSaving] = useState(false);

  // Get members
  const getMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/members");

      setMembers(response.data.data || response.data);
    } catch (err) {
      console.error("Members error:", err);

      if (err.response) {
        setError(
          `Server error: ${err.response.status} - ${err.response.statusText}`
        );
      } else if (err.request) {
        setError("Cannot connect to the backend server.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open Add Member form
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

  // Open Edit Member form
  const openEditForm = (member) => {
    setEditingMember(member);

    setFormData({
      full_name: member.full_name || "",
      phone: member.phone || "",
      telegram_username: member.telegram_username || "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // Save member
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // EDIT MEMBER
      if (editingMember) {
        await axios.put(`/api/members/${editingMember.id}`, {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          telegram_username: formData.telegram_username.trim(),
        });

        setSuccess("Member updated successfully.");
      }

      // ADD MEMBER
      else {
        await axios.post("/api/members", {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          telegram_username: formData.telegram_username.trim(),
        });

        setSuccess("Member added successfully.");
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
      console.error("Save member error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        setError("Cannot connect to the backend server.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);

    setFormData({
      full_name: "",
      phone: "",
      telegram_username: "",
    });

    setError("");
  };

  // Change member status
  const toggleMemberStatus = async (member) => {
    const newStatus =
      member.status === "active" ? "inactive" : "active";

    const action =
      newStatus === "active" ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${member.full_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.patch(`/api/members/${member.id}/status`, {
        status: newStatus,
      });

      setSuccess(
        `${member.full_name} has been ${newStatus}.`
      );

      // Reload members
      await getMembers();
    } catch (err) {
      console.error("Status update error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        setError("Cannot connect to the backend server.");
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  // Member statistics
const totalMembers = members.length;

const activeMembers = members.filter(
  (member) => member.status === "active"
).length;

const inactiveMembers = members.filter(
  (member) => member.status !== "active"
).length;

  // Filter members based on search
  const filteredMembers = members.filter((member) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      (member.full_name || "").toLowerCase().includes(search) ||
      (member.phone || "").toLowerCase().includes(search) ||
      (member.telegram_username || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
  if (sortOption === "name-asc") {
    return (a.full_name || "").localeCompare(
      b.full_name || ""
    );
  }

  if (sortOption === "name-desc") {
    return (b.full_name || "").localeCompare(
      a.full_name || ""
    );
  }

  if (sortOption === "newest") {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  }

  if (sortOption === "oldest") {
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  }

  return 0;
});

  return (
    <div className="members-page">

      {/* Page Header */}
      <div className="members-header">

        <div>
          <h1>Members</h1>

          <p>
            Manage Masjidul-Fatwa Shabab members.
          </p>
        </div>

        <button
          className="add-button"
          onClick={openAddForm}
        >
          + Add Member
        </button>

      </div>

      {/* Success */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="form-card">

          <div className="form-header">

            <div>

              <h2>
                {editingMember
                  ? "Edit Member"
                  : "Add New Member"}
              </h2>

              <p>
                {editingMember
                  ? "Update the member information below."
                  : "Enter the member information below."}
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

            </div>

            {/* Phone */}
            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

            </div>

            {/* Telegram */}
            <div className="form-group">

              <label>
                Telegram Username
              </label>

              <input
                type="text"
                name="telegram_username"
                value={formData.telegram_username}
                onChange={handleChange}
                placeholder="@username"
              />

            </div>

            {/* Buttons */}
            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingMember
                    ? "Update Member"
                    : "Save Member"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Member Statistics */}
<div className="member-stats-grid">

  <div className="member-stat-card">
    <div className="member-stat-icon total">
      👥
    </div>

    <div className="member-stat-content">
      <span>Total Members</span>
      <strong>{totalMembers}</strong>
    </div>
  </div>

  <div className="member-stat-card">
    <div className="member-stat-icon active">
      ✓
    </div>

    <div className="member-stat-content">
      <span>Active Members</span>
      <strong>{activeMembers}</strong>
    </div>
  </div>

  <div className="member-stat-card">
    <div className="member-stat-icon inactive">
      ○
    </div>

    <div className="member-stat-content">
      <span>Inactive Members</span>
      <strong>{inactiveMembers}</strong>
    </div>
  </div>

</div>

      {/* Members Card */}
      <div className="members-card">

        <div className="members-card-header">

          <div>
            <h2>All Members</h2>

            <span>
              {filteredMembers.length} of {members.length} members
            </span>
          </div>

          {/* Search */}
          <div className="member-sort">
  <label htmlFor="member-sort-select">Sort</label>

  <select
    id="member-sort-select"
    value={sortOption}
    onChange={(event) => setSortOption(event.target.value)}
  >
    <option value="name-asc">Name A → Z</option>
    <option value="name-desc">Name Z → A</option>
    <option value="newest">Newest</option>
    <option value="oldest">Oldest</option>
  </select>
</div>
          <div className="member-search">

            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search members..."
              aria-label="Search members"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {loading ? (
          <div className="loading">
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="empty">
            No members found.
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty">
            No members match your search.
          </div>
        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Telegram</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {sortedMembers.map((member, index) => (

                  <tr key={member.id}>

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
                      {member.telegram_username || "-"}
                    </td>

                    <td>

                      <span
                        className={
                          member.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {member.status}
                      </span>

                    </td>

                    <td>

                      <div className="member-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            openEditForm(member)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className={
                            member.status === "active"
                              ? "deactivate-button"
                              : "activate-button"
                          }
                          onClick={() =>
                            toggleMemberStatus(member)
                          }
                        >
                          {member.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Members;