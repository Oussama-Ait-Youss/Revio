import { useEffect, useState } from "react";
import { Check, Link as LinkIcon, Plus, Power, Search, Trash2, X } from "lucide-react";
import axiosClient from "../../api/axios";
import Modal from "../../components/modals/PortalModal";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function Input({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>
            <input className="input" {...props} />
        </div>
    );
}



function NfcCards() {
    const [cards, setCards] = useState([]);
    const [servers, setServers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [addForm, setAddForm] = useState({ uid: "", public_token: "", qr_code_url: "" });
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedServer, setSelectedServer] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cardsRes, serversRes] = await Promise.all([
                axiosClient.get("/nfc-cards", { headers: headers() }),
                axiosClient.get("/servers", { headers: headers() }),
            ]);
            setCards(cardsRes.data.data || cardsRes.data);
            setServers(serversRes.data.data || serversRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = cards.filter((card) => {
        const term = search.toLowerCase();
        return card.uid?.toLowerCase().includes(term) || card.server?.user?.full_name?.toLowerCase().includes(term);
    });

    const handleAdd = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await axiosClient.post("/nfc-cards", { ...addForm, server_id: selectedServer || null }, { headers: headers() });
            setShowAdd(false);
            setAddForm({ uid: "", public_token: "", qr_code_url: "" });
            setSelectedServer("");
            fetchData();
        } catch (e) {
            alert(e.response?.data?.message || "Error");
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await axiosClient.post(`/nfc-cards/${selectedCard.id}/assign`, { server_id: selectedServer }, { headers: headers() });
            setShowAssign(false);
            setSelectedCard(null);
            setSelectedServer("");
            fetchData();
        } catch (e) {
            alert(e.response?.data?.message || "Error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await axiosClient.patch(`/nfc-cards/${id}/toggle`, {}, { headers: headers() });
            fetchData();
        } catch (e) {
            alert("Unable to update card status.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete NFC card?")) return;
        try {
            await axiosClient.delete(`/nfc-cards/${id}`, { headers: headers() });
            fetchData();
        } catch (e) {
            alert("Unable to delete card.");
        }
    };

    return (
        <div className="page space-y-8">
            <header className="page-header">
                <div className="page-title">
                    <h1>NFC cards</h1>
                    <p>Create cards, assign them to servers, and toggle availability.</p>
                </div>
                <button className="button" type="button" onClick={() => { setSelectedServer(""); setShowAdd(true); }}>
                    <Plus size={18} /> Add card
                </button>
            </header>

            <div className="toolbar">
                <div className="search-field">
                    <Search size={18} />
                    <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search UID or server" />
                </div>
            </div>

            <section className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {["UID", "Assigned to", "Assigned at", "Status", "Actions"].map((header) => <th key={header}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-state">Loading cards...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-state">No cards found.</td></tr>
                        ) : filtered.map((card) => (
                            <tr key={card.id}>
                                <td><span className="code-pill">{card.uid}</span></td>
                                <td><span className="font-bold text-text-main">{card.server?.user?.full_name || "-"}</span></td>
                                <td className="text-muted">{card.assigned_at ? new Date(card.assigned_at).toLocaleDateString() : "-"}</td>
                                <td>
                                    <span className={`status-pill ${card.is_active ? "active" : "inactive"}`}>
                                        {card.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="icon-action" type="button" onClick={() => handleToggle(card.id)} aria-label="Toggle card status" title={card.is_active ? "Deactivate card" : "Activate card"}>
                                            {card.is_active ? <Power size={16} className="text-danger" /> : <Check size={16} className="text-success" />}
                                        </button>
                                        <button className="icon-action" type="button" onClick={() => { setSelectedCard(card); setSelectedServer(card.server_id || ""); setShowAssign(true); }} aria-label="Assign card" title="Assign card">
                                            <LinkIcon size={16} />
                                        </button>
                                        <button className="icon-action danger" type="button" onClick={() => handleDelete(card.id)} aria-label="Delete card" title="Delete card">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {showAdd && (
                <Modal title="Add NFC card" onClose={() => setShowAdd(false)}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <Input label="UID" value={addForm.uid} onChange={(e) => setAddForm({ ...addForm, uid: e.target.value })} required placeholder="04:A1:B2:C3:D4" />
                        <Input label="Public token" value={addForm.public_token} onChange={(e) => setAddForm({ ...addForm, public_token: e.target.value })} required placeholder="Unique token" />
                        <Input label="QR code URL" value={addForm.qr_code_url} onChange={(e) => setAddForm({ ...addForm, qr_code_url: e.target.value })} placeholder="https://..." />
                        <div className="field">
                            <label>Assign to server</label>
                            <select className="select" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)}>
                                <option value="">Leave unassigned</option>
                                {servers.map((server) => (
                                    <option key={server.id} value={server.server?.id}>{server.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions mt-6">
                            <button className="button secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : "Add card"}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showAssign && (
                <Modal title="Assign NFC card" onClose={() => setShowAssign(false)}>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div className="field">
                            <label>Select server</label>
                            <select className="select" value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)} required>
                                <option value="">Select a server</option>
                                {servers.map((server) => (
                                    <option key={server.id} value={server.server?.id}>{server.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions mt-6">
                            <button className="button secondary" type="button" onClick={() => setShowAssign(false)}>Cancel</button>
                            <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : "Assign"}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default NfcCards;
