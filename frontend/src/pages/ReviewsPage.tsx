import React, { useEffect, useState } from 'react';
import { reviewsApi, type Review } from '../api/reviews';
import { Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const res = await reviewsApi.getAll();
        setReviews(res.data);
      } catch {
        toast.error('Failed to load guest reviews');
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Guest Reviews & Ratings</h1>
        <p className="text-sm text-slate-400">Customer feedback and satisfaction ratings on completed stays</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading guest reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Star size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No reviews submitted yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Reviews are submitted by guests or staff directly from the reservation management screen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div
              key={r.review_id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= r.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Booking #{r.booking_id}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-200 italic">
                    "{r.review_text || 'No written feedback provided.'}"
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Review ID #{r.review_id}</span>
                <span>{r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
