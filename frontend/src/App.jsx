import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./i18n";
import {
ResponsiveContainer,
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
} from "recharts";
import "./App.css";

import Login from "./Login";
import Members from "./Members";
import Contributions from "./Contributions";
import Settings from "./Settings";
import Reports from "./Reports";
import AdminManagement from "./AdminManagement";
import Gallery from "./Gallery";
import AdminGallery from "./AdminGallery";
import Contact from "./Contact";

/* =========================================================
AXIOS BASE URL
========================================================= */

axios.defaults.baseURL = import.meta.env.PROD
? "https://masjidul-fatwa-l6ao.vercel.app"
: "http://localhost:5000";

/* =========================================================
AXIOS REQUEST INTERCEPTOR
========================================================= */

axios.interceptors.request.use(
(config) => {
const token = localStorage.getItem("adminToken");


if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

return config;


},
(error) => Promise.reject(error)
);

/* =========================================================
AXIOS RESPONSE INTERCEPTOR
========================================================= */

axios.interceptors.response.use(
(response) => response,
(error) => {
const status = error.response?.status;
const requestUrl = error.config?.url || "";


const isLoginRequest =
  requestUrl.includes("/api/auth/login");

if (
  (status === 401 || status === 403) &&
  !isLoginRequest
) {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  window.location.reload();
}

return Promise.reject(error);


}
);

/* =========================================================
NAVIGATION ITEMS
========================================================= */

const navItems = [
{
id: "dashboard",
label: "Dashboard",
icon: "\u{25A3}",
},
{
id: "members",
label: "Members",
icon: "\u{1F465}",
},
{
id: "contributions",
label: "Contributions",
icon: "\u{1F4B0}",
},
{
id: "reports",
label: "Reports",
icon: "\u{1F4CA}",
},

{
  id: "gallery",
  label: "Gallery",
  icon: "\u{1F5BC}",
},
{
id: "admins",
label: "Admins",
icon: "\u{1F6E1}",
},
{
id: "settings",
label: "Settings",
icon: "\u{2699}",
},
];

/* =========================================================
ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
value,
suffix = "",
}) {
const [displayValue, setDisplayValue] = useState(0);

useEffect(() => {
const target = Number(value) || 0;


setDisplayValue(0);

const duration = 1200;
const startTime = performance.now();

let animationFrame;

const animate = (currentTime) => {
  const progress = Math.min(
    (currentTime - startTime) / duration,
    1
  );

  const easedProgress =
    1 - Math.pow(1 - progress, 3);

  setDisplayValue(
    Math.floor(target * easedProgress)
  );

  if (progress < 1) {
    animationFrame =
      requestAnimationFrame(animate);
  } else {
    setDisplayValue(target);
  }
};

animationFrame =
  requestAnimationFrame(animate);

return () => {
  cancelAnimationFrame(animationFrame);
};


}, [value]);

return (
<>
{displayValue.toLocaleString()}
{suffix}
</>
);
}

/* =========================================================
APP
========================================================= */

