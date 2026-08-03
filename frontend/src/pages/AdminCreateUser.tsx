import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import client from "../api/client";
import { getRole } from "../auth";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";

export default function AdminCreateUser() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("MANAGER");
    const [error, setError] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    if (getRole() !== "ADMIN") return <Navigate to="/" replace />;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setLink(""); setLoading(true);
        try {
            const res = await client.post("/admin/users", { email, firstName, lastName, role });
            setLink(res.data.activationLink);
            setEmail(""); setFirstName(""); setLastName("");
        } catch (err: any) {
            setError(err?.response?.status === 409 ? t("adminCreateUser.emailTaken") : t("adminCreateUser.createError"));
        } finally {
            setLoading(false);
        }
    }

    const steps = [
        t("adminCreateUser.step1"),
        t("adminCreateUser.step2"),
        t("adminCreateUser.step3"),
        t("adminCreateUser.step4"),
    ];

    return (
        <Layout>
            <PageHeader title={t("adminCreateUser.title")}
                        subtitle={t("adminCreateUser.subtitle")}
                        backTo="/admin/users"
            />

            <div className="grid max-w-7xl gap-6 lg:grid-cols-2">
                {/* Formulaire */}
                <div className="h-max rounded-lg border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label={t("common.email")} type="email" value={email} onChange={setEmail} />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label={t("adminCreateUser.firstName")} value={firstName} onChange={setFirstName} />
                            <Field label={t("common.name")} value={lastName} onChange={setLastName} />
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.role")}</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)}
                                    className="mt-1.5 w-full border border-slate-300 dark:border-cap-border px-3 py-2 dark:bg-cap-panel outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </label>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={loading}
                                className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                            {loading ? t("adminCreateUser.creating") : t("adminCreateUser.submit")}
                        </button>
                    </form>

                    {link && (
                        <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/15 p-3 text-sm text-emerald-800 dark:text-emerald-300">
                            <p className="font-medium">{t("adminCreateUser.created")}</p>
                            <p className="mt-1 break-all text-emerald-700 dark:text-emerald-300">{t("adminCreateUser.linkLabel")} {link}</p>
                            <Link to="/admin/users" className="mt-2 inline-block font-medium text-brand hover:text-brand-dark">
                                {t("adminCreateUser.backToList")}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Guide */}
                <aside className="space-y-6">
                    <div className="rounded-lg border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{t("adminCreateUser.howItWorks")}</h3>
                        <ol className="space-y-4">
                            {steps.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-cap-border bg-white dark:bg-cap-panel p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{t("adminCreateUser.rolesTitle")}</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="rounded-full bg-sky-50 dark:bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-400/25">MANAGER</span>
                                <p className="mt-1.5 text-slate-600 dark:text-slate-300">{t("adminCreateUser.managerDesc")}</p>
                            </div>
                            <div>
                                <span className="rounded-full bg-red-50 dark:bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-400/25">ADMIN</span>
                                <p className="mt-1.5 text-slate-600 dark:text-slate-300">{t("adminCreateUser.adminDesc")}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </Layout>
    );
}

function Field({ label, value, onChange, type = "text" }:
               { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required
                   className="mt-1.5 w-full border border-slate-300 dark:border-cap-border px-3 py-2 dark:bg-cap-panel outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
    );
}
