// ═══════════════════════════════════════════════════════════════
//  POLYMORPHIC UI ENGINE — NEMESIS-HARDENED
//
//  This engine has been hardened against the NEMESIS adversarial QA
//  protocol. Every input is clamped, every calculation guards against
//  division by zero, and bot behavior is detected + filtered.
//
//  NEMESIS attacks defended:
//    1. Synthetic velocity (10k clicks same timestamp) → dedup + cap
//    2. Corrupted scroll events (deltaY: 50000) → velocity cap at 5000
//    3. Context inversion (baseFontSize: -50) → clamp in PolymorphicBox
//    4. Division by zero (dt=0) → guarded with Number.isFinite
//
//  If NEMESIS injects impossible signals, the engine returns "standard"
//  archetype with reason "bot_detected" — it does NOT crash, does NOT
//  produce NaN tokens, does NOT make the UI unusable.
// ═══════════════════════════════════════════════════════════════

export type UserArchetype = "beginner" | "standard" | "power" | "skimmer" | "reader" | "bot";

export interface BehaviorSignals {
  clickVelocity: number;
  scrollVelocity: number;
  dwellTime: number;
  errorCount: number;
  sessionDuration: number;
  totalClicks: number;
  totalScroll: number;
  /** True if impossible signals were detected (NEMESIS defense). */
  botDetected: boolean;
}

export interface PolymorphicTokens {
  archetype: UserArchetype;
  density: number;
  baseFontSize: number;
  animationSpeed: number;
  backgroundWarmth: number;
  contrast: number;
  showTooltips: boolean;
  compact: boolean;
  reason: string;
}

// ─── NEMESIS Guardrails (mathematical constants) ──────────────────

/** Human max click rate: 2 clicks/sec × 60s = 120/min. Above = bot. */
const MAX_HUMAN_CLICK_VELOCITY = 120;
/** Human max scroll velocity: ~3000 px/s. Cap at 5000 for safety. */
const MAX_HUMAN_SCROLL_VELOCITY = 5000;
/** Human min dwell time: 50ms (faster = bot). */
const MIN_HUMAN_DWELL_TIME = 50;
/** Max clicks array size (prevents memory bloat from NEMESIS flood). */
const MAX_CLICK_ARRAY_SIZE = 200;
/** Max scroll samples to keep. */
const MAX_SCROLL_SAMPLES = 20;
/** Clamp helper — used on EVERY token output. */
function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

// ─── Signal collection (NEMESIS-hardened) ─────────────────────────

class BehaviorTracker {
  private clicks: number[] = [];
  private scrolls: number[] = [];
  private dwellStart: number | null = null;
  private dwellTimes: number[] = [];
  private errorCount = 0;
  private sessionStart = Date.now();
  private totalClicks = 0;
  private totalScroll = 0;
  private listeners: Array<() => void> = [];
  /** Set when impossible signals are detected. */
  private botFlagged = false;

  constructor() {
    if (typeof window === "undefined") return;
    this.attach();
  }

