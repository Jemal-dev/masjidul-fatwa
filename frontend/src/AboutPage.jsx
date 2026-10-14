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

  <h2>About Masjidul-Fatwa Shabab</h2>

  <p>
    Masjidul-Fatwa Shabab is a youth community based in
    Awara Gema, Shalla, West Arsi Zone, Oromia, Ethiopia.
    The community focuses on youth membership, community
    activities, and organized Friday contributions.
  </p>

  <h2>Key Information About Masjidul-Fatwa Shabab</h2>

  <ul className="about-page-facts">
    <li>
      <strong>Location:</strong>{" "}
      Awara Gema, Shalla, West Arsi Zone, Oromia, Ethiopia.
    </li>

    <li>
      <strong>Youth Membership:</strong>{" "}
      The community maintains membership records to support
      organized community management.
    </li>

    <li>
      <strong>Friday Contributions:</strong>{" "}
      The Masjidul-Fatwa Shabab management system supports
      recording and managing weekly community contributions.
    </li>

    <li>
      <strong>Contribution Reports:</strong>{" "}
      Authorized administrators can review contribution
      records and generate reports to support responsible
      financial recordkeeping.
    </li>

    <li>
      <strong>Community Information:</strong>{" "}
      Visitors can explore information about the community,
      its activities, and how to contact its representatives
      through the official website.
    </li>
  </ul>

  <h2>Contact Masjidul-Fatwa Shabab</h2>

  <p>
    For community questions and further information, visit
    the official website:
  </p>

  <p>
    <a href="https://masjidul-fatwa.vercel.app/">
      https://masjidul-fatwa.vercel.app/
    </a>
  </p>

  <p>
    <strong>Email:</strong>{" "}
    <a href="mailto:masjidulfatwa@gmail.com">
      masjidulfatwa@gmail.com
    </a>
  </p>

  <p>
    <strong>Phone:</strong>{" "}
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