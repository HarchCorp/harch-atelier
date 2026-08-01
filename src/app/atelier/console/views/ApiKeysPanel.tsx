"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  API KEYS PANEL
//  Task: signal-enterprise-platform
//
//  Self-service panel for managing API keys (the bearer tokens used
//  to authenticate /api/v1/* calls). Renders inside the Enterprise
//  Admin Panel "API Keys" tab.
//
//  Features:
//    • List existing keys (name, prefix, created, last used, status)
//    • Create new key (name + optional expiry)
//    • Show the plaintext key ONCE on creation with Copy button
//    • Revoke key (soft-delete — audit logs preserved)
//
//  APIs consumed:
//    GET    /api/api-keys
//    POST   /api/api-keys
//    DELETE /api/api-keys/[id]
// ═══════════════════════════════════════════════════════════════

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string | null;
  tier: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  status: "active" | "expired" | "revoked";
}

interface CreatedKey {
  key: string;
  id: string;
  name: string;
  prefix: string | null;
  expiresAt: string | null;
  createdAt: string;
  warning: string;
  keyFormat: string;
}

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", { cache: "no-store" });
      if (res.status === 401) {
        setError("You must be signed in to manage API keys.");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load API keys");
        return;
      }
      setKeys(data.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke API key "${name}"?\n\nThis cannot be undone. Any service using this key will immediately lose access.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to revoke key");
        return;
      }
      fetchKeys();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select+prompt for browsers without clipboard API
      window.prompt("Copy your API key:", key);
    }
  };

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <div>
      <SectionHeader
        eyebrow="Public API Access"
        title={`${activeCount} active ${activeCount === 1 ? "key" : "keys"}`}
        sub={`Max 5 keys per user. ${keys.length} total (including revoked/expired).`}
        action={
          <button
            onClick={() => setShowCreate(true)}
            style={primaryButtonStyle}
            disabled={activeCount >= 5}
            title={activeCount >= 5 ? "Revoke a key first (max 5)" : "Create a new API key"}
          >
            + Create new key
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
          Loading API keys...
        </div>
      ) : keys.length === 0 ? (
        <div style={emptyStateStyle}>
          No API keys yet. Create your first key to start using the public API.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {keys.map((k) => (
            <ApiKeyCard key={k.id} apiKey={k} onRevoke={handleRevoke} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={(created) => {
            setShowCreate(false);
            setCreatedKey(created);
            fetchKeys();
          }}
        />
      )}

      {createdKey && (
        <CreatedKeyModal
          created={createdKey}
          copied={copied}
          onCopy={() => handleCopy(createdKey.key)}
          onClose={() => {
            setCreatedKey(null);
            setCopied(false);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  API KEY CARD — single row in the list
// ═══════════════════════════════════════════════════════════════

function ApiKeyCard({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKeyRow;
  onRevoke: (id: string, name: string) => void;
}) {
  const statusBadge = (() => {
    switch (apiKey.status) {
      case "active":
        return { label: "Active", bg: C.successBg, color: C.success };
      case "expired":
        return { label: "Expired", bg: C.warningBg, color: C.warningText };
      case "revoked":
        return { label: "Revoked", bg: C.dangerBg, color: C.danger };
    }
  })();

  const lastUsed = apiKey.lastUsedAt
    ? new Date(apiKey.lastUsedAt).toLocaleString()
    : "Never used";
  const created = new Date(apiKey.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const expires = apiKey.expiresAt
    ? new Date(apiKey.expiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No expiry";

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "16px",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
            {apiKey.name}
          </div>
          <div style={{ fontFamily: C.fontMono, fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>
            {apiKey.keyPrefix ? `${apiKey.keyPrefix}…` : "harch_••••"} · {apiKey.tier} tier
          </div>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "3px",
            background: statusBadge.bg,
            color: statusBadge.color,
          }}
        >
          {statusBadge.label}
        </span>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "12px", color: C.textBody, fontFamily: C.fontMono }}>
        <span>Created: {created}</span>
        <span>Expires: {expires}</span>
        <span>Last used: {lastUsed}</span>
      </div>

      {apiKey.status === "active" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
          <button
            onClick={() => onRevoke(apiKey.id, apiKey.name)}
            style={dangerButtonStyle}
          >
            Revoke
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CREATE KEY MODAL
// ═══════════════════════════════════════════════════════════════

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (created: CreatedKey) => void;
}) {
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 64) {
      setError("Key name must be 3-64 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const body: { name: string; expiresAt?: string } = { name: trimmedName };
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create key");
        return;
      }
      onCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setSubmitting(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3 style={modalTitleStyle}>Create new API key</h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Key name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production BI integration"
            maxLength={64}
            style={inputStyle}
            autoFocus
          />
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", fontFamily: C.fontMono }}>
            Used to identify this key in the list above. 3-64 characters.
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Expiration (optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
            style={inputStyle}
          />
          <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px", fontFamily: C.fontMono }}>
            Leave empty for no expiry. Recommended: 90 days for production keys.
          </div>
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
            {submitting ? "Creating..." : "Create key"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CREATED KEY MODAL — shows the plaintext key ONCE
// ═══════════════════════════════════════════════════════════════

function CreatedKeyModal({
  created,
  copied,
  onCopy,
  onClose,
}: {
  created: CreatedKey;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} dismissable={false}>
      <div
        style={{
          background: C.warningBg,
          border: `1px solid ${C.warningBorder}`,
          padding: "12px 14px",
          borderRadius: "4px",
          marginBottom: "20px",
          fontSize: "13px",
          color: C.warningText,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ display: "block", marginBottom: "4px" }}>
          This key won&apos;t be shown again. Store it securely.
        </strong>
        Anyone with this string can call the Harch Atelier API on your behalf.
        Paste it into your password manager or secrets vault now.
      </div>

      <h3 style={modalTitleStyle}>API key created</h3>

      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Name</label>
        <div style={{ fontSize: "14px", color: C.text }}>{created.name}</div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Key</label>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "stretch",
          }}
        >
          <input
            type="text"
            readOnly
            value={created.key}
            style={{
              ...inputStyle,
              fontFamily: C.fontMono,
              fontSize: "13px",
              flex: 1,
            }}
            onFocus={(e) => e.target.select()}
          />
          <button onClick={onCopy} style={primaryButtonStyle}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {created.expiresAt && (
        <div style={{ marginBottom: "20px", fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>
          Expires: {new Date(created.expiresAt).toLocaleDateString()}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} style={primaryButtonStyle}>
          I&apos;ve stored the key
        </button>
      </div>
    </ModalShell>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED UI (mirrors EnterpriseAdminPanel)
// ═══════════════════════════════════════════════════════════════

function ModalShell({
  children,
  onClose,
  dismissable = true,
}: {
  children: React.ReactNode;
  onClose: () => void;
  dismissable?: boolean;
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
      onClick={dismissable ? onClose : undefined}
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
