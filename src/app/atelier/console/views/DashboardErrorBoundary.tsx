"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
//  DashboardErrorBoundary.tsx — Shared React error boundary
//
//  Isolates widget crashes. If Deck.gl, ECharts, or any child throws
//  during render, the rest of the dashboard keeps working and the
//  user sees a small inline "Widget crashed" card with a Retry button.
//
//  Usage:
//    <DashboardErrorBoundary accent={ACCENT} title="SOV Sankey">
//      <ReactECharts option={sankeyOption} />
//    </DashboardErrorBoundary>
//
//  Light theme. English. No emojis. Compatible with all 4 console
//  dashboards (Brand Monitor, Competitor Intel, Investor Desk, Alpha).
// ═══════════════════════════════════════════════════════════════

interface Props {
  children: ReactNode;
  /** Optional accent color (defaults to neutral red for error states). */
  accent?: string;
  /** Optional widget title rendered in the fallback panel. */
  title?: string;
  /** Optional subtitle / hint rendered under the title. */
  subtitle?: string;
  /** Optional custom fallback ReactNode (overrides the default panel). */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  resetKey: number;
}

const FALLBACK_FONT = "'Space Mono', monospace";

export class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, resetKey: 0 };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console for dev diagnostics — never blocks the render.
    // The title is intentionally included so devs can locate the failing
    // widget in the React tree.
    const label = this.props.title ?? "<widget>";
    console.error("[DashboardErrorBoundary]", label, error, info.componentStack);
  }

  private handleRetry = () => {
    // Reset state and bump resetKey so children re-mount fresh
    // (avoids stale closures in crashed ECharts / Deck.gl instances).
    this.setState((prev) => ({ hasError: false, error: undefined, resetKey: prev.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <div key={this.state.resetKey}>{this.props.fallback}</div>;
      }
      const accent = this.props.accent ?? "#ef4444";
      const title = this.props.title ?? "Widget";
      return (
        <div
          key={this.state.resetKey}
          role="alert"
          aria-live="polite"
          style={{
            padding: "16px 12px",
            border: `1px dashed ${accent}55`,
            borderRadius: 4,
            background: `${accent}06`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 140,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              fontFamily: FALLBACK_FONT,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {title} — render fault
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#525252",
              fontFamily: FALLBACK_FONT,
              wordBreak: "break-word",
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            {this.state.error?.message ?? "A widget failed to render."}
          </div>
          {this.props.subtitle && (
            <div
              style={{
                fontSize: 9,
                color: "#737373",
                fontFamily: FALLBACK_FONT,
                maxWidth: 280,
                lineHeight: 1.4,
              }}
            >
              {this.props.subtitle}
            </div>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              marginTop: 4,
              padding: "4px 12px",
              fontSize: 10,
              border: `1px solid ${accent}`,
              borderRadius: 2,
              background: "#ffffff",
              color: accent,
              cursor: "pointer",
              fontFamily: FALLBACK_FONT,
              letterSpacing: "0.06em",
              fontWeight: 700,
              textTransform: "uppercase",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}10`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            Retry widget
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default DashboardErrorBoundary;
