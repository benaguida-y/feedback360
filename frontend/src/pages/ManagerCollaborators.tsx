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
import { useSort } from "../useSort";


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

export default function ManagerCollaborators() {
    const role = getRole();
    const [rows, setRows] = useState<Collab[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t } = useTranslation();
    const { sort, toggle } = useSort();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [search, score, sort, size]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (score) params.set("score", score);
            if (sort) params.set("sort", sort);
            params.set("page", String(page));
            params.set("size", String(size));
            client.get<Page<Collab>>(`/management/collaborators?${params.toString()}`)
                .then((r) => { setRows(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("managerCollaborators.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [search, score, page, sort, size]);

    return (
        <Layout>
            <PageHeader title={t("nav.collaborators")}
                        subtitle={t("managerCollaborators.subtitle")}
                        backTo="/" />

            {error && <p className="error-line">{error}</p>}

            <div className="filter-bar">
                <select value={score} onChange={(e) => setScore(e.target.value)} className="form-select">
                    <option value="">{t("common.allScores")}</option>
                    <option value="4">4 – 5</option>
                    <option value="3">3 – 4</option>
                    <option value="2">2 – 3</option>
                    <option value="1">1 – 2</option>
                    <option value="0">{t("common.noRating")}</option>
                </select>
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.nameEmail")} />
                </div>
            </div>

            <Card>
                <Table columns={[{ label: t("common.collaborator"), sort: "fullName" }, { label: t("managerCollaborators.progress"), sort: "submittedPercent" }, { label: t("common.averageScore"), sort: "averageScore" }, t("common.action")]}
                       loading={loading} sort={sort} onSort={toggle}
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

            <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={setSize} />
        </Layout>
    );
}
