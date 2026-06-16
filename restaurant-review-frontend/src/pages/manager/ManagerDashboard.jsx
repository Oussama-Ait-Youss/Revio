import { useState, useEffect } from "react";
import { Users, CreditCard, Star, RefreshCw, Loader2, Award, AlertTriangle, MessageSquare } from "lucide-react";
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

    const totalReviewsCount = reviews.length;
    const averageRating = totalReviewsCount > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviewsCount).toFixed(1)
        : "0.0";

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading restaurant stats...</span>
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
            <div className="page-header">
                <div className="page-title">
                    <h1>Restaurant Performance Dashboard</h1>
                    <p>Analytics dashboard scoped to your active venue location.</p>
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

            <div className="stats-grid">
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

            <div className="space-y-4">
                <div className="panel-header" style={{ padding: '0 0 16px 0', border: 'none', background: 'transparent' }}>
                    <h2 className="flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary" />
                        Recent Feedback Stream
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length === 0 ? (
                        <div className="col-span-2 empty-state panel">
                            No review feedback collected yet for this restaurant.
                        </div>
                    ) : (
                        reviews.map((review) => {
                            let ratingBadge = null;
                            if (review.rating === 5) {
                                ratingBadge = (
                                    <span className="rating-pill good">
                                        <Award size={12} className="shrink-0" />
                                        5-Star Top Review
                                    </span>
                                );
                            } else if (review.rating === 4) {
                                ratingBadge = (
                                    <span className="rating-pill good">
                                        High Rating
                                    </span>
                                );
                            } else {
                                ratingBadge = (
                                    <span className="rating-pill bad">
                                        <AlertTriangle size={12} className="shrink-0" />
                                        Action Needed
                                    </span>
                                );
                            }

                            return (
                                <div key={review.id} className="panel padded space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-text-main">
                                            <div className="avatar" style={{ width: 40, height: 40, borderRadius: 8 }}>
                                                {review.server?.user?.full_name?.split(" ").map(n => n[0]).join("") || "S"}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">{review.server?.user?.full_name || "Unknown Server"}</div>
                                                <div className="text-xs text-muted mt-0.5">Server Profile ID #{review.server_id}</div>
                                            </div>
                                        </div>
                                        {ratingBadge}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star 
                                                    key={idx} 
                                                    size={16} 
                                                    className={`${
                                                        idx < review.rating 
                                                            ? "text-warning fill-warning" 
                                                            : "text-line"
                                                    }`} 
                                                />
                                            ))}
                                        </div>

                                        <p className="text-sm text-text-main leading-relaxed font-medium">
                                            {review.comment || <span className="italic text-muted">No review comments provided by customer.</span>}
                                        </p>
                                    </div>

                                    <div className="text-xs font-semibold text-muted tracking-wider pt-4 border-t border-line">
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
