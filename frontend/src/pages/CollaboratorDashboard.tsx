import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import StatusFilter from "../components/StatusFilter";
import Table from "../components/Table";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }

export default function CollaboratorDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        client.get<Summary>("/feedbacks/summary").then((r) => setSummary(r.data)).catch(() => setError("Erreur de chargement."));
    }, []);

    useEffect(() => {
        setLoading(true);
        const url = filter ? `/feedbacks?status=${filter}` : "/feedbacks";
        client.get<Feedback[]>(url).then((r) => setFeedbacks(r.data)).catch(() => setError("Erreur de chargement.")).finally(() => setLoading(false));
    }, [filter]);

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

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-800">Mes feedbacks</h3>
                <StatusFilter value={filter} onChange={setFilter} />
            </div>

            <Card className="mt-3">
                <Table columns={["Module", "Statut", "Note", "Date", "Action"]}
                       isEmpty={loading || feedbacks.length === 0}
                       emptyLabel={loading ? "Chargement…" : "Aucun feedback."}>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                            <td className="px-5 py-3.5 text-slate-600">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="px-5 py-3.5 text-slate-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-5 py-3.5">
                                {f.status === "SUBMITTED" ? (
                                    <Link to={`/feedback/${f.feedbackId}/detail`}
                                          className="inline-flex items-center rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                        Consulter
                                    </Link>
                                ) : (
                                    <Link to={`/feedback/${f.feedbackId}`}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark">
                                        {f.status === "IN_PROGRESS" ? "Continuer" : "Donner mon avis"}
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
}