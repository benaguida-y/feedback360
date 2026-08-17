import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useTranslation } from "react-i18next";
import { useSort } from "../useSort";

interface Log {
    logId: number;
    type: string;
    status: string;
    receivedAt: string;
    processedAt: string | null;
    userEmail: string | null;
    moduleTitle: string | null;
}
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

function statusBadge(status: string) {
    switch (status) {
        case "SUCCESS":     return "log-success";
        case "FAILURE":     return "log-failure";
        case "IN_PROGRESS": return "log-progress";
        default:            return "log-default";
    }
}

export default function AdminLogs() {
    const role = getRole();
    const [logs, setLogs] = useState<Log[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t, i18n } = useTranslation();
    const { sort, toggle } = useSort();

    if (role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [type, status, search, sort, size]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (type) params.set("type", type);
            if (status) params.set("status", status);
            if (search.trim()) params.set("search", search.trim());
            if (sort) params.set("sort", sort);
            params.set("page", String(page));
            params.set("size", String(size));
            client.get<Page<Log>>(`/admin/logs?${params.toString()}`)
                .then((r) => { setLogs(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("adminLogs.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [type, status, search, page, sort, size]);

    const fmt = (d: string | null) =>
        (d ? new Date(d).toLocaleString(i18n.language === "en" ? "en-GB" : "fr-FR") : "—");

    return (
        <Layout>
            <PageHeader title={t("adminLogs.title")}
                        subtitle={t("adminLogs.subtitle")}
                        backTo="/" />

            {error && <p className="error-line">{error}</p>}

            <div className="filter-bar">
                <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                    <option value="">{t("adminLogs.allTypes")}</option>
                    <option value="MODULE_SYNC">MODULE_SYNC</option>
                    <option value="REMINDER">REMINDER</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                    <option value="">{t("adminLogs.allStatuses")}</option>
                    <option value="SUCCESS">{t("adminLogs.logStatus.SUCCESS")}</option>
                    <option value="FAILURE">{t("adminLogs.logStatus.FAILURE")}</option>
                    <option value="IN_PROGRESS">{t("adminLogs.logStatus.IN_PROGRESS")}</option>
                </select>
                <div className="filter-bar-search">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.emailModule")} />
                </div>
            </div>

            <Card>
                <Table columns={[{ label: t("common.type"), sort: "type" }, { label: t("common.status"), sort: "status" }, { label: t("adminLogs.receivedAt"), sort: "receivedAt" }, { label: t("adminLogs.processedAt"), sort: "processedAt" }, { label: t("common.user"), sort: "user.email" }, { label: t("common.module"), sort: "moduleFormation.title" }]}
                       loading={loading} sort={sort} onSort={toggle}
                       isEmpty={logs.length === 0} emptyLabel={t("adminLogs.empty")}>
                    {logs.map((l) => (
                        <tr key={l.logId} className="table-row">
                            <td className="table-cell cell-default">{l.type}</td>
                            <td className="table-cell">
                                <span className={`log-badge ${statusBadge(l.status)}`}>{t(`adminLogs.logStatus.${l.status}`, { defaultValue: l.status })}</span>
                            </td>
                            <td className="table-cell cell-muted">{fmt(l.receivedAt)}</td>
                            <td className="table-cell cell-muted">{fmt(l.processedAt)}</td>
                            <td className="table-cell cell-default">{l.userEmail ?? "—"}</td>
                            <td className="table-cell cell-default">{l.moduleTitle ?? "—"}</td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={setSize} />
        </Layout>
    );
}
