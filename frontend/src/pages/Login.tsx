import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { setToken } from "../auth";

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
            navigate("/");
        } catch {
            setError("Email ou mot de passe incorrect.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Panneau de marque (gauche) */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light p-14 text-white lg:flex">
                {/* halos flous ronds */}
                <div className="blob pointer-events-none absolute -right-32 -top-32 h-96 w-96 bg-brand-light/40 blur-3xl" />
                <div className="blob pointer-events-none absolute top-1/3 -left-24 h-80 w-80 bg-white/10 blur-3xl" />
                <div className="blob pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 bg-white/10 blur-3xl" />

                {/* anneaux décoratifs */}
                <div className="blob pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] border border-white/15" />
                <div className="blob pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 border border-white/10" />

                {/* flower-logo en grand filigrane */}
                <img src="/flower-logo.png" alt=""
                     className="pointer-events-none absolute -bottom-16 -right-16 w-96 opacity-10 brightness-0 invert" />

                {/* grille en filigrane */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
                     style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

                <div className="flex items-center justify-between">
                    <img src="/logo.png" alt="Feedback360" className="relative w-70 brightness-0 invert" />
                    <span className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
                        <span className="blob h-1.5 w-1.5 bg-emerald-400" />
                        Plateforme interne · Capgemini
                    </span>
                </div>

                <div className="relative">
                    <h1 className="text-5xl font-bold leading-tight tracking-tight">Feedback360</h1>
                    <h1 className="mt-6 text-5xl  leading-[1.05] tracking-tight">
                        Vos retours,<br />
                        <span className="text-white/70">notre progrès.</span>
                    </h1>
                    <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
                        Collectez et analysez les feedbacks de formation, simplement et en un seul endroit.
                    </p>
                </div>

                <p className="relative text-sm text-white/60">© 2026 Feedback360</p>
            </div>

            {/* Formulaire (droite) */}
            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    <img src="/logo.png" alt="Feedback360" className="mb-8 h-9 w-auto lg:hidden" />

                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bon retour !</h2>
                    <p className="mt-2 mb-8 text-sm text-slate-500">Connectez-vous pour accéder à votre espace.</p>

                    {/* Email */}
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

                    {/* Mot de passe */}
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