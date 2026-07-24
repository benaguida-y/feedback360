import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }

const FILTERS = [
    { key: "", label: "Tous" },
    { key: "SUBMITTED", label: "Soumis" },
    { key: "NOT_SUBMITTED", label: "En attente" },
    { key: "IN_PROGRESS", label: "En cours" },
];

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
            <h2 className="mb-1 text-2xl font-bold text-slate-800">Mon tableau de bord</h2>
            <p className="mb-6 text-sm text-slate-500">Suivez et complétez vos retours de formation.</p>

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
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                                    filter === f.key ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-5 py-3 font-medium">Module</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                        <th className="px-5 py-3 font-medium">Note</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>
                    ) : feedbacks.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun feedback.</td></tr>
                    ) : (
                        feedbacks.map((f) => (
                            <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
                                <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                                <td className="px-5 py-3.5 text-slate-600">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                                <td className="px-5 py-3.5 text-slate-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                                <td className="px-5 py-3.5">
                                    {f.status === "SUBMITTED" ? (
                                        <Link to={`/feedback/${f.feedbackId}/detail`}
                                              className="rounded-lg inline-flex items-center border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                            Consulter
                                        </Link>
                                    ) : (
                                        <Link to={`/feedback/${f.feedbackId}`}
                                              className="rounded-lg inline-flex items-center gap-1.5 bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark">
                                            {f.status === "IN_PROGRESS" ? "Continuer" : "Donner mon avis"}
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}