import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
    Tooltip, ResponsiveContainer,
} from "recharts";

interface Datum { label: string; value: number; }

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

// Bar chart horizontal réutilisable, thème-aware.
// bare = true : sans sa propre carte (pour l'intégrer dans une carte parente).
export default function DashboardBarChart({
                                              title, data, domainMax, color = "#0070ad", valueFormat = (v) => String(v), emptyLabel, bare = false,
                                          }: {
    title: string;
    data: Datum[];
    domainMax?: number;
    color?: string;
    valueFormat?: (v: number) => string;
    emptyLabel: string;
    bare?: boolean;
}) {
    const dark = useDarkMode();
    const axis = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "#2b303a" : "#e7ebf0";
    const surface = dark ? "#1b1f27" : "#ffffff";
    const tip = { backgroundColor: surface, border: `1px solid ${dark ? "#2b303a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12 };
    const tipText = dark ? "#e5e9f0" : "#1e293b";

    const body = (
        <>
            <h4 className="chart-title">{title}</h4>
            {data.length === 0 ? (
                <p className="chart-empty">{emptyLabel}</p>
            ) : (
                <ResponsiveContainer width="100%" height={Math.max(170, data.length * 34 + 24)}>
                    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }}>
                        <CartesianGrid horizontal={false} stroke={grid} strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, domainMax ?? "dataMax"]} allowDecimals={domainMax === 5}
                               tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                        <YAxis type="category" dataKey="label" width={120}
                               tick={{ fill: axis, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={false} />
                        <Tooltip contentStyle={tip} itemStyle={{ color: tipText }} labelStyle={{ color: tipText }}
                                 cursor={{ fill: dark ? "rgba(255,255,255,0.05)" : "rgba(2,6,23,0.04)" }}
                                 formatter={(v: any) => [valueFormat(Number(v)), ""]} />
                        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={16}>
                            <LabelList dataKey="value" position="right" fill={axis} fontSize={11}
                                       formatter={(v: any) => valueFormat(Number(v))} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </>
    );

    return bare ? body : <div className="card p-5">{body}</div>;
}