function App() {
const [dashboard, setDashboard] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [currentPage, setCurrentPage] = useState("home");
const [mobileOpen, setMobileOpen] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [adminUser, setAdminUser] = useState(null);
const [authChecking, setAuthChecking] = useState(true);

/* =====================================================
CHECK SAVED LOGIN
===================================================== */

useEffect(() => {
const token =
localStorage.getItem("adminToken");


const savedUser =
  localStorage.getItem("adminUser");

if (token && savedUser) {
  try {
    const user = JSON.parse(savedUser);

    setAdminUser(user);
    setIsLoggedIn(true);
  } catch (error) {
    console.error(
      "Invalid saved user:",
      error
    );

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }
}

setAuthChecking(false);


}, []);

/* =====================================================
LOAD DASHBOARD
===================================================== */

const loadDashboard = async () => {
try {
setLoading(true);
setError("");


  const response =
    await axios.get("/api/dashboard");

  setDashboard(
    response.data?.data ||
      response.data
  );
} catch (err) {
  console.error(
    "Dashboard error:",
    err
  );

  setError(
    err.response
      ? `Server error: ${err.response.status}`
      : "Cannot connect to the backend server."
  );
} finally {
  setLoading(false);
}


};

/* =====================================================
LOAD DASHBOARD AFTER LOGIN
===================================================== */

useEffect(() => {
if (isLoggedIn) {
loadDashboard();
}
}, [isLoggedIn]);

/* =====================================================
PROTECT ADMIN PAGES
===================================================== */

useEffect(() => {
const publicPages = [
  "home",
  "contact",
  "login",
];


if (
  !isLoggedIn &&
  !publicPages.includes(currentPage)
) {
  setCurrentPage("home");
  setMobileOpen(false);
  return;
}

if (
  isLoggedIn &&
  (currentPage === "settings" ||
    currentPage === "admins") &&
  adminUser?.role !== "super_admin"
) {
  setCurrentPage("dashboard");
  setMobileOpen(false);
}


}, [
isLoggedIn,
currentPage,
adminUser,
]);

/* =====================================================
LOGIN
===================================================== */

const handleLogin = (user) => {
setAdminUser(user);
setIsLoggedIn(true);
setCurrentPage("dashboard");


window.scrollTo({
  top: 0,
  behavior: "smooth",
});


};

/* =====================================================
LOGOUT
===================================================== */

const handleLogout = () => {
localStorage.removeItem("adminToken");
localStorage.removeItem("adminUser");


setIsLoggedIn(false);
setAdminUser(null);
setCurrentPage("home");
setDashboard(null);
setMobileOpen(false);


};

/* =====================================================
OPEN ADMIN LOGIN
===================================================== */

const openAdminLogin = () => {
setCurrentPage("login");
};

/* =====================================================
ADMIN NAVIGATION
===================================================== */

const goTo = (page) => {
const protectedPages = [
  "dashboard",
  "members",
  "contributions",
  "reports",
  "gallery",
  "admins",
  "settings",
];


if (
  protectedPages.includes(page) &&
  !isLoggedIn
) {
  setCurrentPage("login");
  setMobileOpen(false);
  return;
}

if (
  (page === "settings" ||
    page === "admins") &&
  adminUser?.role !== "super_admin"
) {
  setCurrentPage("dashboard");
  setMobileOpen(false);
  return;
}

setCurrentPage(page);
setMobileOpen(false);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});


};

/* =====================================================
PUBLIC WEBSITE NAVIGATION
===================================================== */

const scrollToSection = (id) => {
  if (id === "contact") {
    setCurrentPage("contact");
    setMobileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  if (currentPage !== "home") {
    setCurrentPage("home");

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 50);
  } else {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }
};

/* =====================================================
AUTH LOADING
===================================================== */

if (authChecking) {
return ( <div className="auth-loading"> <div className="auth-loading-card"> <div className="login-logo">
{"\u{262A}"} </div>


      <p>Loading...</p>
    </div>
  </div>
);


}

/* =====================================================
MAIN APP
===================================================== */

return ( <div className="app-shell">
{currentPage === "login" ? (
<Login
onLogin={handleLogin}
onBack={() =>
setCurrentPage("home")
}
/>
) : currentPage === "home" ? (
  <PublicHome
    dashboard={dashboard}
    loading={loading}
    error={error}
    onAdmin={openAdminLogin}
    onNavigate={scrollToSection}
  />
) : currentPage === "contact" ? (
  <Contact
    onAdmin={openAdminLogin}
    onNavigate={scrollToSection}
  />
) : (
  <AdminLayout
       currentPage={currentPage}
       mobileOpen={mobileOpen}
       setMobileOpen={setMobileOpen}
       goTo={goTo}
       dashboard={dashboard}
       loading={loading}
       error={error}
       reloadDashboard={loadDashboard}
       adminUser={adminUser}
       onLogout={handleLogout}
     />
)} </div>
);
}

/* =========================================================
PUBLIC HOME
========================================================= */

