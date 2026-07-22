import {Route, Routes, Navigate} from "react-router-dom";

import Login from "./pages/Login.tsx";
import Activate from "./pages/Activate.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import SubmitFeedback from "./pages/SubmitFeedback";
import AdminUsers from "./pages/AdminUsers";

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/feedback/:feedbackId" element={<ProtectedRoute><SubmitFeedback /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}