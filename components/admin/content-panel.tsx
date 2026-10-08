"use client";

import Image from "next/image";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Aperture as Instagram,
  LoaderCircle,
  MessageSquareQuote,
  Pencil,
  Plus,
  Power,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { db, storage } from "@/lib/firebase/client";
import type { GalleryItem, InstagramWork, Review } from "@/types";

type ContentTab = "reels" | "gallery" | "reviews";

export function ContentPanel() {
  const [tab, setTab] = useState<ContentTab>("reels");
  if (!db) return <FirebaseNotice />;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Content</h2>
        <p className="mt-1 text-xs text-white/35">Manage Instagram Reel cards, gallery images and real customer reviews.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {([
          ["reels", "Instagram Reels", Instagram],
          ["gallery", "Gallery", ImagePlus],
          ["reviews", "Reviews", MessageSquareQuote],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition ${tab === id ? "bg-[#c6a15b] text-black" : "border border-white/10 bg-white/[.03] text-white/50 hover:text-white"}`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      {tab === "reels" && <ReelsManager />}
      {tab === "gallery" && <GalleryManager />}
      {tab === "reviews" && <ReviewsManager />}
    </div>
  );
}

function ReelsManager() {
  const [items, setItems] = useState<InstagramWork[]>([]);
  const [form, setForm] = useState({ reelUrl: "", titleAr: "", titleEn: "", coverImageUrl: "", active: true });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "instagramWorks"), orderBy("order", "asc")),
      (snap) => {
        setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as InstagramWork));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function upload(file?: File) {
    if (!file || !storage) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      window.alert("Choose an image smaller than 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const storageRef = ref(storage, `public/reels/${Date.now()}-${safeName(file.name)}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setForm((current) => ({ ...current, coverImageUrl: url }));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!db || !isInstagramUrl(form.reelUrl)) {
      window.alert("Enter a valid Instagram URL.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        reelUrl: form.reelUrl.trim(),
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim(),
        coverImageUrl: form.coverImageUrl,
        active: form.active,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, "instagramWorks", editing), payload);
      } else {
        await addDoc(collection(db, "instagramWorks"), {
          ...payload,
          order: items.length + 1,
          createdAt: serverTimestamp(),
        });
      }
      reset();
    } finally {
      setSaving(false);
    }
  }

  function edit(item: InstagramWork) {
    setEditing(item.id);
    setForm({
      reelUrl: item.reelUrl,
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || "",
      coverImageUrl: item.coverImageUrl || item.coverImage || "",
      active: item.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm({ reelUrl: "", titleAr: "", titleEn: "", coverImageUrl: "", active: true });
  }

  async function remove(item: InstagramWork) {
    if (!db || !window.confirm("Delete this Reel card? The Instagram Reel itself will not be affected.")) return;
    await deleteDoc(doc(db, "instagramWorks", item.id));
  }

  async function move(index: number, direction: -1 | 1) {
    if (!db) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "instagramWorks", items[index].id), { order: target + 1 });
    batch.update(doc(db, "instagramWorks", items[target].id), { order: index + 1 });
    await batch.commit();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram Reel URL">
            <input className="admin-input" value={form.reelUrl} onChange={(event) => setForm((current) => ({ ...current, reelUrl: event.target.value }))} placeholder="https://www.instagram.com/reel/..." />
          </Field>
          <div className="md:row-span-2">
            <Field label="Cover image">
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <div className="relative aspect-[9/14] overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <Image src={form.coverImageUrl || "/images/placeholder.svg"} alt="Reel cover preview" fill sizes="110px" className="object-cover" />
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 bg-white/[.02] px-4 text-xs text-white/45 hover:border-[#c6a15b]/40 hover:text-white">
                  {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  Upload cover
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} />
                </label>
              </div>
            </Field>
          </div>
          <Field label="Arabic title (optional)"><input dir="rtl" className="admin-input" value={form.titleAr} onChange={(event) => setForm((current) => ({ ...current, titleAr: event.target.value }))} /></Field>
          <Field label="English title (optional)"><input className="admin-input" value={form.titleEn} onChange={(event) => setForm((current) => ({ ...current, titleEn: event.target.value }))} /></Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving || uploading} className="btn-primary !min-h-11">
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : editing ? <Save size={15} /> : <Plus size={15} />}
            {editing ? "Save Reel" : "Add Reel"}
          </button>
          {editing && <button onClick={reset} className="btn-secondary !min-h-11"><X size={15} />Cancel</button>}
        </div>
      </div>

      {loading ? <LoaderCircle className="animate-spin text-[#c6a15b]" /> : items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.02]">
              <div className="relative aspect-[9/10] bg-black/30">
                <Image src={item.coverImageUrl || item.coverImage || "/images/placeholder.svg"} alt={item.titleEn || "Instagram Reel"} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] text-white/60 backdrop-blur">#{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{item.titleEn || "Instagram Reel"}</p>
                    <p className="mt-1 truncate text-xs text-white/35" dir="rtl">{item.titleAr || "عمل من MB"}</p>
                  </div>
                  <a href={item.reelUrl} target="_blank" rel="noreferrer" className="admin-icon" title="Open Reel"><ExternalLink size={15} /></a>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => void move(index, -1)} disabled={index === 0} className="admin-icon"><ArrowUp size={15} /></button>
                  <button onClick={() => void move(index, 1)} disabled={index === items.length - 1} className="admin-icon"><ArrowDown size={15} /></button>
                  <button onClick={() => db && updateDoc(doc(db, "instagramWorks", item.id), { active: !item.active, updatedAt: serverTimestamp() })} className={`admin-icon ${item.active ? "text-emerald-300" : "text-white/30"}`}><Power size={15} /></button>
                  <button onClick={() => edit(item)} className="admin-icon"><Pencil size={15} /></button>
                  <button onClick={() => void remove(item)} className="admin-icon hover:!text-red-300"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty text="No Reel cards yet. Add real MB Reel links above." />}
    </div>
  );
}

