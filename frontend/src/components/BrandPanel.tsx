import { useTranslation } from "react-i18next";

// Panneau de marque (gauche) partagé par les écrans Login et Activate.
export default function BrandPanel() {
    const { t } = useTranslation();
    return (
        <div className="brand-panel">
            {/* halos flous ronds (décoratifs) */}
            <div className="blob pointer-events-none absolute -right-32 -top-32 h-96 w-96 bg-brand-light/40 blur-3xl" />
            <div className="blob pointer-events-none absolute top-1/3 -left-24 h-80 w-80 bg-white/10 blur-3xl" />
            <div className="blob pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 bg-white/10 blur-3xl" />

            {/* anneaux décoratifs */}
            <div className="blob pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] border border-white/15" />
            <div className="blob pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 border border-white/10" />

            {/* flower-logo en grand filigrane */}
            <img src="/flower-logo.png" alt=""
                 className="pointer-events-none absolute -bottom-16 -right-16 w-96 opacity-10 brightness-0 invert" />

            {/* grille en filigrane */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
                 style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

            <div className="flex items-center justify-between">
                <img src="/capgemini-white.svg" alt="Feedback360" className="relative w-70" />
                <span className="brand-badge">
                    <span className="blob h-1.5 w-1.5 bg-emerald-400" />
                    {t("brandPanel.badge")}
                </span>
            </div>

            <div className="relative">
                <h1 className="brand-title">Feedback360</h1>
                <h1 className="brand-tagline">
                    {t("brandPanel.taglineLine1")}<br />
                    <span className="text-white/70">{t("brandPanel.taglineLine2")}</span>
                </h1>
                <p className="brand-desc">
                    {t("brandPanel.description")}
                </p>
            </div>

            <p className="brand-copyright">© 2026 Feedback360</p>
        </div>
    );
}
