import React, { useState } from 'react';
import { X, ArrowRight, HeartPulse, Sparkles, Smile, ShieldCheck } from 'lucide-react';
import { SERVICES_DATA } from '../data/spaData';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedService: (serviceId: string) => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedService,
}) => {
  const [selectedFeeling, setSelectedFeeling] = useState<string>('pegal');

  if (!isOpen) return null;

  const consultationOptions = [
    {
      id: 'pegal',
      title: 'Pegal berat & otot tegang',
      description: 'Leher kaku, pundak tegang karena duduk lama di depan laptop, atau punggung lelah sehabis aktivitas padat.',
      recommendedId: 'tradisional',
      reason: 'Pijat Tradisional dengan tekanan telapak dan rempah hangat ampuh mengurai simpul otot kaku.',
    },
    {
      id: 'lulur',
      title: 'Kulit kusam & ingin relaksasi menyeluruh',
      description: 'Ingin meredakan penat sekaligus eksfoliasi alami agar kulit tubuh halus, bersih, dan harum rempah.',
      recommendedId: 'lulur',
      reason: 'Pijat + Lulur memadukan pijat tradisional dengan baluran lulur rempah Bali untuk kulit segar dan tubuh rileks.',
    },
    {
      id: 'kaki',
      title: 'Kaki lelah banyak berjalan',
      description: 'Sehabis traveling keliling Bali, banyak berdiri, atau telapak kaki terasa berdenyut pegal.',
      recommendedId: 'refleksi',
      reason: 'Pijat Refleksi menargetkan titik saraf telapak kaki dan merilekskan otot betis seketika.',
    },
    {
      id: 'ibu',
      title: 'Masa pemulihan pasca persalinan',
      description: 'Pinggang bawah pegal, otot tubuh lelah setelah melahirkan, dan membutuhkan pemulihan yang lembut.',
      recommendedId: 'ibu-hamil',
      reason: 'Pijat Pasca Melahirkan ditangani terapis perempuan berpengalaman dengan sentuhan lembut untuk membantu pemulihan ibu.',
    },
  ];

  const activeOption =
    consultationOptions.find((o) => o.id === selectedFeeling) ||
    consultationOptions[0];
  const matchedService = SERVICES_DATA.find(
    (s) => s.id === activeOption.recommendedId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#f4f2ec] rounded-2xl shadow-2xl border border-[#d9ddd3] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#163828] text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#a3bfa9] font-medium block">
              PANDUAN PERAWATAN
            </span>
            <h3 className="font-serif text-xl font-medium tracking-tight text-white">
              Ceritakan Kebutuhan Tubuh Anda
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <p className="text-xs sm:text-sm text-[#4a594e]">
            Pilih kondisi yang paling menggambarkan kondisi tubuh Anda saat ini:
          </p>

          <div className="space-y-3">
            {consultationOptions.map((opt) => {
              const isSelected = opt.id === selectedFeeling;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedFeeling(opt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#163828] bg-white shadow-sm ring-1 ring-[#163828]'
                      : 'border-[#d6dcd2] bg-[#ebeae2]/50 hover:bg-[#ebeae2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-medium text-base text-[#14231b]">
                      {opt.title}
                    </span>
                    <input
                      type="radio"
                      name="feeling"
                      checked={isSelected}
                      onChange={() => setSelectedFeeling(opt.id)}
                      className="accent-[#163828] w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-[#546458] leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recommended Result */}
          {matchedService && (
            <div className="p-5 rounded-xl bg-[#ebeae2] border border-[#d4dad0] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#163828]">
                <Sparkles className="w-4 h-4 text-[#25573e]" />
                <span>Rekomendasi Terbaik Untuk Anda:</span>
              </div>
              <h4 className="font-serif text-2xl font-medium text-[#14231b]">
                {matchedService.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#4a594e] leading-relaxed">
                {activeOption.reason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#ebeae2] border-t border-[#d9ddd3] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#5e6e62] hover:text-[#14231b] transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onClose();
              if (matchedService) {
                onSelectRecommendedService(matchedService.id);
              }
            }}
            className="inline-flex items-center gap-2 bg-[#163828] hover:bg-[#0f291d] text-white px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <span>PILIH PERAWATAN INI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
