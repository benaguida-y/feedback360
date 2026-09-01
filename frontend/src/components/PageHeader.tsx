import type { ReactNode } from "react";
import BackButton from "./BackButton";

export default function PageHeader({ title, subtitle, backTo, action }: {
    title: string;
    subtitle?: string;
    backTo?: string;
    action?: ReactNode;
}) {
    return (
        <div className="page-header">
            {backTo !== undefined && <BackButton to={backTo} />}
            <div className="page-header-main">
                <h2 className="page-title">{title}</h2>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="page-header-action">{action}</div>}
        </div>
    );
}
