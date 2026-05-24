import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axios";
import { Search, ChevronLeft, ChevronRight, FileSearch } from "lucide-react";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });
const ratings = [5, 4, 3, 2, 1];
const statuses = [
    { value: "", label: "Any" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [serverId, setServerId] = useState("");
    const [rating, setRating] = useState("");
    const [status, setStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 8;

    useEffect(() => {
        fetchServers();
        fetchReviews();
    }, []);

    const fetchServers = async () => {
        try {
            const response = await axiosClient.get("/servers", { headers: headers() });
            setServers(response.data.data || response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (serverId) params.append("server_id", serverId);
            if (rating) params.append("rating", rating);
            if (status) params.append("status", status);
            if (startDate) params.append("start_date", startDate);
            if (endDate) params.append("end_date", endDate);

            const queryString = params.toString();
            const response = await axiosClient.get(`/reviews${queryString ? `?${queryString}` : ""}`, {
                headers: headers(),
            });
            setReviews(response.data || []);
            setPage(1);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load reviews.");
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = useMemo(() => {
        const term = query.trim().toLowerCase();
        return reviews.filter(review => {
            if (!term) return true;
            const serverName = review.server?.user?.full_name || review.server?.user?.name || "";
            const comment = review.comment || "";
            return (
                comment.toLowerCase().includes(term) ||
                serverName.toLowerCase().includes(term) ||
                String(review.id).includes(term)
            );
        });
    }, [reviews, query]);

    const pageCount = Math.max(1, Math.ceil(filteredReviews.length / perPage));
    const currentPageReviews = filteredReviews.slice((page - 1) * perPage, page * perPage);

    const clearFilters = () => {
        setQuery("");
        setServerId("");
        setRating("");
        setStatus("");
        setStartDate("");
        setEndDate("");
        setPage(1);
        fetchReviews();
    };

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem", color: "#111" }}>Review filtering</h1>
                    <p style={{ margin: "0.75rem 0 0", color: "#666", maxWidth: "600px" }}>
                        Search reviews by server, date, rating, and status. Use the filters to refine results for faster review management.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 320px", position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#777" }} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search reviews or server name..."
                            style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: "14px", border: "1px solid #ddd", fontSize: "0.95rem" }}
                        />
                    </div>
                    <button onClick={fetchReviews} style={{ padding: "0 22px", minWidth: "140px", borderRadius: "14px", border: "none", background: "#c9a96e", color: "#fff", cursor: "pointer" }}>
                        Apply filters
                    </button>
                    <button onClick={clearFilters} style={{ padding: "0 22px", minWidth: "140px", borderRadius: "14px", border: "1px solid #ccc", background: "#fff", color: "#333", cursor: "pointer" }}>
                        Clear filters
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>Server</label>
                        <select value={serverId} onChange={e => setServerId(e.target.value)} style={{ width: "100%", borderRadius: "14px", border: "1px solid #ddd", padding: "12px" }}>
                            <option value="">All servers</option>
                            {servers.map(server => (
                                <option key={server.id} value={server.id}>{server.user?.full_name || server.user?.email || `Server ${server.id}`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>Rating</label>
                        <select value={rating} onChange={e => setRating(e.target.value)} style={{ width: "100%", borderRadius: "14px", border: "1px solid #ddd", padding: "12px" }}>
                            <option value="">Any rating</option>
                            {ratings.map(value => (
                                <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", borderRadius: "14px", border: "1px solid #ddd", padding: "12px" }}>
                            {statuses.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>From</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: "100%", borderRadius: "14px", border: "1px solid #ddd", padding: "12px" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>To</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: "100%", borderRadius: "14px", border: "1px solid #ddd", padding: "12px" }} />
                    </div>
                </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "22px", padding: "1.5rem", boxShadow: "0 18px 45px rgba(15,15,15,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <FileSearch size={20} color="#c9a96e" />
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#111" }}>Filtered reviews</h2>
                            <p style={{ margin: "4px 0 0", color: "#777", fontSize: "0.95rem" }}>{filteredReviews.length} review{filteredReviews.length === 1 ? "" : "s"} matched</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: "#888" }}>Loading reviews...</p>
                ) : error ? (
                    <p style={{ color: "#c0392b" }}>{error}</p>
                ) : filteredReviews.length === 0 ? (
                    <p style={{ color: "#888" }}>No reviews matched your filters.</p>
                ) : (
                    <>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                                <thead>
                                    <tr>
                                        {['ID', 'Server', 'Rating', 'Status', 'Comment', 'Date'].map(header => (
                                            <th key={header} style={{ textAlign: "left", padding: "14px 16px", color: "#666", fontSize: "0.9rem", borderBottom: "1px solid #eee" }}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageReviews.map(review => (
                                        <tr key={review.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                            <td style={{ padding: "14px 16px", color: "#333" }}>{review.id}</td>
                                            <td style={{ padding: "14px 16px", color: "#333" }}>{review.server?.user?.full_name || "Unknown"}</td>
                                            <td style={{ padding: "14px 16px", color: "#333" }}>{review.rating}/5</td>
                                            <td style={{ padding: "14px 16px", color: "#333", textTransform: "capitalize" }}>{review.status || "pending"}</td>
                                            <td style={{ padding: "14px 16px", color: "#4f4f4f", maxWidth: "420px" }}>{review.comment || "No comment"}</td>
                                            <td style={{ padding: "14px 16px", color: "#777" }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
                            <p style={{ margin: 0, color: "#555" }}>
                                Showing {currentPageReviews.length} of {filteredReviews.length} reviews
                            </p>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <button
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span style={{ color: "#333" }}>{page} / {pageCount}</span>
                                <button
                                    onClick={() => setPage(prev => Math.min(pageCount, prev + 1))}
                                    disabled={page === pageCount}
                                    style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", cursor: page === pageCount ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Reviews;
