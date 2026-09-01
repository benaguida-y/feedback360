import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    MessageSquareText,
    Users,
    BarChart3,
    Settings,
    Activity,
    BellRing,
    Sparkles
} from "lucide-react";
import { clearToken, getRole, getUserName } from "../auth";
import SidebarBrand from "./sidebar/SidebarBrand";
import SidebarLink from "./sidebar/SidebarLink";
import SidebarUser from "./sidebar/SidebarUser";

export default function Sidebar() {
    const navigate = useNavigate();
    const role = getRole();
    const name = getUserName();

    const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");

    function toggle() {
        setCollapsed((c) => {
            localStorage.setItem("sidebarCollapsed", c ? "0" : "1");
            return !c;
        });
    }

    function logout() {
        clearToken();
        navigate("/login");
    }

    const isManager = role === "MANAGER" || role === "ADMIN";
    const { t } = useTranslation();
    const items = [
        { to: "/", end: true, label: t("nav.dashboard"), icon: <LayoutDashboard className="sidebar-icon" /> },
        ...(role === "COLLABORATOR" ? [
            { to: "/feedbacks", end: false, label: t("nav.feedbacks"), icon: <MessageSquareText className="sidebar-icon" /> },
        ] : []),
        ...(isManager ? [
            { to: "/management/feedbacks", end: false, label: t("nav.feedbacks"), icon: <MessageSquareText className="sidebar-icon" /> },
            { to: "/management/collaborators", end: false, label: t("nav.collaborators") , icon: <Users className="sidebar-icon" /> },
            { to: "/management/modules", end: false, label: t("nav.modules"), icon: <BarChart3 className="sidebar-icon" /> },
            { to: "/management/insights", end: false, label: t("nav.insights"), icon: <Sparkles className="sidebar-icon" /> },
        ] : []),
        ...(role === "ADMIN" ? [
            { to: "/admin/users", end: false, label: t("nav.administration"), icon: <Settings className="sidebar-icon" /> },
            { to: "/admin/reminders", end: false, label: t("nav.reminders"), icon: <BellRing className="sidebar-icon" /> },
            { to: "/admin/logs", end: false, label: t("nav.supervision"), icon: <Activity className="sidebar-icon" /> },
        ] : []),
    ];

    return (
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
            <SidebarBrand collapsed={collapsed} onToggle={toggle} />

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <SidebarLink key={item.to} {...item} collapsed={collapsed} />
                ))}
            </nav>

            <SidebarUser name={name} role={role} collapsed={collapsed} onLogout={logout} />
        </aside>
    );
}
