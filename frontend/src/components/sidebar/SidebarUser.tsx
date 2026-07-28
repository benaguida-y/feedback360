import { LogOut } from "lucide-react";
import { labelClass } from "./labelClass";

export default function SidebarUser({ name, role, collapsed, onLogout }: {
    name: string | null; role: string | null; collapsed: boolean; onLogout: () => void;
}) {
    const initials = (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="border-t border-slate-200 p-3">
            <div className="mb-3 flex items-center gap-3">
                <div title={name ?? ""}
                     className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
                    {initials}
                </div>
                <div className={labelClass(collapsed)}>
                    <p className="truncate text-sm font-semibold text-slate-800">{name ?? "Utilisateur"}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                </div>
            </div>
            <button onClick={onLogout} title="Se déconnecter"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-200">
                <LogOut className="h-4 w-4 shrink-0" />
                <span className={labelClass(collapsed)}>Se déconnecter</span>
            </button>
        </div>
    );
}