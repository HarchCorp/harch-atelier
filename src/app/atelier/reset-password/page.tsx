"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

// Minimal reset password page — sage accent, same design system

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form");
  const [error, setError] = useState("");

  // Auto-extract token from URL
  useState(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) setToken(urlToken);
  });

  const passwordsMatch = password === confirm && password.length >= 8;

  const handleSubmit = async () => {
    if (!token) {
      setError("Token manquant. Utilisez le lien reçu par email.");
      setStatus("error");
      return;
    }
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas (min 8 caractères).");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur");
        setStatus("error");
      }
    } catch {
      setError("Erreur réseau");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", fontFamily: "Inter, system-ui, sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ maxWidth: 400, width: "100%", padding: 40, background: "#FFFFFF", border: "1px solid #F0F0F0", borderRadius: 12, textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ width: 64, height: 64, margin: "0 auto 24px", background: "rgba(74,123,95,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CheckCircle2 size={32} color="#4A7B5F" />
          </motion.div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0A", margin: "0 0 8px" }}>Mot de passe réinitialisé</h1>
          <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.6 }}>
            Votre mot de passe a été modifié. Vous pouvez vous connecter.
          </p>
          <a href="/atelier/login" style={{ display: "inline-block", padding: "12px 24px", background: "#0A0A0A", color: "#FFFFFF", fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: 8 }}>
            Se connecter →
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", fontFamily: "Inter, system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 400, width: "100%", padding: 40, background: "#FFFFFF", border: "1px solid #F0F0F0", borderRadius: 12, borderLeft: "4px solid #4A7B5F" }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0A", margin: "0 0 8px" }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.5 }}>
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", display: "flex", gap: 8, alignItems: "center" }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Nouveau mot de passe *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              style={{ width: "100%", height: 42, border: "1px solid #E5E5E5", borderRadius: 8, padding: "0 40px 0 14px", fontSize: 14, background: "#FAFAFA", color: "#0A0A0A", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#71717A" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Confirmer *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Retapez votre mot de passe"
            style={{ width: "100%", height: 42, border: "1px solid #E5E5E5", borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FAFAFA", color: "#0A0A0A", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {confirm.length > 0 && (
            <p style={{ fontSize: 11, marginTop: 4, color: passwordsMatch ? "#4A7B5F" : "#EF4444" }}>
              {passwordsMatch ? "✓ Mots de passe identiques" : "✗ Ne correspondent pas"}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!passwordsMatch || status === "loading"}
          style={{ width: "100%", height: 44, background: passwordsMatch ? "#0A0A0A" : "#E5E5E5", color: passwordsMatch ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: passwordsMatch ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser →"
          )}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/atelier/login" style={{ fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            ← Retour à la connexion
          </a>
        </div>
      </motion.div>
    </div>
  );
}
