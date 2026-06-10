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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 w-full px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 mb-4">
                        <UtensilsCrossed size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif text-center">
                        Setup Your Venue
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                        Register your restaurant to begin managing NFC cards and server accounts.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Restaurant Name
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <Store size={16} />
                            </span>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Le Marrakchi"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Physical Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <MapPin size={16} />
                            </span>
                            <input
                                type="text"
                                name="address"
                                required
                                placeholder="e.g. Jemaa el-Fnaa, Marrakech"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            Business Phone Number
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <Phone size={16} />
                            </span>
                            <input
                                type="text"
                                name="phone"
                                required
                                placeholder="e.g. 0524400000"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-sm"
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
                </form>
            </div>
        </div>
    );
}

export default RestaurantSetup;
