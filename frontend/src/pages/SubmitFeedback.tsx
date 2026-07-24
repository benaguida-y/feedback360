import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { getToken } from "../auth";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

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
            .catch(() => setLoadError("Feedback introuvable ou non accessible."));
    }, [feedbackId]);

    // (1) Auto-save 1,5 s après la dernière modification
    useEffect(() => {
        if (!touched.current || !detail || detail.status === "SUBMITTED") return;
        const t = setTimeout(() => saveDraft(true), 1500);
        return () => clearTimeout(t);
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
            if (!auto) setError("Impossible d'enregistrer le brouillon.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (score < 1) { setError("Merci de donner une note."); return; }
        setLoading(true);
        try {
            await client.post(`/feedbacks/${feedbackId}/submit`, { globalScore: score, comment });
            submittedRef.current = true; // empêche le flush brouillon au démontage
            navigate("/", { state: { success: "Votre feedback a bien été envoyé. Merci !" } });
        } catch {
            setError("Envoi impossible (feedback déjà soumis, introuvable, ou non autorisé).");
        } finally {
            setLoading(false);
        }
    }

    const createdLabel = detail
        ? new Date(detail.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "";
    const savedLabel = savedAt ? savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Donner mon feedback</h2>
                    <p className="text-sm text-slate-500">{detail ? detail.moduleTitle : "Chargement du module…"}</p>
                </div>
            </div>

            {loadError && <p className="text-red-600">{loadError}</p>}

            {detail && detail.status === "SUBMITTED" ? (
                <div className="max-w-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
                    <p className="font-semibold">Vous avez déjà soumis ce feedback ✔</p>
                    <p className="mt-2 text-sm">Note : {detail.globalScore} / 5</p>
                    {detail.comment && <p className="mt-1 text-sm">Commentaire : {detail.comment}</p>}
                </div>
            ) : detail ? (
                <div className="max-w-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Module de formation</p>
                            <p className="mt-1 text-lg font-semibold text-slate-800">{detail.moduleTitle}</p>
                            <p className="mt-1 text-sm text-slate-500">Terminé le {createdLabel}</p>
                        </div>
                        {detail.status === "IN_PROGRESS" && (
                            <span className="bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">Brouillon</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <p className="mb-2 text-sm font-medium text-slate-700">Note globale</p>
                        <div className="mb-6 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button type="button" key={n}
                                        onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                        onClick={() => { setScore(n); markTouched(); }}
                                        className={`text-3xl transition ${(hover || score) >= n ? "text-amber-400" : "text-slate-300"}`}>
                                    ★
                                </button>
                            ))}
                            {score > 0 && <span className="ml-3 text-sm text-slate-500">{score} / 5</span>}
                        </div>

                        <label className="mb-6 block">
                            <span className="text-sm font-medium text-slate-700">Commentaire</span>
                            <textarea value={comment} onChange={(e) => { setComment(e.target.value); markTouched(); }} rows={4}
                                      placeholder="Votre avis sur le module…"
                                      className="mt-1.5 w-full border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                        </label>

                        {error && <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => saveDraft(false)} disabled={saving}
                                    className="border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand disabled:opacity-60">
                                {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
                            </button>
                            <button type="submit" disabled={loading}
                                    className="flex-1 bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                                {loading ? "Envoi…" : "Envoyer mon feedback"}
                            </button>
                        </div>

                        <p className="mt-3 h-4 text-xs text-slate-400">
                            {saving ? "Enregistrement du brouillon…" : savedAt ? `Brouillon enregistré à ${savedLabel}` : ""}
                        </p>
                    </form>
                </div>
            ) : (
                !loadError && <p className="text-slate-500">Chargement…</p>
            )}
        </Layout>
    );
}