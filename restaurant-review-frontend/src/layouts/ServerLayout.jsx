import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axios";
import { LogOut, UtensilsCrossed } from "lucide-react";

function ServerLayout({ children }) {
    const { user, logout } = useAuth();
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
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fafaf8", fontFamily: "sans-serif" }}>
            
            {/* Top Banner */}
            <div style={{
                background: "#0f0f0f",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#fff",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "36px", height: "36px", background: "#c9a96e",
                        borderRadius: "8px", display: "flex", alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <UtensilsCrossed size={18} color="#0f0f0f" />
                    </div>
                    <div>
                        <span style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "0.08em" }}>REVIO</span>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Server Portal</div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{user?.full_name}</span>
                    <button onClick={handleLogout} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center"
                    }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    {children}
                </div>
            </div>

        </div>
    );
}

export default ServerLayout;
