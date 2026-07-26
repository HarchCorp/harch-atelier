"use client";

import { useClientStore } from "@/lib/client-store";
import { ClientLogin } from "@/components/client/client-login";
import { ClientDashboard } from "@/components/client/client-dashboard";

export default function ClientPage() {
  const session = useClientStore((s) => s.session);
  return session ? <ClientDashboard /> : <ClientLogin />;
}
