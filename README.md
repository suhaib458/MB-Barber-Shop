# MB — Premium Barber PWA

A production-oriented bilingual (Arabic/English) booking website and admin console for MB. The public experience is Arabic-first, responsive, installable as a PWA, and uses a server endpoint for every booking. With Firebase configured, slot reservation is protected by a Firestore transaction and per-barber slot lock.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and Motion
- Firebase Authentication, Firestore, Storage-ready rules, Cloud Messaging
- PWA manifest, service worker, offline screen
- Vitest business-logic tests
- Netlify Next.js runtime

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Arabic is at `/ar`, English at `/en`, and Admin at `/admin/login`.

Without Firebase variables the public site runs in demo mode. Booking requests still pass through the server route and collisions are prevented for the lifetime of the local server process, but data is not persistent. Production mode is enabled automatically when server Firebase credentials are present.

## Firebase setup

1. Create a Firebase project and Web App.
2. Enable **Authentication → Email/Password**.
3. Create Firestore in production mode and a Storage bucket.
4. Create a Web Push certificate in **Project Settings → Cloud Messaging**.
5. Copy `.env.example` to `.env.local` and fill in the web and Admin SDK values.
6. Deploy rules and indexes with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
```

7. Create an admin user in Firebase Authentication. In Firestore, create `admins/{AUTH_UID}` with `{ "active": true, "role": "admin" }`. This allows that account to use the protected dashboard and API.

Do not expose `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` to the browser. They must remain server-only Netlify environment variables.

## Environment variables

All required names are documented in [.env.example](./.env.example). `NEXT_PUBLIC_*` values configure the Firebase web SDK. `FIREBASE_*` values configure the server SDK used for transactions, admin authorization, and push delivery.

## Media and brand assets

- Official logo: replace the fallback and update the `Logo` component to use `public/images/mb-logo.png`. The supplied request did not include the actual logo file, so the current monogram is intentionally a neutral fallback rather than a redesign.
- Desktop hero video: `public/videos/mb-hero-desktop.mp4` (16:9 recommended).
- Mobile hero video: `public/videos/mb-hero-mobile.mp4` (9:16 recommended).
- Hero poster: `public/images/hero-poster.svg`.

Missing videos never block rendering; the poster remains visible beneath them.

## Content management

- **Barbers:** sign in at `/admin/login`, open Barbers, and add Arabic/English names. Full records support specialties, schedules, unavailable dates, blocked slots, status and sort order.
- **Services:** use the Services panel. Pricing and duration are intentionally absent from the public UI.
- **Instagram work:** records belong in `instagramWorks` with `reelUrl`, optional `coverImage`, bilingual titles, `order`, and `active`. The public demo uses replaceable covers and links to the real MB Instagram profile.
- **Business details:** use `businessSettings/main` for phone, WhatsApp, Instagram, map URL, weekly hours, special hours and closures.

The default demo content lives in `data/demo.ts` and the bilingual dictionaries in `i18n/dictionaries.ts`.

## Booking integrity

Production requests are created only by the server endpoint. A Firestore transaction checks `slotLocks/{date}_{barber}_{time}` and creates the lock and booking atomically. “Any available barber” checks each active barber inside the same transaction. Rejected or cancelled bookings release their lock. Public users cannot read or write booking records directly under the supplied rules.

## Push notifications

An authenticated admin can enable notifications from the bell button. Tokens are stored per device in `notificationTokens`. Successful Firebase bookings send an FCM notification; invalid tokens are cleaned up. Unsupported or denied browsers fail gracefully and the dashboard remains the in-app notification fallback. On iOS, web push requires an installed PWA and a supported iOS version.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Deploy to Netlify

1. Push this folder to a Git provider and create a new Netlify site from it.
2. Netlify reads `netlify.toml` and runs `npm run build` with Node 22.
3. Add every `.env.local` value in **Site configuration → Environment variables**.
4. Deploy, then add the Netlify domain to Firebase Authentication’s authorized domains.
5. Test sign-in, create a booking, enable admin push, and install the PWA once on the final HTTPS domain.

The service worker is served with a revalidation header and the PWA offline page never queues or pretends to complete booking submissions while offline.
