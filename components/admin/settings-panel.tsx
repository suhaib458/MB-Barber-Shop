"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { LoaderCircle, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultBusinessSettings } from "@/hooks/use-mb-content";
import { db } from "@/lib/firebase/client";
import type { BusinessSettings, SpecialHours, WorkingHours } from "@/types";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function SettingsPanel() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [loading, setLoading] = useState(Boolean(db));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      doc(db, "businessSettings", "main"),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...defaultBusinessSettings, ...snap.data() } as BusinessSettings);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function save() {
    if (!db) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(
        doc(db, "businessSettings", "main"),
        { ...settings, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function setHours(day: number, value: WorkingHours) {
    setSettings((current) => ({
      ...current,
      weeklyHours: { ...current.weeklyHours, [String(day)]: value },
    }));
  }

  function addSpecial() {
    setSettings((current) => ({
      ...current,
      specialHours: [
        ...(current.specialHours || []),
        { date: "", closed: true, noteAr: "", noteEn: "" },
      ],
    }));
  }

  function patchSpecial(index: number, patch: Partial<SpecialHours>) {
    setSettings((current) => ({
      ...current,
      specialHours: current.specialHours.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removeSpecial(index: number) {
    setSettings((current) => ({
      ...current,
      specialHours: current.specialHours.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  if (!db) {
    return <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-5 text-sm text-amber-100/80">Configure Firebase environment variables to edit live business settings.</div>;
  }

  if (loading) return <LoaderCircle className="animate-spin text-[#c6a15b]" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Business settings</h2>
        <p className="mt-1 text-xs text-white/35">Control contact details, bilingual About copy, shop hours and exceptional closures from one place.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h3 className="text-sm font-medium">Contact & links</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Display phone"><input className="admin-input" dir="ltr" value={settings.displayPhone} onChange={(event) => setSettings((current) => ({ ...current, displayPhone: event.target.value }))} /></Field>
          <Field label="Canonical phone"><input className="admin-input" dir="ltr" value={settings.phone} onChange={(event) => setSettings((current) => ({ ...current, phone: event.target.value }))} /></Field>
          <Field label="WhatsApp number"><input className="admin-input" dir="ltr" value={settings.whatsapp} onChange={(event) => setSettings((current) => ({ ...current, whatsapp: event.target.value }))} /></Field>
          <Field label="Instagram URL"><input className="admin-input" dir="ltr" value={settings.instagram} onChange={(event) => setSettings((current) => ({ ...current, instagram: event.target.value }))} /></Field>
          <div className="md:col-span-2">
            <Field label="Google Maps URL"><input className="admin-input" dir="ltr" value={settings.mapUrl} onChange={(event) => setSettings((current) => ({ ...current, mapUrl: event.target.value }))} /></Field>
            <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-[#d7b66f]"><MapPin size={13} />Open current map link</a>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h3 className="text-sm font-medium">About MB</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Arabic"><textarea dir="rtl" rows={6} className="admin-input !h-auto py-3" value={settings.aboutAr} onChange={(event) => setSettings((current) => ({ ...current, aboutAr: event.target.value }))} /></Field>
          <Field label="English"><textarea rows={6} className="admin-input !h-auto py-3" value={settings.aboutEn} onChange={(event) => setSettings((current) => ({ ...current, aboutEn: event.target.value }))} /></Field>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-medium">Weekly opening hours</h3>
            <p className="mt-1 text-xs text-white/30">Public “Open now” status uses Asia/Amman time.</p>
          </div>
          <button
            onClick={() => setSettings((current) => ({ ...current, temporarilyClosed: !current.temporarilyClosed }))}
            className={`rounded-full px-4 py-2 text-xs ${settings.temporarilyClosed ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}
          >
            {settings.temporarilyClosed ? "Temporarily closed" : "Shop open by schedule"}
          </button>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-2">
          {dayNames.map((day, index) => {
            const hours = settings.weeklyHours?.[String(index)] ?? null;
            return (
              <div key={day} className="rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">{day}</span>
                  <button
                    type="button"
                    onClick={() => setHours(index, hours ? null : { start: "11:00", end: "23:00" })}
                    className={`rounded-full px-2.5 py-1 text-[10px] ${hours ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/30"}`}
                  >{hours ? "Open" : "Closed"}</button>
                </div>
                {hours && (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="time" className="admin-input !h-9 !px-2 text-xs" value={hours.start} onChange={(event) => setHours(index, { ...hours, start: event.target.value })} />
                    <input type="time" className="admin-input !h-9 !px-2 text-xs" value={hours.end} onChange={(event) => setHours(index, { ...hours, end: event.target.value })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">Special dates</h3>
            <p className="mt-1 text-xs text-white/30">Use for holidays, one-off closures, or exceptional opening hours.</p>
          </div>
          <button onClick={addSpecial} className="btn-secondary !min-h-10 !px-4"><Plus size={14} />Add date</button>
        </div>
        <div className="mt-5 space-y-3">
          {settings.specialHours?.map((item, index) => (
            <div key={`${item.date}-${index}`} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end">
                <Field label="Date"><input type="date" className="admin-input" value={item.date} onChange={(event) => patchSpecial(index, { date: event.target.value })} /></Field>
                <button onClick={() => patchSpecial(index, { closed: !item.closed })} className={`h-11 rounded-xl px-4 text-xs ${item.closed ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}>{item.closed ? "Closed" : "Custom hours"}</button>
                <Field label="Start"><input type="time" className="admin-input" disabled={item.closed} value={item.start || "11:00"} onChange={(event) => patchSpecial(index, { start: event.target.value })} /></Field>
                <Field label="End"><input type="time" className="admin-input" disabled={item.closed} value={item.end || "23:00"} onChange={(event) => patchSpecial(index, { end: event.target.value })} /></Field>
                <button onClick={() => removeSpecial(index)} className="admin-icon h-11 hover:!text-red-300" title="Remove"><Trash2 size={15} /></button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input dir="rtl" className="admin-input" placeholder="ملاحظة بالعربية (اختياري)" value={item.noteAr || ""} onChange={(event) => patchSpecial(index, { noteAr: event.target.value })} />
                <input className="admin-input" placeholder="English note (optional)" value={item.noteEn || ""} onChange={(event) => patchSpecial(index, { noteEn: event.target.value })} />
              </div>
            </div>
          ))}
          {!settings.specialHours?.length && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/30">No special dates configured.</div>}
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-black/75 p-3 backdrop-blur-xl">
        {saved && <span className="text-xs text-emerald-300">Settings saved.</span>}
        <button onClick={() => void save()} disabled={saving} className="btn-primary !min-h-11">
          {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
          Save settings
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs text-white/45"><span className="mb-2 block">{label}</span>{children}</label>;
}