function PublicHome({
  dashboard,
  loading,
  error,
  onAdmin,
  onNavigate,
}) {
  const { t, i18n } = useTranslation();

  const [publicMenuOpen, setPublicMenuOpen] =
    useState(false);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setPublicMenuOpen(false);
  };

  const handlePublicNavigate = (page) => {
    setPublicMenuOpen(false);
    onNavigate(page);
  };

  const handleAdminFromMenu = () => {
    setPublicMenuOpen(false);
    onAdmin();
  };

  const activeMembers =
    dashboard?.total_active_members ?? 0;

  const totalCollection =
    dashboard?.total_collection ?? 0;

  const weeklyCollection =
    dashboard?.weekly_collection ?? 0;

  const monthlyCollection =
    dashboard?.monthly_collection ?? 0;

  const statValue = (
    value,
    suffix = ""
  ) =>
    loading
      ? "..."
      : `${value ?? 0}${suffix}`;

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    );

  const currentLanguage =
    i18n.resolvedLanguage ||
    i18n.language ||
    "en";

  return (
    <div className="public-site">
      <header className="public-header">
        <button
          className="brand"
          onClick={() =>
            handlePublicNavigate("home")
          }
        >
          <span className="brand-mark">
            {"\u{262A}"}
          </span>

          <span>
            <strong>
              MASJIDUL-FATWA
            </strong>

            <small>SHABAB</small>
          </span>
        </button>

        <button
          className="public-menu-button"
          onClick={() =>
            setPublicMenuOpen(
              (value) => !value
            )
          }
          aria-label={
            publicMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={
            publicMenuOpen
          }
        >
          {"\u{2630}"}
        </button>

        <nav className="public-nav">
          <button
            onClick={() =>
              handlePublicNavigate(
                "home"
              )
            }
          >
            {t("nav.home")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "about"
              )
            }
          >
            {t("nav.about")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "services"
              )
            }
          >
            {t("nav.services")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "events"
              )
            }
          >
            {t("nav.activities")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "gallery"
              )
            }
          >
            {t("nav.gallery")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "contact"
              )
            }
          >
            {t("nav.contact")}
          </button>
        </nav>

            <div className="public-desktop-language">
      <button
        className={
          currentLanguage === "en"
            ? "active"
            : ""
        }
        onClick={() =>
          changeLanguage("en")
        }
      >
        English
      </button>

      <button
        className={
          currentLanguage === "om"
            ? "active"
            : ""
        }
        onClick={() =>
          changeLanguage("om")
        }
      >
        Afaan Oromoo
      </button>

      <button
        className={
          currentLanguage === "am"
            ? "active"
            : ""
        }
        onClick={() =>
          changeLanguage("am")
        }
      >
        አማርኛ
      </button>

      <button
        className={
          currentLanguage === "ar"
            ? "active"
            : ""
        }
        onClick={() =>
          changeLanguage("ar")
        }
      >
        العربية
      </button>
    </div>

    <button
      className="header-admin-btn"
      onClick={onAdmin}
    >
      {t("nav.adminLogin")}
    </button>
      </header>

      {publicMenuOpen && (
        <button
          className="public-mobile-overlay"
          onClick={() =>
            setPublicMenuOpen(false)
          }
          aria-label="Close menu"
        />
      )}

      <aside
        className={`public-mobile-menu ${
          publicMenuOpen ? "open" : ""
        }`}
      >
        <div className="public-mobile-menu-header">
          <div>
            <strong>
              MASJIDUL-FATWA
            </strong>

            <span>SHABAB</span>
          </div>

          <button
            className="public-mobile-close"
            onClick={() =>
              setPublicMenuOpen(false)
            }
            aria-label="Close menu"
          >
            {"\u{2715}"}
          </button>
        </div>

        <nav className="public-mobile-nav">
          <button
            onClick={() =>
              handlePublicNavigate(
                "home"
              )
            }
          >
            {t("nav.home")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "about"
              )
            }
          >
            {t("nav.about")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "services"
              )
            }
          >
            {t("nav.services")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "events"
              )
            }
          >
            {t("nav.activities")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "gallery"
              )
            }
          >
            {t("nav.gallery")}
          </button>

          <button
            onClick={() =>
              handlePublicNavigate(
                "contact"
              )
            }
          >
            {t("nav.contact")}
          </button>

          <button
            onClick={
              handleAdminFromMenu
            }
          >
            {t("nav.adminLogin")}
          </button>
        </nav>

        <div className="public-language-section">
          <span className="public-language-title">
            {t("language.title")}
          </span>

          <div className="public-language-list">
            <button
              className={
                currentLanguage === "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("en")
              }
            >
              {t("language.english")}
            </button>

            <button
              className={
                currentLanguage === "om"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("om")
              }
            >
              {t("language.oromo")}
            </button>

            <button
              className={
                currentLanguage === "am"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("am")
              }
            >
              {t("language.amharic")}
            </button>

            <button
              className={
                currentLanguage === "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeLanguage("ar")
              }
            >
              {t("language.arabic")}
            </button>
          </div>
        </div>
      </aside>

      <main>
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero-section"
          id="home"
        >
          <div className="hero-pattern" />

          <div className="hero-content">
            <div className="eyebrow">
              <span>
                {"\u{2726}"}
              </span>{" "}
              {t("hero.eyebrow")}
            </div>

            <h1>
              {t("hero.title")}
              <span>
                {" "}
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p>
              {t("hero.description")}
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() =>
                  handlePublicNavigate(
                    "services"
                  )
                }
              >
                {t(
                  "hero.exploreServices"
                )}{" "}
                <span>
                  {"\u{2192}"}
                </span>
              </button>

              <button
                className="secondary-btn"
                onClick={onAdmin}
              >
                {t("hero.adminLogin")}
              </button>
            </div>

            <div className="hero-note">
              <span>
                {"\u{2713}"}
              </span>{" "}
              {t(
                "hero.organizedRecords"
              )}
              &nbsp;{"\u{2022}"}&nbsp;
              <span>
                {"\u{2713}"}
              </span>{" "}
              {t(
                "hero.transparentContributions"
              )}
              &nbsp;{"\u{2022}"}&nbsp;
              <span>
                {"\u{2713}"}
              </span>{" "}
              {t(
                "hero.communityFocused"
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow glow-one" />
            <div className="glow glow-two" />

            <div className="community-card main-community-card">
              <div className="community-icon">
                {"\u{1F54C}"}
              </div>

              <div>
                <span>
                  MASJIDUL-FATWA
                </span>

                <strong>
                  SHABAB
                </strong>

                <small>
                  {t("hero.systemName")}
                </small>
              </div>
            </div>

            <div className="floating-card card-members">
              <span>
                {"\u{1F465}"}
              </span>

              <div>
                <small>
                  {t(
                    "hero.activeMembers"
                  )}
                </small>

                <strong>
                  {statValue(
                    activeMembers
                  )}
                </strong>
              </div>
            </div>

            <div className="floating-card card-money">
              <span>
                {"\u{1F4B0}"}
              </span>

              <div>
                <small>
                  {t(
                    "hero.totalCollection"
                  )}
                </small>

                <strong>
                  {loading
                    ? "..."
                    : `${formatMoney(
                        totalCollection
                      )} ETB`}
                </strong>
              </div>
            </div>

            <div className="hero-ring ring-one" />
            <div className="hero-ring ring-two" />
          </div>
        </section>

        {error && (
          <div className="public-error">
            {error}
          </div>
        )}

        {/* =================================================
            IMPACT
        ================================================= */}

        <section className="impact-strip">
          <div className="section-kicker">
            {t("impact.kicker")}
          </div>

          <h2>
            {t("impact.title")}
          </h2>

          <div className="impact-stats">
            <div>
              <strong>
                {statValue(
                  activeMembers,
                  "+"
                )}
              </strong>

              <span>
                {t(
                  "impact.activeMembers"
                )}
              </span>
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      weeklyCollection
                    )} ETB`}
              </strong>

              <span>
                {t("impact.thisWeek")}
              </span>
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      monthlyCollection
                    )} ETB`}
              </strong>

              <span>
                {t("impact.thisMonth")}
              </span>
            </div>

            <div>
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      totalCollection
                    )} ETB`}
              </strong>

              <span>
                {t(
                  "impact.totalCollection"
                )}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          className="public-section about-section"
          id="about"
        >
          <div className="section-heading">
            <span className="section-kicker">
              {t("about.kicker")}
            </span>

            <h2>
              {t("about.title")}
            </h2>

            <p>
              {t("about.description")}
            </p>
          </div>

          <div className="about-grid">
            <div className="about-visual">
              <div className="about-emblem">
                {"\u{262A}"}
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
        </section>

        {/* =================================================
            SERVICES
        ================================================= */}

        <section
          className="public-section soft-section"
          id="services"
        >
          <div className="section-heading center">
            <span className="section-kicker">
              {t("services.kicker")}
            </span>

            <h2>
              {t("services.title")}
            </h2>

            <p>
              {t(
                "services.description"
              )}
            </p>
          </div>

          <div className="service-grid">
            {[
              [
                "\u{1F465}",
                "memberManagement",
              ],
              [
                "\u{1F4B0}",
                "contributionRecording",
              ],
              [
                "\u{1F4CA}",
                "weeklyReports",
              ],
              [
                "\u{1F4C5}",
                "monthlyReports",
              ],
              [
                "\u{1F916}",
                "telegramBot",
              ],
              [
                "\u{1F5A8}\u{FE0F}",
                "printableReports",
              ],
            ].map(
              ([icon, key]) => (
                <article
                  className="service-card"
                  key={key}
                >
                  <div className="service-icon">
                    {icon}
                  </div>

                  <h3>
                    {t(
                      `services.items.${key}.title`
                    )}
                  </h3>

                  <p>
                    {t(
                      `services.items.${key}.description`
                    )}
                  </p>

                  <button
                    onClick={onAdmin}
                  >
                    {t(
                      "services.explore"
                    )}{" "}
                    <span>
                      {"\u{2192}"}
                    </span>
                  </button>
                </article>
              )
            )}
          </div>
        </section>

        {/* =================================================
            ACHIEVEMENTS
        ================================================= */}

        <section className="public-section achievements-section">
          <div className="section-heading center">
            <span className="section-kicker">
              {t(
                "achievements.kicker"
              )}
            </span>

            <h2>
              {t(
                "achievements.title"
              )}
            </h2>
          </div>

          <div className="achievement-grid">
            <div className="achievement-card">
              <strong>
                {statValue(
                  activeMembers,
                  "+"
                )}
              </strong>

              <span>
                {t(
                  "achievements.activeMembers"
                )}
              </span>
            </div>

            <div className="achievement-card">
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      totalCollection
                    )} ETB`}
              </strong>

              <span>
                {t(
                  "achievements.totalCollection"
                )}
              </span>
            </div>

            <div className="achievement-card">
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      weeklyCollection
                    )} ETB`}
              </strong>

              <span>
                {t(
                  "achievements.weeklyCollection"
                )}
              </span>
            </div>

            <div className="achievement-card">
              <strong>
                {loading
                  ? "..."
                  : `${formatMoney(
                      monthlyCollection
                    )} ETB`}
              </strong>

              <span>
                {t(
                  "achievements.monthlyCollection"
                )}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            WHY
        ================================================= */}

        <section className="public-section why-section">
          <div className="section-heading">
            <span className="section-kicker">
              {t("why.kicker")}
            </span>

            <h2>
              {t("why.title")}
            </h2>
          </div>

          <div className="why-list">
            {[
              [
                "\u{2713}",
                "simpleRecords",
              ],
              [
                "\u{25C8}",
                "accountability",
              ],
              [
                "\u{2726}",
                "duplicates",
              ],
              [
                "\u{2197}",
                "accessible",
              ],
            ].map(
              ([icon, key]) => (
                <article key={key}>
                  <span>{icon}</span>

                  <div>
                    <h3>
                      {t(
                        `why.items.${key}.title`
                      )}
                    </h3>

                    <p>
                      {t(
                        `why.items.${key}.description`
                      )}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* =================================================
            EVENTS
        ================================================= */}

        <section
          className="public-section events-section"
          id="events"
        >
          <div className="section-heading center">
            <span className="section-kicker">
              {t("events.kicker")}
            </span>

            <h2>
              {t("events.title")}
            </h2>
          </div>

          <div className="event-grid">
            <article className="event-card featured">
              <div className="event-art green-art">
                {t("events.friday")}
              </div>

              <div className="event-body">
                <span className="event-tag">
                  {t("events.weekly")}
                </span>

                <h3>
                  {t(
                    "events.fridayContribution"
                  )}
                </h3>

                <p>
                  {t(
                    "events.fridayDescription"
                  )}
                </p>

                <button
                  onClick={onAdmin}
                >
                  {t(
                    "events.manageContributions"
                  )}{" "}
                  {"\u{2192}"}
                </button>
              </div>
            </article>

            <article className="event-card">
              <div className="event-art gold-art">
                {t("events.report")}
              </div>

              <div className="event-body">
                <span className="event-tag">
                  {t("events.monthly")}
                </span>

                <h3>
                  {t(
                    "events.monthlyReview"
                  )}
                </h3>

                <p>
                  {t(
                    "events.monthlyDescription"
                  )}
                </p>

                <button
                  onClick={onAdmin}
                >
                  {t(
                    "events.viewReports"
                  )}{" "}
                  {"\u{2192}"}
                </button>
              </div>
            </article>

            <article className="event-card">
              <div className="event-art navy-art">
                {t("events.shabab")}
              </div>

              <div className="event-body">
                <span className="event-tag">
                  {t("events.community")}
                </span>

                <h3>
                  {t(
                    "events.shababActivities"
                  )}
                </h3>

                <p>
                  {t(
                    "events.activitiesDescription"
                  )}
                </p>

                <button
                  onClick={onAdmin}
                >
                  {t(
                    "events.openSystem"
                  )}{" "}
                  {"\u{2192}"}
                </button>

                <button
                  onClick={() =>
                    handlePublicNavigate(
                      "gallery"
                    )
                  }
                >
                  {t(
                    "events.viewGallery"
                  )}{" "}
                  {"\u{2192}"}
                </button>
              </div>
            </article>
          </div>
        </section>

        <Gallery />

        {/* =================================================
            MEMBERSHIP
        ================================================= */}

        <section className="public-section membership-section">
          <div className="section-heading center">
            <span className="section-kicker">
              {t(
                "membership.kicker"
              )}
            </span>

            <h2>
              {t("membership.title")}
            </h2>
          </div>

          <div className="membership-grid">
            <article>
              <span>
                {"\u{1F464}"}
              </span>

              <h3>
                {t(
                  "membership.items.members.title"
                )}
              </h3>

              <p>
                {t(
                  "membership.items.members.description"
                )}
              </p>
            </article>

            <article>
              <span>
                {"\u{1F91D}"}
              </span>

              <h3>
                {t(
                  "membership.items.volunteers.title"
                )}
              </h3>

              <p>
                {t(
                  "membership.items.volunteers.description"
                )}
              </p>
            </article>

            <article>
              <span>
                {"\u{1F4CB}"}
              </span>

              <h3>
                {t(
                  "membership.items.administrators.title"
                )}
              </h3>

              <p>
                {t(
                  "membership.items.administrators.description"
                )}
              </p>
            </article>

            <article>
              <span>
                {"\u{1F319}"}
              </span>

              <h3>
                {t(
                  "membership.items.supporters.title"
                )}
              </h3>

              <p>
                {t(
                  "membership.items.supporters.description"
                )}
              </p>
            </article>
          </div>
        </section>

       
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="public-footer">
        <div className="footer-main">
          <div>
            <div className="footer-brand">
              <span className="brand-mark">
                {"\u{262A}"}
              </span>

              <div>
                <strong>
                  MASJIDUL-FATWA SHABAB
                </strong>

                <small>
                  {t(
                    "footer.systemName"
                  )}
                </small>
              </div>
            </div>

            <p>
              {t(
                "footer.description"
              )}
            </p>
          </div>

          <div>
            <h4>
              {t(
                "footer.quickLinks"
              )}
            </h4>

            <button
              onClick={() =>
                handlePublicNavigate(
                  "home"
                )
              }
            >
              {t("nav.home")}
            </button>

            <button
              onClick={() =>
                handlePublicNavigate(
                  "about"
                )
              }
            >
              {t("nav.about")}
            </button>

            <button
              onClick={() =>
                handlePublicNavigate(
                  "services"
                )
              }
            >
              {t("nav.services")}
            </button>

            <button
              onClick={() =>
                handlePublicNavigate(
                  "gallery"
                )
              }
            >
              {t("nav.gallery")}
            </button>

            <button
              onClick={() =>
                handlePublicNavigate(
                  "contact"
                )
              }
            >
              {t("nav.contact")}
            </button>
          </div>

          <div>
            <h4>
              {t("footer.system")}
            </h4>

            <button onClick={onAdmin}>
              {t("nav.adminLogin")}
            </button>

            <button onClick={onAdmin}>
              {t("footer.members")}
            </button>

            <button onClick={onAdmin}>
              {t("footer.reports")}
            </button>

            <button onClick={onAdmin}>
              {t(
                "footer.contributions"
              )}
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            {"\u{00A9}"}{" "}
            {new Date().getFullYear()}{" "}
            {t("footer.copyright")}
          </span>

          <span>
            <a
              href="https://jemal-dev.github.io/jemal-portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              {t("footer.builtBy")}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
ADMIN LAYOUT
========================================================= */

function AdminLayout({
  currentPage,
  mobileOpen,
  setMobileOpen,
  goTo,
  dashboard,
  loading,
  error,
  adminUser,
  onLogout,
}) {
  const { t } = useTranslation();

  const adminName =
    adminUser?.full_name || "Admin";

  const adminInitial =
    adminName.charAt(0).toUpperCase();

  const adminRole =
    adminUser?.role === "super_admin"
      ? t("admin.superAdministrator")
      : t("admin.administrator");

  const visibleNavItems =
    adminUser?.role === "super_admin"
      ? navItems
      : navItems.filter(
          (item) =>
            item.id !== "settings" &&
            item.id !== "admins"
        );

  const currentNavItem =
    visibleNavItems.find(
      (item) => item.id === currentPage
    );

  const navLabels = {
    dashboard: t("nav.dashboard"),
    members: t("nav.members"),
    contributions: t("nav.contributions"),
    reports: t("nav.reports"),
    gallery: t("nav.gallery"),
    admins: t("nav.admins"),
    settings: t("nav.settings"),
  };

  return (
    <div className="admin-app">
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label={t("admin.closeMenu")}
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="logo">
          <div className="logo-icon">
            {"\u{262A}"}
          </div>

          <div>
            <h2>
              Masjidul-Fatwa
            </h2>

            <span>
              {t("admin.shababSystem")}
            </span>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-label">
            {t("admin.management")}
          </div>

          {visibleNavItems.map(
            (item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  currentPage === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(item.id)
                }
              >
                <span>
                  {item.icon}
                </span>

                {navLabels[item.id]}
              </button>
            )
          )}

          <div className="nav-label public-label">
            {t("admin.website")}
          </div>

          <button
            className="nav-item"
            onClick={() =>
              goTo("home")
            }
          >
            <span>
              {"\u{1F310}"}
            </span>

            {t("admin.publicWebsite")}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-info">
            <div className="admin-avatar">
              {adminInitial}
            </div>

            <div>
              <strong>
                {adminName}
              </strong>

              <span>
                {adminRole}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            {"\u{1F6AA}"}{" "}
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() =>
              setMobileOpen(
                (value) => !value
              )
            }
            aria-label={t("admin.openNavigation")}
          >
            {"\u{2630}"}
          </button>

          <div className="topbar-title">
            <span>
              MASJIDUL-FATWA SHABAB
            </span>

            <strong>
              {navLabels[currentPage] ||
                t("nav.dashboard")}
            </strong>
          </div>

          <div className="topbar-right">
            <button
              className="website-link"
              onClick={() =>
                goTo("home")
              }
            >
              {"\u{1F310}"}{" "}
              {t("admin.website")}
            </button>

            <div className="profile">
              <div className="profile-avatar">
                {adminInitial}
              </div>

              <div>
                <strong>
                  {adminName}
                </strong>

                <span>
                  {adminRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          {currentPage ===
            "members" && (
            <Members />
          )}

          {currentPage ===
            "gallery" && (
            <AdminGallery />
          )}

          {currentPage ===
            "contributions" && (
            <Contributions />
          )}

          {currentPage ===
            "reports" && (
            <Reports />
          )}

          {currentPage ===
            "admins" &&
            adminUser?.role ===
              "super_admin" && (
              <AdminManagement />
            )}

          {currentPage ===
            "settings" &&
            adminUser?.role ===
              "super_admin" && (
              <Settings />
            )}

          {currentPage ===
            "dashboard" && (
            <AdminDashboard
              dashboard={dashboard}
              loading={loading}
              error={error}
              onContributions={() =>
                goTo("contributions")
              }
              onMembers={() =>
                goTo("members")
              }
              onReports={() =>
                goTo("reports")
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  dashboard,
  loading,
  error,
  onContributions,
  onMembers,
  onReports,
}) {
  const { t, i18n } = useTranslation();

  const localeMap = {
    en: "en-US",
    om: "om-ET",
    am: "am-ET",
    ar: "ar",
  };

  const locale =
    localeMap[
      i18n.resolvedLanguage ||
        i18n.language ||
        "en"
    ] || "en-US";

  const trendData =
    dashboard?.collection_trend?.map(
      (item) => ({
        ...item,
        label: new Date(
          item.week_start
        ).toLocaleDateString(
          locale,
          {
            month: "short",
            day: "numeric",
          }
        ),
      })
    ) || [];

  return (
    <>
      <div className="page-header">
        <div>
          <span className="section-kicker">
            {t("dashboard.managementOverview")}
          </span>

          <h1>
            {t("dashboard.title")}
          </h1>

          <p>
            {t("dashboard.welcome")}
          </p>
        </div>

        <button
          className="add-button"
          onClick={onContributions}
        >
          + {t("dashboard.addContribution")}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            {"\u{1F465}"}
          </div>

          <div>
            <span>
              {t("dashboard.activeMembers")}
            </span>

            <h2>
              {loading ? (
                "..."
              ) : (
                <AnimatedNumber
                  value={
                    dashboard?.total_active_members ??
                    0
                  }
                  suffix="+"
                />
              )}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            {"\u{1F4B0}"}
          </div>

          <div>
            <span>
              {t("dashboard.totalCollection")}
            </span>

            <h2>
              {loading ? (
                "..."
              ) : (
                <AnimatedNumber
                  value={
                    dashboard?.total_collection ??
                    0
                  }
                  suffix=" ETB"
                />
              )}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            {"\u{1F4C5}"}
          </div>

          <div>
            <span>
              {t("dashboard.thisWeek")}
            </span>

            <h2>
              {loading ? (
                "..."
              ) : (
                <AnimatedNumber
                  value={
                    dashboard?.weekly_collection ??
                    0
                  }
                  suffix=" ETB"
                />
              )}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            {"\u{1F4C8}"}
          </div>

          <div>
            <span>
              {t("dashboard.thisMonth")}
            </span>

            <h2>
              {loading ? (
                "..."
              ) : (
                <AnimatedNumber
                  value={
                    dashboard?.monthly_collection ??
                    0
                  }
                  suffix=" ETB"
                />
              )}
            </h2>
          </div>
        </div>
      </div>

      <div className="section-card collection-trend-card">
        <div className="section-header">
          <div>
            <h2>
              {t("dashboard.collectionTrend")}
            </h2>

            <p>
              {t("dashboard.collectionTrendDescription")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="recent-loading">
            {t("dashboard.loadingCollectionTrend")}
          </div>
        ) : trendData.length > 0 ? (
          <div
            className="collection-trend-chart"
            style={{
              width: "100%",
              height: 380,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={trendData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 30,
                  bottom: 55,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  interval={0}
                  tick={{
                    fontSize: 12,
                  }}
                  tickMargin={10}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    Number(value).toLocaleString(
                      locale
                    )
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(
                      value
                    ).toLocaleString(
                      locale
                    )} ETB`,
                    t("dashboard.collection"),
                  ]}
                  labelFormatter={(label) =>
                    `${t(
                      "dashboard.weekOf"
                    )} ${label}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="total_collection"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="recent-empty">
            {t("dashboard.noCollectionData")}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>
                {t("dashboard.weeklyPaymentStatus")}
              </h2>

              <p>
                {t(
                  "dashboard.weeklyPaymentDescription"
                )}
              </p>
            </div>
          </div>

          <div className="payment-status">
            <div className="status-box paid">
              <span>
                {"\u{2713}"}
              </span>

              <div>
                <strong>
                  {loading
                    ? "..."
                    : dashboard?.paid_members_this_week ??
                      0}
                </strong>

                <p>
                  {t("dashboard.paidMembers")}
                </p>
              </div>
            </div>

            <div className="status-box unpaid">
              <span>!</span>

              <div>
                <strong>
                  {loading
                    ? "..."
                    : dashboard?.unpaid_members_this_week ??
                      0}
                </strong>

                <p>
                  {t("dashboard.unpaidMembers")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card quick-actions">
          <div className="section-header">
            <div>
              <h2>
                {t("dashboard.quickActions")}
              </h2>

              <p>
                {t(
                  "dashboard.quickActionsDescription"
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onContributions}
          >
            {"\u{1F4B0}"}{" "}
            {t(
              "dashboard.recordContribution"
            )}

            <span>
              {"\u{2192}"}
            </span>
          </button>

          <button
            onClick={onMembers}
          >
            {"\u{1F465}"}{" "}
            {t("dashboard.manageMembers")}

            <span>
              {"\u{2192}"}
            </span>
          </button>

          <button
            onClick={onReports}
          >
            {"\u{1F4CA}"}{" "}
            {t("dashboard.generateReports")}

            <span>
              {"\u{2192}"}
            </span>
          </button>
        </div>
      </div>

      <div className="section-card recent-contributions-card">
        <div className="section-header">
          <div>
            <h2>
              {t(
                "dashboard.recentContributions"
              )}
            </h2>

            <p>
              {t(
                "dashboard.recentContributionsDescription"
              )}
            </p>
          </div>

          <button
            type="button"
            className="view-all-button ui-action-link"
            onClick={onContributions}
          >
            <span>
              {t("dashboard.viewAll")}
            </span>

            <span className="ui-action-arrow">
              {"\u{2192}"}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="recent-loading">
            {t(
              "dashboard.loadingContributions"
            )}
          </div>
        ) : dashboard?.recent_contributions?.length >
          0 ? (
          <div className="recent-contributions-list">
            {dashboard.recent_contributions.map(
              (contribution) => (
                <div
                  className="recent-contribution-row"
                  key={contribution.id}
                >
                  <div className="recent-member">
                    <div className="recent-member-avatar">
                      {contribution.full_name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "?"}
                    </div>

                    <div>
                      <strong>
                        {
                          contribution.full_name
                        }
                      </strong>

                      <span>
                        {
                          contribution.contribution_date
                        }
                      </span>
                    </div>
                  </div>

                  <strong className="recent-amount">
                    {Number(
                      contribution.amount ||
                        0
                    ).toLocaleString(
                      locale,
                      {
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    ETB
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="recent-empty">
            {t(
              "dashboard.noContributions"
            )}
          </div>
        )}
      </div>
    </>
  );
}
export default App;