function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [captionAr, setCaptionAr] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "gallery"), orderBy("order", "asc")),
      (snap) => {
        setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as GalleryItem));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function upload(file?: File) {
    if (!file || !storage) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      window.alert("Choose an image smaller than 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const storageRef = ref(storage, `public/gallery/${Date.now()}-${safeName(file.name)}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      setImageUrl(await getDownloadURL(storageRef));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!db || !imageUrl) {
      window.alert("Upload an image first.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        imageUrl,
        captionAr: captionAr.trim(),
        captionEn: captionEn.trim(),
        active: true,
        updatedAt: serverTimestamp(),
      };
      if (editing) await updateDoc(doc(db, "gallery", editing), payload);
      else await addDoc(collection(db, "gallery"), { ...payload, order: items.length + 1, createdAt: serverTimestamp() });
      reset();
    } finally {
      setSaving(false);
    }
  }

  function edit(item: GalleryItem) {
    setEditing(item.id);
    setImageUrl(item.imageUrl);
    setCaptionAr(item.captionAr || "");
    setCaptionEn(item.captionEn || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setImageUrl("");
    setCaptionAr("");
    setCaptionEn("");
  }

  async function move(index: number, direction: -1 | 1) {
    if (!db) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "gallery", items[index].id), { order: target + 1 });
    batch.update(doc(db, "gallery", items[target].id), { order: index + 1 });
    await batch.commit();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <Image src={imageUrl || "/images/placeholder.svg"} alt="Gallery preview" fill sizes="180px" className="object-cover" />
            </div>
            <label className="btn-secondary mt-3 w-full cursor-pointer !min-h-10 !px-3">
              {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              Upload image
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} />
            </label>
          </div>
          <div className="space-y-4">
            <Field label="Arabic caption (optional)"><input dir="rtl" className="admin-input" value={captionAr} onChange={(event) => setCaptionAr(event.target.value)} /></Field>
            <Field label="English caption (optional)"><input className="admin-input" value={captionEn} onChange={(event) => setCaptionEn(event.target.value)} /></Field>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => void save()} disabled={saving || uploading} className="btn-primary !min-h-11">
                {saving ? <LoaderCircle size={15} className="animate-spin" /> : editing ? <Save size={15} /> : <Plus size={15} />}
                {editing ? "Save image" : "Add to gallery"}
              </button>
              {editing && <button onClick={reset} className="btn-secondary !min-h-11"><X size={15} />Cancel</button>}
            </div>
          </div>
        </div>
      </div>

      {loading ? <LoaderCircle className="animate-spin text-[#c6a15b]" /> : items.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.02]">
              <div className="relative aspect-[4/5]">
                <Image src={item.imageUrl} alt={item.captionEn || "MB Gallery"} fill sizes="25vw" className="object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-white/55">{item.captionEn || "MB Gallery"}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button onClick={() => void move(index, -1)} disabled={index === 0} className="admin-icon"><ArrowUp size={14} /></button>
                  <button onClick={() => void move(index, 1)} disabled={index === items.length - 1} className="admin-icon"><ArrowDown size={14} /></button>
                  <button onClick={() => db && updateDoc(doc(db, "gallery", item.id), { active: !item.active, updatedAt: serverTimestamp() })} className={`admin-icon ${item.active ? "text-emerald-300" : "text-white/30"}`}><Power size={14} /></button>
                  <button onClick={() => edit(item)} className="admin-icon"><Pencil size={14} /></button>
                  <button onClick={() => db && window.confirm("Delete this gallery image record?") && deleteDoc(doc(db, "gallery", item.id))} className="admin-icon hover:!text-red-300"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty text="No gallery images yet." />}
    </div>
  );
}

