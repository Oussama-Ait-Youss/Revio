import { useEffect, useState } from "react";
import { Check, Clock, CreditCard, Loader2, Package, Plus, ShieldAlert, UserRound } from "lucide-react";
import axiosClient from "../../api/axios";
import RequestCardsModal from "../../components/modals/RequestCardsModal";

export default function NfcCards() {
    const [requests, setRequests] = useState([]);
    const [cards, setCards] = useState([]);
    const [servers, setServers] = useState([]);
    const [metrics, setMetrics] = useState({ total_active: 0, available_inventory: 0, pending_requests: 0 });
    const [selection, setSelection] = useState({});
    const [assigning, setAssigning] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [inventoryResponse, cardsResponse, serversResponse] = await Promise.all([
                axiosClient.get("/manager/nfc-requests"),
                axiosClient.get("/nfc-cards"),
                axiosClient.get("/servers"),
            ]);
            setRequests(inventoryResponse.data.requests || []);
            setMetrics(inventoryResponse.data.metrics || {});
            setCards(cardsResponse.data.data || []);
            setServers((serversResponse.data.data || []).filter((server) => server.is_active && server.server));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load NFC inventory.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const assignCard = async (cardId) => {
        const serverId = selection[cardId];
        if (!serverId) return;

        setAssigning(cardId);
        setError("");
        try {
            await axiosClient.post(`/nfc-cards/${cardId}/assign`, { server_id: Number(serverId) });
            setSelection((current) => ({ ...current, [cardId]: "" }));
            await fetchData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to assign this card.");
        } finally {
            setAssigning(null);
        }
    };

    const statusBadge = (status) => (
        <span className={`status-pill ${status === "APPROVED" ? "active" : status === "REJECTED" ? "inactive" : "neutral"}`}>
            {status}
        </span>
    );

    return (
        <div className="page space-y-6">
            <div className="page-header">
                <div className="page-title">
                    <h1>NFC Inventory</h1>
                    <p>Link available restaurant cards directly to active employee profiles.</p>
                </div>
                <button className="button" type="button" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Request cards
                </button>
            </div>

            {error && <div className="alert"><ShieldAlert size={16} /> {error}</div>}

            <div className="stats-grid compact-stats">
                <Metric icon={CreditCard} label="Assigned cards" value={metrics.total_active || 0} />
                <Metric icon={Package} label="Available stock" value={metrics.available_inventory || 0} />
                <Metric icon={Clock} label="Pending requests" value={metrics.pending_requests || 0} />
            </div>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Card records</h2>
                        <p className="panel-subtitle">Only unassigned stock can be mapped to an employee.</p>
                    </div>
                </div>
                <div className="table-wrap responsive-table border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr><th>Card UID</th><th>Status</th><th>Employee</th><th>Assignment</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="loading-state">Loading cards...</td></tr>
                            ) : cards.length === 0 ? (
                                <tr><td colSpan={4} className="empty-state">No cards have been distributed to this restaurant.</td></tr>
                            ) : cards.map((card) => (
                                <tr key={card.id}>
                                    <td data-label="Card UID"><span className="code-pill">{card.uid}</span></td>
                                    <td data-label="Status">
                                        <span className={`status-pill ${card.is_active ? "active" : "inactive"}`}>
                                            {card.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td data-label="Employee">
                                        {card.server?.user?.full_name ? (
                                            <span className="identity"><UserRound size={16} /> {card.server.user.full_name}</span>
                                        ) : <span className="muted">Unassigned</span>}
                                    </td>
                                    <td data-label="Assignment">
                                        {card.server_id ? (
                                            <span className="muted text-sm">Already linked</span>
                                        ) : (
                                            <div className="inline-assignment">
                                                <select
                                                    className="select"
                                                    aria-label={`Employee for card ${card.uid}`}
                                                    value={selection[card.id] || ""}
                                                    onChange={(event) => setSelection((current) => ({ ...current, [card.id]: event.target.value }))}
                                                >
                                                    <option value="">Select active employee</option>
                                                    {servers.map((employee) => (
                                                        <option key={employee.server.id} value={employee.server.id}>
                                                            {employee.full_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="button"
                                                    type="button"
                                                    disabled={!selection[card.id] || assigning === card.id || !card.is_active}
                                                    onClick={() => assignCard(card.id)}
                                                >
                                                    {assigning === card.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    Assign
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header"><h2>Recent card requests</h2></div>
                <div className="table-wrap responsive-table border-0 rounded-none">
                    <table className="data-table">
                        <thead><tr><th>Date</th><th>Quantity</th><th>Status</th><th>Notes</th></tr></thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr><td colSpan={4} className="empty-state">No card requests yet.</td></tr>
                            ) : requests.map((request) => (
                                <tr key={request.id}>
                                    <td data-label="Date">{new Date(request.created_at).toLocaleDateString()}</td>
                                    <td data-label="Quantity">{request.quantity}</td>
                                    <td data-label="Status">{statusBadge(request.status)}</td>
                                    <td data-label="Notes" className="muted">{request.notes || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <RequestCardsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }}
            />
        </div>
    );
}

function Metric({ icon: Icon, label, value }) {
    return (
        <div className="stat-card">
            <div><span>{label}</span><strong>{value}</strong></div>
            <div className="icon-tile grid place-items-center"><Icon size={24} /></div>
        </div>
    );
}
