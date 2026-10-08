"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { barbers as defaultBarbers } from "@/data/demo";
import { db } from "@/lib/firebase/client";
import { uploadAdminImage } from "@/lib/media/upload";
import type { Barber, WorkingHours } from "@/types";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const defaultSchedule: Record<string, WorkingHours> = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => [
    String(index),
    { start: "11:00", end: "23:00" },
  ]),
);

function blankBarber(sortOrder = 1): Barber {
  return {
    id: "",
    nameAr: "",
    nameEn: "",
    specialtyAr: "فريق MB",
    specialtyEn: "MB Team",
    image: "",
    active: true,
    sortOrder,
    workSchedule: { ...defaultSchedule },
    unavailableDates: [],
    unavailableTimeSlots: [],
  };
}

export function BarbersPanel() {
  const [items, setItems] = useState<Barber[]>([]);
  const [form, setForm] = useState<Barber>(blankBarber());
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [datesText, setDatesText] = useState("");
  const [slotsText, setSlotsText] = useState("");

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "barbers"), orderBy("sortOrder", "asc")),
      (snap) => {
        setItems(
          snap.docs.map(
            (item) => ({ id: item.id, ...item.data() }) as Barber,
          ),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  function edit(item: Barber) {
    setEditing(item.id);
    setForm({
      ...item,
      workSchedule: { ...defaultSchedule, ...(item.workSchedule || {}) },
      unavailableDates: item.unavailableDates || [],
      unavailableTimeSlots: item.unavailableTimeSlots || [],
    });
    setDatesText((item.unavailableDates || []).join("\n"));
    setSlotsText((item.unavailableTimeSlots || []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm(blankBarber(items.length + 1));
    setDatesText("");
    setSlotsText("");
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, "barbers");
      setForm((current) => ({ ...current, image: url }));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!db || !form.nameAr.trim() || !form.nameEn.trim()) return;
    setSaving(true);
    try {
      const id = editing || `barber-${Date.now()}`;
      await setDoc(
        doc(db, "barbers", id),
        {
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          specialtyAr: form.specialtyAr.trim() || "فريق MB",
          specialtyEn: form.specialtyEn.trim() || "MB Team",
          image: form.image || "",
          active: form.active,
          sortOrder: editing ? form.sortOrder : items.length + 1,
          workSchedule: form.workSchedule,
          unavailableDates: splitValues(datesText),
          unavailableTimeSlots: splitValues(slotsText),
        },
        { merge: true },
      );
      reset();
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Barber) {
    if (
      !db ||
      !window.confirm(
        `Delete ${item.nameEn}? Existing bookings will keep their saved barber name.`,
      )
    )
      return;
    await deleteDoc(doc(db, "barbers", item.id));
  }

  async function move(index: number, direction: -1 | 1) {
    if (!db) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "barbers", items[index].id), {
      sortOrder: target + 1,
    });
    batch.update(doc(db, "barbers", items[target].id), {
      sortOrder: index + 1,
    });
    await batch.commit();
  }

  async function seedDefaults() {
    const firestore = db;
    if (
      !firestore ||
      items.length ||
      !window.confirm("Add the three placeholder MB barber records?")
    )
      return;
    const batch = writeBatch(firestore);
    defaultBarbers.forEach((item) => {
      const { id, ...payload } = item;
      batch.set(doc(firestore, "barbers", id), payload);
    });
    await batch.commit();
  }

  function setHours(day: number, value: WorkingHours) {
    setForm((current) => ({
      ...current,
      workSchedule: { ...current.workSchedule, [String(day)]: value },
    }));
  }

  if (!db) return <FirebaseNotice />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Barbers</h2>
        <p className="mt-1 text-xs text-white/35">
          Manage identities, photos, weekly schedules, unavailable dates and
          blocked time slots.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Arabic name">
            <input
              dir="rtl"
              className="admin-input"
              value={form.nameAr}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nameAr: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="English name">
            <input
              className="admin-input"
              value={form.nameEn}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  nameEn: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Arabic specialty">
            <input
              dir="rtl"
              className="admin-input"
              value={form.specialtyAr}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specialtyAr: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="English specialty">
            <input
              className="admin-input"
              value={form.specialtyEn}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specialtyEn: event.target.value,
                }))
              }
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[180px_1fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <Image
                src={form.image || "/images/placeholder.svg"}
                alt="Barber preview"
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <label className="btn-secondary mt-3 w-full cursor-pointer !min-h-10 !px-3">
              {uploading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </label>
            <input
              className="admin-input mt-3 !h-10 text-xs"
              value={form.image || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  image: event.target.value,
                }))
              }
              placeholder="Or paste image URL"
            />
            <p className="mt-2 text-[10px] leading-4 text-white/30">
              Upload uses the configured external media service, not Firebase
              Storage.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs text-white/45">Weekly schedule</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {dayNames.map((day, index) => {
                const hours = form.workSchedule?.[String(index)] ?? null;
                return (
                  <div
                    key={day}
                    className="rounded-xl border border-white/10 bg-black/25 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-white/60">{day}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setHours(
                            index,
                            hours ? null : { start: "11:00", end: "23:00" },
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-[10px] ${hours ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/30"}`}
                      >
                        {hours ? "Working" : "Off"}
                      </button>
                    </div>
                    {hours && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          className="admin-input !h-9 !px-2 text-xs"
                          value={hours.start}
                          onChange={(event) =>
                            setHours(index, {
                              ...hours,
                              start: event.target.value,
                            })
                          }
                        />
                        <input
                          type="time"
                          className="admin-input !h-9 !px-2 text-xs"
                          value={hours.end}
                          onChange={(event) =>
                            setHours(index, {
                              ...hours,
                              end: event.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Unavailable dates — one YYYY-MM-DD per line">
            <textarea
              rows={4}
              className="admin-input !h-auto py-3 font-mono text-xs"
              value={datesText}
              onChange={(event) => setDatesText(event.target.value)}
              placeholder={"2026-10-12\n2026-10-18"}
            />
          </Field>
          <Field label="Blocked recurring times — comma or line separated">
            <textarea
              rows={4}
              className="admin-input !h-auto py-3 font-mono text-xs"
              value={slotsText}
              onChange={(event) => setSlotsText(event.target.value)}
              placeholder="13:00, 13:30"
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => void save()}
            disabled={saving || uploading}
            className="btn-primary !min-h-11"
          >
            {saving ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : editing ? (
              <Save size={15} />
            ) : (
              <Plus size={15} />
            )}
            {editing ? "Save barber" : "Add barber"}
          </button>
          {editing && (
            <button onClick={reset} className="btn-secondary !min-h-11">
              <X size={15} /> Cancel
            </button>
          )}
          {!items.length && !loading && (
            <button
              onClick={() => void seedDefaults()}
              className="btn-secondary !min-h-11"
            >
              Seed 3 placeholders
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoaderCircle className="animate-spin text-[#c6a15b]" />
      ) : items.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.02] p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/30">
                <Image
                  src={item.image || "/images/placeholder.svg"}
                  alt={item.nameEn}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.nameEn}</p>
                    <p className="mt-1 text-xs text-white/35" dir="rtl">
                      {item.nameAr}
                    </p>
                    <p className="mt-2 text-[11px] text-[#d7b66f]">
                      {item.specialtyEn}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] ${item.active ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/30"}`}
                  >
                    {item.active ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => void move(index, -1)}
                    disabled={index === 0}
                    className="admin-icon"
                    title="Move up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => void move(index, 1)}
                    disabled={index === items.length - 1}
                    className="admin-icon"
                    title="Move down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    onClick={() =>
                      db &&
                      updateDoc(doc(db, "barbers", item.id), {
                        active: !item.active,
                      })
                    }
                    className="admin-icon"
                    title="Toggle"
                  >
                    <Power size={15} />
                  </button>
                  <button
                    onClick={() => edit(item)}
                    className="admin-icon"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => void remove(item)}
                    className="admin-icon hover:!text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="No barbers in Firebase yet." />
      )}
    </div>
  );
}

function splitValues(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs text-white/45">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">
      {text}
    </div>
  );
}

function FirebaseNotice() {
  return (
    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-5 text-sm text-amber-100/80">
      Configure Firebase environment variables to manage live barbers.
    </div>
  );
}
