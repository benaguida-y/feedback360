import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import BrandPanel from "../components/BrandPanel";
import FormField from "../components/FormField.tsx";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // On reste silencieux quoi qu'il arrive (anti-enumeration) : meme message de succes.
        try {
            await client.post("/auth/forgot-password", { email });
        } catch { /* ignore */ }
        setSent(true);
        setLoading(false);
    }

    return (
        <div className="auth-page">
            <BrandPanel />

            <div className="auth-form-col">
                <div className="auth-form">
                    <img src="/logo.png" alt="Feedback360" className="auth-logo" />

                    {sent ? (
                        <div className="auth-alert-success">
                            <CheckCircle2 className="auth-alert-icon" />
                            {t("forgotPassword.sent")}
                        </div>
                    ) : (
                        <>
                            <h2 className="auth-title">{t("forgotPassword.title")}</h2>
                            <p className="auth-subtitle">{t("forgotPassword.subtitle")}</p>

                            <form onSubmit={handleSubmit}>
                                <FormField label={t("common.email")} icon={Mail} type="email" value={email}
                                           onChange={setEmail} placeholder={t("login.emailPlaceholder")} />

                                <button type="submit" disabled={loading} className="btn-block">
                                    {loading ? t("forgotPassword.sending") : t("forgotPassword.submit")}
                                    {!loading && <ArrowRight className="arrow-slide" />}
                                </button>
                            </form>
                        </>
                    )}

                    <p className="auth-footer">
                        <Link to="/login" className="link-brand">{t("forgotPassword.backToLogin")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
