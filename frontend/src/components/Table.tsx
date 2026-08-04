import type { ReactNode } from "react";
import Skeleton from "./Skeleton";

// Largeurs variées pour que le squelette paraisse naturel (cycle sur les colonnes).
const WIDTHS = ["70%", "55%", "80%", "45%", "60%", "50%"];

export default function Table({ columns, children, isEmpty, emptyLabel = "Aucune donnée.", loading, skeletonRows = 5 }: {
    columns: string[];
    children: ReactNode;
    isEmpty?: boolean;
    emptyLabel?: string;
    loading?: boolean;
    skeletonRows?: number;
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
            {loading ? (
                Array.from({ length: skeletonRows }).map((_, r) => (
                    <tr key={r}>
                        {columns.map((c, i) => (
                            <td key={c} className="px-5 py-3.5">
                                <Skeleton className="h-4" style={{ width: WIDTHS[i % WIDTHS.length] }} />
                            </td>
                        ))}
                    </tr>
                ))
            ) : isEmpty ? (
                <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">{emptyLabel}</td></tr>
            ) : children}
            </tbody>
        </table>
    );
}