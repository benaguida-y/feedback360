import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { getRole, setToken } from "../auth";
import BrandPanel from "../components/BrandPanel";
import FormField from "../components/FormField.tsx";
import ErrorBanner from "../components/ErrorBanner.tsx";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
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
            setError("Email ou mot de passe incorrect.");
            setLoading(false);
        }
    }

    // Un collaborateur qui vient d'être intégré arrive avec un feedback en attente :
    // on l'amène directement dessus au lieu du tableau de bord.
    async function redirectAfterLogin() {
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
        <div className="flex min-h-screen bg-slate-50">
            <BrandPanel />

            {/* Formulaire (droite) */}
            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    <img src="/logo.png" alt="Feedback360" className="mb-8 h-9 w-auto lg:hidden" />

                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bon retour !</h2>
                    <p className="mt-2 mb-8 text-sm text-slate-500">Connectez-vous pour accéder à votre espace.</p>

                    <FormField label="Email" icon={Mail} type="email" value={email}
                               onChange={setEmail} placeholder="vous@exemple.com" />

                    <FormField label="Mot de passe" icon={Lock} type="password" value={password}
                               onChange={setPassword} placeholder="••••••••" />

                    {error && <ErrorBanner message={error} />}

                    <button type="submit" disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                        {loading ? "Connexion…" : "Se connecter"}
                        {!loading &&
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        }
                    </button>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Accès réservé — contactez votre administrateur en cas de problème.
                    </p>
                </form>
            </div>
        </div>
    );
}