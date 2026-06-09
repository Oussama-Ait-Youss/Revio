import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../api/axios";
import {
    LayoutDashboard, Store, LogOut, Menu, X, Sun, Moon, UtensilsCrossed
} from "lucide-react";

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Restaurants", icon: Store, path: "/admin/restaurants" },
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
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            {/* Sidebar */}
            <div className={`flex flex-col bg-zinc-950 text-zinc-100 border-r border-zinc-900 duration-300 shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}>
                {/* Sidebar Header */}
                <div className="p-5 flex items-center justify-between border-b border-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#c9a96e] rounded-xl flex items-center justify-center shrink-0">
                            <UtensilsCrossed size={20} className="text-zinc-950" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-serif font-bold text-lg tracking-wider text-white">
                                REVIO <span className="text-xs font-sans text-[#c9a96e] block uppercase tracking-widest font-semibold">Admin</span>
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
                                        ? "bg-[#c9a96e]/15 text-[#c9a96e] font-semibold"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                {sidebarOpen ? (
                                    <span className="text-sm">{label}</span>
                                ) : (
                                    <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                                        {label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-zinc-900 space-y-2">
                    {sidebarOpen && user && (
                        <div className="px-4 py-3 bg-zinc-900/40 rounded-2xl mb-2">
                            <div className="text-sm font-semibold text-white truncate">{user.full_name}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Platform Owner</div>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 rounded-2xl w-full text-left transition-all duration-200 cursor-pointer"
                    >
                        {theme === "dark" ? <Sun size={20} className="shrink-0 text-[#c9a96e]" /> : <Moon size={20} className="shrink-0" />}
                        {sidebarOpen && <span className="text-sm">Theme Mode</span>}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-2xl w-full text-left transition-all duration-200 cursor-pointer"
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 transition-colors duration-300">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
                            Platform Admin
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
