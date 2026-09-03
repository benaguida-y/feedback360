import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { useTranslation } from "react-i18next";

interface Feedback { feedbackId: number; status: string; moduleTitle: string; createdAt: string; globalScore: number | null; }
interface Detail { userId: number; fullName: string; email: string; feedbacks: Feedback[]; }

export default function CollaboratorDetail() {
    const { userId } = useParams();
    const role = getRole();
    const { t, i18n } = useTranslation();
    const [detail, setDetail] = useState<Detail | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        setLoading(true);
        client.get<Detail>(`/management/collaborators/${userId}`)
            .then((r) => setDetail(r.data))
            .catch(() => setError(t("collaboratorDetail.notFound")))
            .finally(() => setLoading(false));
    }, [userId]);

    if (error) return <Layout><p className="error-text">{error}</p></Layout>;

    const feedbacks = detail?.feedbacks ?? [];

    return (
        <Layout>
            <PageHeader title={detail ? detail.fullName : t("common.collaborator")}
                        subtitle={detail?.email}
                        backTo="/management/collaborators" />

            <h3 className="section-title dash-head">{t("collaboratorDetail.modulesFeedbacks")}</h3>
            <Card>
                <Table columns={[t("common.module"), t("common.status"), t("common.score"), t("common.date"), t("common.action")]}
                       loading={loading}
                       isEmpty={feedbacks.length === 0} emptyLabel={t("collaboratorDetail.empty")}>
                    {feedbacks.map((f) => (
                        <tr key={f.feedbackId} className="table-row">
                            <td className="table-cell cell-strong">{f.moduleTitle}</td>
                            <td className="table-cell"><StatusBadge status={f.status} /></td>
                            <td className="table-cell cell-default">{f.globalScore != null ? `${f.globalScore} / 5` : "—"}</td>
                            <td className="table-cell cell-muted">{new Date(f.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR")}</td>
                            <td className="table-cell">
                                {f.status === "NOT_SUBMITTED" ? (
                                    <span title={t("common.notSubmittedTooltip")} className="btn-action-disabled">
                                        {t("common.view")}
                                    </span>
                                ) : (
                                    <Link to={`/feedback/${f.feedbackId}/detail`} className="btn-action">
                                        {t("common.view")}
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
