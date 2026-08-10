import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

interface Detail {
    feedbackId: number;
    status: string;
    moduleTitle: string;
    createdAt: string;
    globalScore: number | null;
    comment: string | null;
    collaboratorName?: string;   // renvoyé uniquement par l'API de gestion
    collaboratorEmail?: string;
}

export default function FeedbackDetail() {
    const { feedbackId } = useParams();
    const role = getRole();
    const { t, i18n } = useTranslation();
    const isManager = role === "MANAGER" || role === "ADMIN";
    const [detail, setDetail] = useState<Detail | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        // Le manager interroge l'API de gestion (il voit tous les feedbacks).
        // Le collaborateur interroge la sienne, qui vérifie qu'il en est bien le propriétaire.
        const url = isManager ? `/management/feedbacks/${feedbackId}` : `/feedbacks/${feedbackId}`;
        client.get<Detail>(url)
            .then((r) => setDetail(r.data))
            .catch(() => setError(t("feedbackDetail.notFound")));
    }, [feedbackId, isManager]);

    if (error) return <Layout><p className="error-text">{error}</p></Layout>;
    if (!detail) return <Layout><p className="loading-text">{t("common.loading")}</p></Layout>;

    const score = detail.globalScore;

    return (
        <Layout>
            <PageHeader title={detail.moduleTitle}
                        subtitle={t("feedbackDetail.subtitle")}
                        backTo="/"
            />

            <div className="card detail-card">
                <dl className="detail-list">
                    <Row label={t("common.status")}><StatusBadge status={detail.status} /></Row>

                    {detail.collaboratorName && (
                        <Row label={t("common.collaborator")}>
                            <span className="cell-strong">{detail.collaboratorName}</span>
                            <span className="text-faint detail-inline">{detail.collaboratorEmail}</span>
                        </Row>
                    )}

                    <Row label={t("common.date")}>
                        {new Date(detail.createdAt).toLocaleDateString(i18n.language === "en" ? "en-GB" : "fr-FR", {
                            day: "2-digit", month: "long", year: "numeric",
                        })}
                    </Row>

                    <Row label={t("common.globalScore")}>
                        {score != null ? (
                            <span className="detail-row">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <span key={n} className={`text-xl ${n <= Math.round(score) ? "star-filled" : "star-empty"}`}>★</span>
                                ))}
                                <span className="cell-muted detail-row-note">{score} / 5</span>
                            </span>
                        ) : (
                            <span className="text-faint">{t("feedbackDetail.notRated")}</span>
                        )}
                    </Row>
                </dl>

                <div className="detail-comment">
                    <p className="cell-muted detail-comment-label">{t("common.comment")}</p>
                    {detail.comment?.trim()
                        ? <p className="detail-value pre-wrap">{detail.comment}</p>
                        : <p className="text-faint">{t("feedbackDetail.noComment")}</p>}
                </div>
            </div>
        </Layout>
    );
}

// Une ligne « libellé / valeur » de la fiche.
function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="detail-stars">
            <dt className="detail-label">{label}</dt>
            <dd className="detail-value">{children}</dd>
        </div>
    );
}
