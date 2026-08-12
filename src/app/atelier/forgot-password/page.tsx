"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "sent">("form");

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setStatus("loading");

    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setStatus("sent");
    } catch {
      setStatus("sent"); // Always show success (don't leak)
    }
  };

  if (status === "sent") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", fontFamily: "Inter, system-ui, sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: 400, width: "100%", padding: 40, background: "#FFFFFF", border: "1px solid #F0F0F0", borderRadius: 12, textAlign: "center", borderLeft: "4px solid #4A7B5F" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ width: 56, height: 56, margin: "0 auto 20px", background: "rgba(74,123,95,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Mail size={24} color="#4A7B5F" />
          </motion.div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", margin: "0 0 8px" }}>Vérifiez votre boîte mail</h1>
          <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.6 }}>
            Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes. Le lien expire dans 1 heure.
          </p>
          <a href="/atelier/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Retour à la connexion
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
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0A0A0A", margin: "0 0 8px" }}>Mot de passe oublié</h1>
        <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.5 }}>
          Saisissez votre email. Vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Email professionnel *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.ma"
            style={{ width: "100%", height: 42, border: "1px solid #E5E5E5", borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FAFAFA", color: "#0A0A0A", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email.trim() || status === "loading"}
          style={{ width: "100%", height: 44, background: email.trim() ? "#0A0A0A" : "#E5E5E5", color: email.trim() ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: email.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Envoi...
            </>
          ) : (
            "Envoyer le lien →"
          )}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/atelier/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Retour
          </a>
        </div>
      </motion.div>
    </div>
  );
}
