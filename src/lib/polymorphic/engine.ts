// ═══════════════════════════════════════════════════════════════
//  POLYMORPHIC UI ENGINE — N(20, 50, 100)
//
//  The interface is no longer static. It adapts in real-time based on
//  user behavior signals:
//    • Click velocity (fast clicker → power user → denser UI)
//    • Scroll velocity (fast scroller → skimmer → larger text)
//    • Dwell time on elements (long dwell → reader → more detail)
//    • Error count (many errors → beginner → helper tooltips)
//    • Session duration (long session → fatigue → calmer colors)
//
//  The engine produces a set of dynamic design tokens that replace
//  the static C.bg / C.text / C.fontMono tokens. Components that
//  use <PolymorphicBox> instead of <div> automatically inherit the
//  adapted style.
//
//  Signal collection is passive (no extra clicks, no UI prompts).
//  The engine runs entirely client-side, no data leaves the browser.
// ═══════════════════════════════════════════════════════════════

export type UserArchetype = "beginner" | "standard" | "power" | "skimmer" | "reader";

export interface BehaviorSignals {
  /** Clicks per minute (rolling 60s window). */
  clickVelocity: number;
  /** Scroll pixels per second (rolling 5s window). */
  scrollVelocity: number;
  /** Average time (ms) the pointer stays on an element before clicking. */
  dwellTime: number;
  /** Number of error boundary catches this session. */
  errorCount: number;
  /** Session duration in seconds. */
  sessionDuration: number;
  /** Total clicks this session. */
  totalClicks: number;
  /** Total scroll distance in pixels. */
  totalScroll: number;
}

export interface PolymorphicTokens {
  /** The inferred user archetype. */
  archetype: UserArchetype;
  /** Density multiplier: 0.85 (sparse, beginner) to 1.15 (dense, power). */
  density: number;
  /** Base font size in px: 14 (power) to 17 (beginner/skimmer). */
  baseFontSize: number;
  /** Animation speed multiplier: 0.5 (fatigue) to 1.2 (power). */
  animationSpeed: number;
  /** Background warmth: 0 (cool/neutral) to 1 (warm/calmer). */
  backgroundWarmth: number;
  /** Contrast level: 0.85 (softer, fatigue) to 1.0 (standard). */
  contrast: number;
  /** Whether helper tooltips should be shown. */
  showTooltips: boolean;
  /** Whether compact mode is active (power users). */
  compact: boolean;
  /** Human-readable reason for the current adaptation. */
  reason: string;
}

// ─── Signal collection ────────────────────────────────────────────

