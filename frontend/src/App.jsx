import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import Login from "./Login";
import Members from "./Members";
import Contributions from "./Contributions";
import Settings from "./Settings";
import Reports from "./Reports";
import AdminManagement from "./AdminManagement";

/* =========================================================
   AXIOS BASE URL
   Local: uses Vite proxy → http://localhost:5000
   Production: uses deployed backend
========================================================= */

axios.defaults.baseURL =
  import.meta.env.PROD
    ? "https://masjidul-fatwa-l6ao.vercel.app"
    : "";

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
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   AXIOS RESPONSE INTERCEPTOR
========================================================= */

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    /*
      Do NOT automatically logout when the login request
      itself fails. Login.jsx will display the error message.
    */
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
    icon: "▣",
  },
  {
    id: "members",
    label: "Members",
    icon: "👥",
  },
  {
    id: "contributions",
    label: "Contributions",
    icon: "💰",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "📊",
  },
  {
    id: "admins",
    label: "Admins",
    icon: "🛡️",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
  },
];

/* =========================================================
   ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
  value,
  suffix = "",
}) {
  const [displayValue, setDisplayValue] =
    useState(0);

  useEffect(() => {
    const target = Number(value) || 0;

    setDisplayValue(0);

    const duration = 1200;
    const startTime = performance.now();

    let animationFrame;

    const animate = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) /
          duration,
        1
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.floor(
          target * easedProgress
        )
      );

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(
            animate
          );
      } else {
        setDisplayValue(target);
      }
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
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
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState("home");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [adminUser, setAdminUser] =
    useState(null);

  const [authChecking, setAuthChecking] =
    useState(true);

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
        const user =
          JSON.parse(savedUser);

        setAdminUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error(
          "Invalid saved user:",
          error
        );

        localStorage.removeItem(
          "adminToken"
        );

        localStorage.removeItem(
          "adminUser"
        );
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
        await axios.get(
          "/api/dashboard"
        );

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
      "login",
    ];

    /*
      If the user is logged out but somehow
      tries to open an admin page, return to home.
    */
    if (
      !isLoggedIn &&
      !publicPages.includes(
        currentPage
      )
    ) {
      setCurrentPage("home");
      setMobileOpen(false);
      return;
    }

    /*
      Only Super Admin can access
      Admin Management and Settings.
    */
    if (
      isLoggedIn &&
      (currentPage === "settings" ||
        currentPage === "admins") &&
      adminUser?.role !==
        "super_admin"
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
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUser"
    );

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
      "admins",
      "settings",
    ];

    /*
      Not logged in?
      Send the user to login.
    */
    if (
      protectedPages.includes(page) &&
      !isLoggedIn
    ) {
      setCurrentPage("login");
      setMobileOpen(false);
      return;
    }

    /*
      Only Super Admin can access
      Admin Management and Settings.
    */
    if (
      (page === "settings" ||
        page === "admins") &&
      adminUser?.role !==
        "super_admin"
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
    return (
      <div className="auth-loading">
        <div className="auth-loading-card">
          <div className="login-logo">
            ☪
          </div>

          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN APP
  ===================================================== */

  return (
    <div className="app-shell">
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
      ) : (
        <AdminLayout
          currentPage={currentPage}
          mobileOpen={mobileOpen}
          setMobileOpen={
            setMobileOpen
          }
          goTo={goTo}
          dashboard={dashboard}
          loading={loading}
          error={error}
          reloadDashboard={
            loadDashboard
          }
          adminUser={adminUser}
          onLogout={handleLogout}
        />
      )}
    </div>
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
  const activeMembers =
    dashboard?.total_active_members ??
    0;

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
    Number(
      value || 0
    ).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  return (
    <div className="public-site">
      <header className="public-header">
        <button
          className="brand"
          onClick={() =>
            onNavigate("home")
          }
        >
          <span className="brand-mark">
            ☪
          </span>

          <span>
            <strong>
              MASJIDUL-FATWA
            </strong>

            <small>SHABAB</small>
          </span>
        </button>

        <nav className="public-nav">
          <button
            onClick={() =>
              onNavigate("home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              onNavigate("about")
            }
          >
            About
          </button>

          <button
            onClick={() =>
              onNavigate("services")
            }
          >
            Services
          </button>

          <button
            onClick={() =>
              onNavigate("events")
            }
          >
            Activities
          </button>

          <button
            onClick={() =>
              onNavigate("contact")
            }
          >
            Contact
          </button>
        </nav>

        <button
          className="header-admin-btn"
          onClick={onAdmin}
        >
          Admin Login
        </button>
      </header>

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
              <span>✦</span>{" "}
              Youth Contribution &
              Management
            </div>

            <h1>
              Building Community
              <span>
                {" "}
                Through Contribution &
                Impact
              </span>
            </h1>

            <p>
              A transparent digital platform
              for Masjidul-Fatwa Shabab to
              manage members, record weekly
              contributions, and keep clear
              community records.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() =>
                  onNavigate(
                    "services"
                  )
                }
              >
                Explore Our Services{" "}
                <span>→</span>
              </button>

              <button
                className="secondary-btn"
                onClick={onAdmin}
              >
                Admin Login
              </button>
            </div>

            <div className="hero-note">
              <span>✓</span>{" "}
              Organized records
              &nbsp;•&nbsp;
              <span>✓</span>{" "}
              Transparent contributions
              &nbsp;•&nbsp;
              <span>✓</span>{" "}
              Community focused
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow glow-one" />
            <div className="glow glow-two" />

            <div className="community-card main-community-card">
              <div className="community-icon">
                🕌
              </div>

              <div>
                <span>
                  MASJIDUL-FATWA
                </span>

                <strong>
                  SHABAB
                </strong>

                <small>
                  Youth Contribution &
                  Management System
                </small>
              </div>
            </div>

            <div className="floating-card card-members">
              <span>👥</span>

              <div>
                <small>
                  Active Members
                </small>

                <strong>
                  {statValue(
                    activeMembers
                  )}
                </strong>
              </div>
            </div>

            <div className="floating-card card-money">
              <span>💰</span>

              <div>
                <small>
                  Total Collection
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
            Our Collective Impact
          </div>

          <h2>
            Real numbers from our
            contribution system
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
                Active Members
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
                This Week
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
                This Month
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
                Total Collection
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
              Who We Are
            </span>

            <h2>
              A community built on trust,
              responsibility and service.
            </h2>

            <p>
              Masjidul-Fatwa Shabab is a
              youth community that values
              organized contribution,
              cooperation and accountability.
              This platform helps turn
              paper-based records into a clear
              digital system.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-visual">
              <div className="about-emblem">
                ☪
              </div>

              <div className="about-label">
                Community • Contribution •
                Impact
              </div>
            </div>

            <div className="about-points">
              <article>
                <span>01</span>

                <div>
                  <h3>
                    Transparent Records
                  </h3>

                  <p>
                    Contributions are stored
                    digitally so administrators
                    can review records without
                    depending on paper
                    notebooks.
                  </p>
                </div>
              </article>

              <article>
                <span>02</span>

                <div>
                  <h3>
                    Responsible Management
                  </h3>

                  <p>
                    Members, payments and
                    reports are organized in
                    one management system.
                  </p>
                </div>
              </article>

              <article>
                <span>03</span>

                <div>
                  <h3>
                    Community Impact
                  </h3>

                  <p>
                    Clear records make it
                    easier to understand
                    participation and the
                    resources collected by
                    the Shabab.
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
              Our Services
            </span>

            <h2>
              Everything the Shabab team
              needs in one place.
            </h2>

            <p>
              The public website and
              management system work together
              to keep community administration
              simple.
            </p>
          </div>

          <div className="service-grid">
            {[
              [
                "👥",
                "Member Management",
                "Add, edit, activate and manage Shabab member information.",
              ],
              [
                "💰",
                "Contribution Recording",
                "Record weekly contributions and prevent duplicate records.",
              ],
              [
                "📊",
                "Weekly Reports",
                "See paid members, unpaid members and weekly collection totals.",
              ],
              [
                "📅",
                "Monthly Reports",
                "Review monthly contribution records and member totals.",
              ],
              [
                "🤖",
                "Telegram Bot",
                "Manage contribution tasks and reports through the Shabab Telegram bot.",
              ],
              [
                "🖨️",
                "Printable Reports",
                "Create clean reports suitable for saving and printing.",
              ],
            ].map(
              ([icon, title, text]) => (
                <article
                  className="service-card"
                  key={title}
                >
                  <div className="service-icon">
                    {icon}
                  </div>

                  <h3>{title}</h3>

                  <p>{text}</p>

                  <button
                    onClick={onAdmin}
                  >
                    Explore{" "}
                    <span>→</span>
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
              Our Achievements
            </span>

            <h2>
              The system reflects the work
              of our community.
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
                Active Shabab Members
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
                Total Recorded Collection
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
                Current Weekly Collection
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
                Current Monthly Collection
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
              Why This Platform
            </span>

            <h2>
              Designed to make contribution
              management clearer.
            </h2>
          </div>

          <div className="why-list">
            {[
              [
                "✓",
                "Simple record keeping",
                "Move weekly records from paper into a structured digital database.",
              ],
              [
                "◈",
                "Better accountability",
                "Reports make contribution activity easier for administrators to review.",
              ],
              [
                "✦",
                "Fewer duplicate records",
                "The contribution workflow checks for duplicate entries for the same date.",
              ],
              [
                "↗",
                "Accessible information",
                "Authorized administrators can use the website or Telegram bot.",
              ],
            ].map(
              ([icon, title, text]) => (
                <article key={title}>
                  <span>{icon}</span>

                  <div>
                    <h3>{title}</h3>

                    <p>{text}</p>
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
              Community Activities
            </span>

            <h2>
              Keeping the Shabab connected
              and organized.
            </h2>
          </div>

          <div className="event-grid">
            <article className="event-card featured">
              <div className="event-art green-art">
                FRIDAY
              </div>

              <div className="event-body">
                <span className="event-tag">
                  Weekly
                </span>

                <h3>
                  Friday Contribution
                </h3>

                <p>
                  Weekly contribution activity
                  and payment recording for
                  Shabab members.
                </p>

                <button
                  onClick={onAdmin}
                >
                  Manage Contributions →
                </button>
              </div>
            </article>

            <article className="event-card">
              <div className="event-art gold-art">
                REPORT
              </div>

              <div className="event-body">
                <span className="event-tag">
                  Monthly
                </span>

                <h3>
                  Monthly Review
                </h3>

                <p>
                  Review monthly contribution
                  records and understand the
                  collected amount.
                </p>

                <button
                  onClick={onAdmin}
                >
                  View Reports →
                </button>
              </div>
            </article>

            <article className="event-card">
              <div className="event-art navy-art">
                SHABAB
              </div>

              <div className="event-body">
                <span className="event-tag">
                  Community
                </span>

                <h3>
                  Shabab Activities
                </h3>

                <p>
                  Use the platform as a
                  foundation for organized youth
                  community activities.
                </p>

                <button
                  onClick={onAdmin}
                >
                  Open System →
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* =================================================
            MEMBERSHIP
        ================================================= */}

        <section className="public-section membership-section">
          <div className="section-heading center">
            <span className="section-kicker">
              Who Can Be Our Member?
            </span>

            <h2>
              A place for Shabab who want to
              contribute and serve.
            </h2>
          </div>

          <div className="membership-grid">
            <article>
              <span>👤</span>

              <h3>
                Shabab Members
              </h3>

              <p>
                Members participating in the
                community and weekly
                contribution activities.
              </p>
            </article>

            <article>
              <span>🤝</span>

              <h3>
                Community Volunteers
              </h3>

              <p>
                People supporting community
                programs and organized
                activities.
              </p>
            </article>

            <article>
              <span>📋</span>

              <h3>
                Administrators
              </h3>

              <p>
                Authorized people responsible
                for managing records and
                reports.
              </p>
            </article>

            <article>
              <span>🌙</span>

              <h3>
                Community Supporters
              </h3>

              <p>
                Supporters who want to
                strengthen positive community
                initiatives.
              </p>
            </article>
          </div>
        </section>

        {/* =================================================
            COMMITMENT
        ================================================= */}

        <section className="commitment-section">
          <div>
            <span className="section-kicker light">
              Our Commitment
            </span>

            <h2>
              Growing together through
              organized contribution.
            </h2>

            <p>
              Every contribution matters. The
              purpose of this system is to make
              the process easier to record,
              review and manage while keeping
              the community at the center.
            </p>

            <button
              className="light-btn"
              onClick={onAdmin}
            >
              Enter Management System →
            </button>
          </div>

          <div className="commitment-mark">
            ☪
          </div>
        </section>

        {/* =================================================
            CONTACT
        ================================================= */}

        <section
          className="public-section contact-section"
          id="contact"
        >
          <div className="section-heading center">
            <span className="section-kicker">
              Get In Touch
            </span>

            <h2>
              Connect with Masjidul-Fatwa
              Shabab.
            </h2>

            <p>
              Contact information can be added
              here when the official Shabab
              phone, email, Telegram channel
              and location details are ready.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <span>📍</span>

              <h3>Location</h3>

              <p>
                Masjidul-Fatwa community
              </p>
            </div>

            <div className="contact-card">
              <span>📱</span>

              <h3>Telegram</h3>

              <p>
                Official Shabab Telegram
                communication
              </p>
            </div>

            <div className="contact-card">
              <span>✉️</span>

              <h3>Email</h3>

              <p>
                Official contact details can
                be added here
              </p>
            </div>
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
                ☪
              </span>

              <div>
                <strong>
                  MASJIDUL-FATWA SHABAB
                </strong>

                <small>
                  Youth Contribution &
                  Management System
                </small>
              </div>
            </div>

            <p>
              Building a stronger community
              through organization,
              contribution and responsible
              service.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>

            <button
              onClick={() =>
                onNavigate("home")
              }
            >
              Home
            </button>

            <button
              onClick={() =>
                onNavigate("about")
              }
            >
              About
            </button>

            <button
              onClick={() =>
                onNavigate("services")
              }
            >
              Services
            </button>

            <button
              onClick={() =>
                onNavigate("contact")
              }
            >
              Contact
            </button>
          </div>

          <div>
            <h4>System</h4>

            <button onClick={onAdmin}>
              Admin Login
            </button>

            <button onClick={onAdmin}>
              Members
            </button>

            <button onClick={onAdmin}>
              Reports
            </button>

            <button onClick={onAdmin}>
              Contributions
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()}{" "}
            Masjidul-Fatwa Shabab. All rights
            reserved.
          </span>

          <span>
            Built by Jemal Seid
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
  const adminName =
    adminUser?.full_name || "Admin";

  const adminInitial =
    adminName
      .charAt(0)
      .toUpperCase();

  const adminRole =
    adminUser?.role ===
    "super_admin"
      ? "Super Administrator"
      : "Administrator";

  /*
    Only Super Admin can see
    Admin Management and Settings.
  */
  const visibleNavItems =
    adminUser?.role ===
    "super_admin"
      ? navItems
      : navItems.filter(
          (item) =>
            item.id !==
              "settings" &&
            item.id !== "admins"
        );

  /*
    This makes the topbar title also use
    only the pages the current admin can access.
  */
  const currentNavItem =
    visibleNavItems.find(
      (item) =>
        item.id === currentPage
    );

  return (
    <div className="admin-app">
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
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
            ☪
          </div>

          <div>
            <h2>
              Masjidul-Fatwa
            </h2>

            <span>
              Shabab System
            </span>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-label">
            Management
          </div>

          {visibleNavItems.map(
            (item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  currentPage ===
                  item.id
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

                {item.label}
              </button>
            )
          )}

          <div className="nav-label public-label">
            Website
          </div>

          <button
            className="nav-item"
            onClick={() =>
              goTo("home")
            }
          >
            <span>🌐</span>

            Public Website
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
            🚪 Logout
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
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div className="topbar-title">
            <span>
              MASJIDUL-FATWA SHABAB
            </span>

            <strong>
              {currentNavItem?.label ||
                "Dashboard"}
            </strong>
          </div>

          <div className="topbar-right">
            <button
              className="website-link"
              onClick={() =>
                goTo("home")
              }
            >
              🌐 Website
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
            "contributions" && (
            <Contributions />
          )}

          {currentPage ===
            "reports" && (
            <Reports />
          )}

          {/* =================================================
              ADMIN MANAGEMENT
          ================================================= */}

          {currentPage === "admins" &&
            adminUser?.role ===
              "super_admin" && (
              <AdminManagement />
            )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {currentPage ===
            "settings" &&
            adminUser?.role ===
              "super_admin" && (
              <Settings />
            )}

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {currentPage ===
            "dashboard" && (
            <AdminDashboard
              dashboard={dashboard}
              loading={loading}
              error={error}
              onContributions={() =>
                goTo(
                  "contributions"
                )
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
  return (
    <>
      <div className="page-header">
        <div>
          <span className="section-kicker">
            Management Overview
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome to the Masjidul-Fatwa
            Shabab Contribution System.
          </p>
        </div>

        <button
          className="add-button"
          onClick={onContributions}
        >
          + Add Contribution
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =================================================
          DASHBOARD STATISTICS
      ================================================= */}

      <div className="stats-grid">
        {/* ACTIVE MEMBERS */}

        <div className="stat-card">
          <div className="stat-icon">
            👥
          </div>

          <div>
            <span>
              Active Members
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

        {/* TOTAL COLLECTION */}

        <div className="stat-card">
          <div className="stat-icon">
            💰
          </div>

          <div>
            <span>
              Total Collection
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

        {/* THIS WEEK */}

        <div className="stat-card">
          <div className="stat-icon">
            📅
          </div>

          <div>
            <span>
              This Week
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

        {/* THIS MONTH */}

        <div className="stat-card">
          <div className="stat-icon">
            📈
          </div>

          <div>
            <span>
              This Month
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

      {/* =================================================
          DASHBOARD GRID
      ================================================= */}

            <div className="dashboard-grid">
        {/* WEEKLY PAYMENT STATUS */}

        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>
                Weekly Payment Status
              </h2>

              <p>
                Member contribution status
                for the current week.
              </p>
            </div>
          </div>

          <div className="payment-status">
            {/* PAID */}

            <div className="status-box paid">
              <span>✓</span>

              <div>
                <strong>
                  {loading
                    ? "..."
                    : dashboard?.paid_members_this_week ??
                      0}
                </strong>

                <p>
                  Paid Members
                </p>
              </div>
            </div>

            {/* UNPAID */}

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
                  Unpaid Members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="section-card quick-actions">
          <div className="section-header">
            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Jump directly to common
                tasks.
              </p>
            </div>
          </div>

          <button
            onClick={onContributions}
          >
            💰 Record Contribution
            <span>→</span>
          </button>

          <button
            onClick={onMembers}
          >
            👥 Manage Members
            <span>→</span>
          </button>

          <button
            onClick={onReports}
          >
            📊 Generate Reports
            <span>→</span>
          </button>
        </div>
      </div>

      {/* =================================================
          RECENT CONTRIBUTIONS
      ================================================= */}

      <div className="section-card recent-contributions-card">
        <div className="section-header">
          <div>
            <h2>
              Recent Contributions
            </h2>

            <p>
              The latest contribution records.
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={onContributions}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="recent-loading">
            Loading contributions...
          </div>
        ) : dashboard?.recent_contributions?.length > 0 ? (
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
                        ?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <strong>
                        {contribution.full_name}
                      </strong>

                      <span>
                        {contribution.contribution_date}
                      </span>
                    </div>
                  </div>

                  <strong className="recent-amount">
                    {Number(
                      contribution.amount || 0
                    ).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    ETB
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="recent-empty">
            No contributions recorded yet.
          </div>
        )}
      </div>
    </>
  );
}

export default App;