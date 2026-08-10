import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BackButton({ to = "/" }: { to?: string }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <button
            type="button"
            onClick={() => navigate(to)}
            aria-label={t("common.back")}
            className="icon-btn"
        >
            <ChevronLeft className="h-4 w-4" />
        </button>
    );
}
