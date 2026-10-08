import { getMessaging } from "firebase-admin/messaging";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
export async function sendNewBookingNotification(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  if (!isAdminConfigured) return;
  try {
    const snapshot = await adminDb().collection("notificationTokens").get(),
      tokens = snapshot.docs.map((d) => d.data().token).filter(Boolean);
    if (!tokens.length) return;
    const name = data.customerName.split(/\s+/)[0];
    const result = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "حجز جديد في MB · New booking",
        body: `${name} · ${data.serviceName} · ${data.date} ${data.time}`,
      },
      webpush: { fcmOptions: { link: "/admin" } },
    });
    const invalid = snapshot.docs.filter(
      (_, i) =>
        !result.responses[i]?.success &&
        [
          "messaging/invalid-registration-token",
          "messaging/registration-token-not-registered",
        ].includes(result.responses[i]?.error?.code || ""),
    );
    await Promise.all(invalid.map((d) => d.ref.delete()));
  } catch (error) {
    console.error("Push notification failed", error);
  }
}
