"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  WEBHOOKS PANEL
//  Task: signal-enterprise-platform
//
//  Self-service panel for registering outbound webhooks. Renders
//  inside the Enterprise Admin Panel "Webhooks" tab.
//
//  Features:
//    • List existing webhooks (URL, events, last delivery status)
//    • Add webhook form (URL + event checkboxes + optional secret)
//    • Test button (sends a synthetic webhook.test event)
//    • Delete webhook
//
//  APIs consumed:
//    GET    /api/webhooks
//    POST   /api/webhooks
//    DELETE /api/webhooks/[id]
//    POST   /api/webhooks/[id]/test
// ═══════════════════════════════════════════════════════════════

interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  isActive: boolean;
  hasSecret: boolean;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: string | null;
  lastDeliveryMessage: string | null;
  createdAt: string;
  deliveryCount: number;
}

const AVAILABLE_EVENTS = [
  { id: "alert.critical", label: "Critical alerts", desc: "Fires when a critical-severity article or risk is detected." },
  { id: "alert.high", label: "High alerts", desc: "Fires when a high-severity article or risk is detected." },
  { id: "report.ready", label: "Report ready", desc: "Fires when a new insight report PDF is generated." },
  { id: "reputation.drop", label: "Reputation drop", desc: "Fires when the overall reputation score drops by 5+ points." },
  { id: "screening.match", label: "Screening match", desc: "Fires when a sanctions screening returns a match." },
] as const;

