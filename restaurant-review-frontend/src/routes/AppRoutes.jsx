import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ProtectedRoute, AdminRoute, ManagerRoute, ServerRoute } from "../guards/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import ServerLayout from "../layouts/ServerLayout";

import Login from "../pages/auth/Login";
import ClientReview from "../pages/public/ClientReview";

import AdminDashboard from "../pages/admin/AdminDashboard";
import RestaurantList from "../pages/admin/RestaurantList";
import NfcCards from "../pages/admin/NfcCards";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import Servers from "../pages/manager/Servers";
import Reviews from "../pages/manager/Reviews";

import ServerDashboard from "../pages/server/ServerDashboard";

function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/review/:token" element={<ClientReview />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute><AdminRoute><DashboardLayout><AdminDashboard /></DashboardLayout></AdminRoute></ProtectedRoute>
                    } />
                    <Route path="/admin/restaurants" element={
                        <ProtectedRoute><AdminRoute><DashboardLayout><RestaurantList /></DashboardLayout></AdminRoute></ProtectedRoute>
                    } />
                    <Route path="/admin/nfc-cards" element={
                        <ProtectedRoute><AdminRoute><DashboardLayout><NfcCards /></DashboardLayout></AdminRoute></ProtectedRoute>
                    } />

                    {/* Manager Routes */}
                    <Route path="/manager/dashboard" element={
                        <ProtectedRoute><ManagerRoute><DashboardLayout><ManagerDashboard /></DashboardLayout></ManagerRoute></ProtectedRoute>
                    } />
                    <Route path="/manager/servers" element={
                        <ProtectedRoute><ManagerRoute><DashboardLayout><Servers /></DashboardLayout></ManagerRoute></ProtectedRoute>
                    } />
                    <Route path="/manager/reviews" element={
                        <ProtectedRoute><ManagerRoute><DashboardLayout><Reviews /></DashboardLayout></ManagerRoute></ProtectedRoute>
                    } />

                    {/* Server Routes */}
                    <Route path="/server/dashboard" element={
                        <ProtectedRoute><ServerRoute><ServerLayout><ServerDashboard /></ServerLayout></ServerRoute></ProtectedRoute>
                    } />
                    
                    {/* Catch All - Redirect to login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default AppRoutes;