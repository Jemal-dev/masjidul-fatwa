import { useTranslation } from "react-i18next";

function ActivitiesPage({ onNavigate, onAdmin }) {
  const { t } = useTranslation();

  return (
    <div className="activities-page-content">
      <section className="public-section events-section activities-page-section">
        <div className="section-heading center">
          <span className="section-kicker">
            {t("events.kicker")}
          </span>

          <h1 className="activities-page-title">
            {t("events.title")}
          </h1>

          <p className="activities-page-intro">
            {t("events.activitiesDescription")}
          </p>
        </div>

        <div className="event-grid">
          {/* Friday Contributions */}
          <article className="event-card featured">
            <div className="event-art green-art">
              {t("events.friday")}
            </div>

            <div className="event-body">
              <span className="event-tag">
                {t("events.weekly")}
              </span>

              <h2>
                {t("events.fridayContribution")}
              </h2>

              <p>
                {t("events.fridayDescription")}
              </p>

              <button
                type="button"
                onClick={onAdmin}
              >
                {t("events.manageContributions")}
                {" "}
                <span aria-hidden="true">{"\u{2192}"}</span>
              </button>
            </div>
          </article>

          {/* Monthly Review */}
          <article className="event-card">
            <div className="event-art gold-art">
              {t("events.report")}
            </div>

            <div className="event-body">
              <span className="event-tag">
                {t("events.monthly")}
              </span>

              <h2>
                {t("events.monthlyReview")}
              </h2>

              <p>
                {t("events.monthlyDescription")}
              </p>

              <button
                type="button"
                onClick={onAdmin}
              >
                {t("events.viewReports")}
                {" "}
                <span aria-hidden="true">{"\u{2192}"}</span>
              </button>
            </div>
          </article>

          {/* Youth and Community Activities */}
          <article className="event-card">
            <div className="event-art navy-art">
              {t("events.shabab")}
            </div>

            <div className="event-body">
              <span className="event-tag">
                {t("events.community")}
              </span>

              <h2>
                {t("events.shababActivities")}
              </h2>

              <p>
                {t("events.activitiesDescription")}
              </p>

              <button
                type="button"
                onClick={() => onNavigate("services")}
              >
                {t("events.openSystem")}
                {" "}
                <span aria-hidden="true">{"\u{2192}"}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("gallery")}
              >
                {t("events.viewGallery")}
                {" "}
                <span aria-hidden="true">{"\u{2192}"}</span>
              </button>
            </div>
          </article>
        </div>

        <div className="activities-page-contact">
          <h2>{t("contact.contactUs")}</h2>

          <p>
            Masjidul-Fatwa Shabab is based in Awara Gema,
            Shalla, West Arsi Zone, Oromia, Ethiopia.
            Contact the community for more information
            about its activities and services.
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={() => onNavigate("contact")}
          >
            {t("nav.contact")}
            {" "}
            <span aria-hidden="true">{"\u{2192}"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default ActivitiesPage;