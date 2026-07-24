/*
import { Link, useNavigate } from "react-router-dom";
import { clearToken, getRole } from "../auth";

export default function Header() {
    const navigate = useNavigate();
    const role = getRole();

    function logout() {
        clearToken();
        navigate("/login");
    }

    return (
        <header className="flex items-center justify-between bg-white px-6 py-3 shadow">
            <Link to="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="Feedback360" className="h-8" />
                <span className="text-lg font-bold text-sky-700">Feedback360</span>
            </Link>
            <div className="flex items-center gap-4">
                {role === "ADMIN" && (
                    <Link to="/admin/users" className="text-sm font-medium text-sky-600 hover:underline">
                        Administration
                    </Link>
                )}
                <span className="text-sm text-gray-600">Rôle : <b>{role}</b></span>
                <button onClick={logout}
                        className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">
                    Se déconnecter
                </button>
            </div>
        </header>
    );
}*/
// import { useNavigate } from "react-router-dom";
// import { clearToken, getRole } from "../auth";

export default function Header() {
    // const navigate = useNavigate();
    // const role = getRole();
    // function logout() { clearToken(); navigate("/login"); }

    return (
        <header className="flex shrink-0 items-center justify-end gap-4 border-b border-slate-200 bg-white px-8 py-3">
        </header>
    );
}