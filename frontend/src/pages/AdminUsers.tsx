import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Donut from "../components/Donut";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useListParams } from "../useListParams";

interface AdminUser {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
    activated: boolean;
}
interface UserStats {
    totalUsers: number;
    admins: number;
    managers: number;
    collaborators: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingActivation: number;
}
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

export default function AdminUsers() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [listError, setListError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);

    const { page, setPage, size, setSize, search, setSearch, sort, toggle, get, set } = useListParams();
    const filterRole = get("role");
    const setFilterRole = (v: string) => set("role", v);
    const filterStatus = get("status");
    const setFilterStatus = (v: string) => set("status", v);

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (filterRole) params.set("role", filterRole);
            if (filterStatus) params.set("status", filterStatus);
            if (search.trim()) params.set("search", search.trim());
            if (sort) params.set("sort", sort);
            params.set("page", String(page + 1));
            params.set("size", String(size));
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
    }, [filterRole, filterStatus, search, page, sort, size]);

    // Stats globales (donuts) — indépendant des filtres/pagination.
    useEffect(() => {
        client.get<UserStats>("/admin/stats/users")
            .then((r) => setStats(r.data))
            .catch(() => {});
    }, []);

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

    const roleData = stats ? [
        { name: t("adminDashboard.admins"),   value: stats.admins,        color: "#ef4444" }, // red
        { name: t("adminDashboard.managers"), value: stats.managers,      color: "#10b981" }, // emerald
        { name: t("nav.collaborators"),       value: stats.collaborators, color: "#0070ad" }, // brand
    ].filter((d) => d.value > 0) : [];

    const statusData = stats ? [
        { name: t("common.active"),   value: stats.activeUsers,   color: "#10b981" }, // emerald
        { name: t("common.inactive"), value: stats.inactiveUsers, color: "#94a3b8" }, // slate
    ].filter((d) => d.value > 0) : [];

    return (
        <Layout>
            <PageHeader title={t("adminUsers.title")}
                        subtitle={t("adminUsers.subtitle")}
                        backTo="/"
                        action={
                            <Link to="/admin/users/new" className="btn-primary">
                                <Plus className="icon-sm" />
                                {t("adminUsers.add")}
                            </Link>
                        } />

            {listError && <p className="error-line">{listError}</p>}

            {stats && (
                <div className="charts-duo">
                    <Donut title={t("adminUsers.byRole")}   data={roleData}   emptyLabel={t("common.noData")} />
                    <Donut title={t("adminUsers.byStatus")} data={statusData} emptyLabel={t("common.noData")} />
                </div>
            )}

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
                <div className="filter-bar-right">
                    <span className="results-chip">{total} {t("common.results")}</span>
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
                </div>
            </div>

            <Card>
                <Table columns={[{ label: t("common.name"), sort: "lastName" }, { label: t("common.email"), sort: "email" }, { label: t("common.role"), sort: "role.name" }, { label: t("common.status"), sort: "active" }, t("common.action")]}
                       loading={loading} sort={sort} onSort={toggle}
                       isEmpty={users.length === 0} emptyLabel={t("adminUsers.empty")}>
                    {users.map((u) => (
                        <tr key={u.userId} className={`table-row ${!u.active ? "row-dim" : ""}`}>
                            <td className="table-cell cell-strong">{u.fullName}</td>
                            <td className="table-cell cell-default">{u.email}</td>
                            <td className="table-cell">
                                <span className={`role-badge ${roleBadge(u.role)}`}>{u.role}</span>
                            </td>
                            <td className="table-cell">
                                <div className="pill-stack">
                                    {u.activated ? (
                                        <span className={`pill ${u.active ? "pill-active" : "pill-inactive"}`}>
                                            {u.active ? t("common.active") : t("common.inactive")}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="pill pill-pending">
                                                {t("common.pendingActivation")}
                                            </span>
                                            {!u.active && (
                                                <span className="pill pill-inactive">
                                                    {t("common.inactive")}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="table-cell">
                                <div className="row-center-3">
                                    <Link to={`/admin/users/${u.userId}`} className="btn-action">{t("common.view")}</Link>
                                    {u.activated ? (
                                        <button onClick={() => toggleActive(u)} disabled={busyId === u.userId}
                                                className={`btn-toggle ${u.active ? "btn-toggle-danger" : "btn-toggle-success"}`}>
                                            {busyId === u.userId ? "…" : u.active ? t("adminUsers.deactivate") : t("adminUsers.activate")}
                                        </button>
                                    ) : (
                                        <span className="cell-faint">—</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={setSize} />
        </Layout>
    );
}