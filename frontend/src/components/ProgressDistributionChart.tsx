import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer,
} from "recharts";

interface Bucket { label: string; count: number; }

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

export default function ProgressDistributionChart({ title, data, emptyLabel }: { title: string; data: Bucket[]; emptyLabel: string }) {
    const dark = useDarkMode();
    const axis = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "#2b303a" : "#e7ebf0";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const total = data.reduce((a, b) => a + b.count, 0);

    return (
        <div className="chart-card">
            <h4 className="chart-title">{title}</h4>
            {total === 0 ? (
                <p className="chart-empty">{emptyLabel}</p>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
                        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
                        <XAxis dataKey="label" interval={0} tick={{ fill: axis, fontSize: 11 }} axisLine={{ stroke: grid }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }}
                                 cursor={{ fill: dark ? "rgba(255,255,255,0.05)" : "rgba(2,6,23,0.04)" }} />
                        <Bar dataKey="count" fill={BRAND} radius={[4, 4, 0, 0]} barSize={44}>
                            <LabelList dataKey="count" position="top" fill={axis} fontSize={11} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}