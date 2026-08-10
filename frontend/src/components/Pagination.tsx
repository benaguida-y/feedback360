import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const SIZES = [5, 10, 15, 20];

export default function Pagination({ page, totalPages, onChange, size, onSizeChange }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
    size?: number;
    onSizeChange?: (n: number) => void;
}) {
    const { t } = useTranslation();
    if (totalPages <= 1 && !onSizeChange) return null;

    return (
        <div className="pagination">
            {onSizeChange ? (
                <select className="page-size" value={size ?? 10}
                        onChange={(e) => onSizeChange(Number(e.target.value))}>
                    {SIZES.map((n) => (
                        <option key={n} value={n}>{t("common.perPage", { n })}</option>
                    ))}
                </select>
            ) : <span />}

            {totalPages > 1 ? (
                <div className="pagination-controls">
                    <button onClick={() => onChange(page - 1)} disabled={page === 0} aria-label={t("common.previous")} className="pagination-btn">
                        <ChevronLeft className="icon-sm" />
                        {t("common.previous")}
                    </button>
                    <span className="pagination-info">
                        {t("common.page")}
                        <span className="pagination-page">{page + 1}</span>
                        / {totalPages}
                    </span>
                    <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} aria-label={t("common.next")} className="pagination-btn">
                        {t("common.next")}
                        <ChevronRight className="icon-sm" />
                    </button>
                </div>
            ) : <span />}
        </div>
    );
}
