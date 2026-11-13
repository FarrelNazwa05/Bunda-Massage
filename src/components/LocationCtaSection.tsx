import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Clock, ExternalLink, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { BRANCH_INFO } from '../data/spaData';
import { LocationMap } from './LocationMap';
import { useGooglePlace } from '../context/GooglePlaceContext';

interface LocationCtaSectionProps {
  onDirectWhatsApp: () => void;
}

export const LocationCtaSection: React.FC<LocationCtaSectionProps> = ({
  onDirectWhatsApp,
}) => {
  const { hours, googleMapsUri, isLoading } = useGooglePlace();
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  return (
    <section id="kontak" className="py-20 lg:py-28 border-t border-[#dde0d7] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Framed Oil Photo Card */}
          <div className="lg:col-span-6">
            <div className="p-3 sm:p-4 rounded-xl border border-[#d4dad0] bg-[#ebeae2]/60 max-w-lg mx-auto lg:max-w-none">
              <div className="relative rounded-lg overflow-hidden aspect-[4/3] sm:aspect-[1/1] max-h-[460px] bg-[#dde0d7]">
                <img
                  src="/src/assets/images/spa_herbal_oil_pouring_1794395205789.jpg"
                  alt="Minyak Pijat Tradisional Alami BUNDA"
                  className="w-full h-full object-cover object-center select-none"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('oil_treatment_clean.jpg')) {
                      target.src = '/assets/images/oil_treatment_clean.jpg';
                    }
                  }}
                />

                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom text overlay matching location */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white drop-shadow-md">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cde0d2] mb-0.5">
                      LOKASI
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-medium text-white tracking-tight block">
                      Banjar Kwanji, Dalung
                    </span>
                    <span className="text-xs text-white/85 block mt-0.5">
                      Kuta Utara, Kabupaten Badung, Bali
                    </span>
                  </div>
                  <a
                    href={googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-medium text-white border border-white/25 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Copy, WhatsApp Action, and Location + Contact Info */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Kicker */}
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#5e6e62] uppercase mb-4">
              <span className="w-6 h-[1.5px] bg-[#36614a] inline-block" />
              <span>LOKASI & KONTAK</span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] text-[#14231b] mb-6 [text-wrap:balance]">
              Siap merasa lebih<br />
              ringan?
            </h2>

            {/* Paragraph */}
            <p className="text-[#4a594e] text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Reservasi membantu kami menyiapkan terapis dan ruang terbaik untuk Anda.
              Pesan melalui WhatsApp, kami akan merespons secepatnya.
            </p>

            {/* Deep Forest Green CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <a
                href={`https://wa.me/${BRANCH_INFO.whatsapp}?text=${encodeURIComponent(
                  'Halo BUNDA Traditional Massage, saya ingin menanyakan jadwal perawatan yang tersedia.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-between gap-4 bg-[#163828] hover:bg-[#0f291d] text-white px-7 py-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] group cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 fill-white/15 stroke-[2]" />
                  <span className="text-sm sm:text-base font-semibold tracking-wide">
                    Tanya jadwal via WhatsApp
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                type="button"
                onClick={onDirectWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-[#163828] border border-[#cfd5cb] hover:border-[#163828]/40 px-5 py-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shadow-xs active:scale-[0.99] cursor-pointer whitespace-nowrap"
              >
                <span>Form Reservasi Cepat</span>
              </button>
            </div>

            {/* Info details grid: Alamat, Jam Buka, Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#dde0d7]">
              {/* Alamat */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66766a] mb-0.5">
                    ALAMAT
                  </span>
                  <a
                    href={googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#14231b] hover:text-[#25573e] font-medium leading-relaxed block transition-colors"
                  >
                    {BRANCH_INFO.primary.fullAddress}
                  </a>
                </div>
              </div>

              {/* Jam Buka */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66766a] mb-0.5">
                    JAM BUKA
                  </span>
                  {isLoading ? (
                    <p className="text-xs text-[#66766a] font-medium">
                      Menyesuaikan Google Maps...
                    </p>
                  ) : hours.isFromGoogleMaps ? (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-[#14231b] font-medium leading-snug">
                        {hours.summaryLabel}
                      </p>
                      {hours.isOpenNow !== null && (
                        <p className="text-[11px] font-semibold text-[#25573e]">
                          {hours.isOpenNow ? 'Sedang buka' : 'Sedang tutup'}
                        </p>
                      )}
                      {hours.weekdayDescriptions.length > 0 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowFullSchedule((v) => !v)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#25573e] hover:text-[#163828] underline underline-offset-2 cursor-pointer"
                          >
                            <span>{showFullSchedule ? 'Tutup jadwal' : 'Lihat jadwal mingguan'}</span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                showFullSchedule ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {showFullSchedule && (
                            <ul className="mt-2 space-y-1 text-[11px] text-[#4a594e] border-l border-[#cfd5cb] pl-2.5">
                              {hours.weekdayDescriptions.map((line, idx) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-[#14231b] font-medium leading-snug">
                        Sesuai Google Maps
                      </p>
                      <a
                        href={googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25573e] hover:text-[#163828] underline underline-offset-2"
                      >
                        <span>Lihat di Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Kontak */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66766a] mb-0.5">
                    WHATSAPP
                  </span>
                  <a
                    href={`https://wa.me/${BRANCH_INFO.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-[#14231b] hover:text-[#25573e] font-medium leading-snug block transition-colors tabular-nums"
                  >
                    {BRANCH_INFO.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Google Map Card */}
        <div className="mt-14 lg:mt-16">
          <div className="p-3 sm:p-4 rounded-xl border border-[#d4dad0] bg-[#ebeae2]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pt-1 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#163828] text-white flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5e6e62]">
                    PETA LOKASI
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-[#14231b] leading-snug">
                    {BRANCH_INFO.primary.fullAddress}
                  </p>
                </div>
              </div>
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#163828] hover:bg-[#0f291d] text-white text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0"
              >
                <span>Petunjuk Arah</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <LocationMap />
          </div>
        </div>
      </div>
    </section>
  );
};

