import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ProtectedRoute from "../guards/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import ServerDashboard from "../pages/dashboard/ServerDashboard";
import Servers from "../pages/dashboard/Servers";
import Reviews from "../pages/dashboard/Reviews";
import NfcCards from "../pages/dashboard/NfcCards";
import ClientReview from "../pages/public/ClientReview";

function DashboardEntry() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    return user.role === "ADMIN" ? <AdminDashboard /> : <ServerDashboard />;
}

function AdminOnly({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
    return children;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/review/:token" element={<ClientReview />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <DashboardEntry />
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/servers" element={
                        <ProtectedRoute>
                            <AdminOnly>
                                <DashboardLayout>
                                    <Servers />
                                </DashboardLayout>
                            </AdminOnly>
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/reviews" element={
                        <ProtectedRoute>
                            <AdminOnly>
                                <DashboardLayout>
                                    <Reviews />
                                </DashboardLayout>
                            </AdminOnly>
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard/nfc-cards" element={
                        <ProtectedRoute>
                            <AdminOnly>
                                <DashboardLayout>
                                    <NfcCards />
                                </DashboardLayout>
                            </AdminOnly>
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default AppRoutes;