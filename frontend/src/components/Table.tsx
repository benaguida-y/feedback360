import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import Skeleton from "./Skeleton";

// Une colonne : soit un simple libellé, soit { libellé + champ de tri backend }.
export type Column = string | { label: string; sort?: string };

export default function Table({ columns, children, isEmpty, emptyLabel, loading, skeletonRows = 5, sort, onSort }: {
    columns: Column[];
    children: ReactNode;
    isEmpty?: boolean;
    emptyLabel?: string;
    loading?: boolean;
    skeletonRows?: number;
    sort?: string;                       // ex. "email,asc"
    onSort?: (field: string) => void;    // clic sur une colonne triable
}) {
    const { t } = useTranslation();
    const [sortField, sortDir] = (sort ?? "").split(",");

    return (
        <table className="table">
            <thead className="table-head">
            <tr>
                {columns.map((c, i) => {
                    const label = typeof c === "string" ? c : c.label;
                    const field = typeof c === "string" ? undefined : c.sort;
                    const key = `${label}-${i}`;
                    if (!field || !onSort) return <th key={key} className="table-th">{label}</th>;
                    const active = sortField === field;
                    return (
                        <th key={key} className="table-th">
                            <button type="button" className="table-sort" onClick={() => onSort(field)}>
                                {label}
                                {active && (sortDir === "desc"
                                    ? <ChevronDown className="table-sort-icon" />
                                    : <ChevronUp className="table-sort-icon" />)}
                            </button>
                        </th>
                    );
                })}
            </tr>
            </thead>
            <tbody className="table-body">
            {loading ? (
                Array.from({ length: skeletonRows }).map((_, r) => (
                    <tr key={r}>
                        {columns.map((_, i) => (
                            <td key={i} className="table-cell">
                                <Skeleton className={`skeleton-h skeleton-w-${(i % 6) + 1}`} />
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
