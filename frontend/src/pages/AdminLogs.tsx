import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";
import Table from "../components/Table.tsx";
import Card from "../components/Card.tsx";

interface Log {
    logId: number;
    type: string;
    status: string;
    receivedAt: string;
    processedAt: string | null;
    userEmail: string | null;
    moduleTitle: string | null;
}

function statusBadge(status: string) {
    switch (status) {
        case "SUCCESS":     return "bg-emerald-50 text-emerald-700";
        case "FAILURE":     return "bg-red-50 text-red-700";
        case "IN_PROGRESS": return "bg-sky-50 text-sky-700";
        default:            return "bg-slate-100 text-slate-600";
    }
}

export default function AdminLogs() {
    const role = getRole();
    const [logs, setLogs] = useState<Log[]>([]);
    const [error, setError] = useState("");

    if (role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<Log[]>("/admin/logs")
            .then((r) => setLogs(r.data))
            .catch(() => setError("Impossible de charger les logs."));
    }, []);

    const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR") : "—");

    return (
        <Layout>
            <PageHeader title="Supervision"
                        subtitle="Journal des appels d'intégration reçus (webhook)."
                        backTo="/"
            />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <Card>
                <Table columns={["Type", "Statut", "Reçu le", "Traité le", "Utilisateur", "Module"]}
                       isEmpty={logs.length === 0} emptyLabel="Aucun appel enregistré.">
                    {logs.map((l) => (
                            <tr key={l.logId} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5 text-slate-600">{l.type}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(l.status)}`}>{l.status}</span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-500">{fmt(l.receivedAt)}</td>
                                <td className="px-5 py-3.5 text-slate-500">{fmt(l.processedAt)}</td>
                                <td className="px-5 py-3.5 text-slate-600">{l.userEmail ?? "—"}</td>
                                <td className="px-5 py-3.5 text-slate-600">{l.moduleTitle ?? "—"}</td>
                            </tr>
                        ))}
                </Table>
            </Card>
        </Layout>
    );
}