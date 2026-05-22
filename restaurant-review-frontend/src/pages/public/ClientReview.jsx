import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, UtensilsCrossed, CheckCircle } from "lucide-react";
import axiosClient from "../../api/axios";

function StarRating({ value, onChange, size = 36 }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "transform 0.1s",
                        transform: hovered >= star ? "scale(1.15)" : "scale(1)",
                    }}
                >
                    <Star
                        size={size}
                        fill={(hovered || value) >= star ? "#c9a96e" : "none"}
                        color={(hovered || value) >= star ? "#c9a96e" : "#ddd"}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

function ClientReview() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [serverInfo, setServerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        rating: 0,
        comment: "",
    });

    useEffect(() => {
        const fetchServer = async () => {
            try {
                const res = await axiosClient.get(`/review/${token}`);
                setServerInfo(res.data);
            } catch (e) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchServer();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.rating === 0) {
            setError("Please select a rating.");
            return;
        }

        setSubmitting(true);
        try {
            await axiosClient.post("/review", {
                server_id: serverInfo.server_id,
                rating: form.rating,
                comment: form.comment,
            });
            setSubmitted(true);
        } catch (e) {
            setError(e.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent",
    };

    // Loading
    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: "#fafaf8",
            }}>
                <p style={{ color: "#888", fontFamily: "sans-serif" }}>Loading...</p>
            </div>
        );
    }

    // Not found
    if (notFound) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "#fafaf8",
                fontFamily: "sans-serif", padding: "2rem", textAlign: "center",
            }}>
                <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    background: "#fce8e8", display: "flex", alignItems: "center",
                    justifyContent: "center", marginBottom: "1.5rem",
                }}>
                    <Star size={28} color="#c0392b" />
                </div>
                <h2 style={{ fontSize: "1.3rem", color: "#0f0f0f", margin: "0 0 0.5rem" }}>
                    Invalid QR Code
                </h2>
                <p style={{ color: "#888", fontSize: "14px", maxWidth: "300px" }}>
                    This NFC card is invalid or has been deactivated. Please ask your server for assistance.
                </p>
            </div>
        );
    }

    // Success
    if (submitted) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "#fafaf8",
                fontFamily: "sans-serif", padding: "2rem", textAlign: "center",
            }}>
                <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "#eaf3de", display: "flex", alignItems: "center",
                    justifyContent: "center", marginBottom: "1.5rem",
                }}>
                    <CheckCircle size={36} color="#3b6d11" />
                </div>
                <h2 style={{ fontSize: "1.5rem", color: "#0f0f0f", margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
                    Thank you!
                </h2>
                <p style={{ color: "#888", fontSize: "15px", maxWidth: "300px", lineHeight: 1.6 }}>
                    Your review has been submitted. We appreciate your feedback!
                </p>
                <div style={{
                    marginTop: "2rem", padding: "12px 24px",
                    background: "#0f0f0f", color: "#c9a96e",
                    borderRadius: "8px", fontSize: "14px",
                }}>
                    {[...Array(form.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#c9a96e" color="#c9a96e" style={{ display: "inline" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh", background: "#fafaf8",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "2rem", fontFamily: "sans-serif",
        }}>
            <div style={{
                width: "100%", maxWidth: "480px",
                background: "#fff", borderRadius: "16px",
                boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    background: "#0f0f0f", padding: "2rem",
                    textAlign: "center",
                }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "10px",
                        background: "#c9a96e", display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 1rem",
                    }}>
                        <UtensilsCrossed size={24} color="#0f0f0f" />
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>
                        Rate your experience with
                    </p>
                    <h1 style={{ color: "#fff", fontSize: "1.5rem", margin: 0, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
                        {serverInfo?.server_name}
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>

                    {/* Star Rating */}
                    <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                        <p style={{
                            fontSize: "12px", color: "#888", letterSpacing: "0.1em",
                            textTransform: "uppercase", marginBottom: "1rem",
                        }}>
                            Your Rating
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
                            <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                        </div>
                        {form.rating > 0 && (
                            <span style={{
                                fontSize: "13px", color: "#c9a96e", fontWeight: 500,
                            }}>
                                {ratingLabels[form.rating]}
                            </span>
                        )}
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{
                            display: "block", fontSize: "12px", color: "#555",
                            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px",
                        }}>
                            Comment <span style={{ color: "#bbb", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                        </label>
                        <textarea
                            value={form.comment}
                            onChange={e => setForm({ ...form, comment: e.target.value })}
                            placeholder="Tell us about your experience..."
                            rows={4}
                            style={{
                                width: "100%", padding: "12px 14px",
                                border: "1px solid #ddd", borderRadius: "8px",
                                fontSize: "14px", resize: "vertical", outline: "none",
                                fontFamily: "sans-serif", boxSizing: "border-box",
                                lineHeight: 1.6, color: "#0f0f0f",
                            }}
                            onFocus={e => e.target.style.borderColor = "#c9a96e"}
                            onBlur={e => e.target.style.borderColor = "#ddd"}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "#fff0f0", border: "1px solid #fcc",
                            borderRadius: "8px", padding: "10px 14px",
                            color: "#c0392b", fontSize: "13px", marginBottom: "1rem",
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: "100%", padding: "14px",
                            background: submitting ? "#888" : "#0f0f0f",
                            color: "#fff", border: "none", borderRadius: "8px",
                            fontSize: "14px", letterSpacing: "0.06em",
                            cursor: submitting ? "not-allowed" : "pointer",
                            fontFamily: "sans-serif", transition: "background 0.2s",
                        }}
                        onMouseEnter={e => { if (!submitting) e.target.style.background = "#c9a96e" }}
                        onMouseLeave={e => { if (!submitting) e.target.style.background = "#0f0f0f" }}
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>

                </form>
            </div>

            <p style={{ color: "#bbb", fontSize: "12px", marginTop: "1.5rem" }}>
                Powered by Revio
            </p>
        </div>
    );
}

export default ClientReview;