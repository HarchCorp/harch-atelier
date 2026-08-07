import type { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin — HarchIQ Console",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/atelier/admin-x7k2m9");
  }
  if (session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    redirect("/atelier/console");
  }
  return <AdminDashboard />;
}
