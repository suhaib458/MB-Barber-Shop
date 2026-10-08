import type { Metadata } from "next";
import { AdminDashboardV2 } from "@/components/admin-dashboard-v2";

export const metadata: Metadata = {
  title: "MB Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminDashboardV2 />;
}
