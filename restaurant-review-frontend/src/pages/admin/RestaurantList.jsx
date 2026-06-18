import { useEffect, useState } from "react";
import {
    Building2,
    ImagePlus,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plus,
    Star,
    Users,
} from "lucide-react";
import axiosClient from "../../api/axios";
import PortalModal from "../../components/modals/PortalModal";

const emptyForm = {
    name: "",
    address: "",
    phone: "",
    logo: null,
    manager_full_name: "",
    manager_email: "",
    manager_password: "",
};
const apiOrigin = (axiosClient.defaults.baseURL || window.location.origin).replace(/\/api\/?$/, "");

function RestaurantList() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchRestaurants = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axiosClient.get("/admin/restaurants");
            setRestaurants(response.data.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load restaurants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const updateField = (event) => {
        const { name, value, files } = event.target;
        setForm((current) => ({
            ...current,
            [name]: files ? files[0] || null : value,
        }));
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setForm(emptyForm);
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== "") payload.append(key, value);
            });

            await axiosClient.post("/admin/restaurants", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            closeModal();
            await fetchRestaurants();
        } catch (requestError) {
            const errors = requestError.response?.data?.errors;
            setFormError(
                errors ? Object.values(errors).flat()[0] : requestError.response?.data?.message || "Unable to create restaurant."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 size={34} className="animate-spin text-primary mx-auto mb-4" />
                Loading restaurants...
            </div>
        );
    }

    return (
        <div className="page space-y-6">
            <div className="page-header">
                <div className="page-title">
                    <h1>Restaurant Management Board</h1>
                    <p>Create restaurant profiles and their pre-linked manager accounts in one secure step.</p>
                </div>
                <button className="button" type="button" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> New restaurant
                </button>
            </div>

            {error && <div className="alert">{error}</div>}

            <div className="table-wrap responsive-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Restaurant</th>
                            <th>Contact</th>
                            <th>Manager</th>
                            <th>Servers</th>
                            <th>Reviews</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.length === 0 ? (
                            <tr><td colSpan={6} className="empty-state">No restaurants have been created yet.</td></tr>
                        ) : restaurants.map((restaurant) => (
                            <tr key={restaurant.id}>
                                <td data-label="Restaurant">
                                    <div className="identity">
                                        <div className="restaurant-logo">
                                            {restaurant.logo ? (
                                                <img
                                                    src={`${apiOrigin}/storage/${restaurant.logo}`}
                                                    alt=""
                                                />
                                            ) : restaurant.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>{restaurant.name}</strong>
                                            <div className="muted text-xs flex items-center gap-1 mt-1">
                                                <MapPin size={12} /> {restaurant.address}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Contact">
                                    <span className="muted flex items-center gap-2"><Phone size={14} /> {restaurant.phone}</span>
                                </td>
                                <td data-label="Manager">
                                    {restaurant.manager ? (
                                        <div>
                                            <strong>{restaurant.manager.full_name}</strong>
                                            <span className="muted text-xs flex items-center gap-1 mt-1">
                                                <Mail size={12} /> {restaurant.manager.email}
                                            </span>
                                        </div>
                                    ) : <span className="status-pill inactive">Not assigned</span>}
                                </td>
                                <td data-label="Servers"><span className="code-pill"><Users size={13} /> {restaurant.servers_count}</span></td>
                                <td data-label="Reviews"><span className="code-pill"><Star size={13} /> {restaurant.reviews_count}</span></td>
                                <td data-label="Status">
                                    <span className={`status-pill ${restaurant.status === "ACTIVE" ? "active" : "inactive"}`}>
                                        {restaurant.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <PortalModal title="Create restaurant profile" icon={Building2} onClose={closeModal}>
                    <p className="muted modal-intro">
                        The manager account is created in the same transaction and linked to the new restaurant automatically.
                    </p>
                    {formError && <div className="alert">{formError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-section-title">Restaurant details</div>
                        <div className="form-grid">
                            <div className="field">
                                <label htmlFor="restaurant-name">Name</label>
                                <input id="restaurant-name" className="input" name="name" value={form.name} onChange={updateField} required />
                            </div>
                            <div className="field">
                                <label htmlFor="restaurant-phone">Phone</label>
                                <input id="restaurant-phone" className="input" name="phone" value={form.phone} onChange={updateField} required />
                            </div>
                            <div className="field form-grid-full">
                                <label htmlFor="restaurant-address">Address</label>
                                <input id="restaurant-address" className="input" name="address" value={form.address} onChange={updateField} required />
                            </div>
                            <div className="field form-grid-full">
                                <label htmlFor="restaurant-logo">Logo <span className="muted">(optional, max 2 MB)</span></label>
                                <label className="file-picker" htmlFor="restaurant-logo">
                                    <ImagePlus size={18} />
                                    <span>{form.logo?.name || "Choose an image"}</span>
                                </label>
                                <input id="restaurant-logo" className="sr-only" type="file" name="logo" accept="image/*" onChange={updateField} />
                            </div>
                        </div>

                        <div className="form-section-title">Manager account</div>
                        <div className="form-grid">
                            <div className="field">
                                <label htmlFor="manager-name">Full name</label>
                                <input id="manager-name" className="input" name="manager_full_name" value={form.manager_full_name} onChange={updateField} required />
                            </div>
                            <div className="field">
                                <label htmlFor="manager-email">Email</label>
                                <input id="manager-email" className="input" type="email" name="manager_email" value={form.manager_email} onChange={updateField} required />
                            </div>
                            <div className="field form-grid-full">
                                <label htmlFor="manager-password">Temporary password</label>
                                <input id="manager-password" className="input" type="password" minLength={8} name="manager_password" value={form.manager_password} onChange={updateField} required />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="button secondary" type="button" onClick={closeModal}>Cancel</button>
                            <button className="button" type="submit" disabled={saving}>
                                {saving ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
                                Create restaurant & manager
                            </button>
                        </div>
                    </form>
                </PortalModal>
            )}
        </div>
    );
}

export default RestaurantList;
