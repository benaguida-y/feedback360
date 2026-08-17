import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import ModuleParticipationChart from "./ModuleParticipationChart";

interface ModuleStat { moduleTitle: string; submittedCount: number; notSubmittedCount: number; inProgressCount: number; averageScore: number | null; }
interface Summary { total: number; submitted: number; notSubmitted: number; inProgress: number; }

// Suit le thème clair/sombre (classe .dark sur <html>).
function useDarkMode() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    useEffect(() => {
        const el = document.documentElement;
        const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
        obs.observe(el, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);
    return dark;
}

const STATUS = { submitted: "#10b981", notSubmitted: "#f59e0b", inProgress: "#0ea5e9" };

export default function FeedbackCharts({ summary, perModule }: { summary: Summary; perModule: ModuleStat[] }) {
    const { t } = useTranslation();
    const dark = useDarkMode();

    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const statusData = [
        { name: t("status.SUBMITTED"), value: summary.submitted, color: STATUS.submitted },
        { name: t("status.NOT_SUBMITTED"), value: summary.notSubmitted, color: STATUS.notSubmitted },
        { name: t("status.IN_PROGRESS"), value: summary.inProgress, color: STATUS.inProgress },
    ].filter((d) => d.value > 0);

    // Participation par module (soumis / non soumis) — modules les plus fournis en premier.
    const participationData = [...perModule]
        .sort((a, b) => (b.submittedCount + b.inProgressCount + b.notSubmittedCount) - (a.submittedCount + a.inProgressCount + a.notSubmittedCount))
        .slice(0, 8)
        .map((m) => ({ module: m.moduleTitle, submitted: m.submittedCount, inProgress: m.inProgressCount, notSubmitted: m.notSubmittedCount }));

    return (
        <div className="charts-split">
            {/* Répartition des feedbacks (donut) */}
            <div className="chart-card chart-card-col">
                <h4 className="chart-title">{t("charts.statusTitle")}</h4>
                {statusData.length === 0 ? (
                    <p className="chart-empty">{t("common.noData")}</p>
                ) : (
                    <>
                        <div className="donut-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                         innerRadius={62} outerRadius={92} paddingAngle={2} stroke={surface} strokeWidth={2}>
                                        {statusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Légende HTML — épinglée en bas de la carte */}
                        <ul className="donut-legend">
                            {statusData.map((d) => (
                                <li key={d.name} className="donut-legend-item">
                                    <span className="chart-dot" style={{ background: d.color }} /> {d.name} · {d.value}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {/* Participation par module (soumis / en cours / en attente) */}
            <div className="charts-split-main">
                <ModuleParticipationChart data={participationData} emptyLabel={t("common.noData")} />
            </div>
        </div>
    );
}
