"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  Scissors,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import { useMbContent } from "@/hooks/use-mb-content";
import {
  formatTime,
  getAvailableDates,
  normalizeJordanPhone,
} from "@/lib/booking";
import type { Locale } from "@/types";

type Form = {
  serviceId: string;
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  phone: string;
};

const initial: Form = {
  serviceId: "",
  barberId: "",
  bookingDate: "",
  bookingTime: "",
  customerName: "",
  phone: "",
};

export function BookingFlowLive({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).booking;
  const { services, barbers } = useMbContent();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    referenceNumber: string;
    barberNameSnapshot: string;
    demoMode: boolean;
  } | null>(null);
  const dates = useMemo(() => getAvailableDates(), []);

  const activeServices = useMemo(
    () => services.filter((item) => item.active),
    [services],
  );
  const activeBarbers = useMemo(
    () => barbers.filter((item) => item.active),
    [barbers],
  );
  const service = activeServices.find((item) => item.id === form.serviceId);
  const barber = activeBarbers.find((item) => item.id === form.barberId);

  useEffect(() => {
  let timer: number | undefined;
  try {
    const profile = JSON.parse(localStorage.getItem("mb-customer") || "null");
    if (profile?.name && profile?.phone) {
      timer = window.setTimeout(() => {
        setForm((current) => ({
          ...current,
          customerName: profile.name,
          phone: profile.phone,
        }));
      }, 0);
    }
  } catch {}
  return () => {
    if (timer) window.clearTimeout(timer);
  };
}, []);

  useEffect(() => {
    if (step !== 3 || !form.bookingDate || !form.barberId) return;
    const controller = new AbortController();
    fetch(
      `/api/bookings/availability?date=${encodeURIComponent(form.bookingDate)}&barberId=${encodeURIComponent(form.barberId)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("availability");
        return response.json();
      })
      .then((payload) => setSlots(payload.slots || []))
      .catch((reason) => {
        if (reason?.name !== "AbortError") setError(d.error);
      })
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [step, form.bookingDate, form.barberId, d.error]);

  function choose(key: keyof Form, value: string) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "barberId" || key === "bookingDate") next.bookingTime = "";
      return next;
    });
    setError("");
  }

  function canContinue() {
    return [
      Boolean(form.serviceId),
      Boolean(form.barberId),
      Boolean(form.bookingDate),
      Boolean(form.bookingTime),
      form.customerName.trim().length >= 2 && Boolean(normalizeJordanPhone(form.phone)),
      true,
    ][step];
  }

  async function submit() {
    if (!navigator.onLine) {
      setError(d.offline);
      return;
    }
    const normalizedPhone = normalizeJordanPhone(form.phone);
    if (!normalizedPhone) {
      setError(d.error);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, website: "" }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setError(d.conflict);
        setStep(3);
        return;
      }
      if (!response.ok) throw new Error("booking");
      localStorage.setItem(
        "mb-customer",
        JSON.stringify({ name: form.customerName.trim(), phone: normalizedPhone }),
      );
      setSuccess(payload);
    } catch {
      setError(d.error);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step === 5) void submit();
    else if (canContinue()) setStep((current) => current + 1);
  }

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  if (success) {
    return (
      <section
        id="booking"
        className="section bg-[radial-gradient(circle_at_50%_15%,rgba(198,161,91,.12),transparent_35%),#0b0b0b]"
      >
        <div className="shell">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-xl rounded-[32px] border border-[#c6a15b]/25 bg-white/[.035] p-7 text-center md:p-12"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#c6a15b] text-black">
              <Check size={26} />
            </div>
            <p className="eyebrow mt-8">MB</p>
            <h2 className="display mt-4 text-4xl md:text-5xl">{d.success}</h2>
            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-xs text-white/40">{d.reference}</p>
              <p className="mt-2 font-mono text-xl tracking-wider text-[#ead49a]">
                {success.referenceNumber}
              </p>
              <div className="my-4 h-px bg-white/10" />
              <p className="text-sm text-white/65">
                {success.barberNameSnapshot} · {formatTime(form.bookingTime, locale)}
              </p>
              <span className="mt-4 inline-flex rounded-full bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200">
                {d.pending}
              </span>
            </div>
            {success.demoMode && (
              <p className="mt-5 text-xs leading-6 text-white/35">{d.demo}</p>
            )}
            <button
              onClick={() => {
                setSuccess(null);
                setStep(0);
                setForm((current) => ({
                  ...initial,
                  customerName: current.customerName,
                  phone: current.phone,
                }));
              }}
              className="btn-primary mt-8"
            >
              {d.another}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking"
      className="section bg-[radial-gradient(circle_at_50%_10%,rgba(198,161,91,.1),transparent_30%),#0b0b0b]"
    >
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{d.tag}</p>
          <h2 className="display mt-4 text-5xl md:text-7xl">{d.title}</h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[#111] shadow-2xl">
          <div className="border-b border-white/10 px-5 py-4 md:px-8">
            <div className="flex items-center gap-2">
              {d.steps.map((label, index) => (
                <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${
                      index <= step ? "bg-[#c6a15b] text-black" : "bg-white/5 text-white/35"
                    }`}
                  >
                    {index < step ? <Check size={12} /> : index + 1}
                  </span>
                  <span
                    className={`hidden truncate text-[10px] lg:block ${
                      index <= step ? "text-white" : "text-white/25"
                    }`}
                  >
                    {label}
                  </span>
                  {index < d.steps.length - 1 && (
                    <span
                      className={`h-px flex-1 ${
                        index < step ? "bg-[#c6a15b]/60" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[410px] p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: locale === "ar" ? -18 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: locale === "ar" ? 18 : -18 }}
                transition={{ duration: 0.22 }}
              >
                <StepTitle number={step + 1} label={d.steps[step]} />

                {step === 0 && (
                  <ChoiceGrid>
                    {activeServices.map((item) => (
                      <Choice
                        key={item.id}
                        selected={form.serviceId === item.id}
                        onClick={() => choose("serviceId", item.id)}
                        icon={<Scissors size={18} />}
                        label={locale === "ar" ? item.nameAr : item.nameEn}
                      />
                    ))}
                  </ChoiceGrid>
                )}

                {step === 1 && (
                  <ChoiceGrid>
                    <Choice
                      selected={form.barberId === "any"}
                      onClick={() => choose("barberId", "any")}
                      icon={<UsersRound size={19} />}
                      label={d.any}
                    />
                    {activeBarbers.map((item) => (
                      <Choice
                        key={item.id}
                        selected={form.barberId === item.id}
                        onClick={() => choose("barberId", item.id)}
                        icon={<UserRound size={18} />}
                        label={locale === "ar" ? item.nameAr : item.nameEn}
                      />
                    ))}
                  </ChoiceGrid>
                )}

                {step === 2 && (
                  <div className="hide-scrollbar grid max-h-72 grid-cols-2 gap-3 overflow-auto sm:grid-cols-3">
                    {dates.map((date, index) => {
                      const value = new Date(`${date}T12:00:00`);
                      const weekday = new Intl.DateTimeFormat(
                        locale === "ar" ? "ar-JO" : "en-US",
                        { weekday: "short" },
                      ).format(value);
                      const day = new Intl.DateTimeFormat(
                        locale === "ar" ? "ar-JO" : "en-US",
                        { day: "numeric", month: "short" },
                      ).format(value);
                      return (
                        <Choice
                          key={date}
                          selected={form.bookingDate === date}
                          onClick={() => choose("bookingDate", date)}
                          icon={<CalendarDays size={17} />}
                          label={`${
                            index === 0 ? (locale === "ar" ? "اليوم · " : "Today · ") : ""
                          }${weekday} ${day}`}
                        />
                      );
                    })}
                  </div>
                )}

                {step === 3 &&
                  (loadingSlots ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {Array.from({ length: 12 }, (_, index) => (
                        <div key={index} className="h-12 animate-pulse rounded-xl bg-white/5" />
                      ))}
                    </div>
                  ) : slots.length ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => choose("bookingTime", time)}
                          className={`rounded-xl border px-3 py-3 text-sm transition ${
                            form.bookingTime === time
                              ? "border-[#c6a15b] bg-[#c6a15b] text-black"
                              : "border-white/10 bg-white/[.025] text-white/65 hover:border-white/25"
                          }`}
                        >
                          {formatTime(time, locale)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Empty text={d.noSlots} />
                  ))}

                {step === 4 && (
                  <div className="mx-auto max-w-md space-y-5">
                    <label className="block text-xs text-white/50">
                      {d.name}
                      <input
                        value={form.customerName}
                        onChange={(event) => choose("customerName", event.target.value)}
                        autoComplete="name"
                        className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition focus:border-[#c6a15b]"
                      />
                    </label>
                    <label className="block text-xs text-white/50">
                      {d.phone}
                      <input
                        value={form.phone}
                        onChange={(event) => choose("phone", event.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0792398952"
                        dir="ltr"
                        className="mt-2 h-13 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-start text-base text-white outline-none transition focus:border-[#c6a15b]"
                      />
                    </label>
                    <p className="text-[11px] leading-5 text-white/30">
                      {locale === "ar"
                        ? "يُحفظ الاسم والرقم على هذا الجهاز لتسهيل حجوزاتك القادمة، ويُستخدم الرقم للتواصل بخصوص الحجز فقط."
                        : "Your name and number are remembered on this device for future bookings and used only for booking contact."}
                    </p>
                  </div>
                )}

                {step === 5 && (
                  <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-black/25 p-5">
                    <h3 className="mb-5 text-lg">{d.summary}</h3>
                    {[
                      [d.steps[0], locale === "ar" ? service?.nameAr : service?.nameEn],
                      [
                        d.steps[1],
                        form.barberId === "any"
                          ? d.any
                          : locale === "ar"
                            ? barber?.nameAr
                            : barber?.nameEn,
                      ],
                      [
                        d.steps[2],
                        new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-US", {
                          dateStyle: "full",
                        }).format(new Date(`${form.bookingDate}T12:00:00`)),
                      ],
                      [d.steps[3], formatTime(form.bookingTime, locale)],
                      [d.name, form.customerName],
                      [d.phone, normalizeJordanPhone(form.phone)],
                    ].map(([key, value]) => (
                      <div
                        key={String(key)}
                        className="flex items-center justify-between gap-5 border-t border-white/8 py-3 text-sm"
                      >
                        <span className="text-white/35">{key}</span>
                        <span className="text-end text-white/80">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[.06] p-3 text-center text-xs text-red-200"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 p-5 md:px-8">
            <button
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
              className="btn-secondary disabled:invisible"
            >
              <BackIcon size={15} />
              {d.back}
            </button>
            <button
              onClick={next}
              disabled={!canContinue() || submitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : step === 5 ? (
                <Check size={17} />
              ) : (
                <NextIcon size={15} />
              )}
              {step === 5 ? d.confirm : d.continue}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTitle({ number, label }: { number: number; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-xs font-bold text-[#c6a15b]">0{number}</span>
      <h3 className="text-xl">{label}</h3>
    </div>
  );
}

function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Choice({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-16 items-center gap-4 rounded-2xl border p-4 text-start transition ${
        selected
          ? "border-[#c6a15b] bg-[#c6a15b]/10"
          : "border-white/10 bg-white/[.025] hover:border-white/25"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          selected ? "bg-[#c6a15b] text-black" : "bg-white/5 text-[#c6a15b]"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {selected && <Check className="ms-auto text-[#c6a15b]" size={16} />}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 text-center">
      <div>
        <Clock3 className="mx-auto mb-3 text-white/25" />
        <p className="text-sm text-white/40">{text}</p>
      </div>
    </div>
  );
}
