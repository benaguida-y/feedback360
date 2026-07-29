import { getRole } from "../auth";
import Layout from "../components/Layout";
import CollaboratorDashboard from "./CollaboratorDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard.tsx";

export default function Dashboard() {
    const role = getRole();
    return (
        <Layout>
            {/* … bandeau de succès existant … */}
            {role === "COLLABORATOR" && <CollaboratorDashboard />}
            {role === "MANAGER" && <ManagerDashboard />}
            {role === "ADMIN" && <AdminDashboard />}
        </Layout>
    );
}