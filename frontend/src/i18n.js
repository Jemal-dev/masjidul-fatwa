import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import om from "./locales/om.json";
import am from "./locales/am.json";
import ar from "./locales/ar.json";

const savedLanguage =
  localStorage.getItem("siteLanguage") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      om: {
        translation: om,
      },
      am: {
        translation: am,
      },
      ar: {
        translation: ar,
      },
    },

    lng: savedLanguage,

    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

const updateDocumentLanguage = (language) => {
  localStorage.setItem(
    "siteLanguage",
    language
  );

  document.documentElement.lang = language;

  document.documentElement.dir =
    language === "ar" ? "rtl" : "ltr";
};

updateDocumentLanguage(savedLanguage);

i18n.on(
  "languageChanged",
  updateDocumentLanguage
);

export default i18n;