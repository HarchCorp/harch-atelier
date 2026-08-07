"use client";

import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { getBehaviorTracker } from "@/lib/polymorphic/engine";

// ═══════════════════════════════════════════════════════════════
//  AUTO-HEALING DOM — N(30, 80, 100)
//
//  When a React component crashes during render, instead of showing
//  a blank white screen or a static error page, this boundary:
//    1. Catches the error
//    2. Rolls back to the last known good state (component remount)
//    3. Shows a non-intrusive "self-healed" toast
//    4. Reports the error to the Sentinel (async, non-blocking)
//    5. Increments the behavior tracker's error count (→ beginner mode)
//
//  After 3 self-heals on the same component, it stops retrying and
//  shows a "Component unavailable" fallback (to prevent infinite
//  crash loops).
// ═══════════════════════════════════════════════════════════════

interface AutoHealProps {
  children: ReactNode;
  /** Unique name for this boundary (used in error reports). */
  componentName: string;
  /** Fallback to show after maxRetries. */
  fallback?: ReactNode;
  /** Max self-heal attempts before giving up (default: 3). */
  maxRetries?: number;
}

interface AutoHealState {
  hasError: boolean;
  retryCount: number;
  lastError: string;
  errorId: string | null;
}

export class AutoHealingBoundary extends Component<AutoHealProps, AutoHealState> {
  state: AutoHealState = {
    hasError: false,
    retryCount: 0,
    lastError: "",
    errorId: null,
  };

  static getDerivedStateFromError(error: Error): Partial<AutoHealState> {
    return {
      hasError: true,
      lastError: error.message,
      errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Report to behavior tracker (→ triggers beginner mode if 3+ errors)
    try {
      getBehaviorTracker().incrementError();
    } catch {}

    // Async report to Sentinel (non-blocking, fire-and-forget)
    if (typeof window !== "undefined") {
      fetch("/api/super-admin/component-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentName: this.props.componentName,
          error: error.message,
          stack: error.stack?.slice(0, 500),
          componentStack: info.componentStack?.slice(0, 500),
          errorId: this.state.errorId,
        }),
      }).catch(() => {}); // swallow — reporting is best-effort
    }
  }

  componentDidUpdate(prevProps: AutoHealProps) {
    // If the parent re-rendered with new children, reset the error state
    // (gives the component a fresh chance)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    const { hasError, retryCount, lastError } = this.state;
    const { maxRetries = 3, fallback, componentName } = this.props;

    if (hasError) {
      // Still have retries → auto-heal immediately
      if (retryCount < maxRetries) {
        // Auto-retry after 500ms (gives React time to settle)
        setTimeout(() => this.handleRetry(), 500);

        return (
          <div style={{
            padding: "12px",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#92400e",
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
            Self-healing {componentName}… (attempt {retryCount + 1}/{maxRetries})
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );
      }

      // Max retries exceeded → show fallback
      if (fallback) return fallback;

      return (
        <div style={{
          padding: "16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#991b1b",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ fontWeight: 700, marginBottom: "4px" }}>
            ⚠ {componentName} unavailable
          </div>
          <div style={{ fontSize: "11px", color: "#7f1d1d", opacity: 0.8 }}>
            Self-heal failed after {maxRetries} attempts. Last error: {lastError.slice(0, 100)}
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: "8px",
              padding: "4px 10px",
              background: "#fff",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              fontSize: "10px",
              color: "#991b1b",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Retry manually
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Hook version for function components ────────────────────────

/**
 * Wrap any component with auto-healing. If the component throws,
 * it auto-retries up to maxRetries times, then shows a fallback.
 *
 * Usage:
 *   const SafeWidget = withAutoHeal(MyWidget, "MyWidget");
 *   <SafeWidget />
 */
export function withAutoHeal<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  fallback?: ReactNode,
  maxRetries?: number,
): React.FC<P> {
  return function AutoHealedComponent(props: P) {
    return (
      <AutoHealingBoundary componentName={componentName} fallback={fallback} maxRetries={maxRetries}>
        <Component {...props} />
      </AutoHealingBoundary>
    );
  };
}
