import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { labelClass } from "./labelClass";

export default function SidebarLink({ to, end, label, icon, collapsed }: {
    to: string; end: boolean; label: string; icon: ReactNode; collapsed: boolean;
}) {
    return (
        <NavLink to={to} end={end} title={collapsed ? label : undefined}
                 className={({ isActive }) =>
                     `sidebar-link ${collapsed ? "justify-center px-0" : "gap-3 px-[22px]"} ${
                         isActive ? "sidebar-link-active" : "sidebar-link-idle"
                     }`}>
            {icon}
            <span className={`flex-1 text-left ${labelClass(collapsed)}`}>{label}</span>
        </NavLink>
    );
}
