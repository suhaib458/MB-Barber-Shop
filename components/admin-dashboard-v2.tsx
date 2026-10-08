"use client";

import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
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
  MessageCircle,
  Phone,
  RefreshCw,
  Scissors,
  Search,
  Settings,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarbersPanel } from "@/components/admin/barbers-panel";
import { ContentPanel } from "@/components/admin/content-panel";
import { ServicesPanel } from "@/components/admin/services-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { Logo } from "@/components/logo";
import { auth, db, messaging } from "@/lib/firebase/client";
import type { Booking, BookingStatus } from "@/types";

type Tab = "overview" | "bookings" | "services" | "barbers" | "content" | "settings";

const labels: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "services", label: "Services", icon: Scissors },
  { id: "barbers", label: "Barbers", icon: UsersRound },
  { id: "content", label: "Content", icon: ExternalLink },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminDashboardV2() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [notificationState, setNotificationState] = useState<"idle" | "enabled" | "denied" | "unsupported">("idle");
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.replace("/admin/login");
      setChecking(false);
      return;
    }
    return onAuthStateChanged(auth, (current) => {
      if (!current) router.replace("/admin/login");
      else setUser(current);
      setChecking(false);
    });
  }, [router]);

  async function loadBookings(currentUser = user) {
    if (!currentUser) return;
    setLoadingBookings(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/bookings", {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        await auth?.signOut();
        router.replace("/admin/login");
        return;
      }
      const payload = await response.json();
      setBookings(payload.bookings || []);
    } finally {
      setLoadingBookings(false);
    }
  }

  useEffect(() => {
    if (user) void loadBookings(user);
  }, [user]);

  const counts = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((item) => item.status === "pending").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      cancelled: bookings.filter((item) => ["cancelled", "rejected"].includes(item.status)).length,
    }),
    [bookings],
  );

  async function updateStatus(id: string, status: Exclude<BookingStatus, "pending">) {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) {
      setBookings((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    }
  }

  async function enablePush() {
    try {
      const instance = await messaging();
      if (!instance || !user || !db || !("Notification" in window)) {
        setNotificationState("unsupported");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotificationState("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(instance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (token) {
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
        setNotificationState("enabled");
      }
    } catch {
      setNotificationState("unsupported");
    }
  }

  if (checking || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#080808]">
        <LoaderCircle className="animate-spin text-[#c6a15b]" />
      </div>
    );
  }

  return (
    <main dir="ltr" className="min-h-screen bg-[#090909] text-[#f4f0e7]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0d0d0d] p-5 lg:block">
        <Logo />
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[.025] p-4">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#d7b66f]">MB Admin</p>
          <p className="mt-2 truncate text-xs text-white/45">{user.email}</p>
        </div>
        <nav className="mt-7 space-y-1">
          {labels.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                tab === item.id
                  ? "bg-[#c6a15b] text-black shadow-[0_10px_30px_rgba(198,161,91,.12)]"
                  : "text-white/42 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={17} />
              {item.label}
              {item.id === "bookings" && counts.pending > 0 && (
                <span className="ms-auto grid h-5 min-w-5 place-items-center rounded-full bg-black/20 px-1 text-[9px] font-bold">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick={() => auth && signOut(auth)}
          className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-white/10 bg-black/72 px-5 py-3 backdrop-blur-2xl lg:px-8">
          <div className="flex items-center gap-3">
            <span className="lg:hidden"><Logo compact /></span>
            <div>
              <h1 className="font-medium">{labels.find((item) => item.id === tab)?.label}</h1>
              <p className="mt-0.5 hidden text-[10px] text-white/25 sm:block">Manage the live MB website and bookings.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadBookings()}
              className="admin-icon"
              aria-label="Refresh bookings"
              title="Refresh bookings"
            >
              <RefreshCw size={15} className={loadingBookings ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => void enablePush()}
              className={`admin-icon relative ${notificationState === "enabled" ? "text-emerald-300" : ""}`}
              aria-label="Enable notifications"
              title={
                notificationState === "enabled"
                  ? "Notifications enabled"
                  : notificationState === "denied"
                    ? "Notification permission denied"
                    : "Enable notifications"
              }
            >
              <Bell size={16} />
              {counts.pending > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#c6a15b] shadow-[0_0_9px_#c6a15b]" />}
            </button>
            <a href="/ar" target="_blank" className="admin-icon" title="Open website"><ExternalLink size={15} /></a>
          </div>
        </header>

        <nav className="hide-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 p-3 lg:hidden">
          {labels.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-xs ${
                tab === item.id ? "bg-[#c6a15b] text-black" : "bg-white/5 text-white/45"
              }`}
            >
              {item.label}
              {item.id === "bookings" && counts.pending > 0 && (
                <span className="ms-1 rounded-full bg-black/20 px-1.5 text-[9px]">{counts.pending}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-5 lg:p-8">
          {tab === "overview" && (
            <Overview counts={counts} bookings={bookings} loading={loadingBookings} onOpenBookings={() => setTab("bookings")} />
          )}
          {tab === "bookings" && (
            <Bookings bookings={bookings} loading={loadingBookings} onStatus={updateStatus} />
          )}
          {tab === "services" && <ServicesPanel />}
          {tab === "barbers" && <BarbersPanel />}
          {tab === "content" && <ContentPanel />}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </main>
  );
}

function Overview({
  counts,
  bookings,
  loading,
  onOpenBookings,
}: {
  counts: Record<string, number>;
  bookings: Booking[];
  loading: boolean;
  onOpenBookings: () => void;
}) {
  const cards = [
    ["Total bookings", counts.total, CalendarDays],
    ["Pending", counts.pending, Clock3],
    ["Confirmed", counts.confirmed, CheckCircle2],
    ["Completed", counts.completed, CheckCircle2],
  ] as const;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <button
            key={label}
            onClick={onOpenBookings}
            className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#c6a15b]/25 hover:bg-white/[.04]"
          >
            <Icon size={18} className="text-[#c6a15b]" />
            <p className="mt-6 text-3xl font-medium">{value}</p>
            <p className="mt-1 text-xs text-white/35">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2>Recent bookings</h2>
            <button onClick={onOpenBookings} className="text-xs text-[#d7b66f]">View all</button>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[.03]" />)}</div>
            ) : bookings.length ? (
              bookings.slice(0, 6).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between gap-4 border-t border-white/8 py-4 text-sm first:border-t-0">
                  <div className="min-w-0">
                    <p className="truncate">{booking.customerName}</p>
                    <p className="mt-1 truncate text-xs text-white/35">{booking.serviceNameSnapshot} · {booking.bookingDate} · {booking.bookingTime}</p>
                  </div>
                  <Status value={booking.status} />
                </div>
              ))
            ) : <Empty text="No bookings yet." />}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_100%_0%,rgba(198,161,91,.12),transparent_38%),rgba(255,255,255,.025)] p-5">
          <p className="text-xs text-white/35">Needs attention</p>
          <p className="mt-5 text-5xl font-medium text-[#e2c37c]">{counts.pending}</p>
          <p className="mt-2 text-sm text-white/48">Pending booking requests are waiting for confirmation.</p>
          <button onClick={onOpenBookings} className="btn-primary mt-7 w-full !min-h-11">Review pending</button>
        </div>
      </div>
    </div>
  );
}

function Bookings({
  bookings,
  loading,
  onStatus,
}: {
  bookings: Booking[];
  loading: boolean;
  onStatus: (id: string, status: Exclude<BookingStatus, "pending">) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return bookings.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (dateFilter && item.bookingDate !== dateFilter) return false;
      if (!needle) return true;
      return [
        item.referenceNumber,
        item.customerName,
        item.phone,
        item.serviceNameSnapshot,
        item.barberNameSnapshot,
      ].some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [bookings, search, statusFilter, dateFilter]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 md:grid-cols-[1fr_190px_190px]">
        <label className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="admin-input !ps-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, phone, reference..." />
        </label>
        <select className="admin-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | BookingStatus)}>
          <option value="all" className="bg-[#111]">All statuses</option>
          {(["pending", "confirmed", "completed", "rejected", "cancelled"] as BookingStatus[]).map((value) => <option key={value} value={value} className="bg-[#111]">{value}</option>)}
        </select>
        <input type="date" className="admin-input" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
      </div>

      {loading ? (
        <LoaderCircle className="animate-spin text-[#c6a15b]" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-white/[.035] text-[11px] uppercase tracking-wider text-white/35">
                <tr>
                  {["Reference", "Customer", "Appointment", "Barber", "Status", "Contact", "Actions"].map((label) => (
                    <th key={label} className="px-5 py-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const whatsapp = `https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`MB booking ${booking.referenceNumber}`)}`;
                  return (
                    <tr key={booking.id} className="border-t border-white/8 align-top hover:bg-white/[.015]">
                      <td className="px-5 py-4 font-mono text-xs text-[#d8b871]">{booking.referenceNumber}</td>
                      <td className="px-5 py-4"><p>{booking.customerName}</p><p className="mt-1 text-xs text-white/35">{booking.phone}</p></td>
                      <td className="px-5 py-4"><p>{booking.bookingDate}</p><p className="mt-1 text-xs text-white/35">{booking.bookingTime} · {booking.serviceNameSnapshot}</p></td>
                      <td className="px-5 py-4">{booking.barberNameSnapshot}</td>
                      <td className="px-5 py-4"><Status value={booking.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <a href={`tel:${booking.phone}`} className="admin-icon" title="Call"><Phone size={15} /></a>
                          <a href={whatsapp} target="_blank" rel="noreferrer" className="admin-icon" title="WhatsApp"><MessageCircle size={15} /></a>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button onClick={() => booking.id && void onStatus(booking.id, "confirmed")} className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300" title="Confirm"><CheckCircle2 size={16} /></button>
                              <button onClick={() => booking.id && window.confirm("Reject this booking?") && void onStatus(booking.id, "rejected")} className="rounded-lg bg-red-400/10 p-2 text-red-300" title="Reject"><XCircle size={16} /></button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <button onClick={() => booking.id && void onStatus(booking.id, "completed")} className="rounded-lg bg-white/5 px-3 py-2 text-xs">Complete</button>
                              <button onClick={() => booking.id && window.confirm("Cancel this booking and release its time slot?") && void onStatus(booking.id, "cancelled")} className="rounded-lg bg-red-400/[.06] px-3 py-2 text-xs text-red-200">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!filtered.length && <Empty text="No bookings match the current filters." />}
        </div>
      )}
    </div>
  );
}

function Status({ value }: { value: string }) {
  const classes =
    value === "confirmed"
      ? "text-emerald-300 bg-emerald-400/10"
      : value === "pending"
        ? "text-amber-200 bg-amber-300/10"
        : value === "completed"
          ? "text-sky-300 bg-sky-400/10"
          : value === "rejected" || value === "cancelled"
            ? "text-red-200 bg-red-400/[.08]"
            : "text-white/40 bg-white/5";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] capitalize ${classes}`}>{value}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="p-10 text-center text-sm text-white/30">{text}</div>;
}
