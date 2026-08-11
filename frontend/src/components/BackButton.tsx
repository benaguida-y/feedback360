import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BackButton({ to = "/" }: { to?: string }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Retour à la page précédente si on vient d'une navigation interne ;
    // sinon (accès direct, rafraîchissement) repli sur la destination `to`.
    function goBack() {
        const idx = (window.history.state?.idx as number | undefined) ?? 0;
        if (idx > 0) navigate(-1);
        else navigate(to);
    }

    return (
        <button
            type="button"
            onClick={goBack}
            aria-label={t("common.back")}
            className="icon-btn"
        >
            <ChevronLeft className="icon-sm" />
        </button>
    );
}
