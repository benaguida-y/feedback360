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

interface Log {
    logId: number;
    type: string;
    status: string;
    receivedAt: string;
    processedAt: string | null;
    userEmail: string | null;
    moduleTitle: string | null;
}
interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

const SIZE = 10;

function statusBadge(status: string) {
    switch (status) {
        case "SUCCESS":     return "bg-emerald-50 text-emerald-700";
        case "FAILURE":     return "bg-red-50 text-red-700";
        case "IN_PROGRESS": return "bg-sky-50 text-sky-700";
        default:            return "bg-slate-100 text-slate-600";
    }
}

export default function AdminLogs() {
    const role = getRole();
    const [logs, setLogs] = useState<Log[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    if (role !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => { setPage(0); }, [type, status, search]);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            const params = new URLSearchParams();
            if (type) params.set("type", type);
            if (status) params.set("status", status);
            if (search.trim()) params.set("search", search.trim());
            params.set("page", String(page));
            params.set("size", String(SIZE));
            client.get<Page<Log>>(`/admin/logs?${params.toString()}`)
                .then((r) => { setLogs(r.data.content); setTotalPages(r.data.totalPages); })
                .catch(() => setError("Impossible de charger les logs."))
                .finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [type, status, search, page]);

    const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR") : "—");

    return (
        <Layout>
            <PageHeader title="Supervision"
                        subtitle="Journal des appels d'intégration reçus (webhook)."
                        backTo="/" />

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <select value={type} onChange={(e) => setType(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand">
                    <option value="">Tous les types</option>
                    <option value="MODULE_SYNC">MODULE_SYNC</option>
                    <option value="REMINDER">REMINDER</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand">
                    <option value="">Tous les statuts</option>
                    <option value="SUCCESS">Succès</option>
                    <option value="FAILURE">Échec</option>
                    <option value="IN_PROGRESS">En cours</option>
                </select>
                <div className="ml-auto">
                    <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un email ou un module…" />
                </div>
            </div>

            <Card>
                <Table columns={["Type", "Statut", "Reçu le", "Traité le", "Utilisateur", "Module"]}
                       loading={loading}
                       isEmpty={logs.length === 0} emptyLabel="Aucun appel enregistré.">
                    {logs.map((l) => (
                        <tr key={l.logId} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5 text-slate-600">{l.type}</td>
                            <td className="px-5 py-3.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(l.status)}`}>{l.status}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">{fmt(l.receivedAt)}</td>
                            <td className="px-5 py-3.5 text-slate-500">{fmt(l.processedAt)}</td>
                            <td className="px-5 py-3.5 text-slate-600">{l.userEmail ?? "—"}</td>
                            <td className="px-5 py-3.5 text-slate-600">{l.moduleTitle ?? "—"}</td>
                        </tr>
                    ))}
                </Table>
            </Card>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Layout>
    );
}