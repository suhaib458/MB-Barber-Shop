import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase/admin";

export async function GET() {
  const publicFirebaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );

  const ready = publicFirebaseConfigured && isAdminConfigured;

  return NextResponse.json(
    {
      ok: true,
      ready,
      checks: {
        publicFirebaseConfigured,
        adminFirebaseConfigured: isAdminConfigured,
        vapidConfigured: Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
      },
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
