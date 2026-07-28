import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import BrandPanel from "../components/BrandPanel";
import FormField from "../components/FormField.tsx";
import ErrorBanner from "../components/ErrorBanner.tsx";
import { Lock, CheckCircle2 } from "lucide-react";

export default function Activate() {
    const navigate = useNavigate();
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
        if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
        if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        setLoading(true);
        try {
            await client.post("/auth/activate", { token, password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 1200); // petite pause pour lire le message
        } catch {
            setError("Lien invalide ou expiré. Demandez un nouveau lien d'activation.");
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <BrandPanel />

            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <img src="/logo.png" alt="Feedback360" className="mb-8 h-9 w-auto lg:hidden" />

                    {!token ? (
                        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            Lien d'activation invalide (jeton manquant). Demandez un nouveau lien à votre administrateur.
                        </div>
                    ) : success ? (
                        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <CheckCircle2 className="h-5 w-5 flex-none" />
                            Mot de passe défini ✔ Redirection vers la connexion…
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Activez votre compte</h2>
                            <p className="mt-2 mb-8 text-sm text-slate-500">Choisissez un mot de passe pour accéder à votre espace.</p>

                            <form onSubmit={handleSubmit}>
                                {/* Mot de passe */}
                                <FormField label="Nouveau mot de passe" icon={Lock} type="password"
                                           value={password} onChange={setPassword}
                                           placeholder="••••••••" minLength={6} />

                                <FormField label="Confirmer le mot de passe" icon={Lock} type="password"
                                           value={confirm} onChange={setConfirm} placeholder="••••••••" />

                                {error && <ErrorBanner message={error} />}

                                <button type="submit" disabled={loading}
                                        className="w-full bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                                    {loading ? "Activation…" : "Activer mon compte"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}