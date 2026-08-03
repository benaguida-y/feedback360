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
        <header className="flex shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-8 py-3 dark:border-cap-border dark:bg-cap-bg">
            {/* Sélecteur de langue */}
            <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-cap-border">
                {LANGS.map((l) => (
                    <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                            className={`rounded-none px-3 py-1.5 text-xs font-semibold transition ${
                                lang === l
                                    ? "bg-brand text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-cap-panel dark:text-slate-300 dark:hover:bg-cap-panel2"
                            }`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Bascule clair / sombre */}
            <button onClick={() => setDark((d) => !d)}
                    title={dark ? t("header.switchToLight") : t("header.switchToDark")}
                    aria-label={dark ? t("header.switchToLight") : t("header.switchToDark")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-brand hover:text-brand dark:border-cap-border dark:text-slate-300">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
        </header>
    );
}