import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ServerLayout from './layouts/ServerLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ServerDashboard from './pages/ServerDashboard';
import ReviewPage from './pages/ReviewPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/review/:token" element={<ReviewPage />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              {/* Other admin routes can be added here */}
            </Route>
          </Route>

          {/* Server Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SERVER']} />}>
            <Route path="/server" element={<ServerLayout />}>
              <Route index element={<ServerDashboard />} />
              {/* Other server routes can be added here */}
            </Route>
          </Route>
          
          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
                <p className="text-slate-500">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
