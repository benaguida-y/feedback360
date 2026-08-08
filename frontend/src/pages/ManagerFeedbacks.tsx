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
import RatingStars from "../components/RatingStars";
import { Send, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSort } from "../useSort";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; collaboratorName: string; collaboratorEmail: string; }
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

export default function ManagerFeedbacks() {
    const role = getRole();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState("");
    const [score, setScore] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t, i18n } = useTranslation();
    const { sort, toggle } = useSort();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [filter, score, search, sort, size]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (filter) params.set("status", filter);
            if (score) params.set("score", score);
            if (search.trim()) params.set("search", search.trim());
            if (sort) params.set("sort", sort);
            params.set("page", String(page));
            params.set("size", String(size));
            client.get<Page<Feedback>>(`/management/feedbacks?${params.toString()}`)
                .then((r) => { setFeedbacks(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("managerFeedbacks.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, score, search, page, sort, size]);

    return (
        <Layout>
            <PageHeader title={t("managerFeedbacks.title")}
                        subtitle={t("managerFeedbacks.subtitle")}
                        backTo="/" />

            {error && <p className="error-line">{error}</p>}

            <div className="filter-bar">
                <StatusFilter value={filter} onChange={setFilter} />
                <select value={score} onChange={(e) => setScore(e.target.value)} className="form-select">
                    <option value="">{t("common.allScores")}</option>
                    <option value="5">5 ★</option>
                    <option value="4">4 ★</option>
                    <option value="3">3 ★</option>
                    <option value="2">2 ★</option>
                    <option value="1">1 ★</option>
                    <option value="0">{t("common.noRating")}</option>
                </select>
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.moduleCollaborator")} />
                </div>
            </div>

            <Card>
                <Table columns={[{ label: t("common.module"), sort: "moduleFormation.title" }, { label: t("common.collaborator"), sort: "user.lastName" }, { label: t("common.status"), sort: "status" }, { label: t("common.score"), sort: "globalScore" }, { label: t("common.date"), sort: "createdAt" }, t("common.action")]}
                       loading={loading} sort={sort} onSort={toggle}
                       isEmpty={feedbacks.length === 0} emptyLabel={t("common.noFeedback")}>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="table-row">
                            <td className="table-cell cell-strong">{f.moduleTitle}</td>
                            <td className="table-cell">
                                <p className="cell-strong">{f.collaboratorName}</p>
                                <p className="cell-faint">{f.collaboratorEmail}</p>
                            </td>
                            <td className="table-cell"><StatusBadge status={f.status} /></td>
                            <td className="table-cell"><RatingStars value={f.globalScore} /></td>
                            <td className="table-cell cell-muted">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="table-cell">
                                {f.status === "NOT_SUBMITTED" ? (
                                    <RelanceButton feedbackId={f.feedbackId} />
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

            <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={setSize} />
        </Layout>
    );
}

// Bouton de relance : renvoie l'e-mail d'invitation puis affiche un état transitoire.
function RelanceButton({ feedbackId }: { feedbackId: number }) {
    const { t } = useTranslation();
    const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

    async function send() {
        setState("sending");
        try {
            await client.post(`/management/feedbacks/${feedbackId}/remind`);
            setState("sent");
        } catch {
            setState("error");
        }
        setTimeout(() => setState("idle"), 3000);
    }

    const label = state === "sending" ? t("relance.sending")
        : state === "sent" ? t("relance.sent")
        : state === "error" ? t("relance.error")
        : t("relance.action");

    const cls = state === "sent" ? "btn-relance btn-relance-sent"
        : state === "error" ? "btn-relance btn-relance-error"
        : "btn-relance";

    return (
        <button type="button" onClick={send} disabled={state === "sending" || state === "sent"}
                title={t("relance.tooltip")} className={cls}>
            {state === "sent" ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            {label}
        </button>
    );
}
