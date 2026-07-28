import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const LANGS = ["FR", "EN"] as const;
type Lang = (typeof LANGS)[number];

export default function Header() {
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) ?? "FR");
    const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

    // Pose la classe sur <html> : les styles sombres viendront s'y accrocher.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    // Prépare l'internationalisation : la langue choisie est mémorisée.
    useEffect(() => {
        document.documentElement.lang = lang.toLowerCase();
        localStorage.setItem("lang", lang);
    }, [lang]);

    return (
        <header className="flex shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-8 py-3">
            {/* Sélecteur de langue */}
            <div className="flex overflow-hidden rounded-lg border border-slate-300">
                {LANGS.map((l) => (
                    <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                            className={`rounded-none px-3 py-1.5 text-xs font-semibold transition ${
                                lang === l ? "bg-brand text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Bascule clair / sombre */}
            <button onClick={() => setDark((d) => !d)}
                    title={dark ? "Passer en thème clair" : "Passer en thème sombre"}
                    aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-brand hover:text-brand">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
        </header>
    );
}