import type { Metadata } from "next";
import { LoginPage } from "./LoginPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in — HarchIQ Console",
  description: "Access your HarchIQ Console. Accounts are provided directly by the Harch Atelier team.",
  robots: { index: false, follow: false },
};

export default async function LoginPageRoute() {
  // If already authenticated, redirect to Console
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/atelier/console");
  }

  return <LoginPage />;
}
