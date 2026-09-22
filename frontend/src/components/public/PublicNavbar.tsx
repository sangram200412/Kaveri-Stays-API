import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Hotel, User, LogOut, LayoutDashboard, Calendar } from 'lucide-react';

export function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Stay', href: '#overview' },
    { name: 'Rooms & Suites', href: '#rooms' },
    { name: 'Amenities', href: '#amenities' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Location', href: '#location' },
    { name: 'Reviews', href: '#reviews' },
  ];

  const isStaffOrAdmin = ['owner', 'manager', 'staff'].includes(user?.role?.toLowerCase() || '');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-stone-200'
          : 'bg-gradient-to-b from-black/70 via-black/40 to-transparent text-white py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isScrolled
                ? 'bg-[#0f382c] text-[#c5a059]'
                : 'bg-white/10 backdrop-blur border border-white/20 text-[#c5a059]'
            }`}
          >
            <Hotel size={20} />
          </div>
          <div>
            <span
              className={`text-xl font-bold tracking-widest uppercase block transition-colors font-serif ${
                isScrolled ? 'text-[#0f382c]' : 'text-white'
              }`}
            >
              Kaveri Stays
            </span>
            <span
              className={`text-[10px] tracking-[0.25em] uppercase block font-medium ${
                isScrolled ? 'text-[#c5a059]' : 'text-stone-300'
              }`}
            >
              Hotels & Resorts
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-sm font-medium tracking-wide transition-colors ${
                isScrolled
                  ? 'text-stone-700 hover:text-[#0f382c]'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTA & User Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isStaffOrAdmin && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isScrolled
                      ? 'bg-stone-100 text-[#0f382c] hover:bg-stone-200'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Portal</span>
                </Link>
              )}
              <div
                className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg ${
                  isScrolled ? 'text-stone-700' : 'text-stone-200'
                }`}
              >
                <User size={14} />
                <span className="truncate max-w-[120px]">{user?.email.split('@')[0]}</span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className={`p-1.5 rounded-lg transition ${
                  isScrolled
                    ? 'text-stone-500 hover:text-rose-600 hover:bg-stone-100'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
                isScrolled
                  ? 'text-stone-700 hover:text-[#0f382c]'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              Sign In
            </Link>
          )}

          <a
            href="#availability-search"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c5a059] hover:bg-[#b58f48] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-0.5"
          >
            <Calendar size={14} />
            <span>Check Availability</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-lg ${
            isScrolled ? 'text-stone-800' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white text-stone-800 border-b border-stone-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="space-y-2">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-stone-700 hover:text-[#0f382c] py-2 border-b border-stone-100"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="pt-2 space-y-3">
            {isAuthenticated ? (
              <>
                {isStaffOrAdmin && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-100 text-[#0f382c] font-semibold text-sm"
                  >
                    <LayoutDashboard size={16} />
                    <span>Management Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-rose-600 text-sm font-medium hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-sm"
              >
                Sign In
              </Link>
            )}

            <a
              href="#availability-search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#c5a059] text-white font-bold text-xs uppercase tracking-wider shadow"
            >
              <Calendar size={15} />
              <span>Check Availability</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
