import React from 'react';
import { ArrowDown, Calendar, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with warm luxury aesthetic */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
        }}
      />

      {/* Subtle dark gradient overlay for optimal readability without losing elegance */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a211a]/90 via-[#0a211a]/55 to-[#0a211a]/40" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white space-y-6 pt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#ebd39b] text-xs font-semibold tracking-widest uppercase">
          <Sparkles size={13} className="text-[#c5a059]" />
          <span>Sanctuary of Refined Hospitality</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase font-serif">
          Kaveri Stays
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-stone-200 font-light tracking-wide max-w-2xl mx-auto">
          Luxury Hotel & Stay Experience
        </p>

        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto font-normal leading-relaxed">
          Experience world-class comfort, architectural elegance, and exceptional South Indian hospitality across prime serene locations.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#availability-search"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#c5a059] hover:bg-[#b58f48] text-[#0a211a] font-bold text-xs uppercase tracking-widest shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Check Availability
          </a>
          <a
            href="#rooms"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur font-semibold text-xs uppercase tracking-widest transition-all duration-200"
          >
            Explore Rooms & Suites
          </a>
        </div>
      </div>

      {/* Subtle bottom scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce pointer-events-none">
        <ArrowDown size={18} />
      </div>
    </section>
  );
}
