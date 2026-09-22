import React, { useState, useEffect } from 'react';
import { roomsApi, type Room } from '../../api/rooms';
import { roomTypesApi, type RoomType } from '../../api/roomTypes';
import { propertiesApi, type Property } from '../../api/properties';
import { Calendar, Users, DoorOpen, Search, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface SearchParams {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  roomTypeId?: number;
  propertyId?: number;
}

interface AvailabilitySearchBarProps {
  onSearchComplete: (availableRooms: Room[], params: SearchParams) => void;
  onReset: () => void;
}

export function AvailabilitySearchBar({ onSearchComplete, onReset }: AvailabilitySearchBarProps) {
  // Default to today and tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [typesRes, propsRes] = await Promise.allSettled([
          roomTypesApi.getAll(),
          propertiesApi.getAll(),
        ]);
        if (typesRes.status === 'fulfilled') setRoomTypes(typesRes.value.data);
        if (propsRes.status === 'fulfilled') setProperties(propsRes.value.data);
      } catch (err) {
        console.error('Failed to load search filters:', err);
      }
    }
    loadFilters();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    if (checkIn >= checkOut) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const searchParams = {
        start_date: checkIn,
        end_date: checkOut,
        ...(selectedProperty ? { property_id: parseInt(selectedProperty) } : {}),
        ...(selectedType ? { room_type_id: parseInt(selectedType) } : {}),
      };

      const res = await roomsApi.getAvailability(searchParams);
      setHasSearched(true);
      onSearchComplete(res.data, {
        checkIn,
        checkOut,
        guestsCount: parseInt(guests),
        roomTypeId: selectedType ? parseInt(selectedType) : undefined,
        propertyId: selectedProperty ? parseInt(selectedProperty) : undefined,
      });

      if (res.data.length === 0) {
        toast('No rooms available for the selected dates. Try different dates or properties.', {
          icon: 'ℹ️',
        });
      } else {
        toast.success(`Found ${res.data.length} room(s) available for your stay!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    onReset();
  };

  return (
    <div id="availability-search" className="relative z-20 max-w-6xl mx-auto px-4 -mt-16 sm:-mt-20">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/80 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#0f382c]">
            Plan Your Luxurious Stay
          </span>
          {hasSearched && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-stone-500 hover:text-[#0f382c] underline cursor-pointer"
            >
              Reset Search & View All Rooms
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Check-In */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-[#c5a059]" />
              <span>Check-In</span>
            </label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
              required
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} className="text-[#c5a059]" />
              <span>Check-Out</span>
            </label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
              required
            />
          </div>

          {/* Guests */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} className="text-[#c5a059]" />
              <span>Guests</span>
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </div>

          {/* Room Type Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <DoorOpen size={13} className="text-[#c5a059]" />
              <span>Suite / Category</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-800 font-medium focus:outline-none focus:border-[#0f382c] focus:ring-1 focus:ring-[#0f382c]"
            >
              <option value="">All Categories</option>
              {roomTypes.map((rt) => (
                <option key={rt.room_type_id} value={rt.room_type_id}>
                  {rt.type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] rounded-xl bg-[#0f382c] hover:bg-[#164e3f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-[#c5a059]" />
              ) : (
                <Search size={16} className="text-[#c5a059]" />
              )}
              <span>Check Availability</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
