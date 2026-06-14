import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function RequestCardsModal({ isOpen, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("/api/manager/nfc-requests", { quantity, notes }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onSuccess(); // Close and refresh
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
            <div style={{
                background: "#fff", borderRadius: "12px", padding: "2rem",
                width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                fontFamily: "sans-serif"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "#0f0f0f" }}>Request NFC Cards</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>
                        <X size={20} />
                    </button>
                </div>
                
                {error && (
                    <div style={{ marginBottom: "1rem", padding: "12px", background: "#fce8e8", color: "#a32d2d", borderRadius: "8px", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Quantity (1-50)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            style={{
                                width: "100%", padding: "10px 14px", border: "1px solid #ddd",
                                borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                                fontFamily: "sans-serif",
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Notes (Optional)
                        </label>
                        <textarea
                            maxLength={500}
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reason for request..."
                            style={{
                                width: "100%", padding: "10px 14px", border: "1px solid #ddd",
                                borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                                fontFamily: "sans-serif", resize: "vertical"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 18px", border: "1px solid #ddd", borderRadius: "8px",
                                background: "#fff", cursor: "pointer", fontSize: "14px", color: "#555"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "10px 18px", border: "none", borderRadius: "8px",
                                background: "#0f0f0f", color: "#c9a96e", cursor: loading ? "not-allowed" : "pointer", 
                                fontSize: "14px", fontWeight: 600, opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