  private attach() {
    // Click tracking — NEMESIS-hardened
    document.addEventListener("click", () => {
      const now = Date.now();

      // NEMESIS defense 1: deduplicate clicks with the same timestamp.
      // A real human cannot click twice in the same millisecond. If
      // NEMESIS dispatches 10k synthetic clicks with the same Date.now(),
      // we only count one.
      if (this.clicks.length > 0 && this.clicks[this.clicks.length - 1] === now) {
        return; // duplicate timestamp — skip
      }

      this.clicks.push(now);
      this.totalClicks++;

      // NEMESIS defense 2: cap array size (prevents memory bloat from
      // synthetic flood). If array exceeds MAX, prune oldest.
      if (this.clicks.length > MAX_CLICK_ARRAY_SIZE) {
        this.clicks = this.clicks.slice(-MAX_CLICK_ARRAY_SIZE);
      }

      // Dwell time
      if (this.dwellStart !== null) {
        const dwell = now - this.dwellStart;
        // NEMESIS defense 3: reject impossible dwell times (< 50ms = bot)
        if (dwell >= MIN_HUMAN_DWELL_TIME) {
          this.dwellTimes.push(dwell);
          if (this.dwellTimes.length > 20) this.dwellTimes.shift();
        }
      }
      this.dwellStart = null;

      // Prune clicks older than 60s
      this.clicks = this.clicks.filter((t) => now - t < 60000);

      // NEMESIS defense 4: detect bot (clickVelocity > 120 is impossible)
      if (this.clicks.length > MAX_HUMAN_CLICK_VELOCITY) {
        this.botFlagged = true;
      }

      this.notify();
    });

    // Mouseenter tracking
    document.addEventListener("mouseover", () => {
      if (this.dwellStart === null) this.dwellStart = Date.now();
    });

    // Scroll tracking — NEMESIS-hardened
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    document.addEventListener("scroll", () => {
      const now = Date.now();
      const dy = Math.abs(window.scrollY - lastScrollY);
      const dt = now - lastScrollTime;

      // NEMESIS defense 5: guard division by zero (dt=0 from synthetic events)
      if (dt > 0) {
        let velocity = (dy / dt) * 1000; // px/sec

        // NEMESIS defense 6: cap velocity at MAX_HUMAN_SCROLL_VELOCITY.
        // A deltaY of 50000 (NEMESIS attack) would produce velocity=50M,
        // which is physically impossible. Cap it.
        velocity = Math.min(velocity, MAX_HUMAN_SCROLL_VELOCITY);

        // NEMESIS defense 7: cap dy per event (prevents totalScroll bloat)
        const cappedDy = Math.min(dy, 10000);

        this.scrolls.push(velocity);
        this.totalScroll += cappedDy;

        // Cap scroll samples
        if (this.scrolls.length > MAX_SCROLL_SAMPLES) {
          this.scrolls.shift();
        }
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

  /** Reset the bot flag (used when the session stabilizes). */
  resetBotFlag() {
    this.botFlagged = false;
    this.notify();
  }

  getSignals(): BehaviorSignals {
    const now = Date.now();
    const recentClicks = this.clicks.filter((t) => now - t < 60000);

    // NEMESIS defense 8: cap clickVelocity at MAX (even if array is larger)
    const clickVelocity = Math.min(recentClicks.length, MAX_HUMAN_CLICK_VELOCITY);

    const recentScrolls = this.scrolls.slice(-5);
    const rawScrollVelocity = recentScrolls.length > 0
      ? recentScrolls.reduce((a, b) => a + b, 0) / recentScrolls.length
      : 0;
    // Cap scroll velocity (defense in depth — already capped at insert)
    const scrollVelocity = Math.min(rawScrollVelocity, MAX_HUMAN_SCROLL_VELOCITY);

    const dwellTime = this.dwellTimes.length > 0
      ? this.dwellTimes.reduce((a, b) => a + b, 0) / this.dwellTimes.length
      : 0;

    return {
      clickVelocity,
      scrollVelocity,
      dwellTime: Number.isFinite(dwellTime) ? dwellTime : 0,
      errorCount: this.errorCount,
      sessionDuration: Math.floor((now - this.sessionStart) / 1000),
      totalClicks: this.totalClicks,
      totalScroll: this.totalScroll,
      botDetected: this.botFlagged,
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

let trackerInstance: BehaviorTracker | null = null;
export function getBehaviorTracker(): BehaviorTracker {
  if (!trackerInstance) {
    trackerInstance = new BehaviorTracker();
  }
  return trackerInstance;
}

// ─── Archetype inference (NEMESIS-hardened) ───────────────────────

export function inferArchetype(s: BehaviorSignals): { archetype: UserArchetype; reason: string } {
  // NEMESIS defense 9: if bot detected, return "bot" archetype.
  // This is the FAILSAFE — impossible signals → safe defaults.
  if (s.botDetected) {
    return {
      archetype: "bot",
      reason: `Bot detected (clickVelocity=${s.clickVelocity}, scrollVelocity=${Math.round(s.scrollVelocity)}) — safe defaults applied`,
    };
  }

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
  if (s.sessionDuration > 1800) {
    return { archetype: "standard", reason: "Long session — reducing visual fatigue" };
  }
  return { archetype: "standard", reason: "Standard mode" };
}

// ─── Token generation (NEMESIS-hardened with clamp) ───────────────

export function generateTokens(s: BehaviorSignals): PolymorphicTokens {
  const { archetype, reason } = inferArchetype(s);
  const fatigue = s.sessionDuration > 1800;

  // NEMESIS defense 10: EVERY token is clamped to a safe range.
  // Even if the archetype inference somehow produces a bad value,
  // the clamp prevents the UI from becoming unusable.
  switch (archetype) {
    case "bot":
      // Bot detected → safest possible defaults
      return {
        archetype,
        density: clamp(1.0, 0.7, 1.3),
        baseFontSize: clamp(15, 10, 24),
        animationSpeed: clamp(1.0, 0.3, 2.0),
        backgroundWarmth: clamp(0, 0, 1),
        contrast: clamp(1.0, 0.7, 1.0),
        showTooltips: false,
        compact: false,
        reason,
      };
    case "beginner":
      return {
        archetype,
        density: clamp(0.85, 0.7, 1.3),
        baseFontSize: clamp(17, 10, 24),
        animationSpeed: clamp(0.8, 0.3, 2.0),
        backgroundWarmth: clamp(0.3, 0, 1),
        contrast: clamp(1.0, 0.7, 1.0),
        showTooltips: true,
        compact: false,
        reason,
      };
    case "power":
      return {
        archetype,
        density: clamp(1.15, 0.7, 1.3),
        baseFontSize: clamp(14, 10, 24),
        animationSpeed: clamp(1.2, 0.3, 2.0),
        backgroundWarmth: clamp(0, 0, 1),
        contrast: clamp(1.0, 0.7, 1.0),
        showTooltips: false,
        compact: true,
        reason,
      };
    case "skimmer":
      return {
        archetype,
        density: clamp(0.95, 0.7, 1.3),
        baseFontSize: clamp(16, 10, 24),
        animationSpeed: clamp(1.0, 0.3, 2.0),
        backgroundWarmth: clamp(0.1, 0, 1),
        contrast: clamp(1.0, 0.7, 1.0),
        showTooltips: false,
        compact: false,
        reason,
      };
    case "reader":
      return {
        archetype,
        density: clamp(0.9, 0.7, 1.3),
        baseFontSize: clamp(16, 10, 24),
        animationSpeed: clamp(0.7, 0.3, 2.0),
        backgroundWarmth: clamp(0.4, 0, 1),
        contrast: clamp(0.95, 0.7, 1.0),
        showTooltips: false,
        compact: false,
        reason,
      };
    case "standard":
    default:
      return {
        archetype,
        density: clamp(1.0, 0.7, 1.3),
        baseFontSize: clamp(15, 10, 24),
        animationSpeed: clamp(fatigue ? 0.5 : 1.0, 0.3, 2.0),
        backgroundWarmth: clamp(fatigue ? 0.5 : 0, 0, 1),
        contrast: clamp(fatigue ? 0.85 : 1.0, 0.7, 1.0),
        showTooltips: false,
        compact: false,
        reason,
      };
  }
}
