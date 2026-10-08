"use client";
import { getToken } from "firebase/messaging";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Phone,
  Plus,
  Scissors,
  Settings,
  Trash2,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import { barbers as demoBarbers, services as demoServices } from "@/data/demo";
import { auth, db, messaging } from "@/lib/firebase/client";
import type { Barber, Booking, Service } from "@/types";
type Tab =
  "overview" | "bookings" | "services" | "barbers" | "content" | "settings";
const labels: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "services", label: "Services", icon: Scissors },
  { id: "barbers", label: "Barbers", icon: UsersRound },
  { id: "content", label: "Content", icon: ExternalLink },
  { id: "settings", label: "Settings", icon: Settings },
];
export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null),
    [checking, setChecking] = useState(true),
    [tab, setTab] = useState<Tab>("overview"),
    [bookings, setBookings] = useState<Booking[]>([]),
    [loading, setLoading] = useState(true),
    [services, setServices] = useState<Service[]>(demoServices),
    [barbers, setBarbers] = useState<Barber[]>(demoBarbers),
    router = useRouter();
  useEffect(() => {
    if (!auth) {
      router.replace("/admin/login");
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/admin/login");
      else setUser(u);
      setChecking(false);
    });
  }, [router]);
  useEffect(() => {
    if (!user) return;
    user
      .getIdToken()
      .then((token) =>
        fetch("/api/admin/bookings", {
          headers: { authorization: `Bearer ${token}` },
        }),
      )
      .then((r) => r.json())
      .then((x) => setBookings(x.bookings || []))
      .finally(() => setLoading(false));
    if (db) {
      const u1 = onSnapshot(
          query(collection(db, "services"), orderBy("sortOrder")),
          (s) => {
            if (!s.empty)
              setServices(
                s.docs.map((x) => ({ id: x.id, ...x.data() }) as Service),
              );
          },
        ),
        u2 = onSnapshot(
          query(collection(db, "barbers"), orderBy("sortOrder")),
          (s) => {
            if (!s.empty)
              setBarbers(
                s.docs.map((x) => ({ id: x.id, ...x.data() }) as Barber),
              );
          },
        );
      return () => {
        u1();
        u2();
      };
    }
  }, [user]);
  const counts = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((x) => x.status === "pending").length,
      confirmed: bookings.filter((x) => x.status === "confirmed").length,
      completed: bookings.filter((x) => x.status === "completed").length,
    }),
    [bookings],
  );
  async function status(
    id: string,
    status: "confirmed" | "rejected" | "completed" | "cancelled",
  ) {
    if (!user) return;
    const token = await user.getIdToken();
    const r = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok)
      setBookings((x) => x.map((b) => (b.id === id ? { ...b, status } : b)));
  }
  async function enablePush() {
    try {
      const m = await messaging();
      if (!m || !user || !db) {
        alert("Push is not supported or Firebase is not configured.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const token = await getToken(m, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });
      if (token)
        await setDoc(
          doc(db, "notificationTokens", token),
          {
            uid: user.uid,
            token,
            updatedAt: new Date(),
            userAgent: navigator.userAgent,
          },
          { merge: true },
        );
      alert("Notifications enabled on this device.");
    } catch {
      alert("Could not enable notifications on this browser.");
    }
  }
  if (checking || !user)
    return (
      <div className="grid min-h-screen place-items-center bg-[#080808]">
        <LoaderCircle className="animate-spin text-[#c6a15b]" />
      </div>
    );
  return (
    <main dir="ltr" className="min-h-screen bg-[#090909] text-[#f4f0e7]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0d0d0d] p-5 lg:block">
        <Logo />
        <nav className="mt-10 space-y-1">
          {labels.map((x) => (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${tab === x.id ? "bg-[#c6a15b] text-black" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
            >
              <x.icon size={17} />
              {x.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => auth && signOut(auth)}
          className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/40 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/70 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <Logo compact />
            </span>
            <h1 className="font-medium">
              {labels.find((x) => x.id === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enablePush}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/55 hover:text-white"
              aria-label="Enable notifications"
            >
              <Bell size={16} />
            </button>
            <span className="hidden text-xs text-white/35 sm:block">
              {user.email}
            </span>
          </div>
        </header>
        <nav className="hide-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 p-3 lg:hidden">
          {labels.map((x) => (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs ${tab === x.id ? "bg-[#c6a15b] text-black" : "bg-white/5 text-white/45"}`}
            >
              {x.label}
            </button>
          ))}
        </nav>
        <div className="p-5 lg:p-8">
          {tab === "overview" && (
            <Overview counts={counts} bookings={bookings} />
          )}{" "}
          {tab === "bookings" && (
            <Bookings bookings={bookings} loading={loading} onStatus={status} />
          )}{" "}
          {tab === "services" && (
            <Manager
              title="Services"
              items={services.map((x) => ({
                id: x.id,
                ar: x.nameAr,
                en: x.nameEn,
                active: x.active,
              }))}
              collectionName="services"
              baseCount={services.length}
            />
          )}{" "}
          {tab === "barbers" && (
            <Manager
              title="Barbers"
              items={barbers.map((x) => ({
                id: x.id,
                ar: x.nameAr,
                en: x.nameEn,
                active: x.active,
              }))}
              collectionName="barbers"
              baseCount={barbers.length}
            />
          )}{" "}
          {tab === "content" && <ContentPanel />}{" "}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </main>
  );
}
function Overview({
  counts,
  bookings,
}: {
  counts: Record<string, number>;
  bookings: Booking[];
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["Total bookings", counts.total, CalendarDays],
            ["Pending", counts.pending, Clock3],
            ["Confirmed", counts.confirmed, CheckCircle2],
            ["Completed", counts.completed, CheckCircle2],
          ] as [string, number, typeof CalendarDays][]
        ).map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[.025] p-5"
          >
            <Icon size={18} className="text-[#c6a15b]" />
            <p className="mt-6 text-3xl font-medium">{value}</p>
            <p className="mt-1 text-xs text-white/35">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h2>Recent bookings</h2>
        <div className="mt-4">
          {bookings.slice(0, 5).map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between border-t border-white/8 py-4 text-sm"
            >
              <div>
                <p>{b.customerName}</p>
                <p className="mt-1 text-xs text-white/35">
                  {b.serviceNameSnapshot} · {b.bookingDate} {b.bookingTime}
                </p>
              </div>
              <Status value={b.status} />
            </div>
          ))}
          {!bookings.length && <Empty />}
        </div>
      </div>
    </>
  );
}
function Bookings({
  bookings,
  loading,
  onStatus,
}: {
  bookings: Booking[];
  loading: boolean;
  onStatus: (
    id: string,
    status: "confirmed" | "rejected" | "completed" | "cancelled",
  ) => void;
}) {
  if (loading) return <LoaderCircle className="animate-spin text-[#c6a15b]" />;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[.035] text-[11px] uppercase tracking-wider text-white/35">
            <tr>
              {[
                "Reference",
                "Customer",
                "Appointment",
                "Barber",
                "Status",
                "Actions",
              ].map((x) => (
                <th key={x} className="px-5 py-4 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-white/8">
                <td className="px-5 py-4 font-mono text-xs text-[#d8b871]">
                  {b.referenceNumber}
                </td>
                <td className="px-5 py-4">
                  <p>{b.customerName}</p>
                  <a
                    href={`tel:${b.phone}`}
                    className="mt-1 flex items-center gap-1 text-xs text-white/35 hover:text-white"
                  >
                    <Phone size={11} />
                    {b.phone}
                  </a>
                </td>
                <td className="px-5 py-4">
                  <p>{b.bookingDate}</p>
                  <p className="text-xs text-white/35">
                    {b.bookingTime} · {b.serviceNameSnapshot}
                  </p>
                </td>
                <td className="px-5 py-4">{b.barberNameSnapshot}</td>
                <td className="px-5 py-4">
                  <Status value={b.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => onStatus(b.id!, "confirmed")}
                          className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300"
                          title="Confirm"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => onStatus(b.id!, "rejected")}
                          className="rounded-lg bg-red-400/10 p-2 text-red-300"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => onStatus(b.id!, "completed")}
                        className="rounded-lg bg-white/5 px-3 py-2 text-xs"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!bookings.length && <Empty />}
    </div>
  );
}
function Manager({
  title,
  items,
  collectionName,
  baseCount,
}: {
  title: string;
  items: { id: string; ar: string; en: string; active: boolean }[];
  collectionName: "services" | "barbers";
  baseCount: number;
}) {
  const [ar, setAr] = useState(""),
    [en, setEn] = useState("");
  async function add() {
    if (!db || !ar || !en) return;
    await addDoc(
      collection(db, collectionName),
      collectionName === "services"
        ? {
            nameAr: ar,
            nameEn: en,
            active: true,
            sortOrder: baseCount + 1,
            icon: "Scissors",
          }
        : {
            nameAr: ar,
            nameEn: en,
            specialtyAr: "فريق MB",
            specialtyEn: "MB Team",
            active: true,
            sortOrder: baseCount + 1,
            workSchedule: {},
            unavailableDates: [],
            unavailableTimeSlots: [],
          },
    );
    setAr("");
    setEn("");
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">{title}</h2>
          <p className="mt-1 text-xs text-white/35">
            Add, disable or remove entries. Changes sync to Firestore.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={ar}
          onChange={(e) => setAr(e.target.value)}
          placeholder="Arabic name"
          dir="rtl"
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#c6a15b]"
        />
        <input
          value={en}
          onChange={(e) => setEn(e.target.value)}
          placeholder="English name"
          className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#c6a15b]"
        />
        <button
          onClick={add}
          disabled={!db}
          className="btn-primary !min-h-11 disabled:opacity-40"
        >
          <Plus size={15} />
          Add
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((x) => (
          <div
            key={x.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[.02] p-4"
          >
            <div className="min-w-0 flex-1">
              <p>{x.en}</p>
              <p className="mt-1 text-xs text-white/35" dir="rtl">
                {x.ar}
              </p>
            </div>
            <button
              disabled={!db}
              onClick={() =>
                db &&
                updateDoc(doc(db, collectionName, x.id), { active: !x.active })
              }
              className={`rounded-full px-3 py-1 text-[10px] ${x.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/35"}`}
            >
              {x.active ? "Active" : "Disabled"}
            </button>
            <button
              disabled={!db}
              onClick={() => db && deleteDoc(doc(db, collectionName, x.id))}
              className="text-white/25 hover:text-red-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function ContentPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Instagram Work", "Add Reel URLs, covers and display order."],
        ["Gallery", "Upload and manage real MB images."],
        ["Reviews", "Publish only verified customer reviews."],
      ].map(([x, y]) => (
        <div
          key={x}
          className="rounded-2xl border border-white/10 bg-white/[.025] p-5"
        >
          <ExternalLink className="text-[#c6a15b]" size={18} />
          <h2 className="mt-6">{x}</h2>
          <p className="mt-2 text-xs leading-6 text-white/35">{y}</p>
          <p className="mt-5 text-[10px] text-white/25">
            Collection architecture and security rules are ready for Firebase.
          </p>
        </div>
      ))}
    </div>
  );
}
function SettingsPanel() {
  return (
    <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[.025] p-6">
      <h2 className="text-xl">Business settings</h2>
      <p className="mt-2 text-sm text-white/35">
        Phone, WhatsApp, Instagram, map link, weekly hours and special closures
        are stored in <code>businessSettings/main</code>.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          "0792398952",
          "+962792398952",
          "mb_barber98",
          "Every day · 11:00–23:00",
        ].map((x) => (
          <div
            key={x}
            className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-white/65"
          >
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}
function Status({ value }: { value: string }) {
  const c =
    value === "confirmed"
      ? "text-emerald-300 bg-emerald-400/10"
      : value === "pending"
        ? "text-amber-200 bg-amber-300/10"
        : value === "completed"
          ? "text-sky-300 bg-sky-400/10"
          : "text-white/40 bg-white/5";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] capitalize ${c}`}
    >
      {value}
    </span>
  );
}
function Empty() {
  return (
    <div className="p-10 text-center text-sm text-white/30">
      No records yet.
    </div>
  );
}
