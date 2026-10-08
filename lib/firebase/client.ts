import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export async function messaging() {
  return firebaseApp && (await isSupported()) ? getMessaging(firebaseApp) : null;
}
