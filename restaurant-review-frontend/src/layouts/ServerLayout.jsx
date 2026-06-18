import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sparkles, Sun } from "lucide-react";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function ServerLayout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout");
        } catch {
            // The local session is still cleared if the token already expired.
        }
        logout();
        navigate("/");
    };

    return (
        <div className="server-shell">
            <header className="server-topbar">
                <div className="server-topbar-inner">
                    <div className="server-brand">
                        <span className="server-brand-mark"><Sparkles size={16} /></span>
                        <div>
                            <strong>REVIO</strong>
                            <span>{user?.full_name || "Server space"}</span>
                        </div>
                    </div>

                    <div className="server-actions">
                        <button onClick={toggleTheme} className="server-icon-button" type="button" aria-label="Toggle dark mode">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={handleLogout} className="server-disconnect" type="button">
                            <LogOut size={17} />
                            <span>Disconnect</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="server-main">{children}</main>
        </div>
    );
}

export default ServerLayout;
