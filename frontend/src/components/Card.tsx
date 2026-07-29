import type { ReactNode } from "react";

// Panneau blanc bordé : cartes de formulaire (padded) et conteneurs de tableau.
export default function Card({ children, className = "", padded = false }: {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}) {
    return (
        <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${padded ? "p-6" : "overflow-hidden"} ${className}`}>
            {children}
        </div>
    );
}