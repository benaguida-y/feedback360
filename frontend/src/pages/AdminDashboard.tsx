import { useEffect, useState } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import PageHeader from "../components/PageHeader.tsx";

interface AdminStats {
    totalUsers: number;
    admins: number;
    managers: number;
    collaborators: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingActivation: number;
    totalWebhookCalls: number;
    webhookSuccess: number;
    webhookFailure: number;
}

export default function AdminDashboard() {
    const [s, setS] = useState<AdminStats | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        client.get<AdminStats>("/admin/stats")
            .then((r) => setS(r.data))
            .catch(() => setError("Impossible de charger les statistiques."));
    }, []);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!s) return <p className="text-slate-500">Chargement…</p>;

    return (
        <div>
            <PageHeader title="Vue d'ensemble" subtitle="Administration et supervision de l'application." />

            <h3 className="mb-3 text-lg font-semibold text-slate-800">Utilisateurs</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total" value={s.totalUsers} />
                <StatCard label="Admins" value={s.admins} accent="text-red-600" />
                <StatCard label="Managers" value={s.managers} accent="text-sky-600" />
                <StatCard label="Collaborateurs" value={s.collaborators} accent="text-slate-600" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label="Actifs" value={s.activeUsers} accent="text-emerald-600" />
                <StatCard label="Désactivés" value={s.inactiveUsers} accent="text-red-600" />
                <StatCard label="En attente d'activation" value={s.pendingActivation} accent="text-amber-600" />
            </div>

            <h3 className="mt-8 mb-3 text-lg font-semibold text-slate-800">Intégrations (webhook)</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label="Appels reçus" value={s.totalWebhookCalls} />
                <StatCard label="Succès" value={s.webhookSuccess} accent="text-emerald-600" />
                <StatCard label="Échecs" value={s.webhookFailure} accent="text-red-600" />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <NavCard to="/admin/users" title="Gérer les utilisateurs" subtitle="Créer, activer/désactiver les comptes" />
                <NavCard to="/admin/logs" title="Supervision" subtitle="Journal des appels d'intégration" />
            </div>
        </div>
    );
}
