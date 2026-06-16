import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../api/axios";
import {
    LayoutDashboard, Store, LogOut, Menu, X, Sun, Moon, UtensilsCrossed, CreditCard, Users
} from "lucide-react";

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Restaurants", icon: Store, path: "/admin/restaurants" },
    { label: "Servers Zone", icon: Users, path: "/admin/servers" },
    { label: "NFC Logistics", icon: CreditCard, path: "/admin/nfc-management" },
];

function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await axiosClient.post("/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Logout error", e);
        }
        logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg font-sans transition-colors duration-300">
            {/* Sidebar */}
            <div className={`flex flex-col bg-sidebar-bg text-sidebar-text border-r border-sidebar-border duration-300 shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}>
                {/* Sidebar Header */}
                <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <UtensilsCrossed size={20} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-serif font-bold text-lg tracking-wider text-text-main">
                                REVIO <span className="text-xs font-sans text-primary block uppercase tracking-widest font-semibold">Admin</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {adminNav.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                                    active
                                        ? "bg-primary-soft text-primary-dark font-semibold"
                                        : "text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-hover"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                {sidebarOpen ? (
                                    <span className="text-sm">{label}</span>
                                ) : (
                                    <span className="absolute left-full ml-4 px-2 py-1 bg-surface text-text-main text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-strong border border-line">
                                        {label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-sidebar-border space-y-2">
                    {sidebarOpen && user && (
                        <div className="px-4 py-3 bg-surface-muted border border-line rounded-2xl mb-2">
                            <div className="text-sm font-semibold text-text-main truncate">{user.full_name}</div>
                            <div className="text-xs text-muted uppercase tracking-widest font-semibold mt-0.5">Platform Owner</div>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-4 px-4 py-3 text-sidebar-text hover:bg-sidebar-bg-hover hover:text-sidebar-text-hover rounded-2xl w-full text-left transition-all duration-200 cursor-pointer"
                    >
                        {theme === "dark" ? <Sun size={20} className="shrink-0 text-warning" /> : <Moon size={20} className="shrink-0" />}
                        {sidebarOpen && <span className="text-sm font-medium">Theme Mode</span>}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 text-danger hover:bg-danger-soft hover:text-danger rounded-2xl w-full text-left transition-all duration-200 cursor-pointer"
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-surface border-b border-panel-border flex items-center justify-between px-8 transition-colors duration-300 shadow-sm z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 bg-surface-muted hover:bg-primary-soft rounded-xl text-muted hover:text-primary-dark transition-all cursor-pointer"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1.5 bg-primary-soft text-primary-dark rounded-full border border-primary-soft uppercase tracking-wider">
                            Platform Admin
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-bg transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
