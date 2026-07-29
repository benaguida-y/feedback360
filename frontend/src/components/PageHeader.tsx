import type { ReactNode } from "react";
import BackButton from "./BackButton";

// En-tête de page réutilisable : bouton retour optionnel, titre, sous-titre et zone d'actions à droite.
export default function PageHeader({ title, subtitle, backTo, action }: {
    title: string;
    subtitle?: string;
    backTo?: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center gap-4">
            {backTo !== undefined && <BackButton to={backTo} />}
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}