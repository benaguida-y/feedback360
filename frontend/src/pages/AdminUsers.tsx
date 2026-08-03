import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
        const timer = setTimeout(() => {
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
                .catch(() => setListError(t("adminUsers.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [filterRole, filterStatus, search, page]);

    async function toggleActive(u: AdminUser) {
        setBusyId(u.userId);
        try {
            const res = await client.patch<AdminUser>(`/admin/users/${u.userId}/status`, { active: !u.active });
            setUsers((list) => list.map((x) => (x.userId === u.userId ? res.data : x)));
        } catch {
            setListError(t("adminUsers.statusError"));
        } finally {
            setBusyId(null);
        }
    }

    function roleBadge(r: string) {
        switch (r) {
            case "ADMIN":        return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-400/25";
            case "MANAGER":      return "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-400/25";
            case "COLLABORATOR": return "bg-slate-100 dark:bg-cap-panel2 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-500/25";
            default:             return "bg-slate-100 dark:bg-cap-panel2 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-500/25";
        }
    }

    return (
        <Layout>
            <PageHeader title={t("adminUsers.title")}
                        subtitle={t("adminUsers.subtitle")}
                        backTo="/"
                        action={
                            <Link to="/admin/users/new"
                                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
                                <Plus className="h-4 w-4" />
                                {t("adminUsers.add")}
                            </Link>
                        } />

            {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}

            {/* Filtres */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-cap-border px-3 py-2 text-sm text-slate-700 dark:text-slate-300 dark:bg-cap-panel outline-none focus:border-brand">
                    <option value="">{t("adminUsers.allRoles")}</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="COLLABORATOR">COLLABORATOR</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-cap-border px-3 py-2 text-sm text-slate-700 dark:text-slate-300 dark:bg-cap-panel outline-none focus:border-brand">
                    <option value="">{t("adminUsers.allStatuses")}</option>
                    <option value="ACTIVE">{t("common.active")}</option>
                    <option value="INACTIVE">{t("common.inactive")}</option>
                    <option value="PENDING">{t("common.pendingActivation")}</option>
                </select>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs bg-white dark:bg-cap-panel rounded-lg px-3 py-1.5 font-medium border border-slate-300 dark:border-cap-border flex items-center gap-1.5 text-slate-500 dark:text-slate-400">{total} {t("common.results")}</span>
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
                </div>
            </div>

            <Card>
                <Table columns={[t("common.name"), t("common.email"), t("common.role"), t("common.status"), t("common.action")]}
                       loading={loading}
                       isEmpty={users.length === 0} emptyLabel={t("adminUsers.empty")}>
                    {users.map((u) => (
                        <tr key={u.userId} className={`hover:bg-slate-50/60 ${!u.active ? "opacity-60" : ""}`}>
                            <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{u.fullName}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                            <td className="px-5 py-3.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span>
                            </td>
                            <td className="px-5 py-3.5">
                                <div className="flex flex-col gap-1">
                                    <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300"}`}>
                                        {u.active ? t("common.active") : t("common.inactive")}
                                    </span>
                                    {!u.activated && (
                                        <span className="w-fit rounded-full bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                                            {t("common.pendingActivation")}
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
                                    {busyId === u.userId ? "…" : u.active ? t("adminUsers.deactivate") : t("adminUsers.activate")}
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