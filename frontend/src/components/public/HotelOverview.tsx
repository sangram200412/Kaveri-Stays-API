import React from 'react';
import {
  Wifi,
  Car,
  UtensilsCrossed,
  Bell,
  Clock,
  Waves,
  Sparkles,
  Star,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export function HotelOverview() {
  const highlights = [
    { icon: Wifi, label: 'High-Speed Wi-Fi', desc: 'Complimentary seamless connectivity' },
    { icon: Waves, label: 'Infinity Swimming Pool', desc: 'Temperature-controlled outdoor pool' },
    { icon: UtensilsCrossed, label: 'Fine Dining Restaurant', desc: 'Authentic local & world cuisines' },
    { icon: Car, label: 'Valet & Private Parking', desc: 'Secure on-premise covered parking' },
    { icon: Bell, label: '24/7 Room Service', desc: 'In-suite private dining any hour' },
    { icon: Clock, label: 'Round-the-Clock Front Desk', desc: 'Concierge, check-in and assistance' },
    { icon: Sparkles, label: 'Daily Housekeeping', desc: 'Impeccable linen & turndown service' },
    { icon: ShieldCheck, label: 'Private Security', desc: 'Safe & secure monitored sanctuary' },
  ];

  return (
    <section id="overview" className="py-24 bg-[#fcfbfa] text-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0f382c]/10 text-[#0f382c] text-xs font-bold uppercase tracking-widest">
              <span>Refined Stay Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a211a] font-serif leading-tight">
              Welcome to Kaveri Stays
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#c5a059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#c5a059]" />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                5-Star Rated Luxury Stays
              </span>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1 text-xs text-stone-600">
                <MapPin size={14} className="text-[#0f382c]" />
                <span>Prime South India Destinations</span>
              </div>
            </div>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light">
              Nestled across scenic hubs and bustling urban centers, Kaveri Stays offers an unparalleled blend of tranquil architecture, contemporary elegance, and warm personalized service. Whether you're traveling for a rejuvenating weekend escape or executive business, every moment is crafted to exceed your expectations.
            </p>

            <div className="pt-2 grid grid-cols-3 gap-6 border-t border-stone-200">
              <div>
                <p className="text-3xl font-extrabold text-[#0f382c] font-serif">50+</p>
                <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mt-1">
                  Luxury Suites
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#c5a059] font-serif">99%</p>
                <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mt-1">
                  Guest Satisfaction
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#0f382c] font-serif">24/7</p>
                <p className="text-xs text-stone-500 uppercase font-semibold tracking-wider mt-1">
                  Dedicated Concierge
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Side Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                alt="Kaveri Stays Resort Lounge"
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-[#ebd39b]">
                  Lobby & Serenade Lounge
                </span>
                <p className="text-sm font-medium text-stone-200 mt-1">
                  Crafted spaces where timeless luxury meets peaceful relaxation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Amenities Grid */}
        <div id="amenities" className="mt-20 pt-16 border-t border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest">
              Unrivaled Comforts
            </span>
            <h3 className="text-3xl font-bold text-[#0a211a] font-serif">
              Resort Amenities & Services
            </h3>
            <p className="text-sm text-stone-600">
              Thoughtfully curated conveniences to make your stay effortless, peaceful, and unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white p-6 rounded-2xl border border-stone-200/90 hover:border-[#c5a059]/50 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0f382c]/8 text-[#0f382c] group-hover:bg-[#0f382c] group-hover:text-[#c5a059] flex items-center justify-center transition-colors">
                    <Icon size={22} />
                  </div>
                  <h4 className="font-bold text-base text-stone-900 mt-4 group-hover:text-[#0f382c] transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
