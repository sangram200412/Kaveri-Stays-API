import React, { useState } from 'react';
import { X, ZoomIn, Camera } from 'lucide-react';

const galleryPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
    title: 'Grand Exterior & Courtyard',
    tag: 'Architecture',
  },
  {
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    title: 'Presidential Suite Haven',
    tag: 'Suites',
  },
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    title: 'Serenade Lounge & Lobby',
    tag: 'Interiors',
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    title: 'Azure Horizon Pool',
    tag: 'Recreation',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    title: 'The Spice Orchard Fine Dining',
    tag: 'Culinary',
  },
];

export function PhotoGallery() {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  return (
    <section id="gallery" className="py-24 bg-[#f7f5ef] text-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Camera size={14} />
            <span>Visual Elegance</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a211a] font-serif">
            Property & Resort Gallery
          </h2>
          <p className="text-sm text-stone-600 font-light">
            Take a visual tour through our sanctuaries, tranquil grounds, and refined culinary spaces.
          </p>
        </div>

        {/* Gallery Grid (1 large + 4 smaller in grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[550px]">
          {/* Main Large Photo */}
          <div
            onClick={() => setActivePhoto(galleryPhotos[0].url)}
            className="md:col-span-7 relative rounded-3xl overflow-hidden shadow-md group cursor-pointer h-[320px] md:h-full border border-stone-200"
          >
            <img
              src={galleryPhotos[0].url}
              alt={galleryPhotos[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#0f382c] uppercase tracking-widest">
              {galleryPhotos[0].tag}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div>
                <h4 className="text-lg font-bold font-serif">{galleryPhotos[0].title}</h4>
                <p className="text-xs text-stone-300">Click to view full screen</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:bg-[#c5a059] transition-colors">
                <ZoomIn size={18} />
              </div>
            </div>
          </div>

          {/* 4 Smaller Photos in 2x2 Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 h-[320px] md:h-full">
            {galleryPhotos.slice(1, 5).map((photo) => (
              <div
                key={photo.title}
                onClick={() => setActivePhoto(photo.url)}
                className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-stone-200"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-[#0f382c] uppercase tracking-wider">
                  {photo.tag}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h5 className="text-xs font-bold truncate font-serif">{photo.title}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <img
            src={activePhoto}
            alt="Fullscreen view"
            className="max-w-5xl max-h-[85vh] w-auto h-auto rounded-2xl object-contain shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
