import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, Users, BarChart3, Settings, Activity } from "lucide-react";
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
    const items = [
        { to: "/", end: true, label: "Tableau de bord", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
        ...(isManager ? [
            { to: "/management/feedbacks", end: false, label: "Feedbacks", icon: <MessageSquareText className="h-5 w-5 shrink-0" /> },
            { to: "/management/collaborators", end: false, label: "Collaborateurs", icon: <Users className="h-5 w-5 shrink-0" /> },
            { to: "/management/modules", end: false, label: "Modules", icon: <BarChart3 className="h-5 w-5 shrink-0" /> },
        ] : []),
        ...(role === "ADMIN" ? [
            { to: "/admin/users", end: false, label: "Administration", icon: <Settings className="h-5 w-5 shrink-0" /> },
            { to: "/admin/logs", end: false, label: "Supervision", icon: <Activity className="h-5 w-5 shrink-0" /> },
        ] : []),
    ];

    return (
        <aside className={`sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"}`}>
            <SidebarBrand collapsed={collapsed} onToggle={toggle} />

            <nav className="flex flex-1 flex-col py-3">
                {items.map((item) => (
                    <SidebarLink key={item.to} {...item} collapsed={collapsed} />
                ))}
            </nav>

            <SidebarUser name={name} role={role} collapsed={collapsed} onLogout={logout} />
        </aside>
    );
}