import { useState } from "react";

import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
} from "react-icons/fi";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";

const translations = {
  en: {
    language: "Language",

    home: "Home",
    about: "About",
    services: "Services",
    activities: "Activities",
    gallery: "Gallery",
    contact: "Contact",
    adminLogin: "Admin Login",

    getInTouch: "GET IN TOUCH",
    contactUs: "Contact Us",
    heroText:
      "We are here to answer your questions and welcome your support.",

    sendMessageKicker: "SEND US A MESSAGE",
    sendUsMessage: "Send Us a Message",
    messageIntro:
      "Fill out the form below and we will get back to you as soon as possible.",

    messageReceived:
      "Your message has been received. Thank you for contacting Masjidul-Fatwa Shabab.",

    fullName: "Full Name",
    yourName: "Your name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    optional: "(optional)",
    phonePlaceholder: "+251 9XX XXX XXX",
    message: "Message",
    messagePlaceholder: "Write your message here...",
    sendMessage: "Send Message",
    privacy:
      "We respect your privacy. Your details are only used to respond to your message.",

    contactInformation: "CONTACT INFORMATION",
    getInTouchTitle: "Get in Touch",
    contactIntro:
      "Reach out to Masjidul-Fatwa Shabab using the information below.",

    location: "Location",
    locationName: "Masjidul-Fatwa Shabab",
    address:
      "Awara Gema, Shalla, West Arsi Zone, Oromia, Ethiopia",

    phoneNumberTitle: "Phone Number",
    emailAddressTitle: "Email Address",

    supportHours: "Support Hours",
    mondayFriday: "Monday - Friday",
    supportText:
      "Available for community questions and support",

    ourLocation: "OUR LOCATION",
    findUs: "Find Us",
    visitText:
      "Visit or contact the Masjidul-Fatwa Shabab community.",

    mapTitle: "Masjidul-Fatwa Location",
    openInMaps: "Open in Maps",

    stayConnected: "STAY CONNECTED",
    followUs: "Follow Us",
    followText:
      "Stay connected with Masjidul-Fatwa Shabab.",

    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    telegram: "Telegram",

    stayUpdatedKicker: "STAY UPDATED",
    stayUpdated: "Stay Updated",
    newsletterText:
      "Get the latest news and events from Masjidul-Fatwa Shabab delivered to your inbox.",
    emailPlaceholder: "Your email address",
    subscribe: "Subscribe",
    subscribed:
      "Thank you for subscribing to Masjidul-Fatwa Shabab.",

    footerSubtitle: "Youth Contribution & Management System",
    footerDescription:
      "Building a stronger community through organization, contribution and responsible service.",

    quickLinks: "QUICK LINKS",
    programs: "PROGRAMS",
    membership: "Shabab Membership",
    membershipText: "Community membership",
    contribution: "Friday Contribution",
    contributionText: "Weekly community contribution",

    footerContact: "CONTACT",

    allRightsReserved:
      "All rights reserved.",
    builtBy: "Built by Jemal Seid",
  },

  om: {
    language: "Afaan",

    home: "Mana",
    about: "Waa'ee Keenya",
    services: "Tajaajilawwan",
    activities: "Hojiiwwan",
    gallery: "Suuraa",
    contact: "Nu Qunnamaa",
    adminLogin: "Seensa Bulchaa",

    getInTouch: "NU QUNNAMAA",
    contactUs: "Nu Qunnamaa",
    heroText:
      "Gaaffii keessaniif deebii kennuuf fi deeggarsa keessan simachuuf as jirra.",

    sendMessageKicker: "ERGA NUUF ERGI",
    sendUsMessage: "Ergaa Nuuf Ergi",
    messageIntro:
      "Unka armaan gadii guutaa; yeroo gabaabaa keessatti deebii isinii kennina.",

    messageReceived:
      "Ergaan keessan nu gaheera. Masjidul-Fatwa Shabab qunnamuu keessaniif galatoomaa.",

    fullName: "Maqaa Guutuu",
    yourName: "Maqaa keessan",
    emailAddress: "Teessoo Imeelii",
    phoneNumber: "Lakkoofsa Bilbilaa",
    optional: "(dirqama miti)",
    phonePlaceholder: "+251 9XX XXX XXX",
    message: "Ergaa",
    messagePlaceholder: "Ergaa keessan asitti barreessaa...",
    sendMessage: "Ergaa Ergi",
    privacy:
      "Iccitii keessan ni kabajna. Odeeffannoon keessan ergaa keessaniif deebii kennuuf qofa fayyada.",

    contactInformation: "ODEEFFANNOO QUNNAMTII",
    getInTouchTitle: "Nu Qunnamaa",
    contactIntro:
      "Odeeffannoo armaan gadiin Masjidul-Fatwa Shabab qunnamaa.",

    location: "Bakka",
    locationName: "Masjidul-Fatwa Shabab",
    address:
      "Awara Gema, Shalla, Godina Arsii Lixaa, Oromiyaa, Itoophiyaa",

    phoneNumberTitle: "Lakkoofsa Bilbilaa",
    emailAddressTitle: "Teessoo Imeelii",

    supportHours: "Sa'aatii Deeggarsaa",
    mondayFriday: "Wiixata - Jimaata",
    supportText:
      "Gaaffii hawaasaa fi deeggarsaaf argama.",

    ourLocation: "BAKKA KEENYA",
    findUs: "Nu Argadhaa",
    visitText:
      "Hawaasa Masjidul-Fatwa Shabab daawwadhaa yookaan qunnamaa.",

    mapTitle: "Bakka Masjidul-Fatwa",
    openInMaps: "Kaartaa Keessatti Bani",

    stayConnected: "WAL QABAMAA",
    followUs: "Nu Hordofaa",
    followText:
      "Masjidul-Fatwa Shabab waliin walitti hidhamaa.",

    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    telegram: "Telegram",

    stayUpdatedKicker: "HAAROMSA ARGADHAA",
    stayUpdated: "Haaromsa Argadhaa",
    newsletterText:
      "Oduu fi taateewwan haaraa Masjidul-Fatwa Shabab irraa gara imeelii keessaniitti argadhaa.",
    emailPlaceholder: "Teessoo imeelii keessan",
    subscribe: "Galmaa'i",
    subscribed:
      "Masjidul-Fatwa Shabab irratti galmaa'uuf galatoomaa.",

    footerSubtitle: "Sirna Gumaacha fi Bulchiinsa Dargaggootaa",
    footerDescription:
      "Qindoomina, gumaacha fi tajaajila itti gaafatamummaa qabuun hawaasa cimaa ijaaruu.",

    quickLinks: "QABSIISAWAN",
    programs: "PROGRAMOOTA",
    membership: "Miseensummaa Shabab",
    membershipText: "Miseensummaa hawaasaa",
    contribution: "Gumaacha Jima'aa",
    contributionText: "Gumaacha torban torbanii",

    footerContact: "QUNNAMTII",

    allRightsReserved:
      "Mirgi hundi eegamaadha.",
    builtBy: "Kan ijaare Jemal Seid",
  },

  am: {
    language: "ቋንቋ",

    home: "መነሻ",
    about: "ስለ እኛ",
    services: "አገልግሎቶች",
    activities: "ተግባራት",
    gallery: "ፎቶዎች",
    contact: "ያግኙን",
    adminLogin: "የአስተዳዳሪ መግቢያ",

    getInTouch: "ያግኙን",
    contactUs: "ያግኙን",
    heroText:
      "ጥያቄዎችዎን ለመመለስ እና ድጋፍዎን ለመቀበል እዚህ ነን።",

    sendMessageKicker: "መልዕክት ይላኩልን",
    sendUsMessage: "መልዕክት ይላኩልን",
    messageIntro:
      "ከታች ያለውን ቅጽ ይሙሉ፤ በተቻለ ፍጥነት ምላሽ እንሰጣለን።",

    messageReceived:
      "መልዕክትዎ ደርሶናል። Masjidul-Fatwa Shabab ስላገኙን እናመሰግናለን።",

    fullName: "ሙሉ ስም",
    yourName: "ስምዎ",
    emailAddress: "የኢሜይል አድራሻ",
    phoneNumber: "ስልክ ቁጥር",
    optional: "(አማራጭ)",
    phonePlaceholder: "+251 9XX XXX XXX",
    message: "መልዕክት",
    messagePlaceholder: "መልዕክትዎን እዚህ ይጻፉ...",
    sendMessage: "መልዕክት ላክ",
    privacy:
      "ግላዊነትዎን እናከብራለን። ዝርዝሮችዎ ለመልዕክትዎ ምላሽ ለመስጠት ብቻ ይጠቀማሉ።",

    contactInformation: "የግንኙነት መረጃ",
    getInTouchTitle: "ያግኙን",
    contactIntro:
      "ከታች ባለው መረጃ Masjidul-Fatwa Shababን ያግኙ።",

    location: "አድራሻ",
    locationName: "Masjidul-Fatwa Shabab",
    address:
      "አዋራ ገማ፣ ሻላ፣ ዌስት አርሲ ዞን፣ ኦሮሚያ፣ ኢትዮጵያ",

    phoneNumberTitle: "ስልክ ቁጥር",
    emailAddressTitle: "የኢሜይል አድራሻ",

    supportHours: "የድጋፍ ሰዓት",
    mondayFriday: "ሰኞ - አርብ",
    supportText:
      "ለማህበረሰብ ጥያቄዎች እና ድጋፍ ይገኛል።",

    ourLocation: "አድራሻችን",
    findUs: "ያግኙን",
    visitText:
      "የMasjidul-Fatwa Shabab ማህበረሰብን ይጎብኙ ወይም ያግኙ።",

    mapTitle: "የMasjidul-Fatwa አድራሻ",
    openInMaps: "በካርታ ክፈት",

    stayConnected: "ተገናኝተው ይቆዩ",
    followUs: "ይከተሉን",
    followText:
      "ከMasjidul-Fatwa Shabab ጋር ተገናኝተው ይቆዩ።",

    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    telegram: "Telegram",

    stayUpdatedKicker: "ወቅታዊ መረጃ",
    stayUpdated: "ወቅታዊ መረጃ ያግኙ",
    newsletterText:
      "የMasjidul-Fatwa Shabab የቅርብ ጊዜ ዜናዎችን እና ዝግጅቶችን በኢሜይልዎ ያግኙ።",
    emailPlaceholder: "የኢሜይል አድራሻዎ",
    subscribe: "ይመዝገቡ",
    subscribed:
      "በMasjidul-Fatwa Shabab ስለተመዘገቡ እናመሰግናለን።",

    footerSubtitle: "የወጣቶች የግንኙነት እና አስተዳደር ስርዓት",
    footerDescription:
      "በአደረጃጀት፣ በአስተዋጽኦ እና በኃላፊነት የሚሰጥ አገልግሎት ጠንካራ ማህበረሰብ መገንባት።",

    quickLinks: "ፈጣን አገናኞች",
    programs: "ፕሮግራሞች",
    membership: "የShabab አባልነት",
    membershipText: "የማህበረሰብ አባልነት",
    contribution: "የዓርብ አስተዋጽኦ",
    contributionText: "ሳምንታዊ የማህበረሰብ አስተዋጽኦ",

    footerContact: "ግንኙነት",

    allRightsReserved:
      "መብቱ በሙሉ የተጠበቀ ነው።",
    builtBy: "በJemal Seid የተሰራ",
  },

  ar: {
    language: "اللغة",

    home: "الرئيسية",
    about: "من نحن",
    services: "الخدمات",
    activities: "الأنشطة",
    gallery: "المعرض",
    contact: "اتصل بنا",
    adminLogin: "دخول المسؤول",

    getInTouch: "تواصل معنا",
    contactUs: "اتصل بنا",
    heroText:
      "نحن هنا للإجابة عن أسئلتكم والترحيب بدعمكم.",

    sendMessageKicker: "أرسل لنا رسالة",
    sendUsMessage: "أرسل لنا رسالة",
    messageIntro:
      "املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن.",

    messageReceived:
      "تم استلام رسالتك. شكرًا لتواصلك مع شباب مسجد الفتوى.",

    fullName: "الاسم الكامل",
    yourName: "اسمك",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    optional: "(اختياري)",
    phonePlaceholder: "+251 9XX XXX XXX",
    message: "الرسالة",
    messagePlaceholder: "اكتب رسالتك هنا...",
    sendMessage: "إرسال الرسالة",
    privacy:
      "نحترم خصوصيتك. تُستخدم بياناتك فقط للرد على رسالتك.",

    contactInformation: "معلومات الاتصال",
    getInTouchTitle: "تواصل معنا",
    contactIntro:
      "تواصل مع شباب مسجد الفتوى باستخدام المعلومات أدناه.",

    location: "الموقع",
    locationName: "Masjidul-Fatwa Shabab",
    address:
      "Awara Gema, Shalla, West Arsi Zone, Oromia, Ethiopia",

    phoneNumberTitle: "رقم الهاتف",
    emailAddressTitle: "البريد الإلكتروني",

    supportHours: "ساعات الدعم",
    mondayFriday: "الاثنين - الجمعة",
    supportText:
      "متاح لأسئلة المجتمع والدعم.",

    ourLocation: "موقعنا",
    findUs: "موقعنا",
    visitText:
      "قم بزيارة مجتمع شباب مسجد الفتوى أو تواصل معنا.",

    mapTitle: "موقع مسجد الفتوى",
    openInMaps: "فتح في الخرائط",

    stayConnected: "ابقَ على تواصل",
    followUs: "تابعنا",
    followText:
      "ابقَ على تواصل مع شباب مسجد الفتوى.",

    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    telegram: "Telegram",

    stayUpdatedKicker: "ابقَ على اطلاع",
    stayUpdated: "ابقَ على اطلاع",
    newsletterText:
      "احصل على آخر الأخبار والفعاليات من شباب مسجد الفتوى مباشرة إلى بريدك الإلكتروني.",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك",
    subscribed:
      "شكرًا لاشتراكك مع شباب مسجد الفتوى.",

    footerSubtitle: "نظام مساهمة وإدارة الشباب",
    footerDescription:
      "بناء مجتمع أقوى من خلال التنظيم والمساهمة والخدمة المسؤولة.",

    quickLinks: "روابط سريعة",
    programs: "البرامج",
    membership: "عضوية الشباب",
    membershipText: "عضوية المجتمع",
    contribution: "مساهمة الجمعة",
    contributionText: "المساهمة المجتمعية الأسبوعية",

    footerContact: "الاتصال",

    allRightsReserved:
      "جميع الحقوق محفوظة.",
    builtBy: "تم التطوير بواسطة Jemal Seid",
  },
};

