import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axios";
import { Star, BarChart3, Users, TrendingUp, Clock } from "lucide-react";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function ServerDashboard() {
    const [server, setServer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMyReviews = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axiosClient.get("/my-reviews", { headers: headers() });
                setServer(response.data.server);
                setReviews(response.data.reviews || []);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

    const reviewStats = useMemo(() => {
        const total = reviews.length;
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        let lastDate = null;

        reviews.forEach(review => {
            const rating = Number(review.rating) || 0;
            if (rating >= 1 && rating <= 5) counts[rating] += 1;
            sum += rating;
            if (review.created_at) {
                const date = new Date(review.created_at);
                if (!lastDate || date > lastDate) lastDate = date;
            }
        });

        return {
            total,
            positive: reviews.filter(r => Number(r.rating) >= 4).length,
            negative: reviews.filter(r => Number(r.rating) <= 3).length,
            average: total ? (sum / total).toFixed(1) : "0.0",
            lastReview: lastDate ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(lastDate) : "N/A",
            counts,
        };
    }, [reviews]);

    const metricCards = [
        {
            title: "Total Reviews",
            value: reviewStats.total,
            icon: <BarChart3 size={18} color="#c9a96e" />,
            subtitle: "Reviews received so far",
        },
        {
            title: "Average Rating",
            value: reviewStats.average,
            icon: <Star size={18} color="#c9a96e" />,
            subtitle: "Based on all submitted reviews",
        },
        {
            title: "Positive Feedback",
            value: reviewStats.positive,
            icon: <TrendingUp size={18} color="#c9a96e" />,
            subtitle: "4★ and 5★ reviews",
        },
        {
            title: "Last Review",
            value: reviewStats.lastReview,
            icon: <Clock size={18} color="#c9a96e" />,
            subtitle: "Most recent feedback date",
        },
    ];

    const ratingBars = Object.entries(reviewStats.counts).map(([rating, count]) => {
        const width = reviewStats.total ? `${Math.round((count / reviewStats.total) * 100)}%` : "0%";
        return { rating, count, width };
    });

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: "1 1 520px", minWidth: "320px", background: "#fff", borderRadius: "22px", padding: "2rem", boxShadow: "0 18px 45px rgba(15,15,15,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <p style={{ margin: 0, color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.78rem" }}>Server portal</p>
                            <h1 style={{ margin: "8px 0 0", fontSize: "2rem", color: "#111" }}>Personal analytics</h1>
                            <p style={{ margin: "10px 0 0", color: "#666", maxWidth: "520px" }}>
                                Track your service performance, ratings, and review history in one place.
                            </p>
                        </div>
                        <div style={{ background: "#faf3dc", borderRadius: "16px", padding: "16px 20px", minWidth: "130px", textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#a67c2a", fontSize: "0.82rem" }}>Server</p>
                            <p style={{ margin: "8px 0 0", fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>REVIO</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                        {metricCards.map((card, index) => (
                            <div key={index} style={{ background: "#f8f8f8", borderRadius: "18px", padding: "1.25rem", minHeight: "130px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(201,169,110,0.12)", display: "grid", placeItems: "center" }}>
                                        {card.icon}
                                    </div>
                                    <div style={{ color: "#555", fontSize: "0.95rem", fontWeight: 600 }}>{card.title}</div>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "#111" }}>{card.value}</p>
                                    <p style={{ margin: "0.5rem 0 0", color: "#777", fontSize: "0.93rem" }}>{card.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: "1 1 340px", minWidth: "300px", background: "#fff", borderRadius: "22px", padding: "1.75rem", boxShadow: "0 18px 45px rgba(15,15,15,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                        <BarChart3 size={20} color="#c9a96e" />
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111" }}>Performance chart</h2>
                    </div>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {ratingBars.reverse().map(bar => (
                            <div key={bar.rating} style={{ display: "grid", gridTemplateColumns: "80px 1fr 48px", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{ color: "#555", fontWeight: 600 }}>{bar.rating}★</span>
                                <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
                                    <div style={{ width: bar.width, height: "100%", background: "linear-gradient(90deg, #c9a96e, #8a6a28)" }}></div>
                                </div>
                                <span style={{ color: "#666", fontSize: "0.95rem" }}>{bar.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1rem" }}>
                <div style={{ background: "#fff", borderRadius: "22px", padding: "1.75rem", boxShadow: "0 18px 45px rgba(15,15,15,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                        <Users size={20} color="#c9a96e" />
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111" }}>Review history</h2>
                    </div>
                    {loading ? (
                        <p style={{ color: "#888" }}>Loading reviews...</p>
                    ) : error ? (
                        <p style={{ color: "#c0392b" }}>{error}</p>
                    ) : reviews.length === 0 ? (
                        <p style={{ color: "#888" }}>You have no reviews yet.</p>
                    ) : (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {reviews.slice(0, 6).map(review => (
                                <div key={review.id} style={{ borderRadius: "18px", border: "1px solid #ece7dd", padding: "1.2rem", background: "#faf9f6" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
                                        <span style={{ fontWeight: 700, color: "#111" }}>Review #{review.id}</span>
                                        <span style={{ color: "#555", fontWeight: 600 }}>{review.rating ?? "—"}/5</span>
                                    </div>
                                    <p style={{ margin: 0, color: "#565151" }}>{review.comment || "No comment provided."}</p>
                                    <div style={{ marginTop: "0.85rem", display: "flex", justifyContent: "space-between", color: "#8d8d8d", fontSize: "0.9rem" }}>
                                        <span>{review.created_at ? new Date(review.created_at).toLocaleDateString() : "Unknown date"}</span>
                                        <span>{review.server_id ? `Server ID ${review.server_id}` : "Local review"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: "#fff", borderRadius: "22px", padding: "1.75rem", boxShadow: "0 18px 45px rgba(15,15,15,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                        <Star size={20} color="#c9a96e" />
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111" }}>Quick profile</h2>
                    </div>
                    {loading ? (
                        <p style={{ color: "#888" }}>Loading profile...</p>
                    ) : server ? (
                        <div style={{ display: "grid", gap: "0.9rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                <span>Name</span>
                                <span>{server.user?.full_name || "Unknown"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                <span>Phone</span>
                                <span>{server.phone || "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                <span>Email</span>
                                <span>{server.user?.email || "—"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                <span>Reviews</span>
                                <span>{reviewStats.total}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                                <span>Average rating</span>
                                <span>{reviewStats.average}</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: "#c0392b" }}>{error || "No profile available."}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ServerDashboard;
