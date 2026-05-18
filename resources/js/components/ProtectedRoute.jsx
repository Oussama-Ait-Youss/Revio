import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role if they try to access an unauthorized route
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'SERVER') return <Navigate to="/server" replace />;
    
    // Fallback
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
