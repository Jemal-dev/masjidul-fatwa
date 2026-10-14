import { useTranslation } from "react-i18next";

const serviceItems = [
  {
    icon: "\u{1F465}",
    key: "memberManagement",
  },
  {
    icon: "\u{1F4B0}",
    key: "contributionRecording",
  },
  {
    icon: "\u{1F4CA}",
    key: "weeklyReports",
  },
  {
    icon: "\u{1F4C5}",
    key: "monthlyReports",
  },
  {
    icon: "\u{1F916}",
    key: "telegramBot",
  },
  {
    icon: "\u{1F5A8}\u{FE0F}",
    key: "printableReports",
  },
];

function ServicesPage({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="services-page-content">
      <section className="public-section soft-section services-page-section">
        <div className="section-heading center">
          <span className="section-kicker">
            {t("services.kicker")}
          </span>

          <h1 className="services-page-title">
            {t("services.title")}
          </h1>

          <p>
            {t("services.description")}
          </p>
        </div>

        <div className="service-grid">
          {serviceItems.map(({ icon, key }) => (
            <article className="service-card" key={key}>
              <div className="service-icon">
                {icon}
              </div>

              <h2>
                {t(`services.items.${key}.title`)}
              </h2>

              <p>
                {t(`services.items.${key}.description`)}
              </p>
            </article>
          ))}
        </div>

        <div className="services-page-contact">
          <h2>
            {t("nav.contact")}
          </h2>

          <p>
            Masjidul-Fatwa Shabab is based in Awara Gema,
            Shalla, West Arsi Zone, Oromia, Ethiopia.
            Contact us for more information about the
            community and its activities.
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

export default ServicesPage;