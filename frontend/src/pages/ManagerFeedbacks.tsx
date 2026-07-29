import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import StatusFilter from "../components/StatusFilter";
import Table from "../components/Table";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; collaboratorName: string; }

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
            <PageHeader title="Tous les feedbacks"
                        subtitle="Consultez les retours de l'ensemble des collaborateurs."
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3">
                <StatusFilter value={filter} onChange={setFilter} />
            </div>

            <Card>
                <Table columns={["Module", "Collaborateur", "Statut", "Note", "Date", "Action"]}
                       isEmpty={feedbacks.length === 0} emptyLabel="Aucun feedback.">
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
                            <td className="px-5 py-3.5 text-slate-600">{f.collaboratorName}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                            <td className="px-5 py-3.5 text-slate-600">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="px-5 py-3.5 text-slate-500">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-5 py-3.5">
                                {f.status === "NOT_SUBMITTED" ? (
                                    <span title="Feedback pas encore soumis"
                                          className="inline-flex cursor-not-allowed items-center rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                                        Consulter
                                    </span>
                                ) : (
                                    <Link to={`/feedback/${f.feedbackId}/detail`}
                                          className="inline-flex items-center rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand hover:text-brand">
                                        Consulter
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </Layout>
    );
}