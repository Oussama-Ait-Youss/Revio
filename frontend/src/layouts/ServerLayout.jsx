import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const ServerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-emerald-600 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
              <User size={18} />
            </div>
            <div>
              <div className="text-sm font-bold">{user?.name || 'Server'}</div>
              <div className="text-xs text-emerald-200">Personal Dashboard</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ServerLayout;
