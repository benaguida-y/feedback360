import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { setToken } from "../auth";
import client from "../api/client.ts";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await client.post("/auth/login", {email, password});
            setToken(res.data.accessToken);
            navigate('/');
        } catch {
            setError("Email or password invalid");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "Arial, sans-serif" }}>
            <h1>Connexion</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>Email<br />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               required style={{ width: "100%", padding: 8 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Mot de passe<br />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                               required style={{ width: "100%", padding: 8 }} />
                    </label>
                </div>
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                <button type="submit" disabled={loading}
                        style={{ width: "100%", padding: 10, background: "#0070ad", color: "#fff",
                            border: "none", borderRadius: 6, cursor: "pointer" }}>
                    {loading ? "Connexion…" : "Se connecter"}
                </button>
            </form>
        </div>
    );
}