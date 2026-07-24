import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { getRole, setToken } from "../auth";
import BrandPanel from "../components/BrandPanel";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
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

                    <label className="mb-5 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm0 2.2V15h14V6.2l-7 4.4-7-4.4zM16.2 5H3.8L10 8.9 16.2 5z" /></svg>
                            </span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                   placeholder="vous@exemple.com"
                                   className="w-full border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                        </div>
                    </label>

                    <label className="mb-6 block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</span>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 1a4 4 0 00-4 4v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 6V5a2 2 0 10-4 0v2h4z" clipRule="evenodd" /></svg>
                            </span>
                            <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                                   placeholder="••••••••"
                                   className="w-full border border-slate-300 bg-white py-2.5 pl-11 pr-11 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                            <button type="button" onClick={() => setShowPwd((v) => !v)}
                                    aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-600">
                                {showPwd ? (
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M10 4c-4 0-7.3 2.6-9 6 1.7 3.4 5 6 9 6s7.3-2.6 9-6c-1.7-3.4-5-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M3.7 2.3L2.3 3.7l2.5 2.5C3.3 7.3 2 8.9 1 11c1.7 3.4 5 6 9 6 1.6 0 3.1-.4 4.4-1.1l2.9 2.9 1.4-1.4L3.7 2.3zM10 15c-4 0-7.3-2.6-9-6 .8-1.6 2-2.9 3.4-3.9l1.9 1.9A4 4 0 0010 14c.4 0 .8-.1 1.2-.2l1.2 1.2c-.8.1-1.6 0-2.4 0z" /></svg>
                                )}
                            </button>
                        </div>
                    </label>

                    {error && (
                        <p className="mb-4 flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-none"><path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zm1 13H9v-2h2v2zm0-4H9V5h2v5z" clipRule="evenodd" /></svg>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                        {loading ? "Connexion…" : "Se connecter"}
                        {!loading && (
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5"><path fillRule="evenodd" d="M7 4l6 6-6 6-1.4-1.4L10.2 10 5.6 5.4 7 4z" clipRule="evenodd" /></svg>
                        )}
                    </button>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Accès réservé — contactez votre administrateur en cas de problème.
                    </p>
                </form>
            </div>
        </div>
    );
}