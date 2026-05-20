import { useState } from "react";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import axiosClient from "../../api/axios";
 
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
 
    const [formData, setFormData] = useState({
        email: "",
        password: "",
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
            const response = await axiosClient.post("/login", formData);
            const { access_token, user } = response.data;
 
            localStorage.setItem("token", access_token);
            localStorage.setItem("user", JSON.stringify(user));
 
            window.location.href = "/dashboard";
        } catch (error) {
            if (error.response?.status === 422) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Georgia', serif" }}>
 
            {/* Left Panel */}
            <div style={{
                width: "45%",
                background: "#0f0f0f",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "3rem",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Decorative circle */}
                <div style={{
                    position: "absolute",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.06)",
                    top: "-100px",
                    right: "-150px",
                }} />
                <div style={{
                    position: "absolute",
                    width: "250px",
                    height: "250px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.04)",
                    bottom: "80px",
                    left: "-80px",
                }} />
 
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
                    <div style={{
                        width: "36px",
                        height: "36px",
                        background: "#c9a96e",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <UtensilsCrossed size={18} color="#0f0f0f" />
                    </div>
                    <span style={{ color: "#fff", fontSize: "16px", letterSpacing: "0.08em", fontFamily: "Georgia, serif" }}>
                        REVIO
                    </span>
                </div>
 
                {/* Center quote */}
                <div style={{ zIndex: 1 }}>
                    <p style={{
                        color: "#c9a96e",
                        fontSize: "11px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                        fontFamily: "sans-serif",
                    }}>
                        Restaurant Intelligence
                    </p>
                    <h1 style={{
                        color: "#fff",
                        fontSize: "2.8rem",
                        lineHeight: 1.15,
                        fontWeight: "normal",
                        margin: 0,
                        maxWidth: "320px",
                    }}>
                        Every great meal deserves to be remembered.
                    </h1>
                </div>
 
                {/* Bottom tagline */}
                <p style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "13px",
                    fontFamily: "sans-serif",
                    zIndex: 1,
                    margin: 0,
                }}>
                    Manage reviews. Track performance. Elevate experience.
                </p>
            </div>
 
            {/* Right Panel */}
            <div style={{
                flex: 1,
                background: "#fafaf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
            }}>
                <div style={{ width: "100%", maxWidth: "400px" }}>
 
                    <h2 style={{
                        fontSize: "1.8rem",
                        fontWeight: "normal",
                        color: "#0f0f0f",
                        margin: "0 0 0.5rem",
                    }}>
                        Welcome back
                    </h2>
                    <p style={{
                        color: "#888",
                        fontSize: "14px",
                        fontFamily: "sans-serif",
                        margin: "0 0 2.5rem",
                    }}>
                        Sign in to your dashboard
                    </p>
 
                    {/* Error message */}
                    {error && (
                        <div style={{
                            background: "#fff0f0",
                            border: "1px solid #fcc",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginBottom: "1.5rem",
                            color: "#c0392b",
                            fontSize: "14px",
                            fontFamily: "sans-serif",
                        }}>
                            {error}
                        </div>
                    )}
 
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
 
                        {/* Email */}
                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "12px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "#555",
                                fontFamily: "sans-serif",
                                marginBottom: "8px",
                            }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                style={{
                                    width: "100%",
                                    padding: "14px 16px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                    fontFamily: "sans-serif",
                                    background: "#fff",
                                    color: "#0f0f0f",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "#c9a96e"}
                                onBlur={e => e.target.style.borderColor = "#ddd"}
                            />
                        </div>
 
                        {/* Password */}
                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "12px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "#555",
                                fontFamily: "sans-serif",
                                marginBottom: "8px",
                            }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "14px 48px 14px 16px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        fontFamily: "sans-serif",
                                        background: "#fff",
                                        color: "#0f0f0f",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={e => e.target.style.borderColor = "#c9a96e"}
                                    onBlur={e => e.target.style.borderColor = "#ddd"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#aaa",
                                        padding: 0,
                                        display: "flex",
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
 
                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "15px",
                                background: loading ? "#888" : "#0f0f0f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                fontFamily: "sans-serif",
                                cursor: loading ? "not-allowed" : "pointer",
                                marginTop: "0.5rem",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.background = "#c9a96e" }}
                            onMouseLeave={e => { if (!loading) e.target.style.background = "#0f0f0f" }}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
 
                    </form>
 
                    <p style={{
                        marginTop: "2rem",
                        color: "#bbb",
                        fontSize: "12px",
                        fontFamily: "sans-serif",
                        textAlign: "center",
                    }}>
                        © 2026 Revio. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
 
export default Login;