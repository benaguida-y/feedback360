import { useEffect, useState, type ReactNode } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import { Medal, Star } from "lucide-react";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";
import FeedbackCharts from "../components/FeedbackCharts.tsx";
import DashboardBarChart from "../components/DashboardBarChart.tsx";

interface Summary {
    total: number;
    submitted: number;
    notSubmitted: number;
    inProgress: number;
}
interface ModuleStat {
    moduleTitle: string;
    submittedCount: number;
    notSubmittedCount: number;
    inProgressCount: number;
    averageScore: number | null;
}
interface Stats {
    submissionRatePercent: number;
    averageScore: number | null;
    perModule: ModuleStat[];
}
interface Highlights {
    topCollaboratorName: string | null;
    topCollaboratorCount: number | null;
    bestModuleTitle: string | null;
    bestModuleAverage: number | null;
}
interface Collab { fullName: string; submitted: number; }
interface Page<T> { content: T[]; }

export default function ManagerDashboard() {
    const { t } = useTranslation();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [highlights, setHighlights] = useState<Highlights | null>(null);
    const [collabs, setCollabs] = useState<Collab[]>([]);

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

    // Collaborateurs (graphe « plus actifs ») — chargé à part, n'impacte pas le reste.
    useEffect(() => {
        client.get<Page<Collab>>("/management/collaborators?size=100")
            .then((r) => setCollabs(r.data.content))
            .catch(() => {});
    }, []);

    if (loading) return <p className="loading-text">{t("common.loading")}</p>;
    if (error) return <p className="error-text">{error}</p>;

    const avg = stats!.averageScore;
    const rate = stats!.submissionRatePercent;

    const topCollabs = [...collabs]
        .sort((a, b) => b.submitted - a.submitted)
        .slice(0, 6)
        .map((c) => ({ label: c.fullName, value: c.submitted }));

    const moduleScores = [...stats!.perModule]
        .filter((m) => m.averageScore != null)
        .map((m) => ({ label: m.moduleTitle, value: Number(m.averageScore!.toFixed(1)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("managerDashboard.subtitle")} />

            <h3 className="section-title dash-head">{t("managerDashboard.sectionFeedbacks")}</h3>
            <div className="grid-stats-4">
                <StatCard label={t("common.total")} value={summary!.total} />
                <StatCard label={t("status.SUBMITTED")} value={summary!.submitted} accent="accent-emerald" />
                <StatCard label={t("status.NOT_SUBMITTED")} value={summary!.notSubmitted} accent="accent-amber" />
                <StatCard label={t("status.IN_PROGRESS")} value={summary!.inProgress} accent="accent-sky" />
            </div>

            <h3 className="section-title dash-head-next">{t("managerDashboard.sectionIndicators")}</h3>
            <div className="grid-2col">
                <StatCard label={t("common.averageScore")} value={avg != null ? `${avg.toFixed(1)} / 5` : "—"} accent="accent-brand" />
                <StatCard label={t("managerDashboard.submissionRate")} value={`${rate} %`} accent="accent-emerald" />
            </div>

            <h3 className="section-title dash-head-next">{t("managerDashboard.sectionHighlights")}</h3>
            <div className="grid-cards-2">
                {/* Collaborateur le plus actif + son graphe (même carte) */}
                <HighlightCard
                    label={t("managerDashboard.topCollaborator")}
                    value={highlights?.topCollaboratorName ?? "—"}
                    sub={highlights?.topCollaboratorCount ? t("managerDashboard.feedbacksSubmitted", { n: highlights.topCollaboratorCount }) : t("managerDashboard.noSubmission")}
                    icon=<Medal/>
                >
                    <DashboardBarChart bare
                                       title={t("charts.topCollaborators")}
                                       data={topCollabs}
                                       valueFormat={(v) => String(v)}
                                       emptyLabel={t("common.noData")}
                    />
                </HighlightCard>

                {/* Module le mieux noté + son graphe (même carte) */}
                <HighlightCard
                    label={t("managerDashboard.bestModule")}
                    value={highlights?.bestModuleTitle ?? "—"}
                    sub={highlights?.bestModuleAverage != null ? t("managerDashboard.averageOf", { avg: highlights.bestModuleAverage.toFixed(1) }) : t("managerDashboard.noRating")}
                    icon=<Star/>
                >
                    <DashboardBarChart bare
                                       title={t("charts.scoreTitle")}
                                       data={moduleScores}
                                       domainMax={5}
                                       valueFormat={(v) => v.toFixed(1)}
                                       emptyLabel={t("common.noData")}
                    />
                </HighlightCard>
            </div>

            <h3 className="section-title dash-head-next">{t("managerDashboard.sectionCharts")}</h3>
            <FeedbackCharts summary={summary!} perModule={stats!.perModule} />

            {/* Accès aux vues détaillées */}
            <h3 className="section-title dash-head-next">{t("managerDashboard.sectionAccess")}</h3>
            <div className="grid-cards-2">
                <NavCard to="/management/feedbacks" title={t("managerFeedbacks.title")} subtitle={t("managerDashboard.navFeedbacksSub")} />
                <NavCard to="/management/modules" title={t("managerModules.title")} subtitle={t("managerDashboard.navModulesSub")} />
            </div>
        </div>
    );
}

// Carte « point fort » : en-tête (icône + infos) + graphe optionnel dans la MÊME carte.
function HighlightCard({ label, value, sub, icon, children }: {
    label: string; value: string; sub: string; icon?: any; children?: ReactNode;
}) {
    return (
        <div className="highlight-card highlight-card-col">
            <div className="highlight-head">
                <span className="highlight-icon">{icon}</span>
                <div className="highlight-info">
                    <p className="highlight-label">{label}</p>
                    <p className="highlight-value">{value}</p>
                    <p className="highlight-sub">{sub}</p>
                </div>
            </div>
            {children && <div className="full-w">{children}</div>}
        </div>
    );
}