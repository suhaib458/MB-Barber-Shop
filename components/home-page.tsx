"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Aperture as Instagram,
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Crown,
  Droplets,
  Gem,
  House,
  MapPin,
  Menu,
  MessageCircle,
  Play,
  Scissors,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { BookingFlow } from "@/components/booking-flow";
import { Logo } from "@/components/logo";
import { CONTACT, barbers, instagramWorks, services } from "@/data/demo";
import { getDictionary } from "@/i18n/dictionaries";
import { isOpenInAmman } from "@/lib/booking";
import type { Locale } from "@/types";

const icons = { Scissors, Sparkles, Crown, Droplets, Star, Gem };
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};
export function HomePage({ locale }: { locale: Locale }) {
  const d = getDictionary(locale),
    [scrolled, setScrolled] = useState(false),
    [more, setMore] = useState(false),
    [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = d.dir;
    const fn = () => setScrolled(scrollY > 40),
      clock = setTimeout(() => setOpen(isOpenInAmman()), 0);
    fn();
    addEventListener("scroll", fn, { passive: true });
    return () => {
      clearTimeout(clock);
      removeEventListener("scroll", fn);
    };
  }, [locale, d.dir]);
  const other = locale === "ar" ? "en" : "ar";
  return (
    <main dir={d.dir}>
      <header
        className={`fixed inset-x-0 top-0 z-50 hidden transition-all duration-500 md:block ${scrolled ? "border-b border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl" : "bg-transparent"}`}
      >
        <div className="shell flex h-[78px] items-center justify-between">
          <a href="#home">
            <Logo />
          </a>
          <nav
            className="flex items-center gap-5 text-[12px] font-medium text-white/65 lg:gap-7"
            aria-label="Primary"
          >
            {[
              [d.nav.home, "home"],
              [d.nav.services, "services"],
              [d.nav.work, "work"],
              [d.nav.barbers, "barbers"],
              [d.nav.about, "about"],
              [d.nav.location, "location"],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/${other}`}
              className="grid h-9 min-w-9 place-items-center rounded-full border border-white/15 px-2 text-[11px] font-bold uppercase"
            >
              {other}
            </Link>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={17} />
            </a>
            <a className="btn-primary !min-h-10 !px-5" href="#booking">
              {d.nav.book}
            </a>
          </div>
        </div>
      </header>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-5 md:hidden">
        <a href="#home">
          <Logo compact />
        </a>
        <div className="flex gap-2">
          <Link
            href={`/${other}`}
            className="glass grid h-9 min-w-9 place-items-center rounded-full px-2 text-[11px] font-bold uppercase"
          >
            {other}
          </Link>
          <button
            onClick={() => setMore(true)}
            className="glass grid h-9 w-9 place-items-center rounded-full"
            aria-label="Menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>
      <section
        id="home"
        className="noise relative flex min-h-[100svh] items-end overflow-hidden"
      >
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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.9)_0%,rgba(0,0,0,.35)_65%,rgba(0,0,0,.55)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#080808_0%,transparent_42%,rgba(0,0,0,.35)_100%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="shell relative z-10 pb-20 pt-32 md:pb-24"
        >
          <p className="eyebrow mb-5">{d.hero.tag}</p>
          <h1 className="display max-w-4xl text-[clamp(3.4rem,8.5vw,8rem)] leading-[.92] text-white">
            {d.hero.title}
            <br />
            <span className="gold-text">MB</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-white/63 md:text-base">
            {d.hero.body}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#booking" className="btn-primary">
              <CalendarDays size={16} />
              {d.hero.book}
            </a>
            <a href="#services" className="btn-secondary">
              {d.hero.explore}
              <ArrowDown size={15} />
            </a>
          </div>
        </motion.div>
        <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[.2em] text-white/40 md:flex">
          <span>{d.hero.scroll}</span>
          <ArrowDown size={13} />
        </div>
      </section>

      <section id="services" className="section">
        <div className="shell">
          <SectionTitle
            tag={d.services.tag}
            title={d.services.title}
            body={d.services.body}
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = icons[s.icon as keyof typeof icons];
              return (
                <motion.button
                  key={s.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.06 }}
                  onClick={() =>
                    document.querySelector("#booking")?.scrollIntoView()
                  }
                  className="card group relative min-h-48 overflow-hidden rounded-3xl p-6 text-start"
                >
                  <span key="glow" className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-[#c6a15b]/[.06] blur-2xl transition group-hover:bg-[#c6a15b]/15" />
                  <Icon
                    key="icon"
                    size={24}
                    strokeWidth={1.3}
                    className="text-[#d7b66f]"
                  />
                  <div key="label" className="mt-14 flex items-end justify-between">
                    <h3 className="text-xl font-medium">
                      {locale === "ar" ? s.nameAr : s.nameEn}
                    </h3>
                    <ArrowUpRight
                      size={17}
                      className="text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#d7b66f]"
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="barbers" className="section bg-[#0c0c0c]">
        <div className="shell">
          <SectionTitle
            tag={d.barbers.tag}
            title={d.barbers.title}
            body={d.barbers.body}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {barbers.map((b, i) => (
              <motion.article
                key={b.id}
                {...reveal}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-black"
              >
                <div key="portrait" className="relative aspect-[4/4.5] overflow-hidden">
                  <Image
                    src="/images/placeholder.svg"
                    alt={locale === "ar" ? b.nameAr : b.nameEn}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute end-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] text-white/60 backdrop-blur">
                    0{i + 1}
                  </span>
                </div>
                <div key="details" className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-lg">
                      {locale === "ar" ? b.nameAr : b.nameEn}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">
                      {locale === "ar" ? b.specialtyAr : b.specialtyEn}
                    </p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#c6a15b] shadow-[0_0_14px_#c6a15b]" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="section overflow-hidden">
        <div className="shell">
          <SectionTitle
            tag={d.work.tag}
            title={d.work.title}
            body={d.work.body}
          />
          <div className="hide-scrollbar -mx-5 mt-12 flex snap-x gap-4 overflow-x-auto px-5 pb-5 md:mx-0 md:grid md:grid-cols-4 md:px-0">
            {instagramWorks.map((w, i) => (
              <motion.a
                key={w.id}
                {...reveal}
                href={w.reelUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-[9/14] min-w-[72vw] snap-center overflow-hidden rounded-[26px] border border-white/10 sm:min-w-[44vw] md:min-w-0"
              >
                <div
                  key="cover"
                  className={`absolute inset-0 bg-[url('/images/placeholder.svg')] bg-cover bg-center transition duration-700 group-hover:scale-105 ${i % 2 ? "hue-rotate-[8deg]" : ""}`}
                />
                <div key="shade" className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                <span key="demo" className="glass absolute start-4 top-4 rounded-full px-3 py-1 text-[9px] uppercase tracking-wider text-white/60">
                  {d.work.demo}
                </span>
                <span key="play" className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/25 backdrop-blur transition group-hover:scale-110">
                  <Play size={17} fill="white" />
                </span>
                <div key="caption" className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                  <div>
                    <Instagram size={16} className="mb-2 text-[#d7b66f]" />
                    <p className="text-sm">
                      {locale === "ar" ? w.titleAr : w.titleEn}
                    </p>
                  </div>
                  <ArrowUpRight size={17} />
                </div>
              </motion.a>
            ))}
          </div>
          <div className="mt-7 text-center">
            <a
              className="btn-secondary"
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} />
              {d.work.more}
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="section bg-[#0c0c0c]">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <motion.div {...reveal}>
            <p className="eyebrow">{d.about.tag}</p>
            <h2 className="display mt-5 max-w-2xl text-5xl leading-[1.06] md:text-7xl">
              {d.about.title}
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-8 text-white/55 md:text-base">
              {d.about.body}
            </p>
            <div className="mt-10 grid grid-cols-3 gap-2">
              {d.about.stats.map((x, i) => (
                <div key={x} className="border-s border-white/10 px-4">
                  <strong className="gold-text font-serif text-2xl">
                    0{i + 1}
                  </strong>
                  <p className="mt-2 text-[11px] text-white/45">{x}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal} className="card rounded-[32px] p-7 md:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">{d.hours.title}</p>
                <h3 className="mt-2 text-2xl">{d.hours.daily}</h3>
              </div>
              <Clock3 className="text-[#c6a15b]" />
            </div>
            <div className="gold-line my-7" />
            <p className="text-xl md:text-2xl">{d.hours.time}</p>
            <div
              className={`mt-7 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ${open ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/55"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${open ? "bg-emerald-400" : "bg-white/30"}`}
              />
              {open ? d.hours.open : d.hours.closed}
              <span className="text-white/25">· Asia/Amman</span>
            </div>
          </motion.div>
        </div>
      </section>

      <BookingFlow locale={locale} />

      <section id="location" className="section">
        <div className="shell">
          <motion.div
            {...reveal}
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(198,161,91,.14),transparent_40%),#101010] p-7 md:p-14"
          >
            <div className="absolute end-8 top-1/2 hidden -translate-y-1/2 text-[180px] font-black text-white/[.018] md:block">
              MB
            </div>
            <MapPin className="text-[#c6a15b]" />
            <p className="eyebrow mt-7">{d.location.tag}</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">
              {d.location.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
              {d.location.body}
            </p>
            <a
              href={CONTACT.map}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-8"
            >
              <MapPin size={16} />
              {d.location.button}
            </a>
          </motion.div>
        </div>
      </section>

      <section className="section bg-[#0c0c0c]">
        <div className="shell">
          <SectionTitle tag={d.faq.tag} title={d.faq.title} />
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {d.faq.qs.map(([q, a]) => (
              <details key={q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium md:text-base">
                  <span>{q}</span>
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-[#c6a15b] transition group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-2xl pb-6 text-sm leading-7 text-white/50">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 pb-10 pt-14">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
            <div>
              <Logo />
              <p className="mt-5 text-sm text-white/45">{d.footer.line}</p>
            </div>
            <div className="text-sm">
              <p className="mb-4 text-[10px] uppercase tracking-[.2em] text-[#c6a15b]">
                Contact
              </p>
              <a
                className="mb-2 block text-white/60 hover:text-white"
                href={`tel:${CONTACT.phone}`}
              >
                {CONTACT.displayPhone}
              </a>
              <a
                className="mb-2 block text-white/60 hover:text-white"
                href={CONTACT.instagram}
              >
                Instagram
              </a>
              <a
                className="block text-white/60 hover:text-white"
                href={CONTACT.map}
              >
                {d.nav.location}
              </a>
            </div>
            <div className="text-sm">
              <p className="mb-4 text-[10px] uppercase tracking-[.2em] text-[#c6a15b]">
                {d.hours.title}
              </p>
              <p className="text-white/60">{d.hours.daily}</p>
              <p className="mt-1 text-white/35">{d.hours.time}</p>
            </div>
          </div>
          <div className="gold-line my-10" />
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/30">
            <p>
              © 2026 MB. {d.footer.rights}
            </p>
            <Link href="/admin/login" className="hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      <a
        href={`https://wa.me/962792398952?text=${encodeURIComponent(locale === "ar" ? "مرحباً MB، أود الاستفسار عن الحجز." : "Hello MB, I would like to ask about booking.")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 end-5 z-40 hidden h-11 w-11 place-items-center rounded-full bg-[#1fae5b] text-white shadow-xl md:grid"
        aria-label="WhatsApp"
      >
        <MessageCircle size={19} />
      </a>
      <nav className="glass fixed bottom-[calc(10px+env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[430px] -translate-x-1/2 items-center justify-around rounded-[24px] px-2 py-2 shadow-2xl md:hidden">
        {[
          [d.nav.home, "#home", House],
          [d.nav.services, "#services", Scissors],
          [d.nav.book, "#booking", CalendarDays],
          [d.nav.work, "#work", Instagram],
          [locale === "ar" ? "المزيد" : "More", "#", Menu],
        ].map(([label, href, Icon], i) => (
          <a
            key={String(label)}
            href={String(href)}
            onClick={
              i === 4
                ? (e) => {
                    e.preventDefault();
                    setMore(true);
                  }
                : undefined
            }
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[9px] ${i === 2 ? "bg-[#c6a15b] text-black" : "text-white/50"}`}
          >
            <Icon size={i === 2 ? 19 : 17} />
            <span>{String(label)}</span>
          </a>
        ))}
      </nav>
      {more && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMore(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-t border-white/10 bg-[#101010] p-6 pb-[calc(30px+env(safe-area-inset-bottom))]"
          >
            <div className="mb-7 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMore(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            {[
              [d.nav.barbers, "#barbers", UsersRound],
              [d.nav.about, "#about", UserRound],
              [d.nav.location, "#location", MapPin],
            ].map(([label, href, Icon]) => (
              <a
                key={String(label)}
                href={String(href)}
                onClick={() => setMore(false)}
                className="flex items-center justify-between border-b border-white/10 py-5"
              >
                <span>{String(label)}</span>
                <Icon size={18} className="text-[#c6a15b]" />
              </a>
            ))}
            <a
              className="btn-primary mt-6 w-full"
              href={`tel:${CONTACT.phone}`}
            >
              {CONTACT.displayPhone}
            </a>
          </motion.div>
        </div>
      )}
    </main>
  );
}
function SectionTitle({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body?: string;
}) {
  return (
    <motion.div
      {...reveal}
      className="grid gap-5 md:grid-cols-[1fr_.75fr] md:items-end"
    >
      <div>
        <p className="eyebrow">{tag}</p>
        <h2 className="display mt-4 max-w-2xl text-5xl leading-[1.04] md:text-7xl">
          {title}
        </h2>
      </div>
      {body && (
        <p className="max-w-md text-sm leading-7 text-white/48 md:justify-self-end">
          {body}
        </p>
      )}
    </motion.div>
  );
}
