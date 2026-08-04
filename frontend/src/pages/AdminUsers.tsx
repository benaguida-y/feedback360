import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";

interface AdminUser {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
    activated: boolean;
}
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [listError, setListError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [search, setSearch] = useState("");

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    // Un changement de filtre/recherche ramène à la 1ʳᵉ page.
    useEffect(() => { setPage(0); }, [filterRole, filterStatus, search]);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            const params = new URLSearchParams();
            if (filterRole) params.set("role", filterRole);
            if (filterStatus) params.set("status", filterStatus);
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<AdminUser>>(`/admin/users?${params.toString()}`)
                .then((r) => {
                    setUsers(r.data.content);
                    setTotalPages(r.data.totalPages);
                    setTotal(r.data.totalElements);
                })
                .catch(() => setListError("Impossible de charger les utilisateurs."))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [filterRole, filterStatus, search, page]);

    async function toggleActive(u: AdminUser) {
        setBusyId(u.userId);
        try {
            const res = await client.patch<AdminUser>(`/admin/users/${u.userId}/status`, { active: !u.active });
            setUsers((list) => list.map((x) => (x.userId === u.userId ? res.data : x)));
        } catch {
            setListError("Changement de statut impossible.");
        } finally {
            setBusyId(null);
        }
    }

    function roleBadge(r: string) {
        switch (r) {
            case "ADMIN":        return "bg-red-50 text-red-700 ring-1 ring-red-200";
            case "MANAGER":      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
            case "COLLABORATOR": return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
            default:             return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
        }
    }

    return (
        <Layout>
            <PageHeader title="Administration"
                        subtitle="Gérer les comptes."
                        backTo="/"
                        action={
                            <Link to="/admin/users/new"
                                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
                                <Plus className="h-4 w-4" />
                                Ajouter un utilisateur
                            </Link>
                        } />

            {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}

            {/* Filtres */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand">
                    <option value="">Tous les rôles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="COLLABORATOR">COLLABORATOR</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand">
                    <option value="">Tous les statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Désactivé</option>
                    <option value="PENDING">En attente d'activation</option>
                </select>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs bg-white rounded-lg px-3 py-1.5 font-medium border border-slate-300 flex items-center gap-1.5 text-slate-500">{total} résultat(s)</span>
                    <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un nom ou un email…" />
                </div>
            </div>

            <Card>
                <Table columns={["Nom", "Email", "Rôle", "Statut", "Action"]}
                       loading={loading}
                       isEmpty={users.length === 0} emptyLabel="Aucun utilisateur.">
                    {users.map((u) => (
                        <tr key={u.userId} className={`hover:bg-slate-50/60 ${!u.active ? "opacity-60" : ""}`}>
                            <td className="px-5 py-3.5 font-medium text-slate-800">{u.fullName}</td>
                            <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                            <td className="px-5 py-3.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span>
                            </td>
                            <td className="px-5 py-3.5">
                                <div className="flex flex-col gap-1">
                                    <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        {u.active ? "Actif" : "Désactivé"}
                                    </span>
                                    {!u.activated && (
                                        <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                            En attente d'activation
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-5 py-3.5">
                                <button onClick={() => toggleActive(u)} disabled={busyId === u.userId}
                                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                                            u.active
                                                ? "border border-red-300 text-red-600 hover:bg-red-50"
                                                : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                        }`}>
                                    {busyId === u.userId ? "…" : u.active ? "Désactiver" : "Activer"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}