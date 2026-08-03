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
import { useTranslation } from "react-i18next";

interface ModuleStats { moduleTitle: string; submittedCount: number; notSubmittedCount: number; averageScore: number | null; }
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

export default function ManagerModuleStats() {
    const role = getRole();
    const [modules, setModules] = useState<ModuleStats[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { t } = useTranslation();

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<ModuleStats>>(`/management/modules?${params.toString()}`)
                .then((r) => { setModules(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError(t("managerModules.loadError")))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <Layout>
            <PageHeader title={t("managerModules.title")}
                        subtitle={t("managerModules.subtitle")}
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex justify-end">
                <SearchInput value={search} onChange={setSearch} placeholder={t("search.module")} />
            </div>

            <Card>
                <Table columns={[t("common.module"), t("common.submitted"), t("common.notSubmitted"), t("common.averageScore")]}
                       loading={loading}
                       isEmpty={modules.length === 0} emptyLabel={t("common.noData")}>
                    {modules.map((m) => (
                        <tr key={m.moduleTitle} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{m.moduleTitle}</td>
                            <td className="px-5 py-3.5 text-emerald-700 dark:text-emerald-300">{m.submittedCount}</td>
                            <td className="px-5 py-3.5 text-amber-700 dark:text-amber-300">{m.notSubmittedCount}</td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{m.averageScore != null ? m.averageScore.toFixed(1) : "—"}</td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}