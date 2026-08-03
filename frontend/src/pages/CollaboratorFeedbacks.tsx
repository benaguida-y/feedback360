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
import {ChevronRight} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

export default function CollaboratorFeedbacks() {
    const role = getRole();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t, i18n } = useTranslation();

    if (role !== "COLLABORATOR") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [filter, search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (filter) params.set("status", filter);
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<Feedback>>(`/feedbacks?${params.toString()}`)
                .then((r) => { setFeedbacks(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("common.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, search, page]);

    return (
        <Layout>
            <PageHeader title={t("collaboratorFeedbacks.title")} subtitle={t("collaboratorFeedbacks.subtitle")} backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <StatusFilter value={filter} onChange={setFilter} />
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.module")} />
                </div>
            </div>

            <Card>
                <Table columns={[t("common.module"), t("common.status"), t("common.score"), t("common.date"), t("common.action")]}
                       loading={loading}
                       isEmpty={feedbacks.length === 0} emptyLabel={t("common.noFeedback")}>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{f.moduleTitle}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="px-5 py-3.5"><FeedbackAction f={f} /></td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}

// Bouton d'action selon le statut (réutilisé par le dashboard).
export function FeedbackAction({ f }: { f: { feedbackId: number; status: string } }) {
    const { t } = useTranslation();
    if (f.status === "SUBMITTED") {
        return (
            <Link to={`/feedback/${f.feedbackId}/detail`}
                  className="inline-flex items-center rounded-lg border border-slate-300 dark:border-cap-border px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand hover:text-brand">
                {t("common.view")}
            </Link>
        );
    }
    return (
        <Link to={`/feedback/${f.feedbackId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark">
            {f.status === "IN_PROGRESS" ? t("common.continue") : t("common.giveFeedback")}
            <ChevronRight className="h-3.5 w-3.5" />
        </Link>
    );
}