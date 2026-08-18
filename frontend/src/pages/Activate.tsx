import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import BrandPanel from "../components/BrandPanel";
import FormField from "../components/FormField.tsx";
import ErrorBanner from "../components/ErrorBanner.tsx";
import { Lock, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Activate() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    // Feedback ciblé par le lien e-mail, transmis à la page de connexion après activation.
    const nextRaw = searchParams.get("next") ?? "";
    const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError(t("activate.passwordTooShort")); return; }
        if (password !== confirm) { setError(t("activate.passwordMismatch")); return; }
        setLoading(true);
        try {
            await client.post("/auth/activate", { token, password });
            setSuccess(true);
            // Après le mot de passe : page de connexion (en gardant le feedback ciblé).
            const target = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
            setTimeout(() => navigate(target), 1200); // petite pause pour lire le message
        } catch {
            setError(t("activate.linkInvalid"));
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <BrandPanel />

            <div className="auth-form-col">
                <div className="auth-form">
                    <img src="/logo.png" alt="Feedback360" className="auth-logo" />

                    {!token ? (
                        <div className="auth-alert-error">
                            {t("activate.tokenMissing")}
                        </div>
                    ) : success ? (
                        <div className="auth-alert-success">
                            <CheckCircle2 className="auth-alert-icon" />
                            {t("activate.success")}
                        </div>
                    ) : (
                        <>
                            <h2 className="auth-title">{t("activate.title")}</h2>
                            <p className="auth-subtitle">{t("activate.subtitle")}</p>

                            <form onSubmit={handleSubmit}>
                                {/* Mot de passe */}
                                <FormField label={t("activate.newPassword")} icon={Lock} type="password"
                                           value={password} onChange={setPassword}
                                           placeholder="••••••••" minLength={6} />

                                <FormField label={t("activate.confirmPassword")} icon={Lock} type="password"
                                           value={confirm} onChange={setConfirm} placeholder="••••••••" />

                                {error && <ErrorBanner message={error} />}

                                <button type="submit" disabled={loading} className="btn-block">
                                    {loading ? t("activate.activating") : t("activate.submit")}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
