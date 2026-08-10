import type { Metadata } from "next";
import { LoginPage } from "./LoginPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Connexion | Harch Atelier",
  description: "Accedez a votre tableau de bord d'intelligence reputationnelle.",
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
