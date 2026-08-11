import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
    Tooltip, ResponsiveContainer,
} from "recharts";

interface ModuleStat { moduleTitle: string; averageScore: number | null; }
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
const BRAND = "#0070ad";

export default function FeedbackCharts({ summary, perModule }: { summary: Summary; perModule: ModuleStat[] }) {
    const { t } = useTranslation();
    const dark = useDarkMode();

    const axis = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "#2b303a" : "#e7ebf0";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const statusData = [
        { name: t("status.SUBMITTED"), value: summary.submitted, color: STATUS.submitted },
        { name: t("status.NOT_SUBMITTED"), value: summary.notSubmitted, color: STATUS.notSubmitted },
        { name: t("status.IN_PROGRESS"), value: summary.inProgress, color: STATUS.inProgress },
    ].filter((d) => d.value > 0);

    const scoreData = perModule
        .filter((m) => m.averageScore != null)
        .map((m) => ({ module: m.moduleTitle, score: Number(m.averageScore!.toFixed(1)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

    return (
        <div className="charts-pair">
            {/* Répartition des feedbacks (donut) */}
            <div className="chart-card">
                <h4 className="chart-title">{t("charts.statusTitle")}</h4>
                {statusData.length === 0 ? (
                    <p className="chart-empty">{t("common.noData")}</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                 innerRadius={62} outerRadius={92} paddingAngle={2} stroke={surface} strokeWidth={2}>
                                {statusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }} />
                            <Legend iconType="circle" verticalAlign="bottom"
                                    formatter={(value, entry: any) => (
                                        <span style={{ color: axis, fontSize: 12 }}>{value} · {entry?.payload?.value ?? 0}</span>
                                    )} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Note moyenne par module (barres horizontales) */}
            <div className="chart-card">
                <h4 className="chart-title">{t("charts.scoreTitle")}</h4>
                {scoreData.length === 0 ? (
                    <p className="chart-empty">{t("common.noData")}</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={scoreData} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
                            <CartesianGrid horizontal={false} stroke={grid} strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 5]} tickCount={6}
                                   tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                            <YAxis type="category" dataKey="module" width={116}
                                   tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                            <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }}
                                     cursor={{ fill: dark ? "rgba(255,255,255,0.05)" : "rgba(2,6,23,0.04)" }}
                                     formatter={(v: any) => [Number(v).toFixed(1) + " / 5", t("common.averageScore")]} />
                            <Bar dataKey="score" fill={BRAND} radius={[0, 4, 4, 0]} barSize={16}>
                                <LabelList dataKey="score" position="right" fill={axis} fontSize={11}
                                           formatter={(v: any) => Number(v).toFixed(1)} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}