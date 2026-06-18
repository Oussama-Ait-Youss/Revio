import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import RestaurantSetup from "../pages/manager/RestaurantSetup";
import axiosClient from "../api/axios";
import {
    LayoutDashboard, Users, LogOut, Menu, X, Sun, Moon, UtensilsCrossed, CreditCard
} from "lucide-react";

const managerNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard" },
    { label: "Servers / Staff", icon: Users, path: "/manager/servers" },
    { label: "NFC Inventory", icon: CreditCard, path: "/manager/nfc-cards" },
];

function ManagerLayout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

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

    // Onboarding Wizard Interceptor
    if (user && user.restaurant_id === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-bg transition-colors duration-300">
                {/* Theme mode toggle in top-right during onboarding setup */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-3 bg-surface border border-panel-border text-muted rounded-full hover:bg-surface-muted cursor-pointer shadow-sm transition-all"
                    >
                        {theme === "dark" ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-danger-soft hover:bg-danger hover:text-white text-danger rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
                <RestaurantSetup />
            </div>
        );
    }

    return (
        <div className="management-shell">
            {sidebarOpen && <button className="management-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            {/* Sidebar */}
            <aside className={`management-sidebar ${sidebarOpen ? "is-open" : "is-collapsed"}`}>
                {/* Sidebar Header */}
                <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <UtensilsCrossed size={20} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-serif font-bold text-lg tracking-wider text-text-main">
                                REVIO <span className="text-xs font-sans text-primary block uppercase tracking-widest font-semibold">Manager</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {managerNav.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => window.innerWidth <= 900 && setSidebarOpen(false)}
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
                            <div className="text-xs text-muted uppercase tracking-widest font-semibold mt-0.5">Restaurant Owner</div>
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
            </aside>

            {/* Main Content Area */}
            <div className="management-content">
                {/* Header */}
                <header className="management-header">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 bg-surface-muted hover:bg-primary-soft rounded-xl text-muted hover:text-primary-dark transition-all cursor-pointer"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1.5 bg-warning-soft text-warning rounded-full border border-warning-soft uppercase tracking-wider">
                            Venue Manager
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

export default ManagerLayout;
