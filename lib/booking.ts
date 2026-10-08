import { format } from "date-fns";
export function normalizeJordanPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (/^07[789]\d{7}$/.test(d)) return `+962${d.slice(1)}`;
  if (/^9627[789]\d{7}$/.test(d)) return `+${d}`;
  return null;
}
export function generateReference(
  now = new Date(),
  random = Math.random,
): string {
  const token = Math.floor(random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0")
    .toUpperCase();
  return `MB-${now.getFullYear()}-${token}`;
}
export function getAvailableDates(count = 14): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return format(d, "yyyy-MM-dd");
  });
}
export function getTimeSlots(): string[] {
  const s: string[] = [];
  for (let m = 660; m < 1380; m += 30)
    s.push(
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
    );
  return s;
}
export function isOpenInAmman(now = new Date()): boolean {
  const p = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Amman",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now),
    h = Number(p.find((x) => x.type === "hour")?.value ?? 0),
    m = Number(p.find((x) => x.type === "minute")?.value ?? 0),
    t = h * 60 + m;
  return t >= 660 && t < 1380;
}
export function formatTime(time: string, locale: "ar" | "en"): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, h, m));
}
