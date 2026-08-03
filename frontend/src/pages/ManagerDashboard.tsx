import { useEffect, useState } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import { Medal, Star } from 'lucide-react';
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
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
            .catch(() => setError(t("common.statsError")))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-slate-500 dark:text-slate-400">{t("common.loading")}</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const avg = stats!.averageScore;
    const rate = stats!.submissionRatePercent;

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("managerDashboard.subtitle")} />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label={t("common.total")} value={summary!.total} />
                <StatCard label={t("status.SUBMITTED")} value={summary!.submitted} accent="text-emerald-600" />
                <StatCard label={t("status.NOT_SUBMITTED")} value={summary!.notSubmitted} accent="text-amber-600" />
                <StatCard label={t("status.IN_PROGRESS")} value={summary!.inProgress} accent="text-sky-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <StatCard label={t("common.averageScore")} value={avg != null ? `${avg.toFixed(1)} / 5` : "—"} accent="text-brand" />
                <StatCard label={t("managerDashboard.submissionRate")} value={`${rate} %`} accent="text-emerald-600" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <HighlightCard
                    label={t("managerDashboard.topCollaborator")}
                    value={highlights?.topCollaboratorName ?? "—"}
                    sub={highlights?.topCollaboratorCount ? t("managerDashboard.feedbacksSubmitted", { n: highlights.topCollaboratorCount }) : t("managerDashboard.noSubmission")}
                    icon=<Medal/>
                />
                <HighlightCard
                    label={t("managerDashboard.bestModule")}
                    value={highlights?.bestModuleTitle ?? "—"}
                    sub={highlights?.bestModuleAverage != null ? t("managerDashboard.averageOf", { avg: highlights.bestModuleAverage.toFixed(1) }) : t("managerDashboard.noRating")}
                    icon=<Star/>
                />
            </div>

            {/* Emplacement des futurs graphiques */}
            <div className="mt-6 flex h-40 items-center justify-center border border-dashed border-slate-300 dark:border-cap-border bg-white dark:bg-cap-panel text-sm text-slate-400 dark:text-slate-500">
                {t("managerDashboard.chartsSoon")}
            </div>

            {/* Accès aux vues détaillées */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <NavCard to="/management/feedbacks" title={t("managerFeedbacks.title")} subtitle={t("managerDashboard.navFeedbacksSub")} />
                <NavCard to="/management/modules" title={t("managerModules.title")} subtitle={t("managerDashboard.navModulesSub")} />
            </div>
        </div>
    );
}

function HighlightCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: any }) {
    return (
        <div className="flex items-start gap-4 rounded-lg border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel p-5 shadow-sm">
            <span className="text-2xl">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
                <p className="mt-1 truncate text-lg font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>
            </div>
        </div>
    );
}