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

    if (error) return <p className="error-text">{error}</p>;
    if (!s) return <p className="loading-text">{t("common.loading")}</p>;

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("adminDashboard.subtitle")} />

            <h3 className="section-title mb-3">{t("adminDashboard.users")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label={t("common.total")} value={s.totalUsers} />
                <StatCard label={t("adminDashboard.admins")} value={s.admins} accent="accent-red" />
                <StatCard label={t("adminDashboard.managers")} value={s.managers} accent="accent-sky" />
                <StatCard label={t("nav.collaborators")} value={s.collaborators} accent="accent-muted" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label={t("adminDashboard.activeUsers")} value={s.activeUsers} accent="accent-emerald" />
                <StatCard label={t("adminDashboard.inactiveUsers")} value={s.inactiveUsers} accent="accent-red" />
                <StatCard label={t("common.pendingActivation")} value={s.pendingActivation} accent="accent-amber" />
            </div>

            <h3 className="section-title mt-8 mb-3">{t("adminDashboard.integrations")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label={t("adminDashboard.callsReceived")} value={s.totalWebhookCalls} />
                <StatCard label={t("adminDashboard.successes")} value={s.webhookSuccess} accent="accent-emerald" />
                <StatCard label={t("adminDashboard.failures")} value={s.webhookFailure} accent="accent-red" />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <NavCard to="/admin/users" title={t("adminDashboard.navUsers")} subtitle={t("adminDashboard.navUsersSub")} />
                <NavCard to="/admin/logs" title={t("adminLogs.title")} subtitle={t("adminDashboard.navLogsSub")} />
            </div>
        </div>
    );
}
