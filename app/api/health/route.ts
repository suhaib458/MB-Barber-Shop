import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/firebase/admin";

export async function GET() {
  const publicFirebaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
  const mediaConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

  const ready =
    publicFirebaseConfigured &&
    isAdminConfigured &&
    vapidConfigured &&
    mediaConfigured;

  return NextResponse.json(
    {
      ok: true,
      ready,
      checks: {
        publicFirebaseConfigured,
        adminFirebaseConfigured: isAdminConfigured,
        vapidConfigured,
        mediaConfigured,
      },
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
