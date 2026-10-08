import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import type { Locale } from "@/types";
export const instant = false;
export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ar" && locale !== "en") notFound();
  return <HomePage locale={locale as Locale} />;
}
