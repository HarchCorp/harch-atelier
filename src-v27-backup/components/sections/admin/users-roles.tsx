"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  KeyRound,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  Divider,
  MetricRing,
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  StatTile,
  Tag,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  adminUsers,
  allPermissions,
  allRoles,
  grantTint,
  rbacMatrix,
  relativeTime,
  roleTint,
  seatSummary,
  userStatusColor,
  type AdminUser,
  type UserRole,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type SortKey = "name" | "role" | "status" | "lastLogin" | "sessions30d";

/* ------------------------------------------------------------------ */
/*  Role → design-system accent map                                    */
/* ------------------------------------------------------------------ */

const roleAccent: Record<UserRole, RoleAccent> = {
  admin: "slate",
  analyst: "violet",
  trader: "emerald",
  legal: "violet",
  market: "amber",
  pr: "rose",
  viewer: "cyan",
};

const statusTone: Record<AdminUser["status"], "positive" | "info" | "warning" | "negative"> = {
  active: "positive",
  invited: "info",
  suspended: "warning",
  locked: "negative",
};

/* ------------------------------------------------------------------ */
/*  RBAC matrix cell                                                   */
/* ------------------------------------------------------------------ */

function GrantCell({ grant }: { grant: "allow" | "deny" | "conditional" }) {
  const tint = grantTint[grant];
  const label = grant === "allow" ? "✓" : grant === "deny" ? "—" : "◐";
  return (
    <span
      className={cn(
        "tabular inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ring-1",
        tint.bg,
        tint.text,
        tint.ring,
      )}
      title={grant}
    >
      {label}
    </span>
  );
}

