import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import JSON5 from "json5";

// Import translation files as raw text and parse with JSON5
import enRaw from "./locales/en.json5?raw";
import arRaw from "./locales/ar.json5?raw";

const en = JSON5.parse(enRaw);
const ar = JSON5.parse(arRaw);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
        },
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
