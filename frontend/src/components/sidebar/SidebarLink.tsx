import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { labelClass } from "./labelClass";

export default function SidebarLink({ to, end, label, icon, collapsed }: {
    to: string; end: boolean; label: string; icon: ReactNode; collapsed: boolean;
}) {
    return (
        <NavLink to={to} end={end} title={collapsed ? label : undefined}
                 className={({ isActive }) =>
                     `sidebar-link ${collapsed ? "sidebar-link-collapsed" : "sidebar-link-expanded"} ${
                         isActive ? "sidebar-link-active" : "sidebar-link-idle"
                     }`}>
            {icon}
            <span className={`sidebar-link-label ${labelClass(collapsed)}`}>{label}</span>
        </NavLink>
    );
}