function RbacMatrix() {
  return (
    <div className="overflow-x-auto harch-scroll">
      <table className="w-full min-w-[760px] border-collapse text-[11px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-slate-500">
            <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left">Permission</th>
            {allRoles.map((r) => (
              <th key={r} className="px-2 py-2 text-center capitalize">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPermissions.map((perm, i) => (
            <tr
              key={perm}
              className={cn(
                "border-t border-slate-100",
                i % 2 === 1 ? "bg-slate-50/40" : "bg-white",
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 font-medium text-slate-700">
                {perm}
              </td>
              {allRoles.map((r) => (
                <td key={r} className="px-2 py-1.5 text-center">
                  <GrantCell grant={rbacMatrix[r][perm]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seat usage — MetricRing                                            */
/* ------------------------------------------------------------------ */

function SeatGauge() {
  const pct = Math.round((seatSummary.used / seatSummary.total) * 100);
  const tone = pct > 80 ? "rose" : pct > 60 ? "amber" : "emerald";
  return (
    <div className="flex flex-col items-center gap-4">
      <MetricRing value={pct} size={150} stroke={10} tone={tone} label="SEAT USAGE" sublabel={`${seatSummary.used} / ${seatSummary.total}`} />
      <div className="grid w-full grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-200">
          <div className="tabular text-[14px] font-bold text-emerald-800">{seatSummary.mfaEnabled}</div>
          <div className="text-[9px] uppercase tracking-wide text-emerald-700">MFA on</div>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 ring-1 ring-rose-200">
          <div className="tabular text-[14px] font-bold text-rose-800">{seatSummary.mfaDisabled}</div>
          <div className="text-[9px] uppercase tracking-wide text-rose-700">MFA off</div>
        </div>
        <div className="rounded-lg bg-sky-50 p-2 ring-1 ring-sky-200">
          <div className="tabular text-[14px] font-bold text-sky-800">{seatSummary.activeNow}</div>
          <div className="text-[9px] uppercase tracking-wide text-sky-700">Active 24h</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User role distribution donut                                       */
/* ------------------------------------------------------------------ */

function RoleDistribution() {
  const counts = allRoles
    .map((r) => ({
      role: r,
      count: adminUsers.filter((u) => u.role === r).length,
    }))
    .filter((x) => x.count > 0);
  const colors: Record<UserRole, string> = {
    admin: "#0f172a",
    analyst: "#a855f7",
    trader: "#10b981",
    legal: "#7c3aed",
    market: "#f59e0b",
    pr: "#f43f5e",
    viewer: "#64748b",
  };
  const total = counts.reduce((s, c) => s + c.count, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={counts}
              dataKey="count"
              nameKey="role"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {counts.map((c) => (
                <Cell key={c.role} fill={colors[c.role]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {counts.map((c) => (
          <div key={c.role} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
            <span className="flex items-center gap-1.5 capitalize text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: colors[c.role] }} />
              {c.role}
            </span>
            <span className="tabular font-semibold text-slate-800">
              {c.count}
              <span className="ml-1 text-[9px] font-normal text-slate-400">
                {Math.round((c.count / total) * 100)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function UsersRoles(_: SectionComponentProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("lastLogin");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = adminUsers.slice();
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "role") return a.role.localeCompare(b.role) * dir;
      if (sortKey === "status") return a.status.localeCompare(b.status) * dir;
      if (sortKey === "sessions30d") return (a.sessions30d - b.sessions30d) * dir;
      if (sortKey === "lastLogin") {
        const av = a.lastLogin ? Date.parse(a.lastLogin) : 0;
        const bv = b.lastLogin ? Date.parse(b.lastLogin) : 0;
        return (av - bv) * dir;
      }
      return 0;
    });
    return list;
  }, [roleFilter, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-slate-700" />
    ) : (
      <ChevronDown className="h-3 w-3 text-slate-700" />
    );
  };

  const mfaCoverage = Math.round((seatSummary.mfaEnabled / seatSummary.used) * 100);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="admin-users"
        accountType="admin"
        accent="cyan"
        statusChips={
          <>
            <StatusChip label="IdP · Azure AD" tone="neutral" icon={KeyRound} />
            <StatusChip label={`${seatSummary.used}/${seatSummary.total} seats`} tone="neutral" icon={UsersIcon} />
            <StatusChip label={`${seatSummary.mfaEnabled} MFA`} tone="positive" icon={ShieldCheck} />
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Total Users" value={`${adminUsers.length}`} hint={`${seatSummary.total - seatSummary.used} seats available`} icon={UsersIcon} accent="slate" />
            <StatTile label="Active" value={`${adminUsers.filter((u) => u.status === "active").length}`} hint="Status · active" icon={ShieldCheck} accent="emerald" />
            <StatTile label="Invited" value={`${adminUsers.filter((u) => u.status === "invited").length}`} hint="Pending acceptance" icon={UserPlus} accent="cyan" />
            <StatTile label="Locked" value={`${adminUsers.filter((u) => u.status === "locked").length}`} hint="Failed login attempts" icon={ShieldAlert} accent="rose" />
            <StatTile label="MFA Coverage" value={`${mfaCoverage}%`} delta={`${seatSummary.mfaEnabled}/${seatSummary.used}`} hint="Users enrolled" icon={KeyRound} accent="slate" />
            <StatTile label="Active Now" value={`${seatSummary.activeNow}`} hint="Within last 24h" icon={UsersIcon} accent="slate" />
          </StaggerGrid>
        }
      />

      {/* Seat gauge + role distribution + access highlights */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent="slate">
          <PanelHeader
            title="Seat Usage"
            subtitle={`${seatSummary.plan} plan · renews ${seatSummary.renewal}`}
            icon={UsersIcon}
            accent="slate"
          />
          <div className="p-5">
            <DeferredChart height="h-[260px]">
              <SeatGauge />
            </DeferredChart>
          </div>
        </PanelCard>
        <PanelCard>
          <PanelHeader
            title="Role Distribution"
            subtitle="Active users by role"
            icon={UserCog}
          />
          <div className="p-5">
            <DeferredChart height="h-[260px]">
              <RoleDistribution />
            </DeferredChart>
          </div>
        </PanelCard>
        <PanelCard>
          <PanelHeader
            title="Access Highlights"
            subtitle="Audit · MFA · risk posture"
            icon={ShieldAlert}
          />
          <div className="flex flex-col gap-3 p-4">
            <StatTile
              label="Failed logins (24h)"
              value="7"
              hint="3 locked accounts · 1 forced MFA reset"
              icon={AlertTriangle}
              accent="rose"
            />
            <StatTile
              label="Role changes (30d)"
              value="4"
              hint="2 promotions · 1 demotion · 1 lateral"
              icon={UserCog}
              accent="slate"
            />
            <StatTile
              label="API tokens issued"
              value="18"
              hint="6 expiring within 14 days"
              icon={KeyRound}
              accent="violet"
            />
          </div>
        </PanelCard>
      </div>

      {/* MFA coverage strip */}
      <PanelCard>
        <PanelHeader
          title="Workspace Security Posture"
          subtitle="Coverage across enrolled users"
          icon={ShieldCheck}
          accent="slate"
        />
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="card-title">MFA coverage</span>
              <span className="tabular text-[12px] font-bold text-slate-700">{mfaCoverage}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={mfaCoverage} tone="emerald" threshold={90} />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">Target ≥ 90% · {seatSummary.mfaEnabled}/{seatSummary.used} enrolled</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="card-title">Seat utilisation</span>
              <span className="tabular text-[12px] font-bold text-slate-700">{Math.round((seatSummary.used / seatSummary.total) * 100)}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={(seatSummary.used / seatSummary.total) * 100} tone="sky" threshold={85} />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">{seatSummary.used}/{seatSummary.total} seats · {seatSummary.total - seatSummary.used} available</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="card-title">Active 24h</span>
              <span className="tabular text-[12px] font-bold text-slate-700">{Math.round((seatSummary.activeNow / seatSummary.used) * 100)}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={(seatSummary.activeNow / seatSummary.used) * 100} tone="slate" />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">{seatSummary.activeNow} of {seatSummary.used} enrolled users</p>
          </div>
        </div>
      </PanelCard>

      {/* Users table */}
      <ChartCard
        title="Users"
        subtitle="HarchCorp workspace members · sortable + filterable"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email…"
                className="h-7 w-44 pl-7 text-[11px] sm:w-56"
              />
            </div>
            <Button size="sm" className="h-7 gap-1.5 bg-slate-800 text-[11px] hover:bg-slate-700">
              <UserPlus className="h-3.5 w-3.5" /> Add user
            </Button>
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
          <Filter className="h-3 w-3 text-slate-400" />
          <button
            onClick={() => setRoleFilter("all")}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
              roleFilter === "all" ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
            )}
          >
            All
          </button>
          {allRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                roleFilter === r ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="max-h-[460px] overflow-y-auto harch-scroll">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                    User {renderSortIcon("name")}
                  </button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("role")}>
                    Role {renderSortIcon("role")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                    Status {renderSortIcon("status")}
                  </button>
                </TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("lastLogin")}>
                    Last login {renderSortIcon("lastLogin")}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("sessions30d")}>
                    Sessions 30d {renderSortIcon("sessions30d")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u: AdminUser) => {
                const st = userStatusColor[u.status];
                return (
                  <TableRow key={u.id} className="text-[12px] hover:bg-slate-50/60">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.id} · {u.location}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{u.email}</TableCell>
                    <TableCell>
                      <Tag tone={roleAccent[u.role]}>{u.role}</Tag>
                    </TableCell>
                    <TableCell>
                      <Tag tone={statusTone[u.status]}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        {u.status}
                      </Tag>
                    </TableCell>
                    <TableCell>
                      {u.mfa ? (
                        <Tag tone="positive" icon={ShieldCheck}>On</Tag>
                      ) : (
                        <Tag tone="negative">Off</Tag>
                      )}
                    </TableCell>
                    <TableCell className="tabular text-slate-600">
                      {u.lastLogin ? relativeTime(u.lastLogin) : "—"}
                    </TableCell>
                    <TableCell className="tabular text-right text-slate-700">{u.sessions30d}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[12px] text-slate-400">
                    No users match the current filter.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      {/* RBAC matrix */}
      <PanelCard>
        <PanelHeader
          title="RBAC Matrix"
          subtitle="Role × permission grants · ✓ allow · ◐ conditional · — deny"
          icon={UserCog}
          accent="slate"
          action={
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <UserCog className="h-3.5 w-3.5" /> {allRoles.length} roles · {allPermissions.length} permissions
            </span>
          }
        />
        <div className="p-3">
          <RbacMatrix />
        </div>
        <Divider />
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <GrantCell grant="allow" /> allow
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GrantCell grant="conditional" /> conditional (contextual)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GrantCell grant="deny" /> deny
          </span>
        </div>
      </PanelCard>
    </div>
  );
}
