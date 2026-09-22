import React from 'react';
import { Link } from 'react-router-dom';
import { type Room } from '../../api/rooms';
import { type RoomType } from '../../api/roomTypes';
import { Users, Wifi, Maximize2, ArrowRight, Check, Sparkles } from 'lucide-react';

interface RoomsShowcaseProps {
  rooms: Room[];
  roomTypes: RoomType[];
  isFiltered: boolean;
  filterParams?: { checkIn: string; checkOut: string; guestsCount: number };
  onSelectBooking: (room: Room, roomType?: RoomType) => void;
  loading: boolean;
}

// Curated high quality hotel room photos matched by type index
const roomImages = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', // Presidential / Suite
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', // Deluxe Suite
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', // Executive King
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', // Twin Comfort
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', // Classic
];

export function RoomsShowcase({
  rooms,
  roomTypes,
  isFiltered,
  filterParams,
  onSelectBooking,
  loading,
}: RoomsShowcaseProps) {
  const typeMap = new Map(roomTypes.map((t) => [t.room_type_id, t]));

  return (
    <section id="rooms" className="py-24 bg-white text-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Architectural Living</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a211a] font-serif">
              Rooms & Private Suites
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-light">
              Each private quarter combines thoughtful artisanal touches with modern appointments for absolute stillness and comfort.
            </p>
          </div>

          {isFiltered && (
            <div className="bg-[#0f382c]/10 border border-[#0f382c]/20 px-4 py-2.5 rounded-2xl text-xs text-[#0f382c] font-medium flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Showing <strong>{rooms.length}</strong> available room(s) for{' '}
                {filterParams?.checkIn} to {filterParams?.checkOut}
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-stone-400 space-y-2">
            <div className="w-8 h-8 border-2 border-[#0f382c] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Fetching available suites and inventory...</p>
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="bg-[#fcfbfa] border border-stone-200 rounded-3xl p-16 text-center max-w-lg mx-auto space-y-4">
            <p className="text-base font-semibold text-stone-800">
              No rooms available for your selected criteria
            </p>
            <p className="text-xs text-stone-500">
              Please adjust your check-in dates, capacity requirement, or clear the search filter to explore all hotel accommodations.
            </p>
          </div>
        ) : (
          /* Room Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => {
              const type = typeMap.get(room.room_type_id);
              const imageUrl = roomImages[index % roomImages.length];

              return (
                <div
                  key={room.room_id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={type?.type_name || `Room ${room.room_number}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#0a211a]/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Room {room.room_number}
                    </div>
                    <div className="absolute top-4 right-4 bg-[#c5a059] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {type?.type_name || 'Deluxe'}
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#0a211a] font-serif group-hover:text-[#c5a059] transition-colors">
                          {type?.type_name || `Room ${room.room_number}`}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <Users size={14} className="text-[#0f382c]" />
                          <span>Up to {type?.max_occupancy || 2} Guests</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        Spacious private accommodation furnished with plush bedding, luxury en-suite bathroom, and handcrafted mahogany decor.
                      </p>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-[#f7f5ef] text-stone-600 text-[11px] font-medium flex items-center gap-1">
                          <Wifi size={11} className="text-[#0f382c]" />
                          <span>High-speed Wi-Fi</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#f7f5ef] text-stone-600 text-[11px] font-medium flex items-center gap-1">
                          <Check size={11} className="text-emerald-600" />
                          <span>Air Conditioned</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-[#f7f5ef] text-stone-600 text-[11px] font-medium flex items-center gap-1">
                          <Maximize2 size={11} className="text-[#0f382c]" />
                          <span>Private Balcony</span>
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                          Tariff starting from
                        </span>
                        <span className="text-lg font-extrabold text-[#0f382c] font-serif">
                          ₹2,499
                        </span>
                        <span className="text-xs text-stone-500"> / night</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/rooms/${room.room_id}`}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#0f382c] hover:bg-stone-100 transition"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => onSelectBooking(room, type)}
                          className="px-4 py-2 rounded-xl bg-[#0f382c] hover:bg-[#164e3f] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Book</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
