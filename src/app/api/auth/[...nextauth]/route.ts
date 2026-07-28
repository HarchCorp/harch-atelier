// ═══════════════════════════════════════════════════════════════
//  NEXTAUTH ROUTE HANDLER — PROJECT AEGIS v4.0
//
//  Mounts NextAuth on /api/auth/[...nextauth]. Re-exports the same
//  handler for both GET (CSRF / sign-in form / callback) and POST
//  (sign-in / sign-out submission).
// ═══════════════════════════════════════════════════════════════

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
