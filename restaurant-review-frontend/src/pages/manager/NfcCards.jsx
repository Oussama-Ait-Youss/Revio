import { useState, useEffect } from "react";
import { Plus, CreditCard, Package, Clock, ShieldAlert } from "lucide-react";
import axiosClient from "../../api/axios";
import RequestCardsModal from "../../components/modals/RequestCardsModal";

export default function NfcCards() {
    const [requests, setRequests] = useState([]);
    const [metrics, setMetrics] = useState({
        total_active: 0,
        available_inventory: 0,
        pending_requests: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axiosClient.get("/manager/nfc-requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.requests || []);
            setMetrics(res.data.metrics || {
                total_active: 0,
                available_inventory: 0,
                pending_requests: 0
            });
        } catch (e) {
            console.error("Failed to fetch NFC data", e);
            setError("Failed to load inventory data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const getStatusBadge = (status) => {
        let styleClass = "neutral";
        if (status === "PENDING") {
            styleClass = "warning";
        } else if (status === "APPROVED") {
            styleClass = "success";
        } else if (status === "REJECTED") {
            styleClass = "danger";
        }

        return (
            <span className={`status-pill ${styleClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="page space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>NFC Cards Inventory</h1>
                    <p>Manage your restaurant's NFC cards and orders</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="button"
                >
                    <Plus size={18} /> Request Cards from Admin
                </button>
            </div>

            {error && (
                <div className="alert">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0 shadow-sm border border-success-soft">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted tracking-wider uppercase">Active Cards</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{metrics.total_active}</p>
                    </div>
                </div>

                <div className="panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary-soft">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted tracking-wider uppercase">Available Inventory</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{metrics.available_inventory}</p>
                    </div>
                </div>

                <div className="panel p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0 shadow-sm border border-warning-soft">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted tracking-wider uppercase">Pending Requests</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{metrics.pending_requests}</p>
                    </div>
                </div>
            </div>

            {/* Request History Section */}
            <section className="panel mt-8">
                <div className="p-5 border-b border-line flex items-center justify-between bg-surface-muted/30">
                    <h2 className="text-lg font-bold text-text-main flex items-center gap-2">Recent Card Orders</h2>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request Date</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="loading-state">
                                        Loading inventory history...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="empty-state">
                                        No requests found. Click the button above to request inventory.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="text-muted font-medium">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span className="font-bold text-text-main">{req.quantity} Cards</span>
                                        </td>
                                        <td>
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="text-muted max-w-[250px] truncate" title={req.notes}>
                                            {req.notes || "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal */}
            <RequestCardsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleModalSuccess} 
            />
        </div>
    );
}
