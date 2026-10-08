import { NextResponse } from "next/server";
import { barbers } from "@/data/demo";
import { getTimeSlots } from "@/lib/booking";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams,
    date = q.get("date"),
    barberId = q.get("barberId") ?? "any";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  if (!isAdminConfigured)
    return NextResponse.json({ slots: getTimeSlots(), demoMode: true });
  const ids = barberId === "any" ? barbers.map((x) => x.id) : [barberId],
    snap = await adminDb()
      .collection("slotLocks")
      .where("bookingDate", "==", date)
      .get(),
    occupied = new Set(
      snap.docs.map(
        (doc) => `${doc.data().barberId}_${doc.data().bookingTime}`,
      ),
    ),
    slots = getTimeSlots().filter((time) =>
      ids.some((id) => !occupied.has(`${id}_${time}`)),
    );
  return NextResponse.json({ slots, demoMode: false });
}
