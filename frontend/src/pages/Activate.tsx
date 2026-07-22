import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function Activate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setLoading(true);
        try {
            await client.post("/auth/activate", { token, password });
            navigate("/login");
        } catch {
            setError("Lien invalide ou expiré. Demandez un nouveau lien d'activation.");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "Arial, sans-serif" }}>
                <h1>Activation</h1>
                <p style={{ color: "crimson" }}>Lien d'activation invalide (token manquant).</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "Arial, sans-serif" }}>
            <h1>Définir votre mot de passe</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>Nouveau mot de passe<br />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                               required minLength={6} style={{ width: "100%", padding: 8 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Confirmer le mot de passe<br />
                        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                               required style={{ width: "100%", padding: 8 }} />
                    </label>
                </div>
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                <button type="submit" disabled={loading}
                        style={{ width: "100%", padding: 10, background: "#0070ad", color: "#fff",
                            border: "none", borderRadius: 6, cursor: "pointer" }}>
                    {loading ? "Activation…" : "Activer mon compte"}
                </button>
            </form>
        </div>
    );
}