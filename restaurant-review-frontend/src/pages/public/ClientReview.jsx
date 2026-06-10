import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Send, Star, UtensilsCrossed } from "lucide-react";
import axiosClient from "../../api/axios";

const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent",
};

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    const preview = hovered || value;

    return (
        <div className="stars" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    className={`star-button ${preview >= star ? "is-active" : ""}`}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    title={`${star} star${star > 1 ? "s" : ""}`}
                >
                    <Star size={25} fill={preview >= star ? "currentColor" : "none"} />
                </button>
            ))}
        </div>
    );
}

function CenteredState({ icon, title, children }) {
    return (
        <div className="centered-state">
            <div className="centered-card panel">
                <div className="icon-tile" style={{ margin: "0 auto 16px" }}>{icon}</div>
                <h2>{title}</h2>
                <p className="muted">{children}</p>
            </div>
        </div>
    );
}

function ClientReview() {
    const { token } = useParams();
    const [serverInfo, setServerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ rating: 0, comment: "" });

    useEffect(() => {
        const fetchServer = async () => {
            try {
                const response = await axiosClient.get(`/review/${token}`);
                setServerInfo(response.data);
            } catch (e) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchServer();
    }, [token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
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

    if (loading) {
        return <CenteredState icon={<Star size={24} />} title="Loading">Preparing your review form.</CenteredState>;
    }

    if (notFound) {
        return (
            <CenteredState icon={<Star size={24} />} title="Invalid QR code">
                This NFC card is invalid or deactivated. Please ask your server for help.
            </CenteredState>
        );
    }

    if (submitted) {
        return (
            <CenteredState icon={<CheckCircle size={26} />} title="Thank you">
                Your {form.rating}-star review has been submitted.
            </CenteredState>
        );
    }

    return (
        <div className="review-page">
            <div className="review-shell">
                <header className="review-hero">
                    <div className="brand-mark" style={{ margin: "0 auto" }}>
                        <UtensilsCrossed size={22} />
                    </div>
                    <p className="panel-subtitle" style={{ color: "#b8c8dd" }}>Rate your experience with</p>
                    <h1>{serverInfo?.server_name}</h1>
                </header>

                <form className="review-form" onSubmit={handleSubmit}>
                    <div style={{ textAlign: "center", marginBottom: 18 }}>
                        <strong>Your rating</strong>
                        <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
                        <span className="muted">{form.rating ? ratingLabels[form.rating] : "Tap a star to begin"}</span>
                    </div>

                    <div className="field">
                        <label htmlFor="comment">Comment</label>
                        <textarea
                            className="textarea"
                            id="comment"
                            value={form.comment}
                            onChange={(event) => setForm({ ...form, comment: event.target.value })}
                            placeholder="Tell us about your visit..."
                        />
                    </div>

                    {error && <div className="alert">{error}</div>}

                    <button className="button full" type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit review"}
                        {!submitting && <Send size={17} />}
                    </button>
                </form>
            </div>
            <p className="muted">Powered by Revio</p>
        </div>
    );
}

export default ClientReview;
