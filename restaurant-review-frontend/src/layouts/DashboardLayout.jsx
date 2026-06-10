import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    CreditCard,
    FileSearch,
    LayoutDashboard,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    UtensilsCrossed,
    Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axios";

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
    const [collapsed, setCollapsed] = useState(false);

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
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
        } catch (e) {
            // Local logout still needs to happen if the API session is already gone.
        }
        logout();
        navigate("/");
    };

    return (
        <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
            <aside className="sidebar">
                <div className="brand-row">
                    <div className="brand-mark">
                        <UtensilsCrossed size={21} />
                    </div>
                    {!collapsed && (
                        <div className="brand-copy">
                            <strong>Revio</strong>
                            <span>{user?.role === "ADMIN" ? "Admin workspace" : "Server workspace"}</span>
                        </div>
                    )}
                    <button
                        className="nav-toggle"
                        type="button"
                        onClick={() => setCollapsed((value) => !value)}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
                    </button>
                </div>

                {!collapsed && <div className="sidebar-label">Navigate</div>}

                <nav className="sidebar-nav" aria-label="Dashboard navigation">
                    {navItems.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                className={`nav-link ${active ? "is-active" : ""}`}
                                to={path}
                                title={collapsed ? label : undefined}
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {user && (
                        <div className="user-chip">
                            <div className="avatar">{initials}</div>
                            {!collapsed && (
                                <div>
                                    <strong>{user.full_name}</strong>
                                    <span>{user.role}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <button className="logout-button" type="button" onClick={handleLogout} title="Logout">
                        <LogOut size={19} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="main-area">{children}</main>
        </div>
    );
}

export default DashboardLayout;
