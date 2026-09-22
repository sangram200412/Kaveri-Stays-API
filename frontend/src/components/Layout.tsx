import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const titles: Record<string, string> = {
  '/dashboard': 'Operations Overview',
  '/dashboard/bookings': 'Guest Reservations & Bookings',
  '/dashboard/rooms': 'Hotel Rooms & Inventory Engine',
  '/dashboard/properties': 'Properties Portfolio',
  '/dashboard/room-types': 'Room Categories & Capacities',
  '/dashboard/guests': 'Guest Directory (CRM)',
  '/dashboard/payments': 'Financial Payments & Ledger',
  '/dashboard/reviews': 'Guest Satisfaction & Reviews',
  '/dashboard/reports': 'Executive Performance & Occupancy Analytics',
};

export function Layout() {
  const location = useLocation();
  const currentTitle = titles[location.pathname] || 'Kaveri Stays Management';

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar title={currentTitle} />
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
