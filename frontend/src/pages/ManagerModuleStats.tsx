import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

interface ModuleStats { moduleTitle: string; submittedCount: number; notSubmittedCount: number; averageScore: number | null; }
interface Stats { perModule: ModuleStats[]; }

export default function ManagerModuleStats() {
    const role = getRole();
    const [perModule, setPerModule] = useState<ModuleStats[]>([]);
    const [error, setError] = useState("");

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<Stats>("/management/feedbacks/stats")
            .then((r) => setPerModule(r.data.perModule))
            .catch(() => setError("Impossible de charger le détail par module."));
    }, []);

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Détail par module</h2>
                    <p className="text-sm text-slate-500">Taux de retour et note moyenne, module par module.</p>
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

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
                    {perModule.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucune donnée.</td></tr>
                    ) : (
                        perModule.map((m) => (
                            <tr key={m.moduleTitle} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5 font-medium text-slate-800">{m.moduleTitle}</td>
                                <td className="px-5 py-3.5 text-emerald-700">{m.submittedCount}</td>
                                <td className="px-5 py-3.5 text-amber-700">{m.notSubmittedCount}</td>
                                <td className="px-5 py-3.5 text-slate-600">{m.averageScore != null ? m.averageScore.toFixed(1) : "—"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}