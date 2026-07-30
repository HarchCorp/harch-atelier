import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "clamp(80px, 15vw, 160px)",
          fontWeight: 800,
          color: "#e5e5e5",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          marginBottom: "24px",
        }}
      >
        404
      </div>

      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#0a0a0a",
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          fontSize: "15px",
          color: "#525252",
          textAlign: "center",
          maxWidth: "400px",
          lineHeight: 1.5,
          marginBottom: "32px",
        }}
      >
        The page you're looking for doesn't exist or has been moved. Let's get
        you back on track.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/atelier"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "44px",
            padding: "0 24px",
            background: "#10b981",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "4px",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
        >
          Back to Harch Atelier
        </Link>
        <Link
          href="/atelier/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "44px",
            padding: "0 24px",
            background: "transparent",
            color: "#525252",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "4px",
            border: "1px solid #e5e5e5",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
