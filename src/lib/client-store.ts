"use client";

/**
 * Harch Atelier — Client session store (V25.0)
 *
 * A lightweight client-side session store for the /client space. A "client"
 * is an external customer (e.g. a brand) who logs in to see THEIR reputation
 * dashboard — not the internal multi-account operator console at /.
 *
 * Session-only (sessionStorage, NOT localStorage) so it clears when the tab
 * closes. No real auth — this is a demo gate that simulates a client login.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ClientSession {
  /** The brand/company name the client is monitoring. */
  brand: string;
  /** The client's contact email. */
  email: string;
  /** Display name for the client. */
  contactName: string;
  /** The plan tier. */
  plan: "Starter" | "Growth" | "Enterprise";
  /** Login timestamp. */
  loginAt: number;
}

interface ClientState {
  session: ClientSession | null;
  login: (s: ClientSession) => void;
  logout: () => void;
}

/** Pre-registered demo clients (email → brand). */
export const DEMO_CLIENTS: { email: string; brand: string; contactName: string; plan: ClientSession["plan"] }[] = [
  { email: "comms@harchcorp.com", brand: "HarchCorp", contactName: "Amine Harch", plan: "Enterprise" },
  { email: "ir@attijariwafa.ma", brand: "Attijariwafa Bank", contactName: "IR Team", plan: "Enterprise" },
  { email: "media@ocp.ma", brand: "OCP Group", contactName: "Media Relations", plan: "Growth" },
  { email: "pr@maroctelecom.ma", brand: "Maroc Telecom", contactName: "PR Desk", plan: "Growth" },
  { email: "hello@labelvie.ma", brand: "Label'Vie", contactName: "Marketing", plan: "Starter" },
];

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      session: null,
      login: (s) => set({ session: s }),
      logout: () => set({ session: null }),
    }),
    {
      name: "harch-client-session",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
