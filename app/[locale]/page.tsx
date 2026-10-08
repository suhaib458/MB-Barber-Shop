import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HomePageV2 } from "@/components/home-page-v2";
import type { Locale } from "@/types";

export const instant = false;

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

function PageFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080808] text-[#f4f0e7]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full border border-[#c6a15b]/50 bg-[#c6a15b]/10" />
        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/35">MB</p>
      </div>
    </main>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return (
    <Suspense fallback={<PageFallback />}>
      <HomePageV2 locale={locale as Locale} />
    </Suspense>
  );
}
