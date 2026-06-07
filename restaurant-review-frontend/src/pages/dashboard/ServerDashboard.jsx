import { useEffect, useState } from "react";
import { BarChart3, Phone, Star, ThumbsUp } from "lucide-react";
import axiosClient from "../../api/axios";

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

    const totalReviews = reviews.length;
    const positiveReviews = reviews.filter((review) => review.rating >= 4).length;
    const averageRating = totalReviews
        ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(1)
        : "0.0";

    return (
        <div className="page">
            <header className="page-header">
                <div className="page-title">
                    <h1>Your dashboard</h1>
                    <p>See your profile and the latest guest feedback.</p>
                </div>
            </header>

            {error && !loading && <div className="alert">{error}</div>}

            <section className="stats-grid">
                <div className="stat-card">
                    <div>
                        <span>Total reviews</span>
                        <strong>{loading ? "..." : totalReviews}</strong>
                    </div>
                    <div className="icon-tile"><BarChart3 size={24} /></div>
                </div>
                <div className="stat-card">
                    <div>
                        <span>Average rating</span>
                        <strong>{loading ? "..." : averageRating}</strong>
                    </div>
                    <div className="icon-tile"><Star size={24} /></div>
                </div>
                <div className="stat-card">
                    <div>
                        <span>Positive reviews</span>
                        <strong>{loading ? "..." : positiveReviews}</strong>
                    </div>
                    <div className="icon-tile"><ThumbsUp size={24} /></div>
                </div>
                <div className="stat-card">
                    <div>
                        <span>Phone</span>
                        <strong style={{ fontSize: "1.2rem" }}>{loading ? "..." : server?.phone || "None"}</strong>
                    </div>
                    <div className="icon-tile"><Phone size={24} /></div>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Recent reviews</h2>
                        <p className="panel-subtitle">
                            {server?.user?.full_name ? `Feedback for ${server.user.full_name}` : "Your newest guest comments"}
                        </p>
                    </div>
                </div>

                <div style={{ padding: 18 }}>
                    {loading ? (
                        <div className="loading-state">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="empty-state">You have no reviews yet.</div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.slice(0, 6).map((review) => (
                                <article className="review-card" key={review.id}>
                                    <div className="review-card-top">
                                        <strong>Review #{review.id}</strong>
                                        <span className={`rating-pill ${review.rating >= 4 ? "good" : review.rating >= 3 ? "neutral" : "bad"}`}>
                                            <Star size={14} fill="currentColor" />
                                            {review.rating ?? 0}/5
                                        </span>
                                    </div>
                                    <p className="muted" style={{ margin: 0 }}>
                                        {review.comment || "No comment provided."}
                                    </p>
                                    <p className="panel-subtitle">
                                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ServerDashboard;
