import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="sidebar-brand">
            {/* clair : logo Capgemini couleur — sombre : logo blanc officiel.
                Replié : pictogramme (voile) ; déplié : logo complet. */}
            {collapsed ? (
                <>
                    <img src="/flower-logo.png" alt="Feedback360" className="logo-icon-light" />
                    <img src="/capgemini-icon-white.svg" alt="Feedback360" className="logo-icon-dark" />
                </>
            ) : (
                <>
                    <img src="/logo.png" alt="Feedback360" className="logo-full-light" />
                    <img src="/capgemini-white.svg" alt="Feedback360" className="logo-full-dark" />
                </>
            )}
            <span className="sidebar-brand-name">{collapsed ? "F360" : "Feedback360"}</span>

            <button onClick={onToggle} title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
                    aria-label={collapsed ? t("sidebar.expandMenu") : t("sidebar.collapseMenu")}
                    className="sidebar-toggle">
                {collapsed
                    ? <ChevronRight className="sidebar-toggle-icon" />
                    : <ChevronLeft className="sidebar-toggle-icon" />}
            </button>
        </div>
    );
}