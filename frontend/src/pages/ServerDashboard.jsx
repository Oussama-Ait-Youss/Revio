import { Star, TrendingUp, Award, Clock } from 'lucide-react';

const ServerDashboard = () => {
  return (
    <div className="space-y-6 pb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
        <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Your Rating</h2>
        <div className="flex justify-center items-end text-5xl font-extrabold text-slate-900">
          4.8 <span className="text-2xl text-slate-400 ml-1 font-medium">/ 5</span>
        </div>
        <div className="flex justify-center mt-3 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={24} fill={i < 4 ? 'currentColor' : 'none'} className={i === 4 ? 'text-slate-300' : ''} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-medium mb-1">Reviews Today</div>
          <div className="flex items-center text-2xl font-bold text-slate-900">
            12
            <TrendingUp size={16} className="text-emerald-500 ml-2" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-medium mb-1">Rank</div>
          <div className="flex items-center text-2xl font-bold text-slate-900">
            Top 10%
            <Award size={16} className="text-amber-500 ml-2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Clock size={20} className="mr-2 text-slate-400" />
          Recent Feedback
        </h3>
        
        <div className="space-y-4">
          {[
            { text: "Very attentive and friendly! Made our anniversary special.", time: "10 mins ago", rating: 5 },
            { text: "Food came out quick, great recommendations.", time: "1 hour ago", rating: 5 },
            { text: "Good service, but it was very busy.", time: "3 hours ago", rating: 4 },
          ].map((review, i) => (
            <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
              <div className="flex text-amber-400 mb-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill={j < review.rating ? 'currentColor' : 'none'} className={j >= review.rating ? 'text-slate-300' : ''} />
                ))}
              </div>
              <p className="text-slate-700 text-sm">{review.text}</p>
              <div className="text-xs text-slate-400 mt-2">{review.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServerDashboard;
