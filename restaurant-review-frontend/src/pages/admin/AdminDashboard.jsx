import { useState, useEffect } from "react";
import { Store, CreditCard, Star, RefreshCw, Loader2, ArrowRight, Activity, Terminal } from "lucide-react";
import axiosClient from "../../api/axios";

function StatCard({ title, value, icon: Icon, delay }) {
    return (
        <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300 flex items-center justify-between"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="space-y-1">
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    {title}
                </p>
                <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {value}
                </h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <Icon size={22} />
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading platform analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 max-w-md shadow-sm">
                    <p className="text-red-650 dark:text-red-400 font-semibold mb-4 text-sm">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
                        App Admin Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                        Global metrics, registered venues, and operation system logs.
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin text-indigo-600" : ""} />
                </button>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
                            Newest Venues
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Venue Name</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact Phone</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Created Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                    {restaurants.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-8 text-center text-slate-400 dark:text-slate-550 text-sm">
                                                No venues registered on the platform.
                                            </td>
                                        </tr>
                                    ) : (
                                        restaurants.slice(0, 5).map((rest) => (
                                            <tr key={rest.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors">
                                                <td className="px-5 py-4.5 text-sm font-bold text-slate-900 dark:text-white">
                                                    {rest.name}
                                                </td>
                                                <td className="px-5 py-4.5 text-sm text-slate-500 dark:text-slate-400">
                                                    {rest.phone}
                                                </td>
                                                <td className="px-5 py-4.5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        rest.status === "ACTIVE"
                                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/20"
                                                            : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200/20"
                                                    }`}>
                                                        {rest.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4.5 text-sm text-slate-400">
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
                </div>

                {/* Right Column (1/3 width) - System Action Log */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
                        <Terminal size={18} className="text-indigo-500" />
                        System Logs
                    </h2>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 max-h-[360px] overflow-y-auto">
                        {systemLogs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-xs leading-relaxed border-b border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                                <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5">
                                    <Activity size={12} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-850 dark:text-slate-100">{log.action}</div>
                                    <div className="text-slate-400 dark:text-slate-500">{log.detail}</div>
                                    <span className="inline-block text-[10px] text-indigo-500 font-semibold mt-1">{log.time}</span>
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
