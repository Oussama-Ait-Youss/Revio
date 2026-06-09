import { useState, useEffect } from "react";
import { Search, Plus, Trash2, X, Link as LinkIcon, Power, Check } from "lucide-react";
import axiosClient from "../../api/axios";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function Input({ label, ...props }) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
            </label>
            <input {...props} style={{
                width: "100%", padding: "10px 14px", border: "1px solid #ddd",
                borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                fontFamily: "sans-serif",
            }} />
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
            <div style={{
                background: "#fff", borderRadius: "12px", padding: "2rem",
                width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function NfcCards() {
    const [cards, setCards] = useState([]);
    const [servers, setServers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // UI state
    const [showAdd, setShowAdd] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    
    // Forms
    const [addForm, setAddForm] = useState({ uid: "", public_token: "", qr_code_url: "" });
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedServer, setSelectedServer] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cardsRes, serversRes] = await Promise.all([
                axiosClient.get("/nfc-cards", { headers: headers() }),
                axiosClient.get("/servers", { headers: headers() })
            ]);
            setCards(cardsRes.data.data || cardsRes.data);
            setServers(serversRes.data.data || serversRes.data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = cards.filter(c => 
        c.uid?.toLowerCase().includes(search.toLowerCase()) || 
        c.server?.user?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosClient.post("/nfc-cards", { ...addForm, server_id: selectedServer || null }, { headers: headers() });
            setShowAdd(false);
            setAddForm({ uid: "", public_token: "", qr_code_url: "" });
            setSelectedServer("");
            fetchData();
        } catch(e) {
            alert(e.response?.data?.message || "Error");
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosClient.post(`/nfc-cards/${selectedCard.id}/assign`, { server_id: selectedServer }, { headers: headers() });
            setShowAssign(false);
            setSelectedCard(null);
            setSelectedServer("");
            fetchData();
        } catch(e) {
            alert(e.response?.data?.message || "Error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await axiosClient.patch(`/nfc-cards/${id}/toggle`, {}, { headers: headers() });
            fetchData();
        } catch(e) {}
    };

    const handleDelete = async (id) => {
        if(!confirm("Delete NFC card?")) return;
        try {
            await axiosClient.delete(`/nfc-cards/${id}`, { headers: headers() });
            fetchData();
        } catch(e) {}
    };

    return (
        <div style={{ padding: "2rem", height: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0, color: "#0f0f0f" }}>NFC Cards</h1>
                    <p style={{ color: "#888", fontSize: "14px", margin: "4px 0 0" }}>Manage restaurant NFC cards</p>
                </div>
                <button onClick={() => { setSelectedServer(""); setShowAdd(true); }} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "#0f0f0f", color: "#fff", border: "none",
                    padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "14px", fontFamily: "sans-serif",
                }}>
                    <Plus size={16} /> Add Card
                </button>
            </div>

            <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: "320px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by UID or server name..."
                    style={{
                        width: "100%", padding: "10px 14px 10px 38px",
                        border: "1px solid #ddd", borderRadius: "8px",
                        fontSize: "14px", outline: "none", boxSizing: "border-box",
                        fontFamily: "sans-serif",
                    }}
                />
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#fafaf8", borderBottom: "1px solid #eee" }}>
                            {["UID", "Assigned To", "Assigned At", "Status", "Actions"].map(h => (
                                <th key={h} style={{
                                    padding: "12px 16px", textAlign: "left",
                                    fontSize: "12px", color: "#888", fontWeight: 500,
                                    letterSpacing: "0.05em", textTransform: "uppercase",
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>No cards found.</td></tr>
                        ) : filtered.map((c, i) => (
                            <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                                    <span style={{ fontFamily: "monospace", background: "#f0f0f0", padding: "4px 8px", borderRadius: "6px" }}>{c.uid}</span>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#555" }}>
                                    {c.server?.user?.full_name || "—"}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#555" }}>
                                    {c.assigned_at ? new Date(c.assigned_at).toLocaleDateString() : "—"}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                                        background: c.is_active ? "#eaf3de" : "#fce8e8",
                                        color: c.is_active ? "#3b6d11" : "#a32d2d",
                                    }}>
                                        {c.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => handleToggle(c.id)} title="Toggle Active" style={{
                                            background: "#f5f5f5", border: "none", borderRadius: "6px",
                                            padding: "6px 8px", cursor: "pointer", color: c.is_active ? "#f39c12" : "#27ae60",
                                        }}>
                                            {c.is_active ? <Power size={14} /> : <Check size={14} />}
                                        </button>
                                        <button onClick={() => { setSelectedCard(c); setSelectedServer(c.server_id || ""); setShowAssign(true); }} title="Assign Server" style={{
                                            background: "#f5f5f5", border: "none", borderRadius: "6px",
                                            padding: "6px 8px", cursor: "pointer", color: "#3498db",
                                        }}>
                                            <LinkIcon size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} style={{
                                            background: "#fff0f0", border: "none", borderRadius: "6px",
                                            padding: "6px 8px", cursor: "pointer", color: "#c0392b",
                                        }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showAdd && (
                <Modal title="Add NFC Card" onClose={() => setShowAdd(false)}>
                    <form onSubmit={handleAdd}>
                        <Input label="UID" value={addForm.uid} onChange={e => setAddForm({ ...addForm, uid: e.target.value })} required placeholder="e.g. 04:A1:B2:C3:D4" />
                        <Input label="Public Token" value={addForm.public_token} onChange={e => setAddForm({ ...addForm, public_token: e.target.value })} required placeholder="Unique token string" />
                        <Input label="QR Code URL (Optional)" value={addForm.qr_code_url} onChange={e => setAddForm({ ...addForm, qr_code_url: e.target.value })} placeholder="https://..." />
                        
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Assign to Server (Optional)
                            </label>
                            <select
                                value={selectedServer}
                                onChange={e => setSelectedServer(e.target.value)}
                                style={{
                                    width: "100%", padding: "10px 14px", border: "1px solid #ddd",
                                    borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                                    fontFamily: "sans-serif", background: "#fff",
                                }}
                            >
                                <option value="">-- Leave Unassigned --</option>
                                {servers.map(s => (
                                    <option key={s.id} value={s.server?.id}>{s.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => setShowAdd(false)} style={{
                                padding: "10px 18px", border: "1px solid #ddd", borderRadius: "8px",
                                background: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{
                                padding: "10px 18px", border: "none", borderRadius: "8px",
                                background: "#0f0f0f", color: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>
                                {saving ? "Saving..." : "Add Card"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showAssign && (
                <Modal title="Assign NFC Card" onClose={() => setShowAssign(false)}>
                    <form onSubmit={handleAssign}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Select Server
                            </label>
                            <select
                                value={selectedServer}
                                onChange={e => setSelectedServer(e.target.value)}
                                required
                                style={{
                                    width: "100%", padding: "10px 14px", border: "1px solid #ddd",
                                    borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
                                    fontFamily: "sans-serif", background: "#fff",
                                }}
                            >
                                <option value="">-- Select a Server --</option>
                                {servers.map(s => (
                                    <option key={s.id} value={s.server?.id}>{s.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => setShowAssign(false)} style={{
                                padding: "10px 18px", border: "1px solid #ddd", borderRadius: "8px",
                                background: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{
                                padding: "10px 18px", border: "none", borderRadius: "8px",
                                background: "#0f0f0f", color: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>
                                {saving ? "Saving..." : "Assign"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default NfcCards;
