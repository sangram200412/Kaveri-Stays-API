import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin, Globe } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#0a211a] text-stone-300 pt-20 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-stone-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c5a059] text-[#0a211a] flex items-center justify-center font-bold shadow-md">
                <Hotel size={20} />
              </div>
              <div>
                <span className="text-xl font-bold tracking-widest uppercase block text-white font-serif">
                  Kaveri Stays
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase block text-[#c5a059] font-medium">
                  Hotels & Resorts
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed font-light">
              Crafting timeless luxury and tranquil sanctuaries across scenic destinations. Experience exceptional South Indian warmth and modern architectural comfort.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#instagram"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#c5a059] hover:text-[#0a211a] text-stone-300 flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#facebook"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#c5a059] hover:text-[#0a211a] text-stone-300 flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href="#linkedin"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#c5a059] hover:text-[#0a211a] text-stone-300 flex items-center justify-center transition"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Accommodations
            </h4>
            <ul className="space-y-2.5 text-sm font-light">
              <li>
                <a href="#rooms" className="hover:text-white transition">Presidential Suite</a>
              </li>
              <li>
                <a href="#rooms" className="hover:text-white transition">Deluxe King Suites</a>
              </li>
              <li>
                <a href="#rooms" className="hover:text-white transition">Executive Comfort</a>
              </li>
              <li>
                <a href="#rooms" className="hover:text-white transition">Twin Room Quarters</a>
              </li>
              <li>
                <a href="#availability-search" className="hover:text-white transition">Availability Search</a>
              </li>
            </ul>
          </div>

          {/* Experience Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Experience
            </h4>
            <ul className="space-y-2.5 text-sm font-light">
              <li>
                <a href="#overview" className="hover:text-white transition">About Kaveri Stays</a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-white transition">Resort Amenities</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition">Photo Gallery</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition">Verified Guest Reviews</a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition">Locations & Map</a>
              </li>
            </ul>
          </div>

          {/* Contact & Concierge */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Reservations & Concierge
            </h4>
            <div className="space-y-3 text-xs text-stone-400 font-light">
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#c5a059]" />
                <span>+91 80 2345 6789</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#c5a059]" />
                <span>stays@kaveristays.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#c5a059] shrink-0 mt-0.5" />
                <span>Kaveri Promenade, Bangalore & Mysore, India</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:underline"
              >
                Staff & Resident Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Kaveri Stays. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Hospitality</span>
            <span className="hover:text-stone-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
