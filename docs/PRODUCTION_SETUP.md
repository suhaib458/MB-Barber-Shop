# MB Production Setup

This runbook covers the remaining external setup required before MB can go live with persistent bookings, Admin CMS, image uploads and push notifications.

## 1. Firebase project

The project is already created as:

```text
mb-barber-shop-718cb
```

The repository is bound to that project through `.firebaserc`.

In Firebase Console, complete these items:

1. Add/keep the **MB Web** application.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create **Cloud Firestore** in production mode.
4. Open **Project settings → Cloud Messaging → Web Push certificates** and create a VAPID key.

Firebase Storage is intentionally not used by this project. Admin image uploads use an external media provider so the Firebase project can stay on Spark without requiring Cloud Storage billing.

## 2. Firebase Web App values

Add these values to Netlify:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

The Web SDK configuration values are browser-visible by design. Do not place Firebase Admin credentials in `NEXT_PUBLIC_*` variables.

## 3. Firebase Admin SDK credentials

In **Project settings → Service accounts**, create/download a service-account key for the MB server runtime.

Map it to these Netlify variables:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

For `FIREBASE_PRIVATE_KEY`, keep the full PEM value. Netlify can store the multiline value directly. The application also accepts escaped `\n` line breaks.

Never commit the service-account JSON or private key to GitHub, and do not paste the private key into issues, pull requests or chat. Enter it directly in Netlify's secret/environment UI.

## 4. Firestore rules and indexes

From a trusted local machine with Firebase CLI installed:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

The repository contains:

```text
.firebaserc
firebase.json
firestore.rules
firestore.indexes.json
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

A normal Firebase Authentication account without this active Admin record is rejected by the protected Admin APIs.

## 6. Cloudinary image uploads

Create a free Cloudinary account for MB and add these values to Netlify:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Only the server route sees the Cloudinary API secret. The browser sends an authenticated Admin upload request to `/api/admin/media`; the server verifies the Firebase Admin token, signs the upload and returns the final HTTPS image URL.

Supported upload folders:

```text
mb/barbers
mb/reels
mb/gallery
```

The Admin forms also accept a direct image URL as a fallback when media upload has not been configured yet.

## 7. Netlify staging deployment

Connect the GitHub repository to Netlify and deploy `feat/mb-client-ready` as staging first.

Required build/runtime configuration is already defined in `netlify.toml` and `package.json`. The project requires Node `>=24.15.0`.

Add all Firebase and Cloudinary variables listed above under **Site configuration → Environment variables** and redeploy.

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
    "vapidConfigured": true,
    "mediaConfigured": true
  }
}
```

The endpoint never returns secret values; it only reports whether the expected configuration exists.

## 8. Firebase Authorized Domains

After Netlify gives the site its HTTPS hostname, add it under:

**Firebase Authentication → Settings → Authorized domains**

Also add the final custom domain later if MB uses one.

## 9. Seed the initial live content

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

## 10. Hero media

Final production media paths are:

```text
public/videos/mb-hero-desktop.mp4
public/videos/mb-hero-mobile.mp4
```

Recommended delivery:

- Desktop: 16:9, H.264 MP4, muted, short seamless loop.
- Mobile: 9:16, H.264 MP4, muted, short seamless loop.
- Keep files aggressively compressed for mobile performance.

The Hero has a fallback poster and continues to render before these MP4 files are supplied.

## 11. Production smoke test

Before merging to `main`, verify all of the following on staging:

- `/ar` and `/en` render correctly.
- Mobile navigation and PWA installation work.
- `/api/health` returns `ready: true`.
- Admin login accepts the authorized owner and rejects a non-Admin Firebase user.
- Services and barbers persist after refresh.
- Barber/Reel/Gallery image upload succeeds and the image renders publicly.
- Availability only exposes dates in the current 14-day Amman booking window.
- One booking creates a pending Admin item.
- A second booking cannot take the same barber/time slot.
- Rejecting/cancelling a booking releases its slot.
- WhatsApp, phone, Maps and Instagram links open correctly.
- Push notification permission and FCM registration work on a supported device.
- Offline submission never reports a false successful booking.

## 12. Final handoff gate

Do not merge the feature branch into `main` until all of these external values are present and verified:

```text
Firebase Web App configuration
Firebase Admin service-account values
VAPID key
Cloudinary cloud name / API key / API secret
Authorized staging/production domain
One active Admin user + admins/{uid} role document
Real three barber identities/photos
Final Hero desktop/mobile MP4 files
Real Reel URLs/covers intended for launch
```

Once those are supplied, the remaining launch sequence is: deploy staging → verify `/api/health` → complete the smoke test → merge PR → deploy `main` to production.
