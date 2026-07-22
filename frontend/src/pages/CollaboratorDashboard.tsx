import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }

export default function CollaboratorDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [s, f] = await Promise.all([
                    client.get<Summary>("/feedbacks/summary"),
                    client.get<Feedback[]>("/feedbacks"),
                ]);
                setSummary(s.data);
                setFeedbacks(f.data);
            } catch {
                setError("Impossible de charger vos feedbacks.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p className="text-gray-600">Chargement…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card label="Total" value={summary!.total} color="text-gray-800" />
                <Card label="Soumis" value={summary!.submitted} color="text-green-600" />
                <Card label="En attente" value={summary!.notSubmitted} color="text-amber-600" />
                <Card label="En cours" value={summary!.inProgress} color="text-sky-600" />
            </div>

            <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-800">Mes feedbacks</h3>
            <div className="overflow-hidden rounded-xl bg-white shadow">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Note</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-gray-800">{f.moduleTitle}</td>
                            <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                            <td className="px-4 py-3 text-gray-700">{f.globalScore ?? "—"}</td>
                            <td className="px-4 py-3 text-gray-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-4 py-3">
                                {f.status === "NOT_SUBMITTED"
                                    ? <Link to={`/feedback/${f.feedbackId}`} className="text-sky-600 hover:underline">Donner mon avis</Link>
                                    : <span className="text-gray-400">—</span>}
                            </td>
                        </tr>
                    ))}
                    {feedbacks.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Aucun feedback.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Card({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        SUBMITTED: "bg-green-100 text-green-700",
        NOT_SUBMITTED: "bg-amber-100 text-amber-700",
        IN_PROGRESS: "bg-sky-100 text-sky-700",
    };
    return <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}