function Contact({ onNavigate, onAdmin }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("contactLanguage") || "en";
    } catch {
      return "en";
    }
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const [selectedSocial, setSelectedSocial] = useState("");

  const t = translations[language];
  const isArabic = language === "ar";

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    setLanguage(nextLanguage);

    try {
      localStorage.setItem("contactLanguage", nextLanguage);
    } catch {
      // Ignore localStorage errors.
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      return;
    }

    setNewsletterSubmitted(true);
    setNewsletterEmail("");
  };

  return (
    <div
      className={`contact-page ${
        isArabic ? "contact-page-rtl" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="public-header contact-header">

        <button
          className="brand"
          onClick={() => onNavigate("home")}
        >
          <span className="brand-mark">
            {"\u{262A}"}
          </span>

          <span>
            <strong>
              MASJIDUL-FATWA
            </strong>

            <small>
              SHABAB
            </small>
          </span>
        </button>

        <nav className="public-nav">

          <button
            onClick={() => onNavigate("home")}
          >
            {t.home}
          </button>

          <button
            onClick={() => onNavigate("about")}
          >
            {t.about}
          </button>

          <button
            onClick={() => onNavigate("services")}
          >
            {t.services}
          </button>

          <button
            onClick={() => onNavigate("events")}
          >
            {t.activities}
          </button>

          <button
            onClick={() => onNavigate("gallery")}
          >
            {t.gallery}
          </button>

          <button className="active">
            {t.contact}
          </button>

        </nav>

        <div className="contact-header-actions">

          <label
            className="contact-language-label"
            htmlFor="contact-language"
          >
            {t.language}
          </label>

          <select
            id="contact-language"
            className="contact-language-select"
            value={language}
            onChange={handleLanguageChange}
            aria-label={t.language}
          >
            <option value="en">English</option>
            <option value="om">Afaan Oromo</option>
            <option value="am">አማርኛ</option>
            <option value="ar">العربية</option>
          </select>

          <button
            className="header-admin-btn"
            onClick={onAdmin}
          >
            {t.adminLogin}
          </button>

        </div>

      </header>


      {/* =================================================
          CONTACT HERO
      ================================================= */}

      <section
        id="contact-hero"
        className="contact-hero"
      >

        <div className="contact-hero-overlay" />

        <div className="contact-hero-content">

          <span className="section-kicker light">
            {t.getInTouch}
          </span>

          <h1>
            {t.contactUs}
          </h1>

          <p>
            {t.heroText}
          </p>

        </div>

      </section>


      {/* =================================================
          MESSAGE FORM
      ================================================= */}

      <section className="contact-message-section">

        <div className="contact-heading">

          <span className="section-kicker">
            {t.sendMessageKicker}
          </span>

          <h2>
            {t.sendUsMessage}
          </h2>

          <p>
            {t.messageIntro}
          </p>

          <div className="contact-divider">
            <span />
            <strong>
              {"\u{2022}"}
            </strong>
            <span />
          </div>

        </div>


        <div className="contact-form-wrapper">

          {submitted && (
            <div className="contact-success">
              {t.messageReceived}
            </div>
          )}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="contact-form-row">

              <div className="contact-field">

                <label htmlFor="contact-name">
                  {t.fullName}
                </label>

                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t.yourName}
                  required
                />

              </div>


              <div className="contact-field">

                <label htmlFor="contact-email">
                  {t.emailAddress}
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>


            <div className="contact-field">

              <label htmlFor="contact-phone">
                {t.phoneNumber}
                <span>
                  {" "}
                  {t.optional}
                </span>
              </label>

              <input
                id="contact-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t.phonePlaceholder}
              />

            </div>


            <div className="contact-field">

              <label htmlFor="contact-message">
                {t.message}
              </label>

              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t.messagePlaceholder}
                rows="6"
                required
              />

            </div>


            <div className="contact-form-bottom">

              <button
                type="submit"
                className="contact-submit-button"
              >
                {t.sendMessage}

                <span>
                  {"\u{2192}"}
                </span>
              </button>

              <p>
                {t.privacy}
              </p>

            </div>

          </form>

        </div>

      </section>


      {/* =================================================
          GET IN TOUCH + LOCATION
      ================================================= */}

      <section className="contact-info-section">

        <div className="contact-info-grid">

          {/* LEFT */}

          <div className="contact-details">

            <div className="contact-info-heading">

              <span className="section-kicker">
                {t.contactInformation}
              </span>

              <h2>
                {t.getInTouchTitle}
              </h2>

              <p>
                {t.contactIntro}
              </p>

            </div>


            {/* LOCATION */}

            <div className="contact-info-card">

              <div className="contact-info-icon">
                <FiMapPin />
              </div>

              <div>
                <strong>
                  {t.location}
                </strong>

                <p>
                  {t.locationName}
                </p>

                <span>
                  {t.address}
                </span>
              </div>

            </div>


            {/* PHONE */}

            <div className="contact-info-card">

              <div className="contact-info-icon">
                <FiPhone />
              </div>

              <div>
                <strong>
                  {t.phoneNumberTitle}
                </strong>

                <a
                  href="tel:+251919543806"
                  className="contact-info-link"
                >
                  +251 919 543 806
                </a>
              </div>

            </div>


            {/* EMAIL */}

            <div className="contact-info-card">

              <div className="contact-info-icon">
                <FiMail />
              </div>

              <div>
                <strong>
                  {t.emailAddressTitle}
                </strong>

                <a
                  href="mailto:masjidulfatwa@gmail.com"
                  className="contact-info-link"
                >
                  masjidulfatwa@gmail.com
                </a>
              </div>

            </div>


            {/* SUPPORT HOURS */}

            <div className="contact-info-card">

              <div className="contact-info-icon">
                <FiClock />
              </div>

              <div>
                <strong>
                  {t.supportHours}
                </strong>

                <p>
                  {t.mondayFriday}
                </p>

                <span>
                  {t.supportText}
                </span>
              </div>

            </div>

          </div>


          {/* RIGHT */}

          <div className="contact-location">

            <div className="contact-info-heading">

              <span className="section-kicker">
                {t.ourLocation}
              </span>

              <h2>
                {t.findUs}
              </h2>

              <p>
                {t.visitText}
              </p>

            </div>


            {/* MAP */}

            <div className="contact-map-card">

              <div className="contact-map">

                <iframe
                  title={t.mapTitle}
                  src="https://www.google.com/maps?q=7.2876966,38.4336369&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>


              {/* MAP BOTTOM */}

              <div className="map-bottom">

                <a
                  href="https://www.google.com/maps/search/?api=1&query=7.2876966,38.4336369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-location-link"
                >
                  <strong>
                    {t.locationName}
                  </strong>

                  <span>
                    {t.address}
                  </span>
                </a>


                <a
                  href="https://www.google.com/maps/search/?api=1&query=7.2876966,38.4336369"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-open-link"
                >
                  {t.openInMaps}
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FOLLOW US
      ================================================= */}

      <section className="contact-social-section">

        <div className="contact-heading">

          <span className="section-kicker">
            {t.stayConnected}
          </span>

          <h2>
            {t.followUs}
          </h2>

          <p>
            {t.followText}
          </p>

          <div className="contact-divider">
            <span />
            <strong>
              {"\u{2022}"}
            </strong>
            <span />
          </div>

        </div>


        <div className="social-links">

          <a
            href="#contact-hero"
            aria-label={t.facebook}
            className="social-link"
            onClick={() => setSelectedSocial("facebook")}
          >
            <span className="social-icon">
              <FaFacebookF />
            </span>

            <span>
              {t.facebook}
            </span>
          </a>


          <a
            href="#contact-hero"
            aria-label="X"
            className="social-link"
            onClick={() => setSelectedSocial("x")}
          >
            <span className="social-icon x-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.525l-5.11-6.16L5.73 22H2.47l7.61-8.69L1.75 2H8.44l4.62 5.59L18.244 2Zm-1.145 17.73h1.81L7.31 4.13H5.37l11.729 15.6Z"
                  fill="currentColor"
                />
              </svg>
            </span>

            <span>
              X
            </span>
          </a>


          <a
            href="#contact-hero"
            aria-label={t.instagram}
            className="social-link"
            onClick={() => setSelectedSocial("instagram")}
          >
            <span className="social-icon">
              <FaInstagram />
            </span>

            <span>
              {t.instagram}
            </span>
          </a>


          <a
            href="#contact-hero"
            aria-label={t.youtube}
            className="social-link"
            onClick={() => setSelectedSocial("youtube")}
          >
            <span className="social-icon">
              <FaYoutube />
            </span>

            <span>
              {t.youtube}
            </span>
          </a>


          <a
            href="#contact-hero"
            aria-label={t.telegram}
            className="social-link"
            onClick={() => setSelectedSocial("telegram")}
          >
            <span className="social-icon">
              <FaTelegramPlane />
            </span>

            <span>
              {t.telegram}
            </span>
          </a>

        </div>

        {selectedSocial && (
          <span className="sr-only">
            {selectedSocial}
          </span>
        )}

      </section>


      {/* =================================================
          STAY UPDATED
      ================================================= */}

      <section className="stay-updated-section">

        <div className="stay-updated-inner">

          <div className="stay-updated-content">

            <span className="section-kicker">
              {t.stayUpdatedKicker}
            </span>

            <h2>
              {t.stayUpdated}
            </h2>

            <p>
              {t.newsletterText}
            </p>

          </div>


          <form
            className="newsletter-form"
            onSubmit={handleNewsletterSubmit}
          >

            <input
              type="email"
              value={newsletterEmail}
              onChange={(event) =>
                setNewsletterEmail(event.target.value)
              }
              placeholder={t.emailPlaceholder}
              aria-label={t.emailPlaceholder}
              required
            />

            <button type="submit">
              {t.subscribe}
            </button>

          </form>

        </div>


        {newsletterSubmitted && (
          <div className="newsletter-success">
            {t.subscribed}
          </div>
        )}

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="public-footer">

        <div className="footer-main">

          {/* BRAND */}

          <div className="footer-column footer-brand-column">

            <div className="footer-brand">

              <span className="brand-mark">
                {"\u{262A}"}
              </span>

              <div>
                <strong>
                  MASJIDUL-FATWA SHABAB
                </strong>

                <small>
                  {t.footerSubtitle}
                </small>
              </div>

            </div>

            <p>
              {t.footerDescription}
            </p>


            {/* SOCIAL LINKS */}

            <div className="footer-social-links">

              <a
                href="#contact-hero"
                aria-label={t.facebook}
                className="footer-social-link"
              >
                <FaFacebookF />
              </a>

              <a
                href="#contact-hero"
                aria-label="X"
                className="footer-social-link"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.525l-5.11-6.16L5.73 22H2.47l7.61-8.69L1.75 2H8.44l4.62 5.59L18.244 2Zm-1.145 17.73h1.81L7.31 4.13H5.37l11.729 15.6Z"
                    fill="currentColor"
                  />
                </svg>
              </a>

              <a
                href="#contact-hero"
                aria-label={t.instagram}
                className="footer-social-link"
              >
                <FaInstagram />
              </a>

              <a
                href="#contact-hero"
                aria-label={t.youtube}
                className="footer-social-link"
              >
                <FaYoutube />
              </a>

              <a
                href="#contact-hero"
                aria-label={t.telegram}
                className="footer-social-link"
              >
                <FaTelegramPlane />
              </a>

            </div>

          </div>


          {/* QUICK LINKS */}

          <div className="footer-column">

            <h4>
              {t.quickLinks}
            </h4>

            <div className="footer-quick-links">

              <button onClick={() => onNavigate("home")}>
                {t.home}
              </button>

              <button onClick={() => onNavigate("about")}>
                {t.about}
              </button>

              <button onClick={() => onNavigate("services")}>
                {t.services}
              </button>

              <button onClick={() => onNavigate("events")}>
                {t.activities}
              </button>

              <button onClick={() => onNavigate("gallery")}>
                {t.gallery}
              </button>

              <button onClick={() => onNavigate("contact")}>
                {t.contact}
              </button>

            </div>

          </div>


          {/* PROGRAMS */}

          <div className="footer-column">

            <h4>
              {t.programs}
            </h4>

            <div className="footer-program">

              <strong>
                {t.membership}
              </strong>

              <span>
                {t.membershipText}
              </span>

            </div>

            <div className="footer-program">

              <strong>
                {t.contribution}
              </strong>

              <span>
                {t.contributionText}
              </span>

            </div>

          </div>


          {/* CONTACT */}

          <div className="footer-column">

            <h4>
              {t.footerContact}
            </h4>

            <a
              href="mailto:masjidulfatwa@gmail.com"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FiMail />
              </span>

              <span className="footer-contact-text">
                masjidulfatwa@gmail.com
              </span>
            </a>

            <a
              href="tel:+251919543806"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FiPhone />
              </span>

              <span className="footer-contact-text">
                +251 919 543 806
              </span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=7.2876966,38.4336369"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FiMapPin />
              </span>

              <span className="footer-contact-text">
                Masjidul-Fatwa, Awara Gema, Shalla, West Arsi Zone,
                Oromia, Ethiopia
              </span>
            </a>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">

          <span>
            {"\u{00A9}"} {new Date().getFullYear()} Masjidul-Fatwa Shabab.{" "}
            {t.allRightsReserved}
          </span>

          <span>
            <a
              href="https://jemal-dev.github.io/jemal-portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              {t.builtBy}
            </a>
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Contact;