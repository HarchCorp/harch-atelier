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
  if (session) {
    redirect("/atelier/admin");
  }
  return <AdminLoginPage />;
}
