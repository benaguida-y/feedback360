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

const SIZE = 10;

function statusBadge(status: string) {
    switch (status) {
        case "SUCCESS":     return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
        case "FAILURE":     return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300";
        case "IN_PROGRESS": return "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300";
        default:            return "bg-slate-100 dark:bg-cap-panel2 text-slate-600 dark:text-slate-300";
    }
}

export default function AdminLogs() {
    const role = getRole();
    const [logs, setLogs] = useState<Log[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t, i18n } = useTranslation();

    if (role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [type, status, search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (type) params.set("type", type);
            if (status) params.set("status", status);
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<Log>>(`/admin/logs?${params.toString()}`)
                .then((r) => { setLogs(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("adminLogs.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [type, status, search, page]);

    const fmt = (d: string | null) =>
        (d ? new Date(d).toLocaleString(i18n.language === "en" ? "en-GB" : "fr-FR") : "—");

    return (
        <Layout>
            <PageHeader title={t("adminLogs.title")}
                        subtitle={t("adminLogs.subtitle")}
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <select value={type} onChange={(e) => setType(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-cap-border px-3 py-2 text-sm text-slate-700 dark:text-slate-300 dark:bg-cap-panel outline-none focus:border-brand">
                    <option value="">{t("adminLogs.allTypes")}</option>
                    <option value="MODULE_SYNC">MODULE_SYNC</option>
                    <option value="REMINDER">REMINDER</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-cap-border px-3 py-2 text-sm text-slate-700 dark:text-slate-300 dark:bg-cap-panel outline-none focus:border-brand">
                    <option value="">{t("adminLogs.allStatuses")}</option>
                    <option value="SUCCESS">{t("adminLogs.logStatus.SUCCESS")}</option>
                    <option value="FAILURE">{t("adminLogs.logStatus.FAILURE")}</option>
                    <option value="IN_PROGRESS">{t("adminLogs.logStatus.IN_PROGRESS")}</option>
                </select>
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.emailModule")} />
                </div>
            </div>

            <Card>
                <Table columns={[t("common.type"), t("common.status"), t("adminLogs.receivedAt"), t("adminLogs.processedAt"), t("common.user"), t("common.module")]}
                       loading={loading}
                       isEmpty={logs.length === 0} emptyLabel={t("adminLogs.empty")}>
                    {logs.map((l) => (
                        <tr key={l.logId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{l.type}</td>
                            <td className="px-5 py-3.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(l.status)}`}>{t(`adminLogs.logStatus.${l.status}`, { defaultValue: l.status })}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{fmt(l.receivedAt)}</td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{fmt(l.processedAt)}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{l.userEmail ?? "—"}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{l.moduleTitle ?? "—"}</td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}