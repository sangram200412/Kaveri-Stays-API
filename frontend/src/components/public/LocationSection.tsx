import React, { useEffect, useState } from 'react';
import { propertiesApi, type Property } from '../../api/properties';
import { MapPin, Navigation, Compass, Building, Phone, Mail } from 'lucide-react';

export function LocationSection() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadProps() {
      try {
        const res = await propertiesApi.getAll();
        setProperties(res.data);
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    }
    loadProps();
  }, []);

  return (
    <section id="location" className="py-24 bg-[#fcfbfa] text-stone-800 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0f382c]/10 text-[#0f382c] text-xs font-bold uppercase tracking-widest">
              <Compass size={13} className="text-[#c5a059]" />
              <span>Sanctuary Destinations</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a211a] font-serif">
              Prime South Indian Destinations
            </h2>

            <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
              Kaveri Stays properties are strategically situated in premier urban corridors and picturesque tourist retreats. Enjoy easy access to regional airports, cultural monuments, and commercial centers while nestled inside a tranquil oasis.
            </p>

            {/* Properties List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Active Resort & Hotel Branches
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {properties.map((p) => (
                  <div
                    key={p.property_id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0f382c]/10 text-[#0f382c] flex items-center justify-center shrink-0">
                        <Building size={16} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-stone-900">{p.property_name}</h5>
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin size={12} className="text-[#c5a059]" />
                          <span>{p.city}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#c5a059] bg-[#f7f5ef] px-2.5 py-1 rounded-full">
                      ★ {p.star_rating}.0
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#0f382c]" />
                <span>+91 80 2345 6789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#0f382c]" />
                <span>concierge@kaveristays.com</span>
              </div>
            </div>
          </div>

          {/* Right Map-style visual placeholder */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[420px] bg-stone-200 group">
              {/* Map background graphic */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Regional location map view"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-[#0a211a]/30 backdrop-blur-[1px]" />

              {/* Pin Callout */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-stone-200 text-center max-w-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#0f382c] text-[#c5a059] flex items-center justify-center mx-auto shadow-md">
                  <Navigation size={18} />
                </div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">
                  Kaveri Stays Resorts & Hotels
                </h4>
                <p className="text-xs text-stone-500">
                  Prime destinations across Bangalore, Mysore, and scenic South India.
                </p>
                <div className="pt-1">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f382c] hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <Navigation size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
