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
            case "ADMIN":   return "role-admin";
            case "MANAGER": return "role-manager";
            default:        return "role-collaborator";
        }
    }

    return (
        <Layout>
            <PageHeader title={t("adminUsers.title")}
                        subtitle={t("adminUsers.subtitle")}
                        backTo="/"
                        action={
                            <Link to="/admin/users/new" className="btn-primary">
                                <Plus className="h-4 w-4" />
                                {t("adminUsers.add")}
                            </Link>
                        } />

            {listError && <p className="error-line">{listError}</p>}

            {/* Filtres */}
            <div className="filter-bar">
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="form-select">
                    <option value="">{t("adminUsers.allRoles")}</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="COLLABORATOR">COLLABORATOR</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select">
                    <option value="">{t("adminUsers.allStatuses")}</option>
                    <option value="ACTIVE">{t("common.active")}</option>
                    <option value="INACTIVE">{t("common.inactive")}</option>
                    <option value="PENDING">{t("common.pendingActivation")}</option>
                </select>
                <div className="ml-auto flex items-center gap-3">
                    <span className="results-chip">{total} {t("common.results")}</span>
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
                </div>
            </div>

            <Card>
                <Table columns={[t("common.name"), t("common.email"), t("common.role"), t("common.status"), t("common.action")]}
                       loading={loading}
                       isEmpty={users.length === 0} emptyLabel={t("adminUsers.empty")}>
                    {users.map((u) => (
                        <tr key={u.userId} className={`table-row ${!u.active ? "opacity-60" : ""}`}>
                            <td className="table-cell cell-strong">{u.fullName}</td>
                            <td className="table-cell cell-default">{u.email}</td>
                            <td className="table-cell">
                                <span className={`role-badge ${roleBadge(u.role)}`}>{u.role}</span>
                            </td>
                            <td className="table-cell">
                                <div className="flex flex-col gap-1">
                                    <span className={`pill ${u.active ? "pill-active" : "pill-inactive"}`}>
                                        {u.active ? t("common.active") : t("common.inactive")}
                                    </span>
                                    {!u.activated && (
                                        <span className="pill pill-pending">
                                            {t("common.pendingActivation")}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="table-cell">
                                <button onClick={() => toggleActive(u)} disabled={busyId === u.userId}
                                        className={`btn-toggle ${u.active ? "btn-toggle-danger" : "btn-toggle-success"}`}>
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
