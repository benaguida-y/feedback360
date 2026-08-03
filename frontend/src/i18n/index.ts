import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";

// On réutilise la langue déjà mémorisée par le header ("FR" / "EN").
const stored = localStorage.getItem("lang");
const lng = stored ? stored.toLowerCase() : "fr";

i18n.use(initReactI18next).init({
    resources: {
        fr: { translation: fr },
        en: { translation: en },
    },
    lng,
    fallbackLng: "fr",
    interpolation: { escapeValue: false }, // React échappe déjà le HTML
});

export default i18n;