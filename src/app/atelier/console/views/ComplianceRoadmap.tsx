"use client";

// ═══════════════════════════════════════════════════════════════
//  COMPLIANCE ROADMAP — SOC 2 + ISO 27001 + Loi 09-08 + RGPD
//
//  The competitive analysis report identifies SOC 2 Type II + ISO
//  27001 as the critical transition factor from Niveau 1 to Niveau 2.
//  "Obtenir la certification SOC 2 Type II et ISO 27001 pour
//  satisfaire aux exigences des DSI des grands groupes."
//
//  This widget tracks the compliance journey with milestones,
//  deadlines, and estimated costs. The Dircom can see exactly
//  what's needed to unlock enterprise contracts.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

type ComplianceStatus = "done" | "in_progress" | "planned" | "not_started";

interface ComplianceItem {
  framework: string;
  item: string;
  status: ComplianceStatus;
  deadline: string;
  cost: string;
  impact: string;
}

const STATUS_META: Record<ComplianceStatus, { label: string; color: string; bg: string; icon: string }> = {
  done: { label: "DONE", color: C.cta, bg: "#ecfdf5", icon: "✓" },
  in_progress: { label: "IN PROGRESS", color: C.info, bg: "#eff6ff", icon: "◐" },
  planned: { label: "PLANNED", color: C.warning, bg: "#fffbeb", icon: "△" },
  not_started: { label: "NOT STARTED", color: C.textMuted, bg: C.surfaceAlt, icon: "○" },
};

const ITEMS: ComplianceItem[] = [
  // Loi 09-08 (CNDP Maroc) — most urgent, local requirement
  { framework: "Loi 09-08", item: "Déclaration CNDP comme sous-traitant", status: "planned", deadline: "Q4 2026", cost: "5K MAD", impact: "Unblocks all Moroccan enterprise contracts" },
  { framework: "Loi 09-08", item: "Désignation d'un correspondant CNDP", status: "not_started", deadline: "Q4 2026", cost: "0 MAD", impact: "Legal requirement for data processing" },
  { framework: "Loi 09-08", item: "Registre des traitements (ROPA)", status: "not_started", deadline: "Q1 2027", cost: "0 MAD", impact: "Audit trail for all data processing" },

  // RGPD (EU) — for European subsidiaries
  { framework: "RGPD", item: "Représentant UE (Article 27)", status: "not_started", deadline: "Q1 2027", cost: "15K MAD/an", impact: "Required for EU clients" },
  { framework: "RGPD", item: "Notification de violation 72h", status: "planned", deadline: "Q4 2026", cost: "0 MAD", impact: "Incident response runbook" },

  // ISO 27001 — the big one for enterprise
  { framework: "ISO 27001", item: "Gap assessment + risk register", status: "planned", deadline: "Q1 2027", cost: "50K MAD", impact: "Baseline for ISMS" },
  { framework: "ISO 27001", item: "ISMS implementation (policies + procedures)", status: "not_started", deadline: "Q2 2027", cost: "80K MAD", impact: "54 controls documentation" },
  { framework: "ISO 27001", item: "Internal audit + management review", status: "not_started", deadline: "Q3 2027", cost: "30K MAD", impact: "Pre-certification readiness" },
  { framework: "ISO 27001", item: "Stage 1 + Stage 2 certification audit", status: "not_started", deadline: "Q4 2027", cost: "120K MAD", impact: "Unlocks Sovereign tier contracts (banks, OCP, gov)" },

  // SOC 2 Type II — for US/international clients
  { framework: "SOC 2", item: "SOC 2 Type I (point-in-time)", status: "not_started", deadline: "Q2 2027", cost: "100K MAD", impact: "Initial trust signal" },
  { framework: "SOC 2", item: "SOC 2 Type II (12-month observation)", status: "not_started", deadline: "Q4 2027", cost: "150K MAD", impact: "Enterprise procurement gate" },

  // Pentest + security
  { framework: "Security", item: "Pentest annuel (tiers indépendant)", status: "planned", deadline: "Q4 2026", cost: "40K MAD", impact: "Contract requirement for Sovereign" },
  { framework: "Security", item: "SAST/DAST in CI/CD", status: "in_progress", deadline: "Q4 2026", cost: "0 MAD", impact: "Code-level security" },
  { framework: "Security", item: "2FA mandatory (TOTP)", status: "done", deadline: "Done", cost: "0 MAD", impact: "Account security baseline" },
  { framework: "Security", item: "TLS 1.3 + AES-256 at rest", status: "done", deadline: "Done", cost: "0 MAD", impact: "Transport + storage encryption" },
  { framework: "Security", item: "Audit logs (12 months retention)", status: "done", deadline: "Done", cost: "0 MAD", impact: "Compliance audit trail" },
];

