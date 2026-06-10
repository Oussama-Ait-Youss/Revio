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
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 gap-3">
                <Loader2 size={36} className="animate-spin text-[#c9a96e]" />
                <span className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">Loading your numbers...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#c9a96e] rounded-lg flex items-center justify-center">
                            <Sparkles size={16} className="text-zinc-950" />
                        </div>
                        <span className="font-serif font-bold tracking-wider text-base text-zinc-950 dark:text-white">
                            REVIO
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchMyReviews(true)}
                            disabled={refreshing}
                            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-lg cursor-pointer"
                        >
                            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-lg cursor-pointer"
                        >
                            {theme === "dark" ? <Sun size={18} className="text-[#c9a96e]" /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg cursor-pointer"
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
                        <h1 className="text-xl font-bold text-zinc-950 dark:text-white">
                            Hello, {server?.user?.full_name?.split(" ")[0] || "Server"}
                        </h1>
                        <p className="text-xs text-zinc-400 mt-0.5">Track your customer reviews below</p>
                    </div>

                    {isCardConnected ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-150 dark:border-green-900/30">
                            <CreditCard size={12} />
                            Connected
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-full border border-red-150 dark:border-red-900/30">
                            <CreditCard size={12} />
                            No Card Linked
                        </span>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-red-650 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Average Rating Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            Avg Rating
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white">
                            {avgRating} <span className="text-xs text-zinc-400 font-normal">/ 5</span>
                        </h3>
                    </div>

                    {/* Total Reviews Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <MessageSquare size={14} className="text-indigo-500" />
                            Total Reviews
                        </div>
                        <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white">
                            {totalReviews}
                        </h3>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                        Recent Feedback Feed
                    </h2>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {reviews.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 dark:text-zinc-500">
                                No customer reviews recorded yet. Tap cards to collect reviews!
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2.5 transform hover:scale-[1.01] transition-transform duration-200"
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
                                                            ? "text-amber-500 fill-amber-500" 
                                                            : "text-zinc-200 dark:text-zinc-800"
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                                            {review.created_at ? new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                                        {review.comment || <span className="italic text-zinc-400">"Rating only review"</span>}
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
