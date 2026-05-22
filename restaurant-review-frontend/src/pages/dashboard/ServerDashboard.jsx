import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { Star, BarChart3, Users } from "lucide-react";

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
    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const negativeReviews = totalReviews - positiveReviews;

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ flex: "1 1 260px", background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem", color: "#0f0f0f" }}>
                        <BarChart3 size={20} />
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Your Stats</h2>
                    </div>
                    {loading ? (
                        <p style={{ color: "#888" }}>Loading stats...</p>
                    ) : server ? (
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            <div style={{ color: "#555" }}><strong>Name:</strong> {server.user?.full_name || "Unknown"}</div>
                            <div style={{ color: "#555" }}><strong>Phone:</strong> {server.phone || "—"}</div>
                            <div style={{ color: "#555" }}><strong>Total reviews:</strong> {server.total_reviews ?? 0}</div>
                            <div style={{ color: "#555" }}><strong>Active:</strong> {server.user?.is_active ? "Yes" : "No"}</div>
                        </div>
                    ) : (
                        <p style={{ color: "#c0392b" }}>{error || "No server profile found."}</p>
                    )}
                </div>

                <div style={{ flex: "1 1 260px", background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem", color: "#0f0f0f" }}>
                        <Star size={20} />
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Review summary</h2>
                    </div>
                    {loading ? (
                        <p style={{ color: "#888" }}>Loading reviews...</p>
                    ) : (
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            <div style={{ color: "#555" }}><strong>Total reviews:</strong> {totalReviews}</div>
                            <div style={{ color: "#555" }}><strong>Positive:</strong> {positiveReviews}</div>
                            <div style={{ color: "#555" }}><strong>Negative:</strong> {negativeReviews}</div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem", color: "#0f0f0f" }}>
                    <Users size={20} />
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Recent reviews</h2>
                </div>
                {loading ? (
                    <p style={{ color: "#888" }}>Loading reviews...</p>
                ) : error ? (
                    <p style={{ color: "#c0392b" }}>{error}</p>
                ) : reviews.length === 0 ? (
                    <p style={{ color: "#888" }}>You have no reviews yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {reviews.slice(0, 5).map(review => (
                            <div key={review.id} style={{ padding: "1rem", borderRadius: "12px", background: "#f8f8f8" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: 600, color: "#0f0f0f" }}>Review #{review.id}</span>
                                    <span style={{ color: "#555" }}>{review.rating ?? "—"}/5</span>
                                </div>
                                <p style={{ margin: 0, color: "#555" }}>{review.comment || "No comment provided."}</p>
                                <div style={{ marginTop: "0.75rem", fontSize: "12px", color: "#999" }}>
                                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ServerDashboard;
