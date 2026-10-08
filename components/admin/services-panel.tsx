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
import { ArrowDown, ArrowUp, LoaderCircle, Pencil, Plus, Power, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { services as defaultServices } from "@/data/demo";
import { db } from "@/lib/firebase/client";
import type { Service } from "@/types";

const emptyService: Service = {
  id: "",
  nameAr: "",
  nameEn: "",
  icon: "Scissors",
  active: true,
  sortOrder: 1,
};

export function ServicesPanel() {
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState<Service>(emptyService);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "services"), orderBy("sortOrder", "asc")),
      (snap) => {
        setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Service));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function save() {
    if (!db || !form.nameAr.trim() || !form.nameEn.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const id = editing || slugify(form.nameEn) || `service-${Date.now()}`;
      await setDoc(
        doc(db, "services", id),
        {
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          icon: form.icon || "Scissors",
          active: form.active,
          sortOrder: editing ? form.sortOrder : items.length + 1,
        },
        { merge: true },
      );
      setMessage(editing ? "Service updated." : "Service added.");
      reset();
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Service) {
    setEditing(item.id);
    setForm(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm({ ...emptyService, sortOrder: items.length + 1 });
  }

  async function remove(item: Service) {
    if (!db || !window.confirm(`Delete ${item.nameEn}?`)) return;
    await deleteDoc(doc(db, "services", item.id));
  }

  async function move(index: number, direction: -1 | 1) {
    if (!db) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "services", items[index].id), { sortOrder: target + 1 });
    batch.update(doc(db, "services", items[target].id), { sortOrder: index + 1 });
    await batch.commit();
  }

  async function seedDefaults() {
    if (!db || items.length || !window.confirm("Add the six default MB services to Firebase?")) return;
    const batch = writeBatch(db);
    defaultServices.forEach((item) => {
      const { id, ...payload } = item;
      batch.set(doc(db, "services", id), payload);
    });
    await batch.commit();
  }

  if (!db) return <FirebaseNotice />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Services</h2>
        <p className="mt-1 text-xs text-white/35">Manage bilingual services shown publicly and in the booking flow. Pricing and durations remain hidden.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Arabic name">
            <input
              dir="rtl"
              value={form.nameAr}
              onChange={(event) => setForm((current) => ({ ...current, nameAr: event.target.value }))}
              className="admin-input"
              placeholder="قص شعر"
            />
          </Field>
          <Field label="English name">
            <input
              value={form.nameEn}
              onChange={(event) => setForm((current) => ({ ...current, nameEn: event.target.value }))}
              className="admin-input"
              placeholder="Haircut"
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => void save()} disabled={saving} className="btn-primary !min-h-11">
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : editing ? <Save size={15} /> : <Plus size={15} />}
            {editing ? "Save changes" : "Add service"}
          </button>
          {editing && (
            <button onClick={reset} className="btn-secondary !min-h-11">
              <X size={15} />Cancel
            </button>
          )}
          {!items.length && !loading && (
            <button onClick={() => void seedDefaults()} className="btn-secondary !min-h-11">Seed MB defaults</button>
          )}
          {message && <span className="text-xs text-emerald-300">{message}</span>}
        </div>
      </div>

      {loading ? (
        <LoaderCircle className="animate-spin text-[#c6a15b]" />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.02] p-4 sm:flex-row sm:items-center">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c6a15b]/10 text-[#d7b66f]">
                <span className="text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.nameEn}</p>
                <p dir="rtl" className="mt-1 text-xs text-white/35">{item.nameAr}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => void move(index, -1)} disabled={index === 0} className="admin-icon" title="Move up"><ArrowUp size={15} /></button>
                <button onClick={() => void move(index, 1)} disabled={index === items.length - 1} className="admin-icon" title="Move down"><ArrowDown size={15} /></button>
                <button
                  onClick={() => db && updateDoc(doc(db, "services", item.id), { active: !item.active })}
                  className={`admin-icon ${item.active ? "text-emerald-300" : "text-white/30"}`}
                  title={item.active ? "Disable" : "Enable"}
                ><Power size={15} /></button>
                <button onClick={() => edit(item)} className="admin-icon" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => void remove(item)} className="admin-icon hover:!text-red-300" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="No services in Firebase yet." />
      )}
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs text-white/45"><span className="mb-2 block">{label}</span>{children}</label>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">{text}</div>;
}

function FirebaseNotice() {
  return <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-5 text-sm text-amber-100/80">Configure Firebase environment variables to manage live content.</div>;
}
