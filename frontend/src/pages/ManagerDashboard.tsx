import { useEffect, useState } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import { Medal, Star } from 'lucide-react';
import PageHeader from "../components/PageHeader.tsx";

interface Summary {
    total: number;
    submitted: number;
    notSubmitted: number;
    inProgress: number;
}
interface Stats {
    submissionRatePercent: number;
    averageScore: number | null;
}
interface Highlights {
    topCollaboratorName: string | null;
    topCollaboratorCount: number | null;
    bestModuleTitle: string | null;
    bestModuleAverage: number | null;
}

export default function ManagerDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [highlights, setHighlights] = useState<Highlights | null>(null);

    useEffect(() => {
        Promise.all([
            client.get<Summary>("/management/feedbacks/summary"),
            client.get<Stats>("/management/feedbacks/stats"),
            client.get<Highlights>("/management/highlights"),
        ])
            .then(([s, st, hl]) => { setSummary(s.data); setStats(st.data); setHighlights(hl.data); })
            .catch(() => setError("Impossible de charger les statistiques."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-slate-500">Chargement…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const avg = stats!.averageScore;
    const rate = stats!.submissionRatePercent;

    return (
        <div>
            <PageHeader title="Vue d'ensemble" subtitle="Indicateurs globaux des feedbacks." />

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

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <HighlightCard
                    label="Collaborateur le plus actif"
                    value={highlights?.topCollaboratorName ?? "—"}
                    sub={highlights?.topCollaboratorCount ? `${highlights.topCollaboratorCount} feedback(s) soumis` : "Aucune soumission"}
                    icon=<Medal/>
                />
                <HighlightCard
                    label="Module le mieux noté"
                    value={highlights?.bestModuleTitle ?? "—"}
                    sub={highlights?.bestModuleAverage != null ? `${highlights.bestModuleAverage.toFixed(1)} / 5 de moyenne` : "Pas encore de note"}
                    icon=<Star/>
                />
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

function HighlightCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: any }) {
    return (
        <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-2xl">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 truncate text-lg font-semibold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{sub}</p>
            </div>
        </div>
    );
}