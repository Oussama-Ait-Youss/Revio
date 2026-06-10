import { useState, useEffect } from "react";
import { Users, CreditCard, Star, RefreshCw, Loader2, Award, AlertTriangle, AlertCircle, MessageSquare } from "lucide-react";
import axiosClient from "../../api/axios";

function StatCard({ title, value, icon: Icon, delay }) {
    return (
        <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-950 transition-all duration-300 flex items-center justify-between"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="space-y-1">
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    {title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {value}
                </h3>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                <Icon size={22} />
            </div>
        </div>
    );
}

function ManagerDashboard() {
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
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

            const [statsRes, reviewsRes] = await Promise.all([
                axiosClient.get("/dashboard/stats", { headers }),
                axiosClient.get("/reviews", { headers })
            ]);

            setStats(statsRes.data);
            setReviews(reviewsRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load restaurant dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate Average Customer Rating dynamically
    const totalReviewsCount = reviews.length;
    const averageRating = totalReviewsCount > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviewsCount).toFixed(1)
        : "0.0";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 size={36} className="animate-spin text-emerald-600" />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading restaurant stats...</span>
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
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
                        Restaurant Performance Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Analytics dashboard scoped to your active venue location.
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin text-emerald-600" : ""} />
                </button>
            </div>

            {/* Top Metric Grid (3 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="My Active Servers" 
                    value={stats?.total_servers ?? 0} 
                    icon={Users} 
                    delay={100}
                />
                <StatCard 
                    title="NFC Cards Active" 
                    value={stats?.total_nfc_cards ?? 0} 
                    icon={CreditCard} 
                    delay={200}
                />
                <StatCard 
                    title="Average Customer Rating" 
                    value={`⭐ ${averageRating} / 5.0`} 
                    icon={Star} 
                    delay={300}
                />
            </div>

            {/* Recent Feedback Stream Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
                    <MessageSquare size={20} className="text-emerald-500" />
                    Recent Feedback Stream
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length === 0 ? (
                        <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                            No review feedback collected yet for this restaurant.
                        </div>
                    ) : (
                        reviews.map((review, i) => {
                            // Determine rating tier badge
                            let ratingBadge = null;
                            if (review.rating === 5) {
                                ratingBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250/20">
                                        <Award size={10} className="shrink-0" />
                                        5-Star Top Review
                                    </span>
                                );
                            } else if (review.rating === 4) {
                                ratingBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-250/20">
                                        High Rating
                                    </span>
                                );
                            } else {
                                ratingBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-250/20">
                                        <AlertTriangle size={10} className="shrink-0" />
                                        Action Needed
                                    </span>
                                );
                            }

                            return (
                                <div 
                                    key={review.id} 
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-slate-950 dark:text-white">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                                                {review.server?.user?.full_name?.split(" ").map(n => n[0]).join("") || "S"}
                                            </div>
                                            <div className="ml-2">
                                                <div className="text-xs font-bold">{review.server?.user?.full_name || "Unknown Server"}</div>
                                                <div className="text-[10px] text-slate-400">Server Profile ID #{review.server_id}</div>
                                            </div>
                                        </div>
                                        {ratingBadge}
                                    </div>

                                    <div className="space-y-2">
                                        {/* Stars count */}
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star 
                                                    key={idx} 
                                                    size={16} 
                                                    className={`${
                                                        idx < review.rating 
                                                            ? "text-amber-500 fill-amber-500" 
                                                            : "text-slate-200 dark:text-slate-800"
                                                    }`} 
                                                />
                                            ))}
                                        </div>

                                        <p className="text-sm text-slate-655 dark:text-slate-350 leading-relaxed font-medium">
                                            {review.comment || <span className="italic text-slate-450 dark:text-slate-500">No review comments provided by customer.</span>}
                                        </p>
                                    </div>

                                    <div className="text-[10px] font-semibold text-slate-400 tracking-wider pt-2 border-t border-slate-100 dark:border-slate-850">
                                        Submitted on {new Date(review.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
