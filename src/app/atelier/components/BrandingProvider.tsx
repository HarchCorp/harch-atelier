"use client";

// ═══════════════════════════════════════════════════════════════
//  BRANDING PROVIDER — Brick 8 — Tier 4 White-Label Engine
//
//  Client component that wraps the console (or any sub-tree that
//  needs white-label branding) and applies the per-AgencyClient
//  visual identity at runtime.
//
//  Resolution flow:
//    1. If a `payload` prop is passed (server-fetched branding), use it.
//    2. Otherwise, fetch /api/agency/branding on mount.
//    3. Inject a <style id="brand-vars"> tag with CSS custom properties.
//    4. Replace the document title (loginTitle) if set.
//    5. Replace the favicon (faviconUrl) if set.
//    6. Hide the Harch badge by adding a `data-hide-harch-badge="true"`
//       attribute on <html> — descendant CSS rules target this.
//
//  This component never throws. If branding can't be resolved, it
//  falls back to the Harch defaults already baked into the CSS.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, type ReactNode } from "react";

export interface BrandingPayload {
  agencyClientId: string | null;
  agencyId: string | null;
  resolvedFrom: "agency-client" | "agency-master" | "harch-default" | "host-unknown";
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  faviconUrl: string | null;
  loginTitle: string;
  loginSubtitle: string | null;
  footerText: string | null;
  hideHarchBadge: boolean;
  displayName: string | null;
  cssVars: string;
}

export interface BrandingProviderProps {
  /** Server-fetched branding payload (preferred — skips the fetch). */
  payload?: BrandingPayload;
  /** Children to wrap. */
  children?: ReactNode;
  /** If true, the provider only sets CSS vars — no title/favicon DOM mutations. */
  varsOnly?: boolean;
}

const STYLE_TAG_ID = "brand-vars";

/**
 * Inject or replace the `<style id="brand-vars">` tag in <head>
 * with the latest CSS custom properties.
 */
function injectCssVars(cssVars: string) {
  if (typeof document === "undefined") return;
  let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_TAG_ID;
    document.head.appendChild(tag);
  }
  // Apply the custom properties to :root so they cascade everywhere.
  tag.textContent = `:root {\n  ${cssVars}\n}`;
}

/**
 * Update the document title (used by the login page).
 */
function applyTitle(title: string | null | undefined) {
  if (typeof document === "undefined") return;
  if (!title) return;
  document.title = title;
}

/**
 * Add or replace the favicon link tag.
 */
function applyFavicon(faviconUrl: string | null | undefined) {
  if (typeof document === "undefined") return;
  if (!faviconUrl) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-brand="true"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.setAttribute("data-brand", "true");
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

/**
 * Toggle the `data-hide-harch-badge` attribute on <html>.
 */
function applyHideHarchBadge(hide: boolean) {
  if (typeof document === "undefined") return;
  if (hide) {
    document.documentElement.setAttribute("data-hide-harch-badge", "true");
  } else {
    document.documentElement.removeAttribute("data-hide-harch-badge");
  }
}

export function BrandingProvider({
  payload,
  children,
  varsOnly = false,
}: BrandingProviderProps) {
  // We don't store the payload in state — it's derived from props.
  // Only the fetched value (when no payload is passed) lives in state,
  // and that's only set inside a fetch callback (not synchronously in
  // the effect body), which avoids the react-hooks/set-state-in-effect
  // warning.
  const [fetched, setFetched] = useState<BrandingPayload | null>(null);

  // If no payload was passed, fetch from the public endpoint.
  useEffect(() => {
    if (payload) return; // no fetch needed — payload is authoritative
    let cancelled = false;
    fetch("/api/agency/branding", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BrandingPayload | null) => {
        if (!cancelled && data) setFetched(data);
      })
      .catch(() => {
        /* swallow — branding is best-effort, never crash the page */
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  // Resolve the effective branding: payload (server-fetched) > fetched (client-fetched) > null.
  const resolved = payload ?? fetched;

  // Apply branding effects whenever `resolved` changes.
  useEffect(() => {
    if (!resolved) return;
    injectCssVars(resolved.cssVars);
    if (!varsOnly) {
      applyTitle(resolved.loginTitle);
      applyFavicon(resolved.faviconUrl);
      applyHideHarchBadge(resolved.hideHarchBadge);
    }
  }, [resolved, varsOnly]);

  // Optionally render a logo replacement. We expose the branding via
  // a context-free pattern: the wrapper div has data attributes that
  // descendant CSS can target. Children render normally.
  return (
    <div
      data-branding-resolved={resolved?.resolvedFrom ?? "loading"}
      data-branding-agency={resolved?.agencyId ?? ""}
      data-branding-client={resolved?.agencyClientId ?? ""}
      data-branding-display={resolved?.displayName ?? ""}
      style={
        resolved
          ? ({
              "--brand-primary": resolved.primaryColor,
              "--brand-accent": resolved.accentColor,
              "--brand-font": resolved.fontFamily,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

// ─── BrandingLogo helper ────────────────────────────────────────────
//
// A drop-in replacement for the Harch brand badge that renders the
// white-label logo if one is configured. Falls back to its children
// otherwise.

export function BrandingLogo({
  branding,
  fallback,
  alt,
  height = 32,
}: {
  branding: BrandingPayload | null;
  fallback: ReactNode;
  alt?: string;
  height?: number;
}) {
  if (branding?.logoUrl) {
    return (
      <img
        src={branding.logoUrl}
        alt={alt ?? branding.displayName ?? "Logo"}
        height={height}
        style={{ height, width: "auto", objectFit: "contain" }}
      />
    );
  }
  return <>{fallback}</>;
}
