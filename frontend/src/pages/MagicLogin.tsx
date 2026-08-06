import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { setToken } from "../auth";

// Consomme un lien magique de connexion : échange le token contre un JWT,
// puis redirige vers le feedback (paramètre "next").
export default function MagicLogin() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const token = params.get("token") ?? "";
        const nextRaw = params.get("next") ?? "/";
        // Anti open-redirect : uniquement des chemins internes.
        const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

        if (!token) { navigate("/login", { replace: true }); return; }

        client.post<{ accessToken: string }>("/auth/magic-login", { token })
            .then((r) => { setToken(r.data.accessToken); navigate(next, { replace: true }); })
            .catch(() => navigate("/login", { replace: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="auth-page items-center justify-center">
            <p className="loading-text">{t("common.loading")}</p>
        </div>
    );
}