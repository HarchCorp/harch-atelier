import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { ClientDashboard } from "./ClientDashboard";

export const metadata = {
  title: "Dashboard — HarchIQ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/client-dashboard");
  }
  return <ClientDashboard />;
}
