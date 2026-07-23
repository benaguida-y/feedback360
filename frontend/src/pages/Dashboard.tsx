import { getRole } from "../auth";
import Layout from "../components/Layout";
import CollaboratorDashboard from "./CollaboratorDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
    const role = getRole();
    return (
        <Layout>
            {role === "COLLABORATOR" && <CollaboratorDashboard />}
            {(role === "MANAGER" || role === "ADMIN") && <ManagerDashboard />}
        </Layout>
    );
}