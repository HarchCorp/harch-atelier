"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  CRISIS WORKFLOW ENGINE
//
//  Recommendation #3 from the competitive analysis report:
//  "Passer de la simple observation à l'action automatisée
//  (alertes Comex, workflows de crise, matrice de résilience)"
//
//  This widget shows the automated crisis escalation workflow:
//    L1 (Analyst) → L2 (Management) → L3 (Comex)
//  with SLA timers, playbook templates, and auto-escalation.
//
//  Pattern: Dataminr First Alert + PeakMetrics workflow + Signal AI
//  decision augmentation. The Dircom sees the full crisis lifecycle
//  in one view — from detection to resolution.
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
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#991b1b",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  warningBorder: "#fcd34d",
  warningText: "#b45309",
  info: "#3b82f6",
  infoBg: "#eff6ff",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

type CrisisType = "boycott" | "bad_buzz" | "regulatory" | "executive" | "cyber" | "operational";
type CrisisPhase = "detection" | "triage" | "containment" | "resolution" | "post_mortem";
type EscalationLevel = "L1" | "L2" | "L3";

interface CrisisWorkflow {
  id: string;
  type: CrisisType;
  title: string;
  phase: CrisisPhase;
  escalation: EscalationLevel;
  detectedAt: number;
  slaDeadline: number;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: number | null;
  playbookSteps: { id: string; label: string; done: boolean; owner: string }[];
  comexNotified: boolean;
}

const CRISIS_TYPES: Record<CrisisType, { label: string; icon: string; severity: string }> = {
  boycott: { label: "Boycott Campaign", icon: "🚫", severity: "critical" },
  bad_buzz: { label: "Bad Buzz / Viral Negativity", icon: "📉", severity: "critical" },
  regulatory: { label: "Regulatory Action", icon: "⚖️", severity: "high" },
  executive: { label: "Executive Reputation Crisis", icon: "👔", severity: "high" },
  cyber: { label: "Cybersecurity Incident", icon: "🔒", severity: "critical" },
  operational: { label: "Operational Disruption", icon: "⚙️", severity: "medium" },
};

const PLAYBOOKS: Record<CrisisType, { id: string; label: string; owner: string }[]> = {
  boycott: [
    { id: "b1", label: "Identifier l'origine (page Facebook, groupe WhatsApp, compte TikTok)", owner: "Analyst" },
    { id: "b2", label: "Mesurer la vélocité (mentions/h, sentiment, reach)", owner: "Analyst" },
    { id: "b3", label: "Préparer un communiqué de clarification (≤ 200 mots)", owner: "Dircom" },
    { id: "b4", label: "Valider avec le DG et le juridique", owner: "Dircom" },
    { id: "b5", label: "Publier sur les canaux officiels (site, LinkedIn, X)", owner: "Digital" },
    { id: "b6", label: "Engager les influenceurs positifs identifiés", owner: "Agency" },
    { id: "b7", label: "Monitorer la vélocité post-communiqué (2h, 6h, 24h)", owner: "Analyst" },
    { id: "b8", label: "Brief Comex — lessons learned + post-mortem", owner: "Dircom" },
  ],
  bad_buzz: [
    { id: "bb1", label: "Identifier la source virale (vidéo, post, thread)", owner: "Analyst" },
    { id: "bb2", label: "Évaluer le reach et la vélocité de propagation", owner: "Analyst" },
    { id: "bb3", label: "Classifier le type (service client, produit, dirigeant)", owner: "Analyst" },
    { id: "bb4", label: "Préparer la réponse (publique ou privée selon severity)", owner: "Dircom" },
    { id: "bb5", label: "Activer le monitoring renforcé (toutes les 15min)", owner: "Analyst" },
    { id: "bb6", label: "Si cascade Darija→MSA/FR : escalade Comex immédiate", owner: "System" },
    { id: "bb7", label: "Post-mortem + mise à jour du playbook", owner: "Dircom" },
  ],
  regulatory: [
    { id: "r1", label: "Identifier la publication (BAM, AMMC, BVC, ONSSA)", owner: "Analyst" },
    { id: "r2", label: "Évaluer l'impact (conformité, opérationnel, réputation)", owner: "Legal" },
    { id: "r3", label: "Préparer la réponse réglementaire (délai légal)", owner: "Legal" },
    { id: "r4", label: "Communiquer en interne (DG, Comex)", owner: "Dircom" },
    { id: "r5", label: "Adapter le monitoring (surveillance des commentaires)", owner: "Analyst" },
  ],
  executive: [
    { id: "e1", label: "Identifier les allégations (source, nature, reach)", owner: "Analyst" },
    { id: "e2", label: "Coordonner avec le dirigeant concerné + juridique", owner: "Dircom" },
    { id: "e3", label: "Préparer la stratégie de réponse (démenti, clarification, silence)", owner: "Legal" },
    { id: "e4", label: "Monitorer la propagation toutes les 30min", owner: "Analyst" },
    { id: "e5", label: "Brief Comex si reach > 100K ou média mainstream", owner: "Dircom" },
  ],
  cyber: [
    { id: "c1", label: "Confirmer l'incident (DSI, CERT)", owner: "DSI" },
    { id: "c2", label: "Évaluer la portée (données exposées, systèmes impactés)", owner: "DSI" },
    { id: "c3", label: "Notifier les autorités (CNDP si données perso, loi 09-08)", owner: "Legal" },
    { id: "c4", label: "Préparer la communication (interne + externe)", owner: "Dircom" },
    { id: "c5", label: "Monitorer les réactions (réseaux, forums, média)", owner: "Analyst" },
    { id: "c6", label: "Post-mortem + plan de remédiation", owner: "DSI" },
  ],
  operational: [
    { id: "o1", label: "Identifier la disruption (service, zone, durée)", owner: "Ops" },
    { id: "o2", label: "Évaluer l'impact client (nombre, criticité)", owner: "Ops" },
    { id: "o3", label: "Préparer la communication client (SMS, email, WhatsApp)", owner: "Dircom" },
    { id: "o4", label: "Monitorer les réactions sur les réseaux", owner: "Analyst" },
    { id: "o5", label: "Communication de résolution", owner: "Dircom" },
  ],
};

