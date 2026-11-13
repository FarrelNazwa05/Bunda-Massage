import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PRICING_TABLE } from '../data/spaData';

interface PricingSectionProps {
  onOpenConsultation: () => void;
  onBookTreatment: (treatmentName: string, duration: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenConsultation,
  onBookTreatment,
}) => {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <section id="harga" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Title, Inclusions, and Consultation prompt */}
          <div className="lg:col-span-5 lg:pr-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-[#5e6e62] uppercase mb-4">
              <span className="w-6 h-[1.5px] bg-[#36614a] inline-block" />
              <span>HARGA PERAWATAN</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] text-[#14231b] mb-6 [text-wrap:balance]">
              Jelas sejak<br />
              awal.
            </h2>

            <p className="text-[#4a594e] text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              Harga berikut sudah termasuk minyak pijat, handuk bersih, dan minuman
              hangat setelah sesi.
            </p>

            {/* Inclusions checklist */}
            <div className="space-y-2.5 mb-10 text-xs text-[#4a594e]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#163828] shrink-0" />
                <span>Tanpa biaya tersembunyi atau service fee tambahan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#163828] shrink-0" />
                <span>Minuman wedang jahe / teh herbal serai hangat gratis</span>
              </div>
            </div>

            {/* Clean Hairline Callout in calm sage */}
            <div className="p-4 rounded-xl border border-[#d6dcd2] bg-[#ebeae2]/70">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#163828] mb-1">
                Perlu bantuan memilih?
              </p>
              <button
                onClick={onOpenConsultation}
                className="text-xs sm:text-sm text-[#4a594e] hover:text-[#163828] transition-colors inline-flex items-center gap-1.5 group font-medium cursor-pointer"
              >
                <span>Ceritakan kebutuhan Anda</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Pricing Table */}
          <div className="lg:col-span-7">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d6dcd2] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66766a]">
                    <th className="py-4 font-semibold">PERAWATAN</th>
                    <th className="py-4 font-semibold text-center">DURASI</th>
                    <th className="py-4 font-semibold text-right">HARGA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde0d7] text-sm sm:text-base">
                  {PRICING_TABLE.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onBookTreatment(row.treatment, row.duration)}
                      className="group hover:bg-[#e5e8df]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-4 sm:py-5 font-serif text-[#14231b] group-hover:text-[#163828] transition-colors pr-4">
                        <div className="flex items-center gap-2">
                          <span>{row.treatment}</span>
                          <span className="text-[10px] font-sans uppercase tracking-widest text-[#36614a] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                            · Pilih
                          </span>
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 text-center text-[#4b5b50] font-sans text-xs sm:text-sm tabular-nums">
                        {row.duration}
                      </td>
                      <td className="py-4 sm:py-5 text-right font-sans font-medium text-[#14231b] tabular-nums whitespace-nowrap pl-4">
                        {formatRupiah(row.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note below table */}
            <p className="text-xs text-[#6a7a6e] mt-5 leading-relaxed font-light">
              Harga dapat berubah pada hari libur nasional. Konfirmasi melalui
              WhatsApp sebelum kedatangan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
