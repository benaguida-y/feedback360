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

            {loadError && <p className="text-red-600">{loadError}</p>}

            {detail && detail.status === "SUBMITTED" ? (
                <div className="max-w-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/15 p-6 text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold">{t("submitFeedback.alreadySubmitted")}</p>
                    <p className="mt-2 text-sm">{t("submitFeedback.ratingValue", { score: detail.globalScore })}</p>
                    {detail.comment && <p className="mt-1 text-sm">{t("submitFeedback.commentValue", { comment: detail.comment })}</p>}
                </div>
            ) : detail ? (
                <div className="max-w-lg border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel shadow-sm">
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-cap-border bg-slate-50 dark:bg-cap-panel2 p-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("submitFeedback.trainingModule")}</p>
                            <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{detail.moduleTitle}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("submitFeedback.completedOn", { date: createdLabel })}</p>
                        </div>
                        {detail.status === "IN_PROGRESS" && (
                            <span className="bg-sky-50 dark:bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">{t("submitFeedback.draft")}</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.globalScore")}</p>
                        <div className="mb-6 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button type="button" key={n}
                                        onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                        onClick={() => { setScore(n); markTouched(); }}
                                        className={`text-3xl transition ${(hover || score) >= n ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}>
                                    ★
                                </button>
                            ))}
                            {score > 0 && <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">{score} / 5</span>}
                        </div>

                        <label className="mb-6 block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.comment")} <span className="text-red-500">*</span></span>
                            <textarea value={comment} onChange={(e) => { setComment(e.target.value); markTouched(); }} rows={4}
                                      placeholder={t("submitFeedback.commentPlaceholder")}
                                      className="mt-1.5 w-full border border-slate-300 dark:border-cap-border px-3 py-2 dark:bg-cap-panel outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                        </label>

                        {error && <p className="mb-4 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/15 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => saveDraft(false)} disabled={saving}
                                    className="border border-slate-300 dark:border-cap-border px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand hover:text-brand disabled:opacity-60">
                                {saving ? t("submitFeedback.saving") : t("submitFeedback.saveDraft")}
                            </button>
                            <button type="submit" disabled={loading}
                                    className="flex-1 bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                                {loading ? t("submitFeedback.sending") : t("submitFeedback.submit")}
                            </button>
                        </div>

                        <p className="mt-3 h-4 text-xs text-slate-400 dark:text-slate-500">
                            {saving ? t("submitFeedback.savingDraft") : savedAt ? t("submitFeedback.draftSavedAt", { time: savedLabel }) : ""}
                        </p>
                    </form>
                </div>
            ) : (
                !loadError && <p className="text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
            )}
        </Layout>
    );
}
