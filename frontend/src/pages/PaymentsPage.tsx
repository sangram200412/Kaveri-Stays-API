import React, { useEffect, useState } from 'react';
import { paymentsApi, type Payment, type PaymentCreate } from '../api/payments';
import { bookingsApi, type Booking } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { CreditCard, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Record payment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, bookingsRes] = await Promise.allSettled([
        paymentsApi.getAll(),
        bookingsApi.getAll({ limit: 50 }),
      ]);

      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data);
      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data);
        if (bookingsRes.value.data.length > 0 && !bookingId) {
          setBookingId(bookingsRes.value.data[0].booking_id.toString());
        }
      }
    } catch {
      toast.error('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !amount) {
      toast.error('Booking ID and amount are required');
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = `manual-${bookingId}-${Date.now()}`;
      await paymentsApi.create({
        booking_id: parseInt(bookingId),
        amount: parseFloat(amount),
        method,
        idempotency_key: idempotencyKey,
      });
      toast.success('Payment recorded successfully!');
      setIsModalOpen(false);
      setAmount('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payments & Financial Ledger</h1>
          <p className="text-sm text-slate-400">Track all guest transactions, invoices, and idempotent payments</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          Record Payment
        </Button>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Payment ID</th>
                <th className="px-6 py-3.5">Booking</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Idempotency Key</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No payment records yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono text-slate-400">#{p.payment_id}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      Booking #{p.booking_id}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-bold text-base">
                      ₹{p.amount}
                    </td>
                    <td className="px-6 py-4 capitalize">{p.method}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-[150px] truncate" title={p.idempotency_key || ''}>
                      {p.idempotency_key || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="confirmed">Paid</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <Select
            label="Associated Booking"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            options={bookings.map((b) => ({
              value: b.booking_id.toString(),
              label: `Booking #${b.booking_id} - Guest #${b.guest_id} (Room #${b.room_id})`,
            }))}
            required
          />
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select
            label="Payment Method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={[
              { value: 'card', label: 'Credit / Debit Card' },
              { value: 'upi', label: 'UPI / NetBanking' },
              { value: 'cash', label: 'Cash at Front Desk' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Process Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
