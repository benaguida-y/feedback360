import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

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
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Collaborateurs</h2>
                    <p className="text-sm text-slate-500">Progression des retours par personne.</p>
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-5 py-3 font-medium">Collaborateur</th>
                        <th className="px-5 py-3 font-medium">Progression</th>
                        <th className="px-5 py-3 font-medium">Note moyenne</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {rows.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucun collaborateur.</td></tr>
                    ) : (
                        rows.map((c) => (
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
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}