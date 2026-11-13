import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  APIProvider,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { BRANCH_INFO } from '../data/spaData';

export const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __GMP_FALLBACK_KEY__ !== 'undefined' ? __GMP_FALLBACK_KEY__ : '');

interface OpeningHoursPointLike {
  day: number;
  hour: number;
  minute: number;
}

interface OpeningHoursPeriodLike {
  open: OpeningHoursPointLike;
  close?: OpeningHoursPointLike | null;
}

interface OpeningHoursLike {
  periods?: OpeningHoursPeriodLike[];
  weekdayDescriptions?: string[];
}

interface PlaceLike {
  location?: { toJSON: () => { lat: number; lng: number } } | null;
  displayName?: string | null;
  formattedAddress?: string | null;
  regularOpeningHours?: OpeningHoursLike | null;
  googleMapsURI?: string | null;
}

export interface GooglePlaceHours {
  isFromGoogleMaps: boolean;
  dayBadgeLabel: string;
  compactHours: string;
  summaryLabel: string;
  todayHours: string | null;
  weekdayDescriptions: string[];
  isOpenNow: boolean | null;
  is24Hours: boolean;
  getSlotsForDate: (date: Date) => string[];
}

export interface GooglePlaceContextValue {
  position: { lat: number; lng: number } | null;
  displayName: string;
  formattedAddress: string;
  googleMapsUri: string;
  hours: GooglePlaceHours;
  isLoading: boolean;
  errorMessage: string | null;
  hasApiKey: boolean;
}

const DEFAULT_BOOKING_SLOTS = [
  '09:00',
  '10:30',
  '12:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30',
];

const FALLBACK_HOURS: GooglePlaceHours = {
  isFromGoogleMaps: false,
  dayBadgeLabel: 'JAM OPERASIONAL',
  compactHours: 'Sesuai Google Maps',
  summaryLabel: 'Lihat di Google Maps',
  todayHours: null,
  weekdayDescriptions: [],
  isOpenNow: null,
  is24Hours: false,
  getSlotsForDate: () => DEFAULT_BOOKING_SLOTS,
};

const GooglePlaceContext = createContext<GooglePlaceContextValue>({
  position: null,
  displayName: BRANCH_INFO.primary.name,
  formattedAddress: BRANCH_INFO.primary.fullAddress,
  googleMapsUri: BRANCH_INFO.primary.mapsUrl,
  hours: FALLBACK_HOURS,
  isLoading: false,
  errorMessage: null,
  hasApiKey: Boolean(MAPS_API_KEY),
});

export function useGooglePlace() {
  return useContext(GooglePlaceContext);
}

function isQuotaError(err: unknown): boolean {
  const text =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === 'object' && err !== null
        ? JSON.stringify(err)
        : String(err);
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('429') ||
    text.includes('OverQuotaMapError') ||
    text.includes('QuotaExceededError')
  );
}

