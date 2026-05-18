import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Sliders, Loader2, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profileData, setProfileData] = useState({ full_name: '', email: '' });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  
  // Security State
  const [securityData, setSecurityData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Preferences State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('emailNotifications') !== 'false');


  useEffect(() => {
    if (user) {
      setProfileData({ 
        full_name: user.full_name || user.name || '', 
        email: user.email || '' 
      });
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    try {
      const response = await api.put('/user/update', profileData);
      updateUser(response.data.user || { ...user, ...profileData, name: profileData.full_name });
      showToast('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.new_password_confirmation) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setIsSecuritySubmitting(true);
    try {
      await api.put('/user/update-password', securityData);
      setSecurityData({ current_password: '', new_password: '', new_password_confirmation: '' });
      showToast('Password updated successfully!');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setIsSecuritySubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 mr-2" />}
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your restaurant preferences and account settings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'profile' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <User size={18} className="mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'security' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Lock size={18} className="mr-2" /> Security
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSecurityUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  value={securityData.current_password}
                  onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  value={securityData.new_password}
                  onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  value={securityData.new_password_confirmation}
                  onChange={(e) => setSecurityData({...securityData, new_password_confirmation: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={isSecuritySubmitting}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isSecuritySubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
