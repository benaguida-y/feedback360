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

            <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
                <div className="card h-max p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Interrupteur relance auto */}
                        <label className="flex cursor-pointer items-start gap-3">
                            <input type="checkbox" checked={autoEnabled} disabled={loading}
                                   onChange={(e) => setAutoEnabled(e.target.checked)} className="peer sr-only" />
                            <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-brand peer-checked:after:translate-x-5 dark:bg-cap-border" />
                            <span>
                                <span className="form-label">{t("adminReminders.autoLabel")}</span>
                                <span className="mt-0.5 block text-xs cell-muted">{t("adminReminders.autoHelp")}</span>
                            </span>
                        </label>

                        <label className="block">
                            <span className="form-label">{t("adminReminders.delayLabel")}</span>
                            <input type="number" min={1} max={365} value={delayDays} disabled={loading}
                                   onChange={(e) => setDelayDays(Number(e.target.value))} className="form-input-plain w-full" />
                            <span className="mt-1 block text-xs cell-muted">{t("adminReminders.delayHelp")}</span>
                        </label>

                        <label className="block">
                            <span className="form-label">{t("adminReminders.maxLabel")}</span>
                            <input type="number" min={1} max={10} value={maxReminders} disabled={loading}
                                   onChange={(e) => setMaxReminders(Number(e.target.value))} className="form-input-plain w-full" />
                            <span className="mt-1 block text-xs cell-muted">{t("adminReminders.maxHelp")}</span>
                        </label>

                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={saving || loading} className="btn-primary-lg px-5">
                                {saving ? t("adminReminders.saving") : t("adminReminders.save")}
                            </button>
                            {saved && (
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-4 w-4" />
                                    {t("adminReminders.saved")}
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                <aside className="card h-max p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-brand" />
                        <h3 className="subsection-title">{t("adminReminders.howTitle")}</h3>
                    </div>
                    <ul className="space-y-3 text-sm cell-default">
                        <li>{t("adminReminders.how1")}</li>
                        <li>{t("adminReminders.how2")}</li>
                        <li>{t("adminReminders.how3")}</li>
                    </ul>
                </aside>
            </div>
        </Layout>
    );
}
