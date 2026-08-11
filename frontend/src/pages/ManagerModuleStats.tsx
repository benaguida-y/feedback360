import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Card from "../components/Card";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import RatingStars from "../components/RatingStars";
import ModuleParticipationChart from "../components/ModuleParticipationChart";
import { useTranslation } from "react-i18next";
import { useSort } from "../useSort";

interface ModuleStats { moduleTitle: string; submittedCount: number; notSubmittedCount: number; averageScore: number | null; }
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

export default function ManagerModuleStats() {
    const role = getRole();
    const [modules, setModules] = useState<ModuleStats[]>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [allModules, setAllModules] = useState<ModuleStats[]>([]);
    const { t } = useTranslation();
    const { sort, toggle } = useSort();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [search, score, sort, size]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (score) params.set("score", score);
            if (sort) params.set("sort", sort);
            params.set("page", String(page));
            params.set("size", String(size));
            client.get<Page<ModuleStats>>(`/management/modules?${params.toString()}`)
                .then((r) => { setModules(r.data.content); setTotalPages(r.data.totalPages); setTotal(r.data.totalElements); })
                .catch(() => setError(t("managerModules.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [search, score, page, sort, size]);

    // Tous les modules pour le graphe de participation — indépendant de la pagination/filtres.
    useEffect(() => {
        client.get<{ perModule: ModuleStats[] }>("/management/feedbacks/stats")
            .then((r) => setAllModules(r.data.perModule))
            .catch(() => {});
    }, []);

    const participationData = [...allModules]
        .sort((a, b) => (b.submittedCount + b.notSubmittedCount) - (a.submittedCount + a.notSubmittedCount))
        .map((m) => ({ module: m.moduleTitle, submitted: m.submittedCount, notSubmitted: m.notSubmittedCount }));

    return (
        <Layout>
            <PageHeader title={t("managerModules.title")}
                        subtitle={t("managerModules.subtitle")}
                        backTo="/" />

            {error && <p className="error-line">{error}</p>}

            {participationData.length > 0 && (
                <div className="chart-block">
                    <ModuleParticipationChart data={participationData} emptyLabel={t("common.noData")} />
                </div>
            )}

            <div className="filter-bar">
                <select value={score} onChange={(e) => setScore(e.target.value)} className="form-select">
                    <option value="">{t("common.allScores")}</option>
                    <option value="5">5 ★</option>
                    <option value="4">4 ★</option>
                    <option value="3">3 ★</option>
                    <option value="2">2 ★</option>
                    <option value="1">1 ★</option>
                    <option value="0">{t("common.noRating")}</option>
                </select>
                <div className="filter-bar-right">
                    <span className="results-chip">{total} {t("common.results")}</span>
                    <SearchInput value={search} onChange={setSearch} placeholder={t("search.module")} />
                </div>
            </div>

            <Card>
                <Table columns={[{ label: t("common.module"), sort: "moduleTitle" }, { label: t("common.submitted"), sort: "submittedCount" }, { label: t("common.notSubmitted"), sort: "notSubmittedCount" }, { label: t("common.averageScore"), sort: "averageScore" }]}
                       loading={loading} sort={sort} onSort={toggle}
                       isEmpty={modules.length === 0} emptyLabel={t("common.noData")}>
                    {modules.map((m) => (
                        <tr key={m.moduleTitle} className="table-row">
                            <td className="table-cell cell-strong">{m.moduleTitle}</td>
                            <td className="table-cell cell-positive">{m.submittedCount}</td>
                            <td className="table-cell cell-negative">{m.notSubmittedCount}</td>
                            <td className="table-cell"><RatingStars value={m.averageScore} /></td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} size={size} onSizeChange={setSize} />
        </Layout>
    );
}