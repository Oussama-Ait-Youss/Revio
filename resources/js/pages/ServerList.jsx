import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, UserPlus, Loader2, X, Star } from 'lucide-react';

const ServerList = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await api.get('/manager/servers');
      setServers(response.data.data || response.data);
    } catch (err) {
      console.error("Failed to fetch servers");
      console.error("Backend Error Response:", err.response?.data);
      setError("Failed to load servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/manager/servers', formData);
      const newServer = response.data.server || response.data;
      setServers((prev) => [...prev, newServer]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      console.error("Failed to add server", err);
      setModalError(err.response?.data?.message || 'Failed to add server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Servers</h1>
          <p className="text-slate-500 mt-1">View and manage your restaurant's serving staff.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <UserPlus size={20} className="mr-2" />
          Add Server
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Name</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Email</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm">Phone</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-sm text-center">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No servers found.</p>
                  </td>
                </tr>
              ) : (
                servers.map((server) => (
                  <tr key={server.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900 font-medium">{server.name}</td>
                    <td className="px-6 py-4 text-slate-600">{server.email}</td>
                    <td className="px-6 py-4 text-slate-600">{server.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700">
                        {server.review_count || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Add New Server</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddServer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerList;
