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

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div>
            <PageHeader title={t("collaboratorDashboard.title")} subtitle={t("collaboratorDashboard.subtitle")} />

            {summary && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label={t("common.total")} value={summary.total} />
                    <StatCard label={t("status.SUBMITTED")} value={summary.submitted} accent="text-emerald-600" />
                    <StatCard label={t("status.NOT_SUBMITTED")} value={summary.notSubmitted} accent="text-amber-600" />
                    <StatCard label={t("status.IN_PROGRESS")} value={summary.inProgress} accent="text-sky-600" />
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t("collaboratorDashboard.recent")}</h3>
                <Link to="/feedbacks"
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-cap-border bg-white dark:bg-cap-panel px-3.5 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand hover:text-brand">
                    {t("common.viewAll")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            <Card className="mt-3">
                <Table columns={[t("common.module"), t("common.status"), t("common.score"), t("common.date"), t("common.action")]}
                       loading={loading}
                       isEmpty={recent.length === 0} emptyLabel={t("common.noFeedback")}>
                    {recent.map((f) => (
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
        </div>
    );
}