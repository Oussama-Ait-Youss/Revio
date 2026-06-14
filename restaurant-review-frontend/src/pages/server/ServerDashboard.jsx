import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Star, LogOut, Sun, Moon, CreditCard, RefreshCw, Loader2, Sparkles, MessageSquare } from "lucide-react";

function ServerDashboard() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [server, setServer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyReviews = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.get("/my-reviews", { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setServer(response.data.server);
            setReviews(response.data.reviews || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to load dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await axiosClient.post("/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Logout error", e);
        }
        logout();
        navigate("/");
    };

    // Calculate metrics
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : "—";

    const isCardConnected = server?.nfc_card ? true : false;

    if (loading) {
        return (
            <div className="loading-state h-screen bg-bg">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading your numbers...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg text-text-main flex flex-col font-sans transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full bg-surface border-b border-line shadow-sm transition-colors duration-300">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Sparkles size={16} className="text-bg" />
                        </div>
                        <span className="font-serif font-bold tracking-wider text-base text-text-main">
                            REVIO
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchMyReviews(true)}
                            disabled={refreshing}
                            className="p-2 text-muted hover:text-text-main rounded-lg cursor-pointer"
                        >
                            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-muted hover:text-text-main rounded-lg cursor-pointer"
                        >
                            {theme === "dark" ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-danger hover:text-danger rounded-lg cursor-pointer"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile View Container */}
            <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 space-y-6">
                
                {/* User Greeting & Card Connection Badge */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-text-main">
                            Hello, {server?.user?.full_name?.split(" ")[0] || "Server"}
                        </h1>
                        <p className="text-xs text-muted mt-0.5">Track your customer reviews below</p>
                    </div>

                    {isCardConnected ? (
                        <span className="rating-pill good">
                            <CreditCard size={12} />
                            Connected
                        </span>
                    ) : (
                        <span className="rating-pill bad">
                            <CreditCard size={12} />
                            No Card Linked
                        </span>
                    )}
                </div>

                {error && (
                    <div className="alert">
                        {error}
                    </div>
                )}

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Average Rating Card */}
                    <div className="panel padded hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1.5 text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                            <Star size={14} className="text-warning fill-warning" />
                            Avg Rating
                        </div>
                        <h3 className="text-3xl font-extrabold text-text-main">
                            {avgRating} <span className="text-xs text-muted font-normal">/ 5</span>
                        </h3>
                    </div>

                    {/* Total Reviews Card */}
                    <div className="panel padded hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1.5 text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                            <MessageSquare size={14} className="text-primary" />
                            Total Reviews
                        </div>
                        <h3 className="text-3xl font-extrabold text-text-main">
                            {totalReviews}
                        </h3>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                        Recent Feedback Feed
                    </h2>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {reviews.length === 0 ? (
                            <div className="panel padded text-center text-muted">
                                No customer reviews recorded yet. Tap cards to collect reviews!
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    className="panel padded space-y-2.5 transform hover:scale-[1.01] transition-transform duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Stars */}
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    className={`${
                                                        i < review.rating 
                                                            ? "text-warning fill-warning" 
                                                            : "text-line"
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                                            {review.created_at ? new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-main leading-relaxed font-medium">
                                        {review.comment || <span className="italic text-muted">"Rating only review"</span>}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

export default ServerDashboard;
