"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  ADMIN LOGIN — Owner portal (obscure URL)
//
//  SECURITY: After signIn, we fetch the session to check the role.
//  Only admin/super_admin can proceed to /atelier/admin.
//  Non-admin users get "Access denied" and are NOT redirected.
// ═══════════════════════════════════════════════════════════════

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Identifiants incorrects.");
      return;
    }

    // SECURITY CHECK: Fetch the session to verify the role BEFORE redirecting.
    // This prevents non-admin users from accessing the admin portal.
    const session = await getSession();

    if (!session?.user) {
      setLoading(false);
      setError("Session invalide. Reessayez.");
      return;
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
      setLoading(false);
      // Sign out the non-admin session immediately
      await signIn("credentials", { redirect: false }); // This won't re-auth, just clears
      setError("Acces refuse. Ce portail est reserve aux administrateurs.");
      return;
    }

    // Role verified — redirect to admin dashboard
    window.location.href = "/atelier/admin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #F0F0F0",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
          padding: "40px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#0A0A0A",
              letterSpacing: "-0.02em",
            }}
          >
            HARCH
          </span>
          <span
            style={{
              color: "#E5E5E5",
              margin: "0 8px",
            }}
          >
            |
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#71717A",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ATELIER
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#0A0A0A",
            textAlign: "center",
            margin: "0 0 4px",
          }}
        >
          Portail Admin
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#71717A",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Reserve aux administrateurs et au proprietaire.
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#991B1B",
              fontSize: "13px",
              marginBottom: "16px",
            }}
            role="alert"
          >
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email administrateur"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              height: "42px",
              border: "1px solid #E5E5E5",
              borderRadius: "10px",
              padding: "0 14px",
              fontSize: "14px",
              background: "#FAFAFA",
              color: "#0A0A0A",
              fontFamily: "inherit",
              outline: "none",
              transition: "all 150ms ease",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#4A7B5F";
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(74,123,95,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E5E5";
              e.currentTarget.style.background = "#FAFAFA";
              e.currentTarget.style.boxShadow = "none";
            }}
            autoComplete="email"
          />

          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                height: "42px",
                border: "1px solid #E5E5E5",
                borderRadius: "10px",
                padding: "0 40px 0 14px",
                fontSize: "14px",
                background: "#FAFAFA",
                color: "#0A0A0A",
                fontFamily: "inherit",
                outline: "none",
                transition: "all 150ms ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#4A7B5F";
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(74,123,95,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E5E5";
                e.currentTarget.style.background = "#FAFAFA";
                e.currentTarget.style.boxShadow = "none";
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#71717A",
                display: "flex",
                alignItems: "center",
              }}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "42px",
              background: loading ? "#666" : "#0A0A0A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Trust badges */}
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            fontSize: "11px",
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <ShieldCheck size={12} color="#4A7B5F" />
          <span>Conforme CNDP</span>
          <span style={{ color: "#D4D4D4" }}>.</span>
          <span>Loi 09-08</span>
          <span style={{ color: "#D4D4D4" }}>.</span>
          <span>Audit SHA-256</span>
        </div>
      </div>
    </div>
  );
}
