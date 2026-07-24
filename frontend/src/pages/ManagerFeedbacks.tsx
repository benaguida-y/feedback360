import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }

const FILTERS = [
    { key: "", label: "Tous" },
    { key: "SUBMITTED", label: "Soumis" },
    { key: "NOT_SUBMITTED", label: "En attente" },
    { key: "IN_PROGRESS", label: "En cours" },
];

export default function ManagerFeedbacks() {
    const role = getRole();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        const url = filter ? `/management/feedbacks?status=${filter}` : "/management/feedbacks";
        client.get<Feedback[]>(url).then((r) => setFeedbacks(r.data)).catch(() => setError("Impossible de charger les feedbacks."));
    }, [filter]);

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tous les feedbacks</h2>
                    <p className="text-sm text-slate-500">Consultez les retours de l'ensemble des collaborateurs.</p>
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex gap-2">
                {FILTERS.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`px-3.5 py-1.5 text-sm font-medium transition ${
                                filter === f.key ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
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
                                    {f.status === "NOT_SUBMITTED" ? (
                                        <span title="Feedback pas encore soumis"
                                              className="inline-flex cursor-not-allowed items-center border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                                            Consulter
                                        </span>
                                    ) : (
                                        <Link to={`/feedback/${f.feedbackId}/detail`}
                                              className="inline-flex items-center border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                            Consulter
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}