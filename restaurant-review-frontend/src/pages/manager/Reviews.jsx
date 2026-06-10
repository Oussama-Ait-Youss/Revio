import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, RotateCcw, Search, Star } from "lucide-react";
import axiosClient from "../../api/axios";

const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });
const ratings = [5, 4, 3, 2, 1];

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [serverId, setServerId] = useState("");
    const [rating, setRating] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 8;

    const fetchServers = async () => {
        try {
            const response = await axiosClient.get("/servers", { headers: headers() });
            setServers(response.data.data || response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReviews = async (overrides = {}) => {
        setLoading(true);
        setError("");
        try {
            const activeFilters = {
                serverId,
                rating,
                startDate,
                endDate,
                ...overrides,
            };
            const params = new URLSearchParams();
            if (activeFilters.serverId) params.append("server_id", activeFilters.serverId);
            if (activeFilters.rating) params.append("rating", activeFilters.rating);
            if (activeFilters.startDate) params.append("start_date", activeFilters.startDate);
            if (activeFilters.endDate) params.append("end_date", activeFilters.endDate);

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

    useEffect(() => {
        fetchServers();
        fetchReviews();
    }, []);

    const filteredReviews = useMemo(() => {
        const term = query.trim().toLowerCase();
        return reviews.filter((review) => {
            if (!term) return true;
            const serverName = review.server?.user?.full_name || review.server?.user?.name || "";
            const comment = review.comment || "";
            return comment.toLowerCase().includes(term) || serverName.toLowerCase().includes(term) || String(review.id).includes(term);
        });
    }, [reviews, query]);

    const pageCount = Math.max(1, Math.ceil(filteredReviews.length / perPage));
    const currentPageReviews = filteredReviews.slice((page - 1) * perPage, page * perPage);

    const clearFilters = () => {
        setQuery("");
        setServerId("");
        setRating("");
        setStartDate("");
        setEndDate("");
        setPage(1);
        fetchReviews({ serverId: "", rating: "", startDate: "", endDate: "" });
    };

    return (
        <div className="page">
            <header className="page-header">
                <div className="page-title">
                    <h1>Reviews</h1>
                    <p>Filter guest feedback by server, date, rating, or keyword.</p>
                </div>
            </header>

            <section className="panel padded" style={{ marginBottom: 16 }}>
                <div className="toolbar">
                    <div className="search-field">
                        <Search size={18} />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reviews, servers, or IDs" />
                    </div>
                    <div className="actions">
                        <button className="button" type="button" onClick={fetchReviews}>
                            <Filter size={17} /> Apply
                        </button>
                        <button className="button secondary" type="button" onClick={clearFilters}>
                            <RotateCcw size={17} /> Reset
                        </button>
                    </div>
                </div>

                <div className="filters-grid">
                    <div className="field">
                        <label>Server</label>
                        <select className="select" value={serverId} onChange={(e) => setServerId(e.target.value)}>
                            <option value="">All servers</option>
                            {servers.map((server) => (
                                <option key={server.server?.id || server.id} value={server.server?.id}>
                                    {server.full_name || server.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Rating</label>
                        <select className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
                            <option value="">Any rating</option>
                            {ratings.map((value) => (
                                <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>From</label>
                        <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="field">
                        <label>To</label>
                        <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <h2>Matched reviews</h2>
                        <p className="panel-subtitle">{filteredReviews.length} review{filteredReviews.length === 1 ? "" : "s"} found</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading reviews...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : filteredReviews.length === 0 ? (
                    <div className="empty-state">No reviews matched your filters.</div>
                ) : (
                    <>
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {["ID", "Server", "Rating", "Comment", "Date"].map((header) => <th key={header}>{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageReviews.map((review) => (
                                        <tr key={review.id}>
                                            <td>#{review.id}</td>
                                            <td>{review.server?.user?.full_name || "Unknown"}</td>
                                            <td>
                                                <span className={`rating-pill ${review.rating >= 4 ? "good" : review.rating >= 3 ? "neutral" : "bad"}`}>
                                                    <Star size={14} fill="currentColor" />
                                                    {review.rating}/5
                                                </span>
                                            </td>
                                            <td>{review.comment || "No comment"}</td>
                                            <td>{review.created_at ? new Date(review.created_at).toLocaleDateString() : "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            <span className="muted">Showing {currentPageReviews.length} of {filteredReviews.length}</span>
                            <div className="actions">
                                <button className="icon-action" type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} aria-label="Previous page" title="Previous page">
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="muted">{page} / {pageCount}</span>
                                <button className="icon-action" type="button" onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))} disabled={page === pageCount} aria-label="Next page" title="Next page">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default Reviews;
