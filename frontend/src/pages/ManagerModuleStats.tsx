import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";
import Table from "../components/Table.tsx";
import Card from "../components/Card.tsx";

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
            <PageHeader title="Détail par module"
                        subtitle="Taux de retour et note moyenne, module par module."
                        backTo="/"
            />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <Card>
                <Table columns={["Module", "Soumis", "Non soumis", "Note moyenne"]}
                       isEmpty={perModule.length === 0} emptyLabel="Aucune donnée.">
                    {perModule.map((m) => (
                            <tr key={m.moduleTitle} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5 font-medium text-slate-800">{m.moduleTitle}</td>
                                <td className="px-5 py-3.5 text-emerald-700">{m.submittedCount}</td>
                                <td className="px-5 py-3.5 text-amber-700">{m.notSubmittedCount}</td>
                                <td className="px-5 py-3.5 text-slate-600">{m.averageScore != null ? m.averageScore.toFixed(1) : "—"}</td>
                            </tr>
                        ))}
                </Table>
            </Card>
        </Layout>
    );
}