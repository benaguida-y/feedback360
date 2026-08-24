import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";

interface UserDetail {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    active: boolean;
    activated: boolean;
    department: string | null;
    externalUserId: number | null;
}

function roleBadge(r: string) {
    switch (r) {
        case "ADMIN":   return "role-admin";
        case "MANAGER": return "role-manager";
        default:        return "role-collaborator";
    }
}

export default function AdminUserDetail() {
    const { t } = useTranslation();
    const { userId } = useParams();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<UserDetail>(`/admin/users/${userId}`)
            .then((r) => setUser(r.data))
            .catch(() => setError(t("adminUsers.loadError")));
    }, [userId]);

    async function toggleActive() {
        if (!user) return;
        setBusy(true);
        try {
            const res = await client.patch<{ active: boolean }>(`/admin/users/${user.userId}/status`, { active: !user.active });
            setUser((u) => (u ? { ...u, active: res.data.active } : u));
        } catch {
            setError(t("adminUsers.statusError"));
        } finally {
            setBusy(false);
        }
    }

    if (error) return <Layout><p className="error-text">{error}</p></Layout>;
    if (!user) return <Layout><p className="loading-text">{t("common.loading")}</p></Layout>;

    return (
        <Layout>
            <PageHeader title={t("adminUserDetail.title", { defaultValue: "Fiche utilisateur" })}
                        subtitle={user.email} backTo="/admin/users" />

            <div className="card detail-card">
                <dl className="detail-list">
                    <Row label={t("common.name")}><span className="cell-strong">{user.fullName}</span></Row>
                    <Row label={t("common.email")}>{user.email}</Row>
                    <Row label={t("common.role")}>
                        <span className={`role-badge ${roleBadge(user.role)}`}>{user.role}</span>
                    </Row>
                    <Row label={t("common.status")}>
                        {user.activated ? (
                            <span className={`pill ${user.active ? "pill-active" : "pill-inactive"}`}>
                                {user.active ? t("common.active") : t("common.inactive")}
                            </span>
                        ) : (
                            <span className="pill pill-pending">{t("common.pendingActivation")}</span>
                        )}
                    </Row>
                    <Row label={t("adminUserDetail.department", { defaultValue: "Département" })}>
                        {user.department ?? "—"}
                    </Row>
                    <Row label={t("adminUserDetail.externalId", { defaultValue: "ID externe" })}>
                        {user.externalUserId ?? "—"}
                    </Row>
                </dl>

                {user.activated && (
                    <div className="detail-comment">
                        <button onClick={toggleActive} disabled={busy}
                                className={`btn-toggle ${user.active ? "btn-toggle-danger" : "btn-toggle-success"}`}>
                            {busy ? "…" : user.active ? t("adminUsers.deactivate") : t("adminUsers.activate")}
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}

// Une ligne libellé / valeur
function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="detail-stars">
            <dt className="detail-label">{label}</dt>
            <dd className="detail-value">{children}</dd>
        </div>
    );
}