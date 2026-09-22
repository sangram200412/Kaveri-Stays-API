import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi } from '../../api/bookings';
import { type Room } from '../../api/rooms';
import { type RoomType } from '../../api/roomTypes';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar, Users, Hotel, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  roomType?: RoomType | null;
  initialDates?: { checkIn: string; checkOut: string; guestsCount: number };
}

export function BookingModal({
  isOpen,
  onClose,
  room,
  roomType,
  initialDates,
}: BookingModalProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(initialDates?.checkIn || today);
  const [endDate, setEndDate] = useState(initialDates?.checkOut || tomorrow);
  const [guestsCount, setGuestsCount] = useState(
    initialDates?.guestsCount?.toString() || '2'
  );
  const [nightlyRate] = useState('2499');
  const [notes, setNotes] = useState('');
  const [guestId, setGuestId] = useState(user?.guest_id ? user.guest_id.toString() : '1');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!room) return null;

  // Calculate estimated nights and total
  const diffTime = Math.max(0, new Date(endDate).getTime() - new Date(startDate).getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalTariff = nights * parseFloat(nightlyRate);

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!startDate || !endDate) {
      setErrorMessage('Please select both check-in and check-out dates.');
      return;
    }
    if (startDate >= endDate) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      return;
    }

    const maxCap = roomType?.max_occupancy || 4;
    if (parseInt(guestsCount) > maxCap) {
      setErrorMessage(`Guest count exceeds the maximum capacity of ${maxCap} for this suite.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guest_id: parseInt(guestId) || (user?.guest_id || 1),
        room_id: room.room_id,
        stay: {
          start_date: startDate,
          end_date: endDate,
        },
        guests_count: parseInt(guestsCount),
        nightly_rate: parseFloat(nightlyRate),
        notes: notes.trim() || undefined,
      };

      const response = await bookingsApi.create(payload);
      toast.success('Your reservation has been confirmed!');
      onClose();
      navigate(`/booking-confirmation/${response.data.booking_id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let msg = 'Unable to complete reservation. Please review your details.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail[0].msg || msg;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Reservation"
      maxWidth="lg"
    >
      {!isAuthenticated ? (
        /* Sign-in prompt if not authenticated */
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center mx-auto">
            <Hotel size={28} />
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-serif">
            Sign In to Reserve Room {room.room_number}
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            To link your reservation, protect booking details, and receive your stay confirmation voucher, please sign in to your Kaveri Stays account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0f382c] hover:bg-[#164e3f] text-white font-bold text-xs uppercase tracking-wider shadow"
            >
              Sign In to Account
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs uppercase tracking-wider"
            >
              Create New Account
            </Link>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleConfirmReservation} className="space-y-5">
          {/* Room Summary Card */}
          <div className="bg-[#f7f5ef] p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">
                Selected Accommodation
              </span>
              <h4 className="text-base font-bold text-[#0a211a] font-serif">
                {roomType?.type_name || 'Deluxe Suite'} — Room {room.room_number}
              </h4>
              <p className="text-xs text-stone-500">
                Max Capacity: {roomType?.max_occupancy || 2} Guests • Star Comfort
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0f382c] font-serif">₹{nightlyRate}</span>
              <span className="text-xs text-stone-500 block">/ night</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dates & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Check-In Date"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Check-Out Date"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Number of Guests"
              type="number"
              min="1"
              max={roomType?.max_occupancy || 6}
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              required
            />
            <Input
              label="Assigned Guest Record ID"
              type="number"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              helperText="Guest profile in database"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Special Requests & Preferences
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Quiet upper floor, arrival after 8 PM, extra feather pillows..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
            />
          </div>

          {/* Pricing Estimation Summary */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-semibold text-stone-800">{nights} Night(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Tariff Rate:</span>
              <span>₹{nightlyRate} × {nights}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#0a211a] pt-1 border-t border-stone-200 font-serif">
              <span>Total Estimated Stay:</span>
              <span className="text-[#0f382c]">₹{totalTariff.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="px-6 py-2.5 rounded-full bg-[#0f382c] hover:bg-[#164e3f] text-white font-bold uppercase tracking-wider text-xs"
            >
              Confirm & Reserve Room
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
