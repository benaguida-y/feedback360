// Sidebar closing/opening button
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="relative flex h-30 flex-col items-center gap-2 px-3 py-5">
            <img src={collapsed ? "/flower-logo.png" : "/logo.png"} alt="Feedback360"
                 className={`sidebar-logo ${collapsed ? "h-8" : "h-10"}`} />
            <span className="sidebar-brand-name">{collapsed ? "F360" : "Feedback360"}</span>

            <button onClick={onToggle} title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
                    aria-label={collapsed ? t("sidebar.expandMenu") : t("sidebar.collapseMenu")}
                    className="sidebar-toggle top-6/7">
                {collapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronLeft className="h-4 w-4" />}
            </button>
        </div>
    );
}
