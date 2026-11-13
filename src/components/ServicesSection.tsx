import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
}) => {
  return (
    <section id="layanan" className="bg-[#152e22] text-white py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-8 border-b border-[#264735]">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#8fa796] uppercase mb-4">
              <span className="w-6 h-[1.5px] bg-[#678571] inline-block" />
              <span>DAFTAR LAYANAN</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] font-medium leading-[1.12] text-white max-w-xl">
              Pilih jeda yang tubuh<br />
              Anda perlukan.
            </h2>
          </div>

          <p className="text-[#a4bda9] text-sm sm:text-base leading-relaxed max-w-md font-light">
            Semua perawatan dapat disesuaikan tingkat tekanannya. Sampaikan kondisi
            kesehatan atau area sensitif sebelum sesi dimulai.
          </p>
        </div>

        {/* 2x2 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="bg-[#1a382a]/60 hover:bg-[#1a382a] border border-[#274836] hover:border-[#3d6b50] rounded-xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                {/* Top index and optional Favorite badge */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="text-xs font-mono font-medium text-[#8fa796] tracking-widest">
                    {service.number}
                  </span>

                  {service.isFavorite && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider text-[#a7cbb0] border border-[#305a41] bg-[#1d4130]/80">
                      <Star className="w-3 h-3 fill-[#a7cbb0] text-[#a7cbb0]" />
                      <span>FAVORIT</span>
                    </span>
                  )}
                </div>

                {/* Service Title */}
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-4 group-hover:text-[#e4efe7] transition-colors">
                  {service.title}
                </h3>

                {/* Service Description */}
                <p className="text-[#a2bba8] text-sm sm:text-base leading-relaxed mb-8 font-light">
                  {service.description}
                </p>
              </div>

              {/* Card Footer: Duration label & Arrow */}
              <div className="flex items-center justify-between pt-6 border-t border-[#264936] text-xs font-semibold tracking-widest text-[#d8e6dc]">
                <span>{service.durationLabel}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
