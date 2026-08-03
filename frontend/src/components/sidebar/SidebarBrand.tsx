// Sidebar closing/opening button
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="relative flex h-30 flex-col items-center gap-2 px-3 py-5">
            <img src={collapsed ? "/flower-logo.png" : "/logo.png"} alt="Feedback360"
                 className={`${collapsed ? "h-8" : "h-10"} w-auto dark:brightness-0 dark:invert`} />
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">{collapsed ? "F360" : "Feedback360"}</span>

            <button onClick={onToggle} title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
                    aria-label={collapsed ? t("sidebar.expandMenu") : t("sidebar.collapseMenu")}
                    className="absolute right-0 top-6/7 z-10 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand hover:text-brand dark:border-cap-border dark:bg-cap-panel2 dark:text-slate-300">
                {collapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronLeft className="h-4 w-4" />}
            </button>
        </div>
    );
}