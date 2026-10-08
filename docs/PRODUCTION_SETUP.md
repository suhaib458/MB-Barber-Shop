# MB Production Setup

This runbook covers the remaining external setup required before MB can go live with persistent bookings, Admin CMS, uploads and push notifications.

## 1. Create the Firebase project

In Firebase Console:

1. Create or choose the MB project.
2. Add a Web App.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create **Cloud Firestore** in production mode.
5. Enable **Storage**.
6. Open **Project settings → Cloud Messaging → Web Push certificates** and create a VAPID key.

## 2. Collect the browser Firebase values

From **Project settings → General → Your apps → SDK setup and configuration**, copy these values into Netlify:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

These values are intentionally browser-visible Firebase configuration values. Do not place Admin SDK private credentials in `NEXT_PUBLIC_*` variables.

## 3. Create Firebase Admin SDK credentials

In **Project settings → Service accounts**, create/download a service-account key for the MB server runtime.

Map it to these Netlify variables:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

For `FIREBASE_PRIVATE_KEY`, keep the full PEM value. Netlify can store the multiline value directly. The application also accepts escaped `\n` line breaks.

Never commit the service-account JSON or private key to GitHub.

## 4. Deploy Firestore / Storage rules and indexes

From a trusted local machine with Firebase CLI installed:

```bash
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The repository already contains:

```text
firebase.json
firestore.rules
firestore.indexes.json
storage.rules
```

## 5. Create the first MB Admin

In **Firebase Authentication → Users**, create the owner's Email/Password account.

Copy the resulting UID, then create this Firestore document:

```text
admins/{UID}
```

with fields:

```json
{
  "active": true,
  "role": "admin"
}
```

The login flow now verifies this Admin authorization before opening the dashboard. A normal Firebase Authentication account without this active Admin record is rejected.

## 6. Netlify environment and deployment

Connect the GitHub repository to Netlify and deploy the client-ready branch for staging first.

Required build/runtime configuration is already defined in `netlify.toml` and `package.json`. The project requires Node `>=24.12.0`.

Add all Firebase variables listed above under **Site configuration → Environment variables** and redeploy.

After deployment, open:

```text
/api/health
```

A launch-ready response should report:

```json
{
  "ok": true,
  "ready": true,
  "checks": {
    "publicFirebaseConfigured": true,
    "adminFirebaseConfigured": true,
    "vapidConfigured": true
  }
}
```

The endpoint never returns secret values; it only reports whether the expected configuration exists.

## 7. Firebase Authorized Domains

After Netlify gives the site its HTTPS domain, add that hostname under:

**Firebase Authentication → Settings → Authorized domains**

Also add the final custom domain later if MB uses one.

## 8. Seed the initial live content

Sign in at:

```text
/admin/login
```

Then:

1. Seed the six default services if Firestore is empty.
2. Seed the three placeholder barber records.
3. Replace every placeholder barber with the real name, photo and working schedule.
4. Review business opening hours and exceptional closures.
5. Add real Instagram Reel URLs and covers.
6. Add optional Gallery images.
7. Add only genuine customer reviews.

## 9. Hero media

Final production media paths are:

```text
public/videos/mb-hero-desktop.mp4
public/videos/mb-hero-mobile.mp4
```

Recommended delivery:

- Desktop: 16:9, H.264 MP4, muted, short seamless loop.
- Mobile: 9:16, H.264 MP4, muted, short seamless loop.
- Keep files aggressively compressed for mobile performance.

The current Hero has a fallback poster and continues to render before these MP4 files are supplied.

## 10. Production smoke test

Before merging to `main`, verify all of the following on the staging deployment:

- `/ar` and `/en` render correctly.
- Mobile navigation and PWA installation work.
- `/api/health` returns `ready: true`.
- Admin login accepts the authorized owner and rejects a non-Admin Firebase user.
- Services and barbers persist after refresh.
- Image upload succeeds and the uploaded image renders publicly.
- Availability only exposes dates in the current 14-day Amman booking window.
- One booking creates a pending Admin item.
- A second booking cannot take the same barber/time slot.
- Rejecting/cancelling a booking releases its slot.
- WhatsApp, phone, Maps and Instagram links open correctly.
- Push notification permission and FCM registration work on a supported device.
- Offline submission never reports a false successful booking.

Only after this smoke test should the feature PR be merged into `main` and used as the production branch.
