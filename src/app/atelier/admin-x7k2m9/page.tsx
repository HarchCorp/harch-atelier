import type { Metadata } from "next";
import { AdminLoginPage } from "./AdminLoginPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  // If already logged in, check role:
  // - admin/super_admin → redirect to admin dashboard
  // - anyone else → redirect to their console (NOT admin)
  if (session) {
    if (session.user?.role === "admin" || session.user?.role === "super_admin") {
      redirect("/atelier/admin");
    } else {
      // Non-admin user is logged in — send them to their console, NOT admin
      redirect("/atelier/console");
    }
  }

  // Not logged in — show the admin login form
  return <AdminLoginPage />;
}