function ReviewsManager() {
  const [items, setItems] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: "", reviewAr: "", reviewEn: "", rating: 5 });
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      query(collection(db, "reviews"), orderBy("order", "asc")),
      (snap) => {
        setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Review));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  async function save() {
    if (!db || !form.name.trim() || !form.reviewAr.trim() || !form.reviewEn.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        reviewAr: form.reviewAr.trim(),
        reviewEn: form.reviewEn.trim(),
        rating: Math.max(1, Math.min(5, form.rating)),
        active: true,
        updatedAt: serverTimestamp(),
      };
      if (editing) await updateDoc(doc(db, "reviews", editing), payload);
      else await addDoc(collection(db, "reviews"), { ...payload, order: items.length + 1, createdAt: serverTimestamp() });
      reset();
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Review) {
    setEditing(item.id);
    setForm({ name: item.name, reviewAr: item.reviewAr, reviewEn: item.reviewEn, rating: item.rating });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm({ name: "", reviewAr: "", reviewEn: "", rating: 5 });
  }

  async function move(index: number, direction: -1 | 1) {
    if (!db) return;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const batch = writeBatch(db);
    batch.update(doc(db, "reviews", items[index].id), { order: target + 1 });
    batch.update(doc(db, "reviews", items[target].id), { order: index + 1 });
    await batch.commit();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Customer name"><input className="admin-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
          <Field label="Rating">
            <select className="admin-input" value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value} className="bg-[#111]">{value} / 5</option>)}
            </select>
          </Field>
          <Field label="Arabic review"><textarea dir="rtl" rows={5} className="admin-input !h-auto py-3" value={form.reviewAr} onChange={(event) => setForm((current) => ({ ...current, reviewAr: event.target.value }))} /></Field>
          <Field label="English review"><textarea rows={5} className="admin-input !h-auto py-3" value={form.reviewEn} onChange={(event) => setForm((current) => ({ ...current, reviewEn: event.target.value }))} /></Field>
        </div>
        <p className="mt-3 text-[11px] text-amber-200/60">Publish only genuine customer feedback. The public site hides this section when no active reviews exist.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => void save()} disabled={saving} className="btn-primary !min-h-11">
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : editing ? <Save size={15} /> : <Plus size={15} />}
            {editing ? "Save review" : "Add review"}
          </button>
          {editing && <button onClick={reset} className="btn-secondary !min-h-11"><X size={15} />Cancel</button>}
        </div>
      </div>

      {loading ? <LoaderCircle className="animate-spin text-[#c6a15b]" /> : items.length ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.02] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{item.name}</p>
                    <span className="flex gap-0.5 text-[#d7b66f]">{Array.from({ length: item.rating }, (_, i) => <Star key={i} size={12} fill="currentColor" />)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/55">{item.reviewEn}</p>
                  <p dir="rtl" className="mt-2 text-sm leading-6 text-white/40">{item.reviewAr}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => void move(index, -1)} disabled={index === 0} className="admin-icon"><ArrowUp size={14} /></button>
                  <button onClick={() => void move(index, 1)} disabled={index === items.length - 1} className="admin-icon"><ArrowDown size={14} /></button>
                  <button onClick={() => db && updateDoc(doc(db, "reviews", item.id), { active: !item.active, updatedAt: serverTimestamp() })} className={`admin-icon ${item.active ? "text-emerald-300" : "text-white/30"}`}><Power size={14} /></button>
                  <button onClick={() => edit(item)} className="admin-icon"><Pencil size={14} /></button>
                  <button onClick={() => db && window.confirm("Delete this review?") && deleteDoc(doc(db, "reviews", item.id))} className="admin-icon hover:!text-red-300"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty text="No reviews yet. This is intentional until genuine feedback is available." />}
    </div>
  );
}

function isInstagramUrl(value: string) {
  try {
    const url = new URL(value);
    return ["instagram.com", "www.instagram.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs text-white/45"><span className="mb-2 block">{label}</span>{children}</label>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">{text}</div>;
}

function FirebaseNotice() {
  return <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-5 text-sm text-amber-100/80">Configure Firebase to manage live content.</div>;
}
