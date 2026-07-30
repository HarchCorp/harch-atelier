import type { Metadata } from "next";
import { ConsoleShell } from "./ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "HarchIQ Console",
  description:
    "Your reputation intelligence console. Weather, Signals, Neighbors, AI Footprint — your full perception ecosystem at a glance.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/console" },
  robots: { index: false, follow: false }, // private dashboard, no index
};

export default async function ConsolePage() {
  // Auth gate — redirect to login if no session
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console");
  }

  return <ConsoleShell />;
}
