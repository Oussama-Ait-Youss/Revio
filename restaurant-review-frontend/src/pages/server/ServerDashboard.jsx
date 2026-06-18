import { useEffect, useState } from "react";
import { CreditCard, Loader2, MessageSquare, RefreshCw, Star } from "lucide-react";
import axiosClient from "../../api/axios";

function ServerDashboard() {
    const [server, setServer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchMyReviews = async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError("");
        try {
            const response = await axiosClient.get("/my-reviews");
            setServer(response.data.server);
            setReviews(response.data.reviews || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your performance.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyReviews();
    }, []);

    if (loading) {
        return (
            <div className="server-loading">
                <Loader2 size={30} className="animate-spin text-primary" />
                <span>Loading your performance...</span>
            </div>
        );
    }

    const reviewCount = reviews.length;
    const averageRating = reviewCount
        ? (reviews.reduce((total, review) => total + Number(review.rating), 0) / reviewCount).toFixed(1)
        : "—";

    return (
        <div className="server-dashboard">
            <section className="server-welcome">
                <div>
                    <span className="server-eyebrow">Personal performance</span>
                    <h1>Hello, {server?.user?.full_name?.split(" ")[0] || "Server"}</h1>
                    <p>Your newest guest feedback, without the dashboard clutter.</p>
                </div>
                <button className="server-icon-button" type="button" aria-label="Refresh reviews" onClick={() => fetchMyReviews(true)} disabled={refreshing}>
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
            </section>

            {error && <div className="alert">{error}</div>}

            <section className="server-metrics">
                <article className="server-metric-card">
                    <span><MessageSquare size={17} /> My Reviews Count</span>
                    <strong>{reviewCount}</strong>
                </article>
                <article className="server-metric-card featured">
                    <span><Star size={17} /> My Average Star Rating</span>
                    <strong>{averageRating}<small>/5</small></strong>
                </article>
            </section>

            <div className={`server-card-status ${server?.nfc_card ? "connected" : ""}`}>
                <CreditCard size={17} />
                {server?.nfc_card ? `Card ${server.nfc_card.uid} connected` : "No NFC card connected"}
            </div>

            <section className="server-feedback">
                <div className="server-section-heading">
                    <span className="server-eyebrow">Guest voice</span>
                    <h2>Recent feedback</h2>
                </div>

                {reviews.length === 0 ? (
                    <div className="server-empty">Your guest reviews will appear here.</div>
                ) : (
                    <div className="server-review-list">
                        {reviews.map((review) => (
                            <article className="server-review-card" key={review.id}>
                                <div className="server-review-meta">
                                    <div className="server-stars" aria-label={`${review.rating} out of 5 stars`}>
                                        {[0, 1, 2, 3, 4].map((index) => (
                                            <Star key={index} size={15} className={index < review.rating ? "filled" : ""} />
                                        ))}
                                    </div>
                                    <time>{review.created_at ? new Date(review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</time>
                                </div>
                                <p>{review.comment || "Rating-only review"}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ServerDashboard;
