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

// Real MB Instagram Reels. Tracking parameters are intentionally removed so
// every card opens the exact Reel with a stable canonical URL.
// coverImageUrl can be added later per Reel from Admin/Cloudinary using a
// frame from the actual video; until then the UI uses its neutral fallback.
export const instagramWorks: InstagramWork[] = [
  {
    id: "reel-DeKFcXAqcRn",
    reelUrl: "https://www.instagram.com/reel/DeKFcXAqcRn/",
    titleAr: "من أعمال MB 01",
    titleEn: "MB Work 01",
    order: 1,
    active: true,
  },
  {
    id: "reel-DdtcPbGI4ew",
    reelUrl: "https://www.instagram.com/reel/DdtcPbGI4ew/",
    titleAr: "من أعمال MB 02",
    titleEn: "MB Work 02",
    order: 2,
    active: true,
  },
  {
    id: "reel-DdPE0cKKkO3",
    reelUrl: "https://www.instagram.com/reel/DdPE0cKKkO3/",
    titleAr: "من أعمال MB 03",
    titleEn: "MB Work 03",
    order: 3,
    active: true,
  },
  {
    id: "reel-DYM0M88wcLc",
    reelUrl: "https://www.instagram.com/reel/DYM0M88wcLc/",
    titleAr: "من أعمال MB 04",
    titleEn: "MB Work 04",
    order: 4,
    active: true,
  },
  {
    id: "reel-Dcn0VDcKvip",
    reelUrl: "https://www.instagram.com/reel/Dcn0VDcKvip/",
    titleAr: "من أعمال MB 05",
    titleEn: "MB Work 05",
    order: 5,
    active: true,
  },
  {
    id: "reel-DUWYwxsjPcx",
    reelUrl: "https://www.instagram.com/reel/DUWYwxsjPcx/",
    titleAr: "من أعمال MB 06",
    titleEn: "MB Work 06",
    order: 6,
    active: true,
  },
];

export const CONTACT = {
  displayPhone: "0792398952",
  phone: "+962792398952",
  instagram: "https://www.instagram.com/mb_barber98",
  map: "https://maps.app.goo.gl/5yAES5LsfcCgchQx9",
};
