import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

interface AdminUser {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
    activated: boolean;
}

export default function AdminUsers() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("MANAGER");
    const [error, setError] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [listError, setListError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    function loadUsers() {
        client.get<AdminUser[]>("/admin/users")
            .then((r) => setUsers(r.data))
            .catch(() => setListError("Impossible de charger les utilisateurs."));
    }

    useEffect(loadUsers, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setLink(""); setLoading(true);
        try {
            const res = await client.post("/admin/users", { email, firstName, lastName, role });
            setLink(res.data.activationLink);
            setEmail(""); setFirstName(""); setLastName("");
            loadUsers(); // rafraîchit la liste avec le nouvel utilisateur
        } catch (err: any) {
            setError(err?.response?.status === 409 ? "Cet email est déjà utilisé." : "Création impossible (vérifiez les champs).");
        } finally {
            setLoading(false);
        }
    }

    async function toggleActive(u: AdminUser) {
        setBusyId(u.userId);
        try {
            const res = await client.patch<AdminUser>(`/admin/users/${u.userId}/status`, { active: !u.active });
            // remplace l'utilisateur modifié dans la liste
            setUsers((list) => list.map((x) => (x.userId === u.userId ? res.data : x)));
        } catch {
            setListError("Changement de statut impossible.");
        } finally {
            setBusyId(null);
        }
    }

    function roleBadge(role: string) {
        switch (role) {
            case "ADMIN":        return "bg-red-50 text-red-700 ring-1 ring-red-200";
            case "MANAGER":      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
            case "COLLABORATOR": return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
            default:             return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
        }
    }

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Administration</h2>
                    <p className="text-sm text-slate-500">Créer et gérer les comptes.</p>
                </div>
            </div>

            {/* Formulaire de création */}
            <div className="max-w-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">Nouveau compte</h3>
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

            {/* Liste des utilisateurs */}
            <h3 className="mt-10 mb-3 text-lg font-semibold text-slate-800">Utilisateurs</h3>
            {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-5 py-3 font-medium">Nom</th>
                        <th className="px-5 py-3 font-medium">Email</th>
                        <th className="px-5 py-3 font-medium">Rôle</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun utilisateur.</td></tr>
                    ) : (
                        users.map((u) => (
                            <tr key={u.userId} className={`hover:bg-slate-50/60 ${!u.active ? "opacity-60" : ""}`}>
                                <td className="px-5 py-3.5 font-medium text-slate-800">{u.fullName}</td>
                                <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2 py-0.5 text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex flex-col gap-1">
                                        <span className={`w-fit px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                            {u.active ? "Actif" : "Désactivé"}
                                        </span>
                                        {!u.activated && (
                                            <span className="w-fit px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">
                                                En attente d'activation
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => toggleActive(u)} disabled={busyId === u.userId}
                                            className={`px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                                                u.active
                                                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                                                    : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                            }`}>
                                        {busyId === u.userId ? "…" : u.active ? "Désactiver" : "Activer"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
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