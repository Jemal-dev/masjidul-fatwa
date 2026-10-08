import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.PROD
  ? "https://masjidul-fatwa-l6ao.vercel.app"
  : "http://localhost:5000";

function Gallery() {
  const { t, i18n } = useTranslation();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET PUBLIC GALLERY
  // ==========================================

  const fetchGallery = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/gallery`
      );

      const data = response.data;

      if (data?.success) {
        setPhotos(
          Array.isArray(data.photos)
            ? data.photos
            : []
        );
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error(
        "Failed to load gallery:",
        error
      );

      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD GALLERY
  // ==========================================

  useEffect(() => {
    fetchGallery();
  }, []);

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
  // PAGE
  // ==========================================

  return (
    <section
      className="shabab-gallery-section"
      id="gallery"
    >
      <div className="section-heading">
        <span className="section-kicker">
          {t("gallery.kicker")}
        </span>

        <h2>{t("gallery.title")}</h2>

        <p>{t("gallery.description")}</p>
      </div>

      {loading ? (
        <div className="gallery-empty-state">
          <div
            className="gallery-empty-icon"
            aria-hidden="true"
          >
            {"\u{1F4F7}"}
          </div>

          <h3>{t("gallery.loading")}</h3>

          <p>
            {t("gallery.loadingDescription")}
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="gallery-empty-state">
          <div
            className="gallery-empty-icon"
            aria-hidden="true"
          >
            {"\u{1F4F7}"}
          </div>

          <span className="gallery-coming-soon-badge">
            {t("gallery.comingSoonBadge")}
          </span>

          <h3>
            {t("gallery.emptyTitle")}
          </h3>

          <p>
            {t("gallery.emptyDescription")}
          </p>

          <div className="gallery-coming-soon-note">
            <span aria-hidden="true">
              {"\u{1F91D}"}
            </span>

            <span>
              {t("gallery.note")}
            </span>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <article
              className="gallery-card"
              key={photo.id}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={photo.image_url}
                  alt={
                    photo.title ||
                    t("gallery.defaultAlt")
                  }
                  className="gallery-image"
                  loading="lazy"
                />
              </div>

              <div className="gallery-card-content">
                {photo.title && (
                  <h3>{photo.title}</h3>
                )}

                {photo.description && (
                  <p>{photo.description}</p>
                )}

                {photo.created_at && (
                  <small>
                    {new Date(
                      photo.created_at
                    ).toLocaleDateString(
                      getDateLocale()
                    )}
                  </small>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Gallery;