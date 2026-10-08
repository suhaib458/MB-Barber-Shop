# MB — Premium Barber PWA

A client-ready bilingual Arabic/English PWA for **MB**, with a cinematic public website, real appointment booking logic, Firebase-backed content management, protected Admin Dashboard, push notifications and Netlify deployment support.

Arabic is the default experience. The mobile UI is intentionally app-like, while desktop uses a premium cinematic layout.

## Stack

- Next.js 16 App Router + React 19
- TypeScript strict mode
- Tailwind CSS 4
- Motion animations
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Messaging
- PWA manifest + service worker + offline page
- Vitest business-logic tests
- Netlify Next.js runtime
- GitHub Actions validation

## Main routes

- `/ar` — Arabic RTL website
- `/en` — English LTR website
- `/admin/login` — Admin sign-in
- `/admin` — protected MB management dashboard
- `/api/bookings` — server-side booking creation
- `/api/bookings/availability` — schedule-aware live availability
- `/api/admin/bookings` — protected booking management API
- `/api/health` — safe production configuration readiness check

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

If Firebase is not configured, the public website can still render in demo mode and the booking API uses an in-memory demo collision store. Production persistence, Admin CMS, Firebase Storage and push notifications require Firebase configuration.

## Firebase setup

1. Create a Firebase project.
2. Add a **Web App** to that project.
3. Enable **Authentication → Email/Password**.
4. Create **Cloud Firestore** in production mode.
5. Enable **Firebase Storage**.
6. In **Project Settings → Cloud Messaging**, create a Web Push certificate / VAPID key.
7. Copy `.env.example` to `.env.local` and fill the values.
8. Deploy rules and indexes:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
```

For the full launch runbook, see [`docs/PRODUCTION_SETUP.md`](./docs/PRODUCTION_SETUP.md).

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

The Admin login verifies Firebase Authentication and the matching active Admin authorization before opening the dashboard. Protected APIs perform the same authorization check server-side.

## Environment variables

All required names are in [`.env.example`](./.env.example).

Browser Firebase SDK values:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
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

Never expose `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` through `NEXT_PUBLIC_*` variables.

## Official MB brand assets

The official supplied logo is already integrated at:

```text
public/images/mb-logo.jpg
```

Hero media paths are prepared as:

```text
public/videos/mb-hero-desktop.mp4   # 16:9
public/videos/mb-hero-mobile.mp4    # 9:16
```

Fallback poster:

```text
public/images/hero-poster.svg
```

The public Hero keeps rendering if either video is missing.

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

### Overview & bookings

Admin can:

- see booking counts
- review pending bookings
- search by customer, phone or reference number
- filter by date and status
- confirm or reject bookings
- mark confirmed bookings completed
- cancel confirmed bookings
- call customers directly
- open WhatsApp directly
- enable supported browser/PWA push notifications

Rejected and cancelled bookings release their slot lock.

### Services

Admin can:

- add services
- edit Arabic/English names
- enable/disable services
- delete services
- reorder services
- seed the six initial MB service records

Public pricing and duration are intentionally not displayed.

### Barbers

Admin can:

- add/edit/delete barbers
- upload barber images
- edit Arabic and English names
- edit bilingual specialties
- enable/disable a barber
- reorder barbers
- configure weekly working hours per barber
- mark full unavailable dates
- block recurring time slots
- seed three replaceable placeholder barber records

### Instagram Reels / Our Work

The website does **not** depend on the Instagram/Meta API.

Admin manually manages Reel cards with:

- original Instagram Reel URL
- uploaded cover image
- optional Arabic/English title
- active/hidden status
- custom ordering

On desktop, the public website shows a vertical multi-card Reel grid. On mobile, the cards are horizontally swipeable. Clicking a card opens the original Reel on Instagram.

MB profile:

```text
https://www.instagram.com/mb_barber98
```

### Gallery

Admin can upload and manage real MB photography through Firebase Storage. The public Gallery is automatically hidden when empty.

### Reviews

Only genuine customer feedback should be entered. Admin can add, edit, hide, reorder and delete reviews. The public Reviews section does not appear when there are no active reviews.

### Business settings

Admin can edit:

- display phone
- canonical phone
- WhatsApp number
- Instagram URL
- Google Maps URL
- Arabic About text
- English About text
- weekly shop opening hours
- temporary closure status
- exceptional closure dates
- exceptional custom opening hours

Default known business details:

```text
Phone: 0792398952
Canonical: +962792398952
Instagram: https://www.instagram.com/mb_barber98
Maps: https://maps.app.goo.gl/5yAES5LsfcCgchQx9
Default hours: 11:00–23:00 every day
Timezone: Asia/Amman
```

## Booking integrity

The production booking flow uses Firebase data, not hard-coded barber/service records.

Before creating a booking the server validates:

- booking date is inside the current 14-day `Asia/Amman` booking window
- active service
- active barber
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

For **Any Available Barber**, the transaction selects an available active barber. The final transactional check prevents two customers from taking the same barber/time even if they submit simultaneously.

## Customer profile

Customers do not create a traditional account.

On first booking the site requests:

- name
- Jordanian phone number

The profile is remembered locally on that device to prefill later bookings. The phone is normalized to the Jordan canonical format. This is **not** represented as OTP-verified authentication.

## Push notifications

An authenticated Admin can request push permission from the Dashboard.

FCM tokens are stored in `notificationTokens`. When a production booking succeeds, Admin devices can receive a new-booking notification. Invalid tokens are cleaned up automatically.

For iPhone/iPad, Web Push depends on supported iOS versions and the website being installed as a PWA. Unsupported/denied browsers fall back gracefully to the Admin Dashboard pending-booking badge.

## PWA / offline behavior

The project includes:

- Web App Manifest
- service worker
- standalone mode
- iOS viewport/safe-area support
- offline fallback page
- cached public shell

Bookings are **not** falsely queued or marked successful while offline. The booking screen tells the customer to reconnect before submitting.

## Validation

Local commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

GitHub Actions also performs a production dependency audit and runs the same validation on the feature branch and pull requests.

## Deploy to Netlify

1. Connect this GitHub repository to Netlify.
2. Select the production branch after the client-ready PR is merged.
3. Netlify reads `netlify.toml` and builds using Node `24.12.0` or newer.
4. Add every required `.env.local` variable under **Site configuration → Environment variables**.
5. Deploy the site.
6. Open `/api/health` and confirm `ready: true` before testing Admin or bookings.
7. Add the final Netlify/custom domain to **Firebase Authentication → Authorized domains**.
8. Verify `/admin/login`.
9. Seed Services and Barbers from Admin if Firestore is empty.
10. Add the real three barber identities/photos.
11. Add real MB Instagram Reel URLs and covers.
12. Add the two Hero MP4 files.
13. Test a complete production booking.
14. Enable push notifications on the owner's device.
15. Install the final HTTPS site as a PWA and verify offline behavior.

## Content still requiring real MB input

The application code is prepared for these, but the final client presentation improves when real shop content is supplied:

- desktop Hero video (`16:9`)
- mobile Hero video (`9:16`)
- real barber names
- real barber photos
- barber specialties if desired
- real Instagram Reel links and cover images
- optional Gallery photography
- genuine customer reviews

No fake customer testimonials are required or shown.