const ESCALATION_META: Record<EscalationLevel, { label: string; color: string; sla: number; who: string }> = {
  L1: { label: "L1 — Analyst", color: C.info, sla: 30 * 60 * 1000, who: "Analyste réputation" },
  L2: { label: "L2 — Management", color: C.warning, sla: 60 * 60 * 1000, who: "Directeur de communication" },
  L3: { label: "L3 — Comex", color: C.danger, sla: 4 * 60 * 60 * 1000, who: "Comité exécutif" },
};

const PHASE_META: Record<CrisisPhase, { label: string; icon: string }> = {
  detection: { label: "Détection", icon: "🔍" },
  triage: { label: "Triage", icon: "📋" },
  containment: { label: "Confinement", icon: "🛡️" },
  resolution: { label: "Résolution", icon: "✅" },
  post_mortem: { label: "Post-mortem", icon: "📝" },
};

// Demo crisis — the 2018 boycott pattern
const DEMO_CRISIS: CrisisWorkflow = {
  id: "crisis-001",
  type: "boycott",
  title: "Bad buzz 'Frais bancaires excessifs' — cascade Darija → MSA + FR",
  phase: "containment",
  escalation: "L2",
  detectedAt: Date.now() - 3 * 60 * 60 * 1000, // 3h ago
  slaDeadline: Date.now() + 22 * 60 * 1000, // 22min left
  acknowledged: true,
  acknowledgedBy: "Salma Bennani",
  acknowledgedAt: Date.now() - 2.5 * 60 * 60 * 1000,
  playbookSteps: PLAYBOOKS.boycott.map((step, i) => ({
    ...step,
    done: i < 4, // steps 1-4 done
  })),
  comexNotified: false,
};

