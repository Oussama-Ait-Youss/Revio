import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axios";
import {
    LayoutDashboard, Users, CreditCard, Star, LogOut, Menu, X, FileSearch
} from "lucide-react";

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Restaurants", icon: Users, path: "/admin/restaurants" },
    { label: "NFC Cards", icon: CreditCard, path: "/admin/nfc-cards" },
];

const managerNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard" },
    { label: "Team / Servers", icon: Users, path: "/manager/servers" },
    { label: "Reviews", icon: FileSearch, path: "/manager/reviews" },
];

function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = user?.role === "ADMIN" ? adminNav : user?.role === "MANAGER" ? managerNav : [];
    const roleLabel = user
        ? user.role === "ADMIN"
            ? "Admin Dashboard"
            : user.role === "MANAGER"
            ? "Manager Portal"
            : ""
        : "";

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout", {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
        } catch (e) {}
        logout();
        navigate("/");
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "sans-serif" }}>

            {/* Sidebar */}
            <div style={{
                width: sidebarOpen ? "240px" : "64px",
                background: "#0f0f0f",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.2s",
                flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{
                    padding: "20px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#c9a96e", padding: 0, flexShrink: 0,
                    }}>
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    {sidebarOpen && (
                        <span style={{ color: "#fff", fontSize: "16px", letterSpacing: "0.1em" }}>
                            REVIO
                        </span>
                    )}
                </div>

                {/* Nav */}
                <div style={{ padding: "18px 12px", color: "rgba(255,255,255,0.75)", fontSize: "12px", letterSpacing: "0.1em" }}>
                    {roleLabel}
                </div>
                <nav style={{ flex: 1, padding: "12px 8px" }}>
                    {navItems.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <Link key={path} to={path} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                marginBottom: "4px",
                                textDecoration: "none",
                                background: active ? "rgba(201,169,110,0.15)" : "transparent",
                                color: active ? "#c9a96e" : "rgba(255,255,255,0.5)",
                                transition: "all 0.15s",
                            }}>
                                <Icon size={20} flexShrink={0} />
                                {sidebarOpen && (
                                    <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
                                        {label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div style={{
                    padding: "16px 8px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                }}>
                    {sidebarOpen && user && (
                        <div style={{ padding: "0 8px 12px", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                            <div style={{ color: "#fff", fontWeight: 500, marginBottom: "2px" }}>{user.full_name}</div>
                            <div>{user.role}</div>
                        </div>
                    )}
                    <button onClick={handleLogout} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.4)",
                        width: "100%",
                        fontSize: "14px",
                    }}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: "auto", background: "#fafaf8" }}>
                {children}
            </div>
        </div>
    );
}

export default DashboardLayout;