import React from 'react';
import { Check } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const highlights = [
    'Terapis perempuan berpengalaman',
    'Ruang privat, bersih, dan tenang',
    'Minyak pijat berbahan alami',
  ];

  return (
    <section id="tentang" className="py-20 lg:py-28 border-t border-[#dde0d7] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Profile Bunda & Quote */}
          <div className="lg:col-span-4 lg:pr-8">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#5e6e62] uppercase mb-8">
              <span className="w-6 h-[1.5px] bg-[#36614a] inline-block" />
              <span>PROFIL BUNDA</span>
            </div>

            {/* Quote Mark */}
            <div className="font-serif text-5xl sm:text-6xl text-[#25573e] leading-none select-none mb-3 font-semibold">
              “
            </div>

            {/* Editorial Quote */}
            <blockquote className="font-serif text-2xl sm:text-3xl text-[#14231b] leading-[1.28] font-normal">
              Perawatan yang baik<br />
              dimulai<br />
              dari rasa aman dan<br />
              nyaman.
            </blockquote>
          </div>

          {/* Right Column: Main Story & Pillars */}
          <div className="lg:col-span-8 lg:border-l lg:border-[#dde0d7] lg:pl-16">
            {/* Main Section Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] text-[#14231b] leading-[1.18] font-normal mb-10 max-w-2xl [text-wrap:balance]">
              Tradisi perawatan keluarga<br />
              hadir dengan standar hari ini.
            </h2>

            {/* Two Sub-columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Story paragraph */}
              <p className="text-[#4a594e] text-sm sm:text-base leading-relaxed">
                Berawal dari kebiasaan merawat keluarga di rumah, BUNDA membawa
                pengetahuan pijat tradisional ke ruang yang nyaman dan mudah
                diakses. Setiap sesi diawali percakapan singkat agar tekanan dan
                fokus perawatan sesuai kebutuhan Anda.
              </p>

              {/* Three Value Pillars */}
              <div className="flex flex-col">
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3.5 py-3.5 border-b border-[#d9ddd3] first:border-t text-sm font-medium text-[#16271d]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tranquil Spa Room Image */}
            <div className="mt-10 rounded-xl overflow-hidden border border-[#d9ddd3] shadow-xs relative aspect-[16/9] sm:aspect-[21/9] bg-[#dde0d7]">
              <img
                src="/src/assets/images/spa_room_ambiance_1794395205590.jpg"
                alt="Ruang Privat BUNDA Traditional Massage Bali"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('spa_room_clean.jpg')) {
                    target.src = '/assets/images/spa_room_clean.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 text-white drop-shadow-sm">
                <span className="text-xs font-medium tracking-wide">
                  Ruang privat yang tenang, higienis, dan sejuk dengan aromaterapi alami.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