class BehaviorTracker {
  private clicks: number[] = []; // timestamps of clicks in last 60s
  private scrolls: number[] = []; // scroll velocities in last 5s
  private dwellStart: number | null = null;
  private dwellTimes: number[] = [];
  private errorCount = 0;
  private sessionStart = Date.now();
  private totalClicks = 0;
  private totalScroll = 0;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window === "undefined") return;
    this.attach();
  }

  private attach() {
    // Click tracking
    document.addEventListener("click", (e) => {
      const now = Date.now();
      this.clicks.push(now);
      this.totalClicks++;

      // Dwell time = time between mouseenter (dwellStart) and click
      if (this.dwellStart !== null) {
        const dwell = now - this.dwellStart;
        this.dwellTimes.push(dwell);
        if (this.dwellTimes.length > 20) this.dwellTimes.shift();
      }
      this.dwellStart = null;

      // Prune clicks older than 60s
      this.clicks = this.clicks.filter((t) => now - t < 60000);
      this.notify();
    });

    // Mouseenter tracking (for dwell time)
    document.addEventListener("mouseover", () => {
      if (this.dwellStart === null) this.dwellStart = Date.now();
    });

    // Scroll tracking
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    document.addEventListener("scroll", () => {
      const now = Date.now();
      const dy = Math.abs(window.scrollY - lastScrollY);
      const dt = now - lastScrollTime;
      if (dt > 0) {
        const velocity = (dy / dt) * 1000; // px/sec
        this.scrolls.push(velocity);
        this.totalScroll += dy;
        this.scrolls = this.scrolls.filter((_, i) => i >= this.scrolls.length - 10);
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      this.notify();
    }, { passive: true });
  }

  incrementError() {
    this.errorCount++;
    this.notify();
  }

  getSignals(): BehaviorSignals {
    const now = Date.now();
    const recentClicks = this.clicks.filter((t) => now - t < 60000);
    const clickVelocity = recentClicks.length; // clicks per minute

    const recentScrolls = this.scrolls.slice(-5);
    const scrollVelocity = recentScrolls.length > 0
      ? recentScrolls.reduce((a, b) => a + b, 0) / recentScrolls.length
      : 0;

    const dwellTime = this.dwellTimes.length > 0
      ? this.dwellTimes.reduce((a, b) => a + b, 0) / this.dwellTimes.length
      : 0;

    return {
      clickVelocity,
      scrollVelocity,
      dwellTime,
      errorCount: this.errorCount,
      sessionDuration: Math.floor((now - this.sessionStart) / 1000),
      totalClicks: this.totalClicks,
      totalScroll: this.totalScroll,
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

// Singleton (client-side only)
let trackerInstance: BehaviorTracker | null = null;
export function getBehaviorTracker(): BehaviorTracker {
  if (!trackerInstance) {
    trackerInstance = new BehaviorTracker();
  }
  return trackerInstance;
}

// ─── Archetype inference ──────────────────────────────────────────

/**
 * Infer the user archetype from behavior signals.
 *
 * - beginner: high error count OR very few clicks (new user)
 * - power: high click velocity (>30/min) + low dwell time (<300ms)
 * - skimmer: high scroll velocity (>2000 px/s) + low click count
 * - reader: long dwell time (>2000ms) + low scroll velocity
 * - standard: default
 */
export function inferArchetype(s: BehaviorSignals): { archetype: UserArchetype; reason: string } {
  if (s.errorCount >= 3) {
    return { archetype: "beginner", reason: `${s.errorCount} errors detected — showing helper tooltips` };
  }
  if (s.sessionDuration < 30 && s.totalClicks < 3) {
    return { archetype: "beginner", reason: "New session — gentle onboarding mode" };
  }
  if (s.clickVelocity > 30 && s.dwellTime > 0 && s.dwellTime < 300) {
    return { archetype: "power", reason: `Power user (${s.clickVelocity} clicks/min, ${Math.round(s.dwellTime)}ms dwell) — compact mode` };
  }
  if (s.scrollVelocity > 2000 && s.totalClicks < 10) {
    return { archetype: "skimmer", reason: `Fast scroller (${Math.round(s.scrollVelocity)} px/s) — larger text for scannability` };
  }
  if (s.dwellTime > 2000 && s.scrollVelocity < 500) {
    return { archetype: "reader", reason: `Reader mode (${Math.round(s.dwellTime)}ms dwell) — expanded detail` };
  }
  // Fatigue detection: long session → calmer colors
  if (s.sessionDuration > 1800) { // 30+ min
    return { archetype: "standard", reason: "Long session — reducing visual fatigue" };
  }
  return { archetype: "standard", reason: "Standard mode" };
}

// ─── Token generation ─────────────────────────────────────────────

/**
 * Generate dynamic design tokens from the inferred archetype.
 * These tokens replace the static C.bg / C.text / etc. values.
 */
export function generateTokens(s: BehaviorSignals): PolymorphicTokens {
  const { archetype, reason } = inferArchetype(s);
  const fatigue = s.sessionDuration > 1800; // 30+ min

  switch (archetype) {
    case "beginner":
      return {
        archetype,
        density: 0.85,
        baseFontSize: 17,
        animationSpeed: 0.8,
        backgroundWarmth: 0.3,
        contrast: 1.0,
        showTooltips: true,
        compact: false,
        reason,
      };
    case "power":
      return {
        archetype,
        density: 1.15,
        baseFontSize: 14,
        animationSpeed: 1.2,
        backgroundWarmth: 0,
        contrast: 1.0,
        showTooltips: false,
        compact: true,
        reason,
      };
    case "skimmer":
      return {
        archetype,
        density: 0.95,
        baseFontSize: 16,
        animationSpeed: 1.0,
        backgroundWarmth: 0.1,
        contrast: 1.0,
        showTooltips: false,
        compact: false,
        reason,
      };
    case "reader":
      return {
        archetype,
        density: 0.9,
        baseFontSize: 16,
        animationSpeed: 0.7,
        backgroundWarmth: 0.4,
        contrast: 0.95,
        showTooltips: false,
        compact: false,
        reason,
      };
    case "standard":
    default:
      return {
        archetype,
        density: 1.0,
        baseFontSize: 15,
        animationSpeed: fatigue ? 0.5 : 1.0,
        backgroundWarmth: fatigue ? 0.5 : 0,
        contrast: fatigue ? 0.85 : 1.0,
        showTooltips: false,
        compact: false,
        reason,
      };
  }
}
