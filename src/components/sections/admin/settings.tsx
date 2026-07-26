"use client";

import * as React from "react";
import {
  Bell,
  Clock,
  Database,
  Globe2,
  Moon,
  Palette,
  Save,
  ShieldAlert,
  Sun,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  Tag,
} from "../design-system";
import { SectionHeader, StatusChip } from "../section-header";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import { defaultSettings, type WorkspaceSettings } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Setting row helper                                                 */
/* ------------------------------------------------------------------ */

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-slate-800">{title}</div>
        <div className="mt-0.5 text-[11px] text-slate-500">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Threshold slider with ProgressBar feedback                         */
/* ------------------------------------------------------------------ */

const thresholdColor: Record<"critical" | "high" | "medium", string> = {
  critical: "#f43f5e",
  high: "#f59e0b",
  medium: "#0ea5e9",
};

const thresholdTone: Record<"critical" | "high" | "medium", "rose" | "amber" | "sky"> = {
  critical: "rose",
  high: "amber",
  medium: "sky",
};

function ThresholdSlider({
  label,
  value,
  onChange,
  kind,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  kind: "critical" | "high" | "medium";
}) {
  const color = thresholdColor[kind];
  return (
    <PanelCard accent={kind === "critical" ? "rose" : kind === "high" ? "amber" : "cyan"} className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</span>
        <Tag tone={kind === "critical" ? "negative" : kind === "high" ? "warning" : "info"}>
          <span className="tabular">{value}</span> / 100
        </Tag>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => onChange(v[0])}
          className="flex-1"
        />
        <div className="w-14">
          <ProgressBar value={value} tone={thresholdTone[kind]} height={6} />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[9px] tabular text-slate-400">
        <span>0</span><span>50</span><span>100</span>
      </div>
      <div className="mt-2 text-[10px] text-slate-400" style={{ color }}>
        Triggers when composite score ≥ {value}
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function Settings(_: SectionComponentProps) {
  const [settings, setSettings] = React.useState<WorkspaceSettings>(defaultSettings);
  const [dirty, setDirty] = React.useState(false);

  const update = React.useCallback(<K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = React.useCallback(() => {
    setDirty(false);
    toast.success("Workspace settings saved", {
      description: "Changes applied to all roles and users.",
    });
  }, []);

  const handleReset = React.useCallback(() => {
    setSettings(defaultSettings);
    setDirty(false);
    toast.info("Settings reset to defaults");
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="admin-settings"
        accountType="admin"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={dirty ? "Unsaved changes" : "All saved"} tone={dirty ? "warning" : "positive"} icon={dirty ? TriangleAlert : ShieldAlert} />
            <StatusChip label={`Residency · ${settings.dataResidency}`} tone="neutral" icon={Globe2} />
          </>
        }
      />

      <Tabs defaultValue="risk">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="risk" className="gap-1.5 text-[12px]">
              <ShieldAlert className="h-3.5 w-3.5" /> Risk Thresholds
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 text-[12px]">
              <Database className="h-3.5 w-3.5" /> Data & Retention
            </TabsTrigger>
            <TabsTrigger value="notify" className="gap-1.5 text-[12px]">
              <Bell className="h-3.5 w-3.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="workspace" className="gap-1.5 text-[12px]">
              <Palette className="h-3.5 w-3.5" /> Workspace
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={handleReset}>
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-slate-800 text-[11px] hover:bg-slate-700 disabled:opacity-50"
              disabled={!dirty}
              onClick={handleSave}
            >
              <Save className="h-3.5 w-3.5" /> Save changes
            </Button>
          </div>
        </div>

        {/* Risk thresholds */}
        <TabsContent value="risk">
          <PanelCard accent="slate">
            <PanelHeader
              title="Risk Score Thresholds"
              subtitle="Composite risk index boundaries · triggers alerts and SLA clocks"
              icon={ShieldAlert}
              accent="slate"
            />
            <div className="p-4">
              <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ThresholdSlider
                  label="Critical"
                  kind="critical"
                  value={settings.riskThresholdCritical}
                  onChange={(v) => update("riskThresholdCritical", v)}
                />
                <ThresholdSlider
                  label="High"
                  kind="high"
                  value={settings.riskThresholdHigh}
                  onChange={(v) => update("riskThresholdHigh", v)}
                />
                <ThresholdSlider
                  label="Medium"
                  kind="medium"
                  value={settings.riskThresholdMedium}
                  onChange={(v) => update("riskThresholdMedium", v)}
                />
              </StaggerGrid>
              <div className="mt-4">
                <SettingRow
                  title="Auto-escalate critical alerts"
                  description="Promote critical alerts to ops on-call when SLA breaches 50% of budget."
                >
                  <Switch checked={settings.autoEscalate} onCheckedChange={(v) => update("autoEscalate", v)} />
                </SettingRow>
                <SettingRow
                  title="Critical alert SLA"
                  description="Time-to-acknowledge budget for critical alerts before breach."
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={72}
                      value={settings.slaHours}
                      onChange={(e) => update("slaHours", Math.max(1, Math.min(72, Number(e.target.value))))}
                      className="h-7 w-16 text-[11px] tabular"
                    />
                    <span className="text-[11px] text-slate-500">hours</span>
                  </div>
                </SettingRow>
              </div>
            </div>
          </PanelCard>
        </TabsContent>

        {/* Data & retention */}
        <TabsContent value="data">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard>
              <PanelHeader
                title="Retention Policy"
                subtitle="How long raw + derived data is kept"
                icon={Database}
                accent="slate"
              />
              <div className="p-4">
                <SettingRow
                  title="Article retention"
                  description="Raw articles, sentiment, and entity extractions are kept for this many days."
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={30}
                      max={3650}
                      value={settings.retentionDays}
                      onChange={(e) => update("retentionDays", Math.max(30, Math.min(3650, Number(e.target.value))))}
                      className="h-7 w-20 text-[11px] tabular"
                    />
                    <span className="text-[11px] text-slate-500">days</span>
                  </div>
                </SettingRow>
                <SettingRow
                  title="Audit log retention"
                  description="Immutable audit entries are retained for 7 years (regulatory). Read-only."
                >
                  <span className="tabular text-[12px] font-semibold text-slate-700">2,557 days</span>
                </SettingRow>
                <SettingRow
                  title="Cold storage archive"
                  description="Articles older than retention are exported to S3 archive bucket (harchcorp-archive)."
                >
                  <Switch defaultChecked />
                </SettingRow>
              </div>
            </PanelCard>
            <PanelCard>
              <PanelHeader
                title="Data Residency"
                subtitle="Primary region for storage and processing"
                icon={Globe2}
                accent="slate"
              />
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {([
                    { code: "EU", label: "European Union", flag: "🇪🇺", desc: "Frankfurt · eu-central-1" },
                    { code: "US", label: "United States", flag: "🇺🇸", desc: "Virginia · us-east-1" },
                    { code: "MA", label: "Morocco", flag: "🇲🇦", desc: "Casablanca · ma-cgw-1" },
                    { code: "APAC", label: "Asia-Pacific", flag: "🌏", desc: "Singapore · ap-southeast-1" },
                  ] as const).map((r) => (
                    <button
                      key={r.code}
                      onClick={() => update("dataResidency", r.code)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-3 text-left transition-all",
                        settings.dataResidency === r.code
                          ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-slate-800">{r.label}</span>
                        <span className="text-[14px]">{r.flag}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{r.code}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-600">
                  <div className="card-title mb-1 text-slate-700">Compliance</div>
                  Residency change requires re-syncing the entity index. Existing alerts are preserved but their geographic attribution will be recomputed.
                </div>
              </div>
            </PanelCard>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notify">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard>
              <PanelHeader
                title="Real-time Notifications"
                subtitle="Channel routing for in-app and email alerts"
                icon={Bell}
                accent="slate"
              />
              <div className="p-4">
                <SettingRow
                  title="Critical alerts"
                  description="Push + email + Slack #intel-alerts immediately on trigger."
                >
                  <Switch checked={settings.notifyOnCritical} onCheckedChange={(v) => update("notifyOnCritical", v)} />
                </SettingRow>
                <SettingRow
                  title="High-severity alerts"
                  description="In-app notification + email digest within 5 minutes."
                >
                  <Switch checked={settings.notifyOnHigh} onCheckedChange={(v) => update("notifyOnHigh", v)} />
                </SettingRow>
                <SettingRow
                  title="Auto-assign to on-call"
                  description="When unassigned for > 30 min, route to current ops on-call schedule."
                >
                  <Switch defaultChecked />
                </SettingRow>
                <SettingRow
                  title="Mobile push (PWA)"
                  description="Allow critical alerts to wake the mobile app via service worker push."
                >
                  <Switch defaultChecked={false} />
                </SettingRow>
              </div>
            </PanelCard>
            <PanelCard>
              <PanelHeader
                title="Digests & Reports"
                subtitle="Scheduled rollups sent to subscribers"
                icon={Clock}
                accent="slate"
              />
              <div className="p-4">
                <SettingRow
                  title="Daily digest"
                  description="Emailed at 07:00 UTC. Summarises overnight alerts and coverage."
                >
                  <Switch checked={settings.digestDaily} onCheckedChange={(v) => update("digestDaily", v)} />
                </SettingRow>
                <SettingRow
                  title="Weekly executive brief"
                  description="Mondays 06:00 UTC. Composite risk index, pillar deltas, top movers."
                >
                  <Switch checked={settings.digestWeekly} onCheckedChange={(v) => update("digestWeekly", v)} />
                </SettingRow>
                <SettingRow
                  title="Monthly board pack"
                  description="1st of each month. Risk posture, audit summary, compliance status."
                >
                  <Switch defaultChecked />
                </SettingRow>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-600">
                  <div className="card-title mb-1 flex items-center gap-1.5 text-slate-700">
                    <Clock className="h-3.5 w-3.5" /> Schedule (UTC)
                  </div>
                  Daily 07:00 · Weekly Mon 06:00 · Monthly 1st 05:00. Recipients configured in workspace members tab.
                </div>
              </div>
            </PanelCard>
          </div>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard>
              <PanelHeader
                title="Appearance"
                subtitle="Default theme for new users"
                icon={Palette}
                accent="slate"
              />
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { code: "light", label: "Light", icon: Sun },
                    { code: "dark", label: "Dark", icon: Moon },
                    { code: "system", label: "System", icon: Palette },
                  ] as const).map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.code}
                        onClick={() => update("defaultTheme", t.code)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                          settings.defaultTheme === t.code
                            ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800"
                            : "border-slate-200 hover:border-slate-300",
                        )}
                      >
                        <Icon className={cn("h-5 w-5", settings.defaultTheme === t.code ? "text-slate-900" : "text-slate-500")} />
                        <span className="text-[12px] font-medium text-slate-700">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <SettingRow
                    title="Compact density"
                    description="Tighter row spacing in tables and lists. Recommended for trader desk monitors."
                  >
                    <Switch defaultChecked={false} />
                  </SettingRow>
                  <SettingRow
                    title="Show monetary values in"
                    description="Currency for billing, P&L, and exposure columns."
                  >
                    <select className="h-7 rounded border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
                      <option>USD</option>
                      <option>MAD</option>
                      <option>EUR</option>
                    </select>
                  </SettingRow>
                </div>
              </div>
            </PanelCard>
            <PanelCard>
              <PanelHeader
                title="Experimental"
                subtitle="Feature flags under evaluation"
                icon={TriangleAlert}
                accent="amber"
              />
              <div className="p-4">
                <SettingRow
                  title="GLM-4 streaming summaries"
                  description="Stream article summaries token-by-token for faster first-read."
                >
                  <Switch defaultChecked />
                </SettingRow>
                <SettingRow
                  title="Predictive alert triage"
                  description="ML-suggested assignment based on historical routing patterns."
                >
                  <Switch defaultChecked={false} />
                </SettingRow>
                <SettingRow
                  title="Entity graph visualisation"
                  description="Render entity-to-event relationships as an interactive force-directed graph."
                >
                  <Switch defaultChecked={false} />
                </SettingRow>
                <SettingRow
                  title="Multi-workspace switcher"
                  description="Allow users to belong to multiple HarchCorp workspaces (parent + subsidiary)."
                >
                  <Switch defaultChecked={false} />
                </SettingRow>
              </div>
            </PanelCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
