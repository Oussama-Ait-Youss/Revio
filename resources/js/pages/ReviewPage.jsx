import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Send, CheckCircle2 } from 'lucide-react';

const ReviewPage = () => {
  const { token } = useParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, we'd use the token to fetch the specific table/server info
  // useEffect(() => { api.get(`/review-info/${token}`) ... }, [token])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-500 mb-8">
            Your feedback helps us provide the best possible experience.
          </p>
          <button 
            onClick={() => window.close()} // Optional: prompt user to close or return to site
            className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">How was your experience?</h1>
          <p className="text-slate-500 mt-2 text-sm">We'd love to hear your thoughts about your visit today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={48}
                  fill={(hoveredRating || rating) >= star ? 'currentColor' : 'none'}
                  className={`${
                    (hoveredRating || rating) >= star 
                      ? 'text-amber-400' 
                      : 'text-slate-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Any additional comments? (Optional)
            </label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              placeholder="Tell us what you loved or what we can improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} className="mr-2" />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
