import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "./Skeleton";

const WIDTHS = ["70%", "55%", "80%", "45%", "60%", "50%"];

export default function Table({ columns, children, isEmpty, emptyLabel, loading, skeletonRows = 5 }: {
    columns: string[];
    children: ReactNode;
    isEmpty?: boolean;
    emptyLabel?: string;
    loading?: boolean;
    skeletonRows?: number;
}) {
    const { t } = useTranslation();
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-cap-border dark:bg-cap-panel2 dark:text-slate-400">
            <tr>
                {columns.map((c) => (
                    <th key={c} className="px-5 py-3 font-medium">{c}</th>
                ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-cap-border">
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
                <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">{emptyLabel ?? t("common.noData")}</td></tr>
            ) : children}
            </tbody>
        </table>
    );
}
