import { useState } from "react";
import axiosClient from "../../api/axios";
import PortalModal from "./PortalModal";
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
            await axiosClient.post("/manager/nfc-requests", { quantity, notes }, {
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
        <PortalModal title="Request NFC Cards" onClose={onClose}>
            {error && <div className="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label>Quantity (1-50)</label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="input"
                    />
                </div>
                
                <div className="field">
                    <label>Notes (Optional)</label>
                    <textarea
                        maxLength={500}
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reason for request..."
                        className="textarea"
                    />
                </div>

                <div className="form-actions mt-6">
                    <button type="button" onClick={onClose} className="button secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="button">
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </PortalModal>
    );
}
