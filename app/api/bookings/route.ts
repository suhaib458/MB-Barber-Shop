import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { barbers as demoBarbers, services as demoServices } from "@/data/demo";
import {
  generateReference,
  getTimeSlots,
  normalizeJordanPhone,
  weekdayKeyForDate,
} from "@/lib/booking";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { sendNewBookingNotification } from "@/lib/firebase/notifications";
import type { Barber, BusinessSettings, Service, WorkingHours } from "@/types";

const schema = z.object({
  serviceId: z.string().min(1).max(80),
  barberId: z.string().min(1).max(80),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().max(30),
  locale: z.enum(["ar", "en"]),
  website: z.string().max(0).optional(),
});

type DemoBooking = {
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
};

const store = globalThis as typeof globalThis & {
  __mbBookings?: DemoBooking[];
};
store.__mbBookings ??= [];

const defaultHours: Record<string, WorkingHours> = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => [
    String(index),
    { start: "11:00", end: "23:00" },
  ]),
);

function scheduleFor(
  barber: Barber,
  settings: BusinessSettings | null,
  date: string,
): WorkingHours {
  const special = settings?.specialHours?.find((item) => item.date === date);
  if (special?.closed) return null;
  if (special?.start && special?.end) {
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

function canBookBarber(
  barber: Barber,
  settings: BusinessSettings | null,
  date: string,
  time: string,
) {
  if (settings?.temporarilyClosed) return false;
  if (barber.unavailableDates?.includes(date)) return false;
  if (barber.unavailableTimeSlots?.includes(time)) return false;
  const hours = scheduleFor(barber, settings, date);
  return Boolean(hours && getTimeSlots(hours.start, hours.end).includes(time));
}

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length") || 0) > 10000) {
      return NextResponse.json({ error: "INVALID" }, { status: 413 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success || parsed.data.website) {
      return NextResponse.json(
        { error: "INVALID", fields: parsed.error?.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const phone = normalizeJordanPhone(input.phone);
    if (!phone) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }

    const referenceNumber = generateReference();

    if (!isAdminConfigured) {
      const service = demoServices.find(
        (item) => item.id === input.serviceId && item.active,
      );
      const candidates =
        input.barberId === "any"
          ? demoBarbers.filter((item) => item.active)
          : demoBarbers.filter(
              (item) => item.id === input.barberId && item.active,
            );

      if (!service || !candidates.length) {
        return NextResponse.json({ error: "INVALID" }, { status: 400 });
      }

      const selected = candidates.find(
        (barber) =>
          canBookBarber(barber, null, input.bookingDate, input.bookingTime) &&
          !store.__mbBookings!.some(
            (item) =>
              item.barberId === barber.id &&
              item.bookingDate === input.bookingDate &&
              item.bookingTime === input.bookingTime &&
              ["pending", "confirmed"].includes(item.status),
          ),
      );

      if (!selected) {
        return NextResponse.json({ error: "CONFLICT" }, { status: 409 });
      }

      store.__mbBookings!.push({
        barberId: selected.id,
        bookingDate: input.bookingDate,
        bookingTime: input.bookingTime,
        status: "pending",
      });

      return NextResponse.json(
        {
          referenceNumber,
          status: "pending",
          barberId: selected.id,
          barberNameSnapshot:
            input.locale === "ar" ? selected.nameAr : selected.nameEn,
          demoMode: true,
        },
        { status: 201 },
      );
    }

    const db = adminDb();
    const [serviceSnap, barberSnap, settingsSnap] = await Promise.all([
      db.collection("services").doc(input.serviceId).get(),
      db.collection("barbers").where("active", "==", true).get(),
      db.collection("businessSettings").doc("main").get(),
    ]);

    if (!serviceSnap.exists || serviceSnap.data()?.active !== true) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }

    const service = {
      id: serviceSnap.id,
      ...serviceSnap.data(),
    } as Service;
    const allBarbers = barberSnap.docs.map(
      (item) => ({ id: item.id, ...item.data() }) as Barber,
    );
    const settings = settingsSnap.exists
      ? (settingsSnap.data() as BusinessSettings)
      : null;
    const candidates = (
      input.barberId === "any"
        ? allBarbers
        : allBarbers.filter((item) => item.id === input.barberId)
    ).filter((barber) =>
      canBookBarber(barber, settings, input.bookingDate, input.bookingTime),
    );

    if (!candidates.length) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }

    const result = await db.runTransaction(async (tx) => {
      let selected: Barber | null = null;

      for (const barber of candidates) {
        const lockRef = db
          .collection("slotLocks")
          .doc(
            `${input.bookingDate}_${barber.id}_${input.bookingTime.replace(":", "-")}`,
          );
        const lockSnap = await tx.get(lockRef);
        if (!lockSnap.exists) {
          selected = barber;
          break;
        }
      }

      if (!selected) throw new Error("CONFLICT");

      const lock = db
        .collection("slotLocks")
        .doc(
          `${input.bookingDate}_${selected.id}_${input.bookingTime.replace(":", "-")}`,
        );
      const booking = db.collection("bookings").doc();
      const payload = {
        referenceNumber,
        customerName: input.customerName.trim(),
        phone,
        serviceId: service.id,
        serviceNameSnapshot:
          input.locale === "ar" ? service.nameAr : service.nameEn,
        barberId: selected.id,
        barberNameSnapshot:
          input.locale === "ar" ? selected.nameAr : selected.nameEn,
        bookingDate: input.bookingDate,
        bookingTime: input.bookingTime,
        status: "pending",
        locale: input.locale,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      tx.create(lock, {
        bookingId: booking.id,
        barberId: selected.id,
        bookingDate: input.bookingDate,
        bookingTime: input.bookingTime,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.create(booking, payload);

      return {
        barberId: selected.id,
        barberNameSnapshot: payload.barberNameSnapshot,
      };
    });

    await sendNewBookingNotification({
      customerName: input.customerName,
      serviceName: input.locale === "ar" ? service.nameAr : service.nameEn,
      date: input.bookingDate,
      time: input.bookingTime,
    });

    return NextResponse.json(
      { referenceNumber, status: "pending", ...result, demoMode: false },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json({ error: "CONFLICT" }, { status: 409 });
    }
    console.error("Booking creation failed", error);
    return NextResponse.json({ error: "SERVER" }, { status: 500 });
  }
}
