import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Mail, Phone, CreditCard, Star, RefreshCw, X, Loader2, UserCheck, ShieldAlert } from "lucide-react";
import axiosClient from "../../api/axios";
import PortalModal from "../../components/modals/PortalModal";
function ServerList() {
    const [servers, setServers] = useState([]);
    const [nfcCards, setNfcCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingServer, setEditingServer] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        nfc_card_id: ""
    });

    const fetchServers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.get("/servers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServers(response.data.data || []);
            // Available (unassigned or assigned to current server) cards
            setNfcCards(response.data.nfc_cards || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch staff list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleOpenCreate = () => {
        setEditingServer(null);
        setFormData({
            full_name: "",
            email: "",
            password: "",
            phone: "",
            nfc_card_id: ""
        });
        setFormError("");
        setShowModal(true);
    };

    const handleOpenEdit = (serverUser) => {
        setEditingServer(serverUser);
        setFormData({
            full_name: serverUser.full_name,
            email: serverUser.email,
            password: "", // optional
            phone: serverUser.server?.phone || "",
            nfc_card_id: serverUser.server?.nfc_card?.id || ""
        });
        setFormError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const token = localStorage.getItem("token");
            if (editingServer) {
                // UPDATE
                await axiosClient.put(`/servers/${editingServer.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // CREATE
                await axiosClient.post("/servers", { ...formData, role: 'SERVER' }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchServers();
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || "Failed to save server.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (serverId) => {
        if (!window.confirm("Are you sure you want to delete this server account? This will unlink their NFC card.")) return;

        try {
            const token = localStorage.getItem("token");
            await axiosClient.delete(`/servers/${serverId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchServers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete server.");
        }
    };

    // Filter available cards for dropdown selection
    const getAvailableCards = () => {
        return nfcCards.filter(card => {
            if (!card.server_id) return true;
            if (editingServer && editingServer.server && card.server_id === editingServer.server.id) return true;
            return false;
        });
    };

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading server list...</span>
            </div>
        );
    }

    return (
        <div className="page space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>Servers & Staff</h1>
                    <p>Manage server profiles, link cards, and track personal review performance.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchServers} className="button secondary p-0 w-12 flex justify-center items-center">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={handleOpenCreate} className="button">
                        <Plus size={18} /> Add Server
                    </button>
                </div>
            </div>

            {error && <div className="alert">{error}</div>}

            {/* Grid/Table Layout */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Server Info</th>
                            <th>Contact Details</th>
                            <th>NFC Card Linked</th>
                            <th className="text-center">Reviews</th>
                            <th className="text-center">Avg Rating</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    No servers added yet. Add servers to distribute NFC review cards!
                                </td>
                            </tr>
                        ) : (
                            servers.map((serverUser) => {
                                // Null-safe calculations
                                const reviewsCount = serverUser.server?.reviews_count ?? serverUser.server?.total_reviews ?? 0;
                                const avgRating = serverUser.server?.reviews_avg_rating 
                                    ? parseFloat(serverUser.server.reviews_avg_rating).toFixed(1) 
                                    : "—";

                                return (
                                    <tr key={serverUser.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="icon-tile border border-line" style={{ width: 40, height: 40 }}>
                                                    {serverUser.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-main text-sm">{serverUser.full_name}</div>
                                                    <div className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wider">SERVER</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sm">
                                            <div className="space-y-0.5 text-muted">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail size={13} className="shrink-0" />
                                                    {serverUser.email}
                                                </div>
                                                {serverUser.server?.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Phone size={13} className="shrink-0" />
                                                        {serverUser.server.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {serverUser.server?.nfc_card ? (
                                                <span className="code-pill">
                                                    <CreditCard size={12} className="text-primary" />
                                                    {serverUser.server.nfc_card.uid}
                                                </span>
                                            ) : (
                                                <span className="rating-pill neutral">
                                                    No Card Linked
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className="code-pill bg-surface-muted text-text-main">
                                                {reviewsCount}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="code-pill bg-surface-muted text-text-main">
                                                <Star size={14} className="text-warning fill-warning" />
                                                {avgRating}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${serverUser.is_active ? "active" : "inactive"}`}>
                                                <UserCheck size={12} /> Active
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="actions justify-end">
                                                <button
                                                    onClick={() => handleOpenEdit(serverUser)}
                                                    className="icon-action"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(serverUser.id)}
                                                    className="icon-action danger"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <PortalModal 
                    title={editingServer ? "Edit Server Details" : "Add Server Profile"}
                    icon={editingServer ? Edit2 : Plus}
                    onClose={() => setShowModal(false)}
                >
                    {formError && (
                        <div className="alert">
                            <ShieldAlert size={16} className="shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Samir Amrani"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="samir@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>
                                Password {editingServer && <span className="text-muted">(leave blank to keep unchanged)</span>}
                            </label>
                            <input
                                type="password"
                                required={!editingServer}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 0612345678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Assign NFC Review Card</label>
                            <select
                                value={formData.nfc_card_id}
                                onChange={(e) => setFormData({ ...formData, nfc_card_id: e.target.value })}
                                className="select"
                            >
                                <option value="">No Card Linked</option>
                                {getAvailableCards().map(card => (
                                    <option key={card.id} value={card.id}>
                                        {card.uid} {card.server_id ? "(Currently Linked)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions mt-6">
                            <button type="submit" disabled={formLoading} className="button full">
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </PortalModal>
            )}
        </div>
    );
}

export default ServerList;
