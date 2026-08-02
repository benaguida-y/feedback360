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

    if (role !== "MANAGER" && role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [search]);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<ModuleStats>>(`/management/modules?${params.toString()}`)
                .then((r) => { setModules(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError("Impossible de charger le détail par module."))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [search, page]);

    return (
        <Layout>
            <PageHeader title="Détail par module"
                        subtitle="Taux de retour et note moyenne, module par module."
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex justify-end">
                <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un module…" />
            </div>

            <Card>
                <Table columns={["Module", "Soumis", "Non soumis", "Note moyenne"]}
                       loading={loading}
                       isEmpty={modules.length === 0} emptyLabel="Aucune donnée.">
                    {modules.map((m) => (
                        <tr key={m.moduleTitle} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 font-medium text-slate-800">{m.moduleTitle}</td>
                            <td className="px-5 py-3.5 text-emerald-700">{m.submittedCount}</td>
                            <td className="px-5 py-3.5 text-amber-700">{m.notSubmittedCount}</td>
                            <td className="px-5 py-3.5 text-slate-600">{m.averageScore != null ? m.averageScore.toFixed(1) : "—"}</td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}