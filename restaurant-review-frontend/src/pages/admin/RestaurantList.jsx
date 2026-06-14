import { useState, useEffect } from "react";
import { Plus, Users, Star, MapPin, Phone, Mail, X, Loader2, Store, UserCheck } from "lucide-react";
import axiosClient from "../../api/axios";
import PortalModal from "../../components/modals/PortalModal";
function RestaurantList() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals visibility
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    
    // Target restaurant for manager assignment
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

    // Form inputs
    const [restFormData, setRestFormData] = useState({ name: "", address: "", phone: "" });
    const [managerFormData, setManagerFormData] = useState({ full_name: "", email: "", password: "" });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchRestaurants = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.get("/admin/restaurants", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRestaurants(response.data.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch restaurants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleRestSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");
        try {
            const token = localStorage.getItem("token");
            await axiosClient.post("/admin/restaurants", restFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowRestaurantModal(false);
            setRestFormData({ name: "", address: "", phone: "" });
            fetchRestaurants();
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || "Failed to create restaurant.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleManagerSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurantId) {
            setFormError("Please select a restaurant venue.");
            return;
        }

        setFormLoading(true);
        setFormError("");
        try {
            const token = localStorage.getItem("token");
            await axiosClient.post("/admin/managers", {
                ...managerFormData,
                restaurant_id: selectedRestaurantId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowManagerModal(false);
            setManagerFormData({ full_name: "", email: "", password: "" });
            setSelectedRestaurantId("");
            fetchRestaurants();
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || "Failed to register manager.");
        } finally {
            setFormLoading(false);
        }
    };

    const getRestaurantsWithoutManager = () => {
        return restaurants.filter(r => !r.manager);
    };

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
                <span>Loading restaurants...</span>
            </div>
        );
    }

    return (
        <div className="page space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <h1>Restaurant Directory</h1>
                    <p>Register new venues and assign dedicated restaurant manager accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowRestaurantModal(true)} className="button secondary">
                        <Plus size={18} /> Add Venue
                    </button>
                    <button onClick={() => {
                            const withoutManager = getRestaurantsWithoutManager();
                            if (withoutManager.length > 0) {
                                setSelectedRestaurantId(withoutManager[0].id);
                            }
                            setShowManagerModal(true);
                        }} 
                        className="button"
                    >
                        <UserCheck size={18} /> Register Venue Manager
                    </button>
                </div>
            </div>

            {error && <div className="alert">{error}</div>}

            {/* Table Wrapper Card */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Restaurant Info</th>
                            <th>Contact Details</th>
                            <th>Manager Email</th>
                            <th className="text-center">Servers</th>
                            <th className="text-center">Reviews</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    No restaurant venues registered.
                                </td>
                            </tr>
                        ) : (
                            restaurants.map((rest) => (
                                <tr key={rest.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="icon-tile border border-line" style={{ width: 40, height: 40 }}>
                                                {rest.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-text-main text-sm">{rest.name}</div>
                                                <div className="text-xs text-muted mt-1 flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {rest.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm text-muted">
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={14} className="shrink-0" />
                                            {rest.phone}
                                        </div>
                                    </td>
                                    <td className="text-sm text-muted">
                                        {rest.manager ? (
                                            <div className="space-y-0.5">
                                                <div className="font-semibold text-text-main">{rest.manager.full_name}</div>
                                                <div className="text-xs flex items-center gap-1 mt-0.5">
                                                    <Mail size={12} className="shrink-0" />
                                                    {rest.manager.email}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="rating-pill neutral">
                                                No Manager Assigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <span className="code-pill">
                                            <Users size={12} className="text-muted" />
                                            {rest.servers_count}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="code-pill">
                                            <Star size={12} className="text-warning fill-warning" />
                                            {rest.reviews_count}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${rest.status === "ACTIVE" ? "active" : "inactive"}`}>
                                            {rest.status}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="actions justify-end">
                                            {!rest.manager && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRestaurantId(rest.id);
                                                        setShowManagerModal(true);
                                                    }}
                                                    className="button secondary" style={{ minHeight: 32, padding: '0 12px', fontSize: '0.8rem' }}
                                                >
                                                    Link Manager
                                                </button>
                                            )}
                                            <button
                                                onClick={() => alert(`Suspending ${rest.name}`)}
                                                className="button danger" style={{ minHeight: 32, padding: '0 12px', fontSize: '0.8rem' }}
                                            >
                                                Suspend
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Creation Modal (Add Restaurant) */}
            {showRestaurantModal && (
                <PortalModal 
                    title="Register Restaurant Venue" 
                    icon={Store} 
                    onClose={() => { setShowRestaurantModal(false); setFormError(""); }}
                >
                    {formError && <div className="alert">{formError}</div>}

                    <form onSubmit={handleRestSubmit} className="space-y-4">
                        <div className="field">
                            <label>Restaurant Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. La Trattoria"
                                value={restFormData.name}
                                onChange={(e) => setRestFormData({ ...restFormData, name: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Address</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Gueliz, Marrakech"
                                value={restFormData.address}
                                onChange={(e) => setRestFormData({ ...restFormData, address: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 0524430000"
                                value={restFormData.phone}
                                onChange={(e) => setRestFormData({ ...restFormData, phone: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="form-actions mt-6">
                            <button type="submit" disabled={formLoading} className="button full">
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Venue"}
                            </button>
                        </div>
                    </form>
                </PortalModal>
            )}

            {/* Creation Modal (Add Manager) */}
            {showManagerModal && (
                <PortalModal 
                    title="Register Venue Manager" 
                    icon={UserCheck} 
                    onClose={() => { setShowManagerModal(false); setFormError(""); }}
                >
                    <p className="muted mb-6" style={{ fontSize: '0.85rem' }}>
                        Create manager credentials and assign them to an active restaurant venue.
                    </p>

                    {formError && <div className="alert">{formError}</div>}

                    <form onSubmit={handleManagerSubmit} className="space-y-4">
                        <div className="field">
                            <label>Target Restaurant Venue</label>
                            <select
                                value={selectedRestaurantId}
                                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                className="select"
                            >
                                <option value="" disabled>Select Restaurant</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} {r.manager ? "(Has Manager)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Manager Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Jean Dupont"
                                value={managerFormData.full_name}
                                onChange={(e) => setManagerFormData({ ...managerFormData, full_name: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="manager@example.com"
                                value={managerFormData.email}
                                onChange={(e) => setManagerFormData({ ...managerFormData, email: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label>Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={managerFormData.password}
                                onChange={(e) => setManagerFormData({ ...managerFormData, password: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div className="form-actions mt-6">
                            <button type="submit" disabled={formLoading} className="button full">
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Create Manager Profile"}
                            </button>
                        </div>
                    </form>
                </PortalModal>
            )}
        </div>
    );
}

export default RestaurantList;
