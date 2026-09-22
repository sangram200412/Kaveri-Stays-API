import React, { useEffect, useState } from 'react';
import { bookingsApi, type Booking, type BookingCreate, type BookingUpdate } from '../api/bookings';
import { roomsApi, type Room } from '../api/rooms';
import { guestsApi, type Guest } from '../api/guests';
import { paymentsApi } from '../api/payments';
import { reviewsApi } from '../api/reviews';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import {
  CalendarCheck,
  CreditCard,
  Edit,
  Eye,
  Plus,
  Star,
  Trash2,
  Users,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Create Form State
  const [guestId, setGuestId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('1');
  const [nightlyRate, setNightlyRate] = useState('2500');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status/Notes Edit state for detail modal
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updatingBooking, setUpdatingBooking] = useState(false);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paying, setPaying] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, roomsRes, guestsRes] = await Promise.allSettled([
        bookingsApi.getAll({
          status: filterStatus || undefined,
        }),
        roomsApi.getAll(),
        guestsApi.getAll(),
      ]);

      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);
      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value.data);
        if (roomsRes.value.data.length > 0 && !roomId) {
          setRoomId(roomsRes.value.data[0].room_id.toString());
        }
      }
      if (guestsRes.status === 'fulfilled') {
        setGuests(guestsRes.value.data);
        if (guestsRes.value.data.length > 0 && !guestId) {
          setGuestId(guestsRes.value.data[0].guest_id.toString());
        }
      }
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestId || !roomId || !startDate || !endDate) {
      toast.error('Guest, room, and stay dates are required');
      return;
    }
    if (startDate >= endDate) {
      toast.error('Check-out must be after check-in');
      return;
    }

    setSubmitting(true);
    try {
      await bookingsApi.create({
        guest_id: parseInt(guestId),
        room_id: parseInt(roomId),
        stay: {
          start_date: startDate,
          end_date: endDate,
        },
        guests_count: parseInt(guestsCount),
        nightly_rate: parseFloat(nightlyRate),
        notes: notes.trim() || undefined,
      });

      toast.success('Reservation created successfully!');
      setIsCreateOpen(false);
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.notes || '');
    setIsDetailOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    setUpdatingBooking(true);
    try {
      const updateData: BookingUpdate = {
        status: editStatus as any,
        notes: editNotes,
      };
      const res = await bookingsApi.update(selectedBooking.booking_id, updateData);
      toast.success('Booking updated!');
      setSelectedBooking(res.data);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update booking');
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    if (!window.confirm(`Are you sure you want to cancel and delete Booking #${selectedBooking.booking_id}?`)) {
      return;
    }
    try {
      await bookingsApi.delete(selectedBooking.booking_id);
      toast.success('Booking cancelled and removed');
      setIsDetailOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !paymentAmount) return;

    setPaying(true);
    try {
      const idempotencyKey = `pay-${selectedBooking.booking_id}-${Date.now()}`;
      await paymentsApi.create({
        booking_id: selectedBooking.booking_id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        idempotency_key: idempotencyKey,
      });
      toast.success('Payment recorded successfully!');
      setIsPaymentOpen(false);
      setPaymentAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmittingReview(true);
    try {
      await reviewsApi.createForBooking(selectedBooking.booking_id, {
        rating: parseInt(reviewRating),
        review_text: reviewText.trim() || undefined,
      });
      toast.success('Review saved for booking!');
      setIsReviewOpen(false);
      setReviewText('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const guestMap = new Map(guests.map((g) => [g.guest_id, g.full_name]));
  const roomMap = new Map(rooms.map((r) => [r.room_id, r.room_number]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reservations & Bookings</h1>
          <p className="text-sm text-slate-400">Manage guest bookings, check-in statuses, and payments</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
          New Booking
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="w-56">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All Booking Statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'checked_in', label: 'Checked In' },
              { value: 'checked_out', label: 'Checked Out' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Guest</th>
                <th className="px-6 py-3.5">Room</th>
                <th className="px-6 py-3.5">Check-In</th>
                <th className="px-6 py-3.5">Check-Out</th>
                <th className="px-6 py-3.5">Guests</th>
                <th className="px-6 py-3.5">Rate / Night</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    Loading reservations...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No reservations found. Click "New Booking" to reserve a room.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-white">#{b.booking_id}</td>
                    <td className="px-6 py-4 text-slate-200">
                      {guestMap.get(b.guest_id) ? (
                        <span>{guestMap.get(b.guest_id)}</span>
                      ) : (
                        <span className="font-mono text-slate-400">Guest #{b.guest_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-violet-300">
                      Room {roomMap.get(b.room_id) || b.room_id}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{b.stay?.start_date}</td>
                    <td className="px-6 py-4 text-xs font-mono">{b.stay?.end_date}</td>
                    <td className="px-6 py-4">{b.guests_count}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">₹{b.nightly_rate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={b.status}>{b.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Booking Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Reservation" maxWidth="lg">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Guest"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              options={guests.map((g) => ({
                value: g.guest_id.toString(),
                label: `${g.full_name} (${g.phone || g.email})`,
              }))}
              required
            />
            <Select
              label="Select Room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={rooms.map((r) => ({
                value: r.room_id.toString(),
                label: `Room ${r.room_number} (Property #${r.property_id})`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Check-In Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Check-Out Date"
              type="date"
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
              max="10"
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              required
            />
            <Input
              label="Nightly Rate (₹)"
              type="number"
              min="100"
              step="50"
              value={nightlyRate}
              onChange={(e) => setNightlyRate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Special Requests / Notes"
            placeholder="e.g. Airport pickup required, extra pillows"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Booking Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Manage Booking #${selectedBooking.booking_id}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Overview Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Guest:</span>
                <p className="font-semibold text-slate-100 mt-0.5">
                  {guestMap.get(selectedBooking.guest_id) || `Guest #${selectedBooking.guest_id}`}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Room:</span>
                <p className="font-semibold text-violet-300 mt-0.5">
                  Room {roomMap.get(selectedBooking.room_id) || selectedBooking.room_id}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Occupancy:</span>
                <p className="font-semibold text-slate-100 mt-0.5">
                  {selectedBooking.guests_count} Person(s)
                </p>
              </div>
              <div>
                <span className="text-slate-400">Dates:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {selectedBooking.stay?.start_date} → {selectedBooking.stay?.end_date}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Nightly Rate:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">
                  ₹{selectedBooking.nightly_rate}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Current Status:</span>
                <div className="mt-0.5">
                  <Badge variant={selectedBooking.status}>{selectedBooking.status}</Badge>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Update Status & Notes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Change Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  options={[
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'checked_in', label: 'Checked In' },
                    { value: 'checked_out', label: 'Checked Out' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
                <Input
                  label="Booking Notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes or special requests"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  loading={updatingBooking}
                  onClick={handleUpdateBooking}
                  icon={<CheckCircle size={14} />}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<CreditCard size={14} />}
                  onClick={() => {
                    setPaymentAmount(selectedBooking.nightly_rate.toString());
                    setIsPaymentOpen(true);
                  }}
                >
                  Record Payment
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Star size={14} />}
                  onClick={() => setIsReviewOpen(true)}
                >
                  Add Review
                </Button>
              </div>

              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={handleDeleteBooking}
              >
                Cancel Reservation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          title={`Record Payment for Booking #${selectedBooking.booking_id}`}
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
                { value: 'cash', label: 'Cash at Front Desk' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ]}
            />
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={paying}>
                Complete Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Review Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Add Review for Booking #${selectedBooking.booking_id}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <Select
              label="Star Rating"
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
              options={[
                { value: '5', label: '★★★★★ 5 Stars - Exceptional' },
                { value: '4', label: '★★★★☆ 4 Stars - Very Good' },
                { value: '3', label: '★★★☆☆ 3 Stars - Average' },
                { value: '2', label: '★★☆☆☆ 2 Stars - Below Expectations' },
                { value: '1', label: '★☆☆☆☆ 1 Star - Poor' },
              ]}
            />
            <Input
              label="Review Comments"
              placeholder="Share guest feedback regarding stay, amenities, and staff hospitality"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submittingReview}>
                Submit Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
