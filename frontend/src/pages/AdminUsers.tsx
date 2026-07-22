import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";

export default function AdminUsers() {
    const navigate = useNavigate();
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
            const status = err?.response?.status;
            setError(status === 409 ? "Cet email est déjà utilisé." : "Création impossible (vérifiez les champs).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
                <h1 className="text-xl font-bold text-sky-700">Feedback360 — Administration</h1>
                <button onClick={() => navigate("/")} className="text-sm text-sky-600 hover:underline">← Tableau de bord</button>
            </header>
            <main className="mx-auto max-w-lg p-6">
                <div className="rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Créer un utilisateur</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Email" type="email" value={email} onChange={setEmail} />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Prénom" value={firstName} onChange={setFirstName} />
                            <Field label="Nom" value={lastName} onChange={setLastName} />
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Rôle</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </label>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={loading}
                                className="w-full rounded-lg bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60">
                            {loading ? "Création…" : "Créer le compte"}
                        </button>
                    </form>

                    {link && (
                        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                            <p className="font-medium">Compte créé ✔ Un e-mail d'activation a été envoyé.</p>
                            <p className="mt-1 break-all text-green-700">Lien : {link}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function Field({ label, value, onChange, type = "text" }:
               { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required
                   className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </label>
    );
}