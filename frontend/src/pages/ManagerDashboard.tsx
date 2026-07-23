import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface ModuleStats { moduleTitle: string; submittedCount: number; notSubmittedCount: number; averageScore: number | null; }
interface Stats { totalFeedbacks: number; submittedFeedbacks: number; submissionRate: number; averageScore: number | null; perModule: ModuleStats[]; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }

const FILTERS = [
    { key: "", label: "Tous" },
    { key: "SUBMITTED", label: "Soumis" },
    { key: "NOT_SUBMITTED", label: "En attente" },
    { key: "IN_PROGRESS", label: "En cours" },
];

export default function ManagerDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([client.get<Summary>("/management/feedbacks/summary"), client.get<Stats>("/management/feedbacks/stats")])
            .then(([s, st]) => { setSummary(s.data); setStats(st.data); })
            .catch(() => setError("Impossible de charger les statistiques."))
            .finally(() => setLoading(false));
    }, []);

    // Recharge la liste à chaque changement de filtre.
    useEffect(() => {
        const url = filter ? `/management/feedbacks?status=${filter}` : "/management/feedbacks";
        client.get<Feedback[]>(url)
            .then((r) => setFeedbacks(r.data))
            .catch(() => setError("Impossible de charger les feedbacks."));
    }, [filter]);

    if (loading) return <p className="text-slate-500">Chargement…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const avg = stats!.averageScore;
    const rate = Math.round(stats!.submissionRate * 100);

    return (
        <div>
            <h2 className="mb-1 text-2xl font-bold text-slate-800">Vue d'ensemble</h2>
            <p className="mb-6 text-sm text-slate-500">Statistiques globales des feedbacks.</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total" value={summary!.total} />
                <StatCard label="Soumis" value={summary!.submitted} accent="text-emerald-600" />
                <StatCard label="En attente" value={summary!.notSubmitted} accent="text-amber-600" />
                <StatCard label="En cours" value={summary!.inProgress} accent="text-sky-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <StatCard label="Note moyenne" value={avg != null ? `${avg.toFixed(1)} / 5` : "—"} accent="text-brand" />
                <StatCard label="Taux de soumission" value={`${rate} %`} accent="text-emerald-600" />
            </div>

            <h3 className="mt-8 mb-3 text-lg font-semibold text-slate-800">Détail par module</h3>
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-5 py-3 font-medium">Module</th>
                        <th className="px-5 py-3 font-medium">Soumis</th>
                        <th className="px-5 py-3 font-medium">Non soumis</th>
                        <th className="px-5 py-3 font-medium">Note moyenne</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {stats!.perModule.map((m) => (
                        <tr key={m.moduleTitle} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{m.moduleTitle}</td>
                            <td className="px-5 py-3.5 text-emerald-700">{m.submittedCount}</td>
                            <td className="px-5 py-3.5 text-amber-700">{m.notSubmittedCount}</td>
                            <td className="px-5 py-3.5 text-slate-600">{m.averageScore != null ? m.averageScore.toFixed(1) : "—"}</td>
                        </tr>
                    ))}
                    {stats!.perModule.length === 0 && (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucune donnée.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-800">Tous les feedbacks</h3>
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-3.5 py-1.5 text-sm font-medium transition ${
                                    filter === f.key ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-3 overflow-hidden border border-slate-200 bg-white shadow-sm">
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
                    {feedbacks.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun feedback.</td></tr>
                    ) : (
                        feedbacks.map((f) => (
                            <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
                                <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                                <td className="px-5 py-3.5 text-slate-600">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                                <td className="px-5 py-3.5 text-slate-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                                <td className="px-5 py-3.5">
                                    <Link to={`/feedback/${f.feedbackId}/detail`}
                                          className="inline-flex items-center border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                        Consulter
                                    </Link>
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