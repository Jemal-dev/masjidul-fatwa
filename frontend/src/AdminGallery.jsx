import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./AdminGallery.css";

function AdminGallery() {
  const { t, i18n } = useTranslation();

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
  const previewObjectUrlRef = useRef("");

  // ==========================================
  // DATE LOCALE
  // ==========================================

  const getDateLocale = () => {
    const language = i18n.language || "en";

    const localeMap = {
      en: "en-US",
      om: "om-ET",
      am: "am-ET",
      ar: "ar",
    };

    return localeMap[language] || "en-US";
  };

  // ==========================================
  // CLEAN PREVIEW URL
  // ==========================================

  const clearPreviewObjectUrl = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(
        previewObjectUrlRef.current
      );

      previewObjectUrlRef.current = "";
    }
  };

  useEffect(() => {
    return () => {
      clearPreviewObjectUrl();
    };
  }, []);

  // ==========================================
  // LOAD GALLERY
  // ==========================================

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/gallery"
      );

      if (response.data?.success) {
        const galleryData =
          response.data.data ||
          response.data.photos ||
          [];

        setPhotos(
          Array.isArray(galleryData)
            ? galleryData
            : []
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
          t("adminGallery.errors.load")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    clearPreviewObjectUrl();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // OPEN ADD
  // ==========================================

  const openAddForm = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEditForm = (photo) => {
    clearPreviewObjectUrl();

    setEditingId(photo.id);
    setTitle(photo.title || "");
    setDescription(photo.description || "");
    setSelectedFile(null);
    setPreviewUrl(photo.image_url || "");
    setError("");
    setSuccess("");
    setShowForm(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);

      if (editingId) {
        clearPreviewObjectUrl();

        const currentPhoto = photos.find(
          (photo) => photo.id === editingId
        );

        setPreviewUrl(
          currentPhoto?.image_url || ""
        );
      } else {
        setPreviewUrl("");
      }

      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        t("adminGallery.errors.invalidImage")
      );

      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        t("adminGallery.errors.fileTooLarge")
      );

      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);

    clearPreviewObjectUrl();

    const localUrl = URL.createObjectURL(file);

    previewObjectUrlRef.current = localUrl;
    setPreviewUrl(localUrl);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError(
        t("adminGallery.errors.titleRequired")
      );
      return;
    }

    if (!editingId && !selectedFile) {
      setError(
        t("adminGallery.errors.photoRequired")
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

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
          t("adminGallery.messages.updated")
        );
      } else {
        await axios.post(
          "/api/gallery",
          formData
        );

        setSuccess(
          t("adminGallery.messages.uploaded")
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
          t("adminGallery.errors.save")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      t("adminGallery.deleteConfirm")
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

      setPhotos((current) =>
        current.filter(
          (photo) => photo.id !== id
        )
      );

      setSuccess(
        t("adminGallery.messages.deleted")
      );
    } catch (err) {
      console.error(
        "Gallery delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          t("adminGallery.errors.delete")
      );
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="admin-gallery-page">
      {/* HEADER */}

      <div className="admin-gallery-header">
        <div>
          <span className="section-kicker">
            {t("adminGallery.kicker")}
          </span>

          <h1>
            {t("adminGallery.title")}
          </h1>

          <p>
            {t("adminGallery.description")}
          </p>
        </div>

        <button
          type="button"
          className="admin-gallery-add-btn"
          onClick={openAddForm}
        >
          {"\uFF0B"}{" "}
          {t("adminGallery.actions.addPhoto")}
        </button>
      </div>

      {/* MESSAGES */}

      {success && (
        <div className="gallery-admin-message success">
          {"\u2713"} {success}
        </div>
      )}

      {error && !showForm && (
        <div className="gallery-admin-message error">
          {"!"} {error}
        </div>
      )}

      {/* STAT */}

      <div className="admin-gallery-stat">
        <span aria-hidden="true">
          {"\u{1F5BC}\uFE0F"}
        </span>

        <div>
          <small>
            {t("adminGallery.totalPhotos")}
          </small>

          <strong>{photos.length}</strong>
        </div>
      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="admin-gallery-empty">
          <div className="admin-gallery-spinner" />

          <p>
            {t("adminGallery.loading")}
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="admin-gallery-empty">
          <div
            className="admin-gallery-empty-icon"
            aria-hidden="true"
          >
            {"\u{1F5BC}\uFE0F"}
          </div>

          <h2>
            {t("adminGallery.emptyTitle")}
          </h2>

          <p>
            {t(
              "adminGallery.emptyDescription"
            )}
          </p>

          <button
            type="button"
            className="admin-gallery-empty-btn"
            onClick={openAddForm}
          >
            {"\uFF0B"}{" "}
            {t("adminGallery.actions.addFirstPhoto")}
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
                    photo.title ||
                    t("adminGallery.defaultAlt")
                  }
                />

                <div className="admin-gallery-card-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(photo)
                    }
                    title={t(
                      "adminGallery.actions.editPhoto"
                    )}
                    aria-label={t(
                      "adminGallery.actions.editPhoto"
                    )}
                  >
                    {"\u270F\uFE0F"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(photo.id)
                    }
                    title={t(
                      "adminGallery.actions.deletePhoto"
                    )}
                    aria-label={t(
                      "adminGallery.actions.deletePhoto"
                    )}
                  >
                    {"\u{1F5D1}\uFE0F"}
                  </button>
                </div>
              </div>

              <div className="admin-gallery-card-body">
                <h3>{photo.title}</h3>

                {photo.description && (
                  <p>{photo.description}</p>
                )}

                <small>
                  {photo.created_at
                    ? new Date(
                        photo.created_at
                      ).toLocaleDateString(
                        getDateLocale()
                      )
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
                <span aria-hidden="true">
                  {editingId
                    ? "\u270F\uFE0F"
                    : "\u{1F5BC}\uFE0F"}
                </span>

                <div>
                  <h2>
                    {editingId
                      ? t(
                          "adminGallery.form.editTitle"
                        )
                      : t(
                          "adminGallery.form.addTitle"
                        )}
                  </h2>

                  <p>
                    {editingId
                      ? t(
                          "adminGallery.form.editDescription"
                        )
                      : t(
                          "adminGallery.form.addDescription"
                        )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="admin-gallery-close"
                onClick={closeForm}
                disabled={saving}
                aria-label={t(
                  "adminGallery.form.close"
                )}
              >
                {"\u00D7"}
              </button>
            </div>

            <form
              className="admin-gallery-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="gallery-admin-message error">
                  {"!"} {error}
                </div>
              )}

              <label>
                {t(
                  "adminGallery.form.titleLabel"
                )}

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder={t(
                    "adminGallery.form.titlePlaceholder"
                  )}
                  maxLength={255}
                  disabled={saving}
                />
              </label>

              <label>
                {t(
                  "adminGallery.form.descriptionLabel"
                )}

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder={t(
                    "adminGallery.form.descriptionPlaceholder"
                  )}
                  rows="4"
                  disabled={saving}
                />
              </label>

              <label>
                {t(
                  "adminGallery.form.photoLabel"
                )}

                <div className="admin-gallery-file-box">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={saving}
                  />

                  <small>
                    {t(
                      "adminGallery.form.fileHelp"
                    )}
                  </small>
                </div>
              </label>

              {previewUrl && (
                <div className="admin-gallery-preview">
                  <small>
                    {t(
                      "adminGallery.form.preview"
                    )}
                  </small>

                  <img
                    src={previewUrl}
                    alt={t(
                      "adminGallery.form.previewAlt"
                    )}
                  />
                </div>
              )}

              <div className="admin-gallery-form-actions">
                <button
                  type="button"
                  className="admin-gallery-cancel"
                  onClick={closeForm}
                  disabled={saving}
                >
                  {t(
                    "adminGallery.form.cancel"
                  )}
                </button>

                <button
                  type="submit"
                  className="admin-gallery-save"
                  disabled={saving}
                >
                  {saving
                    ? t(
                        "adminGallery.form.saving"
                      )
                    : editingId
                    ? t(
                        "adminGallery.form.saveChanges"
                      )
                    : t(
                        "adminGallery.form.uploadPhoto"
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

export default AdminGallery;