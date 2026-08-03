import { useEffect, useState } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [s, setS] = useState<AdminStats | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        client.get<AdminStats>("/admin/stats")
            .then((r) => setS(r.data))
            .catch(() => setError(t("common.statsError")));
    }, []);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!s) return <p className="text-slate-500 dark:text-slate-400">{t("common.loading")}</p>;

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("adminDashboard.subtitle")} />

            <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{t("adminDashboard.users")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label={t("common.total")} value={s.totalUsers} />
                <StatCard label={t("adminDashboard.admins")} value={s.admins} accent="text-red-600" />
                <StatCard label={t("adminDashboard.managers")} value={s.managers} accent="text-sky-600" />
                <StatCard label={t("nav.collaborators")} value={s.collaborators} accent="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label={t("adminDashboard.activeUsers")} value={s.activeUsers} accent="text-emerald-600" />
                <StatCard label={t("adminDashboard.inactiveUsers")} value={s.inactiveUsers} accent="text-red-600" />
                <StatCard label={t("common.pendingActivation")} value={s.pendingActivation} accent="text-amber-600" />
            </div>

            <h3 className="mt-8 mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{t("adminDashboard.integrations")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label={t("adminDashboard.callsReceived")} value={s.totalWebhookCalls} />
                <StatCard label={t("adminDashboard.successes")} value={s.webhookSuccess} accent="text-emerald-600" />
                <StatCard label={t("adminDashboard.failures")} value={s.webhookFailure} accent="text-red-600" />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <NavCard to="/admin/users" title={t("adminDashboard.navUsers")} subtitle={t("adminDashboard.navUsersSub")} />
                <NavCard to="/admin/logs" title={t("adminLogs.title")} subtitle={t("adminDashboard.navLogsSub")} />
            </div>
        </div>
    );
}