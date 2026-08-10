import { LogOut } from "lucide-react";
import { labelClass } from "./labelClass";
import { useTranslation } from "react-i18next";

export default function SidebarUser({ name, role, collapsed, onLogout }: {
    name: string | null; role: string | null; collapsed: boolean; onLogout: () => void;
}) {
    const initials = (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

    const { t } = useTranslation();
    return (
        <div className="sidebar-user">
            <div className="sidebar-sep" />

            <div className="sidebar-user-row">
                <div title={name ?? ""} className="sidebar-avatar">
                    {initials}
                </div>
                <div className={labelClass(collapsed)}>
                    <p className="user-name">{name ?? t("common.user")}</p>
                    <p className="user-role">{role}</p>
                </div>
            </div>

            <button onClick={onLogout} title={t("common.logout")} className="sidebar-logout">
                <LogOut className="sidebar-logout-icon" />
                <span className={labelClass(collapsed)}>{t("common.logout")}</span>
            </button>
        </div>
    );
}