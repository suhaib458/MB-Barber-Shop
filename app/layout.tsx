import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL || "http://localhost:3000"),
  title: { default: "MB — Premium Grooming", template: "%s | MB" },
  description: "تجربة حلاقة عصرية فاخرة في MB. Premium modern grooming at MB.",
  applicationName: "MB",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MB",
  },
  formatDetection: { telephone: false },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
  openGraph: {
    title: "MB — Premium Grooming",
    description: "Your style starts at MB.",
    type: "website",
    images: ["/images/hero-poster.svg"],
  },
};
export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {children}
        <Script
          id="register-sw"
          strategy="afterInteractive"
        >{`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}</Script>
      </body>
    </html>
  );
}
