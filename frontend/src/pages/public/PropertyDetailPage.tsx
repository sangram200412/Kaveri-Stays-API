import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertiesApi, type Property } from '../../api/properties';
import { roomsApi, type Room } from '../../api/rooms';
import { roomTypesApi, type RoomType } from '../../api/roomTypes';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Building, MapPin, Star, ArrowLeft, DoorOpen, Users } from 'lucide-react';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPropertyData() {
      if (!id) return;
      try {
        setLoading(true);
        const [propsRes, roomsRes, typesRes] = await Promise.allSettled([
          propertiesApi.getAll(),
          roomsApi.getAll({ property_id: parseInt(id) }),
          roomTypesApi.getAll(),
        ]);

        if (propsRes.status === 'fulfilled') {
          const matched = propsRes.value.data.find((p) => p.property_id === parseInt(id));
          if (matched) setProperty(matched);
        }

        if (roomsRes.status === 'fulfilled') {
          setRooms(roomsRes.value.data);
        }

        if (typesRes.status === 'fulfilled') {
          setRoomTypes(typesRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPropertyData();
  }, [id]);

  const typeMap = new Map(roomTypes.map((t) => [t.room_type_id, t]));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#0f382c] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-500">Loading hotel branch...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-800">Property Branch Not Found</h2>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[#0f382c] text-white text-xs font-bold uppercase tracking-wider"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-800 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-10 w-full space-y-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0f382c] hover:text-[#c5a059] transition"
          >
            <ArrowLeft size={14} />
            <span>Back to All Properties</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-[#0f382c] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-[#c5a059]">
              {[...Array(property.star_rating)].map((_, i) => (
                <Star key={i} size={18} className="fill-[#c5a059]" />
              ))}
              <span className="text-xs font-bold tracking-wider uppercase ml-1">
                {property.star_rating}-Star Luxury
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-serif">
              {property.property_name}
            </h1>

            <div className="flex items-center gap-2 text-sm text-stone-300">
              <MapPin size={16} className="text-[#c5a059]" />
              <span>{property.city}, South India</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-3xl font-bold font-serif block">{rooms.length}</span>
            <span className="text-xs uppercase font-semibold text-stone-300 tracking-wider">
              Total Accommodations
            </span>
          </div>
        </div>

        {/* Rooms at this property */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#0a211a] font-serif">
            Available Accommodations at this Branch
          </h2>

          {rooms.length === 0 ? (
            <p className="text-sm text-stone-500">No rooms listed under this property yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.map((r) => {
                const rt = typeMap.get(r.room_type_id);
                return (
                  <div
                    key={r.room_id}
                    className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                          {rt?.type_name || 'Suite'}
                        </span>
                        <span className="text-xs font-mono text-stone-400">#{r.room_id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 font-serif mt-2">
                        Room {r.room_number}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                        <Users size={13} className="text-[#0f382c]" />
                        <span>Up to {rt?.max_occupancy || 2} Guests</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Ready for Booking
                      </span>
                      <Link
                        to={`/rooms/${r.room_id}`}
                        className="text-xs font-bold text-[#0f382c] hover:underline"
                      >
                        View Suite →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
