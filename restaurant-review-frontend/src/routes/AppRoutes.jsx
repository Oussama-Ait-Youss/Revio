import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import ProtectedRoute from "../guards/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import RestaurantList from "../pages/admin/RestaurantList";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ServerList from "../pages/manager/ServerList";
import Reviews from "../pages/manager/Reviews";
import NfcCards from "../pages/admin/NfcCards";
import ServerDashboard from "../pages/dashboard/ServerDashboard";
import ClientReview from "../pages/public/ClientReview";

function LoginRedirect() {
    const { user } = useAuth();
    if (user) {
        if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
        if (user.role === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
        if (user.role === "SERVER") return <Navigate to="/server/dashboard" replace />;
    }
    return <Login />;
}

function RoleGuard({ allowedRoles, children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (!allowedRoles.includes(user.role)) {
        if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
        if (user.role === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
        if (user.role === "SERVER") return <Navigate to="/server/dashboard" replace />;
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppRoutes() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LoginRedirect />} />
                        <Route path="/review/:token" element={<ClientReview />} />
                        
                        {/* ADMIN Routes */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["ADMIN"]}>
                                    <DashboardLayout>
                                        <AdminDashboard />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/restaurants" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["ADMIN"]}>
                                    <DashboardLayout>
                                        <RestaurantList />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/nfc-cards" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["ADMIN"]}>
                                    <DashboardLayout>
                                        <NfcCards />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />

                        {/* MANAGER Routes */}
                        <Route path="/manager/dashboard" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <DashboardLayout>
                                        <ManagerDashboard />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/manager/servers" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <DashboardLayout>
                                        <ServerList />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/manager/reviews" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <DashboardLayout>
                                        <Reviews />
                                    </DashboardLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />

                        {/* SERVER Routes */}
                        <Route path="/server/dashboard" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["SERVER"]}>
                                    <ServerDashboard />
                                </RoleGuard>
                            </ProtectedRoute>
                        } />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default AppRoutes;
