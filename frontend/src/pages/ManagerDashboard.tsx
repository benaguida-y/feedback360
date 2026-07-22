import { useEffect, useState } from "react";
import client from "../api/client";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface ModuleStats { moduleTitle: string; submittedCount: number; notSubmittedCount: number; averageScore: number | null; }
interface Stats { totalFeedbacks: number; submittedFeedbacks: number; submissionRate: number; averageScore: number | null; perModule: ModuleStats[]; }

export default function ManagerDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [s, st] = await Promise.all([
                    client.get<Summary>("/management/feedbacks/summary"),
                    client.get<Stats>("/management/feedbacks/stats"),
                ]);
                setSummary(s.data); setStats(st.data);
            } catch { setError("Impossible de charger les statistiques."); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    if (loading) return <p className="text-gray-600">Chargement…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const avg = stats!.averageScore;
    const rate = Math.round(stats!.submissionRate * 100);

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card label="Total" value={summary!.total} color="text-gray-800" />
                <Card label="Soumis" value={summary!.submitted} color="text-green-600" />
                <Card label="En attente" value={summary!.notSubmitted} color="text-amber-600" />
                <Card label="En cours" value={summary!.inProgress} color="text-sky-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <Card label="Note moyenne" value={avg !== null ? avg.toFixed(1) + " / 5" : "—"} color="text-amber-500" />
                <Card label="Taux de soumission" value={rate + " %"} color="text-green-600" />
            </div>

            <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-800">Par module</h3>
            <div className="overflow-hidden rounded-xl bg-white shadow">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Soumis</th>
                        <th className="px-4 py-3">Non soumis</th>
                        <th className="px-4 py-3">Note moyenne</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stats!.perModule.map((m) => (
                        <tr key={m.moduleTitle} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-gray-800">{m.moduleTitle}</td>
                            <td className="px-4 py-3 text-green-700">{m.submittedCount}</td>
                            <td className="px-4 py-3 text-amber-700">{m.notSubmittedCount}</td>
                            <td className="px-4 py-3 text-gray-700">{m.averageScore !== null ? m.averageScore.toFixed(1) : "—"}</td>
                        </tr>
                    ))}
                    {stats!.perModule.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Aucune donnée.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Card({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}