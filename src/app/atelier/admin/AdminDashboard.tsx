"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Manage access requests + invitations
//
//  Two tabs:
//  1. Requests — people who filled the public form
//  2. Invitations — links you've created (active + used)
//
//  From a request, admin can click "Create invitation" which:
//  - Auto-generates a secure password
//  - Creates a unique access URL
//  - Shows both so admin can copy + send to the user
// ═══════════════════════════════════════════════════════════════

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  company: string | null;
  role: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  invitation: { id: string; token: string; usedAt: string | null } | null;
}

interface Invitation {
  id: string;
  token: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  company: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

interface CreatedInvitation {
  id: string;
  token: string;
  url: string;
  email: string;
  name: string;
  password: string;
  plan: string;
  role: string;
  expiresAt: string;
}

export function AdminDashboard() {
  const [tab, setTab] = useState<"requests" | "invitations">("requests");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdInvitation, setCreatedInvitation] = useState<CreatedInvitation | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<"url" | "password" | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, invRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/invitations"),
      ]);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvitations(invData.invitations || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createInvitation = async (request?: AccessRequest) => {
    setCreating(true);
    try {
      const body = request
        ? {
            email: request.email,
            name: request.name,
            company: request.company || undefined,
            requestId: request.id,
            plan: "veille", // default plan
          }
        : {
            email: "",
            name: "",
            plan: "decouverte",
          };

      // If no request, prompt for email + name
      if (!request) {
        const email = prompt("Email:");
        if (!email) { setCreating(false); return; }
        const name = prompt("Full name:");
        if (!name) { setCreating(false); return; }
        body.email = email;
        body.name = name;
      }

      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.invitation) {
        setCreatedInvitation(data.invitation);
        fetchData(); // refresh lists
      } else {
        alert(data.error || "Failed to create invitation");
      }
    } catch {
      alert("Network error");
    }
    setCreating(false);
  };

  const copyToClipboard = (text: string, type: "url" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
            HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Admin</span>
          </span>
          <a href="/atelier/console" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>→ Console</a>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => createInvitation()} disabled={creating} style={{ padding: "8px 14px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: creating ? "not-allowed" : "pointer" }}>
            + New invitation
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <button onClick={() => setTab("requests")} style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: tab === "requests" ? `2px solid ${C.accent}` : "2px solid transparent", color: tab === "requests" ? C.text : C.textMuted, fontFamily: C.fontSans, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Requests {pendingRequests.length > 0 && <span style={{ marginLeft: "6px", fontSize: "10px", fontFamily: C.fontMono, padding: "2px 6px", borderRadius: "8px", background: C.danger, color: "#fff" }}>{pendingRequests.length}</span>}
        </button>
        <button onClick={() => setTab("invitations")} style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: tab === "invitations" ? `2px solid ${C.accent}` : "2px solid transparent", color: tab === "invitations" ? C.text : C.textMuted, fontFamily: C.fontSans, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Content */}
      <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>Loading...</div>
        ) : tab === "requests" ? (
          <div>
            {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
              <EmptyState text="No access requests yet." />
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
                      Pending ({pendingRequests.length})
                    </div>
                    {pendingRequests.map((r) => <RequestCard key={r.id} request={r} onAccept={() => createInvitation(r)} />)}
                  </div>
                )}
                {acceptedRequests.length > 0 && (
                  <div>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
                      Accepted ({acceptedRequests.length})
                    </div>
                    {acceptedRequests.map((r) => <RequestCard key={r.id} request={r} onAccept={() => createInvitation(r)} />)}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {invitations.length === 0 ? (
              <EmptyState text="No invitations created yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {invitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Created invitation modal */}
      {createdInvitation && (
        <div onClick={() => setCreatedInvitation(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "32px", maxWidth: "560px", width: "100%" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
              Invitation created
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "0 0 24px" }}>
              Send this to {createdInvitation.name}
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Access link</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input readOnly value={createdInvitation.url} style={{ flex: 1, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontMono, fontSize: "12px", color: C.text, background: C.bgSubtle }} />
                <button onClick={() => copyToClipboard(createdInvitation.url, "url")} style={{ padding: "10px 14px", background: C.text, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                  {copied === "url" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Temporary password</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input readOnly value={createdInvitation.password} style={{ flex: 1, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontMono, fontSize: "14px", fontWeight: 700, color: C.text, background: C.bgSubtle }} />
                <button onClick={() => copyToClipboard(createdInvitation.password, "password")} style={{ padding: "10px 14px", background: C.text, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                  {copied === "password" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "4px", fontSize: "12px", color: C.textBody, lineHeight: 1.5, marginBottom: "24px" }}>
              <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Plan:</strong> {createdInvitation.plan} · <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expires:</strong> {new Date(createdInvitation.expiresAt).toLocaleDateString("en-US")}
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setCreatedInvitation(null)} style={{ padding: "10px 16px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onAccept }: { request: AccessRequest; onAccept: () => void }) {
  return (
    <div style={{ padding: "16px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{request.name}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>{request.email}</div>
          {request.company && <div style={{ fontSize: "12px", color: C.textBody, marginTop: "4px" }}>{request.company}</div>}
          {request.role && <div style={{ fontSize: "11px", color: C.accent, fontFamily: C.fontMono, marginTop: "4px" }}>{request.role}</div>}
          {request.message && <div style={{ fontSize: "13px", color: C.textBody, marginTop: "8px", lineHeight: 1.5, padding: "8px 12px", background: C.bgSubtle, borderRadius: "4px" }}>{request.message}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "3px 8px", borderRadius: "2px", background: request.status === "pending" ? `${C.warning}15` : `${C.cta}15`, color: request.status === "pending" ? C.warning : C.cta, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {request.status}
          </span>
          {request.status === "pending" && (
            <button onClick={onAccept} style={{ padding: "8px 14px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              Create invitation
            </button>
          )}
          {request.invitation && (
            <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
              {request.invitation.usedAt ? "Used" : "Pending"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://atelier.harchcorp.com";
  const url = `${baseUrl}/atelier/access?token=${invitation.token}`;
  const [copied, setCopied] = useState(false);

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isUsed = !!invitation.usedAt;

  return (
    <div style={{ padding: "16px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation.name}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>{invitation.email}</div>
          <div style={{ fontSize: "11px", color: C.textBody, fontFamily: C.fontMono, marginTop: "4px" }}>
            Plan: {invitation.plan} · Created: {new Date(invitation.createdAt).toLocaleDateString("en-US")}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "3px 8px", borderRadius: "2px", background: isUsed ? `${C.cta}15` : isExpired ? `${C.danger}15` : `${C.warning}15`, color: isUsed ? C.cta : isExpired ? C.danger : C.warning, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {isUsed ? "Used" : isExpired ? "Expired" : "Active"}
          </span>
          {!isUsed && !isExpired && (
            <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: "6px 12px", background: C.text, color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
              {copied ? "Copied" : "Copy link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
      {text}
    </div>
  );
}
