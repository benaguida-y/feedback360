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
        <div className="status-filter">
            {FILTERS.map((f) => (
                <button key={f.key} onClick={() => onChange(f.key)}
                        className={`filter-pill ${value === f.key ? "filter-pill-active" : "filter-pill-idle"}`}>
                    {t(f.labelKey)}
                </button>
            ))}
        </div>
    );
}
