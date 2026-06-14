import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Star, TrendingUp, UtensilsCrossed, Moon, Sun } from "lucide-react";
import axiosClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function Login() {
    const { user, login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    const dashboardPath = (role) => (role === "ADMIN" ? "/dashboard" : "/dashboard");

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axiosClient.post("/login", formData);
            const { access_token, user } = response.data;
            login(user, access_token);
            const getDestination = (role) => {
                if (role === "ADMIN") return "/admin/dashboard";
                if (role === "MANAGER") return "/manager/dashboard";
                if (role === "SERVER") return "/server/dashboard";
                return "/";
            };
            navigate(getDestination(user.role), { replace: true });
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

    useEffect(() => {
        if (!user) return;
        const getDestination = (role) => {
            if (role === "ADMIN") return "/admin/dashboard";
            if (role === "MANAGER") return "/manager/dashboard";
            if (role === "SERVER") return "/server/dashboard";
            return "/";
        };
        navigate(getDestination(user.role), { replace: true });
    }, [user, navigate]);

    return (
        <div className="login-page relative">
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-3 bg-surface border border-panel-border text-muted rounded-full hover:bg-surface-muted cursor-pointer shadow-sm transition-all"
                title="Toggle Theme"
            >
                {theme === "dark" ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
            </button>
            <section className="login-visual">
                <div className="brand-row">
                    <div className="brand-mark">
                        <UtensilsCrossed size={21} />
                    </div>
                    <div className="brand-copy">
                        <strong>Revio</strong>
                        <span>Restaurant review control</span>
                    </div>
                </div>

                <div>
                    <h1>Run service feedback from one calm dashboard.</h1>
                    <p>
                        Track servers, NFC cards, and guest reviews without digging through crowded screens.
                    </p>

                    <div className="login-showcase" aria-hidden="true">
                        <div className="showcase-card">
                            <TrendingUp size={22} />
                            <strong>94%</strong>
                            <span>positive service moments this week</span>
                            <div className="activity-strip">
                                <div className="activity-line" style={{ "--size": "94%" }} />
                                <div className="activity-line" style={{ "--size": "68%" }} />
                            </div>
                        </div>
                        <div className="showcase-card">
                            <Star size={22} />
                            <strong>4.8</strong>
                            <span>average guest rating across active servers</span>
                            <div className="activity-strip">
                                <div className="activity-line" style={{ "--size": "88%" }} />
                                <div className="activity-line" style={{ "--size": "76%" }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="brand-row">
                    <ShieldCheck size={20} />
                    <span>Secure team access</span>
                </div>
            </section>

            <section className="login-panel">
                <div className="auth-card">
                    <h2>Welcome back</h2>
                    <p>Sign in to continue to your Revio workspace.</p>

                    {error && <div className="alert">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="email">Email address</label>
                            <input
                                className="input"
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <div className="password-field">
                                <input
                                    className="input"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    className="icon-button"
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button className="button full" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default Login;
