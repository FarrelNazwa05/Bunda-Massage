import React from 'react';
import { X, Check, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookThisService: (serviceId: string, durationMinutes?: number) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookThisService,
}) => {
  if (!service) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#f4f2ec] rounded-2xl shadow-2xl border border-[#d9ddd3] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 bg-[#163828] text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#a3bfa9] mb-1">
              <span>{service.number}</span>
              <span>·</span>
              <span>LAYANAN PERAWATAN</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white">
              {service.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Description */}
          <div>
            <p className="text-[#37483d] text-base leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Manfaat Utama */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5e6e62] mb-3">
              Manfaat Utama Sesi
            </h4>
            <div className="space-y-2.5">
              {service.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-[#1c2d23]">
                  <div className="w-5 h-5 rounded-full bg-[#163828]/10 text-[#163828] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ramuan Minyak Pijat */}
          <div className="p-4 rounded-xl bg-[#ebeae2] border border-[#d6dcd2]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#163828] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#25573e]" />
              <span>Ramuan Minyak Alami</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4a594e] leading-relaxed">
              {service.oilType}
            </p>
          </div>

          {/* Siapa yang cocok */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5e6e62] mb-1.5">
              Direkomendasikan Untuk
            </h4>
            <p className="text-xs sm:text-sm text-[#4a594e] leading-relaxed">
              {service.recommendedFor}
            </p>
          </div>

          {/* Pilihan Durasi & Biaya */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5e6e62] mb-2.5">
              Pilihan Durasi & Harga
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.durations.map((d) => (
                <div
                  key={d.minutes}
                  className="p-3.5 rounded-lg bg-white border border-[#d9ddd3] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#14231b]">
                    <Clock className="w-3.5 h-3.5 text-[#6b7b6f]" />
                    <span>{d.minutes} Menit</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#163828] tabular-nums">
                    {formatRupiah(d.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#ebeae2] border-t border-[#d9ddd3] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#5e6e62] hover:text-[#14231b] transition-colors cursor-pointer"
          >
            Kembali
          </button>

          <button
            onClick={() => {
              onClose();
              onBookThisService(service.id, service.durations[0]?.minutes);
            }}
            className="inline-flex items-center gap-2 bg-[#163828] hover:bg-[#0f291d] text-white px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <span>PESAN PERAWATAN INI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
