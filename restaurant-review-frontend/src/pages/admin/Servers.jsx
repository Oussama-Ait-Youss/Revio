import { useEffect, useMemo, useState } from "react";
import {
    CreditCard,
    Edit2,
    Loader2,
    Mail,
    Phone,
    Plus,
    RefreshCw,
    ShieldAlert,
    Star,
    Store,
    Trash2,
    UserCheck,
    Users
} from "lucide-react";
import axiosClient from "../../api/axios";
import PortalModal from "../../components/modals/PortalModal";

const emptyForm = {
    full_name: "",
    email: "",
    password: "",
    phone: "",
    restaurant_id: "",
    nfc_card_id: ""
};

function AdminServers() {
    const [servers, setServers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [nfcCards, setNfcCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingServer, setEditingServer] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const restaurantById = useMemo(() => {
        return restaurants.reduce((map, restaurant) => {
            map[String(restaurant.id)] = restaurant;
            return map;
        }, {});
    }, [restaurants]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [serversRes, restaurantsRes] = await Promise.all([
                axiosClient.get("/servers"),
                axiosClient.get("/admin/restaurants")
            ]);

            setServers(serversRes.data.data || []);
            setNfcCards(serversRes.data.nfc_cards || []);
            setRestaurants(restaurantsRes.data.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load server management data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingServer(null);
        setFormData({
            ...emptyForm,
            restaurant_id: restaurants[0]?.id ? String(restaurants[0].id) : ""
        });
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (serverUser) => {
        setEditingServer(serverUser);
        setFormData({
            full_name: serverUser.full_name || "",
            email: serverUser.email || "",
            password: "",
            phone: serverUser.server?.phone || "",
            restaurant_id: serverUser.restaurant_id ? String(serverUser.restaurant_id) : "",
            nfc_card_id: serverUser.server?.nfc_card?.id ? String(serverUser.server.nfc_card.id) : ""
        });
        setFormError("");
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const payload = {
                ...formData,
                restaurant_id: Number(formData.restaurant_id),
                nfc_card_id: formData.nfc_card_id || null
            };

            if (editingServer) {
                await axiosClient.put(`/servers/${editingServer.id}`, payload);
            } else {
                await axiosClient.post("/servers", payload);
            }

            setShowModal(false);
            await fetchData();
        } catch (err) {
            console.error(err);
            const validationErrors = err.response?.data?.errors;
            const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null;
            setFormError(firstValidationError || err.response?.data?.message || "Failed to save server.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (serverId) => {
        if (!window.confirm("Delete this server account and unlink any NFC card?")) return;

        try {
            await axiosClient.delete(`/servers/${serverId}`);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete server.");
        }
    };

    const availableCards = nfcCards.filter((card) => {
        if (!formData.restaurant_id || String(card.restaurant_id) !== String(formData.restaurant_id)) return false;
        if (!card.server_id) return true;
        return editingServer?.server?.id && Number(card.server_id) === Number(editingServer.server.id);
    });

    const handleRestaurantChange = (restaurantId) => {
        setFormData((current) => ({
            ...current,
            restaurant_id: restaurantId,
            nfc_card_id: ""
        }));
    };

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading servers...</span>
            </div>
        );
    }

    return (
        <div className="page space-y-8">
            <div className="page-header">
                <div className="page-title">
                    <h1>Servers Zone</h1>
                    <p>Manage all servers, restaurant assignments, and NFC card links from one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="button secondary p-0 w-12 flex justify-center items-center">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={openCreateModal} className="button">
                        <Plus size={18} /> Add Server
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="space-y-1">
                        <span>Total Servers</span>
                        <strong>{servers.length}</strong>
                    </div>
                    <div className="icon-tile">
                        <Users size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="space-y-1">
                        <span>Linked NFC Cards</span>
                        <strong>{servers.filter((server) => server.server?.nfc_card).length}</strong>
                    </div>
                    <div className="icon-tile">
                        <CreditCard size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="space-y-1">
                        <span>Restaurants Covered</span>
                        <strong>{new Set(servers.map((server) => server.restaurant_id).filter(Boolean)).size}</strong>
                    </div>
                    <div className="icon-tile">
                        <Store size={24} />
                    </div>
                </div>
            </div>

            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Server</th>
                            <th>Restaurant</th>
                            <th>Contact</th>
                            <th>NFC Card</th>
                            <th className="text-center">Reviews</th>
                            <th className="text-center">Avg Rating</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    No server profiles have been created yet.
                                </td>
                            </tr>
                        ) : (
                            servers.map((serverUser) => {
                                const reviewsCount = serverUser.server?.reviews_count ?? serverUser.server?.total_reviews ?? 0;
                                const avgRating = serverUser.server?.reviews_avg_rating
                                    ? parseFloat(serverUser.server.reviews_avg_rating).toFixed(1)
                                    : "-";
                                const restaurant = serverUser.restaurant || restaurantById[String(serverUser.restaurant_id)];

                                return (
                                    <tr key={serverUser.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="icon-tile border border-line" style={{ width: 40, height: 40 }}>
                                                    {serverUser.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-main text-sm">{serverUser.full_name}</div>
                                                    <div className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wider">SERVER</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {restaurant ? (
                                                <div className="space-y-0.5">
                                                    <div className="font-semibold text-text-main text-sm">{restaurant.name}</div>
                                                    <div className="text-xs text-muted">ID #{restaurant.id}</div>
                                                </div>
                                            ) : (
                                                <span className="rating-pill neutral">Unassigned</span>
                                            )}
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
                                                <span className="rating-pill neutral">No Card Linked</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className="code-pill bg-surface-muted text-text-main">{reviewsCount}</span>
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
                                                <button onClick={() => openEditModal(serverUser)} className="icon-action">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(serverUser.id)} className="icon-action danger">
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

            {showModal && (
                <PortalModal
                    title={editingServer ? "Edit Server" : "Add Server"}
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
                            <label>Restaurant</label>
                            <select
                                required
                                value={formData.restaurant_id}
                                onChange={(event) => handleRestaurantChange(event.target.value)}
                                className="select"
                            >
                                <option value="" disabled>Select Restaurant</option>
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Samir Amrani"
                                value={formData.full_name}
                                onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="server@example.com"
                                value={formData.email}
                                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 0612345678"
                                value={formData.phone}
                                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>NFC Review Card</label>
                            <select
                                value={formData.nfc_card_id}
                                onChange={(event) => setFormData({ ...formData, nfc_card_id: event.target.value })}
                                className="select"
                                disabled={!formData.restaurant_id}
                            >
                                <option value="">No Card Linked</option>
                                {availableCards.map((card) => (
                                    <option key={card.id} value={card.id}>
                                        {card.uid} {card.server_id ? "(Currently Linked)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions mt-6">
                            <button type="submit" disabled={formLoading} className="button full">
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Server"}
                            </button>
                        </div>
                    </form>
                </PortalModal>
            )}
        </div>
    );
}

export default AdminServers;
