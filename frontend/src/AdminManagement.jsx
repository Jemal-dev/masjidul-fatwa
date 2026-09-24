import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminManagement.css";

function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "admin"
    });

    const currentUser = JSON.parse(
        localStorage.getItem("adminUser") || "{}"
    );

    const token = localStorage.getItem("adminToken");

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // ================================
    // LOAD ADMINISTRATORS
    // ================================
    const loadAdmins = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/admins",
                axiosConfig
            );

            if (response.data.success) {
                setAdmins(response.data.admins || []);
            }
        } catch (error) {
            console.error("Error loading admins:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load administrators."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    // ================================
    // OPEN ADD ADMIN MODAL
    // ================================
    const openAddModal = () => {
        setEditingAdmin(null);

        setFormData({
            full_name: "",
            username: "",
            password: "",
            role: "admin"
        });

        setShowModal(true);
    };

    // ================================
    // OPEN EDIT ADMIN MODAL
    // ================================
    const openEditModal = (admin) => {
        setEditingAdmin(admin);

        setFormData({
            full_name: admin.full_name || "",
            username: admin.username || "",
            password: "",
            role: admin.role || "admin"
        });

        setShowModal(true);
    };

    // ================================
    // CLOSE MODAL
    // ================================
    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingAdmin(null);

        setFormData({
            full_name: "",
            username: "",
            password: "",
            role: "admin"
        });
    };

    // ================================
    // FORM INPUT
    // ================================
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ================================
    // SAVE ADMINISTRATOR
    // ================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        const fullName = formData.full_name.trim();
        const username = formData.username.trim();
        const password = formData.password;

        if (!fullName) {
            alert("Full name is required.");
            return;
        }

        if (!username) {
            alert("Username is required.");
            return;
        }

        if (!editingAdmin && password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            setSaving(true);

            let response;

            if (editingAdmin) {
                const updateData = {
                    full_name: fullName,
                    username,
                    role: formData.role
                };

                // Only send password when user entered a new one.
                if (password.trim() !== "") {
                    if (password.length < 6) {
                        alert(
                            "New password must be at least 6 characters."
                        );
                        setSaving(false);
                        return;
                    }

                    updateData.password = password;
                }

                response = await axios.put(
                    `/api/admins/${editingAdmin.id}`,
                    updateData,
                    axiosConfig
                );
            } else {
                response = await axios.post(
                    "/api/admins",
                    {
                        full_name: fullName,
                        username,
                        password,
                        role: formData.role
                    },
                    axiosConfig
                );
            }

            if (response.data.success) {
                alert(
                    editingAdmin
                        ? "Administrator updated successfully."
                        : "Administrator created successfully."
                );

                closeModal();
                await loadAdmins();
            } else {
                alert(
                    response.data.message ||
                    "Operation failed."
                );
            }
        } catch (error) {
            console.error("Save administrator error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save administrator."
            );
        } finally {
            setSaving(false);
        }
    };

    // ================================
    // ACTIVATE / DEACTIVATE
    // ================================
    const toggleStatus = async (admin) => {
        const adminId = Number(admin.id);
        const currentUserId = Number(currentUser.id);

        // Prevent changing your own account.
        if (
            Number.isInteger(currentUserId) &&
            adminId === currentUserId
        ) {
            alert(
                "You cannot deactivate or change the status of your own account."
            );
            return;
        }

        const isCurrentlyActive =
            Number(admin.active) === 1;

        const newStatus = !isCurrentlyActive;

        const action = newStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} "${admin.full_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setStatusUpdating(adminId);

            const response = await axios.patch(
                `/api/admins/${adminId}/status`,
                {
                    active: newStatus
                },
                axiosConfig
            );

            if (response.data.success) {
                // Immediately update the UI.
                setAdmins((previousAdmins) =>
                    previousAdmins.map((item) =>
                        Number(item.id) === adminId
                            ? {
                                  ...item,
                                  active: newStatus ? 1 : 0
                              }
                            : item
                    )
                );

                // Keep database/UI synchronized.
                await loadAdmins();
            } else {
                alert(
                    response.data.message ||
                    "Failed to update administrator status."
                );
            }
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update administrator status."
            );
        } finally {
            setStatusUpdating(null);
        }
    };

    // ================================
    // STATISTICS
    // ================================
    const totalAdmins = admins.length;

    const activeAdmins = admins.filter(
        (admin) => Number(admin.active) === 1
    ).length;

    const superAdmins = admins.filter(
        (admin) => admin.role === "super_admin"
    ).length;

    // ================================
    // LOADING
    // ================================
    if (loading) {
        return (
            <div className="admin-management">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading administrators...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-management">

            {/* ================================
                PAGE HEADER
            ================================= */}
            <div className="admin-page-header">

                <div>
                    <div className="page-kicker">
                        ADMINISTRATION
                    </div>

                    <h1>Admin Management</h1>

                    <p>
                        Manage administrators and their
                        access to the system.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-admin-btn"
                    onClick={openAddModal}
                >
                    <span>+</span>
                    Add Administrator
                </button>
            </div>

            {/* ================================
                SUMMARY CARDS
            ================================= */}
            <div className="admin-summary">

                <div className="admin-summary-card">
                    <div className="summary-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Total Administrators
                        </span>

                        <strong>
                            {totalAdmins}
                        </strong>
                    </div>
                </div>

                <div className="admin-summary-card">
                    <div className="summary-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            Active
                        </span>

                        <strong>
                            {activeAdmins}
                        </strong>
                    </div>
                </div>

                <div className="admin-summary-card">
                    <div className="summary-icon">
                        🛡️
                    </div>

                    <div>
                        <span>
                            Super Admins
                        </span>

                        <strong>
                            {superAdmins}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ================================
                ADMIN TABLE
            ================================= */}
            <div className="admin-table-card">

                <div className="admin-table-header">

                    <div>
                        <h2>
                            Administrators
                        </h2>

                        <p>
                            Manage administrator accounts
                            and permissions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-admins"
                        onClick={loadAdmins}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {admins.length === 0 ? (
                    <div className="admin-empty">
                        <div>
                            👥
                        </div>

                        <h3>
                            No administrators found
                        </h3>

                        <p>
                            Add an administrator to get
                            started.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>
                                        Administrator
                                    </th>

                                    <th>
                                        Username
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {admins.map((admin) => {
                                    const isActive =
                                        Number(
                                            admin.active
                                        ) === 1;

                                    const isSelf =
                                        Number(
                                            admin.id
                                        ) ===
                                        Number(
                                            currentUser.id
                                        );

                                    const isUpdating =
                                        statusUpdating ===
                                        Number(admin.id);

                                    return (
                                        <tr
                                            key={admin.id}
                                        >

                                            {/* ADMINISTRATOR */}
                                            <td>
                                                <div className="admin-person">

                                                    <div className="admin-avatar">
                                                        {(
                                                            admin.full_name ||
                                                            "A"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                admin.full_name
                                                            }

                                                            {isSelf && (
                                                                <span className="you-badge">
                                                                    You
                                                                </span>
                                                            )}
                                                        </strong>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* USERNAME */}
                                            <td>
                                                <span className="username-text">
                                                    @
                                                    {
                                                        admin.username
                                                    }
                                                </span>
                                            </td>

                                            {/* ROLE */}
                                            <td>
                                                <span
                                                    className={`role-badge ${
                                                        admin.role ===
                                                        "super_admin"
                                                            ? "super"
                                                            : "admin"
                                                    }`}
                                                >
                                                    {admin.role ===
                                                    "super_admin"
                                                        ? "Super Admin"
                                                        : "Admin"}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    <span className="status-dot"></span>

                                                    {isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* CREATED */}
                                            <td>
                                                <span className="created-date">
                                                    {admin.created_at
                                                        ? new Date(
                                                              admin.created_at
                                                          ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                  year: "numeric",
                                                                  month: "short",
                                                                  day: "numeric"
                                                              }
                                                          )
                                                        : "—"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td>
                                                <div className="admin-actions">

                                                    {/* EDIT */}
                                                    <button
                                                        type="button"
                                                        className="edit-admin-btn"
                                                        onClick={() =>
                                                            openEditModal(
                                                                admin
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* ACTIVATE / DEACTIVATE */}
                                                    <button
                                                        type="button"
                                                        className={
                                                            isActive
                                                                ? "status-action deactivate"
                                                                : "status-action activate"
                                                        }
                                                        onClick={() =>
                                                            toggleStatus(
                                                                admin
                                                            )
                                                        }
                                                        disabled={
                                                            isSelf ||
                                                            isUpdating
                                                        }
                                                        title={
                                                            isSelf
                                                                ? "You cannot change your own account status"
                                                                : isUpdating
                                                                ? "Updating..."
                                                                : isActive
                                                                ? "Deactivate this administrator"
                                                                : "Activate this administrator"
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? "Updating..."
                                                            : isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                )}
            </div>

            {/* ================================
                ADD / EDIT MODAL
            ================================= */}
            {showModal && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="admin-modal">

                        {/* MODAL HEADER */}
                        <div className="admin-modal-header">

                            <div className="modal-title-area">

                                <div className="modal-icon">
                                    🛡️
                                </div>

                                <div>
                                    <h2>
                                        {editingAdmin
                                            ? "Edit Administrator"
                                            : "Add Administrator"}
                                    </h2>

                                    <p>
                                        {editingAdmin
                                            ? "Update administrator account details."
                                            : "Create a new administrator account."}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            className="admin-form"
                            onSubmit={handleSubmit}
                        >

                            {/* FULL NAME */}
                            <div className="form-group">

                                <label htmlFor="full_name">
                                    Full Name
                                </label>

                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={
                                        formData.full_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter full name"
                                    autoComplete="name"
                                    disabled={saving}
                                    required
                                />

                            </div>

                            {/* USERNAME */}
                            <div className="form-group">

                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter username"
                                    autoComplete="username"
                                    disabled={saving}
                                    required
                                />

                            </div>

                            {/* PASSWORD */}
                            <div className="form-group">

                                <label htmlFor="password">
                                    Password

                                    {editingAdmin && (
                                        <span className="optional">
                                            Optional
                                        </span>
                                    )}
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder={
                                        editingAdmin
                                            ? "Leave blank to keep current password"
                                            : "Enter password"
                                    }
                                    autoComplete={
                                        editingAdmin
                                            ? "new-password"
                                            : "new-password"
                                    }
                                    disabled={saving}
                                    required={
                                        !editingAdmin
                                    }
                                    minLength={6}
                                />

                                <small className="field-note">
                                    {editingAdmin
                                        ? "Only enter a password if you want to change it."
                                        : "Password must be at least 6 characters."}
                                </small>

                            </div>

                            {/* ROLE */}
                            <div className="form-group">

                                <label htmlFor="role">
                                    Role
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    value={
                                        formData.role
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving ||
                                        (
                                            editingAdmin &&
                                            Number(
                                                editingAdmin.id
                                            ) ===
                                                Number(
                                                    currentUser.id
                                                )
                                        )
                                    }
                                >
                                    <option value="admin">
                                        Admin
                                    </option>

                                    <option value="super_admin">
                                        Super Admin
                                    </option>
                                </select>

                                {editingAdmin &&
                                    Number(
                                        editingAdmin.id
                                    ) ===
                                        Number(
                                            currentUser.id
                                        ) && (
                                        <small className="field-note">
                                            You cannot change
                                            your own role.
                                        </small>
                                    )}

                            </div>

                            {/* FOOTER */}
                            <div className="admin-form-footer">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-admin-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingAdmin
                                        ? "Save Changes"
                                        : "Create Administrator"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminManagement;