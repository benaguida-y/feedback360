import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader.tsx";

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
    const isManager = role === "MANAGER" || role === "ADMIN";
    const [detail, setDetail] = useState<Detail | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        // Le manager interroge l'API de gestion (il voit tous les feedbacks).
        // Le collaborateur interroge la sienne, qui vérifie qu'il en est bien le propriétaire.
        const url = isManager ? `/management/feedbacks/${feedbackId}` : `/feedbacks/${feedbackId}`;
        client.get<Detail>(url)
            .then((r) => setDetail(r.data))
            .catch(() => setError("Feedback introuvable ou non accessible."));
    }, [feedbackId, isManager]);

    if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;
    if (!detail) return <Layout><p className="text-slate-500">Chargement…</p></Layout>;

    const score = detail.globalScore;

    return (
        <Layout>
            <PageHeader title={detail.moduleTitle}
                        subtitle="Détail du feedback"
                        backTo="/"
            />

            <div className="max-w-2xl border border-slate-200 bg-white shadow-sm">
                <dl className="divide-y divide-slate-100">
                    <Row label="Statut"><StatusBadge status={detail.status} /></Row>

                    {detail.collaboratorName && (
                        <Row label="Collaborateur">
                            <span className="font-medium text-slate-800">{detail.collaboratorName}</span>
                            <span className="ml-2 text-slate-400">{detail.collaboratorEmail}</span>
                        </Row>
                    )}

                    <Row label="Date">
                        {new Date(detail.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "long", year: "numeric",
                        })}
                    </Row>

                    <Row label="Note globale">
                        {score != null ? (
                            <span className="flex items-center">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <span key={n} className={`text-xl ${n <= Math.round(score) ? "text-amber-400" : "text-slate-200"}`}>★</span>
                                ))}
                                <span className="ml-3 text-slate-500">{score} / 5</span>
                            </span>
                        ) : (
                            <span className="text-slate-400">Pas encore noté</span>
                        )}
                    </Row>
                </dl>

                <div className="border-t border-slate-100 p-5">
                    <p className="mb-2 text-sm font-medium text-slate-500">Commentaire</p>
                    {detail.comment?.trim()
                        ? <p className="whitespace-pre-wrap text-slate-700">{detail.comment}</p>
                        : <p className="text-slate-400">Aucun commentaire.</p>}
                </div>
            </div>
        </Layout>
    );
}

// Une ligne « libellé / valeur » de la fiche.
function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-center gap-6 px-5 py-4">
            <dt className="w-40 flex-none text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-700">{children}</dd>
        </div>
    );
}