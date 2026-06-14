import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import ProtectedRoute from "../guards/ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RestaurantList from "../pages/admin/RestaurantList";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ServerList from "../pages/manager/ServerList";
import ManagerNfcCards from "../pages/manager/NfcCards";
import ServerDashboard from "../pages/server/ServerDashboard";
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
                                    <AdminLayout>
                                        <AdminDashboard />
                                    </AdminLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/restaurants" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["ADMIN"]}>
                                    <AdminLayout>
                                        <RestaurantList />
                                    </AdminLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />

                        {/* MANAGER Routes */}
                        <Route path="/manager/dashboard" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <ManagerLayout>
                                        <ManagerDashboard />
                                    </ManagerLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/manager/servers" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <ManagerLayout>
                                        <ServerList />
                                    </ManagerLayout>
                                </RoleGuard>
                            </ProtectedRoute>
                        } />
                        <Route path="/manager/nfc-cards" element={
                            <ProtectedRoute>
                                <RoleGuard allowedRoles={["MANAGER"]}>
                                    <ManagerLayout>
                                        <ManagerNfcCards />
                                    </ManagerLayout>
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