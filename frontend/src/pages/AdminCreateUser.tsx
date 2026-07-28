import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";

export default function AdminCreateUser() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("MANAGER");
    const [error, setError] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setLink(""); setLoading(true);
        try {
            const res = await client.post("/admin/users", { email, firstName, lastName, role });
            setLink(res.data.activationLink);
            setEmail(""); setFirstName(""); setLastName("");
        } catch (err: any) {
            setError(err?.response?.status === 409 ? "Cet email est déjà utilisé." : "Création impossible (vérifiez les champs).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Layout>
            <PageHeader title="Nouvel utilisateur"
                        subtitle="Créer un compte manager ou administrateur."
                        backTo="/admin/users"
            />

            <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
                {/* Formulaire */}
                <div className="h-max rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Email" type="email" value={email} onChange={setEmail} />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Prénom" value={firstName} onChange={setFirstName} />
                            <Field label="Nom" value={lastName} onChange={setLastName} />
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Rôle</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)}
                                    className="mt-1.5 w-full border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </label>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={loading}
                                className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                            {loading ? "Création…" : "Créer le compte"}
                        </button>
                    </form>

                    {link && (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                            <p className="font-medium">Compte créé ✔ Un e-mail d'activation a été envoyé.</p>
                            <p className="mt-1 break-all text-emerald-700">Lien : {link}</p>
                            <Link to="/admin/users" className="mt-2 inline-block font-medium text-brand hover:text-brand-dark">
                                ← Retour à la liste
                            </Link>
                        </div>
                    )}
                </div>

                {/* Guide */}
                <aside className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800">Comment ça marche</h3>
                        <ol className="space-y-4">
                            {[
                                "Vous créez le compte avec l'email et le rôle.",
                                "Un email d'activation est envoyé automatiquement.",
                                "L'utilisateur définit son mot de passe via le lien.",
                                "Il peut se connecter à son espace.",
                            ].map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
                                    <span className="text-sm text-slate-600">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800">Les rôles</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200">MANAGER</span>
                                <p className="mt-1.5 text-slate-600">Consulte les feedbacks, les statistiques et la progression des collaborateurs.</p>
                            </div>
                            <div>
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">ADMIN</span>
                                <p className="mt-1.5 text-slate-600">Tout ce que fait un manager, plus la gestion des utilisateurs et la supervision de l'application.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </Layout>
    );
}

function Field({ label, value, onChange, type = "text" }:
               { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required
                   className="mt-1.5 w-full border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
    );
}