import { NextResponse } from "next/server";
import { barbers as demoBarbers } from "@/data/demo";
import { getTimeSlots, weekdayKeyForDate } from "@/lib/booking";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { Barber, BusinessSettings, WorkingHours } from "@/types";

const defaultHours: Record<string, WorkingHours> = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => [
    String(index),
    { start: "11:00", end: "23:00" },
  ]),
);

function specialClosure(settings: BusinessSettings | null, date: string) {
  if (!settings) return false;
  if (settings.temporarilyClosed) return true;
  return Boolean(settings.specialHours?.find((item) => item.date === date && item.closed));
}

function scheduleFor(
  barber: Barber,
  settings: BusinessSettings | null,
  date: string,
): WorkingHours {
  const special = settings?.specialHours?.find((item) => item.date === date);
  if (special && !special.closed && special.start && special.end) {
    return { start: special.start, end: special.end };
  }
  const day = weekdayKeyForDate(date);
  if (barber.workSchedule && Object.prototype.hasOwnProperty.call(barber.workSchedule, day)) {
    return barber.workSchedule[day];
  }
  if (settings?.weeklyHours && Object.prototype.hasOwnProperty.call(settings.weeklyHours, day)) {
    return settings.weeklyHours[day];
  }
  return defaultHours[day];
}

function availableForBarber(
  barber: Barber,
  settings: BusinessSettings | null,
  date: string,
  occupied: Set<string>,
) {
  if (barber.unavailableDates?.includes(date) || specialClosure(settings, date)) return [];
  const hours = scheduleFor(barber, settings, date);
  if (!hours) return [];
  const blocked = new Set(barber.unavailableTimeSlots || []);
  return getTimeSlots(hours.start, hours.end).filter(
    (time) => !blocked.has(time) && !occupied.has(`${barber.id}_${time}`),
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date");
  const barberId = params.get("barberId") ?? "any";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  if (!isAdminConfigured) {
    const candidates =
      barberId === "any"
        ? demoBarbers
        : demoBarbers.filter((barber) => barber.id === barberId);
    const slots = Array.from(
      new Set(
        candidates.flatMap((barber) =>
          availableForBarber(barber, null, date, new Set()),
        ),
      ),
    ).sort();
    return NextResponse.json({ slots, demoMode: true });
  }

  const db = adminDb();
  const [barberSnap, lockSnap, settingsSnap] = await Promise.all([
    db.collection("barbers").where("active", "==", true).get(),
    db.collection("slotLocks").where("bookingDate", "==", date).get(),
    db.collection("businessSettings").doc("main").get(),
  ]);

  const allBarbers = barberSnap.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Barber,
  );
  const candidates =
    barberId === "any"
      ? allBarbers
      : allBarbers.filter((barber) => barber.id === barberId);

  if (!candidates.length) {
    return NextResponse.json({ slots: [], demoMode: false });
  }

  const occupied = new Set(
    lockSnap.docs.map(
      (item) => `${item.data().barberId}_${item.data().bookingTime}`,
    ),
  );
  const settings = settingsSnap.exists
    ? (settingsSnap.data() as BusinessSettings)
    : null;
  const slots = Array.from(
    new Set(
      candidates.flatMap((barber) =>
        availableForBarber(barber, settings, date, occupied),
      ),
    ),
  ).sort();

  return NextResponse.json({ slots, demoMode: false });
}
