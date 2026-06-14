import { useState, useEffect } from "react";
import { Store, CreditCard, Star, RefreshCw, Loader2, Activity, Terminal } from "lucide-react";
import axiosClient from "../../api/axios";

function StatCard({ title, value, icon: Icon, delay }) {
    return (
        <div 
            className="stat-card"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="space-y-1">
                <span>{title}</span>
                <strong>{value}</strong>
            </div>
            <div className="icon-tile">
                <Icon size={24} />
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const [statsRes, restRes] = await Promise.all([
                axiosClient.get("/dashboard/stats", { headers }),
                axiosClient.get("/admin/restaurants", { headers })
            ]);

            setStats(statsRes.data);
            setRestaurants(restRes.data.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load platform dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Mock logs for Admin Activity Log
    const systemLogs = [
        { id: 1, action: "New Manager Account Created", detail: "manager@example.com assigned to Le Marrakchi", time: "10 mins ago" },
        { id: 2, action: "Restaurant Setup Complete", detail: "Le Marrakchi configured venue details", time: "1 hour ago" },
        { id: 3, action: "System Migration Completed", detail: "Seeded ADMIN, MANAGER, SERVER roles", time: "3 hours ago" },
        { id: 4, action: "NFC Cards Batch Provisioned", detail: "Active cards deployed to Le Marrakchi", time: "5 hours ago" },
        { id: 5, action: "Security Update", detail: "Sanctum token abilities verified", time: "Yesterday" }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading platform analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <div className="panel padded max-w-md mx-auto">
                    <p className="error-text mb-4 font-semibold">{error}</p>
                    <button onClick={() => fetchData()} className="button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>App Admin Dashboard</h1>
                    <p>Global metrics, registered venues, and operation system logs.</p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="button secondary"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin text-primary" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>

            {/* Metric Grid */}
            <div className="stats-grid">
                <StatCard 
                    title="Total Restaurants Registered" 
                    value={stats?.total_restaurants ?? 0} 
                    icon={Store} 
                    delay={100}
                />
                <StatCard 
                    title="NFC Cards Deployed" 
                    value={stats?.total_nfc_cards ?? 0} 
                    icon={CreditCard} 
                    delay={200}
                />
                <StatCard 
                    title="Total Platform Reviews" 
                    value={stats?.total_reviews ?? 0} 
                    icon={Star} 
                    delay={300}
                />
            </div>

            {/* Split Screen Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Column (2/3 width) - Newest Restaurants Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="panel-header" style={{ padding: '0 0 16px 0', border: 'none', background: 'transparent' }}>
                        <h2 className="flex items-center gap-2">Newest Venues</h2>
                    </div>

                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Venue Name</th>
                                    <th>Contact Phone</th>
                                    <th>Status</th>
                                    <th>Created Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="empty-state">
                                            No venues registered on the platform.
                                        </td>
                                    </tr>
                                ) : (
                                    restaurants.slice(0, 5).map((rest) => (
                                        <tr key={rest.id}>
                                            <td className="font-bold text-text-main">
                                                {rest.name}
                                            </td>
                                            <td className="text-muted">
                                                {rest.phone}
                                            </td>
                                            <td>
                                                <span className={`status-pill ${rest.status === "ACTIVE" ? "active" : "inactive"}`}>
                                                    {rest.status}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {rest.created_at 
                                                    ? new Date(rest.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column (1/3 width) - System Action Log */}
                <div className="space-y-4">
                    <div className="panel-header" style={{ padding: '0 0 16px 0', border: 'none', background: 'transparent' }}>
                        <h2 className="flex items-center gap-2">
                            <Terminal size={18} className="text-primary" />
                            System Logs
                        </h2>
                    </div>

                    <div className="panel padded space-y-4 max-h-[360px] overflow-y-auto">
                        {systemLogs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-sm leading-relaxed border-b border-line pb-4 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-1">
                                    <Activity size={14} />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-bold text-text-main">{log.action}</div>
                                    <div className="text-muted text-xs">{log.detail}</div>
                                    <span className="inline-block text-[11px] text-primary font-semibold mt-1">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
