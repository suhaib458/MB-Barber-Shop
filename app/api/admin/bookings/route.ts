import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, requireAdmin } from "@/lib/firebase/admin";
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const s = await adminDb()
      .collection("bookings")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    return NextResponse.json({
      bookings: s.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.().toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["confirmed", "rejected", "completed", "cancelled"]),
});
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const p = schema.safeParse(await request.json());
    if (!p.success)
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    const db = adminDb(),
      ref = db.collection("bookings").doc(p.data.id);
    await db.runTransaction(async (tx) => {
      const b = await tx.get(ref);
      if (!b.exists) throw new Error("NOT_FOUND");
      tx.update(ref, {
        status: p.data.status,
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (["rejected", "cancelled"].includes(p.data.status)) {
        const d = b.data()!;
        tx.delete(
          db
            .collection("slotLocks")
            .doc(
              `${d.bookingDate}_${d.barberId}_${String(d.bookingTime).replace(":", "-")}`,
            ),
        );
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
