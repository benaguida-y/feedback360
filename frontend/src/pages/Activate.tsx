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
            setTimeout(() => navigate("/login"), 1200); // petite pause pour lire le message
        } catch {
            setError(t("activate.linkInvalid"));
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-cap-bg">
            <BrandPanel />

            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <img src="/logo.png" alt="Feedback360" className="mb-8 h-9 w-auto lg:hidden" />

                    {!token ? (
                        <div className="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/15 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                            {t("activate.tokenMissing")}
                        </div>
                    ) : success ? (
                        <div className="flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/15 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-5 w-5 flex-none" />
                            {t("activate.success")}
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t("activate.title")}</h2>
                            <p className="mt-2 mb-8 text-sm text-slate-500 dark:text-slate-400">{t("activate.subtitle")}</p>

                            <form onSubmit={handleSubmit}>
                                {/* Mot de passe */}
                                <FormField label={t("activate.newPassword")} icon={Lock} type="password"
                                           value={password} onChange={setPassword}
                                           placeholder="••••••••" minLength={6} />

                                <FormField label={t("activate.confirmPassword")} icon={Lock} type="password"
                                           value={confirm} onChange={setConfirm} placeholder="••••••••" />

                                {error && <ErrorBanner message={error} />}

                                <button type="submit" disabled={loading}
                                        className="w-full bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
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
