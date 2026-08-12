"use client";

import { useState, useEffect, useMemo } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../components/tokens";
import {
  ShieldCheck,
  Scale,
  Hash,
  Check,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  ACCESS PAGE — Invitation acceptance (3000% polish)
//
//  URL: /atelier/access?token=XXX
//
//  Flow:
//  1. User clicks the link admin sent them
//  2. This page loads, fetches invitation details via GET /api/access
//  3. Shows: "Bienvenue. Votre acces est pret."
//  4. User MUST set their own password (no temporary password)
//  5. User clicks "Activer mon compte" → POST /api/access
//  6. Success state: sage checkmark bounce + confetti (1.4s)
//  7. Account is created → user is signed in → redirected to Console
//
//  Preserved: GET fetch, POST activation, signIn redirect fallback.
// ═══════════════════════════════════════════════════════════════

// ─── Design tokens (sage override) ───────────────────────────────
const SAGE = "#4A7B5F";
const SAGE_LIGHT = "#5B9078";
const SAGE_TINT = "rgba(74,123,95,0.06)";
const SAGE_TINT_STRONG = "rgba(74,123,95,0.12)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const AMBER = "#F59E0B";
const AMBER_TINT = "rgba(245,158,11,0.12)";
const RED = "#EF4444";
const RED_TINT = "rgba(239,68,68,0.10)";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

interface InvitationData {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: string;
  company: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  status: string;
}

// ─── Password strength scoring ──────────────────────────────────
// 0-1 = weak (red) · 2-3 = medium (amber) · 4-5 = strong (sage)
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_CONFIG: Record<
  "weak" | "medium" | "strong" | "none",
  { label: string; color: string; bg: string; segments: number }
> = {
  none: { label: "—", color: "#9CA3AF", bg: "#F0F0F0", segments: 0 },
  weak: { label: "Faible", color: RED, bg: RED_TINT, segments: 1 },
  medium: { label: "Moyen", color: AMBER, bg: AMBER_TINT, segments: 2 },
  strong: { label: "Fort", color: SAGE, bg: SAGE_TINT_STRONG, segments: 3 },
};

function getStrength(score: number): "none" | "weak" | "medium" | "strong" {
  if (score === 0) return "none";
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export function AccessPage({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activating, setActivating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/access?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invitation invalide");
        } else {
          setInvitation(data);
        }
      } catch {
        setError("Erreur reseau");
      }
      setLoading(false);
    })();
  }, [token]);

  const strengthScore = useMemo(() => scorePassword(password), [password]);
  const strength = getStrength(strengthScore);
  const strengthConfig = STRENGTH_CONFIG[strength];

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const canActivate =
    password.length >= 8 && passwordsMatch && !activating;

  const handleActivate = async () => {
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setActivating(true);

    try {
      const res = await fetch(`/api/access?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Echec de l'activation");
        setActivating(false);
        return;
      }

      // Show success state (sage checkmark bounce + confetti) before redirect
      setSuccess(true);

      // Account created — now sign in with the password the user just set
      // Small delay so the user sees the success animation.
      await new Promise((r) => setTimeout(r, 1400));

      const result = await signIn("credentials", {
        email: invitation?.email,
        password,
        redirect: false,
        callbackUrl: "/atelier/console",
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        // Fallback: redirect to login
        window.location.href = "/atelier/login?activated=true";
      }
    } catch {
      setError("Erreur reseau");
      setActivating(false);
      setSuccess(false);
    }
  };

  // ─── Loading state: 3 bouncing sage dots ─────────────────────
  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <style>{accessCss}</style>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={brandBadgeStyle}
          >
            <span style={brandBadgeDotStyle} aria-hidden="true" />
            <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
          </motion.div>
          <div style={loadingDotsWrapperStyle} aria-label="Chargement en cours">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={loadingDotStyle}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
              />
            ))}
          </div>
          <div style={{ color: C.textMuted, fontFamily: FONT_MONO, fontSize: "12px", letterSpacing: "0.08em" }}>
            Verification de l&rsquo;invitation…
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Error / invalid token state ─────────────────────────────
  if (error && !invitation) {
    return (
      <div style={pageWrapperStyle}>
        <style>{accessCss}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          style={cardStyle}
          className="harch-access-card"
        >
          <div style={sageStripeStyle} aria-hidden="true" />
          <div style={{ padding: "8px 8px 0", position: "relative" }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ ...brandBadgeStyle, marginBottom: "24px" }}
            >
              <span style={brandBadgeDotStyle} aria-hidden="true" />
              <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={errorIconWrapStyle}>
                <AlertCircle size={20} strokeWidth={2} color={RED} />
              </div>
              <h1 style={{ ...cardTitleStyle, margin: 0 }}>Acces refuse</h1>
            </div>
            <p style={cardBodyStyle}>{error}</p>
            <a href="/atelier/request-access" className="harch-link-underline" style={primaryLinkStyle}>
              Demander un nouvel acces
            </a>
          </div>
        </motion.div>

        <TrustBadges />
      </div>
    );
  }

  // ─── Already activated state ─────────────────────────────────
  if (invitation?.status === "already_used") {
    return (
      <div style={pageWrapperStyle}>
        <style>{accessCss}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          style={cardStyle}
          className="harch-access-card"
        >
          <div style={sageStripeStyle} aria-hidden="true" />
          <div style={{ padding: "8px 8px 0", position: "relative" }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ ...brandBadgeStyle, marginBottom: "24px" }}
            >
              <span style={brandBadgeDotStyle} aria-hidden="true" />
              <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={successIconWrapStyle}>
                <Check size={20} strokeWidth={2.5} color={SAGE} />
              </div>
              <h1 style={{ ...cardTitleStyle, margin: 0 }}>Compte deja active</h1>
            </div>
            <p style={cardBodyStyle}>
              Cette invitation a deja ete utilisee. Votre compte est pret.
            </p>
            <a href="/atelier/login" style={primaryButtonStyle} className="harch-primary-btn">
              Se connecter
              <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: "6px" }} />
            </a>
          </div>
        </motion.div>

        <TrustBadges />
      </div>
    );
  }

  // ─── Expired state ───────────────────────────────────────────
  if (invitation?.status === "expired") {
    return (
      <div style={pageWrapperStyle}>
        <style>{accessCss}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          style={cardStyle}
          className="harch-access-card"
        >
          <div style={sageStripeStyle} aria-hidden="true" />
          <div style={{ padding: "8px 8px 0", position: "relative" }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ ...brandBadgeStyle, marginBottom: "24px" }}
            >
              <span style={brandBadgeDotStyle} aria-hidden="true" />
              <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={errorIconWrapStyle}>
                <AlertCircle size={20} strokeWidth={2} color={RED} />
              </div>
              <h1 style={{ ...cardTitleStyle, margin: 0 }}>Invitation expiree</h1>
            </div>
            <p style={cardBodyStyle}>
              Cette invitation a expire. Contactez l&rsquo;equipe Harch Atelier pour en obtenir une nouvelle.
            </p>
            <a href="/atelier/request-access" className="harch-link-underline" style={primaryLinkStyle}>
              Demander un nouvel acces
            </a>
          </div>
        </motion.div>

        <TrustBadges />
      </div>
    );
  }

  const accountTypeLabel: Record<string, string> = {
    "brand-monitor": "Brand Monitor",
    "market-competitor": "Market & Competitor",
    "investment-bank": "Investment Bank",
    "harch-alpha": "Harch Alpha",
  };

  const firstName = invitation?.name?.split(" ")[0] || "";

  // ─── Success state: sage checkmark bounce + confetti ─────────
  if (success) {
    return (
      <div style={pageWrapperStyle}>
        <style>{accessCss}</style>
        {/* Confetti layer */}
        <div style={confettiLayerStyle} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => {
            const left = (i * 5.5 + (i % 3) * 3) % 100;
            const delay = (i % 6) * 0.08;
            const isSage = i % 3 === 0;
            const isCharcoal = i % 3 === 1;
            const bg = isSage ? SAGE : isCharcoal ? CHARCOAL : SAGE_LIGHT;
            const size = 6 + (i % 3) * 2;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -20, x: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [0, 280, 480],
                  x: [(i % 2 === 0 ? -1 : 1) * 20, (i % 2 === 0 ? -1 : 1) * 60],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.6,
                  delay,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: "30%",
                  width: size,
                  height: size,
                  background: bg,
                  borderRadius: i % 2 === 0 ? "2px" : "50%",
                }}
              />
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", position: "relative", zIndex: 2 }}
        >
          {/* Sage checkmark bounce */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 14 }}
            style={checkmarkCircleStyle}
          >
            <motion.span
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              style={{ display: "flex" }}
            >
              <Check size={40} strokeWidth={3} color={WHITE} />
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ textAlign: "center" }}
          >
            <h1 style={{ ...cardTitleStyle, textAlign: "center", margin: "0 0 8px", fontSize: "24px" }}>
              Compte active
            </h1>
            <p style={{ ...cardBodyStyle, textAlign: "center", margin: 0 }}>
              Redirection vers votre console…
            </p>
          </motion.div>

          {/* Inline 3-dot loader */}
          <div style={loadingDotsWrapperStyle}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={loadingDotStyleSage}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main invitation form ────────────────────────────────────
  return (
    <div style={pageWrapperStyle}>
      <style>{accessCss}</style>

      {/* Page entrance: fade + slide up */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {/* Card entrance: scale 0.95 → 1 + fade (spring) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          style={{ ...cardStyle, position: "relative" }}
          className="harch-access-card"
        >
          {/* Sage accent stripe */}
          <div style={sageStripeStyle} aria-hidden="true" />

          <div style={{ padding: "8px 8px 0", position: "relative" }}>
            {/* Brand badge with float */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={brandBadgeStyle}
            >
              <span style={brandBadgeDotStyle} aria-hidden="true" />
              <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
            </motion.div>

            {/* Eyebrow */}
            <div style={eyebrowStyle}>Invitation acceptee</div>

            {/* Title */}
            <h1 style={titleStyle}>
              Bienvenue, {firstName}.
            </h1>

            <p style={subTitleStyle}>
              Merci de rejoindre Harch Atelier. Creez votre mot de passe pour activer votre compte.
            </p>

            {/* Pre-filled info — sage bg tint, monospace labels */}
            <div style={accountCardStyle}>
              <div style={accountCardHeaderStyle}>Votre compte</div>
              <div style={accountGridStyle}>
                <div>
                  <div style={accountLabelStyle}>Nom</div>
                  <div style={accountValueStyle}>{invitation?.name}</div>
                </div>
                <div>
                  <div style={accountLabelStyle}>Email</div>
                  <div style={accountValueStyle}>{invitation?.email}</div>
                </div>
                <div>
                  <div style={accountLabelStyle}>Type de compte</div>
                  <div style={{ ...accountValueStyle, color: SAGE }}>
                    {invitation ? accountTypeLabel[invitation.accountType] || invitation.accountType : "—"}
                  </div>
                </div>
                {invitation?.company && (
                  <div>
                    <div style={accountLabelStyle}>Entreprise</div>
                    <div style={accountValueStyle}>{invitation.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Password field with strength meter */}
            <div style={{ marginBottom: "16px" }}>
              <label style={fieldLabelStyle}>
                Creez votre mot de passe *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caracteres"
                  required
                  className="harch-access-input"
                  style={{ paddingRight: "44px" }}
                  autoFocus
                  aria-label="Creez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="harch-eye-btn"
                  style={eyeButtonStyle}
                  tabIndex={0}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.span
                        key="eye-off"
                        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <EyeOff size={16} strokeWidth={2} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="eye"
                        initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <Eye size={16} strokeWidth={2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Password strength meter */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden", marginTop: "8px" }}
                  >
                    <div style={strengthBarWrapperStyle}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            ...strengthBarSegmentStyle,
                            background: i < strengthConfig.segments ? strengthConfig.color : "#F0F0F0",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ ...strengthLabelStyle, color: strengthConfig.color }}>
                      {strength !== "none" && `Robustesse: ${strengthConfig.label}`}
                      {strength === "none" && "Entrez un mot de passe"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm password with real-time match indicator */}
            <div style={{ marginBottom: "20px" }}>
              <label style={fieldLabelStyle}>
                Confirmez votre mot de passe *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-saisissez votre mot de passe"
                  required
                  className="harch-access-input"
                  style={{
                    paddingRight: "44px",
                    ...(passwordsMismatch
                      ? { borderColor: RED, boxShadow: `0 0 0 3px ${RED_TINT}` }
                      : passwordsMatch
                        ? { borderColor: SAGE, boxShadow: `0 0 0 3px ${SAGE_TINT_STRONG}` }
                        : {}),
                  }}
                  aria-label="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="harch-eye-btn"
                  style={eyeButtonStyle}
                  tabIndex={0}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showConfirm ? (
                      <motion.span
                        key="confirm-eye-off"
                        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <EyeOff size={16} strokeWidth={2} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="confirm-eye"
                        initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <Eye size={16} strokeWidth={2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Real-time match indicator */}
              <AnimatePresence>
                {confirmPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden", marginTop: "8px" }}
                  >
                    {passwordsMatch ? (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ ...matchIndicatorStyle, color: SAGE }}
                      >
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          style={{ display: "flex" }}
                        >
                          <Check size={13} strokeWidth={3} color={SAGE} />
                        </motion.span>
                        Les mots de passe correspondent
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ ...matchIndicatorStyle, color: RED }}
                      >
                        <AlertCircle size={13} strokeWidth={2} color={RED} />
                        Les mots de passe ne correspondent pas
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error banner with shake */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="activation-error"
                  initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    y: [0, -2, 2, -2, 2, 0],
                    height: "auto",
                    marginBottom: 16,
                  }}
                  exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div role="alert" style={errorBannerStyle}>
                    <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activate button — disabled until passwords match + min 8 chars */}
            <motion.button
              onClick={handleActivate}
              disabled={!canActivate}
              whileHover={canActivate ? { scale: 1.02 } : undefined}
              whileTap={canActivate ? { scale: 0.98 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="harch-submit-btn"
              style={{
                ...activateButtonStyle,
                background: canActivate ? CHARCOAL : "#E5E5E5",
                color: canActivate ? WHITE : "#9CA3AF",
                cursor: canActivate ? "pointer" : "not-allowed",
              }}
            >
              {activating ? (
                <span style={loadingDotsWrapperStyle} aria-label="Activation en cours">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      style={loadingDotStyle}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.18,
                      }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  <span>Activer mon compte</span>
                  <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: "6px" }} />
                </>
              )}
            </motion.button>

            {/* Helper text */}
            <div style={helperTextStyle}>
              En activant votre compte, vous vous engagez a utiliser
              Harch Atelier de maniere responsable et a garder vos
              identifiants confidentiels.
            </div>
          </div>
        </motion.div>

        <TrustBadges />
      </motion.div>
    </div>
  );
}

// ─── Trust badges row (shared) ──────────────────────────────────
function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={trustBadgesStyle}
    >
      <span style={trustBadgeStyle}>
        <ShieldCheck size={12} strokeWidth={2} style={{ color: SAGE }} />
        Conforme CNDP
      </span>
      <span style={dotStyle} aria-hidden="true" />
      <span style={trustBadgeStyle}>
        <Scale size={12} strokeWidth={2} style={{ color: SAGE }} />
        Loi 09-08
      </span>
      <span style={dotStyle} aria-hidden="true" />
      <span style={trustBadgeStyle}>
        <Hash size={12} strokeWidth={2} style={{ color: SAGE }} />
        Audit SHA-256
      </span>
    </motion.div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────
const accessCss = `
  .harch-access-input {
    width: 100%;
    height: 44px;
    border: 1px solid #E5E5E5;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #FAFAFA;
    color: ${CHARCOAL};
    box-sizing: border-box;
    outline: none;
    font-family: inherit;
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }
  .harch-access-input::placeholder {
    color: #9CA3AF;
  }
  .harch-access-input:focus {
    border-color: ${SAGE};
    background: ${WHITE};
    box-shadow: 0 0 0 3px ${SAGE_TINT_STRONG};
  }

  .harch-link-underline {
    position: relative;
    text-decoration: none;
    transition: color 180ms ease;
    display: inline-block;
  }
  .harch-link-underline::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .harch-link-underline:hover::after {
    transform: scaleX(1);
  }

  .harch-submit-btn:not(:disabled):hover {
    background: #1A1A1A !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }

  .harch-eye-btn:hover {
    color: ${SAGE};
    background: ${SAGE_TINT};
  }

  .harch-primary-btn:hover {
    background: #1A1A1A !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }

  @media (max-width: 480px) {
    .harch-access-card {
      max-width: 92% !important;
      padding: 32px 22px !important;
    }
  }
`;

// ─── Styles ──────────────────────────────────────────────────────

const pageWrapperStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundImage: `radial-gradient(circle, ${SAGE_TINT} 1px, transparent 1px), linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)`,
  backgroundSize: "24px 24px, 100% 100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  fontFamily: FONT_SANS,
  color: CHARCOAL,
  position: "relative",
  overflow: "hidden",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  background: WHITE,
  borderRadius: "16px",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0,0,0,0.04)",
  border: "1px solid #F0F0F0",
  padding: "40px",
  boxSizing: "border-box",
};

const sageStripeStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "4px",
  background: `linear-gradient(180deg, ${SAGE} 0%, ${SAGE_LIGHT} 100%)`,
};

const brandBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 12px",
  background: SAGE_TINT,
  border: `1px solid ${SAGE_TINT_STRONG}`,
  borderRadius: "100px",
  marginBottom: "20px",
};

const brandBadgeDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: SAGE,
  boxShadow: `0 0 0 3px ${SAGE_TINT_STRONG}`,
};

const brandBadgeTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  color: SAGE,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: FONT_MONO,
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "10px",
  color: SAGE,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "10px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(26px, 5vw, 32px)",
  fontWeight: 700,
  color: CHARCOAL,
  letterSpacing: "-0.02em",
  margin: "0 0 10px",
  fontFamily: FONT_SANS,
};

const subTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: C.textBody,
  lineHeight: 1.6,
  margin: "0 0 28px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: CHARCOAL,
  letterSpacing: "-0.02em",
};

const cardBodyStyle: React.CSSProperties = {
  fontSize: "14px",
  color: C.textBody,
  lineHeight: 1.6,
  marginBottom: "20px",
};

// Account details card — sage bg tint
const accountCardStyle: React.CSSProperties = {
  padding: "20px",
  background: SAGE_TINT,
  border: `1px solid ${SAGE_TINT_STRONG}`,
  borderRadius: "12px",
  marginBottom: "28px",
};

const accountCardHeaderStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "10px",
  color: SAGE,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "14px",
  fontWeight: 700,
};

const accountGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: "16px",
};

const accountLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  color: SAGE,
  fontFamily: FONT_MONO,
  marginBottom: "4px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 700,
};

const accountValueStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: CHARCOAL,
  fontFamily: FONT_SANS,
  wordBreak: "break-word",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: FONT_MONO,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "8px",
  fontWeight: 700,
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  padding: "6px",
  cursor: "pointer",
  color: "#71717A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  transition: "color 180ms ease, background 180ms ease",
};

// Strength meter
const strengthBarWrapperStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
};

const strengthBarSegmentStyle: React.CSSProperties = {
  flex: 1,
  height: "3px",
  borderRadius: "2px",
  background: "#F0F0F0",
  transition: "background 240ms ease",
};

const strengthLabelStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "11px",
  fontFamily: FONT_MONO,
  letterSpacing: "0.04em",
};

// Match indicator
const matchIndicatorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontFamily: FONT_SANS,
  fontWeight: 500,
};

// Error banner
const errorBannerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "10px",
  fontSize: "13px",
  color: "#991B1B",
  fontFamily: FONT_SANS,
};

const errorIconWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  background: RED_TINT,
  borderRadius: "50%",
  flexShrink: 0,
};

const successIconWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  background: SAGE_TINT_STRONG,
  borderRadius: "50%",
  flexShrink: 0,
};

// Activate button
const activateButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "44px",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: FONT_SANS,
  transition: "background 180ms ease, color 180ms ease",
};

const helperTextStyle: React.CSSProperties = {
  marginTop: "16px",
  fontSize: "11px",
  color: C.textMuted,
  fontFamily: FONT_MONO,
  textAlign: "center",
  lineHeight: 1.6,
  letterSpacing: "0.02em",
};

// Primary link / button
const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "13px",
  color: SAGE,
  fontWeight: 600,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 20px",
  background: CHARCOAL,
  color: WHITE,
  fontSize: "13px",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "10px",
  fontFamily: FONT_SANS,
  transition: "background 180ms ease",
};

// Loading dots (white, for charcoal button bg)
const loadingDotsWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  height: "14px",
};

const loadingDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: WHITE,
  display: "inline-block",
};

const loadingDotStyleSage: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: SAGE,
  display: "inline-block",
};

// Success state — checkmark circle
const checkmarkCircleStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${SAGE} 0%, ${SAGE_LIGHT} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 12px 32px ${SAGE_TINT_STRONG}`,
};

// Confetti layer
const confettiLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 1,
};

// Trust badges
const trustBadgesStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "32px",
  flexWrap: "wrap",
};

const trustBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "11px",
  color: "#9CA3AF",
  textAlign: "center",
  fontFamily: FONT_MONO,
  letterSpacing: "0.04em",
};

const dotStyle: React.CSSProperties = {
  width: "3px",
  height: "3px",
  borderRadius: "50%",
  background: "#D4D4D4",
  display: "inline-block",
};
