import { Link, useNavigate } from "react-router-dom";
import { clearToken, getUser } from "../auth";
import CollaboratorDashboard from "./CollaboratorDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = getUser();
    const role = user?.role;

    function logout() { clearToken(); navigate("/login"); }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
                <h1 className="text-xl font-bold text-sky-700">Feedback360</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Rôle :
                        <b>
                            {role === "ADMIN" && (<Link to="/admin/users" className="text-sm font-medium text-sky-600 hover:underline">Administration</Link>)}
                        </b>
                    </span>
                    <button onClick={logout}
                            className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300">
                        Se déconnecter
                    </button>
                </div>
            </header>
            <main className="mx-auto max-w-5xl p-6">
                {role === "COLLABORATOR" && <CollaboratorDashboard />}
                {(role === "MANAGER" || role === "ADMIN") && <ManagerDashboard />}
            </main>
        </div>
    );
}