export function CrisisWorkflowEngine() {
  const [crisis, setCrisis] = useState<CrisisWorkflow>(DEMO_CRISIS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeLeft = crisis.slaDeadline - now;
  const timeLeftMin = Math.max(0, Math.floor(timeLeft / 60000));
  const timeLeftSec = Math.max(0, Math.floor((timeLeft % 60000) / 1000));
  const isOverdue = timeLeft <= 0;
  const slaPct = Math.min(100, Math.max(0, ((crisis.slaDeadline - crisis.detectedAt - (now - crisis.detectedAt)) / (crisis.slaDeadline - crisis.detectedAt)) * 100));

  const crisisType = CRISIS_TYPES[crisis.type];
  const escalation = ESCALATION_META[crisis.escalation];
  const phase = PHASE_META[crisis.phase];
  const completedSteps = crisis.playbookSteps.filter((s) => s.done).length;
  const totalSteps = crisis.playbookSteps.length;

  const toggleStep = (stepId: string) => {
    setCrisis((prev) => ({
      ...prev,
      playbookSteps: prev.playbookSteps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    }));
  };

  const escalate = () => {
    setCrisis((prev) => ({
      ...prev,
      escalation: prev.escalation === "L1" ? "L2" : prev.escalation === "L2" ? "L3" : "L3",
      comexNotified: prev.escalation === "L2",
    }));
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ─── HEADER: Crisis title + type + phase ─── */}
      <div
        style={{
          padding: "20px 24px",
          background: `linear-gradient(135deg, ${C.dangerBg}, ${C.surface})`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{crisisType.icon}</span>
              <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", background: C.danger, color: "#fff", letterSpacing: "0.05em" }}>
                {crisisType.label.toUpperCase()}
              </span>
              <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
                {phase.icon} {phase.label}
              </span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.4 }}>
              {crisis.title}
            </h3>
            <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, marginTop: "6px" }}>
              ID: {crisis.id} · Détecté: {new Date(crisis.detectedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* SLA Timer */}
          <div
            style={{
              padding: "12px 16px",
              background: isOverdue ? C.danger : timeLeftMin < 5 ? C.warningBg : C.surface,
              border: `1px solid ${isOverdue ? C.dangerBorder : timeLeftMin < 5 ? C.warningBorder : C.border}`,
              borderRadius: "10px",
              textAlign: "center",
              minWidth: "140px",
            }}
          >
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: isOverdue ? C.dangerText : timeLeftMin < 5 ? C.warningText : C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              SLA {escalation.label.split(" — ")[0]}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: isOverdue ? C.dangerText : timeLeftMin < 5 ? C.warningText : C.text,
                fontFamily: C.fontMono,
                lineHeight: 1.2,
                animation: timeLeftMin < 5 && !isOverdue ? "pulse 1s infinite" : "none",
              }}
            >
              {isOverdue ? "OVERDUE" : `${timeLeftMin}:${timeLeftSec.toString().padStart(2, "0")}`}
            </div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted, marginTop: "2px" }}>
              {escalation.who}
            </div>
          </div>
        </div>

        {/* SLA Progress bar */}
        <div style={{ marginTop: "12px", height: "4px", background: C.border, borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${slaPct}%`,
              background: isOverdue ? C.danger : timeLeftMin < 5 ? C.warning : C.cta,
              borderRadius: "2px",
              transition: "width 1s linear",
            }}
          />
        </div>
      </div>

      {/* ─── ESCALATION CHAIN ─── */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
          Escalation Chain
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {(["L1", "L2", "L3"] as EscalationLevel[]).map((level, i) => {
            const meta = ESCALATION_META[level];
            const isActive = crisis.escalation === level;
            const isPast = ["L1", "L2", "L3"].indexOf(crisis.escalation) > i;
            return (
              <div key={level} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                <div
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: isActive ? meta.color : isPast ? meta.color + "15" : C.surfaceAlt,
                    border: `1px solid ${isActive || isPast ? meta.color : C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    transition: "all 0.2s",
                    animation: isActive ? "slideIn 0.3s ease-out" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: isActive ? "#fff" : isPast ? meta.color : C.textMuted }}>
                      {level}
                    </span>
                    {isPast && <span style={{ fontSize: "10px", color: meta.color }}>✓</span>}
                    {isActive && (
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: isActive ? "rgba(255,255,255,0.8)" : C.textMuted }}>{meta.who}</span>
                </div>
                {i < 2 && <span style={{ color: C.textMuted, fontSize: "14px" }}>→</span>}
              </div>
            );
          })}
        </div>

        {/* Escalate button */}
        {crisis.escalation !== "L3" && (
          <button
            onClick={escalate}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: C.danger,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontFamily: C.fontSans,
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ⚡ Escalate to {crisis.escalation === "L1" ? "L2 (Management)" : "L3 (Comex)"}
          </button>
        )}

        {/* Comex notification status */}
        {crisis.comexNotified && (
          <div style={{ marginTop: "8px", padding: "8px 12px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "6px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>📡</span>
            <span style={{ fontSize: "12px", color: C.dangerText, fontWeight: 600 }}>
              Comex notifié via WhatsApp — 3 membres alertés à {new Date(now - 5 * 60 * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>

      {/* ─── PLAYBOOK ─── */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Crisis Playbook — {crisisType.label}
          </span>
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textSec }}>
            {completedSteps}/{totalSteps} steps completed
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
          <div
            style={{
              height: "100%",
              width: `${(completedSteps / totalSteps) * 100}%`,
              background: C.cta,
              borderRadius: "3px",
              transition: "width 0.5s ease-out",
            }}
          />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {crisis.playbookSteps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto",
                gap: "10px",
                alignItems: "center",
                padding: "10px 12px",
                background: step.done ? C.surfaceAlt : C.surface,
                border: `1px solid ${step.done ? C.cta + "30" : C.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
                opacity: step.done ? 0.7 : 1,
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: `2px solid ${step.done ? C.cta : C.border}`,
                  background: step.done ? C.cta : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {step.done && "✓"}
              </div>

              {/* Label + number */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, fontWeight: 700 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "13px", color: step.done ? C.textMuted : C.text, textDecoration: step.done ? "line-through" : "none" }}>
                  {step.label}
                </span>
              </div>

              {/* Owner */}
              <span
                style={{
                  fontFamily: C.fontMono,
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  background: C.surfaceAlt,
                  color: C.textMuted,
                  fontWeight: 600,
                }}
              >
                {step.owner}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── FOOTER: Acknowledgment status ─── */}
      <div
        style={{
          padding: "12px 24px",
          borderTop: `1px solid ${C.border}`,
          background: C.surfaceAlt,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {crisis.acknowledged ? (
            <>
              <span style={{ color: C.cta, fontSize: "14px" }}>✓</span>
              <span style={{ fontSize: "12px", color: C.textSec }}>
                Acknowledged by <strong>{crisis.acknowledgedBy}</strong> at{" "}
                {new Date(crisis.acknowledgedAt!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          ) : (
            <>
              <span style={{ color: C.warning, fontSize: "14px", animation: "pulse 1.5s infinite" }}>⚠</span>
              <span style={{ fontSize: "12px", color: C.warningText, fontWeight: 600 }}>Pending acknowledgment</span>
            </>
          )}
        </div>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
          Harch IQ · Crisis Workflow Engine
        </span>
      </div>
    </div>
  );
}
