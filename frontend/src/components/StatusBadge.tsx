import { useTranslation } from "react-i18next";

export default function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    const map: Record<string, string> = {
        SUBMITTED:     "badge-submitted",
        NOT_SUBMITTED: "badge-pending",
        IN_PROGRESS:   "badge-progress",
    };
    const cls = map[status] ?? "badge-neutral";
    const label = map[status] ? t(`status.${status}`) : status;
    return <span className={`badge ${cls}`}>{label}</span>;
}
