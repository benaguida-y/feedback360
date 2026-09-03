import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Slice { name: string; value: number; color: string; }

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

export default function Donut({ title, data, emptyLabel }: { title: string; data: Slice[]; emptyLabel: string }) {
    const dark = useDarkMode();
    const axis = dark ? "#94a3b8" : "#64748b";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const total = data.reduce((a, b) => a + b.value, 0);

    return (
        <div className="chart-card">
            <h4 className="chart-title">{title}</h4>
            {total === 0 ? (
                <p className="chart-empty">{emptyLabel}</p>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                             innerRadius={62} outerRadius={92} paddingAngle={2} stroke={surface} strokeWidth={2}>
                            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
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
    );
}