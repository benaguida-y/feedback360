import {Route, Routes, Navigate} from "react-router-dom";

import Login from "./pages/Login.tsx";
import Activate from "./pages/Activate.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import SubmitFeedback from "./pages/SubmitFeedback";
import AdminUsers from "./pages/AdminUsers";
import FeedbackDetail from "./pages/FeedbackDetail.tsx";
import ManagerFeedbacks from "./pages/ManagerFeedbacks.tsx";
import ManagerModuleStats from "./pages/ManagerModuleStats.tsx";
import ManagerCollaborators from "./pages/ManagerCollaborators.tsx";
import CollaboratorDetail from "./pages/CollaboratorDetail.tsx";
import AdminLogs from "./pages/AdminLogs.tsx";
import AdminCreateUser from "./pages/AdminCreateUser.tsx";
import AdminReminders from "./pages/AdminReminders.tsx";
import CollaboratorFeedbacks from "./pages/CollaboratorFeedbacks.tsx";
import MagicLogin from "./pages/MagicLogin.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/login" element={<Login />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/magic-login" element={<MagicLogin />} />

            <Route path="/feedbacks" element={<ProtectedRoute><CollaboratorFeedbacks /></ProtectedRoute>} />
            <Route path="/feedback/:feedbackId" element={<ProtectedRoute><SubmitFeedback /></ProtectedRoute>} />
            <Route path="/feedback/:feedbackId/detail" element={<ProtectedRoute><FeedbackDetail /></ProtectedRoute>} />

            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute><AdminCreateUser /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><AdminLogs /></ProtectedRoute>} />
            <Route path="/admin/reminders" element={<ProtectedRoute><AdminReminders /></ProtectedRoute>} />

            <Route path="/management/feedbacks" element={<ProtectedRoute><ManagerFeedbacks /></ProtectedRoute>} />
            <Route path="/management/modules" element={<ProtectedRoute><ManagerModuleStats /></ProtectedRoute>} />
            <Route path="/management/collaborators" element={<ProtectedRoute><ManagerCollaborators /></ProtectedRoute>} />
            <Route path="/management/collaborators/:userId" element={<ProtectedRoute><CollaboratorDetail /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}