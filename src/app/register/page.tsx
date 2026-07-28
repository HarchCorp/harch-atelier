"use client";

// ═══════════════════════════════════════════════════════════════
//  REGISTER PAGE — PROJECT AEGIS v4.0
//
//  Client-side registration form. Validates input with Zod (email
//  format, password ≥ 8 chars, confirm match), POSTs to
//  /api/auth/register, and redirects to /login on success so the
//  user can sign in with their new credentials.
//
//  Styled with inline styles — light theme only.
// ═══════════════════════════════════════════════════════════════

import { useState, type FormEvent, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(80),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8fa",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "1.5rem",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
    padding: "2rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#64748b",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
    textAlign: "center" as const,
  },
  label: {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#334155",
    marginBottom: "0.375rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.75rem",
    fontSize: "0.875rem",
    color: "#0f172a",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  field: { marginBottom: "1rem" },
  button: {
    width: "100%",
    padding: "0.7rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#ffffff",
    background: "#0f766e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  buttonDisabled: {
    background: "#94a3b8",
    cursor: "not-allowed",
  },
  errorBox: {
    padding: "0.625rem 0.75rem",
    fontSize: "0.8125rem",
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  successBox: {
    padding: "0.625rem 0.75rem",
    fontSize: "0.8125rem",
    color: "#15803d",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  link: {
    display: "block",
    textAlign: "center" as const,
    fontSize: "0.8125rem",
    color: "#0f766e",
    textDecoration: "none",
    marginTop: "1.25rem",
  },
  fieldError: {
    fontSize: "0.75rem",
    color: "#b91c1c",
    marginTop: "0.25rem",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = RegisterSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(
          (json && json.error) ||
            `Registration failed (HTTP ${res.status}). Please retry.`,
        );
        setLoading(false);
        return;
      }

      setSuccess("Account created. Redirecting to sign in…");
      // Small delay so the user sees the confirmation before redirect.
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please retry.",
      );
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>
          Create your Harch Atelier account to start running reputation audits.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              disabled={loading}
              placeholder="Jane Doe"
            />
            {fieldErrors.name && (
              <div style={styles.fieldError}>{fieldErrors.name}</div>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
              placeholder="you@company.com"
            />
            {fieldErrors.email && (
              <div style={styles.fieldError}>{fieldErrors.email}</div>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              placeholder="At least 8 characters"
            />
            {fieldErrors.password && (
              <div style={styles.fieldError}>{fieldErrors.password}</div>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              placeholder="Re-enter your password"
            />
            {fieldErrors.confirmPassword && (
              <div style={styles.fieldError}>{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <a href="/login" style={styles.link}>
          Already have an account? Sign in →
        </a>
      </div>
    </div>
  );
}