const FRAMEWORK_COLORS: Record<string, string> = {
  "Loi 09-08": "#a0524b",
  "RGPD": "#3b82f6",
  "ISO 27001": "#1e3a5f",
  "SOC 2": "#4a7b5f",
  "Security": "#78716c",
};

export function ComplianceRoadmap() {
  const frameworks = [...new Set(ITEMS.map((i) => i.framework))];
  const doneCount = ITEMS.filter((i) => i.status === "done").length;
  const totalCount = ITEMS.length;
  const totalCost = ITEMS.filter((i) => i.status !== "done")
    .reduce((sum, i) => {
      const num = parseInt(i.cost.replace(/[^0-9]/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Compliance Roadmap
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>
            Niveau 1 → Niveau 2 transition · SOC 2 + ISO 27001 + Loi 09-08 + RGPD
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: C.cta }}>{doneCount}/{totalCount}</div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>ITEMS DONE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: C.warning }}>{totalCost.toLocaleString()}K</div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>MAD BUDGET</div>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div style={{ height: "8px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ height: "100%", width: `${(doneCount / totalCount) * 100}%`, background: `linear-gradient(90deg, ${C.cta}, ${C.accent})`, borderRadius: "4px", transition: "width 1s ease-out" }} />
      </div>

      {/* Framework tabs (visual) */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {frameworks.map((fw) => {
          const fwItems = ITEMS.filter((i) => i.framework === fw);
          const fwDone = fwItems.filter((i) => i.status === "done").length;
          const color = FRAMEWORK_COLORS[fw];
          return (
            <div key={fw} style={{ padding: "6px 12px", borderRadius: "6px", background: color + "10", border: `1px solid ${color}30`, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color }}>{fw}</span>
              <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>{fwDone}/{fwItems.length}</span>
            </div>
          );
        })}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {ITEMS.map((item, i) => {
          const meta = STATUS_META[item.status];
          const color = FRAMEWORK_COLORS[item.framework];
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 80px 1fr auto auto auto",
                gap: "10px",
                alignItems: "center",
                padding: "10px 12px",
                background: item.status === "done" ? C.surfaceAlt : C.surface,
                borderRadius: "8px",
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${color}`,
                opacity: item.status === "done" ? 0.7 : 1,
              }}
            >
              {/* Status icon */}
              <span style={{ fontSize: "14px", color: meta.color, textAlign: "center", width: "20px" }}>{meta.icon}</span>

              {/* Framework badge */}
              <span style={{ fontFamily: C.fontMono, fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: color + "15", color, textAlign: "center" }}>
                {item.framework}
              </span>

              {/* Item label */}
              <div>
                <span style={{ fontSize: "13px", color: C.text, fontWeight: item.status === "done" ? 400 : 500, textDecoration: item.status === "done" ? "line-through" : "none" }}>
                  {item.item}
                </span>
                <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{item.impact}</div>
              </div>

              {/* Status badge */}
              <span style={{ fontFamily: C.fontMono, fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: meta.bg, color: meta.color }}>
                {meta.label}
              </span>

              {/* Deadline */}
              <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textSec, whiteSpace: "nowrap" }}>{item.deadline}</span>

              {/* Cost */}
              <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 600, color: item.cost === "0 MAD" ? C.cta : C.textSec, whiteSpace: "nowrap" }}>
                {item.cost}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer insight */}
      <div style={{ marginTop: "16px", padding: "12px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>🎯</span>
        <div>
          <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.55 }}>
            <strong>Critical path:</strong> Loi 09-08 déclaration (Q4 2026) → Pentest (Q4 2026) → ISO 27001 gap assessment (Q1 2027) → SOC 2 Type I (Q2 2027) → ISO 27001 cert (Q4 2027) → SOC 2 Type II (Q4 2027).
            Budget total: <strong>{totalCost.toLocaleString()}K MAD</strong>. Sans ça, pas de close Sovereign (Attijariwafa, OCP, Maroc Telecom, ONEE).
          </p>
        </div>
      </div>
    </div>
  );
}
