import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Donut from "../components/Donut";
import ChartSkeleton from "../components/ChartSkeleton";
import { useTranslation } from "react-i18next";

interface ModuleOption { moduleId: number; title: string; }
interface Sentiment { positive: number; neutral: number; negative: number; }
interface Insights {
    available: boolean;
    commentCount: number;
    summary: string | null;
    sentiment: Sentiment | null;
    themes: string[];
}

export default function Insights() {
    const { t } = useTranslation();
    const role = getRole();
    const [options, setOptions] = useState<ModuleOption[]>([]);
    const [moduleId, setModuleId] = useState("");
    const [data, setData] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<ModuleOption[]>("/management/modules/options")
            .then((r) => setOptions(r.data))
            .catch(() => setError(t("insights.loadError")));
    }, []);

    async function generate() {
        if (!moduleId) return;
        setLoading(true); setError(""); setData(null);
        try {
            const r = await client.get<Insights>(`/management/modules/${moduleId}/insights`);
            setData(r.data);
        } catch {
            setError(t("insights.error"));
        } finally {
            setLoading(false);
        }
    }

    const sentimentData = data?.sentiment ? [
        { name: t("insights.positive"), value: data.sentiment.positive, color: "#10b981" },
        { name: t("insights.neutral"),  value: data.sentiment.neutral,  color: "#94a3b8" },
        { name: t("insights.negative"), value: data.sentiment.negative, color: "#ef4444" },
    ].filter((d) => d.value > 0) : [];

    return (
        <Layout>
            <PageHeader title={t("insights.title")} subtitle={t("insights.subtitle")} backTo="/" />

            {error && <p className="error-line">{error}</p>}

            <div className="filter-bar">
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="form-select">
                    <option value="">{t("insights.pickModule")}</option>
                    {options.map((m) => <option key={m.moduleId} value={m.moduleId}>{m.title}</option>)}
                </select>
                <button onClick={generate} disabled={!moduleId || loading} className="btn-primary">
                    {loading ? t("insights.generating") : t("insights.generate")}
                </button>
            </div>

            {loading && <ChartSkeleton />}

            {!loading && data && (data.available ? (
                <div className="grid-cards-2">
                    <div className="chart-card">
                        <h4 className="chart-title">{t("insights.summary")}</h4>
                        <p className="insight-summary">{data.summary}</p>
                        {data.themes.length > 0 && (
                            <div className="insight-themes">
                                {data.themes.map((th) => <span key={th} className="badge badge-neutral">{th}</span>)}
                            </div>
                        )}
                        <p className="insight-count">{t("insights.basedOn", { n: data.commentCount })}</p>
                    </div>
                    <Donut title={t("insights.sentiment")} data={sentimentData} emptyLabel={t("common.noData")} />
                </div>
            ) : (
                <p className="error-line">{t("insights.unavailable")}</p>
            ))}
        </Layout>
    );
}