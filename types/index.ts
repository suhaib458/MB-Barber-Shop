export type Locale = "ar" | "en";
export type BookingStatus =
  "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
export type Service = {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  active: boolean;
  sortOrder: number;
};
export type Barber = {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  image?: string;
  active: boolean;
  sortOrder: number;
  workSchedule: Record<string, { start: string; end: string } | null>;
  unavailableDates: string[];
  unavailableTimeSlots: string[];
};
export type BookingInput = {
  serviceId: string;
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  phone: string;
  locale: Locale;
};
export type Booking = BookingInput & {
  id?: string;
  referenceNumber: string;
  serviceNameSnapshot: string;
  barberNameSnapshot: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
};
export type InstagramWork = {
  id: string;
  coverImage?: string;
  reelUrl: string;
  titleAr?: string;
  titleEn?: string;
  order: number;
  active: boolean;
};
