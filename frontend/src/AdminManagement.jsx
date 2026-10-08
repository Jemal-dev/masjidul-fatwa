import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./AdminManagement.css";

function AdminManagement() {
    const { t, i18n } = useTranslation();

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

    const getAxiosConfig = () => {
        const token = localStorage.getItem("adminToken");

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    // ==========================================
    // DATE LOCALE
    // ==========================================

    const getDateLocale = () => {
        const language = i18n.language || "en";

        const localeMap = {
            en: "en-US",
            om: "om-ET",
            am: "am-ET",
            ar: "ar"
        };

        return localeMap[language] || "en-US";
    };

    // ================================
    // LOAD ADMINISTRATORS
    // ================================

    const loadAdmins = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/admins",
                getAxiosConfig()
            );

            if (response.data.success) {
                setAdmins(response.data.admins || []);
            } else {
                setAdmins([]);
            }
        } catch (error) {
            console.error(
                "Error loading admins:",
                error
            );

            alert(
                error.response?.data?.message ||
                t("adminManagement.errors.load")
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
        if (saving) {
            return;
        }

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
            alert(
                t("adminManagement.errors.fullNameRequired")
            );
            return;
        }

        if (!username) {
            alert(
                t("adminManagement.errors.usernameRequired")
            );
            return;
        }

        if (!editingAdmin && password.length < 6) {
            alert(
                t("adminManagement.errors.passwordMin")
            );
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

                // Only send password when a new password is entered.
                if (password.trim() !== "") {
                    if (password.length < 6) {
                        alert(
                            t(
                                "adminManagement.errors.newPasswordMin"
                            )
                        );

                        setSaving(false);
                        return;
                    }

                    updateData.password = password;
                }

                response = await axios.put(
                    `/api/admins/${editingAdmin.id}`,
                    updateData,
                    getAxiosConfig()
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
                    getAxiosConfig()
                );
            }

            if (response.data.success) {
                alert(
                    editingAdmin
                        ? t(
                              "adminManagement.messages.updated"
                          )
                        : t(
                              "adminManagement.messages.created"
                          )
                );

                // Close modal directly because saving is still true here.
                setShowModal(false);
                setEditingAdmin(null);

                setFormData({
                    full_name: "",
                    username: "",
                    password: "",
                    role: "admin"
                });

                await loadAdmins();
            } else {
                alert(
                    response.data.message ||
                    t("adminManagement.errors.operation")
                );
            }
        } catch (error) {
            console.error(
                "Save administrator error:",
                error
            );

            alert(
                error.response?.data?.message ||
                t("adminManagement.errors.save")
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
                t(
                    "adminManagement.errors.selfStatus"
                )
            );
            return;
        }

        const isCurrentlyActive =
            Number(admin.active) === 1;

        const newStatus = !isCurrentlyActive;

        const confirmed = window.confirm(
            newStatus
                ? t(
                      "adminManagement.confirm.activate",
                      {
                          name: admin.full_name
                      }
                  )
                : t(
                      "adminManagement.confirm.deactivate",
                      {
                          name: admin.full_name
                      }
                  )
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
                getAxiosConfig()
            );

            if (response.data.success) {
                // Immediately update the UI.
                setAdmins((previousAdmins) =>
                    previousAdmins.map((item) =>
                        Number(item.id) === adminId
                            ? {
                                  ...item,
                                  active: newStatus
                                      ? 1
                                      : 0
                              }
                            : item
                    )
                );

                // Keep database/UI synchronized.
                await loadAdmins();
            } else {
                alert(
                    response.data.message ||
                    t(
                        "adminManagement.errors.statusUpdate"
                    )
                );
            }
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                t(
                    "adminManagement.errors.statusUpdate"
                )
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

                    <p>
                        {t(
                            "adminManagement.loading"
                        )}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-management">
            {/* PAGE HEADER */}

            <div className="admin-page-header">
                <div>
                    <div className="page-kicker">
                        {t(
                            "adminManagement.kicker"
                        )}
                    </div>

                    <h1>
                        {t(
                            "adminManagement.title"
                        )}
                    </h1>

                    <p>
                        {t(
                            "adminManagement.description"
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    className="add-admin-btn"
                    onClick={openAddModal}
                >
                    <span>+</span>

                    {t(
                        "adminManagement.actions.add"
                    )}
                </button>
            </div>

            {/* SUMMARY CARDS */}

            <div className="admin-summary">
                <div className="admin-summary-card">
                    <div className="summary-icon">
                        {"\u{1F465}"}
                    </div>

                    <div>
                        <span>
                            {t(
                                "adminManagement.stats.total"
                            )}
                        </span>

                        <strong>
                            {totalAdmins}
                        </strong>
                    </div>
                </div>

                <div className="admin-summary-card">
                    <div className="summary-icon">
                        {"\u2713"}
                    </div>

                    <div>
                        <span>
                            {t(
                                "adminManagement.stats.active"
                            )}
                        </span>

                        <strong>
                            {activeAdmins}
                        </strong>
                    </div>
                </div>

                <div className="admin-summary-card">
                    <div className="summary-icon">
                        {"\u{1F6E1}\uFE0F"}
                    </div>

                    <div>
                        <span>
                            {t(
                                "adminManagement.stats.superAdmins"
                            )}
                        </span>

                        <strong>
                            {superAdmins}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ADMIN TABLE */}

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <div>
                        <h2>
                            {t(
                                "adminManagement.table.title"
                            )}
                        </h2>

                        <p>
                            {t(
                                "adminManagement.table.description"
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-admins"
                        onClick={loadAdmins}
                    >
                        {"\u21BB"}{" "}
                        {t(
                            "adminManagement.actions.refresh"
                        )}
                    </button>
                </div>

                {admins.length === 0 ? (
                    <div className="admin-empty">
                        <div>
                            {"\u{1F465}"}
                        </div>

                        <h3>
                            {t(
                                "adminManagement.empty.title"
                            )}
                        </h3>

                        <p>
                            {t(
                                "adminManagement.empty.description"
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>
                                        {t(
                                            "adminManagement.table.administrator"
                                        )}
                                    </th>

                                    <th>
                                        {t(
                                            "adminManagement.table.username"
                                        )}
                                    </th>

                                    <th>
                                        {t(
                                            "adminManagement.table.role"
                                        )}
                                    </th>

                                    <th>
                                        {t(
                                            "adminManagement.table.status"
                                        )}
                                    </th>

                                    <th>
                                        {t(
                                            "adminManagement.table.created"
                                        )}
                                    </th>

                                    <th>
                                        {t(
                                            "adminManagement.table.actions"
                                        )}
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
                                        Number(
                                            admin.id
                                        );

                                    return (
                                        <tr
                                            key={
                                                admin.id
                                            }
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
                                                                    {t(
                                                                        "adminManagement.you"
                                                                    )}
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
                                                        ? t(
                                                              "adminManagement.roles.superAdmin"
                                                          )
                                                        : t(
                                                              "adminManagement.roles.admin"
                                                          )}
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
                                                        ? t(
                                                              "adminManagement.status.active"
                                                          )
                                                        : t(
                                                              "adminManagement.status.inactive"
                                                          )}
                                                </span>
                                            </td>

                                            {/* CREATED */}

                                            <td>
                                                <span className="created-date">
                                                    {admin.created_at
                                                        ? new Date(
                                                              admin.created_at
                                                          ).toLocaleDateString(
                                                              getDateLocale(),
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
                                                        {t(
                                                            "adminManagement.actions.edit"
                                                        )}
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
                                                                ? t(
                                                                      "adminManagement.tooltips.selfStatus"
                                                                  )
                                                                : isUpdating
                                                                ? t(
                                                                      "adminManagement.tooltips.updating"
                                                                  )
                                                                : isActive
                                                                ? t(
                                                                      "adminManagement.tooltips.deactivate"
                                                                  )
                                                                : t(
                                                                      "adminManagement.tooltips.activate"
                                                                  )
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? t(
                                                                  "adminManagement.status.updating"
                                                              )
                                                            : isActive
                                                            ? t(
                                                                  "adminManagement.actions.deactivate"
                                                              )
                                                            : t(
                                                                  "adminManagement.actions.activate"
                                                              )}
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

            {/* ADD / EDIT MODAL */}

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
                                    {"\u{1F6E1}\uFE0F"}
                                </div>

                                <div>
                                    <h2>
                                        {editingAdmin
                                            ? t(
                                                  "adminManagement.form.editTitle"
                                              )
                                            : t(
                                                  "adminManagement.form.addTitle"
                                              )}
                                    </h2>

                                    <p>
                                        {editingAdmin
                                            ? t(
                                                  "adminManagement.form.editDescription"
                                              )
                                            : t(
                                                  "adminManagement.form.addDescription"
                                              )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label={t(
                                    "adminManagement.form.close"
                                )}
                            >
                                {"\u00D7"}
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
                                    {t(
                                        "adminManagement.form.fullName"
                                    )}
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
                                    placeholder={t(
                                        "adminManagement.form.fullNamePlaceholder"
                                    )}
                                    autoComplete="name"
                                    disabled={saving}
                                    required
                                />
                            </div>

                            {/* USERNAME */}

                            <div className="form-group">
                                <label htmlFor="username">
                                    {t(
                                        "adminManagement.form.username"
                                    )}
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
                                    placeholder={t(
                                        "adminManagement.form.usernamePlaceholder"
                                    )}
                                    autoComplete="username"
                                    disabled={saving}
                                    required
                                />
                            </div>

                            {/* PASSWORD */}

                            <div className="form-group">
                                <label htmlFor="password">
                                    {t(
                                        "adminManagement.form.password"
                                    )}

                                    {editingAdmin && (
                                        <span className="optional">
                                            {t(
                                                "adminManagement.form.optional"
                                            )}
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
                                            ? t(
                                                  "adminManagement.form.passwordEditPlaceholder"
                                              )
                                            : t(
                                                  "adminManagement.form.passwordPlaceholder"
                                              )
                                    }
                                    autoComplete="new-password"
                                    disabled={saving}
                                    required={
                                        !editingAdmin
                                    }
                                    minLength={6}
                                />

                                <small className="field-note">
                                    {editingAdmin
                                        ? t(
                                              "adminManagement.form.passwordEditNote"
                                          )
                                        : t(
                                              "adminManagement.form.passwordNote"
                                          )}
                                </small>
                            </div>

                            {/* ROLE */}

                            <div className="form-group">
                                <label htmlFor="role">
                                    {t(
                                        "adminManagement.form.role"
                                    )}
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
                                        (editingAdmin &&
                                            Number(
                                                editingAdmin.id
                                            ) ===
                                                Number(
                                                    currentUser.id
                                                ))
                                    }
                                >
                                    <option value="admin">
                                        {t(
                                            "adminManagement.roles.admin"
                                        )}
                                    </option>

                                    <option value="super_admin">
                                        {t(
                                            "adminManagement.roles.superAdmin"
                                        )}
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
                                            {t(
                                                "adminManagement.form.selfRoleNote"
                                            )}
                                        </small>
                                    )}
                            </div>

                            {/* FOOTER */}

                            <div className="admin-form-footer">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    {t(
                                        "adminManagement.form.cancel"
                                    )}
                                </button>

                                <button
                                    type="submit"
                                    className="save-admin-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? t(
                                              "adminManagement.form.saving"
                                          )
                                        : editingAdmin
                                        ? t(
                                              "adminManagement.form.saveChanges"
                                          )
                                        : t(
                                              "adminManagement.form.create"
                                          )}
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