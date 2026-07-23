import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import BackButton from "../components/BackButton";
import Layout from "../components/Layout";

export default function SubmitFeedback() {
    const { feedbackId } = useParams();
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (score < 1) { setError("Merci de donner une note."); return; }
        setLoading(true);
        try {
            await client.post(`/feedbacks/${feedbackId}/submit`, { globalScore: score, comment });
            navigate("/", { state: { success: "Votre feedback a bien été envoyé. Merci !" } });
        } catch {
            setError("Envoi impossible (feedback déjà soumis, introuvable, ou non autorisé).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Layout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Donner mon feedback</h2>
                    <p className="text-sm text-slate-500">Notez le module et laissez un commentaire.</p>
                </div>
            </div>

            <div className="max-w-lg border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit}>
                    <p className="mb-2 text-sm font-medium text-slate-700">Note globale</p>
                    <div className="mb-6 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button type="button" key={n}
                                    onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                    onClick={() => setScore(n)}
                                    className={`text-3xl transition ${(hover || score) >= n ? "text-amber-400" : "text-slate-300"}`}>
                                ★
                            </button>
                        ))}
                        {score > 0 && <span className="ml-3 text-sm text-slate-500">{score} / 5</span>}
                    </div>

                    <label className="mb-6 block">
                        <span className="text-sm font-medium text-slate-700">Commentaire</span>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                                  placeholder="Votre avis sur le module…"
                                  className="mt-1.5 w-full border border-slate-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
                    </label>

                    {error && <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                        {loading ? "Envoi…" : "Envoyer mon feedback"}
                    </button>
                </form>
            </div>
        </Layout>
    );
}