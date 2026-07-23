import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { setToken } from "../auth";

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
            navigate("/");
        } catch {
            setError("Email ou mot de passe incorrect.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand to-brand-light p-12 text-white lg:flex">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto brightness-0 invert" />
                <div>
                    <h1 className="text-4xl font-bold leading-tight">Feedback360</h1>
                    <p className="mt-4 max-w-md text-lg text-white/80">
                        La plateforme de collecte et d'analyse des feedbacks de formation.
                    </p>
                </div>
                <p className="text-sm text-white/60">© 2026 Feedback360</p>
            </div>

            <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    <img src="/logo.png" alt="Logo" className="mb-8 h-9 w-auto lg:hidden" />
                    <h2 className="text-2xl font-bold text-slate-800">Connexion</h2>
                    <p className="mt-1 mb-8 text-sm text-slate-500">Accédez à votre espace.</p>

                    <label className="mb-5 block">
                        <span className="text-sm font-medium text-slate-700">Email</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                               className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                    </label>
                    <label className="mb-6 block">
                        <span className="text-sm font-medium text-slate-700">Mot de passe</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                               className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                    </label>

                    {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    );
}