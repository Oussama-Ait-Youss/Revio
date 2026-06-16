import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
    const { token } = useAuth();
    if (!token) return <Navigate to="/" replace />;
    return children;
}

export function AdminRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== "ADMIN") return <Navigate to={`/${user.role?.toLowerCase()}/dashboard`} replace />;
    return children;
}

export function ManagerRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== "MANAGER") return <Navigate to={`/${user.role?.toLowerCase()}/dashboard`} replace />;
    return children;
}

export function ServerRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== "SERVER") return <Navigate to={`/${user.role?.toLowerCase()}/dashboard`} replace />;
    return children;
}

export default ProtectedRoute;