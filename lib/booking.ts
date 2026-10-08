import { format } from "date-fns";
import type { WorkingHours } from "@/types";

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

export function getAmmanDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((item) => item.type === "year")?.value;
  const month = parts.find((item) => item.type === "month")?.value;
  const day = parts.find((item) => item.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function isBookableDate(
  date: string,
  count = 14,
  now = new Date(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || count < 1) return false;
  const today = getAmmanDate(now);
  const selected = Date.parse(`${date}T00:00:00Z`);
  const start = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(selected) || !Number.isFinite(start)) return false;
  const offset = (selected - start) / 86_400_000;
  return Number.isInteger(offset) && offset >= 0 && offset < count;
}

export function getAvailableDates(count = 14, now = new Date()): string[] {
  const today = getAmmanDate(now);
  const start = new Date(`${today}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const value = new Date(start);
    value.setUTCDate(value.getUTCDate() + i);
    return format(value, "yyyy-MM-dd");
  });
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function getTimeSlots(
  start = "11:00",
  end = "23:00",
  intervalMinutes = 30,
): string[] {
  const slots: string[] = [];
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) return slots;
  for (let minute = from; minute < to; minute += intervalMinutes) {
    slots.push(
      `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
    );
  }
  return slots;
}

export function weekdayKeyForDate(date: string): string {
  const value = new Date(`${date}T12:00:00+03:00`);
  return String(value.getDay());
}

export function slotsForWorkingHours(hours: WorkingHours): string[] {
  return hours ? getTimeSlots(hours.start, hours.end) : [];
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

export function isOpenForSchedule(
  weeklyHours: Record<string, WorkingHours>,
  temporarilyClosed: boolean,
  now = new Date(),
): boolean {
  if (temporarilyClosed) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Amman",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((x) => x.type === "weekday")?.value;
  const dayIndex: Record<string, string> = {
    Sun: "0",
    Mon: "1",
    Tue: "2",
    Wed: "3",
    Thu: "4",
    Fri: "5",
    Sat: "6",
  };
  const hours = weekday ? weeklyHours[dayIndex[weekday]] : null;
  if (!hours) return false;
  const hour = Number(parts.find((x) => x.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((x) => x.type === "minute")?.value ?? 0);
  const current = hour * 60 + minute;
  return current >= toMinutes(hours.start) && current < toMinutes(hours.end);
}

export function formatTime(time: string, locale: "ar" | "en"): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, h, m));
}
