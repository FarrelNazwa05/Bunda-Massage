export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  durationLabel: string;
  durations: { minutes: number; price: number }[];
  isFavorite?: boolean;
  benefits: string[];
  recommendedFor: string;
  oilType: string;
}

export interface PricingRow {
  treatment: string;
  duration: string;
  price: number;
  highlight?: boolean;
}

export interface BookingData {
  serviceId: string;
  durationMinutes: number;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  focusArea: string;
  notes: string;
}
