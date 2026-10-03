
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AdminGallery.css";

function AdminGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);

    /* =========================================================
       LOAD GALLERY
    ========================================================= */

    const loadGallery = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                "/api/gallery"
            );

            if (response.data?.success) {
                setPhotos(
                    response.data.data || []
                );
            } else {
                setPhotos([]);
            }

        } catch (err) {
            console.error(
                "Gallery loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load gallery."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGallery();
    }, []);

    /* =========================================================
       RESET FORM
    ========================================================= */

    const resetForm = () => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        setPreviewUrl("");
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /* =========================================================
       OPEN ADD
    ========================================================= */

    const openAddForm = () => {
        resetForm();
        setSuccess("");
        setShowForm(true);
    };

    /* =========================================================
       OPEN EDIT
    ========================================================= */

    const openEditForm = (photo) => {
        setEditingId(photo.id);
        setTitle(photo.title || "");
        setDescription(
            photo.description || ""
        );
        setSelectedFile(null);
        setPreviewUrl(
            photo.image_url || ""
        );
        setError("");
        setSuccess("");
        setShowForm(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /* =========================================================
       CLOSE FORM
    ========================================================= */

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        resetForm();
    };

    /* =========================================================
       FILE SELECT
    ========================================================= */

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );
            setSelectedFile(null);
            return;
        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {
            setError(
                "Image must be 10 MB or smaller."
            );
            setSelectedFile(null);
            return;
        }

        setError("");
        setSelectedFile(file);

        const localUrl =
            URL.createObjectURL(file);

        setPreviewUrl(localUrl);
    };

    /* =========================================================
       SUBMIT
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!title.trim()) {
            setError(
                "Please enter a photo title."
            );
            return;
        }

        if (
            !editingId &&
            !selectedFile
        ) {
            setError(
                "Please choose a photo."
            );
            return;
        }

        try {
            setSaving(true);

            const formData =
                new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            if (selectedFile) {
                formData.append(
                    "image",
                    selectedFile
                );
            }

            if (editingId) {
                await axios.put(
                    `/api/gallery/${editingId}`,
                    formData
                );

                setSuccess(
                    "Photo updated successfully."
                );
            } else {
                await axios.post(
                    "/api/gallery",
                    formData
                );

                setSuccess(
                    "Photo uploaded successfully."
                );
            }

            await loadGallery();

            setShowForm(false);
            resetForm();

        } catch (err) {
            console.error(
                "Gallery save error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save photo."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       DELETE
    ========================================================= */

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this photo?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `/api/gallery/${id}`
            );

            setPhotos(
                (current) =>
                    current.filter(
                        (photo) =>
                            photo.id !== id
                    )
            );

            setSuccess(
                "Photo deleted successfully."
            );

        } catch (err) {
            console.error(
                "Gallery delete error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete photo."
            );
        }
    };

    return (
        <div className="admin-gallery-page">

            {/* HEADER */}

            <div className="admin-gallery-header">
                <div>
                    <span className="section-kicker">
                        Content Management
                    </span>

                    <h1>Gallery</h1>

                    <p>
                        Upload and manage
                        Masjidul-Fatwa Shabab
                        community photos.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-gallery-add-btn"
                    onClick={openAddForm}
                >
                    ＋ Add Photo
                </button>
            </div>

            {/* MESSAGES */}

            {success && (
                <div className="gallery-admin-message success">
                    ✓ {success}
                </div>
            )}

            {error && !showForm && (
                <div className="gallery-admin-message error">
                    ! {error}
                </div>
            )}

            {/* STAT */}

            <div className="admin-gallery-stat">
                <span>🖼️</span>

                <div>
                    <small>Total Photos</small>

                    <strong>
                        {photos.length}
                    </strong>
                </div>
            </div>

            {/* CONTENT */}

            {loading ? (
                <div className="admin-gallery-empty">
                    <div className="admin-gallery-spinner" />
                    <p>Loading gallery...</p>
                </div>
            ) : photos.length === 0 ? (
                <div className="admin-gallery-empty">

                    <div className="admin-gallery-empty-icon">
                        🖼️
                    </div>

                    <h2>No Photos Yet</h2>

                    <p>
                        Your gallery is ready.
                        Add a photo whenever
                        you have one.
                    </p>

                    <button
                        type="button"
                        className="admin-gallery-empty-btn"
                        onClick={openAddForm}
                    >
                        ＋ Add First Photo
                    </button>

                </div>
            ) : (
                <div className="admin-gallery-grid">

                    {photos.map((photo) => (
                        <article
                            className="admin-gallery-card"
                            key={photo.id}
                        >

                            <div className="admin-gallery-image">

                                <img
                                    src={photo.image_url}
                                    alt={
                                        photo.title
                                    }
                                />

                                <div className="admin-gallery-card-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditForm(
                                                photo
                                            )
                                        }
                                        title="Edit photo"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                photo.id
                                            )
                                        }
                                        title="Delete photo"
                                    >
                                        🗑️
                                    </button>

                                </div>

                            </div>

                            <div className="admin-gallery-card-body">

                                <h3>
                                    {photo.title}
                                </h3>

                                {photo.description && (
                                    <p>
                                        {
                                            photo.description
                                        }
                                    </p>
                                )}

                                <small>
                                    {photo.created_at
                                        ? new Date(
                                              photo.created_at
                                          ).toLocaleDateString()
                                        : ""}
                                </small>

                            </div>

                        </article>
                    ))}

                </div>
            )}

            {/* MODAL */}

            {showForm && (
                <div className="admin-gallery-modal-overlay">

                    <div className="admin-gallery-modal">

                        <div className="admin-gallery-modal-header">

                            <div>
                                <span>
                                    {editingId
                                        ? "✏️"
                                        : "🖼️"}
                                </span>

                                <div>
                                    <h2>
                                        {editingId
                                            ? "Edit Photo"
                                            : "Add Photo"}
                                    </h2>

                                    <p>
                                        {editingId
                                            ? "Update photo details."
                                            : "Upload a community photo."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="admin-gallery-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="admin-gallery-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {error && (
                                <div className="gallery-admin-message error">
                                    ! {error}
                                </div>
                            )}

                            <label>
                                Title

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(
                                        event
                                    ) =>
                                        setTitle(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Friday Shabab Program"
                                    maxLength={255}
                                    disabled={saving}
                                />
                            </label>

                            <label>
                                Description

                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Describe this community moment..."
                                    rows="4"
                                    disabled={saving}
                                />
                            </label>

                            <label>
                                Photo

                                <div className="admin-gallery-file-box">

                                    <input
                                        ref={
                                            fileInputRef
                                        }
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleFileChange
                                        }
                                        disabled={saving}
                                    />

                                    <small>
                                        JPG, PNG, WEBP
                                        and other image
                                        formats. Maximum
                                        10 MB.
                                    </small>

                                </div>
                            </label>

                            {previewUrl && (
                                <div className="admin-gallery-preview">

                                    <small>
                                        Preview
                                    </small>

                                    <img
                                        src={
                                            previewUrl
                                        }
                                        alt="Preview"
                                    />

                                </div>
                            )}

                            <div className="admin-gallery-form-actions">

                                <button
                                    type="button"
                                    className="admin-gallery-cancel"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-gallery-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Uploading..."
                                        : editingId
                                        ? "Save Changes"
                                        : "Upload Photo"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}

export default AdminGallery;

