import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ModuleRow { module: string; submitted: number; notSubmitted: number; }

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

const SUBMITTED = "#10b981";      // emerald (statut « soumis »)
const NOT_SUBMITTED = "#f59e0b";  // amber  (statut « en attente »)
const Y_WIDTH = 120;              // largeur axe Y (px)
const MARGIN = { top: 0, right: 16, bottom: 0, left: 4 };

export default function ModuleParticipationChart({ data, emptyLabel }: { data: ModuleRow[]; emptyLabel: string }) {
    const { t } = useTranslation();
    const dark = useDarkMode();

    const axis = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "#2b303a" : "#e7ebf0";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    // Domaine X commun (barres + axe HTML) + graduations.
    const maxVal = Math.max(1, ...data.map((d) => d.submitted + d.notSubmitted));
    const step = Math.max(1, Math.ceil(maxVal / 5));
    const ticks: number[] = [];
    for (let i = 0; i <= maxVal; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] !== maxVal) ticks.push(maxVal);

    const Dot = ({ color }: { color: string }) => (
        <span className="chart-dot" style={{ background: color }} />
    );

    return (
        <div className="chart-card">
            <h4 className="chart-title">{t("charts.moduleParticipation")}</h4>

            {data.length === 0 ? (
                <p className="chart-empty">{emptyLabel}</p>
            ) : (
                <>
                    {/* Légende — fixe */}
                    <div className="chart-legend" style={{ color: axis }}>
                        <span className="chart-legend-item"><Dot color={SUBMITTED} /> {t("status.SUBMITTED")}</span>
                        <span className="chart-legend-item"><Dot color={NOT_SUBMITTED} /> {t("status.NOT_SUBMITTED")}</span>
                    </div>

                    {/* Barres — SEULE cette zone scrolle (axe X recharts masqué) */}
                    <div className="chart-scroll">
                        <ResponsiveContainer width="100%" height={data.length * 38 + 10}>
                            <BarChart data={data} layout="vertical" margin={MARGIN}>
                                <CartesianGrid horizontal={false} stroke={grid} strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, maxVal]} ticks={ticks} allowDecimals={false} hide />
                                <YAxis type="category" dataKey="module" width={Y_WIDTH}
                                       tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                                <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }}
                                         cursor={{ fill: dark ? "rgba(255,255,255,0.05)" : "rgba(2,6,23,0.04)" }} />
                                <Bar dataKey="submitted" name={t("status.SUBMITTED")} stackId="a"
                                     fill={SUBMITTED} stroke={surface} strokeWidth={1} radius={[4, 0, 0, 4]} barSize={18} />
                                <Bar dataKey="notSubmitted" name={t("status.NOT_SUBMITTED")} stackId="a"
                                     fill={NOT_SUBMITTED} stroke={surface} strokeWidth={1} radius={[0, 4, 4, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Axe X en HTML — FIXE et toujours visible, aligné sur la zone des barres */}
                    <div style={{ position: "relative", height: 22, marginTop: 4, marginLeft: Y_WIDTH + MARGIN.left, marginRight: MARGIN.right, borderTop: `1px solid ${grid}` }}>
                        {ticks.map((tk) => (
                            <span key={tk} style={{ position: "absolute", top: 5, left: `${(tk / maxVal) * 98.5}%`, transform: "translateX(-50%)", fontSize: 12, color: axis }}>
                                {tk}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}