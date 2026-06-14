import { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import axiosClient from "../../api/axios";
import Modal from "../../components/modals/PortalModal";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });
const emptyForm = { full_name: "", email: "", password: "", phone: "", nfc_card_id: "" };



function Input({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>
            <input className="input" {...props} />
        </div>
    );
}

function Servers() {
    const [servers, setServers] = useState([]);
    const [availableCards, setAvailableCards] = useState([]);
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
            setAvailableCards(res.data.nfc_cards || []);
        } catch (e) {
            setError("Unable to load servers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServers(); }, []);

    const filtered = servers.filter((server) => {
        const term = search.toLowerCase();
        return server.full_name?.toLowerCase().includes(term) || server.email?.toLowerCase().includes(term);
    });

    const handleAdd = async (event) => {
        event.preventDefault();
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

    const handleEdit = async (event) => {
        event.preventDefault();
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

    const openAdd = () => {
        setForm(emptyForm);
        setError("");
        setShowAdd(true);
    };

    const openEdit = (server) => {
        setSelected(server);
        setForm({
            full_name: server.full_name || "",
            email: server.email || "",
            password: "",
            phone: server.server?.phone || "",
            nfc_card_id: server.server?.nfc_card?.id || "",
        });
        setError("");
        setShowEdit(true);
    };

    const renderForm = (onSubmit, submitLabel) => (
        <form onSubmit={onSubmit}>
            <Input label="Full name" name="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label={showEdit ? "New password (leave blank to keep)" : "Password"} type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!showEdit} />
            <Input label="Phone" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="field">
                <label>Assign NFC card</label>
                <select className="select" value={form.nfc_card_id} onChange={(e) => setForm({ ...form, nfc_card_id: e.target.value })}>
                    <option value="">No NFC card</option>
                    {availableCards.map((card) => {
                        const isCurrent = selected?.server?.nfc_card?.id === card.id;
                        const isAssigned = card.server_id !== null;
                        return (
                            <option key={card.id} value={card.id}>
                                {card.uid} {isCurrent ? "(Current)" : isAssigned ? "(Assigned)" : ""}
                            </option>
                        );
                    })}
                </select>
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="form-actions">
                <button className="button secondary" type="button" onClick={() => { setShowAdd(false); setShowEdit(false); }}>
                    Cancel
                </button>
                <button className="button" type="submit" disabled={saving}>
                    {saving ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );

    return (
        <div className="page">
            <header className="page-header">
                <div className="page-title">
                    <h1>Servers</h1>
                    <p>Add team members, assign cards, and keep profile details current.</p>
                </div>
                <button className="button" type="button" onClick={openAdd}>
                    <Plus size={18} /> Add server
                </button>
            </header>

            <div className="toolbar">
                <div className="search-field">
                    <Search size={18} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" />
                </div>
            </div>

            <section className="panel">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {["Name", "Email", "Phone", "NFC card", "Reviews", "Status", "Actions"].map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="loading-state">Loading servers...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="empty-state">No servers found.</td></tr>
                            ) : filtered.map((server) => (
                                <tr key={server.id}>
                                    <td>
                                        <div className="identity">
                                            <span className="avatar">{server.full_name?.slice(0, 1).toUpperCase() || "S"}</span>
                                            {server.full_name}
                                        </div>
                                    </td>
                                    <td>{server.email}</td>
                                    <td>{server.server?.phone || "-"}</td>
                                    <td>{server.server?.nfc_card ? <span className="code-pill">{server.server.nfc_card.uid}</span> : "-"}</td>
                                    <td>{server.server?.total_reviews ?? 0}</td>
                                    <td>
                                        <span className={`status-pill ${server.is_active ? "active" : "inactive"}`}>
                                            {server.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="icon-action" type="button" onClick={() => openEdit(server)} aria-label="Edit server" title="Edit server">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-action danger" type="button" onClick={() => handleDelete(server.id)} aria-label="Delete server" title="Delete server">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {showAdd && <Modal title="Add server" onClose={() => setShowAdd(false)}>{renderForm(handleAdd, "Add server")}</Modal>}
            {showEdit && <Modal title="Edit server" onClose={() => setShowEdit(false)}>{renderForm(handleEdit, "Save changes")}</Modal>}
        </div>
    );
}

export default Servers;
