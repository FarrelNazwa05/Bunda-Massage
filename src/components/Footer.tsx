import React from 'react';
import { Instagram } from 'lucide-react';
import { BRANCH_INFO } from '../data/spaData';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#dde0d7] bg-[#f4f2ec] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#163828] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold tracking-[0.14em] text-sm text-[#14231b] leading-tight">
                BUNDA
              </span>
              <span className="text-[8px] font-sans font-medium uppercase tracking-[0.2em] text-[#6a7a6e]">
                Traditional Massage
              </span>
            </div>
          </div>

          {/* Right Links & Copyright */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#546458]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[#163828] transition-colors font-semibold tracking-wider text-[11px] uppercase"
            >
              <Instagram className="w-4 h-4" />
              <span>{BRANCH_INFO.instagram}</span>
            </a>

            <span className="hidden sm:inline text-[#c4cbc1]">·</span>

            <span className="text-[11px] text-[#6a7a6e]">
              © 2025 BUNDA Traditional Massage · Badung, Bali
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
