import { useState, useEffect } from "react";
import { Users, Star, CreditCard, Activity } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import axiosClient from "../../api/axios";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #f0f0f0",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default"
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)";
        }}
        >
            <div>
                <p style={{ color: "#888", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>
                    {title}
                </p>
                <h3 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#0f0f0f" }}>
                    {value}
                </h3>
            </div>
            <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: color + "15", // adding some transparency
                color: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Icon size={28} />
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get("/dashboard/stats", { headers: headers() });
                setStats(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#888", fontSize: "1.1rem" }}>
                Loading dashboard statistics...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#c0392b", fontSize: "1.1rem" }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", boxSizing: "border-box" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#0f0f0f" }}>
                    Global Platform Statistics
                </h1>
                <p style={{ color: "#888", marginTop: "0.5rem", fontSize: "14px" }}>
                    Real-time statistics and analytics for the Revio platform.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "1.5rem",
                marginBottom: "3rem" 
            }}>
                <StatCard 
                    title="Total Restaurants" 
                    value={stats.total_restaurants || stats.total_servers} 
                    icon={Users} 
                    color="#4F46E5" // Indigo
                />
                <StatCard 
                    title="Total Reviews" 
                    value={stats.total_reviews} 
                    icon={Star} 
                    color="#F59E0B" // Amber
                />
                <StatCard 
                    title="Total NFC Cards Deployed" 
                    value={stats.total_nfc_cards} 
                    icon={CreditCard} 
                    color="#10B981" // Emerald
                />
                <StatCard 
                    title="Assigned Cards" 
                    value={stats.assigned_nfc_cards} 
                    icon={Activity} 
                    color="#EC4899" // Pink
                />
            </div>

            {/* Charts Section */}
            <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                border: "1px solid #f0f0f0",
            }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#0f0f0f", margin: "0 0 2rem 0" }}>
                    Reviews by Restaurant
                </h2>
                
                {stats.reviews_per_server && stats.reviews_per_server.length > 0 ? (
                    <div style={{ height: "400px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.reviews_per_server}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f9f9f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar 
                                    dataKey="reviews" 
                                    fill="#0f0f0f" 
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ padding: "4rem 0", textAlign: "center", color: "#aaa" }}>
                        Not enough data to display the chart.
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;