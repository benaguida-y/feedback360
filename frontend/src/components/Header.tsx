import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGS = ["FR", "EN"] as const;
type Lang = (typeof LANGS)[number];

export default function Header() {
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) ?? "FR");
    const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
    const { t, i18n } = useTranslation();

    // Theme
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    // Language
    useEffect(() => {
        document.documentElement.lang = lang.toLowerCase();
        localStorage.setItem("lang", lang);
        i18n.changeLanguage(lang.toLowerCase());
    }, [lang]);

    return (
        <header className="app-header">
            {/* Sélecteur de langue */}
            <div className="lang-toggle">
                {LANGS.map((l) => (
                    <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                            className={`lang-btn ${lang === l ? "lang-btn-active" : "lang-btn-idle"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Bascule clair / sombre */}
            <button onClick={() => setDark((d) => !d)}
                    title={dark ? t("header.switchToLight") : t("header.switchToDark")}
                    aria-label={dark ? t("header.switchToLight") : t("header.switchToDark")}
                    className="theme-toggle">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
        </header>
    );
}
