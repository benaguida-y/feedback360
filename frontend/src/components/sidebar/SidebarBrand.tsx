export default function SidebarBrand({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    return (
        <div className="relative flex h-30 flex-col items-center gap-2 px-3 py-5">
            <img src={collapsed ? "/flower-logo.png" : "/logo.png"} alt="Feedback360"
                 className={collapsed ? "h-8 w-auto" : "h-10 w-auto"} />
            <span className="text-lg font-semibold text-slate-800">{collapsed ? "F360" : "Feedback360"}</span>

            <button onClick={onToggle} title={collapsed ? "Déplier" : "Replier"}
                    className="absolute right-0 top-6/7 z-10 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
                <img src="/flower-logo.png" alt="" className="h-4 w-4 object-contain" />
            </button>
        </div>
    );
}