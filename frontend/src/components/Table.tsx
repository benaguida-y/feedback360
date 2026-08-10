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
        <table className="table">
            <thead className="table-head">
            <tr>
                {columns.map((c) => (
                    <th key={c} className="table-th">{c}</th>
                ))}
            </tr>
            </thead>
            <tbody className="table-body">
            {loading ? (
                Array.from({ length: skeletonRows }).map((_, r) => (
                    <tr key={r}>
                        {columns.map((c, i) => (
                            <td key={c} className="table-cell">
                                <Skeleton className="h-4" style={{ width: WIDTHS[i % WIDTHS.length] }} />
                            </td>
                        ))}
                    </tr>
                ))
            ) : isEmpty ? (
                <tr><td colSpan={columns.length} className="table-empty">{emptyLabel ?? t("common.noData")}</td></tr>
            ) : children}
            </tbody>
        </table>
    );
}
