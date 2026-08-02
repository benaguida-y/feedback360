// Sidebar closing/opening button
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    return (
        <div className="relative flex h-30 flex-col items-center gap-2 px-3 py-5">
            <img src={collapsed ? "/flower-logo.png" : "/logo.png"} alt="Feedback360"
                 className={collapsed ? "h-8 w-auto" : "h-10 w-auto"} />
            <span className="text-lg font-semibold text-slate-800">{collapsed ? "F360" : "Feedback360"}</span>

            <button onClick={onToggle} title={collapsed ? "Déplier" : "Replier"}
                    aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
                    className="absolute right-0 top-6/7 z-10 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand hover:text-brand">
                {collapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronLeft className="h-4 w-4" />}
            </button>
        </div>
    );
}