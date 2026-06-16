import { useState, useEffect } from "react";
import { Factory, Check, X, ShieldAlert, Package, CheckCircle2 } from "lucide-react";
import axiosClient from "../../api/axios";

export default function NfcManagement() {
    const [queue, setQueue] = useState([]);
    const [metrics, setMetrics] = useState({ total_unallocated: 0, total_distributed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [manufactureAmount, setManufactureAmount] = useState("");
    const [manufacturing, setManufacturing] = useState(false);
    
    const [processingId, setProcessingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axiosClient.get("/admin/nfc/requests-queue", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQueue(res.data.requests || []);
            setMetrics(res.data.metrics || { total_unallocated: 0, total_distributed: 0 });
        } catch (e) {
            console.error("Failed to fetch NFC queue", e);
            setError("Failed to load requests queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleManufacture = async () => {
        const qty = parseInt(manufactureAmount, 10);
        if (isNaN(qty) || qty < 1) return;
        
        setManufacturing(true);
        try {
            const token = localStorage.getItem('token');
            await axiosClient.post("/admin/nfc/manufacture", { quantity: qty }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setManufactureAmount("");
            await fetchData();
        } catch (e) {
            console.error("Failed to manufacture cards", e);
            setError(e.response?.data?.message || "Failed to manufacture cards.");
        } finally {
            setManufacturing(false);
        }
    };

    const handleProcess = async (id, status) => {
        setProcessingId(id);
        try {
            const token = localStorage.getItem('token');
            await axiosClient.patch(`/admin/nfc/requests/${id}/process`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (e) {
            console.error(`Failed to ${status} request`, e);
            setError(e.response?.data?.message || `Failed to ${status.toLowerCase()} request.`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="page space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>NFC Logistics & Manufacturing</h1>
                    <p>Manage raw NFC card factory production and fulfill venue requests.</p>
                </div>
            </div>

            {error && (
                <div className="alert">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Top Modules: Manufacture + KPI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Module 1: Master Manufacturing Control Card */}
                <div className="panel p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary-soft">
                            <Factory size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-text-main">Factory Controls</h2>
                    </div>
                    
                    <div className="flex gap-4">
                        <input 
                            type="number" 
                            min="1" 
                            placeholder="Enter block count (e.g. 50)" 
                            value={manufactureAmount}
                            onChange={(e) => setManufactureAmount(e.target.value)}
                            className="flex-1 px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-text-main"
                            disabled={manufacturing}
                        />
                        <button 
                            onClick={handleManufacture}
                            disabled={manufacturing || !manufactureAmount || parseInt(manufactureAmount) < 1}
                            className="button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {manufacturing ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Manufacturing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    ⚙️ Manufacture Serial Blocks
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* KPI Tracker */}
                <div className="panel p-6 flex items-center justify-around">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-success-soft text-success flex items-center justify-center mb-3">
                            <Package size={24} />
                        </div>
                        <p className="text-xs font-semibold text-muted tracking-widest uppercase">Unallocated Stock</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{metrics.total_unallocated}</p>
                    </div>
                    <div className="w-px h-16 bg-line"></div>
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary-soft text-primary flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-xs font-semibold text-muted tracking-widest uppercase">Distributed Worldwide</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{metrics.total_distributed}</p>
                    </div>
                </div>

            </div>

            {/* Module 2: Incoming Logistics Queue */}
            <section className="panel mt-8">
                <div className="p-5 border-b border-line flex items-center justify-between bg-surface-muted/30">
                    <h2 className="text-lg font-bold text-text-main">Incoming Logistics Queue</h2>
                </div>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Venue Name</th>
                                <th>Requested Count</th>
                                <th>Request Date</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="loading-state">
                                        Loading logistics queue...
                                    </td>
                                </tr>
                            ) : queue.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="empty-state">
                                        No pending requests in the queue.
                                    </td>
                                </tr>
                            ) : (
                                queue.map((req) => (
                                    <tr key={req.id}>
                                        <td className="font-semibold text-text-main">
                                            {req.restaurant?.name || `Restaurant ID: ${req.restaurant_id}`}
                                        </td>
                                        <td>
                                            <span className="font-bold text-primary">{req.quantity} Cards</span>
                                        </td>
                                        <td className="text-muted">
                                            {new Date(req.created_at).toLocaleString()}
                                        </td>
                                        <td className="text-right">
                                            {processingId === req.id ? (
                                                <div className="flex justify-end pr-4">
                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleProcess(req.id, 'APPROVED')}
                                                        className="p-2 bg-success-soft hover:bg-success text-success hover:text-white rounded-lg transition-colors"
                                                        title="Approve & Allocate"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcess(req.id, 'REJECTED')}
                                                        className="p-2 bg-danger-soft hover:bg-danger text-danger hover:text-white rounded-lg transition-colors"
                                                        title="Refuse Request"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
