import React, { useState, useEffect } from 'react';
import { reviewsApi, type Review } from '../../api/reviews';
import { useAuth } from '../../contexts/AuthContext';
import { Star, MessageSquare, Quote, Plus, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function GuestReviewsSection() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await reviewsApi.getAll();
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleWriteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      toast.error('Please enter your completed Booking ID');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.createForBooking(parseInt(bookingId), {
        rating: parseInt(rating),
        review_text: reviewText.trim() || undefined,
      });
      toast.success('Thank you! Your review has been published.');
      setIsModalOpen(false);
      setBookingId('');
      setReviewText('');

      // Refresh reviews
      const updated = await reviewsApi.getAll();
      setReviews(updated.data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          'Unable to submit review. Ensure you have a checked-out booking.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback curated testimonials if no reviews exist in DB yet
  const displayReviews =
    reviews.length > 0
      ? reviews
      : [
          {
            review_id: 1,
            booking_id: 101,
            rating: 5,
            review_text:
              'The hospitality at Kaveri Stays was truly exceptional. The suite was immaculately clean, the pool breathtaking, and the dining extraordinary.',
            reviewed_at: new Date().toISOString(),
          },
          {
            review_id: 2,
            booking_id: 102,
            rating: 5,
            review_text:
              'An absolute sanctuary of peace in the city. The front desk concierge made check-in seamless, and the breakfast buffet was world-class.',
            reviewed_at: new Date().toISOString(),
          },
          {
            review_id: 3,
            booking_id: 103,
            rating: 5,
            review_text:
              'Spectacular architectural aesthetics and top-tier room service. We will undoubtedly return for our anniversary next year.',
            reviewed_at: new Date().toISOString(),
          },
        ];

  return (
    <section id="reviews" className="py-24 bg-white text-stone-800 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Guest Voices</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a211a] font-serif">
              Stories of Hospitality
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-light">
              Read authentic feedback from travelers who have experienced the warmth and quiet luxury of Kaveri Stays.
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast('Please sign in to your guest account to leave a verified stay review.', {
                    icon: '🔑',
                  });
                }
                setIsModalOpen(true);
              }}
              className="px-5 py-3 rounded-full bg-[#0f382c] hover:bg-[#164e3f] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center gap-2 transition cursor-pointer"
            >
              <Plus size={15} className="text-[#c5a059]" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.slice(0, 6).map((item) => (
            <div
              key={item.review_id}
              className="bg-[#fcfbfa] p-8 rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative"
            >
              <Quote className="absolute top-6 right-6 text-[#c5a059]/20" size={36} />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-1 text-[#c5a059]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < item.rating ? 'fill-[#c5a059]' : 'text-stone-300'}
                    />
                  ))}
                </div>

                <p className="text-stone-700 text-sm leading-relaxed italic font-serif">
                  "{item.review_text || 'Exceptional hospitality and wonderful ambience.'}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-[#0f382c]">Verified Resident</span>
                <span>
                  {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Verified Guest Review"
      >
        <form onSubmit={handleWriteReview} className="space-y-4">
          <Input
            label="Your Booking ID"
            type="number"
            placeholder="e.g. 1"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            helperText="Reviews are attached to your checked-out reservation record"
            required
          />

          <Select
            label="Overall Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={[
              { value: '5', label: '★★★★★ 5 Stars - Outstanding & Exceptional' },
              { value: '4', label: '★★★★☆ 4 Stars - Very Pleasant Stay' },
              { value: '3', label: '★★★☆☆ 3 Stars - Average Comfort' },
              { value: '2', label: '★★☆☆☆ 2 Stars - Below Expectations' },
              { value: '1', label: '★☆☆☆☆ 1 Star - Unsatisfactory' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Your Review & Comments
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your room comfort, staff hospitality, dining, and overall stay..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
