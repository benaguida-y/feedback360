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

    if (loading) return <p className="loading-text">{t("common.loading")}</p>;
    if (error) return <p className="error-text">{error}</p>;

    const avg = stats!.averageScore;
    const rate = stats!.submissionRatePercent;

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("managerDashboard.subtitle")} />

            <h3 className="section-title mb-3">{t("managerDashboard.sectionFeedbacks")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label={t("common.total")} value={summary!.total} />
                <StatCard label={t("status.SUBMITTED")} value={summary!.submitted} accent="accent-emerald" />
                <StatCard label={t("status.NOT_SUBMITTED")} value={summary!.notSubmitted} accent="accent-amber" />
                <StatCard label={t("status.IN_PROGRESS")} value={summary!.inProgress} accent="accent-sky" />
            </div>

            <h3 className="section-title mt-8 mb-3">{t("managerDashboard.sectionIndicators")}</h3>
            <div className="grid grid-cols-2 gap-4">
                <StatCard label={t("common.averageScore")} value={avg != null ? `${avg.toFixed(1)} / 5` : "—"} accent="accent-brand" />
                <StatCard label={t("managerDashboard.submissionRate")} value={`${rate} %`} accent="accent-emerald" />
            </div>

            <h3 className="section-title mt-8 mb-3">{t("managerDashboard.sectionHighlights")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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

            <h3 className="section-title mt-8 mb-3">{t("managerDashboard.sectionCharts")}</h3>
            {/* Emplacement des futurs graphiques */}
            <div className="chart-placeholder">
                {t("managerDashboard.chartsSoon")}
            </div>

            {/* Accès aux vues détaillées */}
            <h3 className="section-title mt-8 mb-3">{t("managerDashboard.sectionAccess")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <NavCard to="/management/feedbacks" title={t("managerFeedbacks.title")} subtitle={t("managerDashboard.navFeedbacksSub")} />
                <NavCard to="/management/modules" title={t("managerModules.title")} subtitle={t("managerDashboard.navModulesSub")} />
            </div>
        </div>
    );
}

function HighlightCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon?: any }) {
    return (
        <div className="highlight-card">
            <span className="highlight-icon">{icon}</span>
            <div className="min-w-0">
                <p className="highlight-label">{label}</p>
                <p className="highlight-value">{value}</p>
                <p className="highlight-sub">{sub}</p>
            </div>
        </div>
    );
}
