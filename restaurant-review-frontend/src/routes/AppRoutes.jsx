import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../guards/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import Servers from "../pages/servers/Servers";

function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <AdminDashboard />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/servers" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Servers />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default AppRoutes;