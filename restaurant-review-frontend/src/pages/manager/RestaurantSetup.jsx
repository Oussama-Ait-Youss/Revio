import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axios";
import { UtensilsCrossed, Store, MapPin, Phone, Loader2 } from "lucide-react";

function RestaurantSetup() {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.post("/manager/setup-restaurant", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update auth user with new restaurant_id
            const { user } = response.data;
            updateUser({ restaurant_id: user.restaurant_id });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to configure restaurant. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="centered-state">
            <div className="centered-card panel">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary-soft text-primary rounded-2xl flex items-center justify-center border border-primary/20 mb-6 shadow-sm">
                        <UtensilsCrossed size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-main font-serif text-center mb-2">
                        Setup Your Venue
                    </h1>
                    <p className="text-sm text-muted text-center mb-8">
                        Register your restaurant to begin managing NFC cards and server accounts.
                    </p>
                </div>

                {error && (
                    <div className="alert mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="field">
                        <label>Restaurant Name</label>
                        <div className="search-field w-full max-w-none">
                            <Store size={18} />
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Le Marrakchi"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Physical Address</label>
                        <div className="search-field w-full max-w-none">
                            <MapPin size={18} />
                            <input
                                type="text"
                                name="address"
                                required
                                placeholder="e.g. Jemaa el-Fnaa, Marrakech"
                                value={formData.address}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Business Phone Number</label>
                        <div className="search-field w-full max-w-none">
                            <Phone size={18} />
                            <input
                                type="text"
                                name="phone"
                                required
                                placeholder="e.g. 0524400000"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="form-actions pt-4 mt-8 border-t border-line">
                        <button
                            type="submit"
                            disabled={loading}
                            className="button full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Setting up venue...
                                </>
                            ) : (
                                "Onboard Venue & Access Portal"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RestaurantSetup;
