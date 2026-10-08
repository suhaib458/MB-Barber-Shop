"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  ExternalLink,
  Grid3X3,
  House,
  Aperture as Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Scissors,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookingFlowLive } from "@/components/booking-flow-live";
import { Logo } from "@/components/logo";
import { useMbContent } from "@/hooks/use-mb-content";
import { isOpenForSchedule } from "@/lib/booking";
import type { Locale } from "@/types";

const copy = {
  ar: {
    dir: "rtl" as const,
    nav: {
      home: "الرئيسية",
      services: "الخدمات",
      work: "أعمالنا",
      barbers: "الحلاقون",
      about: "عن MB",
      location: "الموقع",
      book: "احجز",
      more: "المزيد",
    },
    hero: {
      tag: "MB · Premium Grooming",
      title: "أناقتك تبدأ من",
      body: "تجربة حلاقة عصرية تهتم بالتفاصيل، من أول لحظة للحجز وحتى اللمسة الأخيرة.",
      book: "احجز موعدك",
      explore: "اكتشف خدماتنا",
      scroll: "اكتشف MB",
    },
    services: {
      tag: "خدمات MB",
      title: "تفاصيل تصنع الفرق",
      body: "اختر الخدمة التي تناسبك واحجزها بخطوات بسيطة، بدون أسعار ظاهرة أو تعقيد.",
    },
    barbers: {
      tag: "فريق MB",
      title: "اختر حلاقك",
      body: "ثلاثة مقاعد جاهزة لفريق MB، مع إمكانية اختيار أي حلاق متاح أثناء الحجز.",
      available: "متاح للحجز",
    },
    work: {
      tag: "أعمالنا",
      title: "النتيجة تحكي",
      body: "شاهد مختارات من أعمال MB، واضغط على أي Reel للانتقال مباشرة إلى Instagram.",
      more: "عرض المزيد على Instagram",
      reel: "شاهد على Instagram",
      empty: "ستظهر أعمال MB هنا بعد إضافة روابط الـReels من لوحة الإدارة.",
    },
    gallery: {
      tag: "المعرض",
      title: "من داخل MB",
      body: "صور حقيقية من المكان والأعمال، تُدار بالكامل من لوحة الإدارة.",
    },
    about: {
      tag: "عن MB",
      title: "حلاقة عصرية، بهوية واضحة",
      open: "مفتوح الآن",
      closed: "مغلق الآن",
      hours: "أوقات الدوام",
      daily: "يوميًا",
      timezone: "بتوقيت عمّان",
    },
    reviews: {
      tag: "آراء العملاء",
      title: "تجارب حقيقية فقط",
      body: "لن يظهر هذا القسم إلا عند إضافة تقييمات حقيقية من لوحة الإدارة.",
    },
    location: {
      tag: "زورنا",
      title: "وصلك أسهل",
      body: "افتح موقع MB مباشرة على Google Maps واحصل على الاتجاهات.",
      maps: "افتح الموقع على Google Maps",
      whatsapp: "تواصل عبر WhatsApp",
      call: "اتصل الآن",
    },
    faq: {
      tag: "الأسئلة الشائعة",
      title: "كل شيء واضح قبل الحجز",
      items: [
        ["هل أحتاج لإنشاء حساب؟", "لا. أول مرة ندخل الاسم ورقم الهاتف فقط، وبعدها يحفظهما الجهاز لتسهيل الحجوزات القادمة."],
        ["هل أستطيع اختيار الحلاق؟", "نعم، ويمكنك أيضًا اختيار «أي حلاق متاح» ليتم تعيين أول حلاق متوفر في الموعد."],
        ["كيف أعرف أن الحجز تم؟", "بعد إرسال الطلب يظهر رقم مرجعي وحالة «بانتظار التأكيد»، ويظهر الطلب مباشرة في لوحة إدارة MB."],
        ["هل يمكن أن يحجز شخصان نفس الحلاق بنفس الوقت؟", "لا. النظام يتحقق من الموعد عند الاختيار ومرة أخرى لحظة التأكيد لمنع تضارب الحجوزات."],
        ["هل الدفع إلكتروني؟", "حاليًا الدفع داخل المحل فقط."],
      ],
    },
    footer: {
      line: "الدقة، الراحة والأناقة في تجربة واحدة.",
      rights: "جميع الحقوق محفوظة.",
    },
  },
  en: {
    dir: "ltr" as const,
    nav: {
      home: "Home",
      services: "Services",
      work: "Our Work",
      barbers: "Barbers",
      about: "About MB",
      location: "Location",
      book: "Book",
      more: "More",
    },
    hero: {
      tag: "MB · Premium Grooming",
      title: "Your style starts at",
      body: "A modern grooming experience built around detail, comfort and a polished finish from booking to the chair.",
      book: "Book Your Appointment",
      explore: "Explore Services",
      scroll: "Discover MB",
    },
    services: {
      tag: "MB Services",
      title: "Details make the difference",
      body: "Choose your service and book in a few simple steps, without visible pricing or unnecessary friction.",
    },
    barbers: {
      tag: "MB Team",
      title: "Choose your barber",
      body: "Three barber slots are prepared for the MB team, with an Any Available Barber option at booking.",
      available: "Available to book",
    },
    work: {
      tag: "Our Work",
      title: "The result speaks",
      body: "Explore selected MB work and open any Reel directly on Instagram.",
      more: "View More on Instagram",
      reel: "View on Instagram",
      empty: "MB work will appear here after Reel links are added in the Admin dashboard.",
    },
    gallery: {
      tag: "Gallery",
      title: "Inside MB",
      body: "Real shop and haircut photography, managed entirely from the Admin dashboard.",
    },
    about: {
      tag: "About MB",
      title: "Modern grooming with a clear identity",
      open: "Open now",
      closed: "Closed now",
      hours: "Opening hours",
      daily: "Daily",
      timezone: "Amman time",
    },
    reviews: {
      tag: "Reviews",
      title: "Real experiences only",
      body: "This section appears only after genuine reviews are added from Admin.",
    },
    location: {
      tag: "Visit us",
      title: "Finding MB is easy",
      body: "Open MB directly in Google Maps and get directions.",
      maps: "Open in Google Maps",
      whatsapp: "Chat on WhatsApp",
      call: "Call now",
    },
    faq: {
      tag: "FAQ",
      title: "Everything clear before you book",
      items: [
        ["Do I need an account?", "No. On your first booking, enter only your name and phone number. This device remembers them for future bookings."],
        ["Can I choose my barber?", "Yes. You can also choose Any Available Barber and the system will assign an available barber for that time."],
        ["How do I know my booking was received?", "You receive a booking reference and a Pending confirmation status while the request appears in the MB Admin dashboard."],
        ["Can two people book the same barber at the same time?", "No. Availability is checked when selecting the slot and again atomically when the booking is submitted."],
        ["Is online payment available?", "For now, payment is made at the shop."],
      ],
    },
    footer: {
      line: "Precision, comfort and style in one experience.",
      rights: "All rights reserved.",
    },
  },
};

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
};

