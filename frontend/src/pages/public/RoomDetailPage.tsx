import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomsApi, type Room } from '../../api/rooms';
import { roomTypesApi, type RoomType } from '../../api/roomTypes';
import { propertiesApi, type Property } from '../../api/properties';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { BookingModal } from '../../components/public/BookingModal';
import {
  Users,
  Wifi,
  Wind,
  Tv,
  Coffee,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Star,
  Check,
  Building,
  Sparkles,
} from 'lucide-react';

const roomPhotos = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
];

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await roomsApi.getById(parseInt(id));
        setRoom(res.data);

        // Fetch room type and property details
        const [typesRes, propsRes] = await Promise.allSettled([
          roomTypesApi.getAll(),
          propertiesApi.getAll(),
        ]);

        if (typesRes.status === 'fulfilled') {
          const matchedType = typesRes.value.data.find(
            (t) => t.room_type_id === res.data.room_type_id
          );
          if (matchedType) setRoomType(matchedType);
        }

        if (propsRes.status === 'fulfilled') {
          const matchedProp = propsRes.value.data.find(
            (p) => p.property_id === res.data.property_id
          );
          if (matchedProp) setProperty(matchedProp);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#0f382c] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-500">Loading suite appointments...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-800">Suite Not Found</h2>
        <p className="text-sm text-stone-500">The requested room does not exist or has been relocated.</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[#0f382c] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Accommodations
        </Link>
      </div>
    );
  }

  const amenities = [
    { icon: Wifi, label: 'High-speed Fiber Wi-Fi' },
    { icon: Wind, label: 'Climate Control Air Conditioning' },
    { icon: Tv, label: '55" Ultra HD Smart TV' },
    { icon: Coffee, label: 'Espresso Bar & Electric Kettle' },
    { icon: Sparkles, label: 'Luxury Marble En-suite Bathroom' },
    { icon: ShieldCheck, label: 'In-Room Electronic Safe' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-800 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-10 w-full space-y-10">
        {/* Back navigation */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0f382c] hover:text-[#c5a059] transition"
          >
            <ArrowLeft size={14} />
            <span>Back to All Accommodations</span>
          </Link>
        </div>

        {/* Gallery Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-stone-200">
          <div className="md:col-span-2 h-full overflow-hidden">
            <img
              src={roomPhotos[0]}
              alt={roomType?.type_name || `Room ${room.room_number}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="h-1/2 overflow-hidden">
              <img
                src={roomPhotos[1]}
                alt="Suite Bed View"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="h-1/2 overflow-hidden">
              <img
                src={roomPhotos[2]}
                alt="Suite Lounge View"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Suite Specifications & Booking Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Suite Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
                  {roomType?.type_name || 'Executive'}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs font-semibold text-stone-600">
                  Room #{room.room_number}
                </span>
                {property && (
                  <>
                    <span className="text-stone-400">•</span>
                    <span className="text-xs text-stone-600 flex items-center gap-1">
                      <Building size={13} className="text-[#0f382c]" />
                      <span>{property.property_name} ({property.city})</span>
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a211a] font-serif">
                {roomType?.type_name || 'Deluxe Suite'}
              </h1>

              <div className="flex items-center gap-6 text-sm text-stone-600 pt-1">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#0f382c]" />
                  <span>Up to {roomType?.max_occupancy || 2} Guests</span>
                </div>
                <div className="flex items-center gap-1 text-[#c5a059]">
                  <Star size={16} className="fill-[#c5a059]" />
                  <span className="font-bold text-stone-800">5.0</span>
                  <span className="text-stone-400">(Top Rated)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-stone-200 pt-6">
              <h3 className="text-lg font-bold text-[#0a211a] font-serif">Description & Atmosphere</h3>
              <p className="text-stone-600 leading-relaxed font-light text-base">
                An intimate sanctuary engineered for peaceful slumber, deep relaxation, and inspiring work. The quarters feature premium custom mattresses with 400-thread-count Egyptian cotton linens, sound-dampened acoustic walls, and floor-to-ceiling windows offering sweeping garden and horizon views.
              </p>
              <p className="text-stone-600 leading-relaxed font-light text-base">
                The en-suite master bath includes a rainfall shower, polished Italian granite counters, and organic botanical bath amenities.
              </p>
            </div>

            {/* Included Amenities Grid */}
            <div className="space-y-4 border-t border-stone-200 pt-6">
              <h3 className="text-lg font-bold text-[#0a211a] font-serif">Suite Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#0f382c]/8 text-[#0f382c] flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-semibold text-stone-800">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Sticky Booking Panel */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-2xl font-bold text-[#0f382c] font-serif">₹2,499</span>
                  <span className="text-xs text-stone-500"> / night</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Available
                </span>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Free cancellation up to 24 hours before check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Complimentary breakfast buffet included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>Instant stay confirmation voucher</span>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-3.5 rounded-full bg-[#0f382c] hover:bg-[#164e3f] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar size={16} className="text-[#c5a059]" />
                <span>Reserve Room {room.room_number}</span>
              </button>

              <p className="text-[11px] text-stone-400 text-center">
                Secure checkout guaranteed. No surprise fees upon arrival.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        room={room}
        roomType={roomType}
      />
    </div>
  );
}
