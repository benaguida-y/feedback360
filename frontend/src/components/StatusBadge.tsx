import { useTranslation } from "react-i18next";

export default function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    const map: Record<string, string> = {
        SUBMITTED:     "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25",
        NOT_SUBMITTED: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
        IN_PROGRESS:   "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25",
    };
    const c = map[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-cap-panel2 dark:text-slate-300 dark:ring-slate-400/20";
    const label = map[status] ? t(`status.${status}`) : status;
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>{label}</span>;
}