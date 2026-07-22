import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

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
            navigate("/");
        } catch {
            setError("Envoi impossible (feedback déjà soumis, introuvable, ou non autorisé).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white px-6 py-4 shadow">
                <h1 className="text-xl font-bold text-sky-700">Feedback360</h1>
            </header>
            <main className="mx-auto max-w-lg p-6">
                <button onClick={() => navigate("/")} className="mb-4 text-sm text-sky-600 hover:underline">← Retour</button>
                <div className="rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Donner mon feedback</h2>
                    <form onSubmit={handleSubmit}>
                        <p className="mb-1 text-sm font-medium text-gray-700">Note globale</p>
                        <div className="mb-4 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button type="button" key={n}
                                        onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                        onClick={() => setScore(n)}
                                        className={`text-3xl ${(hover || score) >= n ? "text-amber-400" : "text-gray-300"}`}>
                                    ★
                                </button>
                            ))}
                        </div>
                        <label className="mb-4 block">
                            <span className="text-sm font-medium text-gray-700">Commentaire</span>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                      placeholder="Votre avis sur le module…" />
                        </label>
                        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={loading}
                                className="w-full rounded-lg bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60">
                            {loading ? "Envoi…" : "Envoyer mon feedback"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}