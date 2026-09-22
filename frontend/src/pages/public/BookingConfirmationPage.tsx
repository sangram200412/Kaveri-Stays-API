import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsApi, type Booking } from '../../api/bookings';
import { roomsApi, type Room } from '../../api/rooms';
import { propertiesApi, type Property } from '../../api/properties';
import { guestsApi, type Guest } from '../../api/guests';
import { paymentsApi } from '../../api/payments';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Home,
  Printer,
  ShieldCheck,
  Building,
  User,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function loadConfirmation() {
      if (!id) return;
      try {
        setLoading(true);
        const bRes = await bookingsApi.getById(parseInt(id));
        setBooking(bRes.data);
        setPaymentAmount(bRes.data.nightly_rate.toString());

        // Check if payments already made
        try {
          const pRes = await paymentsApi.getByBooking(bRes.data.booking_id);
          if (pRes.data && pRes.data.length > 0) {
            setIsPaid(true);
          }
        } catch {
          // Ignore
        }

        // Fetch Room & Property
        try {
          const rRes = await roomsApi.getById(bRes.data.room_id);
          setRoom(rRes.data);

          const propsRes = await propertiesApi.getAll();
          const matchedP = propsRes.data.find((p) => p.property_id === rRes.data.property_id);
          if (matchedP) setProperty(matchedP);
        } catch {
          // Ignore
        }

        // Fetch Guest
        try {
          const gRes = await guestsApi.getById(bRes.data.guest_id);
          setGuest(gRes.data);
        } catch {
          // Ignore
        }
      } catch (err) {
        console.error('Failed to load reservation confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfirmation();
  }, [id]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !paymentAmount) return;

    setPaying(true);
    try {
      const idempotencyKey = `conf-pay-${booking.booking_id}-${Date.now()}`;
      await paymentsApi.create({
        booking_id: booking.booking_id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        idempotency_key: idempotencyKey,
      });
      toast.success('Payment settled successfully! Your voucher is now fully paid.');
      setIsPaid(true);
      setIsPaymentModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#0f382c] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-500">Preparing your reservation voucher...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-800">Reservation Voucher Not Found</h2>
        <p className="text-sm text-stone-500">The requested booking record was not found.</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[#0f382c] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // Calculate nights
  const diffTime = Math.max(
    0,
    new Date(booking.stay.end_date).getTime() - new Date(booking.stay.start_date).getTime()
  );
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * Number(booking.nightly_rate);

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-stone-800 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-20 max-w-4xl mx-auto px-6 w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-xs font-bold tracking-widest text-[#c5a059] uppercase block">
            Reservation Verified
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a211a] font-serif">
            Your Stay is Confirmed!
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            A confirmation voucher has been generated. We look forward to welcoming you to Kaveri Stays.
          </p>
        </div>

        {/* Voucher Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden">
          {/* Voucher Header Banner */}
          <div className="bg-[#0f382c] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#c5a059] uppercase block">
                Official Stay Voucher
              </span>
              <h3 className="text-xl font-bold font-serif mt-0.5">
                Booking Reference #{booking.booking_id}
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Issued on {new Date(booking.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
                Status: {booking.status}
              </span>
              {isPaid ? (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                  Paid in Full
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  Payment Due
                </span>
              )}
            </div>
          </div>

          {/* Voucher Details Grid */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Property & Branch
                </span>
                <p className="text-base font-bold text-stone-900 mt-1">
                  {property?.property_name || `Property #${room?.property_id || 1}`}
                </p>
                <p className="text-xs text-stone-500">{property?.city || 'South India'}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Accommodation
                </span>
                <p className="text-base font-bold text-[#0f382c] mt-1">
                  Room {room?.room_number || booking.room_id}
                </p>
                <p className="text-xs text-stone-500">{booking.guests_count} Registered Guest(s)</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Check-In
                </span>
                <p className="text-base font-bold text-stone-900 mt-1">
                  {booking.stay.start_date}
                </p>
                <p className="text-xs text-stone-500">From 2:00 PM</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Check-Out
                </span>
                <p className="text-base font-bold text-stone-900 mt-1">
                  {booking.stay.end_date}
                </p>
                <p className="text-xs text-stone-500">Until 11:00 AM</p>
              </div>
            </div>

            {/* Guest Details & Special Requests */}
            <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Primary Resident Profile
                </span>
                <p className="font-semibold text-stone-800 text-sm">
                  {guest?.full_name || `Guest Profile #${booking.guest_id}`}
                </p>
                <p className="text-stone-500">{guest?.email || 'Registered Resident'}</p>
                {guest?.phone && <p className="text-stone-500">{guest.phone}</p>}
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Special Notes & Requests
                </span>
                <p className="text-stone-700 italic">
                  "{booking.notes || 'No special requests recorded for this reservation.'}"
                </p>
              </div>
            </div>

            {/* Financial Ledger Section */}
            <div className="pt-6 border-t border-stone-100 bg-[#fcfbfa] p-5 rounded-2xl border border-stone-200/80 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Room Tariff ({nights} Nights × ₹{booking.nightly_rate}):</span>
                <span className="font-semibold text-stone-800">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Luxury Resort Fees:</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0a211a] pt-2 border-t border-stone-200 font-serif">
                <span>Total Amount:</span>
                <span className="text-[#0f382c]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Voucher Actions Footer */}
          <div className="bg-stone-50 px-6 sm:px-8 py-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Voucher</span>
              </button>
              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition"
              >
                <Home size={14} />
                <span>Back to Home</span>
              </Link>
            </div>

            {!isPaid && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#0f382c] hover:bg-[#164e3f] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center gap-2 transition cursor-pointer"
              >
                <CreditCard size={15} className="text-[#c5a059]" />
                <span>Settle Payment Now</span>
              </button>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Settle Payment for Voucher #${booking.booking_id}`}
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'card', label: 'Credit / Debit Card' },
              { value: 'upi', label: 'UPI / NetBanking' },
              { value: 'cash', label: 'Cash at Concierge Desk' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={paying}>
              Complete Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
