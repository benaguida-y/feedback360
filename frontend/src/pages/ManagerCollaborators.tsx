import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useTranslation } from "react-i18next";


interface Collab {
    userId: number;
    fullName: string;
    email: string;
    total: number;
    submitted: number;
    notSubmitted: number;
    submittedPercent: number;
    averageScore: number | null;
}
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

export default function ManagerCollaborators() {
    const role = getRole();
    const [rows, setRows] = useState<Collab[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t } = useTranslation();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<Collab>>(`/management/collaborators?${params.toString()}`)
                .then((r) => { setRows(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("managerCollaborators.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <Layout>
            <PageHeader title={t("nav.collaborators")}
                        subtitle={t("managerCollaborators.subtitle")}
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex justify-end">
                <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
            </div>

            <Card>
                <Table columns={[t("common.collaborator"), t("managerCollaborators.progress"), t("common.averageScore"), t("common.action")]}
                       loading={loading}
                       isEmpty={rows.length === 0} emptyLabel={t("managerCollaborators.empty")}>
                    {rows.map((c) => (
                        <tr key={c.userId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                                <p className="font-medium text-slate-800 dark:text-slate-100">{c.fullName}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{c.email}</p>
                            </td>
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-32 bg-slate-100 dark:bg-cap-panel2">
                                        <div className="h-2 bg-brand" style={{ width: `${c.submittedPercent}%` }} />
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{t("managerCollaborators.submittedCount", { submitted: c.submitted, total: c.total })}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{c.averageScore != null ? `${c.averageScore.toFixed(1)} / 5` : "—"}</td>
                            <td className="px-5 py-3.5">
                                <Link to={`/management/collaborators/${c.userId}`}
                                      className="inline-flex items-center rounded-lg border border-slate-300 dark:border-cap-border px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand hover:text-brand">
                                    {t("common.viewProfile")}
                                </Link>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}
