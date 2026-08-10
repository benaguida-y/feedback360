import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { FeedbackAction } from "./CollaboratorFeedbacks";
import {ArrowRight} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }
interface Page<T> { content: T[]; totalPages: number; }

export default function CollaboratorDashboard() {
    const { t, i18n } = useTranslation();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        client.get<Summary>("/feedbacks/summary").then((r) => setSummary(r.data)).catch(() => setError(t("common.loadError")));
    }, []);

    useEffect(() => {
        client.get<Page<Feedback>>("/feedbacks?page=0&size=5")
            .then((r) => setRecent(r.data.content))
            .catch(() => setError(t("common.loadError")))
            .finally(() => setLoading(false));
    }, []);

    if (error) return <p className="error-text">{error}</p>;

    return (
        <div>
            <PageHeader title={t("collaboratorDashboard.title")} subtitle={t("collaboratorDashboard.subtitle")} />

            {summary && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label={t("common.total")} value={summary.total} />
                    <StatCard label={t("status.SUBMITTED")} value={summary.submitted} accent="accent-emerald" />
                    <StatCard label={t("status.NOT_SUBMITTED")} value={summary.notSubmitted} accent="accent-amber" />
                    <StatCard label={t("status.IN_PROGRESS")} value={summary.inProgress} accent="accent-sky" />
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h3 className="section-title">{t("collaboratorDashboard.recent")}</h3>
                <Link to="/feedbacks" className="btn-see-all">
                    {t("common.viewAll")}
                    <ArrowRight className="see-all-arrow" />
                </Link>
            </div>

            <Card className="mt-3">
                <Table columns={[t("common.module"), t("common.status"), t("common.score"), t("common.date"), t("common.action")]}
                       loading={loading}
                       isEmpty={recent.length === 0} emptyLabel={t("common.noFeedback")}>
                    {recent.map((f) => (
                        <tr key={f.feedbackId} className="table-row">
                            <td className="table-cell cell-strong">{f.moduleTitle}</td>
                            <td className="table-cell"><StatusBadge status={f.status} /></td>
                            <td className="table-cell cell-default">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="table-cell cell-muted">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="table-cell"><FeedbackAction f={f} /></td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
}
