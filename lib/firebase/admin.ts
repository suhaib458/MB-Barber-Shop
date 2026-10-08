import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const isAdminConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    (process.env.FIREBASE_CLIENT_EMAIL ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS),
);

function app() {
  if (getApps().length) return getApps()[0]!;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return initializeApp({
    credential:
      process.env.FIREBASE_CLIENT_EMAIL && privateKey
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          })
        : applicationDefault(),
  });
}

export function adminDb() {
  return getFirestore(app());
}

export function adminAuth() {
  return getAuth(app());
}

export async function requireAdmin(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token || !isAdminConfigured) throw new Error("UNAUTHORIZED");

  const decoded = await adminAuth().verifyIdToken(token);
  if (decoded.admin === true) return decoded;

  const snapshot = await adminDb().collection("admins").doc(decoded.uid).get();
  const record = snapshot.data();
  if (
    !snapshot.exists ||
    record?.active !== true ||
    record?.role !== "admin"
  ) {
    throw new Error("FORBIDDEN");
  }

  return decoded;
}
