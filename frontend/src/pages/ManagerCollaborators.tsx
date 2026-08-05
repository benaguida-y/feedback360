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

            {error && <p className="error-line">{error}</p>}

            <div className="mb-3 flex justify-end">
                <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
            </div>

            <Card>
                <Table columns={[t("common.collaborator"), t("managerCollaborators.progress"), t("common.averageScore"), t("common.action")]}
                       loading={loading}
                       isEmpty={rows.length === 0} emptyLabel={t("managerCollaborators.empty")}>
                    {rows.map((c) => (
                        <tr key={c.userId} className="table-row">
                            <td className="table-cell">
                                <p className="cell-strong">{c.fullName}</p>
                                <p className="cell-faint">{c.email}</p>
                            </td>
                            <td className="table-cell">
                                <div className="flex items-center gap-3">
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${c.submittedPercent}%` }} />
                                    </div>
                                    <span className="text-xs cell-muted">{t("managerCollaborators.submittedCount", { submitted: c.submitted, total: c.total })}</span>
                                </div>
                            </td>
                            <td className="table-cell cell-default">{c.averageScore != null ? `${c.averageScore.toFixed(1)} / 5` : "—"}</td>
                            <td className="table-cell">
                                <Link to={`/management/collaborators/${c.userId}`} className="btn-action">
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
