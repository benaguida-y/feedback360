import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Pagination({ page, totalPages, onChange }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
}) {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;
    return (
        <div className="pagination">
            <button onClick={() => onChange(page - 1)} disabled={page === 0} aria-label={t("common.previous")} className="pagination-btn">
                <ChevronLeft className="h-4 w-4" />
                {t("common.previous")}
            </button>
            <span className="pagination-info">
                {t("common.page")}
                <span className="pagination-page">
                    {page + 1}
                </span>
                / {totalPages}
            </span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} aria-label={t("common.next")} className="pagination-btn">
                {t("common.next")}
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
