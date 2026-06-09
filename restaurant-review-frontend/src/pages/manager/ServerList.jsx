import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Mail, Phone, CreditCard, Star, RefreshCw, X, Loader2, UserCheck, ShieldAlert } from "lucide-react";
import axiosClient from "../../api/axios";

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
                await axiosClient.post("/servers", formData, {
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 size={32} className="animate-spin text-[#c9a96e]" />
                <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Loading server list...</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white font-serif tracking-tight">
                        Servers & Staff
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
                        Manage server profiles, link cards, and track personal review performance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchServers}
                        className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all shadow-sm cursor-pointer"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-950 hover:bg-[#c9a96e] dark:bg-zinc-800 dark:hover:bg-[#c9a96e] text-white hover:text-zinc-950 text-sm font-bold uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg shadow-zinc-950/10 dark:shadow-none transition-all duration-300"
                    >
                        <Plus size={18} />
                        Add Server
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Grid/Table Layout */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Server Info</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Contact Details</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">NFC Card Linked</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">Reviews</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">Avg Rating</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                                <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {servers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
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
                                        <tr key={serverUser.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                            <td className="px-6 py-5.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-sm">
                                                        {serverUser.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-white text-sm">{serverUser.full_name}</div>
                                                        <div className="text-xs text-[#c9a96e] font-semibold mt-0.5 uppercase tracking-wider">SERVER</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5.5 text-sm">
                                                <div className="space-y-0.5 text-zinc-655 dark:text-zinc-350">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail size={13} className="text-zinc-400" />
                                                        {serverUser.email}
                                                    </div>
                                                    {serverUser.server?.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                            <Phone size={13} className="text-zinc-400" />
                                                            {serverUser.server.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5.5">
                                                {serverUser.server?.nfc_card ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-150 dark:border-green-900/30">
                                                        <CreditCard size={12} />
                                                        {serverUser.server.nfc_card.uid}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium rounded-full">
                                                        No Card Linked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5.5 text-center">
                                                <span className="font-bold text-zinc-900 dark:text-white text-sm">
                                                    {reviewsCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                                    {avgRating}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                    serverUser.is_active
                                                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30"
                                                        : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30"
                                                }`}>
                                                    <UserCheck size={12} />
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-5.5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(serverUser)}
                                                        className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(serverUser.id)}
                                                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl cursor-pointer transition-colors"
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6 flex items-center gap-2">
                            {editingServer ? <Edit2 className="text-[#c9a96e]" /> : <Plus className="text-[#c9a96e]" />}
                            {editingServer ? "Edit Server Details" : "Add Server Profile"}
                        </h2>

                        {formError && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-4 text-red-600 dark:text-red-400 text-xs flex gap-2">
                                <ShieldAlert size={16} className="shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Samir Amrani"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white outline-none focus:border-[#c9a96e] dark:focus:border-[#c9a96e] focus:bg-white transition-all duration-250"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="samir@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white outline-none focus:border-[#c9a96e] dark:focus:border-[#c9a96e] focus:bg-white transition-all duration-250"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                                    Password {editingServer && <span className="text-zinc-400">(leave blank to keep unchanged)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingServer}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white outline-none focus:border-[#c9a96e] dark:focus:border-[#c9a96e] focus:bg-white transition-all duration-250"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 0612345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white outline-none focus:border-[#c9a96e] dark:focus:border-[#c9a96e] focus:bg-white transition-all duration-250"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Assign NFC Review Card</label>
                                <select
                                    value={formData.nfc_card_id}
                                    onChange={(e) => setFormData({ ...formData, nfc_card_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white outline-none focus:border-[#c9a96e] dark:focus:border-[#c9a96e] focus:bg-white transition-all duration-250"
                                >
                                    <option value="">No Card Linked</option>
                                    {getAvailableCards().map(card => (
                                        <option key={card.id} value={card.id}>
                                            {card.uid} {card.server_id ? "(Currently Linked)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-3.5 bg-zinc-950 hover:bg-[#c9a96e] dark:bg-zinc-800 dark:hover:bg-[#c9a96e] text-white hover:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                {formLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServerList;
