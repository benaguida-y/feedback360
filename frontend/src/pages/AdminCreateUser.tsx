import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft } from "lucide-react";
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
                <div className="card h-max p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label={t("common.email")} type="email" value={email} onChange={setEmail} />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label={t("adminCreateUser.firstName")} value={firstName} onChange={setFirstName} />
                            <Field label={t("common.name")} value={lastName} onChange={setLastName} />
                        </div>
                        <label className="block">
                            <span className="form-label">{t("common.role")}</span>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input-plain">
                                <option value="MANAGER">MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </label>
                        {error && <p className="text-sm error-text">{error}</p>}
                        <button type="submit" disabled={loading} className="btn-primary-lg w-full">
                            {loading ? t("adminCreateUser.creating") : t("adminCreateUser.submit")}
                        </button>
                    </form>

                    {link && (
                        <div className="create-success">
                            <div className="create-success-badge">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <p className="create-success-title">{t("adminCreateUser.createdTitle")}</p>
                            <p className="create-success-text">{t("adminCreateUser.createdText")}</p>
                            <Link to="/admin/users" className="create-success-btn">
                                <ChevronLeft className="h-4 w-4" />
                                {t("adminCreateUser.backToList")}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Guide */}
                <aside className="space-y-6">
                    <div className="card p-6">
                        <h3 className="subsection-title mb-4">{t("adminCreateUser.howItWorks")}</h3>
                        <ol className="space-y-4">
                            {steps.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="step-num">{i + 1}</span>
                                    <span className="text-sm cell-default">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="card p-6">
                        <h3 className="subsection-title mb-4">{t("adminCreateUser.rolesTitle")}</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="role-badge role-manager">MANAGER</span>
                                <p className="mt-1.5 cell-default">{t("adminCreateUser.managerDesc")}</p>
                            </div>
                            <div>
                                <span className="role-badge role-admin">ADMIN</span>
                                <p className="mt-1.5 cell-default">{t("adminCreateUser.adminDesc")}</p>
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
            <span className="form-label">{label}</span>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="form-input-plain" />
        </label>
    );
}
