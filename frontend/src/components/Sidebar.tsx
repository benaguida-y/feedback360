/*
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken, getRole, getUserName } from "../auth";

function IconDashboard() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M3 3h6v6H3V3zm8 0h6v4h-6V3zM3 11h6v6H3v-6zm8 2h6v4h-6v-4z" /></svg>;
}
function IconUsers() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" /></svg>;
}

export default function Sidebar() {
    const navigate = useNavigate();
    const role = getRole();
    const name = getUserName();
    const initials = (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

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

    const items = [
        { to: "/", end: true, label: "Tableau de bord", icon: <IconDashboard /> },
        ...(role === "ADMIN" ? [{ to: "/admin/users", end: false, label: "Administration", icon: <IconUsers /> }] : []),
    ];

    return (
        <aside className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}>
            <div className="flex flex-col items-center gap-2 border-b border-slate-200 px-3 py-5 h-30">
                <img
                    src={collapsed ? "/flower-logo.png" : "/logo.png"}
                     alt="Feedback360"
                     className={collapsed ? "h-8 w-auto" : "h-10 w-auto"}
                />
                {!collapsed ? <span className="text-lg font-semibold text-slate-800">Feedback360</span> : <span className="text-lg font-semibold text-slate-800">F360</span>}
            </div>

            <button onClick={toggle} title={collapsed ? "Déplier" : "Replier"}
                    className="flex items-center justify-center border-b border-slate-200 py-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
                <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}>
                    <path d="M12.7 15.3a1 1 0 01-1.4 0L6 10l5.3-5.3a1 1 0 111.4 1.4L8.8 10l3.9 3.9a1 1 0 010 1.4z" />
                </svg>
            </button>

            <nav className="flex flex-1 flex-col py-3">
                {items.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.end} title={collapsed ? item.label : undefined}
                             className={({ isActive }) =>
                                 `flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${collapsed ? "justify-center" : "justify-between"} ${
                                     isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                                 }`}>
                        {({ isActive }) => (
                            <>
                <span className="flex items-center gap-3">
                  {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                </span>
                                {!collapsed && (
                                    <img src="/flower-logo.png" alt="" className={`h-4 w-auto shrink-0 ${isActive ? "brightness-0 invert" : ""}`} />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-slate-200 p-3">
                <div className={`mb-3 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                    <div title={name ?? ""} className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-sm font-semibold text-white">
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{name ?? "Utilisateur"}</p>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>
                    )}
                </div>
                <button onClick={logout} title="Se déconnecter"
                        className="flex w-full items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M3 3h7v2H5v10h5v2H3V3zm9.3 3.3L16 10l-3.7 3.7-1.4-1.4L12.2 11H8V9h4.2l-1.3-1.3 1.4-1.4z" /></svg>
                    {!collapsed && <span>Se déconnecter</span>}
                </button>
            </div>
        </aside>
    );
}*/
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken, getRole, getUserName } from "../auth";

function IconDashboard() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M3 3h6v6H3V3zm8 0h6v4h-6V3zM3 11h6v6H3v-6zm8 2h6v4h-6v-4z" /></svg>;
}
function IconList() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" /></svg>;
}
function IconChart() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M3 3h2v14H3V3zm4 8h2v6H7v-6zm4-4h2v10h-2V7zm4-3h2v13h-2V4z" /></svg>;
}
function IconUsers() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" /></svg>;
}
function IconTeam() {
    return <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0"><path d="M7 9a3 3 0 100-6 3 3 0 000 6zm6 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 17a5.5 5.5 0 0111 0H1.5zm11.2 0a6.5 6.5 0 00-1.9-3.6A4 4 0 0118.5 17h-5.8z" /></svg>;
}

export default function Sidebar() {
    const navigate = useNavigate();
    const role = getRole();
    const name = getUserName();
    const initials = (name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

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
        { to: "/", end: true, label: "Tableau de bord", icon: <IconDashboard /> },
        ...(isManager  ? [
            { to: "/management/feedbacks", end: false, label: "Feedbacks", icon: <IconList /> },
            { to: "/management/collaborators", end: false, label: "Collaborateurs", icon: <IconTeam /> },
            { to: "/management/modules", end: false, label: "Par module", icon: <IconChart /> },
        ] : []),
        ...(role === "ADMIN" ? [{ to: "/admin/users", end: false, label: "Administration", icon: <IconUsers /> }] : []),
    ];

    // texte qui se replie en douceur (reste monté, on anime max-width + opacité)
    const textCls = `overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
        collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
    }`;

    return (
        <aside className={`sticky top-0 h-screen shrink-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"}`}>
            <div className="flex flex-col items-center gap-2  px-3 py-5 h-30">
                <img
                    src={collapsed ? "/flower-logo.png" : "/logo.png"}
                    alt="Feedback360"
                    className={collapsed ? "h-8 w-auto" : "h-10 w-auto"}
                />
                {!collapsed ? <span className="text-lg font-semibold text-slate-800">Feedback360</span> : <span className="text-lg font-semibold text-slate-800">F360</span>}
            </div>

            <button onClick={toggle} title={collapsed ? "Déplier" : "Replier"}
                    className="flex items-center justify-center py-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 cursor-pointer">
                <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
                    <path d="M12.7 15.3a1 1 0 01-1.4 0L6 10l5.3-5.3a1 1 0 111.4 1.4L8.8 10l3.9 3.9a1 1 0 010 1.4z" />
                </svg>
            </button>

            <nav className="flex flex-1 flex-col py-3">
                {items.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.end} title={collapsed ? item.label : undefined}
                             className={({ isActive }) =>
                                 `flex items-center gap-3 px-[22px] py-3 text-sm font-medium transition-colors ${
                                     isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
                                 }`}>
                        {({ isActive }) => (
                            <>
                                {item.icon}
                                <span className={`flex-1 text-left ${textCls}`}>{item.label}</span>
                                <img src="/flower-logo.png" alt=""
                                     className={`h-4 shrink-0 transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-4 opacity-100"} ${isActive ? "brightness-0 invert" : ""}`} />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-slate-200 p-3">
                <div className="mb-3 flex items-center gap-3">
                    <div title={name ?? ""} className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-sm font-semibold text-white">
                        {initials}
                    </div>
                    <div className={textCls}>
                        <p className="truncate text-sm font-semibold text-slate-800">{name ?? "Utilisateur"}</p>
                        <p className="text-xs text-slate-500">{role}</p>
                    </div>
                </div>
                <button onClick={logout} title="Se déconnecter"
                        className="flex w-full items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-200 cursor-pointer">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0"><path d="M3 3h7v2H5v10h5v2H3V3zm9.3 3.3L16 10l-3.7 3.7-1.4-1.4L12.2 11H8V9h4.2l-1.3-1.3 1.4-1.4z" /></svg>
                    <span className={textCls}>Se déconnecter</span>
                </button>
            </div>
        </aside>
    );
}
