import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Pagination({ page, totalPages, onChange }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
}) {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;
    const btn = "inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40 dark:border-cap-border dark:bg-cap-panel dark:text-slate-300 dark:hover:bg-cap-panel2";
    return (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <button onClick={() => onChange(page - 1)} disabled={page === 0} aria-label={t("common.previous")} className={btn}>
                <ChevronLeft className="h-4 w-4" />
                {t("common.previous")}
            </button>
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-cap-border dark:bg-cap-panel dark:text-slate-400">
                {t("common.page")}
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-xs font-semibold text-white">
                    {page + 1}
                </span>
                / {totalPages}
            </span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} aria-label={t("common.next")} className={btn}>
                {t("common.next")}
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}