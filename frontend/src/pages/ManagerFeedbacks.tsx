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

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex flex-wrap items-center gap-3">
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
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{f.moduleTitle}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{f.collaboratorName}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="px-5 py-3.5">
                                {f.status === "NOT_SUBMITTED" ? (
                                    <span title={t("common.notSubmittedTooltip")}
                                          className="inline-flex cursor-not-allowed items-center rounded-lg border border-slate-200 dark:border-cap-border px-3.5 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-600">
                                        {t("common.view")}
                                    </span>
                                ) : (
                                    <Link to={`/feedback/${f.feedbackId}/detail`}
                                          className="inline-flex items-center rounded-lg border border-slate-300 dark:border-cap-border px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand hover:text-brand">
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