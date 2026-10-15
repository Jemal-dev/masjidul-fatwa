import { useTranslation } from "react-i18next";

function AboutPage({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="about-page-content">
      <section
        className="public-section about-section"
        id="about-page"
      >
        <div className="section-heading center">
          <span className="section-kicker">
            {t("about.kicker")}
          </span>

          <h1 className="about-page-title">
            {t("about.title")}
          </h1>

          <p>
            {t("about.description")}
          </p>
        </div>

        <div className="about-grid">
          <div className="about-visual">
            <div className="about-emblem">
              <img
                src="/masjidul-fatwa-logo.svg"
                alt="Masjidul-Fatwa Shabab logo"
              />
            </div>

            <div className="about-label">
              {t("about.label")}
            </div>
          </div>

          <div className="about-points">
            <article>
              <span>01</span>

              <div>
                <h3>
                  {t(
                    "about.points.transparentRecords.title"
                  )}
                </h3>

                <p>
                  {t(
                    "about.points.transparentRecords.description"
                  )}
                </p>
              </div>
            </article>

            <article>
              <span>02</span>

              <div>
                <h3>
                  {t(
                    "about.points.responsibleManagement.title"
                  )}
                </h3>

                <p>
                  {t(
                    "about.points.responsibleManagement.description"
                  )}
                </p>
              </div>
            </article>

            <article>
              <span>03</span>

              <div>
                <h3>
                  {t(
                    "about.points.communityImpact.title"
                  )}
                </h3>

                <p>
                  {t(
                    "about.points.communityImpact.description"
                  )}
                </p>
              </div>
            </article>
          </div>
        </div>

       {/* ABOUT MASJIDUL-FATWA SHABAB — ADDITIONAL INFORMATION */}

<section className="about-page-details">
  <h2>{t("about.communityActivities.aboutHeading")}</h2>

  <p>{t("about.communityActivities.intro")}</p>

  <h2>{t("about.communityActivities.keyInformationHeading")}</h2>

  <h2>{t("about.communityActivities.activitiesHeading")}</h2>

  <p>{t("about.communityActivities.activitiesIntro")}</p>

  <ul className="about-page-facts">
    <li>
      <strong>
        {t("about.communityActivities.facts.youthEducationLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.youthEducation")}
    </li>

    <li>
      <strong>
        {t("about.communityActivities.facts.mosqueActivitiesLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.mosqueActivities")}
    </li>

    <li>
      <strong>
        {t("about.communityActivities.facts.charitableSupportLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.charitableSupport")}
    </li>

    <li>
      <strong>
        {t("about.communityActivities.facts.communityMeetingsLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.communityMeetings")}
    </li>

    <li>
      <strong>
        {t("about.communityActivities.facts.communityDevelopmentLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.communityDevelopment")}
    </li>

    <li>
      <strong>
        {t("about.communityActivities.facts.fridayContributionsLabel")}:
      </strong>{" "}
      {t("about.communityActivities.facts.fridayContributions")}
    </li>
  </ul>

  <h2>{t("about.communityActivities.contactHeading")}</h2>

  <p>{t("about.communityActivities.contactDescription")}</p>

  <p>
    <a href="https://masjidul-fatwa.vercel.app/">
      https://masjidul-fatwa.vercel.app/
    </a>
  </p>

  <p>
    <strong>{t("about.communityActivities.emailLabel")}:</strong>{" "}
    <a href="mailto:masjidulfatwa@gmail.com">
      masjidulfatwa@gmail.com
    </a>
  </p>

  <p>
    <strong>{t("about.communityActivities.phoneLabel")}:</strong>{" "}
    <a href="tel:+251919543806">
      +251 919 543 806
    </a>
  </p>
</section>

        <div className="about-page-contact">
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

export default AboutPage;