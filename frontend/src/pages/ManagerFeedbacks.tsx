import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import StatusBadge from "../components/StatusBadge";
import StatusFilter from "../components/StatusFilter";
import Table from "../components/Table";
import { useTranslation } from "react-i18next";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; collaboratorName: string; }
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

export default function ManagerFeedbacks() {
    const role = getRole();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t, i18n } = useTranslation();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [filter, search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (filter) params.set("status", filter);
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<Feedback>>(`/management/feedbacks?${params.toString()}`)
                .then((r) => { setFeedbacks(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("managerFeedbacks.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, search, page]);

    return (
        <Layout>
            <PageHeader title={t("managerFeedbacks.title")}
                        subtitle={t("managerFeedbacks.subtitle")}
                        backTo="/" />

            {error && <p className="error-line">{error}</p>}

            <div className="filter-bar">
                <StatusFilter value={filter} onChange={setFilter} />
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.moduleCollaborator")} />
                </div>
            </div>

            <Card>
                <Table columns={[t("common.module"), t("common.collaborator"), t("common.status"), t("common.score"), t("common.date"), t("common.action")]}
                       loading={loading}
                       isEmpty={feedbacks.length === 0} emptyLabel={t("common.noFeedback")}>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="table-row">
                            <td className="table-cell cell-strong">{f.moduleTitle}</td>
                            <td className="table-cell cell-default">{f.collaboratorName}</td>
                            <td className="table-cell"><StatusBadge status={f.status} /></td>
                            <td className="table-cell cell-default">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="table-cell cell-muted">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="table-cell">
                                {f.status === "NOT_SUBMITTED" ? (
                                    <span title={t("common.notSubmittedTooltip")} className="btn-action-disabled">
                                        {t("common.view")}
                                    </span>
                                ) : (
                                    <Link to={`/feedback/${f.feedbackId}/detail`} className="btn-action">
                                        {t("common.view")}
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}
