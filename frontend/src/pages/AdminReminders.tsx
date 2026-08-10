import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BellRing, Check } from "lucide-react";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "react-i18next";

interface Settings {
    autoEnabled: boolean;
    delayDays: number;
    maxReminders: number;
}

export default function AdminReminders() {
    const { t } = useTranslation();
    const [autoEnabled, setAutoEnabled] = useState(false);
    const [delayDays, setDelayDays] = useState(7);
    const [maxReminders, setMaxReminders] = useState(3);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    useEffect(() => {
        client.get<Settings>("/admin/reminder-settings")
            .then((r) => {
                setAutoEnabled(r.data.autoEnabled);
                setDelayDays(r.data.delayDays);
                setMaxReminders(r.data.maxReminders);
            })
            .catch(() => setError(t("adminReminders.loadError")))
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setSaved(false); setSaving(true);
        try {
            await client.put("/admin/reminder-settings", { autoEnabled, delayDays, maxReminders });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError(t("adminReminders.saveError"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <Layout>
            <PageHeader title={t("adminReminders.title")} subtitle={t("adminReminders.subtitle")} backTo="/admin/users" />

            {error && <p className="error-line">{error}</p>}

            <div className="reminders-grid">
                <div className="card h-content pad-6">
                    <form onSubmit={handleSubmit} className="form-stack-lg">
                        {/* Interrupteur relance auto */}
                        <label className="toggle-row">
                            <input type="checkbox" checked={autoEnabled} disabled={loading}
                                   onChange={(e) => setAutoEnabled(e.target.checked)} className="peer sr-hide" />
                            <span className="toggle-switch" />
                            <span>
                                <span className="form-label">{t("adminReminders.autoLabel")}</span>
                                <span className="cell-muted field-help-tight">{t("adminReminders.autoHelp")}</span>
                            </span>
                        </label>

                        <label className="d-block">
                            <span className="form-label">{t("adminReminders.delayLabel")}</span>
                            <input type="number" min={1} max={365} value={delayDays} disabled={loading}
                                   onChange={(e) => setDelayDays(Number(e.target.value))} className="form-input-plain full-w" />
                            <span className="cell-muted field-help">{t("adminReminders.delayHelp")}</span>
                        </label>

                        <label className="d-block">
                            <span className="form-label">{t("adminReminders.maxLabel")}</span>
                            <input type="number" min={1} max={10} value={maxReminders} disabled={loading}
                                   onChange={(e) => setMaxReminders(Number(e.target.value))} className="form-input-plain full-w" />
                            <span className="cell-muted field-help">{t("adminReminders.maxHelp")}</span>
                        </label>

                        <div className="row-center-3">
                            <button type="submit" disabled={saving || loading} className="btn-primary-lg btn-px5">
                                {saving ? t("adminReminders.saving") : t("adminReminders.save")}
                            </button>
                            {saved && (
                                <span className="saved-badge">
                                    <Check className="icon-sm" />
                                    {t("adminReminders.saved")}
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                <aside className="card h-content pad-6">
                    <div className="reminders-title-row">
                        <BellRing className="icon-md-brand" />
                        <h3 className="subsection-title">{t("adminReminders.howTitle")}</h3>
                    </div>
                    <ul className="cell-default how-list">
                        <li>{t("adminReminders.how1")}</li>
                        <li>{t("adminReminders.how2")}</li>
                        <li>{t("adminReminders.how3")}</li>
                    </ul>
                </aside>
            </div>
        </Layout>
    );
}
