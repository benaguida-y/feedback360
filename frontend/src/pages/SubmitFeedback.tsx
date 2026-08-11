import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { getToken } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

interface Detail {
    feedbackId: number;
    status: string;
    moduleTitle: string;
    createdAt: string;
    globalScore: number | null;
    comment: string | null;
}

export default function SubmitFeedback() {
    const { feedbackId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const locale = i18n.language === "en" ? "en-GB" : "fr-FR";

    const [detail, setDetail] = useState<Detail | null>(null);
    const [loadError, setLoadError] = useState("");

    const [score, setScore] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    // Refs pour les handlers qui s'exécutent hors rendu (démontage, fermeture d'onglet)
    const touched = useRef(false);
    const submittedRef = useRef(false);
    const detailRef = useRef<Detail | null>(null);
    const latest = useRef({ score: 0, comment: "" });

    useEffect(() => { detailRef.current = detail; }, [detail]);
    useEffect(() => { latest.current = { score, comment }; }, [score, comment]);

    // Faut-il enregistrer un brouillon ? (modifié, pas encore soumis, feedback modifiable)
    function shouldSaveDraft() {
        const d = detailRef.current;
        return touched.current && !submittedRef.current && !!d && d.status !== "SUBMITTED";
    }

    // Charge le contexte + pré-remplit avec le brouillon éventuel
    useEffect(() => {
        client.get<Detail>(`/feedbacks/${feedbackId}`)
            .then((r) => {
                setDetail(r.data);
                setScore(r.data.globalScore ?? 0);
                setComment(r.data.comment ?? "");
            })
            .catch(() => setLoadError(t("submitFeedback.notFound")));
    }, [feedbackId]);

    // (1) Auto-save 1,5 s après la dernière modification
    useEffect(() => {
        if (!touched.current || !detail || detail.status === "SUBMITTED") return;
        const timer = setTimeout(() => saveDraft(true), 1500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [score, comment]);

    // (2) Fermeture / rechargement de l'onglet : requête "keepalive" qui survit à la page
    useEffect(() => {
        function handleBeforeUnload() {
            if (!shouldSaveDraft()) return;
            const base = import.meta.env.VITE_API_BASE_URL;
            fetch(`${base}/feedbacks/${feedbackId}/draft`, {
                method: "POST",
                keepalive: true,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ globalScore: latest.current.score || null, comment: latest.current.comment }),
            }).catch(() => {});
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [feedbackId]);

    // (3) Navigation interne (clic sidebar, retour…) : on vide le brouillon au démontage
    useEffect(() => {
        return () => {
            if (!shouldSaveDraft()) return;
            client.post(`/feedbacks/${feedbackId}/draft`, {
                globalScore: latest.current.score || null,
                comment: latest.current.comment,
            }).catch(() => {});
        };
    }, [feedbackId]);

    function markTouched() { touched.current = true; }

    async function saveDraft(auto = false) {
        if (!detail || detail.status === "SUBMITTED") return;
        setSaving(true);
        setError("");
        try {
            await client.post(`/feedbacks/${feedbackId}/draft`, { globalScore: score || null, comment });
            setSavedAt(new Date());
        } catch {
            if (!auto) setError(t("submitFeedback.draftError"));
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (score < 1) { setError(t("submitFeedback.noRating")); return; }
        if (!comment.trim()) { setError(t("submitFeedback.noComment")); return; }
        setLoading(true);
        try {
            await client.post(`/feedbacks/${feedbackId}/submit`, { globalScore: score, comment });
            submittedRef.current = true; // empêche le flush brouillon au démontage
            navigate("/", { state: { success: t("submitFeedback.submitSuccess") } });
        } catch {
            setError(t("submitFeedback.submitError"));
        } finally {
            setLoading(false);
        }
    }

    const createdLabel = detail
        ? new Date(detail.createdAt).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
        : "";
    const savedLabel = savedAt ? savedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "";

    return (
        <Layout>
            <PageHeader title={t("submitFeedback.title")}
                        subtitle={detail ? detail.moduleTitle : t("submitFeedback.loadingModule")}
                        backTo="/"
            />

            {loadError && <p className="error-text">{loadError}</p>}

            {detail && detail.status === "SUBMITTED" ? (
                <div className="notice-success submit-notice">
                    <p className="text-semibold">{t("submitFeedback.alreadySubmitted")}</p>
                    <p className="submit-line">{t("submitFeedback.ratingValue", { score: detail.globalScore })}</p>
                    {detail.comment && <p className="submit-line-tight">{t("submitFeedback.commentValue", { comment: detail.comment })}</p>}
                </div>
            ) : detail ? (
                <div className="card submit-card">
                    <div className="module-strip">
                        <div>
                            <p className="highlight-label">{t("submitFeedback.trainingModule")}</p>
                            <p className="strip-title">{detail.moduleTitle}</p>
                            <p className="strip-sub">{t("submitFeedback.completedOn", { date: createdLabel })}</p>
                        </div>
                        {detail.status === "IN_PROGRESS" && (
                            <span className="draft-badge">{t("submitFeedback.draft")}</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="pad-6">
                        <p className="form-label form-label-mb">{t("common.globalScore")}</p>
                        <div className="stars-row">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button type="button" key={n}
                                        onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                        onClick={() => { setScore(n); markTouched(); }}
                                        className={`star-btn ${(hover || score) >= n ? "star-filled" : "star-idle"}`}>
                                    ★
                                </button>
                            ))}
                            {score > 0 && <span className="cell-muted score-label">{score} / 5</span>}
                        </div>

                        <label className="comment-block">
                            <span className="form-label">{t("common.comment")} <span className="required-mark">*</span></span>
                            <textarea value={comment} onChange={(e) => { setComment(e.target.value); markTouched(); }} rows={4}
                                      placeholder={t("submitFeedback.commentPlaceholder")}
                                      className="form-input-plain el-transition" />
                        </label>

                        {error && <p className="error-banner">{error}</p>}

                        <div className="row-center-3">
                            <button type="button" onClick={() => saveDraft(false)} disabled={saving} className="btn-secondary">
                                {saving ? t("submitFeedback.saving") : t("submitFeedback.saveDraft")}
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary-lg btn-flex1">
                                {loading ? t("submitFeedback.sending") : t("submitFeedback.submit")}
                            </button>
                        </div>

                        <p className="text-faint draft-status">
                            {saving ? t("submitFeedback.savingDraft") : savedAt ? t("submitFeedback.draftSavedAt", { time: savedLabel }) : ""}
                        </p>
                    </form>
                </div>
            ) : (
                !loadError && <p className="loading-text">{t("common.loading")}</p>
            )}
        </Layout>
    );
}
