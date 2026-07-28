import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";
import Card from "../components/Card.tsx";
import Table from "../components/Table.tsx";

interface Collab {
    userId: number;
    fullName: string;
    email: string;
    total: number;
    submitted: number;
    notSubmitted: number;
    submittedPercent: number;
    averageScore: number | null;
}

export default function ManagerCollaborators() {
    const role = getRole();
    const [rows, setRows] = useState<Collab[]>([]);
    const [error, setError] = useState("");

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<Collab[]>("/management/collaborators")
            .then((r) => setRows(r.data))
            .catch(() => setError("Impossible de charger les collaborateurs."));
    }, []);

    return (
        <Layout>
            <PageHeader title="Collaborateurs"
                        subtitle="Progression des retours par personne."
                        backTo="/"
            />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <Card>
                <Table columns={["Collaborateur", "Progression", "Note moyenne", "Action"]}
                       isEmpty={rows.length === 0} emptyLabel="Aucun collaborateur.">
                    {rows.map((c) => (
                            <tr key={c.userId} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3.5">
                                    <p className="font-medium text-slate-800">{c.fullName}</p>
                                    <p className="text-xs text-slate-400">{c.email}</p>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-32 bg-slate-100">
                                            <div className="h-2 bg-brand" style={{ width: `${c.submittedPercent}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-500">{c.submitted} / {c.total} soumis</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-slate-600">{c.averageScore != null ? `${c.averageScore.toFixed(1)} / 5` : "—"}</td>
                                <td className="px-5 py-3.5">
                                    <Link to={`/management/collaborators/${c.userId}`}
                                          className="inline-flex items-center border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                        Voir la fiche
                                    </Link>
                                </td>
                            </tr>
                        ))}
                </Table>
            </Card>
        </Layout>
    );
}