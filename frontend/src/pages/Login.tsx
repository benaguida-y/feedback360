import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { getRole, setToken } from "../auth";
import BrandPanel from "../components/BrandPanel";
import FormField from "../components/FormField.tsx";
import ErrorBanner from "../components/ErrorBanner.tsx";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [params] = useSearchParams();
    // Cible d'après le lien e-mail (ex. /feedback/12). Anti open-redirect : chemins internes only.
    const nextRaw = params.get("next") ?? "";
    const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await client.post("/auth/login", { email, password });
            setToken(res.data.accessToken);
            await redirectAfterLogin();
        } catch {
            setError(t("login.error"));
            setLoading(false);
        }
    }

    // Priorité au feedback ciblé par le lien e-mail ; sinon, un collaborateur fraîchement
    // intégré est amené sur son feedback en attente, à défaut sur le tableau de bord.
    async function redirectAfterLogin() {
        if (next) { navigate(next, { replace: true }); return; }
        if (getRole() === "COLLABORATOR") {
            try {
                const pending = await client.get<{ feedbackId: number }[]>("/feedbacks?status=NOT_SUBMITTED");
                if (pending.data.length > 0) {
                    navigate(`/feedback/${pending.data[0].feedbackId}`);
                    return;
                }
            } catch { /* en cas d'échec, on retombe simplement sur le tableau de bord */ }
        }
        navigate("/");
    }

    return (
        <div className="auth-page">
            <BrandPanel />

            {/* Formulaire (droite) */}
            <div className="auth-form-col">
                <form onSubmit={handleSubmit} className="auth-form">
                    <img src="/logo.png" alt="Feedback360" className="auth-logo" />

                    <h2 className="auth-title">{t("login.welcome")}</h2>
                    <p className="auth-subtitle">{t("login.subtitle")}</p>

                    <FormField label={t("common.email")} icon={Mail} type="email" value={email}
                               onChange={setEmail} placeholder={t("login.emailPlaceholder")} />

                    <FormField label={t("login.password")} icon={Lock} type="password" value={password}
                               onChange={setPassword} placeholder="••••••••" />

                    <p className="auth-forgot">
                        <Link to="/forgot-password" className="link-brand">{t("login.forgotPassword")}</Link>
                    </p>

                    {error && <ErrorBanner message={error} />}

                    <button type="submit" disabled={loading} className="btn-block">
                        {loading ? t("login.loggingIn") : t("login.signIn")}
                        {!loading && <ArrowRight className="arrow-slide" />}
                    </button>

                    <p className="auth-footer">
                        {t("login.footer")}
                    </p>
                </form>
            </div>
        </div>
    );
}
