export type Locale = "ar" | "en";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "cancelled";

export type Service = {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  active: boolean;
  sortOrder: number;
};

export type WorkingHours = { start: string; end: string } | null;

export type Barber = {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  image?: string;
  active: boolean;
  sortOrder: number;
  workSchedule: Record<string, WorkingHours>;
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
  coverImageUrl?: string;
  reelUrl: string;
  titleAr?: string;
  titleEn?: string;
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
  captionAr?: string;
  captionEn?: string;
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Review = {
  id: string;
  name: string;
  reviewAr: string;
  reviewEn: string;
  rating: number;
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type SpecialHours = {
  date: string;
  closed: boolean;
  start?: string;
  end?: string;
  noteAr?: string;
  noteEn?: string;
};

export type BusinessSettings = {
  displayPhone: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  mapUrl: string;
  aboutAr: string;
  aboutEn: string;
  temporarilyClosed: boolean;
  weeklyHours: Record<string, WorkingHours>;
  specialHours: SpecialHours[];
  updatedAt?: unknown;
};
