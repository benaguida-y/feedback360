import { useTranslation } from "react-i18next";

// Panneau de marque (gauche) partagé par les écrans Login et Activate.
export default function BrandPanel() {
    const { t } = useTranslation();
    return (
        <div className="brand-panel">
            {/* halos flous ronds (décoratifs) */}
            <div className="blob brand-blob-1" />
            <div className="blob brand-blob-2" />
            <div className="blob brand-blob-3" />

            {/* anneaux décoratifs */}
            <div className="blob brand-ring-1" />
            <div className="blob brand-ring-2" />

            {/* flower-logo en grand filigrane */}
            <img src="/flower-logo.png" alt="" className="brand-flower" />

            {/* grille en filigrane */}
            <div className="brand-grid" />

            <div className="brand-header">
                <img src="/capgemini-white.svg" alt="Feedback360" className="brand-logo" />
                <span className="brand-badge">
                    <span className="blob brand-badge-dot" />
                    {t("brandPanel.badge")}
                </span>
            </div>

            <div className="brand-body">
                <h1 className="brand-title">Feedback360</h1>
                <h1 className="brand-tagline">
                    {t("brandPanel.taglineLine1")}<br />
                    <span className="brand-tagline-soft">{t("brandPanel.taglineLine2")}</span>
                </h1>
                <p className="brand-desc">
                    {t("brandPanel.description")}
                </p>
            </div>

            <p className="brand-copyright">© 2026 Feedback360</p>
        </div>
    );
}
