import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }
interface Detail { userId: number; fullName: string; email: string; feedbacks: Feedback[]; }

export default function CollaboratorDetail() {
    const { userId } = useParams();
    const role = getRole();
    const [detail, setDetail] = useState<Detail | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        setLoading(true);
        client.get<Detail>(`/management/collaborators/${userId}`)
            .then((r) => setDetail(r.data))
            .catch(() => setError("Collaborateur introuvable."))
            .finally(() => setLoading(false));
    }, [userId]);

    if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;

    const feedbacks = detail?.feedbacks ?? [];

    return (
        <Layout>
            <PageHeader title={detail ? detail.fullName : "Collaborateur"}
                        subtitle={detail?.email}
                        backTo="/management/collaborators" />

            <h3 className="mb-3 text-lg font-semibold text-slate-800">Modules & feedbacks</h3>
            <Card>
                <Table columns={["Module", "Statut", "Note", "Date", "Action"]}
                       loading={loading}
                       isEmpty={feedbacks.length === 0} emptyLabel="Aucun module.">
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{f.moduleTitle}</td>
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