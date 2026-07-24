import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/StatCard";

interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }
interface Stats { submissionRatePercent: number; averageScore: number | null; }

export default function ManagerDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([client.get<Summary>("/management/feedbacks/summary"), client.get<Stats>("/management/feedbacks/stats")])
            .then(([s, st]) => { setSummary(s.data); setStats(st.data); })
            .catch(() => setError("Impossible de charger les statistiques."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-slate-500">Chargement…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const avg = stats!.averageScore;
    const rate = stats!.submissionRatePercent;

    return (
        <div>
            <h2 className="mb-1 text-2xl font-bold text-slate-800">Vue d'ensemble</h2>
            <p className="mb-6 text-sm text-slate-500">Indicateurs globaux des feedbacks.</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total" value={summary!.total} />
                <StatCard label="Soumis" value={summary!.submitted} accent="text-emerald-600" />
                <StatCard label="En attente" value={summary!.notSubmitted} accent="text-amber-600" />
                <StatCard label="En cours" value={summary!.inProgress} accent="text-sky-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <StatCard label="Note moyenne" value={avg != null ? `${avg.toFixed(1)} / 5` : "—"} accent="text-brand" />
                <StatCard label="Taux de soumission" value={`${rate} %`} accent="text-emerald-600" />
            </div>

            {/* Emplacement des futurs graphiques */}
            <div className="mt-6 flex h-40 items-center justify-center border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                Graphiques à venir
            </div>

            {/* Accès aux vues détaillées */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <NavCard to="/management/feedbacks" title="Tous les feedbacks" subtitle="Liste filtrable et consultation détaillée" />
                <NavCard to="/management/modules" title="Détail par module" subtitle="Taux de retour et note moyenne par module" />
            </div>
        </div>
    );
}

function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
    return (
        <Link to={to}
              className="group flex items-center justify-between border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow">
            <div>
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand">
                <path fillRule="evenodd" d="M7 4l6 6-6 6-1.4-1.4L10.2 10 5.6 5.4 7 4z" clipRule="evenodd" />
            </svg>
        </Link>
    );
}