import { useTranslation } from "react-i18next";

// Pastilles de filtre par statut, partagées par les listes de feedbacks.
const FILTERS = [
    { key: "", labelKey: "common.all" },
    { key: "SUBMITTED", labelKey: "status.SUBMITTED" },
    { key: "NOT_SUBMITTED", labelKey: "status.NOT_SUBMITTED" },
    { key: "IN_PROGRESS", labelKey: "status.IN_PROGRESS" },
];

export default function StatusFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex gap-2">
            {FILTERS.map((f) => (
                <button key={f.key} onClick={() => onChange(f.key)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                            value === f.key ? "bg-brand text-white" : "border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-cap-panel2"
                        }`}>
                    {t(f.labelKey)}
                </button>
            ))}
        </div>
    );
}