import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import RequestCardsModal from "../../components/modals/RequestCardsModal";

export default function NfcCards() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/manager/nfc-requests", {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequests(res.data);
        } catch (e) {
            console.error("Failed to fetch NFC requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchRequests();
    };

    const getStatusBadge = (status) => {
        let bg = "#f0f0f0";
        let color = "#555";
        
        if (status === "PENDING") {
            bg = "#fff4e5";
            color = "#b26500";
        } else if (status === "APPROVED") {
            bg = "#eaf3de";
            color = "#3b6d11";
        } else if (status === "REJECTED") {
            bg = "#fce8e8";
            color = "#a32d2d";
        }

        return (
            <span style={{
                background: bg, color: color, padding: "4px 10px", 
                borderRadius: "20px", fontSize: "12px", fontWeight: 600
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ padding: "2rem", height: "100%", boxSizing: "border-box", fontFamily: "sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0, color: "#0f0f0f" }}>NFC Cards Fleet</h1>
                    <p style={{ color: "#888", fontSize: "14px", margin: "4px 0 0" }}>Manage your restaurant's NFC cards and orders</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "#0f0f0f", color: "#c9a96e", border: "none",
                        padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
                        fontSize: "14px", fontFamily: "sans-serif", fontWeight: 600
                    }}
                >
                    <Plus size={16} /> Request Cards from Admin
                </button>
            </div>

            {/* Request History Section */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f0f0f", marginBottom: "1rem", marginTop: "2rem" }}>Recent Card Orders</h2>
            
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#fafaf8", borderBottom: "1px solid #eee" }}>
                            {["Request Date", "Quantity", "Status", "Notes"].map(h => (
                                <th key={h} style={{
                                    padding: "12px 16px", textAlign: "left",
                                    fontSize: "12px", color: "#888", fontWeight: 500,
                                    letterSpacing: "0.05em", textTransform: "uppercase",
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
                                    Loading history...
                                </td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
                                    No requests found.
                                </td>
                            </tr>
                        ) : (
                            requests.map((req, i) => (
                                <tr key={req.id} style={{
                                    borderBottom: i < requests.length - 1 ? "1px solid #f0f0f0" : "none",
                                    transition: "background 0.1s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafaf8"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "14px 16px", color: "#555" }}>
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "14px 16px", color: "#0f0f0f", fontWeight: 500 }}>
                                        {req.quantity}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td style={{ padding: "14px 16px", color: "#555", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {req.notes || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <RequestCardsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleModalSuccess} 
            />
        </div>
    );
}
