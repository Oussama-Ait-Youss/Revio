import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../api/axios";
import { LogOut, UtensilsCrossed, Sun, Moon } from "lucide-react";

function ServerLayout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

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
        <div className="flex flex-col h-screen bg-bg transition-colors duration-300 font-sans">
            
            {/* Top Banner */}
            <div className="bg-surface shadow-sm border-b border-panel-border p-4 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <UtensilsCrossed size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-serif font-bold text-lg tracking-wider text-text-main">REVIO</span>
                        <div className="text-xs text-muted uppercase tracking-widest font-semibold mt-0.5">Server Portal</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden sm:block text-sm font-semibold text-text-main px-3 py-1 bg-surface-muted rounded-full border border-line">
                        {user?.full_name}
                    </span>
                    
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 text-muted hover:text-warning hover:bg-surface-muted rounded-full transition-all cursor-pointer"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    <button 
                        onClick={handleLogout} 
                        className="p-2 text-muted hover:text-danger hover:bg-danger-soft rounded-full transition-all cursor-pointer"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-2xl mx-auto w-full">
                    {children}
                </div>
            </div>

        </div>
    );
}

export default ServerLayout;
