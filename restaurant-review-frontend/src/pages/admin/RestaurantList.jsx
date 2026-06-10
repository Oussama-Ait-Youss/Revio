import { useState, useEffect } from "react";
import { Plus, Edit2, ShieldAlert, Star, Users, MapPin, Phone, Mail, X, Loader2, UserCheck, ShieldClose, Store } from "lucide-react";
import axiosClient from "../../api/axios";

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

    // Filter restaurants that do not have a manager assigned
    const getRestaurantsWithoutManager = () => {
        return restaurants.filter(r => !r.manager);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 size={36} className="animate-spin text-indigo-600" />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading restaurants...</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
                        Restaurant Directory
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Register new venues and assign dedicated restaurant manager accounts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRestaurantModal(true)}
                        className="px-4 py-2 border border-slate-350 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-medium text-sm rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                        ➕ Add Venue
                    </button>
                    <button
                        onClick={() => {
                            const withoutManager = getRestaurantsWithoutManager();
                            if (withoutManager.length > 0) {
                                setSelectedRestaurantId(withoutManager[0].id);
                            }
                            setShowManagerModal(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-sm text-sm cursor-pointer"
                    >
                        ➕ Register New Venue Manager
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-red-650 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Table Wrapper Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Restaurant Info</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Contact Details</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Manager Email</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Servers</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Reviews</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {restaurants.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                                        No restaurant venues registered.
                                    </td>
                                </tr>
                            ) : (
                                restaurants.map((rest, index) => (
                                    <tr 
                                        key={rest.id} 
                                        className={`transition-colors ${
                                            index % 2 === 0 
                                                ? "bg-white dark:bg-slate-800" 
                                                : "bg-slate-50/50 dark:bg-slate-800/50"
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold border border-indigo-100/40">
                                                    {rest.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{rest.name}</div>
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {rest.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Phone size={14} className="text-slate-400 shrink-0" />
                                                {rest.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {rest.manager ? (
                                                <div className="space-y-0.5">
                                                    <div className="font-semibold text-slate-805 dark:text-slate-200">{rest.manager.full_name}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Mail size={12} className="shrink-0" />
                                                        {rest.manager.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/20">
                                                    No Manager Assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                <Users size={12} className="text-slate-400" />
                                                {rest.servers_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                                {rest.reviews_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                rest.status === "ACTIVE"
                                                    ? "bg-emerald-55 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/10"
                                                    : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200/10"
                                            }`}>
                                                {rest.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!rest.manager && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRestaurantId(rest.id);
                                                            setShowManagerModal(true);
                                                        }}
                                                        className="px-2.5 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/40 rounded transition-all cursor-pointer"
                                                    >
                                                        Link Manager
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => alert(`Suspending ${rest.name}`)}
                                                    className="px-2.5 py-1.5 text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-100/50 dark:border-red-900/40 rounded transition-all cursor-pointer"
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
            </div>

            {/* Creation Modal (Add Restaurant) */}
            {showRestaurantModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => {
                                setShowRestaurantModal(false);
                                setFormError("");
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 font-serif">
                            <Store className="text-indigo-500" />
                            Register Restaurant Venue
                        </h2>

                        {formError && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleRestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Restaurant Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. La Trattoria"
                                    value={restFormData.name}
                                    onChange={(e) => setRestFormData({ ...restFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Address</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Gueliz, Marrakech"
                                    value={restFormData.address}
                                    onChange={(e) => setRestFormData({ ...restFormData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 0524430000"
                                    value={restFormData.phone}
                                    onChange={(e) => setRestFormData({ ...restFormData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Venue"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Creation Modal (Add Manager) */}
            {showManagerModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => {
                                setShowManagerModal(false);
                                setFormError("");
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 font-serif">
                            <UserCheck className="text-indigo-500" />
                            Register Venue Manager
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">
                            Create manager credentials and assign them to an active restaurant venue.
                        </p>

                        {formError && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-xs">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleManagerSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Target Restaurant Venue</label>
                                <select
                                    value={selectedRestaurantId}
                                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white dark:bg-slate-900"
                                >
                                    <option value="" disabled className="text-slate-400">Select Restaurant</option>
                                    {restaurants.map(r => (
                                        <option key={r.id} value={r.id} className="text-slate-800 dark:text-white">
                                            {r.name} {r.manager ? "(Has Manager)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Manager Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Jean Dupont"
                                    value={managerFormData.full_name}
                                    onChange={(e) => setManagerFormData({ ...managerFormData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="manager@example.com"
                                    value={managerFormData.email}
                                    onChange={(e) => setManagerFormData({ ...managerFormData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={managerFormData.password}
                                    onChange={(e) => setManagerFormData({ ...managerFormData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-350 dark:border-slate-650 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Create Manager Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RestaurantList;
