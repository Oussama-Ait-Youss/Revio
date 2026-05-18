import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  UtensilsCrossed 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Servers', href: '/admin/servers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <UtensilsCrossed className="h-8 w-8 text-emerald-600 mr-2" />
          <span className="text-xl font-bold text-slate-900">Revio Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center px-4 py-3 mb-2 text-sm font-medium text-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate flex-1">
              <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center">
            <UtensilsCrossed className="h-6 w-6 text-emerald-600 mr-2" />
            <span className="text-lg font-bold text-slate-900">Revio</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-slate-700">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
