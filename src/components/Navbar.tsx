import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'BERANDA', href: '#beranda' },
    { label: 'TENTANG', href: '#tentang' },
    { label: 'LAYANAN', href: '#layanan' },
    { label: 'HARGA', href: '#harga' },
    { label: 'KONTAK', href: '#kontak' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f4f2ec]/95 backdrop-blur-md border-b border-[#dde0d7] transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        {/* Brand Zone - Single element wordmark lockup */}
        <a href="#beranda" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded bg-[#163828] text-white flex items-center justify-center font-serif font-bold text-lg tracking-normal group-hover:bg-[#10291d] transition-colors shadow-xs">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold tracking-[0.14em] text-base text-[#14231b] leading-tight whitespace-nowrap">
              BUNDA
            </span>
            <span className="text-[9px] font-sans font-medium uppercase tracking-[0.22em] text-[#6a7a6e] whitespace-nowrap">
              Traditional Massage
            </span>
          </div>
        </a>

        {/* Center Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-medium tracking-[0.16em] text-[#4b5b50]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#163828] transition-colors whitespace-nowrap shrink-0 py-1 relative hover:after:w-full after:w-0 after:h-[1.5px] after:bg-[#163828] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onOpenBooking}
            className="hidden sm:inline-flex items-center gap-2 bg-[#163828] hover:bg-[#0f291d] text-white px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>RESERVASI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#14231b] hover:bg-[#e5e7df] rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f4f2ec] border-b border-[#dde0d7] px-6 py-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 text-xs font-semibold tracking-widest text-[#4b5b50]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#e3e5dd] hover:text-[#163828] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#163828] hover:bg-[#0f291d] text-white py-3 rounded-lg text-xs font-semibold tracking-wider cursor-pointer"
            >
              <span>RESERVASI SEKARANG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