const dayNames = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export function HomePageV2({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const other = locale === "ar" ? "en" : "ar";
  const { services, barbers, instagramWorks, gallery, reviews, settings, loading } = useMbContent();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openNow, setOpenNow] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = t.dir;
    const updateScroll = () => setScrolled(window.scrollY > 36);
    const updateOpen = () =>
      setOpenNow(isOpenForSchedule(settings.weeklyHours, settings.temporarilyClosed));
    updateScroll();
    updateOpen();
    window.addEventListener("scroll", updateScroll, { passive: true });
    const clock = window.setInterval(updateOpen, 60_000);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.clearInterval(clock);
    };
  }, [locale, settings.temporarilyClosed, settings.weeklyHours, t.dir]);

  const activeServices = useMemo(
    () => services.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [services],
  );
  const activeBarbers = useMemo(
    () => barbers.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [barbers],
  );
  const activeWorks = useMemo(
    () => instagramWorks.filter((item) => item.active).sort((a, b) => a.order - b.order),
    [instagramWorks],
  );
  const activeGallery = useMemo(
    () => gallery.filter((item) => item.active).sort((a, b) => a.order - b.order),
    [gallery],
  );
  const activeReviews = useMemo(
    () => reviews.filter((item) => item.active).sort((a, b) => a.order - b.order),
    [reviews],
  );

  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    locale === "ar"
      ? "مرحباً MB، أود الاستفسار عن الحجز."
      : "Hello MB, I would like to ask about booking.",
  )}`;

  return (
    <main dir={t.dir} className="bg-[#080808] text-[#f4f0e7]">
      <DesktopNav
        locale={locale}
        other={other}
        scrolled={scrolled}
        instagram={settings.instagram}
      />
      <MobileHeader locale={locale} other={other} onMenu={() => setMenuOpen(true)} />

      <section id="home" className="noise relative flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-poster.svg')] bg-cover bg-center" />
        <video
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.svg"
        >
          <source src="/videos/mb-hero-desktop.mp4" type="video/mp4" />
        </video>
        <video
          className="absolute inset-0 h-full w-full object-cover md:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.svg"
        >
          <source src="/videos/mb-hero-mobile.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(198,161,91,.12),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.9)_0%,rgba(0,0,0,.32)_62%,rgba(0,0,0,.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#080808_0%,transparent_44%,rgba(0,0,0,.28)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="shell relative z-10 pb-24 pt-32 md:pb-24"
        >
          <div className="mb-7 flex items-center gap-4">
            <Logo />
            <span className="h-px w-10 bg-[#c6a15b]/50" />
            <p className="eyebrow">{t.hero.tag}</p>
          </div>
          <h1 className="display max-w-5xl text-[clamp(3.1rem,8.5vw,8rem)] leading-[.92] text-white">
            {t.hero.title}
            <br />
            <span className="gold-text">MB</span>
          </h1>
          <p className="mt-7 max-w-lg text-sm leading-7 text-white/65 md:text-base md:leading-8">
            {t.hero.body}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#booking" className="btn-primary">
              <CalendarDays size={16} />
              {t.hero.book}
            </a>
            <a href="#services" className="btn-secondary">
              {t.hero.explore}
              <ArrowDown size={15} />
            </a>
          </div>
          <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/55 backdrop-blur-xl">
            <span
              className={`h-2 w-2 rounded-full ${
                openNow ? "bg-emerald-400 shadow-[0_0_14px_#34d399]" : "bg-white/30"
              }`}
            />
            {openNow ? t.about.open : t.about.closed}
          </div>
        </motion.div>

        <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[.2em] text-white/35 md:flex">
          <span>{t.hero.scroll}</span>
          <ArrowDown size={13} />
        </div>
      </section>

      <section id="services" className="section">
        <div className="shell">
          <SectionHeading tag={t.services.tag} title={t.services.title} body={t.services.body} />
          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeServices.map((service, index) => (
                <motion.a
                  key={service.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.05 }}
                  href="#booking"
                  className="card group relative min-h-52 overflow-hidden rounded-[28px] p-6"
                >
                  <div className="absolute -end-12 -top-12 h-36 w-36 rounded-full bg-[#c6a15b]/5 blur-3xl transition duration-500 group-hover:bg-[#c6a15b]/15" />
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-[#c6a15b]/25 bg-[#c6a15b]/[.07] text-[#d7b66f]">
                    <Scissors size={20} strokeWidth={1.35} />
                  </div>
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
                    <h3 className="text-xl font-medium">
                      {locale === "ar" ? service.nameAr : service.nameEn}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="text-white/25 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#d7b66f]"
                    />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="barbers" className="section bg-[#0c0c0c]">
        <div className="shell">
          <SectionHeading tag={t.barbers.tag} title={t.barbers.title} body={t.barbers.body} />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {activeBarbers.map((barber, index) => (
              <motion.article
                key={barber.id}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.07 }}
                className="group overflow-hidden rounded-[30px] border border-white/10 bg-black"
              >
                <div className="relative aspect-[4/4.65] overflow-hidden bg-[#131313]">
                  <Image
                    src={barber.image || "/images/placeholder.svg"}
                    alt={locale === "ar" ? barber.nameAr : barber.nameEn}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.045]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <span className="glass absolute end-4 top-4 rounded-full px-3 py-1 text-[10px] text-white/60">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl">
                        {locale === "ar" ? barber.nameAr : barber.nameEn}
                      </h3>
                      <p className="mt-1 text-xs text-white/40">
                        {locale === "ar" ? barber.specialtyAr : barber.specialtyEn}
                      </p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#c6a15b] shadow-[0_0_14px_#c6a15b]" />
                  </div>
                  <a href="#booking" className="mt-5 inline-flex items-center gap-2 text-xs text-[#d7b66f]">
                    <CalendarDays size={14} />
                    {t.barbers.available}
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="section overflow-hidden">
        <div className="shell">
          <SectionHeading tag={t.work.tag} title={t.work.title} body={t.work.body} />
          {activeWorks.length ? (
            <>
              <div className="hide-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 md:mx-0 md:grid md:grid-cols-4 md:px-0">
                {activeWorks.map((work, index) => {
                  const cover = work.coverImageUrl || work.coverImage || "/images/placeholder.svg";
                  return (
                    <motion.a
                      key={work.id}
                      {...reveal}
                      transition={{ ...reveal.transition, delay: index * 0.05 }}
                      href={work.reelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-[9/15] min-w-[74vw] snap-center overflow-hidden rounded-[28px] border border-white/10 bg-[#111] sm:min-w-[46vw] md:min-w-0"
                    >
                      <Image
                        src={cover}
                        alt={locale === "ar" ? work.titleAr || t.work.tag : work.titleEn || t.work.tag}
                        fill
                        sizes="(max-width: 767px) 74vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/20" />
                      <span className="absolute start-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur-xl">
                        <Instagram size={16} />
                      </span>
                      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/30 backdrop-blur-xl transition group-hover:scale-110 group-hover:bg-[#c6a15b] group-hover:text-black">
                        <Play size={18} fill="currentColor" />
                      </span>
                      <div className="absolute inset-x-5 bottom-5">
                        <p className="text-sm text-white/90">
                          {locale === "ar" ? work.titleAr || t.work.reel : work.titleEn || t.work.reel}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#d7b66f]">
                          {t.work.reel}
                          <ArrowUpRight size={12} />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
              <div className="mt-7 text-center">
                <a className="btn-secondary" href={settings.instagram} target="_blank" rel="noreferrer">
                  <Instagram size={16} />
                  {t.work.more}
                </a>
              </div>
            </>
          ) : (
            <div className="mt-12 rounded-[28px] border border-dashed border-white/10 bg-white/[.02] p-10 text-center text-sm text-white/40">
              <Instagram className="mx-auto mb-4 text-[#c6a15b]" />
              {t.work.empty}
            </div>
          )}
        </div>
      </section>

      {activeGallery.length > 0 && (
        <section className="section bg-[#0c0c0c]">
          <div className="shell">
            <SectionHeading tag={t.gallery.tag} title={t.gallery.title} body={t.gallery.body} />
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
              {activeGallery.map((item, index) => (
                <motion.button
                  key={item.id}
                  {...reveal}
                  onClick={() => setLightbox(item.imageUrl)}
                  className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-black ${
                    index % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={locale === "ar" ? item.captionAr || "MB" : item.captionEn || "MB"}
                    fill
                    sizes="(max-width: 767px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
                  <span className="glass absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full opacity-0 transition group-hover:opacity-100">
                    <Grid3X3 size={15} />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="about" className="section bg-[#0c0c0c]">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <motion.div {...reveal}>
            <p className="eyebrow">{t.about.tag}</p>
            <h2 className="display mt-5 max-w-2xl text-5xl leading-[1.04] md:text-7xl">
              {t.about.title}
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-8 text-white/58 md:text-base">
              {locale === "ar" ? settings.aboutAr : settings.aboutEn}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#booking" className="btn-primary">
                <CalendarDays size={16} />
                {t.nav.book}
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </motion.div>

          <motion.div {...reveal} className="card rounded-[32px] p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/40">{t.about.hours}</p>
                <h3 className="mt-2 text-2xl">{t.about.daily}</h3>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#c6a15b]/10 text-[#d7b66f]">
                <Clock3 size={21} />
              </div>
            </div>
            <div className="gold-line my-7" />
            <div className="space-y-3">
              {dayNames[locale].map((day, index) => {
                const hours = settings.weeklyHours?.[String(index)] ?? null;
                return (
                  <div key={day} className="flex items-center justify-between gap-5 text-sm">
                    <span className="text-white/48">{day}</span>
                    <span className="text-white/82" dir="ltr">
                      {hours ? `${hours.start} – ${hours.end}` : locale === "ar" ? "مغلق" : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/8 bg-black/25 p-4">
              <span className="text-xs text-white/35">{t.about.timezone}</span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
                  openNow
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/5 text-white/50"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${openNow ? "bg-emerald-400" : "bg-white/30"}`} />
                {openNow ? t.about.open : t.about.closed}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {activeReviews.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHeading tag={t.reviews.tag} title={t.reviews.title} body={t.reviews.body} />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {activeReviews.map((review, index) => (
                <motion.article
                  key={review.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.05 }}
                  className="card rounded-[28px] p-6"
                >
                  <div className="flex gap-1 text-[#d7b66f]">
                    {Array.from({ length: Math.max(1, Math.min(5, review.rating)) }, (_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-6 text-sm leading-7 text-white/65">
                    {locale === "ar" ? review.reviewAr : review.reviewEn}
                  </p>
                  <p className="mt-6 text-sm font-medium text-white/90">{review.name}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <BookingFlowLive locale={locale} />

      <section id="location" className="section">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0e0e0e] p-6 md:p-10">
            <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[#c6a15b]/10 blur-[90px]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_.8fr]">
              <div>
                <p className="eyebrow">{t.location.tag}</p>
                <h2 className="display mt-5 text-5xl md:text-7xl">{t.location.title}</h2>
                <p className="mt-6 max-w-xl text-sm leading-8 text-white/55 md:text-base">
                  {t.location.body}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="btn-primary">
                    <MapPin size={16} />
                    {t.location.maps}
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                    <MessageCircle size={16} />
                    {t.location.whatsapp}
                  </a>
                  <a href={`tel:${settings.phone}`} className="btn-secondary">
                    <Phone size={16} />
                    {t.location.call}
                  </a>
                </div>
              </div>
              <a
                href={settings.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative min-h-72 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(198,161,91,.16),transparent_45%),#090909]"
              >
                <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
                <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#c6a15b] text-black shadow-[0_0_60px_rgba(198,161,91,.35)] transition group-hover:scale-110">
                  <MapPin size={28} />
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
                  <span className="text-sm">MB</span>
                  <ExternalLink size={16} className="text-[#d7b66f]" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#0c0c0c]">
        <div className="shell grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">{t.faq.tag}</p>
            <h2 className="display mt-5 text-5xl leading-[1.05] md:text-6xl">{t.faq.title}</h2>
          </div>
          <div className="space-y-2">
            {t.faq.items.map(([question, answer], index) => (
              <div key={question} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.02]">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-5 p-5 text-start"
                >
                  <span className="text-sm font-medium">{question}</span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-[#d7b66f] transition ${openFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-7 text-white/50">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black pb-28 pt-14 md:pb-12">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
            <div>
              <Logo />
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/42">{t.footer.line}</p>
              <div className="mt-6 flex gap-2">
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="glass grid h-10 w-10 place-items-center rounded-full"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass grid h-10 w-10 place-items-center rounded-full"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href={`tel:${settings.phone}`}
                  className="glass grid h-10 w-10 place-items-center rounded-full"
                  aria-label="Phone"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70">{t.nav.home}</p>
              <div className="mt-4 space-y-3 text-sm text-white/38">
                <a className="block hover:text-white" href="#services">{t.nav.services}</a>
                <a className="block hover:text-white" href="#work">{t.nav.work}</a>
                <a className="block hover:text-white" href="#barbers">{t.nav.barbers}</a>
                <a className="block hover:text-white" href="#booking">{t.nav.book}</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70">MB</p>
              <div className="mt-4 space-y-3 text-sm text-white/38">
                <a className="block hover:text-white" href={`tel:${settings.phone}`}>{settings.displayPhone}</a>
                <a className="block hover:text-white" href={settings.instagram} target="_blank" rel="noreferrer">@mb_barber98</a>
                <a className="block hover:text-white" href={settings.mapUrl} target="_blank" rel="noreferrer">Google Maps</a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/8 pt-6 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} MB. {t.footer.rights}</span>
            <Link href={`/${other}`} className="uppercase tracking-wider hover:text-white">{other}</Link>
          </div>
        </div>
      </footer>

      <MobileBottomNav labels={t.nav} />

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            locale={locale}
            other={other}
            labels={t.nav}
            instagram={settings.instagram}
            whatsapp={whatsappUrl}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-5 backdrop-blur-xl"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute end-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/40"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="relative h-[78vh] w-full max-w-4xl overflow-hidden rounded-[28px]"
              onClick={(event) => event.stopPropagation()}
            >
              <Image src={lightbox} alt="MB Gallery" fill sizes="100vw" className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DesktopNav({
  locale,
  other,
  scrolled,
  instagram,
}: {
  locale: Locale;
  other: Locale;
  scrolled: boolean;
  instagram: string;
}) {
  const t = copy[locale];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 hidden transition-all duration-500 md:block ${
        scrolled
          ? "border-b border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl"
          : "bg-gradient-to-b from-black/45 to-transparent"
      }`}
    >
      <div className="shell flex h-[78px] items-center justify-between">
        <a href="#home"><Logo /></a>
        <nav className="flex items-center gap-5 text-[12px] font-medium text-white/62 lg:gap-7" aria-label="Primary">
          {[
            [t.nav.home, "home"],
            [t.nav.services, "services"],
            [t.nav.work, "work"],
            [t.nav.barbers, "barbers"],
            [t.nav.about, "about"],
            [t.nav.location, "location"],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} className="transition hover:text-white">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={`/${other}`}
            className="grid h-9 min-w-9 place-items-center rounded-full border border-white/15 px-2 text-[11px] font-bold uppercase"
          >
            {other}
          </Link>
          <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/60 hover:text-white">
            <Instagram size={17} />
          </a>
          <a className="btn-primary !min-h-10 !px-5" href="#booking">
            <CalendarDays size={15} />
            {t.nav.book}
          </a>
        </div>
      </div>
    </header>
  );
}

function MobileHeader({ locale, other, onMenu }: { locale: Locale; other: Locale; onMenu: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-5 md:hidden">
      <a href="#home"><Logo compact /></a>
      <div className="flex gap-2">
        <Link href={`/${other}`} className="glass grid h-9 min-w-9 place-items-center rounded-full px-2 text-[11px] font-bold uppercase">
          {other}
        </Link>
        <button onClick={onMenu} className="glass grid h-9 w-9 place-items-center rounded-full" aria-label={locale === "ar" ? "القائمة" : "Menu"}>
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
}

function MobileBottomNav({ labels }: { labels: (typeof copy.ar)["nav"] }) {
  const items = [
    [labels.home, "#home", House],
    [labels.services, "#services", Scissors],
    [labels.book, "#booking", CalendarDays],
    [labels.work, "#work", Play],
    [labels.more, "#about", Sparkles],
  ] as const;
  return (
    <nav className="fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-50 md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto flex max-w-md items-end justify-around rounded-[26px] border border-white/12 bg-[#111]/72 px-2 py-2 shadow-[0_18px_70px_rgba(0,0,0,.5)] backdrop-blur-2xl">
        {items.map(([label, href, Icon], index) => (
          <a
            key={href}
            href={href}
            className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[9px] text-white/46 transition active:scale-95 ${
              index === 2 ? "-mt-7 text-[#0b0b0b]" : ""
            }`}
          >
            {index === 2 ? (
              <span className="grid h-13 w-13 place-items-center rounded-full bg-gradient-to-br from-[#edda9f] to-[#b78b42] shadow-[0_10px_28px_rgba(198,161,91,.35)] ring-4 ring-[#090909]">
                <Icon size={19} />
              </span>
            ) : (
              <Icon size={17} />
            )}
            <span className={index === 2 ? "mt-1 text-[#d9bd79]" : ""}>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function MobileMenu({
  locale,
  other,
  labels,
  instagram,
  whatsapp,
  onClose,
}: {
  locale: Locale;
  other: Locale;
  labels: (typeof copy.ar)["nav"];
  instagram: string;
  whatsapp: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/80 p-4 backdrop-blur-2xl md:hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="mx-auto max-w-md rounded-[30px] border border-white/10 bg-[#111] p-5"
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="mt-8 space-y-2">
          {[
            [labels.home, "#home"],
            [labels.services, "#services"],
            [labels.work, "#work"],
            [labels.barbers, "#barbers"],
            [labels.about, "#about"],
            [labels.location, "#location"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[.025] px-4 py-4 text-sm"
            >
              {label}
              <ArrowUpRight size={15} className="text-[#d7b66f]" />
            </a>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <a href={instagram} target="_blank" rel="noreferrer" className="btn-secondary !px-3">
            <Instagram size={15} />Instagram
          </a>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-secondary !px-3">
            <MessageCircle size={15} />WhatsApp
          </a>
        </div>
        <Link href={`/${other}`} className="mt-4 flex items-center justify-center rounded-2xl border border-white/10 py-3 text-xs uppercase tracking-widest text-white/50">
          {locale === "ar" ? "English" : "العربية"}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <motion.div {...reveal} className="max-w-3xl">
      <p className="eyebrow">{tag}</p>
      <h2 className="display mt-5 text-5xl leading-[1.04] md:text-7xl">{title}</h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/48 md:text-base md:leading-8">{body}</p>
    </motion.div>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-52 animate-pulse rounded-[28px] border border-white/8 bg-white/[.025]" />
      ))}
    </div>
  );
}
