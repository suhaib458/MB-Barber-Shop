import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    return NextResponse.json({
      ok: true,
      uid: admin.uid,
      email: admin.email ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
