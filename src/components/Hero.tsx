import React from 'react';
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import { useGooglePlace } from '../context/GooglePlaceContext';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onOpenContact }) => {
  const { hours, googleMapsUri, isLoading } = useGooglePlace();
  return (
    <section id="beranda" className="relative pt-6 pb-16 lg:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Kicker */}
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#5e6e62] uppercase mb-6">
              <span className="w-6 h-[1.5px] bg-[#36614a] inline-block" />
              <span>PERAWATAN TRADISIONAL · BADUNG, BALI</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.75rem] font-medium leading-[1.05] tracking-tight text-[#14231b] mb-6 [text-wrap:balance]">
              Pijat<br />
              tradisional,<br />
              <span className="italic font-normal text-[#25573e] block mt-1">
                pulihkan tubuh.
              </span>
            </h1>

            {/* Subtitle paragraph */}
            <p className="text-[#4a594e] text-base sm:text-lg leading-relaxed max-w-xl mb-10 font-normal">
              Nikmati pijat tradisional dengan teknik turun-temurun untuk membantu
              meredakan pegal, melancarkan peredaran tubuh, dan mengembalikan rasa
              nyaman setelah beraktivitas.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#layanan"
                className="inline-flex items-center gap-2.5 bg-[#163828] hover:bg-[#0f291d] text-white px-6 py-3.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 shadow-sm active:scale-[0.98] group whitespace-nowrap shrink-0"
              >
                <span>LIHAT PERAWATAN</span>
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <button
                onClick={onOpenContact}
                className="inline-flex items-center gap-2.5 bg-white/95 hover:bg-white text-[#163828] border border-[#cfd5cb] hover:border-[#163828]/40 px-6 py-3.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 shadow-xs active:scale-[0.98] group cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>HUBUNGI BUNDA</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Image with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-xl aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-[#dde0d7]">
              {/* Main massage photo */}
              <img
                src="/src/assets/images/hero_traditional_massage_1794395204758.jpg"
                alt="Pijat Tradisional Bali di BUNDA"
                className="w-full h-full object-cover object-center select-none"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('hero_massage_clean.jpg')) {
                    target.src = '/assets/images/hero_massage_clean.jpg';
                  }
                }}
              />

              {/* Scrim overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Top-left floating badge */}
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-white/60">
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#788277]">
                  {hours.dayBadgeLabel}
                </span>
                {hours.isFromGoogleMaps ? (
                  <span className="block text-sm sm:text-base font-bold text-[#16251c] font-sans">
                    {hours.compactHours}
                  </span>
                ) : (
                  <a
                    href={googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs sm:text-sm font-bold text-[#163828] hover:text-[#25573e] underline-offset-2 hover:underline font-sans"
                  >
                    {isLoading ? 'Memuat jam buka...' : hours.compactHours}
                  </a>
                )}
              </div>

              {/* Bottom-left location marker */}
              <div className="absolute bottom-5 left-5 text-white flex items-start gap-2.5 drop-shadow-md">
                <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-normal text-white/95">
                    Jalan Tibung Sari No. 51B, Banjar Kwanji
                  </span>
                  <span className="block text-sm font-bold text-white tracking-wide">
                    Desa Dalung, Kuta Utara, Badung, Bali
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