function isTargetNeighborhood(formattedAddress?: string | null): boolean {
  if (!formattedAddress) return false;
  const lower = formattedAddress.toLowerCase();
  return (
    lower.includes('tibung') ||
    lower.includes('kwanji') ||
    lower.includes('dalung')
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDotTime(hour: number, minute: number): string {
  return `${pad2(hour)}.${pad2(minute)}`;
}

const WEEKDAY_EN_TO_DAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const DAY_TO_INDONESIAN = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

function getBaliCurrentTime(): { day: number; minutesOfDay: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const weekdayPart = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
  const hourPart = Number(parts.find((p) => p.type === 'hour')?.value || '12');
  const minutePart = Number(parts.find((p) => p.type === 'minute')?.value || '0');

  return {
    day: WEEKDAY_EN_TO_DAY[weekdayPart] ?? 1,
    minutesOfDay: (hourPart % 24) * 60 + minutePart,
  };
}

function computeIsOpenNow(
  periods: OpeningHoursPeriodLike[]
): { isOpenNow: boolean | null; is24Hours: boolean } {
  if (!periods.length) return { isOpenNow: null, is24Hours: false };

  if (
    periods.length === 1 &&
    periods[0].open.day === 0 &&
    periods[0].open.hour === 0 &&
    periods[0].open.minute === 0 &&
    !periods[0].close
  ) {
    return { isOpenNow: true, is24Hours: true };
  }

  const { day, minutesOfDay } = getBaliCurrentTime();
  const nowWeekMin = day * 1440 + minutesOfDay;
  const WEEK_TOTAL = 7 * 1440;

  for (const period of periods) {
    if (!period.close) continue;
    const start = period.open.day * 1440 + period.open.hour * 60 + period.open.minute;
    let end = period.close.day * 1440 + period.close.hour * 60 + period.close.minute;
    if (end <= start) {
      end += WEEK_TOTAL;
    }

    const candidates = [nowWeekMin, nowWeekMin + WEEK_TOTAL];
    for (const candidate of candidates) {
      if (candidate >= start && candidate < end) {
        return { isOpenNow: true, is24Hours: false };
      }
    }
  }

  return { isOpenNow: false, is24Hours: false };
}

function buildSlotsFromPeriods(
  periods: OpeningHoursPeriodLike[],
  targetDay: number,
  is24Hours: boolean
): string[] {
  if (is24Hours) {
    return ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '22:30'];
  }

  const dayPeriods = periods.filter((p) => p.open.day === targetDay);
  if (dayPeriods.length === 0) {
    return [];
  }

  const slots: string[] = [];
  for (const p of dayPeriods) {
    const startMin = p.open.hour * 60 + p.open.minute;
    let endMin = p.close ? p.close.hour * 60 + p.close.minute : 22 * 60;
    if (p.close && p.close.day !== p.open.day) {
      endMin += 1440;
    }
    const lastStartMin = Math.max(startMin, endMin - 60);
    const totalSpan = lastStartMin - startMin;
    const step = totalSpan > 8 * 60 ? 90 : 60;

    for (let m = startMin; m <= lastStartMin && slots.length < 12; m += step) {
      const normalized = m % 1440;
      slots.push(`${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`);
    }
  }

  return slots.length > 0 ? slots : DEFAULT_BOOKING_SLOTS;
}

function parseGoogleOpeningHours(
  openingHours?: OpeningHoursLike | null
): GooglePlaceHours {
  if (!openingHours) return FALLBACK_HOURS;

  const periods = openingHours.periods || [];
  const weekdayDescriptions = openingHours.weekdayDescriptions || [];
  if (periods.length === 0 && weekdayDescriptions.length === 0) {
    return FALLBACK_HOURS;
  }

  const { isOpenNow, is24Hours } = computeIsOpenNow(periods);
  const { day: todayIndex } = getBaliCurrentTime();
  const todayIndoName = DAY_TO_INDONESIAN[todayIndex];

  const todayLine = weekdayDescriptions.find((line) =>
    line.toLowerCase().startsWith(todayIndoName.toLowerCase())
  );
  const todayHours = todayLine
    ? todayLine.split(':').slice(1).join(':').trim()
    : null;

  if (is24Hours) {
    return {
      isFromGoogleMaps: true,
      dayBadgeLabel: 'BUKA SETIAP HARI',
      compactHours: 'Buka 24 Jam',
      summaryLabel: 'Buka 24 Jam (WITA)',
      todayHours: 'Buka 24 jam',
      weekdayDescriptions,
      isOpenNow: true,
      is24Hours: true,
      getSlotsForDate: () => buildSlotsFromPeriods(periods, 0, true),
    };
  }

  // Check if all 7 days share the same open & close hours
  const allSevenDays = periods.length === 7 && periods.every((p) => Boolean(p.close));
  const firstPeriod = periods[0];
  const sameEveryDay =
    allSevenDays &&
    firstPeriod?.close &&
    periods.every(
      (p) =>
        p.open.hour === firstPeriod.open.hour &&
        p.open.minute === firstPeriod.open.minute &&
        p.close?.hour === firstPeriod.close?.hour &&
        p.close?.minute === firstPeriod.close?.minute
    );

  if (sameEveryDay && firstPeriod.close) {
    const compact = `${formatDotTime(firstPeriod.open.hour, firstPeriod.open.minute)} - ${formatDotTime(firstPeriod.close.hour, firstPeriod.close.minute)}`;
    return {
      isFromGoogleMaps: true,
      dayBadgeLabel: 'BUKA SETIAP HARI',
      compactHours: compact,
      summaryLabel: `${compact} WITA`,
      todayHours: todayHours || compact,
      weekdayDescriptions,
      isOpenNow,
      is24Hours: false,
      getSlotsForDate: (date: Date) => buildSlotsFromPeriods(periods, date.getDay(), false),
    };
  }

  const compactFromToday =
    todayHours && todayHours.toLowerCase() !== 'tutup'
      ? todayHours
      : todayHours || 'Lihat jadwal';

  return {
    isFromGoogleMaps: true,
    dayBadgeLabel: `HARI INI (${todayIndoName.toUpperCase()})`,
    compactHours: compactFromToday,
    summaryLabel:
      todayHours && todayHours.toLowerCase() === 'tutup'
        ? 'Tutup hari ini'
        : `${compactFromToday} WITA`,
    todayHours,
    weekdayDescriptions,
    isOpenNow,
    is24Hours: false,
    getSlotsForDate: (date: Date) =>
      periods.length > 0
        ? buildSlotsFromPeriods(periods, date.getDay(), false)
        : DEFAULT_BOOKING_SLOTS,
  };
}

const GooglePlaceProviderInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [state, setState] = useState<GooglePlaceContextValue>({
    position: null,
    displayName: BRANCH_INFO.primary.name,
    formattedAddress: BRANCH_INFO.primary.fullAddress,
    googleMapsUri: BRANCH_INFO.primary.mapsUrl,
    hours: FALLBACK_HOURS,
    isLoading: Boolean(MAPS_API_KEY),
    errorMessage: null,
    hasApiKey: Boolean(MAPS_API_KEY),
  });

  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      setState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage:
          'Peta tidak dapat dimuat sementara waktu. Anda tetap dapat membuka petunjuk arah langsung di Google Maps.',
      }));
    } else if (apiStatus === APILoadingStatus.FAILED) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage:
          'Gagal memuat layanan peta. Silakan buka lokasi langsung di Google Maps.',
      }));
    }
  }, [apiStatus]);

  useEffect(() => {
    if (!placesLib) return;

    let cancelled = false;

    async function resolvePlaceDetails() {
      setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

      const fields = [
        'id',
        'displayName',
        'formattedAddress',
        'location',
        'regularOpeningHours',
        'googleMapsURI',
      ];

      try {
        // 1. Resolve the exact Jalan Tibung Sari No. 51B, Banjar Kwanji address coordinates first
        const addressQueries = [
          BRANCH_INFO.primary.fullAddress,
          'Jl. Tibung Sari No. 51B, Kwanji, Dalung, Kuta Utara, Badung, Bali',
          'Jl. Tibung Sari No. 51B, Bali',
          'Jalan Tibung Sari, Banjar Kwanji, Dalung, Kuta Utara, Badung, Bali',
        ];

        let resolvedAddressPlace: PlaceLike | undefined;

        for (const query of addressQueries) {
          const addrRes = await placesLib.Place.searchByText({
            textQuery: query,
            fields,
            language: 'id',
            region: 'ID',
            maxResultCount: 1,
          });
          const candidate = addrRes?.places?.[0];
          if (candidate?.location) {
            resolvedAddressPlace = candidate;
            break;
          }
        }

        if (!resolvedAddressPlace?.location) {
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              errorMessage:
                'Titik peta tidak ditemukan otomatis. Gunakan tombol di bawah untuk membuka langsung di Google Maps.',
            }));
          }
          return;
        }

        const baseLocation = resolvedAddressPlace.location.toJSON();
        let bestHoursSource = resolvedAddressPlace.regularOpeningHours;
        let bestGoogleMapsUri = resolvedAddressPlace.googleMapsURI;

        // 2. If address pin doesn't include business hours, bias search around Jalan Tibung Sari No. 51B Kwanji
        if (!bestHoursSource) {
          const nearbyNameRes = await placesLib.Place.searchByText({
            textQuery: `${BRANCH_INFO.primary.name} Jalan Tibung Sari No. 51B Kwanji`,
            locationBias: baseLocation,
            fields,
            language: 'id',
            region: 'ID',
            maxResultCount: 3,
          });
          const nearbyMatch = (nearbyNameRes?.places as PlaceLike[] | undefined)?.find(
            (p: PlaceLike) =>
              p.regularOpeningHours &&
              isTargetNeighborhood(p.formattedAddress)
          );
          if (nearbyMatch?.regularOpeningHours) {
            bestHoursSource = nearbyMatch.regularOpeningHours;
            bestGoogleMapsUri = nearbyMatch.googleMapsURI || bestGoogleMapsUri;
          }
        }

        if (!cancelled) {
          setState({
            position: baseLocation,
            displayName: BRANCH_INFO.primary.name,
            formattedAddress: BRANCH_INFO.primary.fullAddress,
            googleMapsUri: bestGoogleMapsUri || BRANCH_INFO.primary.mapsUrl,
            hours: parseGoogleOpeningHours(bestHoursSource),
            isLoading: false,
            errorMessage: null,
            hasApiKey: true,
          });
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            errorMessage:
              'Layanan peta sedang sibuk. Anda dapat membuka rute lokasi melalui Google Maps.',
          }));
        }
      }
    }

    void resolvePlaceDetails();

    return () => {
      cancelled = true;
    };
  }, [placesLib]);

  return (
    <GooglePlaceContext.Provider value={state}>
      {children}
    </GooglePlaceContext.Provider>
  );
};

export const GooglePlaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!MAPS_API_KEY) {
    return (
      <GooglePlaceContext.Provider
        value={{
          position: null,
          displayName: BRANCH_INFO.primary.name,
          formattedAddress: BRANCH_INFO.primary.fullAddress,
          googleMapsUri: BRANCH_INFO.primary.mapsUrl,
          hours: FALLBACK_HOURS,
          isLoading: false,
          errorMessage: 'Kunci Google Maps belum aktif di lingkungan pratinjau ini.',
          hasApiKey: false,
        }}
      >
        {children}
      </GooglePlaceContext.Provider>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['places', 'marker']}
      language="id"
      region="ID"
    >
      <GooglePlaceProviderInner>{children}</GooglePlaceProviderInner>
    </APIProvider>
  );
};
