import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

interface BookingRecord {
  id: string;
  dateIso: string;
  startMinutes: number;
  endMinutes: number;
  timeSlot: string;
  durationMinutes: number;
  serviceId: string;
  serviceTitle: string;
  customerName: string;
  note: string;
  createdAt: string;
}

interface BookedInterval {
  startMinutes: number;
  endMinutes: number;
  timeSlot: string;
  durationMinutes: number;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

const DEFAULT_CANDIDATE_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

let writeQueue: Promise<void> = Promise.resolve();

function withBookingLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
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

async function readBookings(): Promise<BookingRecord[]> {
  try {
    const raw = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'ENOENT'
    ) {
      return [];
    }
    throw err;
  }
}

async function writeBookings(bookings: BookingRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${BOOKINGS_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(bookings, null, 2), 'utf-8');
  await fs.rename(tempFile, BOOKINGS_FILE);
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

function findRecommendedSlots(
  bookingsForDate: BookingRecord[],
  requestedStart: number,
  durationMinutes: number,
  candidateSlots: string[],
  minStartMinutes = 0
): string[] {
  const available: { slot: string; distance: number }[] = [];
  const seen = new Set<string>();

  for (const slot of candidateSlots) {
    if (seen.has(slot)) continue;
    seen.add(slot);
    const startMin = parseTimeToMinutes(slot);
    if (startMin === null || startMin < minStartMinutes) continue;
    const endMin = startMin + durationMinutes;

    const hasConflict = bookingsForDate.some((b) =>
      intervalsOverlap(startMin, endMin, b.startMinutes, b.endMinutes)
    );
    if (!hasConflict) {
      available.push({
        slot,
        distance: Math.abs(startMin - requestedStart),
      });
    }
  }

  available.sort((a, b) => a.distance - b.distance);
  return available.slice(0, 4).map((item) => item.slot);
}

function addDaysIso(dateIso: string, offsetDays: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return dt.toISOString().slice(0, 10);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/availability', async (req: Request, res: Response) => {
    const dateParam = typeof req.query.date === 'string' ? req.query.date.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      res.status(400).json({ error: 'INVALID_DATE', message: 'Format tanggal tidak valid.' });
      return;
    }

    try {
      const bookings = await readBookings();
      const bookedIntervals: BookedInterval[] = bookings
        .filter((b) => b.dateIso === dateParam)
        .sort((a, b) => a.startMinutes - b.startMinutes)
        .map((b) => ({
          startMinutes: b.startMinutes,
          endMinutes: b.endMinutes,
          timeSlot: b.timeSlot,
          durationMinutes: b.durationMinutes,
        }));

      res.json({ date: dateParam, bookedIntervals });
    } catch (error) {
      console.error('Failed to read availability:', error);
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Gagal memeriksa ketersediaan jadwal.' });
    }
  });

  app.get('/api/availability/summary', async (req: Request, res: Response) => {
    const rawDates = typeof req.query.dates === 'string' ? req.query.dates : '';
    const dates = rawDates
      .split(',')
      .map((d) => d.trim())
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .slice(0, 14);

    if (dates.length === 0) {
      res.json({ counts: {} });
      return;
    }

    try {
      const bookings = await readBookings();
      const counts: Record<string, number> = {};
      for (const dateIso of dates) {
        counts[dateIso] = 0;
      }
      for (const b of bookings) {
        if (Object.prototype.hasOwnProperty.call(counts, b.dateIso)) {
          counts[b.dateIso] += 1;
        }
      }
      res.json({ counts });
    } catch (error) {
      console.error('Failed to read availability summary:', error);
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Gagal memuat ringkasan jadwal.' });
    }
  });

  app.post('/api/bookings', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const dateIso = typeof body.dateIso === 'string' ? body.dateIso.trim() : '';
    const timeSlot = typeof body.timeSlot === 'string' ? body.timeSlot.trim() : '';
    const durationMinutes = Number(body.durationMinutes);
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId.trim() : '';
    const serviceTitle = typeof body.serviceTitle === 'string' ? body.serviceTitle.trim() : '';
    const customerName =
      typeof body.customerName === 'string' && body.customerName.trim()
        ? body.customerName.trim().slice(0, 80)
        : 'Tamu BUNDA';
    const note =
      typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';
    const rawCandidates = Array.isArray(body.candidateSlots)
      ? body.candidateSlots.filter((s): s is string => typeof s === 'string')
      : [];
    const candidateSlots =
      rawCandidates.length > 0 ? rawCandidates : DEFAULT_CANDIDATE_SLOTS;

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateIso) ||
      !serviceId ||
      !serviceTitle ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 15 ||
      durationMinutes > 240
    ) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Data reservasi belum lengkap atau tidak valid.',
      });
      return;
    }

    const startMinutes = parseTimeToMinutes(timeSlot);
    if (startMinutes === null) {
      res.status(400).json({
        error: 'INVALID_TIME',
        message: 'Format jam kedatangan tidak valid.',
      });
      return;
    }

    const baliNow = getBaliNowParts();
    if (
      dateIso < baliNow.isoDate ||
      (dateIso === baliNow.isoDate && startMinutes < baliNow.minutesOfDay)
    ) {
      res.status(400).json({
        error: 'PAST_TIME',
        message: `Jam ${timeSlot} WITA sudah terlewat (waktu Bali sekarang ${baliNow.timeHHMM} WITA). Silakan pilih jam yang belum terlewat atau tanggal berikutnya.`,
      });
      return;
    }

    const endMinutes = startMinutes + durationMinutes;
    const minRecommendedStart = dateIso === baliNow.isoDate ? baliNow.minutesOfDay : 0;

    try {
      const outcome = await withBookingLock(async () => {
        const bookings = await readBookings();
        const sameDateBookings = bookings.filter((b) => b.dateIso === dateIso);

        const conflict = sameDateBookings.find((b) =>
          intervalsOverlap(startMinutes, endMinutes, b.startMinutes, b.endMinutes)
        );

        if (conflict) {
          const recommendations = findRecommendedSlots(
            sameDateBookings,
            startMinutes,
            durationMinutes,
            candidateSlots,
            minRecommendedStart
          );

          const nextDayRecommendations: { dateIso: string; timeSlot: string }[] = [];
          if (recommendations.length === 0) {
            for (let offset = 1; offset <= 3; offset += 1) {
              const nextDate = addDaysIso(dateIso, offset);
              const nextBookings = bookings.filter((b) => b.dateIso === nextDate);
              const nextSlots = findRecommendedSlots(
                nextBookings,
                startMinutes,
                durationMinutes,
                candidateSlots
              );
              if (nextSlots.length > 0) {
                nextDayRecommendations.push({
                  dateIso: nextDate,
                  timeSlot: nextSlots[0],
                });
              }
            }
          }

          return {
            ok: false as const,
            conflict,
            recommendations,
            nextDayRecommendations,
          };
        }

        const newBooking: BookingRecord = {
          id: crypto.randomUUID(),
          dateIso,
          startMinutes,
          endMinutes,
          timeSlot,
          durationMinutes,
          serviceId,
          serviceTitle,
          customerName,
          note,
          createdAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        await writeBookings(bookings);

        return { ok: true as const, booking: newBooking };
      });

      if (!outcome.ok) {
        const conflictEnd = formatMinutesToTime(outcome.conflict.endMinutes);
        const requestedEnd = formatMinutesToTime(endMinutes);
        res.status(409).json({
          error: 'TIME_CONFLICT',
          message: `Maaf, jam ${timeSlot}–${requestedEnd} WITA bertabrakan dengan reservasi lain pada ${outcome.conflict.timeSlot}–${conflictEnd} WITA.`,
          conflictingInterval: {
            timeSlot: outcome.conflict.timeSlot,
            endTime: conflictEnd,
            startMinutes: outcome.conflict.startMinutes,
            endMinutes: outcome.conflict.endMinutes,
          },
          recommendations: outcome.recommendations,
          nextDayRecommendations: outcome.nextDayRecommendations,
        });
        return;
      }

      res.status(201).json({
        booking: {
          id: outcome.booking.id,
          dateIso: outcome.booking.dateIso,
          timeSlot: outcome.booking.timeSlot,
          startMinutes: outcome.booking.startMinutes,
          endMinutes: outcome.booking.endMinutes,
          durationMinutes: outcome.booking.durationMinutes,
          serviceTitle: outcome.booking.serviceTitle,
        },
      });
    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(500).json({
        error: 'SERVER_ERROR',
        message: 'Terjadi kendala saat menyimpan jadwal. Silakan coba lagi.',
      });
    }
  });

  app.delete('/api/bookings/:id', async (req: Request, res: Response) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      res.status(400).json({ error: 'INVALID_ID' });
      return;
    }

    try {
      const removed = await withBookingLock(async () => {
        const bookings = await readBookings();
        const filtered = bookings.filter((b) => b.id !== id);
        if (filtered.length === bookings.length) return false;
        await writeBookings(filtered);
        return true;
      });
      res.json({ released: removed });
    } catch (error) {
      console.error('Failed to release booking:', error);
      res.status(500).json({ error: 'SERVER_ERROR' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

void startServer();
