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
            className="flex h-10 w-10 flex-none items-center justify-center border border-slate-300 bg-white text-slate-500 transition hover:border-brand hover:text-brand dark:border-cap-border dark:bg-cap-panel dark:text-slate-300"
        >
            <ChevronLeft className="h-4 w-4" />
        </button>
    );
}
