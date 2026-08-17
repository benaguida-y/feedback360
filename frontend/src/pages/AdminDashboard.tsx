import { useEffect, useState, type ReactNode } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard";
import NavCard from "../components/NavCard.tsx";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

interface UserStats {
    totalUsers: number;
    admins: number;
    managers: number;
    collaborators: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingActivation: number;
}
interface IntegrationStats {
    totalWebhookCalls: number;
    webhookSuccess: number;
    webhookFailure: number;
}

export default function AdminDashboard() {
    const { t } = useTranslation();

    // Chaque bloc a son propre état : une erreur sur l'un n'empêche pas l'autre de s'afficher.
    const [users, setUsers] = useState<UserStats | null>(null);
    const [usersError, setUsersError] = useState(false);
    const [integrations, setIntegrations] = useState<IntegrationStats | null>(null);
    const [integrationsError, setIntegrationsError] = useState(false);

    useEffect(() => {
        client.get<UserStats>("/admin/stats/users")
            .then((r) => setUsers(r.data)).catch(() => setUsersError(true));
        client.get<IntegrationStats>("/admin/stats/integrations")
            .then((r) => setIntegrations(r.data)).catch(() => setIntegrationsError(true));
    }, []);

    return (
        <div>
            <PageHeader title={t("common.overview")} subtitle={t("adminDashboard.subtitle")} />

            <h3 className="section-title dash-head">{t("adminDashboard.users")}</h3>
            <Section loading={!users && !usersError} error={usersError}>
                {users && (
                    <>
                        <div className="grid-stats-4">
                            <StatCard label={t("common.total")} value={users.totalUsers} />
                            <StatCard label={t("adminDashboard.admins")} value={users.admins} accent="accent-red" />
                            <StatCard label={t("adminDashboard.managers")} value={users.managers} accent="accent-sky" />
                            <StatCard label={t("nav.collaborators")} value={users.collaborators} accent="accent-muted" />
                        </div>
                        <div className="grid-stats-3-mt">
                            <StatCard label={t("adminDashboard.activeUsers")} value={users.activeUsers} accent="accent-emerald" />
                            <StatCard label={t("adminDashboard.inactiveUsers")} value={users.inactiveUsers} accent="accent-red" />
                            <StatCard label={t("common.pendingActivation")} value={users.pendingActivation} accent="accent-amber" />
                        </div>
                    </>
                )}
            </Section>

            <h3 className="section-title dash-head-next">{t("adminDashboard.integrations")}</h3>
            <Section loading={!integrations && !integrationsError} error={integrationsError}>
                {integrations && (
                    <div className="grid-stats-3">
                        <StatCard label={t("adminDashboard.callsReceived")} value={integrations.totalWebhookCalls} />
                        <StatCard label={t("adminDashboard.successes")} value={integrations.webhookSuccess} accent="accent-emerald" />
                        <StatCard label={t("adminDashboard.failures")} value={integrations.webhookFailure} accent="accent-red" />
                    </div>
                )}
            </Section>

            <div className="grid-nav-mt">
                <NavCard to="/admin/users" title={t("adminDashboard.navUsers")} subtitle={t("adminDashboard.navUsersSub")} />
                <NavCard to="/admin/logs" title={t("adminLogs.title")} subtitle={t("adminDashboard.navLogsSub")} />
            </div>
        </div>
    );
}

// Enveloppe une section : affiche son erreur ou son chargement sans toucher aux autres.
function Section({ loading, error, children }: { loading: boolean; error: boolean; children: ReactNode }) {
    const { t } = useTranslation();
    if (error) return <p className="error-line">{t("common.statsError")}</p>;
    if (loading) return <p className="loading-text">{t("common.loading")}</p>;
    return <>{children}</>;
}
