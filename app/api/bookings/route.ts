import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { barbers, services } from "@/data/demo";
import { generateReference, normalizeJordanPhone } from "@/lib/booking";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { sendNewBookingNotification } from "@/lib/firebase/notifications";
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
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length") || 0) > 10000)
      return NextResponse.json({ error: "INVALID" }, { status: 413 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success || parsed.data.website)
      return NextResponse.json(
        { error: "INVALID", fields: parsed.error?.flatten() },
        { status: 400 },
      );
    const input = parsed.data,
      phone = normalizeJordanPhone(input.phone),
      service = services.find((x) => x.id === input.serviceId && x.active);
    if (!phone || !service)
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    const candidates =
      input.barberId === "any"
        ? barbers.filter((x) => x.active)
        : barbers.filter((x) => x.id === input.barberId && x.active);
    if (!candidates.length)
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    const referenceNumber = generateReference();
    if (!isAdminConfigured) {
      const selected = candidates.find(
        (b) =>
          !store.__mbBookings!.some(
            (x) =>
              x.barberId === b.id &&
              x.bookingDate === input.bookingDate &&
              x.bookingTime === input.bookingTime &&
              ["pending", "confirmed"].includes(x.status),
          ),
      );
      if (!selected)
        return NextResponse.json({ error: "CONFLICT" }, { status: 409 });
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
    const result = await db.runTransaction(async (tx) => {
      let selected: null | (typeof candidates)[number] = null;
      for (const b of candidates) {
        const ref = db
          .collection("slotLocks")
          .doc(
            `${input.bookingDate}_${b.id}_${input.bookingTime.replace(":", "-")}`,
          );
        if (!(await tx.get(ref)).exists) {
          selected = b;
          break;
        }
      }
      if (!selected) throw new Error("CONFLICT");
      const lock = db
          .collection("slotLocks")
          .doc(
            `${input.bookingDate}_${selected.id}_${input.bookingTime.replace(":", "-")}`,
          ),
        booking = db.collection("bookings").doc(),
        payload = {
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
    if (error instanceof Error && error.message === "CONFLICT")
      return NextResponse.json({ error: "CONFLICT" }, { status: 409 });
    console.error("Booking creation failed", error);
    return NextResponse.json({ error: "SERVER" }, { status: 500 });
  }
}
