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

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }
interface Page<T> { content: T[]; totalPages: number; }

export default function CollaboratorDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        client.get<Summary>("/feedbacks/summary").then((r) => setSummary(r.data)).catch(() => setError("Erreur de chargement."));
    }, []);

    useEffect(() => {
        client.get<Page<Feedback>>("/feedbacks?page=0&size=5")
            .then((r) => setRecent(r.data.content))
            .catch(() => setError("Erreur de chargement."))
            .finally(() => setLoading(false));
    }, []);

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div>
            <PageHeader title="Mon tableau de bord" subtitle="Suivez et complétez vos retours de formation." />

            {summary && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total" value={summary.total} />
                    <StatCard label="Soumis" value={summary.submitted} accent="text-emerald-600" />
                    <StatCard label="En attente" value={summary.notSubmitted} accent="text-amber-600" />
                    <StatCard label="En cours" value={summary.inProgress} accent="text-sky-600" />
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Feedbacks récents</h3>
                <Link to="/feedbacks"
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                    Voir tout
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            <Card className="mt-3">
                <Table columns={["Module", "Statut", "Note", "Date", "Action"]}
                       loading={loading}
                       isEmpty={recent.length === 0} emptyLabel="Aucun feedback.">
                    {recent.map((f) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                            <td className="px-5 py-3.5 text-slate-600">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="px-5 py-3.5 text-slate-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-5 py-3.5"><FeedbackAction f={f} /></td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
}