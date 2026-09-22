import { NavLink, Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  CreditCard,
  DoorOpen,
  Home,
  Layers,
  LogOut,
  Star,
  TrendingUp,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase() || '';
  const isOwnerOrManager = ['owner', 'manager'].includes(role);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home, end: true },
    { to: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/dashboard/rooms', label: 'Rooms & Inventory', icon: DoorOpen },
    { to: '/dashboard/properties', label: 'Properties', icon: Building2 },
    { to: '/dashboard/room-types', label: 'Room Categories', icon: Layers },
    { to: '/dashboard/guests', label: 'Guests (CRM)', icon: Users },
    { to: '/dashboard/payments', label: 'Financial Ledger', icon: CreditCard },
    { to: '/dashboard/reviews', label: 'Guest Reviews', icon: Star },
    ...(isOwnerOrManager
      ? [{ to: '/dashboard/reports', label: 'Business Reports', icon: TrendingUp }]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col fixed inset-y-0 left-0 z-30">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white tracking-wider text-xs">
            KS
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">Kaveri Stays</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Management Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Operations</span>
          <Link
            to="/"
            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-normal lowercase"
          >
            <span>view site</span>
            <ExternalLink size={10} />
          </Link>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User info footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium text-slate-200 truncate" title={user?.email}>
              {user?.email || 'Logged In'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              {user?.role || 'Staff'}
            </span>
          </div>
          {user?.property_id && (
            <p className="text-[11px] text-slate-400">Property #{user.property_id}</p>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
