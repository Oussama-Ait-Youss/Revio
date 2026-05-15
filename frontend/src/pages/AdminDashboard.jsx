import { TrendingUp, Users, Star, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here's what's happening at your restaurant today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reviews" value="1,284" icon={Star} trend={12.5} />
        <StatCard title="Average Rating" value="4.8" icon={TrendingUp} trend={2.1} />
        <StatCard title="Active Servers" value="24" icon={Users} trend={0} />
        <StatCard title="NFC Taps Today" value="156" icon={Activity} trend={18.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div className="flex text-amber-400 mr-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-medium">"Amazing service by Sarah! Food was excellent."</p>
                  <p className="text-slate-500 text-xs mt-1">Table 12 • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Servers</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah J.', rating: 4.9, reviews: 42 },
              { name: 'Mike T.', rating: 4.8, reviews: 38 },
              { name: 'Emily R.', rating: 4.7, reviews: 31 },
            ].map((server, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 mr-3">
                    {server.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{server.name}</div>
                    <div className="text-xs text-slate-500">{server.reviews} reviews</div>
                  </div>
                </div>
                <div className="flex items-center font-bold text-emerald-600">
                  {server.rating} <Star size={14} className="ml-1" fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
