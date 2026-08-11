import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer,
} from "recharts";

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

const BRAND = "#0070ad";

export default function RatingHistogram({ counts, emptyLabel }: { counts: number[]; emptyLabel: string }) {
    const { t } = useTranslation();
    const dark = useDarkMode();

    const axis = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "#2b303a" : "#e7ebf0";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const data = counts.map((c, i) => ({ star: `${i + 1}★`, count: c }));
    const total = counts.reduce((a, b) => a + b, 0);

    return (
        <div className="chart-card">
            <h4 className="chart-title">{t("charts.ratingDistribution")}</h4>
            {total === 0 ? (
                <p className="chart-empty">{emptyLabel}</p>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
                        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
                        <XAxis dataKey="star" tick={{ fill: axis, fontSize: 13 }} axisLine={{ stroke: grid }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }}
                                 cursor={{ fill: dark ? "rgba(255,255,255,0.05)" : "rgba(2,6,23,0.04)" }} />
                        <Bar dataKey="count" fill={BRAND} radius={[4, 4, 0, 0]} barSize={40}>
                            <LabelList dataKey="count" position="top" fill={axis} fontSize={11} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}