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
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'preferences' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders size={18} className="mr-2" /> Preferences
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProfileSubmitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center transition-colors"
                  >
                    {isProfileSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>
              <form onSubmit={handleSecurityUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    required
                    type="password"
                    value={securityData.current_password}
                    onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    required
                    type="password"
                    value={securityData.new_password}
                    onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    required
                    type="password"
                    value={securityData.new_password_confirmation}
                    onChange={(e) => setSecurityData({...securityData, new_password_confirmation: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSecuritySubmitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center transition-colors"
                  >
                    {isSecuritySubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Display & Notifications</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Dark Mode</h3>
                    <p className="text-sm text-slate-500">Toggle dark mode appearance.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newMode = !isDarkMode;
                      setIsDarkMode(newMode);
                      localStorage.setItem('darkMode', newMode);
                      if (newMode) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                    <p className="text-sm text-slate-500">Receive daily summaries and alerts.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newSetting = !emailNotifications;
                      setEmailNotifications(newSetting);
                      localStorage.setItem('emailNotifications', newSetting);
                      showToast('Notification preferences updated!');
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