export function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks", { cache: "no-store" });
      if (res.status === 401) {
        setError("You must be signed in to manage webhooks.");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load webhooks");
        return;
      }
      setWebhooks(data.webhooks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(`Delete webhook for ${url}?\n\nThis cannot be undone. Delivery history will be lost.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete webhook");
        return;
      }
      fetchWebhooks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Outbound Webhooks"
        title={`${webhooks.length} ${webhooks.length === 1 ? "webhook" : "webhooks"}`}
        sub="Receive POST callbacks when critical alerts fire, reports are ready, or sanctions match."
        action={
          <button onClick={() => setShowAdd(true)} style={primaryButtonStyle}>
            + Add webhook
          </button>
        }
      />

      {error && (
        <div style={{ ...noteStyle, color: C.danger, marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Loading webhooks...
        </div>
      ) : webhooks.length === 0 ? (
        <div style={emptyStateStyle}>
          No webhooks registered. Add one to start receiving outbound event callbacks.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {webhooks.map((w) => (
            <WebhookCard key={w.id} webhook={w} onDelete={handleDelete} onTested={fetchWebhooks} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddWebhookModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            fetchWebhooks();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WEBHOOK CARD
// ═══════════════════════════════════════════════════════════════

function WebhookCard({
  webhook,
  onDelete,
  onTested,
}: {
  webhook: WebhookRow;
  onDelete: (id: string, url: string) => void;
  onTested: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}/test`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setTestResult(`Failed: ${data.error || "Unknown error"}`);
      } else if (data.ok) {
        setTestResult(`Test delivered (HTTP ${data.delivery?.httpStatus ?? "?"})`);
      } else {
        setTestResult(
          `Test failed: ${data.delivery?.errorMessage ?? "no response from receiver"}`,
        );
      }
      onTested();
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : "Network error");
    }
    setTesting(false);
  };

  const deliveryBadge = (() => {
    if (!webhook.lastDeliveryStatus) {
      return { label: "No deliveries yet", bg: C.bgSubtle, color: C.textMuted };
    }
    if (webhook.lastDeliveryStatus === "success") {
      return { label: "Last: success", bg: C.successBg, color: C.success };
    }
    return { label: "Last: failed", bg: C.dangerBg, color: C.danger };
  })();

  const lastDelivery = webhook.lastDeliveryAt
    ? new Date(webhook.lastDeliveryAt).toLocaleString()
    : null;

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "16px",
        background: C.bg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.text, wordBreak: "break-all" }}>
            {webhook.url}
          </div>
          {webhook.description && (
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
              {webhook.description}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "3px",
            background: deliveryBadge.bg,
            color: deliveryBadge.color,
            whiteSpace: "nowrap",
          }}
        >
          {deliveryBadge.label}
        </span>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
        {webhook.events.map((e) => (
          <span
            key={e}
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              padding: "2px 8px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: "3px",
              color: C.textBody,
            }}
          >
            {e}
          </span>
        ))}
        {webhook.hasSecret && (
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              padding: "2px 8px",
              background: C.successBg,
              border: `1px solid ${C.success}`,
              borderRadius: "3px",
              color: C.success,
            }}
            title="Webhook deliveries are HMAC-signed with this secret"
          >
            signed
          </span>
        )}
      </div>

      <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "8px" }}>
        {webhook.deliveryCount} {webhook.deliveryCount === 1 ? "delivery" : "deliveries"}
        {lastDelivery && ` · last at ${lastDelivery}`}
        {webhook.lastDeliveryMessage && ` · ${webhook.lastDeliveryMessage}`}
      </div>

      {testResult && (
        <div
          style={{
            ...noteStyle,
            marginBottom: "8px",
            color: testResult.startsWith("Test delivered") ? C.success : C.danger,
          }}
        >
          {testResult}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button onClick={handleTest} disabled={testing} style={secondaryButtonStyle}>
          {testing ? "Sending..." : "Send test"}
        </button>
        <button onClick={() => onDelete(webhook.id, webhook.url)} style={dangerButtonStyle}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADD WEBHOOK MODAL
// ═══════════════════════════════════════════════════════════════

function AddWebhookModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["alert.critical", "alert.high"]);
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEvent = (id: string) => {
    setEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required.");
      return;
    }
    if (events.length === 0) {
      setError("Select at least one event.");
      return;
    }

    setSubmitting(true);
    try {
      const body: { url: string; events: string[]; description?: string; secret?: string } = {
        url: url.trim(),
        events,
      };
      if (description.trim()) body.description = description.trim();
      if (secret.trim()) body.secret = secret.trim();

      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register webhook");
        return;
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3 style={modalTitleStyle}>Register webhook</h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Payload URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.com/api/harch-webhook"
            style={inputStyle}
            autoFocus
          />
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", fontFamily: C.fontMono }}>
            Must be https (http allowed only for localhost). We POST JSON to this URL.
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Events</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {AVAILABLE_EVENTS.map((e) => (
              <label
                key={e.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  padding: "8px 10px",
                  border: `1px solid ${events.includes(e.id) ? C.cta : C.border}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: events.includes(e.id) ? "rgba(16,185,129,0.04)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={events.includes(e.id)}
                  onChange={() => toggleEvent(e.id)}
                  style={{ marginTop: "2px", accentColor: C.cta }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                    {e.label} <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>({e.id})</span>
                  </div>
                  <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>
                    {e.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Signing secret (optional)</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="a random string — used to HMAC-sign deliveries"
            style={inputStyle}
          />
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", fontFamily: C.fontMono }}>
            If set, deliveries include <code>X-Harch-Signature: hex(HMAC-SHA256(secret, body))</code>.
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Slack #alerts channel"
            maxLength={256}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ ...noteStyle, color: C.danger, marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? "Registering..." : "Register webhook"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED UI (mirrors ApiKeysPanel)
// ═══════════════════════════════════════════════════════════════

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <div>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "4px 0" }}>
          {title}
        </h2>
        {sub && (
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>
            {sub}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: "'Space Mono', monospace",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "14px",
  color: "#0a0a0a",
  background: "#ffffff",
  boxSizing: "border-box",
  outline: "none",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: C.textMuted,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: C.text,
  margin: "4px 0 24px",
};

const noteStyle: React.CSSProperties = {
  padding: "12px 14px",
  background: C.bgSubtle,
  borderRadius: "4px",
  fontSize: "12px",
  color: C.textBody,
  lineHeight: 1.5,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: C.cta,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.textBody,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  borderRadius: "4px",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "transparent",
  border: `1px solid ${C.danger}`,
  color: C.danger,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: "4px",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "48px 32px",
  border: `1px dashed ${C.border}`,
  borderRadius: "8px",
  textAlign: "center",
  color: C.textMuted,
  fontFamily: C.fontMono,
  fontSize: "13px",
};
