import type { Barber, InstagramWork, Service } from "@/types";
export const services: Service[] = [
  {
    id: "haircut",
    nameAr: "قص شعر",
    nameEn: "Haircut",
    icon: "Scissors",
    active: true,
    sortOrder: 1,
  },
  {
    id: "beard",
    nameAr: "لحية",
    nameEn: "Beard",
    icon: "Sparkles",
    active: true,
    sortOrder: 2,
  },
  {
    id: "hair-beard",
    nameAr: "شعر + لحية",
    nameEn: "Hair + Beard",
    icon: "Crown",
    active: true,
    sortOrder: 3,
  },
  {
    id: "facial",
    nameAr: "تنظيف بشرة",
    nameEn: "Facial Care",
    icon: "Droplets",
    active: true,
    sortOrder: 4,
  },
  {
    id: "kids",
    nameAr: "قص شعر أطفال",
    nameEn: "Kids Haircut",
    icon: "Star",
    active: true,
    sortOrder: 5,
  },
  {
    id: "groom",
    nameAr: "عريس",
    nameEn: "Groom Package",
    icon: "Gem",
    active: true,
    sortOrder: 6,
  },
];
const schedule = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [
    String(i),
    { start: "11:00", end: "23:00" },
  ]),
);
export const barbers: Barber[] = [1, 2, 3].map((n) => ({
  id: `barber-0${n}`,
  nameAr: `الحلاق 0${n}`,
  nameEn: `Barber 0${n}`,
  specialtyAr: "فريق MB",
  specialtyEn: "MB Team",
  active: true,
  sortOrder: n,
  workSchedule: schedule,
  unavailableDates: [],
  unavailableTimeSlots: [],
}));
export const instagramWorks: InstagramWork[] = [1, 2, 3, 4].map((n) => ({
  id: `work-${n}`,
  reelUrl: "https://www.instagram.com/mb_barber98",
  titleAr: `عمل مختار 0${n}`,
  titleEn: `Selected work 0${n}`,
  order: n,
  active: true,
}));
export const CONTACT = {
  displayPhone: "0792398952",
  phone: "+962792398952",
  instagram: "https://www.instagram.com/mb_barber98",
  map: "https://maps.app.goo.gl/5yAES5LsfcCgchQx9",
};
