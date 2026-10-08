"use client";

import { doc, onSnapshot, orderBy, query, collection, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  CONTACT,
  barbers as demoBarbers,
  instagramWorks as demoInstagramWorks,
  services as demoServices,
} from "@/data/demo";
import { db } from "@/lib/firebase/client";
import type {
  Barber,
  BusinessSettings,
  GalleryItem,
  InstagramWork,
  Review,
  Service,
} from "@/types";

const defaultSchedule = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [String(i), { start: "11:00", end: "23:00" }]),
);

export const defaultBusinessSettings: BusinessSettings = {
  displayPhone: CONTACT.displayPhone,
  phone: CONTACT.phone,
  whatsapp: CONTACT.phone,
  instagram: CONTACT.instagram,
  mapUrl: CONTACT.map,
  aboutAr:
    "في MB نهتم بالتفاصيل التي تصنع الفرق، ونقدّم تجربة حلاقة عصرية تجمع بين الدقة، الراحة والأناقة.",
  aboutEn:
    "At MB, we focus on the details that make the difference, combining precision, comfort and modern grooming.",
  temporarilyClosed: false,
  weeklyHours: defaultSchedule,
  specialHours: [],
};

export function useMbContent() {
  const [services, setServices] = useState<Service[]>(demoServices);
  const [barbers, setBarbers] = useState<Barber[]>(demoBarbers);
  const [instagramWorks, setInstagramWorks] = useState<InstagramWork[]>(demoInstagramWorks);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [loading, setLoading] = useState(Boolean(db));

  useEffect(() => {
    if (!db) return;

    let waiting = 6;
    const done = () => {
      waiting -= 1;
      if (waiting <= 0) setLoading(false);
    };

    const unsubscribers = [
      onSnapshot(
        query(
          collection(db, "services"),
          where("active", "==", true),
          orderBy("sortOrder", "asc"),
        ),
        (snap) => {
          if (!snap.empty) {
            setServices(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Service));
          }
          done();
        },
        done,
      ),
      onSnapshot(
        query(
          collection(db, "barbers"),
          where("active", "==", true),
          orderBy("sortOrder", "asc"),
        ),
        (snap) => {
          if (!snap.empty) {
            setBarbers(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Barber));
          }
          done();
        },
        done,
      ),
      onSnapshot(
        query(
          collection(db, "instagramWorks"),
          where("active", "==", true),
          orderBy("order", "asc"),
        ),
        (snap) => {
          if (!snap.empty) {
            setInstagramWorks(
              snap.docs.map((item) => ({ id: item.id, ...item.data() }) as InstagramWork),
            );
          }
          done();
        },
        done,
      ),
      onSnapshot(
        query(
          collection(db, "gallery"),
          where("active", "==", true),
          orderBy("order", "asc"),
        ),
        (snap) => {
          setGallery(
            snap.docs.map((item) => ({ id: item.id, ...item.data() }) as GalleryItem),
          );
          done();
        },
        done,
      ),
      onSnapshot(
        query(
          collection(db, "reviews"),
          where("active", "==", true),
          orderBy("order", "asc"),
        ),
        (snap) => {
          setReviews(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Review));
          done();
        },
        done,
      ),
      onSnapshot(
        doc(db, "businessSettings", "main"),
        (snap) => {
          if (snap.exists()) {
            setSettings({ ...defaultBusinessSettings, ...snap.data() } as BusinessSettings);
          }
          done();
        },
        done,
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return useMemo(
    () => ({ services, barbers, instagramWorks, gallery, reviews, settings, loading }),
    [services, barbers, instagramWorks, gallery, reviews, settings, loading],
  );
}
