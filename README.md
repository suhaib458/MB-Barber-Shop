# MB — Premium Barber PWA

A client-ready bilingual Arabic/English PWA for **MB**, with a cinematic public website, real appointment booking logic, Firebase-backed content management, protected Admin Dashboard, push notifications and Netlify deployment support.

Arabic is the default experience. Mobile is intentionally app-like, while desktop uses a premium cinematic layout.

## Stack

- Next.js 16 App Router + React 19
- TypeScript strict mode
- Tailwind CSS 4
- Motion animations
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Messaging
- Cloudinary for Admin image uploads
- PWA manifest + service worker + offline page
- Vitest business-logic tests
- Netlify Next.js runtime
- GitHub Actions validation

Firebase Storage is intentionally not required, allowing the Firebase project to stay on the Spark plan while media uploads use Cloudinary.

## Main routes

- `/ar` — Arabic RTL website
- `/en` — English LTR website
- `/admin/login` — Admin sign-in
- `/admin` — protected MB management dashboard
- `/api/bookings` — server-side booking creation
- `/api/bookings/availability` — schedule-aware live availability
- `/api/admin/bookings` — protected booking management API
- `/api/admin/media` — protected signed image-upload endpoint
- `/api/health` — deployment readiness checks without exposing secrets

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

If Firebase is not configured, the public website can still render in demo mode and the booking API uses an in-memory demo collision store. Production persistence, Admin CMS and push notifications require Firebase configuration. Admin file uploads require the Cloudinary server variables from `.env.example`.

## Firebase project

The repository is bound to:

```text
mb-barber-shop-718cb
```

Complete these items in Firebase Console:

1. Add/keep the Web App.
2. Enable **Authentication → Email/Password**.
3. Create **Cloud Firestore** in production mode.
4. In **Project Settings → Cloud Messaging**, create a Web Push certificate / VAPID key.
5. Fill the Firebase Web and Admin values in `.env.local` or Netlify.
6. Deploy Firestore rules and indexes:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### Create the Admin account

1. In Firebase Authentication, create the shop owner's Email/Password user.
2. Copy the user's Firebase Auth UID.
3. In Firestore create:

```text
admins/{AUTH_UID}
```

with:

```json
{
  "active": true,
  "role": "admin"
}
```

A normal authenticated Firebase user without this active Admin document is rejected by the protected Admin APIs.

## Environment variables

All required names are in [`.env.example`](./.env.example).

Browser Firebase SDK values:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

Server-only Firebase Admin values:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

Server-only Cloudinary values:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Never expose `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` or `CLOUDINARY_API_SECRET` through `NEXT_PUBLIC_*` variables.

## Cloudinary media uploads

Admin image uploads for barbers, Reel covers and the Gallery go through `/api/admin/media`.

The route:

1. verifies the Firebase Admin ID token,
2. validates image type/size,
3. signs the Cloudinary request on the server,
4. uploads into an MB folder,
5. returns only the resulting HTTPS URL to the browser.

Folders:

```text
mb/barbers
mb/reels
mb/gallery
```

The Admin forms also allow pasting a direct image URL as a fallback.

## Official MB brand assets

The official supplied logo is integrated at:

```text
public/images/mb-logo.jpg
```

Hero media paths:

```text
public/videos/mb-hero-desktop.mp4   # 16:9
public/videos/mb-hero-mobile.mp4    # 9:16
```

Fallback poster:

```text
public/images/hero-poster.svg
```

The Hero keeps rendering if either final video is missing.

## Public website

The public experience includes:

- Arabic RTL / English LTR language switch
- cinematic responsive Hero
- desktop glass Navbar
- iOS-inspired floating mobile navigation
- live Services
- live Barbers
- “Any Available Barber” booking option
- Instagram Reel cards
- optional Gallery with lightbox
- optional Reviews — hidden when there are no genuine active reviews
- editable About content
- live weekly opening hours
- `Asia/Amman` open/closed status
- Google Maps integration
- phone and WhatsApp actions
- FAQ
- PWA installability and offline fallback

## Admin Dashboard

Sign in at `/admin/login`.

Admin can manage:

- bookings and statuses
- direct call / WhatsApp actions
- services
- barbers and weekly schedules
- unavailable dates and blocked barber slots
- Instagram Reel cards and covers
- Gallery images
- genuine Reviews
- business contact details
- weekly shop opening hours
- temporary and exceptional closures
- supported browser/PWA push notifications

## Booking integrity

The production booking flow uses Firebase data, not hard-coded barber/service records.

Before creating a booking the server validates:

- active service
- active barber
- current 14-day booking window in `Asia/Amman`
- weekly barber schedule
- weekly shop schedule
- exceptional shop closures/hours
- barber unavailable dates
- barber blocked time slots
- existing slot locks

Final reservation is protected using a Firestore transaction and a slot lock:

```text
slotLocks/{date}_{barber}_{time}
```

For **Any Available Barber**, the transaction selects an available active barber. The transactional check prevents two customers from taking the same barber/time even if they submit simultaneously.

## Customer profile

Customers do not create a traditional account.

On first booking the site requests:

- name
- Jordanian phone number

The profile is remembered locally on that device to prefill later bookings. The phone is normalized to the Jordan canonical format. This is not represented as OTP-verified authentication.

## Push notifications

An authenticated Admin can request push permission from the Dashboard.

FCM tokens are stored in `notificationTokens`. When a production booking succeeds, Admin devices can receive a new-booking notification. Invalid tokens are cleaned up automatically.

For iPhone/iPad, Web Push depends on supported iOS versions and the website being installed as a PWA. Unsupported or denied browsers fall back to the Admin Dashboard pending-booking badge.

## PWA / offline behavior

The project includes:

- Web App Manifest
- service worker
- standalone mode
- iOS viewport/safe-area support
- offline fallback page
- cached public shell

Bookings are not falsely queued or marked successful while offline. The booking screen tells the customer to reconnect before submitting.

## Validation

Local commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

GitHub Actions runs the same validation on the feature branch and pull requests.

## Deploy to Netlify

1. Connect this GitHub repository to Netlify.
2. Deploy `feat/mb-client-ready` as staging first.
3. Add every required environment variable from `.env.example` under **Site configuration → Environment variables**.
4. Deploy the site.
5. Open `/api/health` and verify all checks are `true`.
6. Add the Netlify/custom domain to **Firebase Authentication → Authorized domains**.
7. Verify `/admin/login`.
8. Seed Services and Barbers from Admin if Firestore is empty.
9. Add the real three barber identities/photos.
10. Add real MB Instagram Reel URLs and covers.
11. Add the two Hero MP4 files.
12. Test a complete production booking and collision prevention.
13. Enable push notifications on the owner's device.
14. Install the final HTTPS site as a PWA and verify offline behavior.
15. Only after staging passes, merge the client-ready PR to `main`.

Full launch instructions are in [`docs/PRODUCTION_SETUP.md`](./docs/PRODUCTION_SETUP.md).

## Content still requiring real MB input

- desktop Hero video (`16:9`)
- mobile Hero video (`9:16`)
- real barber names
- real barber photos
- barber specialties if desired
- real Instagram Reel links and cover images
- optional Gallery photography
- genuine customer reviews

No fake customer testimonials are required or shown.
