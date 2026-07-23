import { useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

export default function AdminUsers() {
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
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Administration</h2>
                    <p className="text-sm text-slate-500">Créer un compte manager ou administrateur.</p>
                </div>
            </div>

            <div className="max-w-lg border border-slate-200 bg-white p-6 shadow-sm">
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
                            className="w-full bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                        {loading ? "Création…" : "Créer le compte"}
                    </button>
                </form>

                {link && (
                    <div className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        <p className="font-medium">Compte créé ✔ Un e-mail d'activation a été envoyé.</p>
                        <p className="mt-1 break-all text-emerald-700">Lien : {link}</p>
                    </div>
                )}
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