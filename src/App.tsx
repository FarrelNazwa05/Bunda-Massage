import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { LocationCtaSection } from './components/LocationCtaSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { ConsultationModal } from './components/ConsultationModal';
import { SERVICES_DATA } from './data/spaData';
import { ServiceItem } from './types';
import { GooglePlaceProvider } from './context/GooglePlaceContext';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingInitialServiceId, setBookingInitialServiceId] = useState<string | undefined>(undefined);
  const [bookingInitialDuration, setBookingInitialDuration] = useState<string | undefined>(undefined);

  const [activeDetailService, setActiveDetailService] = useState<ServiceItem | null>(null);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Trigger Booking Modal
  const handleOpenBooking = (serviceId?: string, duration?: string) => {
    setBookingInitialServiceId(serviceId || SERVICES_DATA[0].id);
    setBookingInitialDuration(duration);
    setBookingModalOpen(true);
  };

  // Click on treatment card in Services section
  const handleSelectService = (service: ServiceItem) => {
    setActiveDetailService(service);
  };

  // Book from detail modal
  const handleBookFromDetail = (serviceId: string, durationMinutes?: number) => {
    setActiveDetailService(null);
    handleOpenBooking(serviceId, durationMinutes ? `${durationMinutes} menit` : undefined);
  };

  // Click row in Price table
  const handleBookFromPrice = (treatmentName: string, duration: string) => {
    let matchedId = SERVICES_DATA[0].id;
    if (treatmentName.toLowerCase().includes('lulur') || treatmentName.toLowerCase().includes('relaksasi')) {
      matchedId = 'lulur';
    } else if (treatmentName.toLowerCase().includes('refleksi')) {
      matchedId = 'refleksi';
    } else if (
      treatmentName.toLowerCase().includes('ibu') ||
      treatmentName.toLowerCase().includes('melahirkan')
    ) {
      matchedId = 'ibu-hamil';
    } else {
      matchedId = 'tradisional';
    }
    handleOpenBooking(matchedId, duration);
  };

  // Consultation recommendation selection
  const handleSelectRecommendedService = (serviceId: string) => {
    setConsultationModalOpen(false);
    handleOpenBooking(serviceId);
  };

  // Direct WhatsApp click from bottom section
  const handleDirectWhatsApp = () => {
    handleOpenBooking();
  };

  const handleOpenContact = () => {
    const contactSection = document.getElementById('kontak');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleOpenBooking();
    }
  };

  return (
    <GooglePlaceProvider>
      <div className="min-h-screen bg-[#f4f2ec] text-[#14231b] flex flex-col font-sans selection:bg-[#163828] selection:text-white">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      {/* Main Content Sections matching user design mockup */}
      <main className="flex-1">
        {/* Section 1: Hero */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onOpenContact={handleOpenContact}
        />

        {/* Section 2: About / Profil Bunda */}
        <AboutSection />

        {/* Section 3: Daftar Layanan (Dark Green) */}
        <ServicesSection
          services={SERVICES_DATA}
          onSelectService={handleSelectService}
        />

        {/* Section 4: Harga Perawatan */}
        <PricingSection
          onOpenConsultation={() => setConsultationModalOpen(true)}
          onBookTreatment={handleBookFromPrice}
        />

        {/* Section 5: Kunjungi Kami & CTA */}
        <LocationCtaSection onDirectWhatsApp={handleDirectWhatsApp} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialServiceId={bookingInitialServiceId}
        initialDuration={bookingInitialDuration}
      />

      <ServiceDetailModal
        service={activeDetailService}
        onClose={() => setActiveDetailService(null)}
        onBookThisService={handleBookFromDetail}
      />

      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        onSelectRecommendedService={handleSelectRecommendedService}
      />
      </div>
    </GooglePlaceProvider>
  );
}
