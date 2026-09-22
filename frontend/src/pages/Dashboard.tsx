import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  DoorOpen,
  Users,
  CreditCard,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { propertiesApi, type Property } from '../api/properties';
import { roomsApi, type Room } from '../api/rooms';
import { bookingsApi, type Booking } from '../api/bookings';
import { reviewsApi, type Review } from '../api/reviews';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [propsRes, roomsRes, bookingsRes] = await Promise.allSettled([
          propertiesApi.getAll(),
          roomsApi.getAll(),
          bookingsApi.getAll({ limit: 8 }),
        ]);

        if (propsRes.status === 'fulfilled') setProperties(propsRes.value.data);
        if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data);
        if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data);

        // Fetch recent reviews
        try {
          const revRes = await reviewsApi.getAll();
          setReviews(revRes.data.slice(0, 5));
        } catch {
          // Reviews might not have public endpoint
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      label: 'Properties Managed',
      value: properties.length,
      icon: Building2,
      color: 'from-blue-600 to-cyan-600',
      to: '/properties',
    },
    {
      label: 'Total Hotel Rooms',
      value: rooms.length,
      icon: DoorOpen,
      color: 'from-violet-600 to-purple-600',
      to: '/rooms',
    },
    {
      label: 'Active Bookings',
      value: bookings.length,
      icon: CalendarCheck,
      color: 'from-emerald-600 to-teal-600',
      to: '/bookings',
    },
    {
      label: 'Guest Reviews',
      value: reviews.length,
      icon: Star,
      color: 'from-amber-500 to-orange-600',
      to: '/reviews',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-slate-900 border border-violet-800/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider text-violet-400 uppercase">
              Management Portal
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.email.split('@')[0]}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor room reservations, verify live room availability, manage guest profiles, and review hotel financials.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/bookings">
              <Button variant="primary" icon={<Plus size={16} />}>
                New Booking
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="secondary" icon={<DoorOpen size={16} />}>
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 p-6 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{item.label}</p>
                  <p className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {loading ? '...' : item.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-violet-400 group-hover:text-violet-300 gap-1 font-medium">
                <span>View details</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Reservations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest room bookings across properties</p>
          </div>
          <Link
            to="/bookings"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Guest ID</th>
                <th className="px-6 py-3.5">Room</th>
                <th className="px-6 py-3.5">Stay Dates</th>
                <th className="px-6 py-3.5">Guests</th>
                <th className="px-6 py-3.5">Nightly Rate</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading recent bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No bookings recorded yet. Click "New Booking" to create your first reservation.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-bold text-white">#{b.booking_id}</td>
                    <td className="px-6 py-4 text-slate-300">Guest #{b.guest_id}</td>
                    <td className="px-6 py-4">Room #{b.room_id}</td>
                    <td className="px-6 py-4 text-xs">
                      {b.stay?.start_date} <span className="text-slate-500">to</span> {b.stay?.end_date}
                    </td>
                    <td className="px-6 py-4">{b.guests_count}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">₹{b.nightly_rate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={b.status}>{b.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
