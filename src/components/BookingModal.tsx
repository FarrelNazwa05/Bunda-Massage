import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Check,
  Send,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
  Loader2,
  CalendarClock,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { SERVICES_DATA, BRANCH_INFO } from '../data/spaData';
import { useGooglePlace } from '../context/GooglePlaceContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  initialDuration?: string;
}

interface BookedInterval {
  startMinutes: number;
  endMinutes: number;
  timeSlot: string;
  durationMinutes: number;
}

interface ConflictState {
  message: string;
  recommendations: string[];
  nextDayRecommendations: { dateIso: string; timeSlot: string }[];
}

interface ConfirmedBooking {
  id: string;
  dateIso: string;
  dateDisplay: string;
  timeSlot: string;
  endTime: string;
  durationMinutes: number;
  serviceTitle: string;
  price: number;
}

function getBaliNowParts(now: Date = new Date()): {
  isoDate: string;
  timeHHMM: string;
  minutesOfDay: number;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const rawHour = Number(parts.find((p) => p.type === 'hour')?.value || '0') % 24;
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || '0');

  return {
    isoDate: `${year}-${month}-${day}`,
    timeHHMM: `${String(rawHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    minutesOfDay: rawHour * 60 + minute,
  };
}

function addDaysIso(dateIso: string, offsetDays: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return dt.toISOString().slice(0, 10);
}

function parseTimeToMinutes(timeStr: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(normalized / 60)).padStart(2, '0');
  const m = String(normalized % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function formatDisplayDateFromIso(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${dayNames[dt.getDay()]}, ${dt.getDate()} ${monthNames[dt.getMonth()]}`;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
  initialDuration,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialServiceId || SERVICES_DATA[0].id
  );

  const activeService =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  const [selectedDuration, setSelectedDuration] = useState<number>(
    activeService.durations[0]?.minutes || 60
  );

  const [baliNow, setBaliNow] = useState(() => getBaliNowParts());

  // Quick date presets: Hari Ini (0), Besok (1), Lusa (2), or Custom ('custom')
  const [datePreset, setDatePreset] = useState<number | 'custom'>(0);
  const [customDate, setCustomDate] = useState<string>(() => getBaliNowParts().isoDate);

  const { hours, googleMapsUri } = useGooglePlace();
  const [timeSlot, setTimeSlot] = useState<string>('14:30');
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([]);
  const [dateBookingCounts, setDateBookingCounts] = useState<Record<string, number>>({});
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  // Refresh live Bali clock every 15 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;
    setBaliNow(getBaliNowParts());
    const timer = window.setInterval(() => {
      setBaliNow(getBaliNowParts());
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const dayPresets = useMemo(() => {
    const offsets = [0, 1, 2];
    return offsets.map((offset) => {
      const iso = addDaysIso(baliNow.isoDate, offset);
      return {
        label: offset === 0 ? 'Hari Ini' : offset === 1 ? 'Besok' : 'Lusa',
        dateDisplay: formatDisplayDateFromIso(iso),
        iso,
      };
    });
  }, [baliNow.isoDate]);

  const selectedDateIso =
    datePreset === 'custom'
      ? customDate
      : dayPresets[typeof datePreset === 'number' ? datePreset : 0].iso;

  const selectedDateString =
    datePreset === 'custom'
      ? formatDisplayDateFromIso(customDate)
      : dayPresets[typeof datePreset === 'number' ? datePreset : 0].dateDisplay;

  const isSelectedToday = selectedDateIso === baliNow.isoDate;

  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDateIso.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [selectedDateIso]);

  const rawQuickTimes = useMemo(
    () => hours.getSlotsForDate(selectedDateObj),
    [hours, selectedDateObj]
  );

  const quickTimes = useMemo(() => {
    if (!isSelectedToday) return rawQuickTimes;
    return rawQuickTimes.filter((slot) => {
      const slotMinutes = parseTimeToMinutes(slot);
      return slotMinutes !== null && slotMinutes >= baliNow.minutesOfDay;
    });
  }, [rawQuickTimes, isSelectedToday, baliNow.minutesOfDay]);

  const fetchAvailability = useCallback(async (dateIso: string) => {
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(dateIso)}`);
      if (res.ok) {
        const data = (await res.json()) as { bookedIntervals?: BookedInterval[] };
        setBookedIntervals(Array.isArray(data.bookedIntervals) ? data.bookedIntervals : []);
      }
    } catch {
      // Keep current slots if offline/transient error
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  const dayPresetIsos = useMemo(
    () => [dayPresets[0].iso, dayPresets[1].iso, dayPresets[2].iso].join(','),
    [dayPresets[0].iso, dayPresets[1].iso, dayPresets[2].iso]
  );

  const fetchAvailabilitySummary = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/availability/summary?dates=${encodeURIComponent(dayPresetIsos)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { counts?: Record<string, number> };
        if (data.counts && typeof data.counts === 'object') {
          setDateBookingCounts(data.counts);
        }
      }
    } catch {
      // Keep existing summary counts on transient error
    }
  }, [dayPresetIsos]);

  useEffect(() => {
    if (isOpen) {
      void fetchAvailability(selectedDateIso);
    }
  }, [isOpen, selectedDateIso, fetchAvailability]);

  useEffect(() => {
    if (isOpen) {
      void fetchAvailabilitySummary();
    }
  }, [isOpen, fetchAvailabilitySummary]);

  const checkSlotConflict = useCallback(
    (slot: string, duration: number): BookedInterval | undefined => {
      const startMin = parseTimeToMinutes(slot);
      if (startMin === null) return undefined;
      const endMin = startMin + duration;
      return bookedIntervals.find((b) =>
        intervalsOverlap(startMin, endMin, b.startMinutes, b.endMinutes)
      );
    },
    [bookedIntervals]
  );

  const isSlotDirectlyOccupied = useCallback(
    (slot: string): BookedInterval | undefined => {
      const startMin = parseTimeToMinutes(slot);
      if (startMin === null) return undefined;
      return bookedIntervals.find(
        (b) => startMin >= b.startMinutes && startMin < b.endMinutes
      );
    },
    [bookedIntervals]
  );

  const getNearestAvailableSlots = useCallback(
    (targetSlot: string, duration: number): string[] => {
      const targetMin = parseTimeToMinutes(targetSlot) ?? 12 * 60;
      const candidates: { slot: string; dist: number }[] = [];
      for (const s of quickTimes) {
        if (!checkSlotConflict(s, duration)) {
          const sMin = parseTimeToMinutes(s) ?? 0;
          candidates.push({ slot: s, dist: Math.abs(sMin - targetMin) });
        }
      }
      candidates.sort((a, b) => a.dist - b.dist);
      return candidates.slice(0, 4).map((c) => c.slot);
    },
    [quickTimes, checkSlotConflict]
  );

  // Sync initial values when modal opens
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
      const svc = SERVICES_DATA.find((s) => s.id === initialServiceId);
      if (svc && svc.durations.length > 0) {
        if (initialDuration) {
          const matched = svc.durations.find((d) =>
            initialDuration.includes(d.minutes.toString())
          );
          setSelectedDuration(matched ? matched.minutes : svc.durations[0].minutes);
        } else {
          setSelectedDuration(svc.durations[0].minutes);
        }
      }
    }
  }, [initialServiceId, initialDuration]);

  // Reset transient confirmation/errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConflictState(null);
      setSubmitError(null);
      setConfirmedBooking(null);
    }
  }, [isOpen]);

  // Ensure selected duration belongs to active service
  useEffect(() => {
    const hasDuration = activeService.durations.some(
      (d) => d.minutes === selectedDuration
    );
    if (!hasDuration && activeService.durations.length > 0) {
      setSelectedDuration(activeService.durations[0].minutes);
    }
  }, [selectedServiceId, activeService, selectedDuration]);

  // Keep timeSlot aligned when quickTimes changes unless custom time is active
  useEffect(() => {
    if (!useCustomTime && quickTimes.length > 0 && !quickTimes.includes(timeSlot)) {
      const firstAvailable = quickTimes.find(
        (slot) => !checkSlotConflict(slot, selectedDuration)
      );
      setTimeSlot(firstAvailable || quickTimes[Math.min(2, quickTimes.length - 1)]);
    }
  }, [quickTimes, timeSlot, useCustomTime, checkSlotConflict, selectedDuration]);

  if (!isOpen) return null;

  const currentPrice =
    activeService.durations.find((d) => d.minutes === selectedDuration)?.price ||
    activeService.durations[0]?.price ||
    150000;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleSelectQuickTime = (time: string) => {
    setUseCustomTime(false);
    setTimeSlot(time);
    setSubmitError(null);

    const conflict = checkSlotConflict(time, selectedDuration);
    if (conflict) {
      const startMin = parseTimeToMinutes(time) ?? 0;
      const requestedEnd = formatMinutesToTime(startMin + selectedDuration);
      const conflictEnd = formatMinutesToTime(conflict.endMinutes);
      const recs = getNearestAvailableSlots(time, selectedDuration);
      setConflictState({
        message: `Jam ${time}–${requestedEnd} WITA sudah terisi atau bertabrakan dengan jadwal lain (${conflict.timeSlot}–${conflictEnd} WITA).`,
        recommendations: recs,
        nextDayRecommendations: [],
      });
    } else {
      setConflictState(null);
    }
  };

  const handleCustomTimeChange = (value: string) => {
    setTimeSlot(value);
    setSubmitError(null);
    const slotMin = parseTimeToMinutes(value);
    if (isSelectedToday && slotMin !== null && slotMin < baliNow.minutesOfDay) {
      setSubmitError(
        `Jam ${value} WITA sudah terlewat (waktu sekarang ${baliNow.timeHHMM} WITA). Silakan pilih jam setelah pukul ${baliNow.timeHHMM}.`
      );
      setConflictState(null);
      return;
    }
    const conflict = checkSlotConflict(value, selectedDuration);
    if (conflict) {
      const startMin = slotMin ?? 0;
      const requestedEnd = formatMinutesToTime(startMin + selectedDuration);
      const conflictEnd = formatMinutesToTime(conflict.endMinutes);
      const recs = getNearestAvailableSlots(value, selectedDuration);
      setConflictState({
        message: `Jam ${value}–${requestedEnd} WITA bertabrakan dengan reservasi lain (${conflict.timeSlot}–${conflictEnd} WITA).`,
        recommendations: recs,
        nextDayRecommendations: [],
      });
    } else {
      setConflictState(null);
    }
  };

  const handleApplyRecommendation = (recommendedSlot: string, overrideDateIso?: string) => {
    if (overrideDateIso) {
      const presetIdx = dayPresets.findIndex((p) => p.iso === overrideDateIso);
      if (presetIdx >= 0) {
        setDatePreset(presetIdx);
      } else {
        setDatePreset('custom');
        setCustomDate(overrideDateIso);
      }
    }
    setUseCustomTime(!quickTimes.includes(recommendedSlot) && !overrideDateIso);
    setTimeSlot(recommendedSlot);
    setConflictState(null);
    setSubmitError(null);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setConflictState(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateIso: selectedDateIso,
          timeSlot,
          durationMinutes: selectedDuration,
          serviceId: activeService.id,
          serviceTitle: activeService.title,
          customerName: name.trim() || 'Tamu BUNDA',
          note: note.trim(),
          candidateSlots: quickTimes,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        recommendations?: string[];
        nextDayRecommendations?: { dateIso: string; timeSlot: string }[];
        booking?: {
          id: string;
          dateIso: string;
          timeSlot: string;
          startMinutes: number;
          endMinutes: number;
          durationMinutes: number;
          serviceTitle: string;
        };
      };

      if (res.status === 409) {
        setConflictState({
          message:
            data.message ||
            'Waktu yang Anda pilih sudah terisi. Silakan pilih rekomendasi waktu lain.',
          recommendations: Array.isArray(data.recommendations)
            ? data.recommendations
            : [],
          nextDayRecommendations: Array.isArray(data.nextDayRecommendations)
            ? data.nextDayRecommendations
            : [],
        });
        void fetchAvailability(selectedDateIso);
        return;
      }

      if (!res.ok || !data.booking) {
        setSubmitError(
          data.message || 'Gagal memproses jadwal. Silakan periksa kembali pilihan Anda.'
        );
        return;
      }

      setConfirmedBooking({
        id: data.booking.id,
        dateIso: data.booking.dateIso,
        dateDisplay: selectedDateString,
        timeSlot: data.booking.timeSlot,
        endTime: formatMinutesToTime(data.booking.endMinutes),
        durationMinutes: data.booking.durationMinutes,
        serviceTitle: data.booking.serviceTitle,
        price: currentPrice,
      });
      void fetchAvailability(selectedDateIso);
      void fetchAvailabilitySummary();
    } catch {
      setSubmitError('Koneksi ke server sedang bermasalah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseAndEdit = async () => {
    if (confirmedBooking?.id) {
      try {
        await fetch(`/api/bookings/${encodeURIComponent(confirmedBooking.id)}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore network error when releasing
      }
      void fetchAvailability(selectedDateIso);
      void fetchAvailabilitySummary();
    }
    setConfirmedBooking(null);
  };

  const generateWhatsAppMessage = () => {
    const activeTime = confirmedBooking
      ? `${confirmedBooking.timeSlot}–${confirmedBooking.endTime}`
      : timeSlot;
    const activeDate = confirmedBooking ? confirmedBooking.dateDisplay : selectedDateString;
    const activeServiceName = confirmedBooking
      ? confirmedBooking.serviceTitle
      : activeService.title;
    const activeDur = confirmedBooking ? confirmedBooking.durationMinutes : selectedDuration;
    const activePrice = confirmedBooking ? confirmedBooking.price : currentPrice;

    return (
      `Halo BUNDA Traditional Massage, saya ingin membuat reservasi:\n\n` +
      `• Layanan: ${activeServiceName} (${activeDur} menit)\n` +
      `• Estimasi Biaya: ${formatRupiah(activePrice)}\n` +
      `• Lokasi: ${BRANCH_INFO.primary.fullAddress}\n` +
      `• Waktu: ${activeDate} · Jam ${activeTime} WITA\n` +
      `• Nama Tamu: ${name.trim() || 'Tamu BUNDA'}\n` +
      (note.trim() ? `• Catatan / Fokus: ${note.trim()}\n` : '') +
      `\nMohon konfirmasi ketersediaan terapis perempuan untuk jadwal ini. Terima kasih!`
    );
  };

  const whatsappHref = `https://wa.me/${BRANCH_INFO.whatsapp}?text=${encodeURIComponent(
    generateWhatsAppMessage()
  )}`;

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedSlotHasConflict = Boolean(checkSlotConflict(timeSlot, selectedDuration));
  const selectedSlotMinutes = parseTimeToMinutes(timeSlot);
  const selectedSlotIsPast =
    isSelectedToday &&
    selectedSlotMinutes !== null &&
    selectedSlotMinutes < baliNow.minutesOfDay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#f4f2ec] rounded-2xl shadow-2xl border border-[#d9ddd3] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#163828] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center font-serif font-bold text-sm">
              B
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium leading-tight">
                {confirmedBooking ? 'Jadwal Terkonfirmasi' : 'Reservasi Cepat'}
              </h3>
              <p className="text-[11px] text-[#a3bfa9] flex items-center gap-1.5">
                <span>{BRANCH_INFO.primary.fullAddress}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmed State */
          <div className="p-6 sm:p-7 space-y-5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-[#cdd7cc]">
              <div className="w-9 h-9 rounded-full bg-[#163828] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-[#14231b]">
                  Slot waktu berhasil dikunci
                </h4>
                <p className="text-xs text-[#4a594e] mt-1 leading-relaxed">
                  Jadwal Anda telah dicatat agar tidak bentrok dengan tamu lain. Klik
                  tombol di bawah untuk mengirim detail reservasi ke WhatsApp BUNDA.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#ebeae2]/70 border border-[#d6dcd2] space-y-2.5 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[#5e6e62]">Perawatan</span>
                <span className="font-semibold text-[#14231b] text-right">
                  {confirmedBooking.serviceTitle} ({confirmedBooking.durationMinutes} Menit)
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5e6e62]">Tanggal & Waktu</span>
                <span className="font-semibold text-[#14231b] text-right tabular-nums">
                  {confirmedBooking.dateDisplay} · {confirmedBooking.timeSlot}–
                  {confirmedBooking.endTime} WITA
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5e6e62]">Pemesan</span>
                <span className="font-semibold text-[#14231b] text-right">
                  {name.trim() || 'Tamu BUNDA'}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#d6dcd2]">
                <span className="text-[#5e6e62]">Estimasi Biaya</span>
                <span className="font-serif text-base font-bold text-[#163828] tabular-nums">
                  {formatRupiah(confirmedBooking.price)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleReleaseAndEdit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-white hover:bg-[#ebeae2] text-xs font-semibold text-[#3f4f44] border border-[#cfd5cb] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ubah Jadwal</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-lg bg-white hover:bg-[#ebeae2] text-xs font-medium text-[#3f4f44] border border-[#cfd5cb] transition-colors cursor-pointer"
                title="Salin teks pesan"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#163828]" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#163828] hover:bg-[#0f291d] text-white px-5 py-3 rounded-lg text-xs font-semibold tracking-wider transition-all shadow-md active:scale-[0.98] whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>KIRIM KE WHATSAPP BUNDA</span>
              </a>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <>
            <div className="p-5 sm:p-6 space-y-5 max-h-[74vh] overflow-y-auto">
              {/* 1. Pilih Layanan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5e6e62] mb-2">
                  1. Pilih Layanan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES_DATA.map((service) => {
                    const isSelected = service.id === selectedServiceId;
                    const startingPrice = service.durations[0]?.price || 75000;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setSelectedDuration(service.durations[0]?.minutes || 60);
                          setConflictState(null);
                        }}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-[#163828] bg-white shadow-xs ring-1 ring-[#163828]'
                            : 'border-[#d6dcd2] bg-[#ebeae2]/50 hover:bg-[#ebeae2]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-serif font-medium text-xs sm:text-sm text-[#14231b] leading-snug">
                            {service.title}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#163828] text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-[#66766a] block mt-1 font-sans tabular-nums">
                          Mulai {formatRupiah(startingPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pilihan Durasi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5e6e62]">
                    2. Durasi Sesi
                  </label>
                  <span className="text-[11px] text-[#6a7a6e]">
                    {activeService.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeService.durations.map((d) => {
                    const isDurSelected = selectedDuration === d.minutes;
                    return (
                      <button
                        key={d.minutes}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(d.minutes);
                          const conflict = checkSlotConflict(timeSlot, d.minutes);
                          if (conflict) {
                            const startMin = parseTimeToMinutes(timeSlot) ?? 0;
                            const requestedEnd = formatMinutesToTime(startMin + d.minutes);
                            const conflictEnd = formatMinutesToTime(conflict.endMinutes);
                            const recs = getNearestAvailableSlots(timeSlot, d.minutes);
                            setConflictState({
                              message: `Durasi ${d.minutes} menit pada jam ${timeSlot}–${requestedEnd} WITA bertabrakan dengan jadwal lain (${conflict.timeSlot}–${conflictEnd} WITA).`,
                              recommendations: recs,
                              nextDayRecommendations: [],
                            });
                          } else {
                            setConflictState(null);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isDurSelected
                            ? 'bg-[#163828] text-white shadow-xs'
                            : 'bg-white/80 text-[#3f4f44] border border-[#d6dcd2] hover:bg-white'
                        }`}
                      >
                        <span>{d.minutes} Menit</span>
                        <span className="text-[11px] opacity-80 font-normal tabular-nums">
                          ({formatRupiah(d.price)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Waktu Kedatangan */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5e6e62]">
                    3. Waktu Kedatangan
                  </label>
                  <div className="flex items-center gap-2">
                    {loadingAvailability && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#5e6e62]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Cek jadwal...</span>
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#e8ede5] border border-[#cfd8cb] text-[10px] font-semibold text-[#163828] tabular-nums"
                      title="Waktu lokal Bali (WITA) berjalan secara real-time"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>Sekarang {baliNow.timeHHMM} WITA</span>
                    </span>
                  </div>
                </div>

                {/* Quick Day Chips */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {dayPresets.map((preset, idx) => {
                    const bookedCount = dateBookingCounts[preset.iso] || 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDatePreset(idx);
                          setConflictState(null);
                        }}
                        className={`py-2 px-1 text-center rounded-lg border transition-all cursor-pointer ${
                          datePreset === idx
                            ? 'bg-[#163828] text-white border-[#163828] shadow-xs'
                            : 'bg-white/80 text-[#3f4f44] border-[#d6dcd2] hover:bg-white'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-tight">
                          {preset.label}
                        </span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            datePreset === idx ? 'text-[#a3bfa9]' : 'text-[#6a7a6e]'
                          }`}
                        >
                          {preset.dateDisplay.split(', ')[1]}
                        </span>
                        {bookedCount > 0 && (
                          <span
                            className={`inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none ${
                              datePreset === idx
                                ? 'bg-amber-300/20 text-amber-200'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>{bookedCount} terisi</span>
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset('custom');
                      setConflictState(null);
                    }}
                    className={`py-2 px-1 text-center rounded-lg border transition-all cursor-pointer ${
                      datePreset === 'custom'
                        ? 'bg-[#163828] text-white border-[#163828] shadow-xs'
                        : 'bg-white/80 text-[#3f4f44] border-[#d6dcd2] hover:bg-white'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight">
                      Lainnya
                    </span>
                    <span
                      className={`block text-[10px] mt-0.5 ${
                        datePreset === 'custom' ? 'text-[#a3bfa9]' : 'text-[#6a7a6e]'
                      }`}
                    >
                      Pilih tgl
                    </span>
                  </button>
                </div>

                {datePreset === 'custom' && (
                  <div className="mb-2.5 animate-in fade-in duration-150">
                    <input
                      type="date"
                      value={customDate}
                      min={baliNow.isoDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setConflictState(null);
                        setSubmitError(null);
                      }}
                      className="w-full bg-white border border-[#d6dcd2] rounded-lg px-3 py-2 text-xs text-[#14231b] focus:outline-none focus:ring-1 focus:ring-[#163828]"
                    />
                  </div>
                )}

                {/* Quick Time Slots Grid */}
                {quickTimes.length > 0 ? (
                  <div className="space-y-2.5">
                    {/* Availability Legend */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#5e6e62]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>Tersedia</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-rose-800 font-medium">
                          <Lock className="w-2.5 h-2.5 text-rose-600" />
                          <span>Sudah Dibooking / Bentrok</span>
                        </span>
                      </div>
                      {bookedIntervals.length > 0 && (
                        <span className="font-semibold text-rose-700">
                          {bookedIntervals.length} jadwal sudah terisi
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {quickTimes.map((time) => {
                        const isTimeSelected = !useCustomTime && timeSlot === time;
                        const directBooking = isSlotDirectlyOccupied(time);
                        const overlapBooking = checkSlotConflict(time, selectedDuration);
                        const isBusy = Boolean(directBooking || overlapBooking);
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleSelectQuickTime(time)}
                            aria-label={
                              directBooking
                                ? `Jam ${time} sudah dibooking`
                                : overlapBooking
                                  ? `Jam ${time} bentrok dengan durasi`
                                  : `Jam ${time} tersedia`
                            }
                            className={`py-2 px-1 text-center rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer tabular-nums flex flex-col items-center justify-center relative ${
                              isBusy
                                ? isTimeSelected
                                  ? 'bg-rose-700 text-white border border-rose-700 shadow-xs'
                                  : 'bg-rose-50/90 text-rose-800 border border-rose-200 hover:border-rose-400'
                                : isTimeSelected
                                  ? 'bg-[#25573e] text-white font-bold shadow-xs border border-[#25573e]'
                                  : 'bg-white/90 text-[#3f4f44] border border-[#d6dcd2] hover:bg-white hover:border-[#25573e]/40'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isBusy && (
                                <Lock
                                  className={`w-2.5 h-2.5 shrink-0 ${
                                    isTimeSelected ? 'text-white' : 'text-rose-600'
                                  }`}
                                />
                              )}
                              <span className={isBusy ? 'line-through opacity-85' : ''}>
                                {time}
                              </span>
                            </div>
                            {isBusy ? (
                              <span
                                className={`text-[9px] font-semibold tracking-tight mt-0.5 leading-none ${
                                  isTimeSelected ? 'text-rose-100' : 'text-rose-700'
                                }`}
                              >
                                {directBooking ? 'Dibooking' : 'Bentrok'}
                              </span>
                            ) : (
                              <span
                                className={`text-[9px] mt-0.5 leading-none ${
                                  isTimeSelected ? 'text-emerald-100' : 'text-emerald-700'
                                }`}
                              >
                                Tersedia
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explicit Booked Intervals Indicator */}
                    {bookedIntervals.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200/90 text-xs">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-900 mb-1.5">
                          <Lock className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                          <span>
                            Waktu yang sudah dibooking ({selectedDateString}):
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {bookedIntervals.map((b, idx) => (
                            <span
                              key={`${b.startMinutes}-${b.endMinutes}-${idx}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-rose-200 text-[11px] font-semibold text-rose-900 tabular-nums"
                            >
                              <span>
                                {b.timeSlot}–{formatMinutesToTime(b.endMinutes)} WITA
                              </span>
                              <span className="text-[10px] font-normal text-rose-700">
                                ({b.durationMinutes} mnt)
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional Custom Time Picker */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setUseCustomTime((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#25573e] hover:text-[#163828] underline underline-offset-2 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {useCustomTime ? 'Kembali ke jam pilihan' : 'Atur jam khusus'}
                        </span>
                      </button>

                      {useCustomTime && (
                        <input
                          type="time"
                          value={timeSlot}
                          min={isSelectedToday ? baliNow.timeHHMM : undefined}
                          onChange={(e) => handleCustomTimeChange(e.target.value)}
                          className="bg-white border border-[#cfd5cb] rounded-lg px-2.5 py-1 text-xs text-[#14231b] tabular-nums focus:outline-none focus:ring-1 focus:ring-[#163828]"
                        />
                      )}
                    </div>
                  </div>
                ) : rawQuickTimes.length > 0 && isSelectedToday ? (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <p className="font-semibold">
                        Semua jam booking hari ini sudah terlewat
                      </p>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Waktu sekarang pukul {baliNow.timeHHMM} WITA. Silakan pilih jadwal untuk esok hari.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDatePreset(1);
                        setConflictState(null);
                        setSubmitError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#163828] hover:bg-[#0f291d] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      Pilih Besok
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#ebeae2] border border-[#d6dcd2] text-xs text-[#4a594e]">
                    Pada tanggal ini lokasi tutup menurut jadwal Google Maps. Silakan
                    pilih hari lain atau konfirmasi via WhatsApp.
                  </div>
                )}

                {/* Conflict Rejection & Alternative Recommendations */}
                {conflictState && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <p className="font-semibold text-amber-950">
                          Waktu tidak tersedia (bentrok jadwal)
                        </p>
                        <p className="text-amber-900 mt-0.5">{conflictState.message}</p>
                      </div>
                    </div>

                    {conflictState.recommendations.length > 0 && (
                      <div className="pt-1">
                        <span className="block text-[11px] font-semibold text-amber-900 mb-1.5">
                          Rekomendasi waktu lain yang tersedia:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {conflictState.recommendations.map((rec) => (
                            <button
                              key={rec}
                              type="button"
                              onClick={() => handleApplyRecommendation(rec)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#163828] hover:text-white text-[#163828] border border-amber-300 hover:border-[#163828] text-xs font-semibold tabular-nums transition-colors cursor-pointer"
                            >
                              Pilih {rec}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {conflictState.recommendations.length === 0 &&
                      conflictState.nextDayRecommendations.length > 0 && (
                        <div className="pt-1">
                          <span className="block text-[11px] font-semibold text-amber-900 mb-1.5">
                            Semua jam hari ini penuh. Rekomendasi hari berikutnya:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {conflictState.nextDayRecommendations.map((rec) => (
                              <button
                                key={`${rec.dateIso}-${rec.timeSlot}`}
                                type="button"
                                onClick={() =>
                                  handleApplyRecommendation(rec.timeSlot, rec.dateIso)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#163828] hover:text-white text-[#163828] border border-amber-300 hover:border-[#163828] text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <CalendarClock className="w-3.5 h-3.5" />
                                <span>
                                  {formatDisplayDateFromIso(rec.dateIso)} · {rec.timeSlot}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    {conflictState.recommendations.length === 0 &&
                      conflictState.nextDayRecommendations.length === 0 && (
                        <p className="text-[11px] text-amber-900">
                          Silakan pilih hari lain pada bagian di atas untuk melihat slot yang tersedia.
                        </p>
                      )}
                  </div>
                )}

                {submitError && (
                  <div className="mt-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="text-[10px] text-[#6a7a6e] mt-1.5 flex items-center justify-end gap-1.5">
                  <span>
                    {hours.isFromGoogleMaps
                      ? `Jam operasional (Google Maps): ${hours.summaryLabel}`
                      : 'Jam operasional mengikuti jadwal Google Maps'}
                  </span>
                  {!hours.isFromGoogleMaps && (
                    <a
                      href={googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[#163828] font-semibold underline"
                    >
                      <span>Cek Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* 4. Nama & Catatan Singkat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5e6e62] mb-1">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Rina / Pak Ketut"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#d6dcd2] rounded-lg px-3 py-2.5 text-xs text-[#14231b] placeholder:text-[#94a196] focus:outline-none focus:ring-1 focus:ring-[#163828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5e6e62] mb-1">
                    Catatan / Fokus (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pundak kaku, tekanan sedang"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white border border-[#d6dcd2] rounded-lg px-3 py-2.5 text-xs text-[#14231b] placeholder:text-[#94a196] focus:outline-none focus:ring-1 focus:ring-[#163828]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="px-5 py-4 bg-[#ebeae2] border-t border-[#d9ddd3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto text-left">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-[#66766a]">
                  Total Biaya
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-bold text-[#163828] tabular-nums">
                    {formatRupiah(currentPrice)}
                  </span>
                  <span className="text-[11px] text-[#5e6e62]">
                    · {selectedDuration} Menit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-3 py-3 rounded-lg bg-white/85 hover:bg-white text-xs font-medium text-[#3f4f44] border border-[#cfd5cb] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                  title="Salin teks pesan"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#163828]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || quickTimes.length === 0 || selectedSlotIsPast}
                  onClick={() => void handleConfirmBooking()}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedSlotHasConflict
                      ? 'bg-[#7b3b34] hover:bg-[#662f29] text-white'
                      : 'bg-[#163828] hover:bg-[#0f291d] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>MEMERIKSA JADWAL...</span>
                    </>
                  ) : selectedSlotHasConflict ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>JAM SUDAH DIBOOKING</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>KONFIRMASI & PESAN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
