import React, { useEffect, useState } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { HeroSection } from '../../components/public/HeroSection';
import { AvailabilitySearchBar, type SearchParams } from '../../components/public/AvailabilitySearchBar';
import { HotelOverview } from '../../components/public/HotelOverview';
import { RoomsShowcase } from '../../components/public/RoomsShowcase';
import { PhotoGallery } from '../../components/public/PhotoGallery';
import { LocationSection } from '../../components/public/LocationSection';
import { GuestReviewsSection } from '../../components/public/GuestReviewsSection';
import { PublicFooter } from '../../components/public/PublicFooter';
import { BookingModal } from '../../components/public/BookingModal';

import { roomsApi, type Room } from '../../api/rooms';
import { roomTypesApi, type RoomType } from '../../api/roomTypes';

export function HomePage() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [displayedRooms, setDisplayedRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter state
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterParams, setFilterParams] = useState<SearchParams | undefined>(undefined);

  // Booking Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [roomsRes, typesRes] = await Promise.allSettled([
          roomsApi.getAll(),
          roomTypesApi.getAll(),
        ]);

        if (roomsRes.status === 'fulfilled') {
          setAllRooms(roomsRes.value.data);
          setDisplayedRooms(roomsRes.value.data);
        }
        if (typesRes.status === 'fulfilled') {
          setRoomTypes(typesRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchComplete = (availableRooms: Room[], params: SearchParams) => {
    setDisplayedRooms(availableRooms);
    setIsFiltered(true);
    setFilterParams(params);

    // Smoothly scroll down to rooms section
    const element = document.getElementById('rooms');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetSearch = () => {
    setDisplayedRooms(allRooms);
    setIsFiltered(false);
    setFilterParams(undefined);
  };

  const handleOpenBooking = (room: Room, roomType?: RoomType) => {
    setSelectedRoom(room);
    setSelectedRoomType(roomType || null);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-800 flex flex-col font-sans">
      {/* Sticky Luxury Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Availability Search Bar overlapping Hero */}
      <AvailabilitySearchBar
        onSearchComplete={handleSearchComplete}
        onReset={handleResetSearch}
      />

      {/* Welcome & Overview */}
      <HotelOverview />

      {/* Rooms & Suites Showcase */}
      <RoomsShowcase
        rooms={displayedRooms}
        roomTypes={roomTypes}
        isFiltered={isFiltered}
        filterParams={
          filterParams
            ? {
                checkIn: filterParams.checkIn,
                checkOut: filterParams.checkOut,
                guestsCount: filterParams.guestsCount,
              }
            : undefined
        }
        onSelectBooking={handleOpenBooking}
        loading={loading}
      />

      {/* Photo Gallery & Lightbox */}
      <PhotoGallery />

      {/* Location & Property Destinations */}
      <LocationSection />

      {/* Verified Guest Reviews */}
      <GuestReviewsSection />

      {/* Luxury Footer */}
      <PublicFooter />

      {/* Reserve Room Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={selectedRoom}
        roomType={selectedRoomType}
        initialDates={
          filterParams
            ? {
                checkIn: filterParams.checkIn,
                checkOut: filterParams.checkOut,
                guestsCount: filterParams.guestsCount,
              }
            : undefined
        }
      />
    </div>
  );
}
