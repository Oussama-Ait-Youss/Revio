import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import axiosClient from "../../api/axios";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

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

const emptyForm = { full_name: "", email: "", password: "", phone: "" };

function Servers() {
    const [servers, setServers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchServers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/servers", { headers: headers() });
            setServers(res.data.data || res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServers(); }, []);

    const filtered = servers.filter(s =>
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await axiosClient.post("/servers", form, { headers: headers() });
            setShowAdd(false);
            setForm(emptyForm);
            fetchServers();
        } catch (e) {
            setError(e.response?.data?.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await axiosClient.put(`/servers/${selected.id}`, form, { headers: headers() });
            setShowEdit(false);
            setSelected(null);
            fetchServers();
        } catch (e) {
            setError(e.response?.data?.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this server?")) return;
        try {
            await axiosClient.delete(`/servers/${id}`, { headers: headers() });
            fetchServers();
        } catch (e) {
            alert("Failed to delete server.");
        }
    };

    const openEdit = (server) => {
        setSelected(server);
        setForm({
            full_name: server.full_name || "",
            email: server.email || "",
            password: "",
            phone: server.server?.phone || "",
        });
        setError("");
        setShowEdit(true);
    };

    const openAdd = () => {
        setForm(emptyForm);
        setError("");
        setShowAdd(true);
    };

    return (
        <div style={{ padding: "2rem", height: "100%", boxSizing: "border-box" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0, color: "#0f0f0f" }}>Servers</h1>
                    <p style={{ color: "#888", fontSize: "14px", margin: "4px 0 0" }}>Manage your restaurant servers</p>
                </div>
                <button onClick={openAdd} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "#0f0f0f", color: "#fff", border: "none",
                    padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "14px", fontFamily: "sans-serif",
                }}>
                    <Plus size={16} /> Add Server
                </button>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: "320px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search servers..."
                    style={{
                        width: "100%", padding: "10px 14px 10px 38px",
                        border: "1px solid #ddd", borderRadius: "8px",
                        fontSize: "14px", outline: "none", boxSizing: "border-box",
                        fontFamily: "sans-serif",
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "#fafaf8", borderBottom: "1px solid #eee" }}>
                            {["Name", "Email", "Phone", "Total Reviews", "Status", "Actions"].map(h => (
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
                            <tr>
                                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
                                    No servers found.
                                </td>
                            </tr>
                        ) : filtered.map((server, i) => (
                            <tr key={server.id} style={{
                                borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                                transition: "background 0.1s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "#fafaf8"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "14px 16px", fontWeight: 500, color: "#0f0f0f" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "50%",
                                            background: "#0f0f0f", color: "#c9a96e",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "12px", fontWeight: 600, flexShrink: 0,
                                        }}>
                                            {server.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        {server.full_name}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#555" }}>{server.email}</td>
                                <td style={{ padding: "14px 16px", color: "#555" }}>{server.server?.phone || "—"}</td>
                                <td style={{ padding: "14px 16px", color: "#555" }}>{server.server?.total_reviews ?? 0}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                                        background: server.is_active ? "#eaf3de" : "#fce8e8",
                                        color: server.is_active ? "#3b6d11" : "#a32d2d",
                                    }}>
                                        {server.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => openEdit(server)} style={{
                                            background: "#f5f5f5", border: "none", borderRadius: "6px",
                                            padding: "6px 8px", cursor: "pointer", color: "#555",
                                            display: "flex", alignItems: "center",
                                        }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(server.id)} style={{
                                            background: "#fff0f0", border: "none", borderRadius: "6px",
                                            padding: "6px 8px", cursor: "pointer", color: "#c0392b",
                                            display: "flex", alignItems: "center",
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

            {/* Add Modal */}
            {showAdd && (
                <Modal title="Add Server" onClose={() => setShowAdd(false)}>
                    <form onSubmit={handleAdd}>
                        <Input label="Full Name" name="full_name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                        <Input label="Email" type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <Input label="Password" type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <Input label="Phone" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        {error && <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "1rem" }}>{error}</p>}
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => setShowAdd(false)} style={{
                                padding: "10px 18px", border: "1px solid #ddd", borderRadius: "8px",
                                background: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{
                                padding: "10px 18px", border: "none", borderRadius: "8px",
                                background: "#0f0f0f", color: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>
                                {saving ? "Saving..." : "Add Server"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEdit && (
                <Modal title="Edit Server" onClose={() => setShowEdit(false)}>
                    <form onSubmit={handleEdit}>
                        <Input label="Full Name" name="full_name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                        <Input label="Email" type="email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <Input label="New Password (leave blank to keep)" type="password" name="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        <Input label="Phone" name="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        {error && <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "1rem" }}>{error}</p>}
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button type="button" onClick={() => setShowEdit(false)} style={{
                                padding: "10px 18px", border: "1px solid #ddd", borderRadius: "8px",
                                background: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{
                                padding: "10px 18px", border: "none", borderRadius: "8px",
                                background: "#0f0f0f", color: "#fff", cursor: "pointer", fontSize: "14px",
                            }}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Servers;