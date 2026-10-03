import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? "https://masjidul-fatwa-l6ao.vercel.app"
  : "http://localhost:5000";

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gallery`);

      if (response.data?.success) {
        setPhotos(response.data.photos || []);
      }
    } catch (error) {
      console.error("Failed to load gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="shabab-gallery-section" id="gallery">
      <div className="section-heading">
        <span className="section-kicker">Shabab Gallery</span>

        <h2>Memories, Activities & Community Moments</h2>

        <p>
          A visual collection of the activities, programs, and memorable
          moments of Masjidul-Fatwa Shabab.
        </p>
      </div>

      {loading ? (
        <div className="gallery-empty-state">
          <div className="gallery-empty-icon">📷</div>
          <h3>Loading Gallery...</h3>
          <p>Please wait while we load our community photos.</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="gallery-empty-state">
          <div className="gallery-empty-icon">📷</div>

          <span className="gallery-coming-soon-badge">
            Gallery Coming Soon
          </span>

          <h3>Our Photos Will Be Here Soon</h3>

          <p>
            Photos from our Shabab activities, meetings, programs, and
            community gatherings will be added here soon.
          </p>

          <div className="gallery-coming-soon-note">
            <span>🤝</span>
            <span>
              Community activities and memorable moments will appear here.
            </span>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <article className="gallery-card" key={photo.id}>
              <div className="gallery-image-wrapper">
                <img
                  src={photo.image_url}
                  alt={photo.title || "Masjidul-Fatwa Shabab"}
                  className="gallery-image"
                  loading="lazy"
                />
              </div>

              <div className="gallery-card-content">
                {photo.title && <h3>{photo.title}</h3>}

                {photo.description && (
                  <p>{photo.description}</p>
                )}

                {photo.created_at && (
                  <small>
                    {new Date(photo.created_at).toLocaleDateString()}
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