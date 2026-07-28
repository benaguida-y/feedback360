import type { ReactNode } from "react";

// Tableau de données : les en-têtes sont déclarés par `columns`, les lignes passées en enfants.
// Le message « vide » est rendu automatiquement, avec le bon colSpan.
export default function Table({ columns, children, isEmpty, emptyLabel = "Aucune donnée." }: {
    columns: string[];
    children: ReactNode;
    isEmpty?: boolean;
    emptyLabel?: string;
}) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
                {columns.map((c) => (
                    <th key={c} className="px-5 py-3 font-medium">{c}</th>
                ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {isEmpty
                ? <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">{emptyLabel}</td></tr>
                : children}
            </tbody>
        </table>
    );
}