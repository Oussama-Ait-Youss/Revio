import { useEffect, useState } from "react";
import { Activity, CreditCard, Sparkles, Star, Users } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import axiosClient from "../../api/axios";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function StatCard({ title, value, icon: Icon }) {
    return (
        <div className="stat-card">
            <div>
                <span>{title}</span>
                <strong>{value ?? 0}</strong>
            </div>
            <div className="icon-tile">
                <Icon size={24} />
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get("/dashboard/stats", { headers: headers() });
                setStats(response.data);
            } catch (err) {
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="page"><div className="loading-state">Loading dashboard...</div></div>;
    }

    if (error) {
        return <div className="page"><div className="error-state">{error}</div></div>;
    }

    return (
        <div className="page">
            <header className="page-header">
                <div className="page-title">
                    <h1>Dashboard</h1>
                    <p>Quick view of team activity, cards, and review volume.</p>
                </div>
            </header>

            <section className="dashboard-hero">
                <div className="hero-panel">
                    <span className="hero-eyebrow">
                        <Sparkles size={15} /> Live restaurant pulse
                    </span>
                    <h2>Turn every table into sharper service insight.</h2>
                    <p>
                        Watch feedback volume, server coverage, and NFC assignment health from a single operational view.
                    </p>
                </div>
                <div className="hero-side">
                    <div className="signal-card">
                        <span>Review coverage</span>
                        <strong>{stats.total_servers ? Math.round((stats.total_reviews / Math.max(stats.total_servers, 1)) * 10) / 10 : 0}</strong>
                        <span>reviews per server</span>
                    </div>
                    <div className="signal-card">
                        <span>Card readiness</span>
                        <strong>{stats.total_nfc_cards ? Math.round((stats.assigned_nfc_cards / stats.total_nfc_cards) * 100) : 0}%</strong>
                        <span>assigned NFC cards</span>
                    </div>
                </div>
            </section>

            <section className="stats-grid">
                <StatCard title="Servers" value={stats.total_servers} icon={Users} />
                <StatCard title="Reviews" value={stats.total_reviews} icon={Star} />
                <StatCard title="NFC cards" value={stats.total_nfc_cards} icon={CreditCard} />
                <StatCard title="Assigned cards" value={stats.assigned_nfc_cards} icon={Activity} />
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Reviews by server</h2>
                        <p className="panel-subtitle">Compare feedback volume across your floor team.</p>
                    </div>
                </div>

                {stats.reviews_per_server?.length > 0 ? (
                    <div style={{ height: 390, padding: "18px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.reviews_per_server} margin={{ top: 10, right: 18, left: 0, bottom: 52 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    angle={-35}
                                    textAnchor="end"
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "#f8fafc" }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: "1px solid #dbe3ee",
                                        boxShadow: "0 12px 30px rgba(35,48,70,0.12)",
                                    }}
                                />
                                <Bar dataKey="reviews" fill="#0f766e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="empty-state">Not enough data to display this chart.</div>
                )}
            </section>
        </div>
    );
}

export default AdminDashboard;
