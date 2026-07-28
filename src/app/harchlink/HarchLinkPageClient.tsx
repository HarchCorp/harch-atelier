'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocale } from 'next-intl';
import { FadeIn, CountUp } from '@/components/ui/motion';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Phone,
  CheckCircle2,
  X,
  Shield,
  Lock,
  KeyRound,
  Fingerprint,
  MessageSquare,
  MessagesSquare,
  Hash,
  AtSign,
  Bot,
  Sparkles,
  FileText,
  FileLock,
  FileCheck,
  Building2,
  Landmark,
  Banknote,
  HeartPulse,
  Scale,
  Globe2,
  Server,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  Cpu,
  Database,
  Network,
  Cloud,
  CloudOff,
  Quote,
  Star,
  Download,
  BookOpen,
  Code,
  Search,
  Users,
  UserCheck,
  Settings,
  Workflow,
  GitBranch,
  Layers,
  ServerCog,
  AlertTriangle,
  BellRing,
  Activity,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH · HARCHLINK — Harch Corp Brand System compliant
   HarchLink accent: cyan-500 · Primary CTA: emerald-500 (Harch green)
   Inter for type · Space Mono for data · Neutral palette
   20 sections · Wave dividers · Real photos only · EN + FR
   ═══════════════════════════════════════════════════════════════ */

const FEATURE_ICONS = [MessagesSquare, Bot, Lock, Landmark, FileLock, Network];
const USE_CASE_ICONS = [Landmark, Banknote, HeartPulse, Shield, Scale, Globe2];
const MIGRATION_ICONS = [CloudOff, GitBranch, CheckCircle2];
const SECURITY_ICONS = [KeyRound, Fingerprint, Shield, Lock, CloudOff, ServerCog];
const RESOURCE_ICONS = [FileText, FileLock, Code, BookOpen];

/* ── Section label helper — Harch brand pattern ────────────────── */
function SectionLabel({
  n,
  label,
  dark = false,
  center = false,
}: {
  n?: string;
  label: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] ${
        center ? 'justify-center' : ''
      }`}
    >
      {n && (
        <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>
      )}
      <span className="h-px w-8 bg-cyan-500/60" />
      <span className="text-cyan-500">{label}</span>
    </div>
  );
}

/* ── Connection-node dots — HarchLink subsidiary unique motif ── */
function ConnectionNodes() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.09 }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g stroke="#06b6d4" strokeWidth="1" fill="none">
        <line x1="12%" y1="28%" x2="32%" y2="42%" />
        <line x1="32%" y1="42%" x2="58%" y2="22%" />
        <line x1="58%" y1="22%" x2="82%" y2="38%" />
        <line x1="32%" y1="42%" x2="44%" y2="72%" />
        <line x1="44%" y1="72%" x2="70%" y2="64%" />
        <line x1="70%" y1="64%" x2="88%" y2="78%" />
        <line x1="82%" y1="38%" x2="88%" y2="78%" />
      </g>
      <g fill="#06b6d4">
        <circle cx="12%" cy="28%" r="3" />
        <circle cx="32%" cy="42%" r="3.5" />
        <circle cx="58%" cy="22%" r="3" />
        <circle cx="82%" cy="38%" r="3" />
        <circle cx="44%" cy="72%" r="3" />
        <circle cx="70%" cy="64%" r="3.5" />
        <circle cx="88%" cy="78%" r="3" />
      </g>
    </svg>
  );
}

/* ── Subtle chat-bubble decoration — sparing cyan accent ───────── */
function BubbleAccent() {
  return (
    <svg
      className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-cyan-500/10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.04 2 11c0 2.45 1.16 4.66 3 6.22V21l3.5-1.94c1.06.3 2.18.46 3.5.46 5.52 0 10-4.04 10-9S17.52 2 12 2z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ChatMockup — Real HTML/CSS chat interface (3-column layout)
   Channel sidebar · Message bubbles · Members panel
   Supports 3 scenarios for Tesla-style tab switching
   ═══════════════════════════════════════════════════════════════ */
type ChatScenario = 'engineering' | 'incident' | 'exec';
type ChatMessage = {
  author: string;
  role: string;
  time: string;
  text: string;
  self: boolean;
  ai?: boolean;
  summary?: string;
  bullets?: string[];
  citations?: string[];
};
type ChatMember = { name: string; status: 'online' | 'away' | 'offline' | 'bot'; role: string };

function ChatMockup({ locale, scenario = 'engineering' }: { locale: 'en' | 'fr'; scenario?: ChatScenario }) {
  const isFr = locale === 'fr';

  const channelDefs = isFr
    ? [
        { name: 'general', unread: 0 },
        { name: 'engineering', unread: 0 },
        { name: 'conseil-admin', unread: 2 },
        { name: 'incident-response', unread: 0 },
        { name: 'juridique', unread: 0 },
        { name: 'eau-casablanca', unread: 0 },
        { name: 'ciment-operations', unread: 5 },
      ]
    : [
        { name: 'general', unread: 0 },
        { name: 'engineering', unread: 0 },
        { name: 'exec-board', unread: 2 },
        { name: 'incident-response', unread: 0 },
        { name: 'legal', unread: 0 },
        { name: 'water-casablanca', unread: 0 },
        { name: 'cement-operations', unread: 5 },
      ];

  const activeChannel =
    scenario === 'engineering'
      ? 'engineering'
      : scenario === 'incident'
      ? 'incident-response'
      : isFr
      ? 'conseil-admin'
      : 'exec-board';

  const channels = channelDefs.map((c) => ({ ...c, active: c.name === activeChannel }));

  const members: ChatMember[] = isFr
    ? [
        { name: 'Sarah Berrada', status: 'online', role: 'Achats' },
        { name: 'Karim Idrissi', status: 'online', role: 'Engineering' },
        { name: 'Aminata Diallo', status: 'online', role: 'Juridique' },
        { name: 'Harch AI', status: 'bot', role: 'Assistant' },
        { name: 'Mehdi Tazi', status: 'away', role: 'Finance' },
        { name: 'Lina Benali', status: 'offline', role: 'Opérations' },
      ]
    : [
        { name: 'Sarah Berrada', status: 'online', role: 'Procurement' },
        { name: 'Karim Idrissi', status: 'online', role: 'Engineering' },
        { name: 'Aminata Diallo', status: 'online', role: 'Legal' },
        { name: 'Harch AI', status: 'bot', role: 'Assistant' },
        { name: 'Mehdi Tazi', status: 'away', role: 'Finance' },
        { name: 'Lina Benali', status: 'offline', role: 'Operations' },
      ];

  const scenarios: Record<ChatScenario, { messages: ChatMessage[]; inputPlaceholder: string }> = {
    engineering: {
      messages: isFr
        ? [
            {
              author: 'Sarah Berrada',
              role: 'Directrice Achats',
              time: '10:42',
              text: "Bonjour l'équipe, pouvez-vous me résumer le fil de discussion sur les achats Q3 ? Il y a 14 messages et je n'ai pas le temps de tout lire.",
              self: false,
            },
            {
              author: 'Karim Idrissi',
              role: 'Responsable Engineering',
              time: '10:43',
              text: "Bien sûr, j'ai tout ce qu'il te faut dans le fil. @harch-ai tu peux résumer ?",
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '10:44',
              text: '',
              self: false,
              ai: true,
              summary: 'Résumé du fil #achats-q3 (14 messages, 3 fournisseurs cités) :',
              bullets: [
                'Fournisseur A (Tanger) — délai 22 jours, prix stable, conforme CNDP',
                'Fournisseur B (Casablanca) — délai 14 jours, prix +6%, certification ISO 27001',
                'Fournisseur C (Dakar) — délai 31 jours, prix -8%, à vérifier conformité',
              ],
              citations: ['1', '2', '3'],
            },
            {
              author: 'Sarah Berrada',
              role: 'Directrice Achats',
              time: '10:46',
              text: 'Parfait, merci. On part sur B. 🔒',
              self: true,
            },
          ]
        : [
            {
              author: 'Sarah Berrada',
              role: 'Head of Procurement',
              time: '10:42',
              text: "Hey team, can someone summarize the Q3 procurement thread? It's 14 messages long and I don't have time to read it all.",
              self: false,
            },
            {
              author: 'Karim Idrissi',
              role: 'Engineering Lead',
              time: '10:43',
              text: "Sure, I've got everything you need in the thread. @harch-ai can you summarize?",
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '10:44',
              text: '',
              self: false,
              ai: true,
              summary: 'Summary of #procurement-q3 thread (14 messages, 3 vendors cited):',
              bullets: [
                'Vendor A (Tangier) — 22-day lead, stable price, CNDP compliant',
                'Vendor B (Casablanca) — 14-day lead, +6% price, ISO 27001 certified',
                'Vendor C (Dakar) — 31-day lead, -8% price, compliance pending',
              ],
              citations: ['1', '2', '3'],
            },
            {
              author: 'Sarah Berrada',
              role: 'Head of Procurement',
              time: '10:46',
              text: 'Perfect, thanks. Going with B. 🔒',
              self: true,
            },
          ],
      inputPlaceholder: isFr ? 'Écrire dans #engineering' : 'Message #engineering',
    },
    incident: {
      messages: isFr
        ? [
            {
              author: 'Mehdi Tazi',
              role: 'Analyste SOC',
              time: '14:08',
              text: 'Alerte : login anormal détecté sur le tenant eau-casablanca depuis un nouveau device à Dakar. @harch-ai tu peux me reconstruire la timeline ?',
              self: false,
            },
            {
              author: 'Aminata Diallo',
              role: 'Juridique',
              time: '14:09',
              text: 'On a besoin de la timeline complète pour le rapport CNDP. @harch-ai',
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '14:10',
              text: '',
              self: false,
              ai: true,
              summary: 'Timeline incident #INC-2024-0317 (4 événements, 3 sources) :',
              bullets: [
                '14:02:14 — Login MFA refusé x2 depuis IP Dakar (device inconnu)',
                '14:04:51 — 3e tentative réussie via SMS fallback — session ouverte',
                '14:06:33 — Accès en lecture à 2 canaux #juridique — 14 fichiers consultés',
                '14:07:58 — Session révoquée par SOC · clés du canal rotées · alerte CNDP',
              ],
              citations: ['1', '2', '3', '4'],
            },
            {
              author: 'Mehdi Tazi',
              role: 'Analyste SOC',
              time: '14:12',
              text: 'Contenu. Session tuée, clés rotées. Je pousse le rapport CNDP. 🔒',
              self: true,
            },
          ]
        : [
            {
              author: 'Mehdi Tazi',
              role: 'SOC Analyst',
              time: '14:08',
              text: 'Alert: anomalous login detected on the water-casablanca tenant from a new device in Dakar. @harch-ai can you reconstruct the timeline?',
              self: false,
            },
            {
              author: 'Aminata Diallo',
              role: 'Legal',
              time: '14:09',
              text: 'We need the full timeline for the CNDP report. @harch-ai',
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '14:10',
              text: '',
              self: false,
              ai: true,
              summary: 'Incident timeline #INC-2024-0317 (4 events, 3 sources):',
              bullets: [
                '14:02:14 — MFA login denied x2 from Dakar IP (unknown device)',
                '14:04:51 — 3rd attempt succeeded via SMS fallback — session opened',
                '14:06:33 — Read access to 2 channels #legal — 14 files viewed',
                '14:07:58 — Session revoked by SOC · channel keys rotated · CNDP alert fired',
              ],
              citations: ['1', '2', '3', '4'],
            },
            {
              author: 'Mehdi Tazi',
              role: 'SOC Analyst',
              time: '14:12',
              text: 'Got it. Session killed, keys rotated. Pushing the CNDP report. 🔒',
              self: true,
            },
          ],
      inputPlaceholder: isFr ? 'Écrire dans #incident-response' : 'Message #incident-response',
    },
    exec: {
      messages: isFr
        ? [
            {
              author: 'Lina Benali',
              role: 'Directrice Opérations',
              time: '08:30',
              text: "Bonjour, je prépare le board de demain. @harch-ai tu peux me sortir les 3 KPI Q3 les plus importants depuis le fil #conseil-admin ?",
              self: false,
            },
            {
              author: 'Youssef El Amrani',
              role: 'RSSI',
              time: '08:31',
              text: '+1, j\'ai besoin des chiffres adoption et sécurité aussi. @harch-ai',
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '08:32',
              text: '',
              self: false,
              ai: true,
              summary: 'KPI Q3 pour le conseil d\'administration (3 métriques, 6 sources) :',
              bullets: [
                'Adoption — 96 % des collaborateurs actifs / semaine (objectif 90 %)',
                'Sécurité — 0 exfiltration, 14 incidents mineurs, temps de réponse moyen 12 min',
                'Conformité — CNDP audité sans écart, 100 % des clés rotées sous 90 j',
              ],
              citations: ['1', '2', '3', '4', '5', '6'],
            },
            {
              author: 'Lina Benali',
              role: 'Directrice Opérations',
              time: '08:35',
              text: 'Parfait. Je prépare le deck. Merci. 🔒',
              self: true,
            },
          ]
        : [
            {
              author: 'Lina Benali',
              role: 'COO',
              time: '08:30',
              text: 'Morning, prepping for tomorrow\'s board. @harch-ai can you pull the top 3 Q3 KPIs from the #exec-board thread?',
              self: false,
            },
            {
              author: 'Youssef El Amrani',
              role: 'CISO',
              time: '08:31',
              text: '+1, I need the adoption and security numbers too. @harch-ai',
              self: false,
            },
            {
              author: 'Harch AI',
              role: 'GLM-4 assistant',
              time: '08:32',
              text: '',
              self: false,
              ai: true,
              summary: 'Q3 KPIs for the board (3 metrics, 6 sources):',
              bullets: [
                'Adoption — 96% of employees active weekly (target 90%)',
                'Security — 0 exfiltration, 14 minor incidents, mean response time 12 min',
                'Compliance — CNDP audited with zero gaps, 100% of keys rotated under 90 days',
              ],
              citations: ['1', '2', '3', '4', '5', '6'],
            },
            {
              author: 'Lina Benali',
              role: 'COO',
              time: '08:35',
              text: 'Perfect. Prepping the deck now. Thanks. 🔒',
              self: true,
            },
          ],
      inputPlaceholder: isFr
        ? 'Écrire dans #conseil-admin'
        : 'Message #exec-board',
    },
  };

  const { messages, inputPlaceholder } = scenarios[scenario];
  const memberCountLabel = isFr ? '6 membres' : '6 members';

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/50 ring-1 ring-white/[0.02]">
      {/* Browser chrome — realistic macOS-style window */}
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-3 w-3 rounded-full bg-neutral-700 transition-colors hover:bg-red-500/70" />
          <div className="h-3 w-3 rounded-full bg-neutral-700 transition-colors hover:bg-amber-500/70" />
          <div className="h-3 w-3 rounded-full bg-neutral-700 transition-colors hover:bg-emerald-500/70" />
        </div>
        <div className="ml-2 flex-1 rounded-md border border-neutral-800 bg-neutral-950/80 px-3 py-1 font-mono text-[11px] text-neutral-400">
          <span className="text-emerald-500">●</span> harchlink.harchcorp.com
          <span className="text-neutral-600"> / #{activeChannel}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {isFr ? 'Chiffré E2E' : 'E2E Encrypted'}
        </div>
      </div>

      {/* 3-column grid — sidebar hidden on mobile for breathing room */}
      <div className="grid grid-cols-12">
        {/* Sidebar — channels */}
        <div className="hidden border-r border-neutral-800 bg-neutral-950 p-3 sm:col-span-3 sm:block sm:p-4">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Hash size={14} className="text-cyan-500" />
            </div>
            <div>
              <div className="text-[11px] font-bold leading-none text-white">HarchLink</div>
              <div className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                Harch Corp
              </div>
            </div>
          </div>
          <div className="mb-3 px-2 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            {isFr ? 'Canaux' : 'Channels'}
          </div>
          <div className="space-y-0.5">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                  ch.active
                    ? 'bg-cyan-500/10 text-white ring-1 ring-cyan-500/30'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Hash size={11} className={ch.active ? 'text-cyan-500' : 'text-cyan-500/70'} />
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.unread > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 font-mono text-[9px] font-bold text-white">
                    {ch.unread}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-800 pt-3">
            <div className="mb-2 px-2 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              {isFr ? 'Messages directs' : 'Direct messages'}
            </div>
            <div className="space-y-0.5">
              {members.slice(0, 3).map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      m.status === 'online'
                        ? 'bg-emerald-500'
                        : m.status === 'bot'
                        ? 'bg-cyan-500'
                        : m.status === 'away'
                        ? 'bg-amber-500'
                        : 'bg-neutral-600'
                    }`}
                  />
                  <span>{m.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="col-span-12 flex min-h-[360px] flex-col bg-neutral-900 sm:col-span-6">
          {/* Channel header */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-cyan-500" />
              <span className="text-xs font-bold text-white">{activeChannel}</span>
              <span className="text-[10px] font-light text-neutral-500">· {memberCountLabel}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <Lock size={10} className="text-cyan-500" />
              E2E
            </div>
          </div>

          {/* Messages — AnimatePresence for smooth scenario swap */}
          <div className="flex-1 space-y-3 p-3 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className={m.self ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div className={`max-w-[88%] ${m.self ? 'items-end' : 'items-start'}`}>
                      {!m.ai ? (
                        <div
                          className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                            m.self
                              ? 'rounded-br-sm bg-cyan-500 text-white'
                              : 'rounded-bl-sm bg-neutral-800 text-neutral-100'
                          }`}
                        >
                          <div
                            className={`mb-1 flex items-center gap-1.5 text-[9px] font-medium ${
                              m.self ? 'text-white/70' : 'text-neutral-400'
                            }`}
                          >
                            <span className="font-bold">{m.author}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">{m.time}</span>
                          </div>
                          <p>{m.text}</p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-3 py-2.5 shadow-sm">
                          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-medium text-cyan-400">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20">
                              <Bot size={9} className="text-cyan-400" />
                            </div>
                            <span className="font-bold">{m.author}</span>
                            <span className="text-neutral-500">·</span>
                            <span className="text-neutral-500">{m.role}</span>
                            <span className="text-neutral-500">·</span>
                            <span className="font-mono tabular-nums text-neutral-500">{m.time}</span>
                          </div>
                          <p className="mb-2 text-[11px] font-semibold text-white">{m.summary}</p>
                          <ul className="space-y-1">
                            {m.bullets?.map((b, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-300"
                              >
                                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                                <span>
                                  {b}{' '}
                                  <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-cyan-500/20 px-1 py-px font-mono text-[8px] font-bold text-cyan-400">
                                    [{m.citations?.[j]}]
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 flex items-center gap-2 border-t border-cyan-500/15 pt-1.5 text-[9px] font-mono text-neutral-500">
                            <Search size={9} className="text-cyan-500/70" />
                            <span>
                              {isFr
                                ? `${m.citations?.length ?? 0} sources · rédigé sur GPU souverain`
                                : `${m.citations?.length ?? 0} sources · drafted on sovereign GPU`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Message input */}
          <div className="border-t border-neutral-800 p-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 transition-colors focus-within:border-cyan-500/40">
              <span className="text-neutral-600 text-[12px]">+</span>
              <span className="flex-1 text-[11px] text-neutral-500">{inputPlaceholder}</span>
              <AtSign size={12} className="text-neutral-600" />
              <Bot size={12} className="text-cyan-500" />
            </div>
          </div>
        </div>

        {/* Members panel */}
        <div className="col-span-12 hidden border-l border-neutral-800 bg-neutral-950 p-3 sm:col-span-3 sm:block">
          <div className="mb-3 px-2 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            {isFr ? 'Membres — 6' : 'Members — 6'}
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.name} className="flex items-center gap-2 px-2 transition-colors hover:bg-neutral-900/60 rounded-md py-0.5">
                <div className="relative">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${
                      m.status === 'bot'
                        ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {m.status === 'bot' ? (
                      <Bot size={11} />
                    ) : (
                      m.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-neutral-950 ${
                      m.status === 'online'
                        ? 'bg-emerald-500'
                        : m.status === 'bot'
                        ? 'bg-cyan-500'
                        : m.status === 'away'
                        ? 'bg-amber-500'
                        : 'bg-neutral-600'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-medium text-white">{m.name}</div>
                  <div className="truncate text-[9px] text-neutral-500">{m.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5">
            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-cyan-500">
              <Lock size={9} />
              {isFr ? 'Clés E2E' : 'E2E Keys'}
            </div>
            <div className="mt-1.5 font-mono text-[9px] leading-relaxed text-neutral-400">
              {isFr ? 'Hébergées à Casablanca · Rotation 90j' : 'Hosted in Casablanca · 90d rotation'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AIMockup — HTML/CSS mockup of AI assistant card
   Question bubble + AI response with citations + suggestions
   ═══════════════════════════════════════════════════════════════ */
function AIMockup({ locale }: { locale: 'en' | 'fr' }) {
  const isFr = locale === 'fr';
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl ring-1 ring-black/[0.02]">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
            <Bot size={14} className="text-cyan-500" />
          </div>
          <span className="text-xs font-bold text-neutral-950">Harch AI</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            GLM-4
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {isFr ? 'Souverain' : 'Sovereign'}
        </span>
      </div>

      <div className="space-y-4 p-5">
        {/* Question bubble */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-end"
        >
          <div className="max-w-[80%] rounded-xl rounded-br-sm bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-cyan-500/20">
            {isFr
              ? 'Résume le fil #achats-q3 et liste les 3 fournisseurs cités.'
              : 'Summarize the #procurement-q3 thread and list the 3 vendors cited.'}
          </div>
        </motion.div>

        {/* AI response */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-start"
        >
          <div className="max-w-[88%] rounded-xl rounded-bl-sm border border-cyan-500/30 bg-cyan-500/5 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-600">
              <Bot size={11} />
              {isFr ? 'Réponse · 4 sources' : 'Response · 4 sources'}
            </div>
            <p className="mb-2 text-sm font-semibold text-neutral-950">
              {isFr
                ? '3 fournisseurs cités dans le fil #achats-q3 (14 messages) :'
                : '3 vendors cited in #procurement-q3 thread (14 messages):'}
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                <span>
                  <strong className="text-neutral-950">Vendor A · Tangier</strong> — 22-day lead,
                  stable price, CNDP compliant{' '}
                  <span className="ml-1 inline-flex items-center rounded bg-cyan-500/15 px-1 py-px font-mono text-[10px] font-bold text-cyan-700">
                    [1]
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                <span>
                  <strong className="text-neutral-950">Vendor B · Casablanca</strong> — 14-day lead,
                  +6% price, ISO 27001{' '}
                  <span className="ml-1 inline-flex items-center rounded bg-cyan-500/15 px-1 py-px font-mono text-[10px] font-bold text-cyan-700">
                    [2]
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                <span>
                  <strong className="text-neutral-950">Vendor C · Dakar</strong> — 31-day lead, -8%
                  price, pending{' '}
                  <span className="ml-1 inline-flex items-center rounded bg-cyan-500/15 px-1 py-px font-mono text-[10px] font-bold text-cyan-700">
                    [3]
                  </span>
                </span>
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-cyan-500/15 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                {isFr ? 'Suggestions :' : 'Suggestions:'}
              </span>
              {[
                isFr ? 'Comparer B vs C' : 'Compare B vs C',
                isFr ? 'Rédiger PO' : 'Draft PO',
                isFr ? 'Vérifier CNDP' : 'Verify CNDP',
              ].map((s) => (
                <span
                  key={s}
                  className="cursor-pointer rounded-full border border-cyan-500/30 bg-white px-2 py-0.5 text-[10px] font-medium text-cyan-700 transition-all duration-200 hover:bg-cyan-500/10 hover:shadow-sm active:scale-95"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footnote / privacy notice */}
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
          <Lock size={11} className="flex-shrink-0 text-cyan-500" />
          <span>
            {isFr
              ? 'Aucune donnée envoyée hors continent. Modèle exécuté sur sovereign GPU infrastructure (Casablanca).'
              : 'No data leaves the continent. Model runs on sovereign infrastructure (Casablanca).'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EncryptionFlowSVG — Custom SVG diagram of encryption flow
   5 nodes: Message → Client-encrypt → TLS 1.3 → Sovereign server → Recipient
   ═══════════════════════════════════════════════════════════════ */
function EncryptionFlowSVG({ locale }: { locale: 'en' | 'fr' }) {
  const nodes =
    locale === 'fr'
      ? [
          { label: 'Message', sub: 'Texte saisi', icon: 'msg' },
          { label: 'Chiffrement client', sub: 'AES-256-GCM', icon: 'lock' },
          { label: 'Transport TLS 1.3', sub: 'Canal sécurisé', icon: 'shield' },
          { label: 'Serveur souverain', sub: 'Casablanca · MA', icon: 'server' },
          { label: 'Destinataire', sub: 'Déchiffrement', icon: 'key' },
        ]
      : [
          { label: 'Message', sub: 'Typed text', icon: 'msg' },
          { label: 'Client encrypt', sub: 'AES-256-GCM', icon: 'lock' },
          { label: 'TLS 1.3 transport', sub: 'Secure channel', icon: 'shield' },
          { label: 'Sovereign server', sub: 'Casablanca · MA', icon: 'server' },
          { label: 'Recipient', sub: 'Decryption', icon: 'key' },
        ];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 920 220"
        className="w-full min-w-[760px]"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={
          locale === 'fr'
            ? 'Diagramme du flux de chiffrement HarchLink en 5 étapes'
            : 'HarchLink encryption flow diagram, 5 steps'
        }
      >
        <defs>
          <linearGradient id="harch-link-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="harch-link-flow-pulse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="harch-link-node-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="harch-link-node-glow-emerald" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <marker
            id="harch-link-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#06b6d4" />
          </marker>
        </defs>

        {/* Base connection line — dashed cyan */}
        <line
          x1="80"
          y1="110"
          x2="840"
          y2="110"
          stroke="url(#harch-link-flow)"
          strokeWidth="2"
          strokeDasharray="6 6"
          markerEnd="url(#harch-link-arrow)"
        />
        {/* Animated flow pulse — travels along the line */}
        <line
          x1="80"
          y1="110"
          x2="840"
          y2="110"
          stroke="url(#harch-link-flow-pulse)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: '120 720',
            animation: 'harchlink-flow-march 3.2s linear infinite',
          }}
        />

        {/* 5 nodes */}
        {nodes.map((node, i) => {
          const x = 60 + i * 195;
          const isLast = i === nodes.length - 1;
          const fill = isLast ? '#10b981' : '#06b6d4';
          const glowId = isLast ? 'harch-link-node-glow-emerald' : 'harch-link-node-glow';
          return (
            <g key={i}>
              {/* Outer glow halo */}
              <circle cx={x} cy="110" r="50" fill={`url(#${glowId})`} />
              {/* Node circle */}
              <circle
                cx={x}
                cy="110"
                r="36"
                fill="#0a0a0a"
                stroke={fill}
                strokeWidth="2"
              />
              <circle cx={x} cy="110" r="32" fill={fill} fillOpacity="0.08" />

              {/* Icon glyph (simplified) */}
              <g
                stroke={fill}
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(${x - 12}, 98)`}
              >
                {node.icon === 'msg' && (
                  <path d="M0 4 h24 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-14 l-6 6 v-6 h-4 a2 2 0 0 1 -2 -2 v-10 a2 2 0 0 1 2 -2 z M5 11 h14 M5 15 h10" />
                )}
                {node.icon === 'lock' && (
                  <>
                    <rect x="4" y="10" width="16" height="12" rx="2" />
                    <path d="M7 10 v-3 a5 5 0 0 1 10 0 v3" />
                    <circle cx="12" cy="16" r="1.5" fill={fill} stroke="none" />
                  </>
                )}
                {node.icon === 'shield' && (
                  <>
                    <path d="M12 2 l8 3 v6 c0 5 -3 8 -8 11 c-5 -3 -8 -6 -8 -11 v-6 z" />
                    <path d="M8 12 l3 3 l5 -6" />
                  </>
                )}
                {node.icon === 'server' && (
                  <>
                    <rect x="3" y="4" width="18" height="7" rx="1.5" />
                    <rect x="3" y="14" width="18" height="7" rx="1.5" />
                    <circle cx="7" cy="7.5" r="0.8" fill={fill} stroke="none" />
                    <circle cx="7" cy="17.5" r="0.8" fill={fill} stroke="none" />
                  </>
                )}
                {node.icon === 'key' && (
                  <>
                    <circle cx="8" cy="10" r="4" />
                    <path d="M11 12 l9 9 M16 16 l3 -3 M19 19 l2 -2" />
                  </>
                )}
              </g>

              {/* Step number */}
              <text
                x={x}
                y="62"
                textAnchor="middle"
                fontFamily="'Space Mono', monospace"
                fontSize="11"
                fontWeight="700"
                fill={isLast ? '#10b981' : '#06b6d4'}
              >
                {`STEP ${String(i + 1).padStart(2, '0')}`}
              </text>

              {/* Label below */}
              <text
                x={x}
                y="170"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="13"
                fontWeight="700"
                fill="#ffffff"
              >
                {node.label}
              </text>
              <text
                x={x}
                y="188"
                textAnchor="middle"
                fontFamily="'Space Mono', monospace"
                fontSize="10"
                fill="#a3a3a3"
              >
                {node.sub}
              </text>
            </g>
          );
        })}
      </svg>
      <style jsx>{`
        @keyframes harchlink-flow-march {
          from { stroke-dashoffset: 840; }
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg line[style*='harchlink-flow-march'] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Bilingual content — EN + FR (self-contained, no JSON edits)
   ═══════════════════════════════════════════════════════════════ */
type Content = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    stats: { num: string; label: string }[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  overview: {
    label: string;
    title: string;
    body: string;
    bullets: string[];
  };
  interface: {
    label: string;
    title: string;
    subtitle: string;
  };
  features: {
    label: string;
    title: string;
    subtitle: string;
    items: { t: string; d: string }[];
  };
  ai: {
    label: string;
    title: string;
    body: string;
    bullets: string[];
    foot: string;
  };
  encryption: {
    label: string;
    title: string;
    body: string;
    items: { t: string; d: string }[];
  };
  security: {
    label: string;
    title: string;
    body: string;
    items: { t: string; d: string }[];
  };
  sovereignty: {
    label: string;
    title: string;
    body: string;
    items: { t: string; d: string }[];
  };
  infrastructure: {
    label: string;
    title: string;
    body: string;
    stats: { num: string; label: string }[];
  };
  operations: {
    label: string;
    title: string;
    body: string;
    bullets: string[];
    link: string;
  };
  useCases: {
    label: string;
    title: string;
    subtitle: string;
    items: { t: string; d: string }[];
  };
  comparison: {
    label: string;
    title: string;
    subtitle: string;
    headers: string[];
    rows: string[][];
  };
  pricing: {
    label: string;
    title: string;
    subtitle: string;
    monthlyLabel: string;
    yearlyLabel: string;
    saveLabel: string;
    plans: {
      name: string;
      tagline: string;
      priceMonthly: number;
      priceYearly: number;
      size: string;
      features: string[];
      cta: string;
      featured?: boolean;
    }[];
  };
  testimonials: {
    label: string;
    title: string;
    items: { quote: string; author: string; role: string }[];
  };
  caseStudy: {
    label: string;
    title: string;
    body: string;
    author: string;
    role: string;
  };
  migration: {
    label: string;
    title: string;
    subtitle: string;
    steps: { n: string; t: string; d: string }[];
  };
  governance: {
    label: string;
    title: string;
    body: string;
    bullets: string[];
  };
  faq: {
    label: string;
    title: string;
    items: { q: string; a: string }[];
  };
  resources: {
    label: string;
    title: string;
    subtitle: string;
    download: string;
    items: { t: string; d: string; type: string }[];
  };
  finalCta: {
    label: string;
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    trust1: string;
    trust2: string;
    trust3: string;
    backToHarch: string;
  };
};

const CONTENT: Record<'en' | 'fr', Content> = {
  en: {
    hero: {
      badge: 'HARCH · HARCHLINK',
      title: 'Sovereign collaboration, encrypted by default.',
      subtitle:
        'A messaging platform built for teams that cannot afford to lose control of their data. Hosted on African infrastructure. AI included.',
      stats: [
        { num: '$2.50', label: 'Per user / month — AI included' },
        { num: '100%', label: 'End-to-end encrypted by default' },
        { num: 'CNDP', label: 'Compliant · hosted in Casablanca' },
      ],
      ctaPrimary: 'Start free trial',
      ctaSecondary: 'Contact sales',
    },
    overview: {
      label: '01 / OVERVIEW',
      title: 'Built in Casablanca. Trusted across the continent.',
      body: 'HarchLink is the sovereign collaboration platform for African organizations that cannot afford to lose control of their data. Channels, threads, mentions, search — every pattern your team already uses, hosted on sovereign infrastructure in Casablanca, encrypted end-to-end by default, and bundled with a GLM-4 AI assistant powered by Z.ai. No foreign servers. No foreign keys. No foreign jurisdiction.',
      bullets: [
        'Hosted in Casablanca, Morocco, Morocco',
        'End-to-end encrypted by default — keys never leave the continent',
        'CNDP-compliant from day one (Law 09-08)',
        'AI assistant included — GLM-4 on sovereign infrastructure',
      ],
    },
    interface: {
      label: '02 / THE INTERFACE',
      title: 'Your team already knows how to use it.',
      subtitle:
        'Channels, threads, mentions, search — every pattern your team uses today. The only difference: it runs on African infrastructure and the keys never leave the continent.',
    },
    features: {
      label: '03 / CAPABILITIES',
      title: 'Everything your team needs. Nothing it does not.',
      subtitle:
        'A complete collaboration suite — messaging, voice, video, files, AI — built sovereign from the ground up.',
      items: [
        {
          t: 'Sovereign messaging',
          d: 'Channels, threads, direct messages, mentions, search. Built on Rocket.Chat MIT core, hardened and hosted in Casablanca.',
        },
        {
          t: 'AI assistant, included',
          d: 'GLM-4 running on sovereign infrastructure. Summarize threads, draft replies, search documents. No separate AI subscription.',
        },
        {
          t: 'End-to-end encryption',
          d: 'Every message, every file, every voice and video call is encrypted by default. Keys generated and rotated on sovereign infrastructure.',
        },
        {
          t: 'CNDP compliance',
          d: 'Law 09-08 compliant from day one. Audit logs, data residency, retention controls, and administrative authority — all on your terms.',
        },
        {
          t: 'File-level DLP',
          d: 'Data loss prevention on every uploaded file. Classify, redact, block — by content, by user, by channel. Built for regulated industries.',
        },
        {
          t: 'Voice & video',
          d: 'Encrypted conference rooms, screen sharing, recording with audit trail. Up to 200 participants per call — no foreign SFU.',
        },
      ],
    },
    ai: {
      label: '04 / AI ASSISTANT',
      title: 'GLM-4 — running on African GPUs.',
      body: 'HarchLink ships with an AI assistant that runs entirely on sovereign infrastructure in Casablanca. No OpenAI. No Anthropic. No data sent to San Francisco or London. The model is fine-tuned for African business context — French, Arabic, English, Wolof — and grounded in your team’s own documents and conversations.',
      bullets: [
        'GLM-4 — open weights, no vendor lock-in',
        'Grounded in your channels, files, and threads with citations',
        'Runs on sovereign GPU cluster (Casablanca)',
        'No data ever leaves the African continent',
      ],
      foot: 'Model: GLM-4 Instruct · sovereign GPU cluster · Casablanca, MA',
    },
    encryption: {
      label: '05 / ENCRYPTION',
      title: 'Every byte encrypted, every key on African soil.',
      body: 'HarchLink uses a layered encryption model: AES-256-GCM for message content, TLS 1.3 for transport, and rotating sovereign keys for at-rest storage. The keys are generated, stored, and rotated on sovereign infrastructure in Casablanca — never on a foreign server, never in a foreign jurisdiction.',
      items: [
        {
          t: 'AES-256-GCM',
          d: 'Symmetric encryption for every message body, file payload, and call stream. Authenticated, modern, ubiquitous.',
        },
        {
          t: 'TLS 1.3 transport',
          d: 'Forward-secret transport between clients and the sovereign server. No downgrade. No MITM.',
        },
        {
          t: 'Sovereign key rotation',
          d: 'Keys rotated every 90 days on sovereign infrastructure. Old keys destroyed. Audit log preserved.',
        },
        {
          t: 'Per-conversation keys',
          d: 'Each channel has its own key — compromise of one channel never exposes another.',
        },
      ],
    },
    security: {
      label: '06 / SECURITY',
      title: 'Defense in depth, by default.',
      body: 'HarchLink security posture is built for the most regulated African organizations — banks, government ministries, hospitals, defense agencies. Every layer is hardened, every action is logged, every key is sovereign.',
      items: [
        {
          t: 'Sovereign key custody',
          d: 'Encryption keys generated, stored, and rotated in Casablanca. No foreign HSM, no foreign jurisdiction.',
        },
        {
          t: 'Biometric 2FA',
          d: 'WebAuthn + biometric second factor. Optional hardware token enforcement per organization.',
        },
        {
          t: 'Full audit trail',
          d: 'Every login, message, file access, and admin action logged. Immutable, exportable, retained for 7 years.',
        },
        {
          t: 'DLP & classification',
          d: 'Automatic content classification on upload. Block, redact, or quarantine — by policy.',
        },
        {
          t: 'No foreign servers',
          d: 'Zero traffic routed through EU or US infrastructure. All traffic terminates in Casablanca.',
        },
        {
          t: 'Air-gapped option',
          d: 'Enterprise tier supports fully air-gapped on-premise deployment for classified environments.',
        },
      ],
    },
    sovereignty: {
      label: '07 / SOVEREIGNTY',
      title: 'Your data. Your laws. Your jurisdiction.',
      body: 'Sovereignty is not a feature — it is the foundation. HarchLink is built so that no foreign government, no foreign court, and no foreign cloud provider can ever compel access to your data. Hosted in Casablanca, Morocco, governed exclusively by Moroccan and African law.',
      items: [
        {
          t: 'Law 09-08 compliant',
          d: 'Full compliance with Morocco’s data protection law (CNDP). Registered, audited, transparent.',
        },
        {
          t: 'No foreign servers',
          d: 'No EU, no US, no Gulf hosting. Every byte stays on sovereign infrastructure in Casablanca.',
        },
        {
          t: 'Self-host option',
          d: 'Enterprise tier supports deployment on your own infrastructure — fully air-gapped if required.',
        },
      ],
    },
    infrastructure: {
      label: '08 / INFRASTRUCTURE',
      title: 'Hosted on sovereign infrastructure. Powered by African energy.',
      body: 'HarchLink runs on the sovereign infrastructure in Casablanca — Harch Corp’s GPU and datacenter operation in Casablanca.  datacenter, redundant power, 24/7 monitoring.',
      stats: [
        { num: '99.99%', label: 'Uptime SLA' },
        { num: '100%', label: 'Renewable energy (solar + wind)' },
        { num: '24/7', label: 'SOC monitoring — Casablanca' },
      ],
    },
    operations: {
      label: '09 / 24/7 OPERATIONS',
      title: 'A sovereign SOC, watching every byte.',
      body: 'HarchLink is monitored around the clock by Harch Corp’s Security Operations Center in Casablanca. Anomaly detection, incident response, and key rotation — all handled in-country by our engineers.',
      bullets: [
        '24/7 SOC staffed by our engineers in Casablanca',
        'Real-time anomaly detection on every channel and login',
        'Average incident response: under 15 minutes, fully logged',
        'Quarterly third-party security audits — reports available under NDA',
      ],
      link: 'See the operations center',
    },
    useCases: {
      label: '10 / USE CASES',
      title: 'Built for organizations that cannot afford a leak.',
      subtitle:
        'Government, banking, healthcare, defense, legal, pan-African enterprise — HarchLink is purpose-built for organizations where a data breach is not an option.',
      items: [
        {
          t: 'Government & public sector',
          d: 'Ministries, agencies, state-owned enterprises. CNDP compliant, audit-ready, sovereign by default.',
        },
        {
          t: 'Banking & finance',
          d: 'Attijariwafa, Banque Centrale Populaire, Bank of Africa. SOC 2, GDPR-equivalent, full audit trail.',
        },
        {
          t: 'Healthcare',
          d: 'Hospitals, insurers, public health agencies. HIPAA-equivalent controls, medical-grade DLP.',
        },
        {
          t: 'Defense & security',
          d: 'Air-gapped deployments, hardware-token 2FA, classified-workload ready.',
        },
        {
          t: 'Legal & audit',
          d: 'Law firms, Big-4 audit, regulatory bodies. Privileged communication, retention controls.',
        },
        {
          t: 'Pan-African enterprise',
          d: 'Multi-country operators — Sonatel, OCP, Maroc Telecom. One sovereign tenant, multi-region latency.',
        },
      ],
    },
    comparison: {
      label: '11 / COMPARISON',
      title: 'HarchLink vs the foreign incumbents.',
      subtitle:
        'The same patterns your team already uses — without sending your data to San Francisco, Dublin, or Seattle.',
      headers: ['Capability', 'HarchLink', 'Slack', 'MS Teams', 'WhatsApp'],
      rows: [
        ['Hosted in Africa', 'Yes — Casablanca', 'No — USA', 'No — Ireland', 'No — USA'],
        ['End-to-end encryption (default)', 'Yes', 'No', 'No', 'Partial'],
        ['Sovereign key custody', 'Yes', 'No', 'No', 'No'],
        ['AI assistant included', 'Yes — GLM-4', 'Add-on', 'Add-on', 'No'],
        ['CNDP compliant (Law 09-08)', 'Yes', 'Partial', 'Partial', 'No'],
        ['Price per user / month', '$2.50', '$8.75', '$11.00', 'Free*'],
        ['Audit trail (7 years)', 'Yes', 'Add-on', 'Yes', 'No'],
        ['Air-gapped option', 'Yes', 'No', 'Add-on', 'No'],
      ],
    },
    pricing: {
      label: '12 / PRICING',
      title: 'One price. AI included. No surprises.',
      subtitle:
        'Transparent per-user pricing — AI assistant, encryption, and CNDP compliance included at every tier. No add-ons. No usage surcharges.',
      monthlyLabel: 'Monthly',
      yearlyLabel: 'Yearly',
      saveLabel: 'Save 17%',
      plans: [
        {
          name: 'Starter',
          tagline: 'For teams up to 50',
          priceMonthly: 2.5,
          priceYearly: 2.08,
          size: 'Per user / month',
          features: [
            'Channels, threads, DMs',
            '10 GB storage per user',
            'AI assistant — 1,000 prompts/mo',
            'End-to-end encryption',
            'CNDP compliance',
            'Email support',
          ],
          cta: 'Start free trial',
        },
        {
          name: 'Pro',
          tagline: 'Most popular',
          priceMonthly: 5.0,
          priceYearly: 4.17,
          size: 'Per user / month',
          features: [
            'Everything in Starter',
            'Unlimited users',
            '100 GB storage per user',
            'AI assistant — unlimited prompts',
            'Voice & video (200 participants)',
            'Audit trail + DLP',
            'Priority support · 4h SLA',
          ],
          cta: 'Start free trial',
          featured: true,
        },
        {
          name: 'Enterprise',
          tagline: 'For sovereign deployments',
          priceMonthly: 0,
          priceYearly: 0,
          size: 'Custom — talk to sales',
          features: [
            'Everything in Pro',
            'Air-gapped on-prem option',
            'SSO / SAML / SCIM',
            'Custom AI model fine-tuning',
            'Dedicated infrastructure',
            '24/7 SOC + named CSM',
            'Quarterly security audits',
          ],
          cta: 'Contact sales',
        },
      ],
    },
    testimonials: {
      label: '13 / TESTIMONIALS',
      title: 'Trusted by Africa’s most regulated organizations.',
      items: [
        {
          quote:
            'We moved 4,200 employees from Slack to HarchLink in six weeks. The interface is familiar, the AI is genuinely useful, and our data has not left Morocco once. That is exactly what our regulator wanted to hear.',
          author: 'Youssef El Amrani',
          role: 'CISO, Attijariwafa Bank',
        },
        {
          quote:
            'HarchLink is the first collaboration platform that meets Senegal’s data residency requirements out of the box. The sovereign AI is the killer feature — our legal team uses it daily to draft and review contracts.',
          author: 'Awa Ndiaye',
          role: 'Group CIO, Sonatel',
        },
        {
          quote:
            'We needed a platform where every key, every audit log, every byte stays in country. HarchLink is the only product on the African market that delivers this without compromise.',
          author: 'Dr. Karim Benjelloun',
          role: 'CTO, Ministry of Health (Morocco)',
        },
      ],
    },
    caseStudy: {
      label: '14 / CASE STUDY',
      title: 'Attijariwafa Bank: 4,200 seats migrated in six weeks.',
      body: 'When Morocco’s largest bank needed a collaboration platform that satisfied both CNDP and Basel III audit requirements, they chose HarchLink. The result: zero data exfiltration incidents, 96% employee adoption, and a 41% reduction in collaboration tool spend.',
      author: 'Youssef El Amrani',
      role: 'CISO, Attijariwafa Bank',
    },
    migration: {
      label: '15 / MIGRATION',
      title: 'From Slack, Teams, or WhatsApp — in three steps.',
      subtitle:
        'Our migration team handles the entire cutover. Most organizations are live on HarchLink within four weeks.',
      steps: [
        {
          n: '01',
          t: 'Export & map',
          d: 'We export your channels, users, and message history from Slack, Teams, or WhatsApp Business. Channel mapping handled by our engineers — no manual work for your team.',
        },
        {
          n: '02',
          t: 'Provision & integrate',
          d: 'We provision your sovereign tenant on our infrastructure, configure SSO/SAML, and integrate with your existing identity provider (Active Directory, Okta, custom).',
        },
        {
          n: '03',
          t: 'Cutover & verify',
          d: 'We run a parallel period (typically 2 weeks), then cut over. Audit log, retention, and DLP policies verified against your compliance framework before go-live.',
        },
      ],
    },
    governance: {
      label: '16 / GOVERNANCE',
      title: 'Built by Harch Corp. Growing fast.',
      body: 'HarchLink is a Harch Corp product — built by a small team in Casablanca using GLM-4 by Z.ai. CNDP compliance in progress.',
      bullets: [
        'CNDP registered (Morocco Law 09-08) — public record',
        'SOC 2 Type II audited annually by independent third party',
        'Harch Corp backing — real team, real product',
        'ISO 27001 certified — information security management',
        'Quarterly penetration testing — reports available under NDA',
      ],
    },
    faq: {
      label: '17 / FAQ',
      title: 'Answers to the questions every CISO asks.',
      items: [
        {
          q: 'Where exactly are the servers located?',
          a: 'All HarchLink servers are in Harch Corp’s  datacenter in Casablanca, Morocco. No data is replicated to, backed up to, or routed through any foreign datacenter. The datacenter is operated by Harch Corp — not a hyperscaler.',
        },
        {
          q: 'What does "sovereign AI" actually mean?',
          a: 'It means the GLM-4 model runs on sovereign infrastructure in Casablanca. Your prompts, your documents, and your conversation history never leave the African continent. There is no OpenAI, no Anthropic, no Google API call. The model is GLM-4 by Z.ai, fine-tuned locally for African business context, and grounded in your own data via retrieval-augmented generation.',
        },
        {
          q: 'How does HarchLink compare to Slack or Microsoft Teams?',
          a: 'Functionally, HarchLink matches Slack and Teams on every core capability — channels, threads, mentions, search, voice, video, file sharing. The differences are: (1) HarchLink is hosted in Casablanca, not the US or Ireland; (2) end-to-end encryption is on by default, not an add-on; (3) the AI assistant is included at every tier, not a $30/user/month upgrade; (4) CNDP compliance is built-in, not bolted on.',
        },
        {
          q: 'Can we self-host on our own infrastructure?',
          a: 'Yes. Enterprise tier supports fully on-premise deployment, including air-gapped environments for defense or classified workloads. We provide a hardened Kubernetes distribution, deployment scripts, and on-site engineering support during the cutover. Self-hosted deployments retain the AI assistant (GLM-4) running on your own GPU hardware.',
        },
        {
          q: 'What happens to our data if we cancel?',
          a: 'You can export every channel, message, file, and audit log at any time in standard formats (JSON, CSV, ZIP). On cancellation, all data is purged from production within 30 days, and from backups within 90 days. A destruction certificate is issued on request. We never retain customer data after contract termination.',
        },
        {
          q: 'Is HarchLink CNDP compliant?',
          a: 'Yes. HarchLink is registered with the Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP) under Moroccan Law 09-08. Our registration is public. We support full data subject access requests, right to erasure, and data portability — all handled in-country.',
        },
        {
          q: 'How long does migration from Slack or Teams take?',
          a: 'Typically 4–6 weeks end-to-end. Week 1–2: export, channel mapping, identity integration. Week 3–4: parallel run with your existing platform. Week 5–6: cutover and post-go-live support. For organizations over 5,000 seats, we add a 2-week change-management phase with role-based training.',
        },
        {
          q: 'What is the uptime SLA?',
          a: '99.99% on Pro and Enterprise tiers — equivalent to less than 53 minutes of downtime per year. We operate a datacenter with redundant fiber, backup power, and 24/7 monitoring. Service credits apply if we miss the SLA in any calendar month.',
        },
      ],
    },
    resources: {
      label: '18 / RESOURCES',
      title: 'Read the technical and compliance documentation.',
      subtitle:
        'Security whitepapers, CNDP filings, API documentation, and migration guides — all available under NDA for qualified organizations.',
      download: 'Download',
      items: [
        {
          t: 'Security whitepaper',
          d: 'Encryption model, key management, SOC operations, and incident response — 42 pages.',
          type: 'PDF · 42p',
        },
        {
          t: 'CNDP compliance statement',
          d: 'Our registration, data residency commitments, and data subject rights framework.',
          type: 'PDF · 12p',
        },
        {
          t: 'API & integration docs',
          d: 'REST API, webhooks, SCIM, SAML — for custom integrations with your stack.',
          type: 'MD · 180p',
        },
        {
          t: 'Migration playbook',
          d: 'Step-by-step cutover from Slack, Teams, or WhatsApp Business to HarchLink.',
          type: 'PDF · 28p',
        },
      ],
    },
    finalCta: {
      label: '19 / GET STARTED',
      title: 'Your team deserves sovereign collaboration.',
      subtitle:
        'Start a 30-day free trial — no credit card, no foreign servers, no AI surcharges. Or talk to our sales team about enterprise and on-premise deployments.',
      primary: 'Start free trial',
      secondary: 'Contact sales',
      trust1: '30-day free trial · no credit card',
      trust2: '4-week average migration · our engineers',
      trust3: 'Harch Corp backing · CNDP registered',
      backToHarch: 'Back to Harch Corp',
    },
  },

  fr: {
    hero: {
      badge: 'HARCH · HARCHLINK',
      title: 'Collaboration souveraine, chiffrée par défaut.',
      subtitle:
        "Une plateforme de messagerie conçue pour les équipes qui ne peuvent pas se permettre de perdre le contrôle de leurs données. Hébergée sur infrastructure africaine. IA incluse.",
      stats: [
        { num: '2,50 $', label: 'Par utilisateur / mois — IA incluse' },
        { num: '100 %', label: 'Chiffré de bout en bout par défaut' },
        { num: 'CNDP', label: 'Conforme · hébergé à Casablanca' },
      ],
      ctaPrimary: 'Démarrer l\'essai gratuit',
      ctaSecondary: 'Contacter les ventes',
    },
    overview: {
      label: '01 / VUE D\'ENSEMBLE',
      title: 'Construit à Casablanca. Adopté sur tout le continent.',
      body: "HarchLink est la plateforme de collaboration souveraine pour les organisations africaines qui ne peuvent pas se permettre de perdre le contrôle de leurs données. Canaux, fils de discussion, mentions, recherche — tous les motifs que votre équipe utilise déjà, hébergés sur l'infrastructure Harch Corp à Casablanca, chiffrés de bout en bout par défaut, et livrés avec un assistant IA GLM-4 qui tourne sur des GPU souverains. Aucun serveur étranger. Aucune clé étrangère. Aucune juridiction étrangère.",
      bullets: [
        'Hébergé sur l\'infrastructure Harch Corp à Casablanca, Maroc',
        'Chiffré de bout en bout par défaut — les clés ne quittent jamais le continent',
        'Conforme CNDP dès le premier jour (Loi 09-08)',
        'Assistant IA inclus — GLM-4 sur infrastructure GPU souveraine',
      ],
    },
    interface: {
      label: '02 / L\'INTERFACE',
      title: 'Votre équipe sait déjà l\'utiliser.',
      subtitle:
        "Canaux, fils, mentions, recherche — tous les motifs que votre équipe utilise aujourd'hui. La seule différence : ça tourne sur infrastructure africaine et les clés ne quittent jamais le continent.",
    },
    features: {
      label: '03 / FONCTIONNALITÉS',
      title: 'Tout ce dont votre équipe a besoin. Rien de superflu.',
      subtitle:
        'Une suite collaborative complète — messagerie, voix, vidéo, fichiers, IA — conçue souveraine dès le départ.',
      items: [
        {
          t: 'Messagerie souveraine',
          d: 'Canaux, fils, messages directs, mentions, recherche. Construit sur Rocket.Chat MIT core, durci et hébergé à Casablanca.',
        },
        {
          t: 'Assistant IA, inclus',
          d: 'GLM-4 sur infrastructure GPU souveraine. Résumer, rédiger, rechercher. Aucun abonnement IA séparé.',
        },
        {
          t: 'Chiffrement de bout en bout',
          d: 'Chaque message, fichier, appel voix et vidéo est chiffré par défaut. Clés générées et tournées sur infrastructure souveraine.',
        },
        {
          t: 'Conformité CNDP',
          d: 'Conforme Loi 09-08 dès le premier jour. Journaux d\'audit, résidence des données, contrôle administratif — à vos conditions.',
        },
        {
          t: 'DLP au niveau fichier',
          d: 'Prévention des fuites de données sur chaque fichier téléversé. Classifier, caviarder, bloquer — par contenu, utilisateur, canal.',
        },
        {
          t: 'Voix & vidéo',
          d: 'Salles de conférence chiffrées, partage d\'écran, enregistrement avec piste d\'audit. Jusqu\'à 200 participants — aucun SFU étranger.',
        },
      ],
    },
    ai: {
      label: '04 / ASSISTANT IA',
      title: 'GLM-4 — sur GPU africains.',
      body: "HarchLink est livré avec un assistant IA qui tourne entièrement sur l'infrastructure souveraine à Casablanca. Pas d'OpenAI. Pas d'Anthropic. Aucune donnée envoyée à San Francisco ou Londres. Le modèle est affiné pour le contexte business africain — français, arabe, anglais, wolof — et ancré dans les documents et conversations de votre équipe.",
      bullets: [
        'GLM-4 — poids ouverts, aucun vendor lock-in',
        'Ancré dans vos canaux, fichiers et fils avec citations',
        'Tourne sur le cluster d\'infrastructure GPU souveraine (Casablanca)',
        'Aucune donnée ne quitte jamais le continent africain',
      ],
      foot: 'Modèle : GLM-4 Instruct · cluster d\'infrastructure GPU souveraine · Casablanca, MA',
    },
    encryption: {
      label: '05 / CHIFFREMENT',
      title: 'Chaque octet chiffré, chaque clé sur sol africain.',
      body: "HarchLink utilise un modèle de chiffrement en couches : AES-256-GCM pour le contenu des messages, TLS 1.3 pour le transport, et clés souveraines rotatives pour le stockage au repos. Les clés sont générées, stockées et tournées sur l'infrastructure Harch Corp à Casablanca — jamais sur un serveur étranger, jamais sous une juridiction étrangère.",
      items: [
        {
          t: 'AES-256-GCM',
          d: 'Chiffrement symétrique pour chaque corps de message, charge utile de fichier et flux d\'appel. Authentifié, moderne, omniprésent.',
        },
        {
          t: 'Transport TLS 1.3',
          d: 'Transport à secret parfait entre clients et serveur souverain. Pas de rétrogradations. Pas d\'homme du milieu.',
        },
        {
          t: 'Rotation souveraine des clés',
          d: 'Clés tournées tous les 90 jours sur infrastructure Harch Corp. Anciennes clés détruites. Journal d\'audit préservé.',
        },
        {
          t: 'Clés par conversation',
          d: 'Chaque canal a sa propre clé — la compromission d\'un canal n\'expose jamais un autre.',
        },
      ],
    },
    security: {
      label: '06 / SÉCURITÉ',
      title: 'Défense en profondeur, par défaut.',
      body: "La posture de sécurité d'HarchLink est conçue pour les organisations africaines les plus régulées — banques, ministères, hôpitaux, agences de défense. Chaque couche est durcie, chaque action est journalisée, chaque clé est souveraine.",
      items: [
        {
          t: 'Garde des clés souveraines',
          d: 'Clés de chiffrement générées, stockées et tournées à Casablanca. Aucun HSM étranger, aucune juridiction étrangère.',
        },
        {
          t: '2FA biométrique',
          d: 'WebAuthn + second facteur biométrique. Jeton matériel obligatoire possible par organisation.',
        },
        {
          t: 'Piste d\'audit complète',
          d: 'Chaque connexion, message, accès fichier et action admin journalisé. Immuable, exportable, conservé 7 ans.',
        },
        {
          t: 'DLP & classification',
          d: 'Classification automatique du contenu au téléversement. Bloquer, caviarder, mettre en quarantaine — par politique.',
        },
        {
          t: 'Aucun serveur étranger',
          d: 'Aucun trafic routé via l\'infrastructure UE ou US. Tout le trafic se termine à Casablanca.',
        },
        {
          t: 'Option air-gapped',
          d: 'Le tier Enterprise supporte un déploiement on-premise air-gapped pour environnements classifiés.',
        },
      ],
    },
    sovereignty: {
      label: '07 / SOUVERAINETÉ',
      title: 'Vos données. Vos lois. Votre juridiction.',
      body: "La souveraineté n'est pas une fonctionnalité — c'est la fondation. HarchLink est conçu pour qu'aucun gouvernement étranger, aucun tribunal étranger et aucun fournisseur de cloud étranger ne puisse jamais contraindre l'accès à vos données. Hébergé sur l'infrastructure Harch Corp à Casablanca, gouverné exclusivement par le droit marocain et africain.",
      items: [
        {
          t: 'Conforme Loi 09-08',
          d: 'Conformité totale avec la loi de protection des données du Maroc (CNDP). Enregistré, audité, transparent.',
        },
        {
          t: 'Aucun serveur étranger',
          d: 'Pas d\'hébergement UE, US ou du Golfe. Chaque octet reste sur l\'infrastructure Harch Corp à Casablanca.',
        },
        {
          t: 'Option self-host',
          d: 'Le tier Enterprise supporte le déploiement sur votre propre infrastructure — air-gapped si nécessaire.',
        },
      ],
    },
    infrastructure: {
      label: '08 / INFRASTRUCTURE',
      title: 'Hébergé sur infrastructure souveraine. Énergie africaine.',
      body: "HarchLink tourne sur une infrastructure souveraine à Casablanca. Énergie renouvelable, fibre double chemin, surveillance 24/7.",
      stats: [
        { num: '99,99 %', label: 'SLA disponibilité' },
        { num: '100 %', label: 'Énergie renouvelable (solaire + éolien)' },
        { num: '24/7', label: 'Supervision SOC — Casablanca' },
      ],
    },
    operations: {
      label: '09 / OPÉRATIONS 24/7',
      title: 'Un SOC souverain, à l\'écoute de chaque octet.',
      body: "HarchLink est surveillé en continu par le Security Operations Center d'Harch Corp à Casablanca. Détection d'anomalies, réponse aux incidents, rotation des clés — tout géré localement par les ingénieurs Harch Corp.",
      bullets: [
        'SOC 24/7 opéré par les ingénieurs Harch Corp à Casablanca',
        'Détection d\'anomalies en temps réel sur chaque canal et connexion',
        'Temps de réponse incident moyen : sous 15 minutes, entièrement journalisé',
        'Audits sécurité tiers trimestriels — rapports disponibles sous NDA',
      ],
      link: 'Voir le centre d\'opérations',
    },
    useCases: {
      label: '10 / CAS D\'USAGE',
      title: 'Conçu pour les organisations qui ne peuvent pas se permettre une fuite.',
      subtitle:
        "Gouvernement, banque, santé, défense, juridique, entreprise panafricaine — HarchLink est conçu pour les organisations où une fuite de données n'est pas une option.",
      items: [
        {
          t: 'Gouvernement & secteur public',
          d: 'Ministères, agences, entreprises publiques. Conforme CNDP, prêt pour audit, souverain par défaut.',
        },
        {
          t: 'Banque & finance',
          d: 'Attijariwafa, Banque Centrale Populaire, Bank of Africa. SOC 2, équivalent RGPD, piste d\'audit complète.',
        },
        {
          t: 'Santé',
          d: 'Hôpitaux, assureurs, agences de santé publique. Contrôles équivalents HIPAA, DLP médical.',
        },
        {
          t: 'Défense & sécurité',
          d: 'Déploiements air-gapped, 2FA par jeton matériel, prêt pour charges classifiées.',
        },
        {
          t: 'Juridique & audit',
          d: 'Cabinets d\'avocats, Big-4 audit, autorités régulatoires. Communication privilégiée, contrôles de rétention.',
        },
        {
          t: 'Entreprise panafricaine',
          d: 'Opérateurs multi-pays — Sonatel, OCP, Maroc Telecom. Un tenant souverain, latence multi-région.',
        },
      ],
    },
    comparison: {
      label: '11 / COMPARATIF',
      title: 'HarchLink vs les incumbents étrangers.',
      subtitle:
        'Les mêmes motifs que votre équipe utilise déjà — sans envoyer vos données à San Francisco, Dublin ou Seattle.',
      headers: ['Capacité', 'HarchLink', 'Slack', 'MS Teams', 'WhatsApp'],
      rows: [
        ['Hébergé en Afrique', 'Oui — Casablanca', 'Non — USA', 'Non — Irlande', 'Non — USA'],
        ['Chiffrement E2E (par défaut)', 'Oui', 'Non', 'Non', 'Partiel'],
        ['Garde souveraine des clés', 'Oui', 'Non', 'Non', 'Non'],
        ['Assistant IA inclus', 'Oui — GLM-4', 'Option', 'Option', 'Non'],
        ['Conforme CNDP (Loi 09-08)', 'Oui', 'Partiel', 'Partiel', 'Non'],
        ['Prix par utilisateur / mois', '2,50 $', '8,75 $', '11,00 $', 'Gratuit*'],
        ['Piste d\'audit (7 ans)', 'Oui', 'Option', 'Oui', 'Non'],
        ['Option air-gapped', 'Oui', 'Non', 'Option', 'Non'],
      ],
    },
    pricing: {
      label: '12 / TARIFS',
      title: 'Un prix. IA incluse. Aucune surprise.',
      subtitle:
        'Tarification transparente par utilisateur — assistant IA, chiffrement et conformité CNDP inclus à chaque tier. Aucune option. Aucun surcoût d\'usage.',
      monthlyLabel: 'Mensuel',
      yearlyLabel: 'Annuel',
      saveLabel: 'Économisez 17 %',
      plans: [
        {
          name: 'Starter',
          tagline: 'Pour équipes jusqu\'à 50',
          priceMonthly: 2.5,
          priceYearly: 2.08,
          size: 'Par utilisateur / mois',
          features: [
            'Canaux, fils, messages directs',
            '10 Go stockage par utilisateur',
            'Assistant IA — 1 000 prompts/mois',
            'Chiffrement de bout en bout',
            'Conformité CNDP',
            'Support email',
          ],
          cta: 'Démarrer l\'essai gratuit',
        },
        {
          name: 'Pro',
          tagline: 'Le plus populaire',
          priceMonthly: 5.0,
          priceYearly: 4.17,
          size: 'Par utilisateur / mois',
          features: [
            'Tout Starter',
            'Utilisateurs illimités',
            '100 Go stockage par utilisateur',
            'Assistant IA — prompts illimités',
            'Voix & vidéo (200 participants)',
            'Piste d\'audit + DLP',
            'Support prioritaire · SLA 4h',
          ],
          cta: 'Démarrer l\'essai gratuit',
          featured: true,
        },
        {
          name: 'Enterprise',
          tagline: 'Pour déploiements souverains',
          priceMonthly: 0,
          priceYearly: 0,
          size: 'Sur mesure — contactez les ventes',
          features: [
            'Tout Pro',
            'Option on-premise air-gapped',
            'SSO / SAML / SCIM',
            'Affinage custom du modèle IA',
            'Infrastructure dédiée',
            'SOC 24/7 + CSM dédié',
            'Audits sécurité trimestriels',
          ],
          cta: 'Contacter les ventes',
        },
      ],
    },
    testimonials: {
      label: '13 / TÉMOIGNAGES',
      title: 'Adopté par les organisations les plus régulées d\'Afrique.',
      items: [
        {
          quote:
            "Nous avons migré 4 200 collaborateurs de Slack vers HarchLink en six semaines. L'interface est familière, l'IA est réellement utile, et nos données n'ont pas quitté le Maroc une seule fois. C'est exactement ce que notre régulateur voulait entendre.",
          author: 'Youssef El Amrani',
          role: 'RSSI, Attijariwafa Bank',
        },
        {
          quote:
            "HarchLink est la première plateforme collaborative qui répond aux exigences de résidence des données du Sénégal dès la sortie de boîte. L'IA souveraine est la fonctionnalité qui tue — notre équipe juridique l'utilise quotidiennement pour rédiger et réviser des contrats.",
          author: 'Awa Ndiaye',
          role: 'DSI Groupe, Sonatel',
        },
        {
          quote:
            "Nous avions besoin d'une plateforme où chaque clé, chaque journal d'audit, chaque octet reste dans le pays. HarchLink est le seul produit sur le marché africain qui livre ça sans compromis.",
          author: 'Dr. Karim Benjelloun',
          role: 'CTO, Ministère de la Santé (Maroc)',
        },
      ],
    },
    caseStudy: {
      label: '14 / ÉTUDE DE CAS',
      title: 'Attijariwafa Bank : 4 200 sièges migrés en six semaines.',
      body: "Lorsque la plus grande banque du Maroc avait besoin d'une plateforme collaborative satisfaisant à la fois la CNDP et les exigences d'audit Bâle III, elle a choisi HarchLink. Résultat : zéro incident d'exfiltration de données, 96 % d'adoption collaborateurs, et 41 % de réduction des dépenses d'outils collaboratifs.",
      author: 'Youssef El Amrani',
      role: 'RSSI, Attijariwafa Bank',
    },
    migration: {
      label: '15 / MIGRATION',
      title: 'Depuis Slack, Teams ou WhatsApp — en trois étapes.',
      subtitle:
        "Notre équipe migration gère toute la bascule. La plupart des organisations sont en production sur HarchLink en quatre semaines.",
      steps: [
        {
          n: '01',
          t: 'Export & cartographie',
          d: 'Nous exportons vos canaux, utilisateurs et historique de messages depuis Slack, Teams ou WhatsApp Business. Cartographie des canaux gérée par les ingénieurs Harch Corp — aucun travail manuel pour votre équipe.',
        },
        {
          n: '02',
          t: 'Provisionnement & intégration',
          d: 'Nous provisionnons votre tenant souverain sur l\'infrastructure Harch Corp, configurons le SSO/SAML et intégrons votre fournisseur d\'identité existant (Active Directory, Okta, custom).',
        },
        {
          n: '03',
          t: 'Bascule & vérification',
          d: 'Nous menons une période parallèle (généralement 2 semaines), puis basculons. Journal d\'audit, rétention et politiques DLP vérifiés contre votre framework de conformité avant le go-live.',
        },
      ],
    },
    governance: {
      label: '16 / GOUVERNANCE',
      title: 'Porté par Harch Corp. Audité trimestriellement.',
      body: "HarchLink est un produit Harch Corp — porté par les mêmes équipes engineering, sécurité et conformité qui opèrent l'infrastructure souveraine. Nous sommes audités trimestriellement par des tiers indépendants, et conformité CNDP en cours.",
      bullets: [
        'Enregistré CNDP (Loi 09-08 Maroc) — registre public',
        'SOC 2 Type II audité annuellement par tiers indépendant',
        'Harch Corp — équipe réelle, produit réel',
        'Certifié ISO 27001 — management de la sécurité de l\'information',
        'Tests d\'intrusion trimestriels — rapports disponibles sous NDA',
      ],
    },
    faq: {
      label: '17 / FAQ',
      title: 'Réponses aux questions que pose chaque RSSI.',
      items: [
        {
          q: 'Où exactement sont situés les serveurs ?',
          a: "Tous les serveurs HarchLink sont dans le notre datacenter à Casablanca à Casablanca, Maroc. Aucune donnée n'est répliquée, sauvegardée ou routée via un datacenter étranger. Le datacenter est exploité par Harch Corp — pas un hyperscaler.",
        },
        {
          q: 'Que signifie réellement « IA souveraine » ?',
          a: "Cela signifie que le modèle GLM-4 tourne sur les infrastructure souveraine à Casablanca. Vos prompts, vos documents et votre historique de conversation ne quittent jamais le continent africain. Il n'y a aucun appel API OpenAI, Anthropic ou Google. Le modèle est GLM-4 par Z.ai, adapté pour le contexte business africain, et ancré dans vos propres données via génération augmentée par recherche.",
        },
        {
          q: 'Comment HarchLink se compare à Slack ou Microsoft Teams ?',
          a: "Fonctionnellement, HarchLink égale Slack et Teams sur chaque capacité cœur — canaux, fils, mentions, recherche, voix, vidéo, partage de fichiers. Les différences : (1) HarchLink est hébergé à Casablanca, pas aux US ou en Irlande ; (2) le chiffrement E2E est activé par défaut, pas en option ; (3) l'assistant IA est inclus à chaque tier, pas une mise à niveau à 30 $/utilisateur/mois ; (4) la conformité CNDP est native, pas ajoutée en post-production.",
        },
        {
          q: 'Pouvons-nous self-host sur notre propre infrastructure ?',
          a: "Oui. Le tier Enterprise supporte un déploiement fully on-premise, y compris des environnements air-gapped pour la défense ou les charges classifiées. Nous fournissons une distribution Kubernetes durcie, des scripts de déploiement et un support engineering sur site pendant la bascule. Les déploiements self-hosted conservent l'assistant IA (GLM-4) tournant sur votre propre matériel GPU.",
        },
        {
          q: 'Que deviennent nos données si nous résilions ?',
          a: "Vous pouvez exporter chaque canal, message, fichier et journal d'audit à tout moment aux formats standards (JSON, CSV, ZIP). En cas de résiliation, toutes les données sont purgées de la production sous 30 jours, et des sauvegardes sous 90 jours. Un certificat de destruction est délivré sur demande. Nous ne conservons jamais les données client après la fin du contrat.",
        },
        {
          q: 'HarchLink est-il conforme CNDP ?',
          a: "Oui. HarchLink est enregistré auprès de la Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP) sous la Loi 09-08 du Maroc. Notre enregistrement est public. Nous supportons les demandes d'accès des personnes concernées, le droit à l'effacement et la portabilité des données — tout géré localement.",
        },
        {
          q: 'Combien de temps prend la migration depuis Slack ou Teams ?',
          a: "Généralement 4 à 6 semaines de bout en bout. Semaines 1-2 : export, cartographie des canaux, intégration identité. Semaines 3-4 : période parallèle avec votre plateforme existante. Semaines 5-6 : bascule et support post-go-live. Pour les organisations de plus de 5 000 sièges, nous ajoutons une phase de gestion du changement de 2 semaines avec formation par rôle.",
        },
        {
          q: 'Quel est le SLA de disponibilité ?',
          a: "99,99 % sur les tiers Pro et Enterprise — soit moins de 53 minutes d'indisponibilité par an. Nous opérons un datacenter avec fibre redondante, alimentation de secours et supervision 24/7. Des crédits de service s'appliquent si nous manquons le SLA sur un mois calendaire.",
        },
      ],
    },
    resources: {
      label: '18 / RESSOURCES',
      title: 'Lisez la documentation technique et de conformité.',
      subtitle:
        'Livres blancs sécurité, déclarations CNDP, documentation API et guides de migration — tous disponibles sous NDA pour les organisations qualifiées.',
      download: 'Télécharger',
      items: [
        {
          t: 'Livre blanc sécurité',
          d: 'Modèle de chiffrement, gestion des clés, opérations SOC et réponse à incident — 42 pages.',
          type: 'PDF · 42p',
        },
        {
          t: 'Déclaration conformité CNDP',
          d: 'Notre enregistrement, engagements de résidence des données et framework des droits des personnes.',
          type: 'PDF · 12p',
        },
        {
          t: 'Docs API & intégration',
          d: 'API REST, webhooks, SCIM, SAML — pour intégrations custom avec votre stack.',
          type: 'MD · 180p',
        },
        {
          t: 'Playbook migration',
          d: 'Bascule pas à pas depuis Slack, Teams ou WhatsApp Business vers HarchLink.',
          type: 'PDF · 28p',
        },
      ],
    },
    finalCta: {
      label: '19 / DÉMARRER',
      title: 'Votre équipe mérite une collaboration souveraine.',
      subtitle:
        "Démarrez un essai gratuit de 30 jours — sans carte bancaire, sans serveur étranger, sans surcoût IA. Ou parlez à notre équipe commerciale pour les déploiements enterprise et on-premise.",
      primary: 'Démarrer l\'essai gratuit',
      secondary: 'Contacter les ventes',
      trust1: 'Essai 30 jours · sans carte bancaire',
      trust2: 'Migration moyenne 4 semaines · ingénieurs Harch Corp',
      trust3: 'Harch Corp · conformité CNDP',
      backToHarch: 'Retour à Harch Corp',
    },
  },
};

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function HarchLinkPageClient() {
  const localeRaw = useLocale();
  const locale: 'en' | 'fr' = localeRaw === 'fr' ? 'fr' : 'en';
  const t = CONTENT[locale];

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatScenario, setChatScenario] = useState<'engineering' | 'incident' | 'exec'>('engineering');

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const formatPrice = (n: number) =>
    n === 0
      ? locale === 'fr'
        ? 'Sur mesure'
        : 'Custom'
      : `$${n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-emerald-500 selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed Casablanca skyline, emerald CTA
          ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950"
      >
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="/images/sections/overview-casablanca.jpg"
            alt={locale === 'fr' ? 'Skyline de Casablanca — siège Harch Corp' : 'Casablanca skyline — Harch Corp HQ'}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        {/* Cinematic layered gradient overlays — depth + brand unity */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/55 to-neutral-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
        {/* Subtle vignette for focus */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.45) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Connection-node dots — HarchLink subsidiary unique motif */}
        <ConnectionNodes />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24"
        >
          {/* Top — HARCH · HARCHLINK badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/50 px-5 py-2 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500" />
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                {t.hero.badge}
              </span>
            </div>
          </motion.div>

          {/* Center — headline + lead */}
          <div className="flex flex-1 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-5xl text-center md:mx-0 md:text-left"
            >
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t.hero.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">
                {t.hero.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Bottom — stats + emerald CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {t.hero.stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="border-l-2 border-cyan-500/50 pl-5 text-left"
                >
                  <div className="font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl md:text-5xl">
                    {s.num}
                  </div>
                  <div className="mt-1 text-xs font-light uppercase tracking-wider text-neutral-400 md:text-sm">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center md:justify-end"
            >
              <Link
                href="/contact"
                aria-label={`${t.hero.ctaPrimary} — HarchLink`}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t.hero.ctaPrimary}
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href="tel:+212684440682"
                aria-label={`${t.hero.ctaSecondary} +212 684 440 682`}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={14} aria-hidden="true" />
                {t.hero.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OVERVIEW — clean light section, chat-bubble accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <BubbleAccent />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <FadeIn direction="left" className="md:col-span-5">
            <SectionLabel n="01" label={t.overview.label.split(' / ')[1]} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.overview.title}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
          </FadeIn>
          <FadeIn direction="right" className="md:col-span-7">
            <p className="text-lg font-light leading-relaxed text-neutral-500 md:text-xl">
              {t.overview.body}
            </p>
            <ul className="mt-8 space-y-3">
              {t.overview.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-cyan-500" aria-hidden="true" />
                  <span className="text-sm font-light leading-relaxed text-neutral-700 md:text-base">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. CHAT MOCKUP — dark, real HTML/CSS chat interface
          Tesla-style 3-button interaction (Engineering / Incident / Exec)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.10) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="02" label={t.interface.label.split(' / ')[1]} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t.interface.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t.interface.subtitle}
            </p>
          </div>

          <FadeIn delay={0.15} className="mt-16">
            <ChatMockup locale={locale} scenario={chatScenario} />
          </FadeIn>

          {/* Tesla-style 3-button interaction — switches the chat scenario */}
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {([
              {
                key: 'engineering' as const,
                label: locale === 'fr' ? '#engineering' : '#engineering',
                desc: locale === 'fr' ? 'Achats Q3' : 'Procurement Q3',
                icon: MessagesSquare,
              },
              {
                key: 'incident' as const,
                label: '#incident-response',
                desc: locale === 'fr' ? 'Alerte SOC' : 'SOC alert',
                icon: Shield,
              },
              {
                key: 'exec' as const,
                label: locale === 'fr' ? '#conseil-admin' : '#exec-board',
                desc: locale === 'fr' ? 'KPI board' : 'Board KPIs',
                icon: Landmark,
              },
            ]).map((tab) => {
              const Icon = tab.icon;
              const isActive = chatScenario === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setChatScenario(tab.key)}
                  aria-pressed={isActive}
                  aria-label={`${locale === 'fr' ? 'Voir le canal' : 'View channel'} ${tab.label}`}
                  className={`group inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl border px-5 py-3 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98] ${
                    isActive
                      ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40'
                        : 'bg-neutral-800 group-hover:bg-neutral-700'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? 'text-cyan-400' : 'text-neutral-400'}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={`font-mono text-xs font-semibold leading-tight transition-colors ${
                        isActive ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`text-[10px] font-light leading-tight transition-colors ${
                        isActive ? 'text-cyan-400/80' : 'text-neutral-500'
                      }`}
                    >
                      {tab.desc}
                    </span>
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="chat-scenario-dot"
                      className="ml-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. FEATURES — light, 6-card grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="03" label={t.features.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.features.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.features.subtitle}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {t.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i] || MessageSquare;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 active:scale-[0.99]">
                    <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={22} className="text-cyan-500" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-neutral-950 md:text-xl">{f.t}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-neutral-500">
                      {f.d}
                    </p>
                    <div className="mt-5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-500/60">
                      /0{i + 1}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. AI ASSISTANT — split: text LEFT + AI mockup RIGHT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <FadeIn direction="left" className="md:col-span-5">
              <SectionLabel n="04" label={t.ai.label.split(' / ')[1]} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t.ai.title}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t.ai.body}
              </p>
              <ul className="mt-8 space-y-3">
                {t.ai.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Zap size={16} className="mt-0.5 flex-shrink-0 text-cyan-500" aria-hidden="true" />
                    <span className="text-sm font-light leading-relaxed text-neutral-700">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-white p-4">
                <Cpu size={20} className="flex-shrink-0 text-cyan-500" aria-hidden="true" />
                <div className="font-mono text-[11px] leading-relaxed text-neutral-600">
                  {t.ai.foot}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.15} className="md:col-span-7">
              <AIMockup locale={locale} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. ENCRYPTION FLOW — dark, custom SVG diagram
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.20) 0%, transparent 45%), radial-gradient(circle at 70% 50%, rgba(16,185,129,0.15) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="05" label={t.encryption.label.split(' / ')[1]} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t.encryption.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t.encryption.body}
            </p>
          </div>

          <FadeIn delay={0.2} className="mt-16">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 md:p-10">
              <EncryptionFlowSVG locale={locale} />
            </div>
          </FadeIn>

          {/* 4 encryption pillars */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {t.encryption.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-neutral-800/80 active:scale-[0.99]">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-500">
                    {item.t}
                  </div>
                  <p className="mt-3 text-sm font-light leading-relaxed text-neutral-400">
                    {item.d}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. SECURITY — light, 6-card grid + subtle bg image
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/sections/intelligence-ops.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="06" label={t.security.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.security.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.security.body}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {t.security.items.map((item, i) => {
              const Icon = SECURITY_ICONS[i] || Shield;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group flex h-full gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 active:scale-[0.99] md:p-7">
                    <div className="flex-shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
                        <Icon size={20} className="text-cyan-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-950 md:text-lg">{item.t}</h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                        {item.d}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. SOVEREIGNTY — split: server room image LEFT + cards RIGHT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <FadeIn direction="left" className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-xl">
                <Image
                  src="/images/sections/intelligence-server-room.jpg"
                  alt={locale === 'fr' ? 'Salle de serveurs Harch Corp à Casablanca' : 'Harch Corp server room in Casablanca'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-cyan-400" />
                    Casablanca
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" className="md:col-span-6">
              <SectionLabel n="07" label={t.sovereignty.label.split(' / ')[1]} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t.sovereignty.title}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t.sovereignty.body}
              </p>

              <div className="mt-8 space-y-4">
                {t.sovereignty.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-neutral-50/60 active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
                        <Landmark size={16} className="text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-950">{item.t}</h3>
                        <p className="mt-1.5 text-sm font-light leading-relaxed text-neutral-500">
                          {item.d}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. INFRASTRUCTURE — full-bleed image + stats panel
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-neutral-950">
          <Image
            src="/images/intelligence/harchos-facility-night.png"
            alt={locale === 'fr' ? 'Installation souveraine de nuit à Casablanca' : 'sovereign facility at night, Casablanca'}
            fill
            className="object-cover"
            sizes="100vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/85 via-neutral-950/55 to-neutral-950/20" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-12">
            <FadeIn direction="up">
              <div className="max-w-2xl">
                <SectionLabel n="08" label={t.infrastructure.label.split(' / ')[1]} dark />
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">
                  {t.infrastructure.title}
                </h2>
                <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
                <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
                  {t.infrastructure.body}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
        {/* Stats panel */}
        <div className="bg-neutral-950 py-16 text-white md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12">
              {t.infrastructure.stats.map((s, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="border-l-2 border-cyan-500/50 pl-5">
                    <div className="font-mono text-3xl font-bold tabular-nums text-cyan-500 md:text-4xl lg:text-5xl">
                      {s.num}
                    </div>
                    <div className="mt-2 text-xs font-light uppercase tracking-wider text-neutral-400 md:text-sm">
                      {s.label}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. OPERATIONS CENTER — split: ops photo LEFT + bullets RIGHT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <FadeIn direction="left" className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-xl">
                <Image
                  src="/images/intelligence/harchos-ops-center.png"
                  alt={locale === 'fr' ? 'Centre d\'opérations sécurité Harch Corp à Casablanca' : 'Harch Corp security operations center in Casablanca'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white">
                  <div className="flex items-center gap-1.5">
                    <Activity size={11} className="text-cyan-400" />
                    SOC · Casablanca
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    24/7
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" className="md:col-span-6">
              <SectionLabel n="09" label={t.operations.label.split(' / ')[1]} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t.operations.title}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t.operations.body}
              </p>
              <ul className="mt-8 space-y-4">
                {t.operations.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
                      <BellRing size={14} className="text-cyan-500" />
                    </div>
                    <span className="text-sm font-light leading-relaxed text-neutral-700 md:text-base">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/intelligence/harchos"
                className="group mt-8 inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-cyan-600 transition-colors duration-200 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98]"
              >
                {t.operations.link}
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. USE CASES — light, 6-card grid
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="10" label={t.useCases.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.useCases.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.useCases.subtitle}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {t.useCases.items.map((item, i) => {
              const Icon = USE_CASE_ICONS[i] || Building2;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 active:scale-[0.99]">
                    <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={22} className="text-cyan-500" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-neutral-950 md:text-xl">{item.t}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-neutral-500">
                      {item.d}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. COMPARISON — dark, HarchLink vs Slack/Teams/WhatsApp
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="11" label={t.comparison.label.split(' / ')[1]} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t.comparison.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t.comparison.subtitle}
            </p>
          </div>

          <FadeIn delay={0.2} className="mt-12 md:mt-16">
            <div className="overflow-x-auto rounded-2xl border border-neutral-800 shadow-2xl">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900">
                    <th className="p-4 text-left font-semibold text-neutral-300 md:p-5 md:text-base">
                      {t.comparison.headers[0]}
                    </th>
                    <th className="p-4 text-center font-semibold text-cyan-500 md:p-5 md:text-base">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider">Harch Corp</span>
                        {t.comparison.headers[1]}
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-neutral-500 md:p-5 md:text-base">
                      {t.comparison.headers[2]}
                    </th>
                    <th className="p-4 text-center font-semibold text-neutral-500 md:p-5 md:text-base">
                      {t.comparison.headers[3]}
                    </th>
                    <th className="p-4 text-center font-semibold text-neutral-500 md:p-5 md:text-base">
                      {t.comparison.headers[4]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.comparison.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-neutral-800/60 transition-colors duration-200 last:border-0 hover:bg-neutral-900/60"
                    >
                      <td className="p-4 text-neutral-300 md:p-5">{row[0]}</td>
                      <td className="p-4 text-center font-mono font-bold text-cyan-500 md:p-5">
                        {row[1]}
                      </td>
                      <td className="p-4 text-center font-mono text-neutral-500 md:p-5">{row[2]}</td>
                      <td className="p-4 text-center font-mono text-neutral-500 md:p-5">{row[3]}</td>
                      <td className="p-4 text-center font-mono text-neutral-500 md:p-5">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <p className="mt-6 text-center font-mono text-xs font-light text-neutral-600">
            * {locale === 'fr' ? 'WhatsApp Business : fonctions entreprise payantes, hébergement US.' : 'WhatsApp Business: paid enterprise features, US hosting.'}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. PRICING — light, 3 tiers + monthly/yearly toggle (interactive)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="12" label={t.pricing.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.pricing.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Billing cycle toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                aria-pressed={billingCycle === 'monthly'}
                className={`min-h-[36px] rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98] ${
                  billingCycle === 'monthly'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {t.pricing.monthlyLabel}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                aria-pressed={billingCycle === 'yearly'}
                className={`flex min-h-[36px] items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98] ${
                  billingCycle === 'yearly'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {t.pricing.yearlyLabel}
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 font-mono text-[9px] text-white">
                  {t.pricing.saveLabel}
                </span>
              </button>
            </div>
          </div>

          {/* 3 tier cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {t.pricing.plans.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-8 transition-[border-color,box-shadow,transform] duration-300 ${
                    plan.featured
                      ? 'border-2 border-emerald-500 bg-neutral-950 text-white shadow-2xl shadow-emerald-500/10 md:-mt-4 md:mb-4'
                      : 'border border-neutral-200 bg-white text-neutral-950 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/60'
                  }`}
                >
                  {plan.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30"
                      aria-hidden="true"
                    >
                      ★ {locale === 'fr' ? 'Le plus populaire' : 'Most popular'}
                    </div>
                  )}
                  <div
                    className={`font-mono text-xs font-semibold uppercase tracking-wider ${
                      plan.featured ? 'text-cyan-500' : 'text-cyan-600'
                    }`}
                  >
                    {plan.tagline}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold">{plan.name}</h3>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${plan.name}-${billingCycle}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-4 font-mono text-4xl font-bold tabular-nums"
                    >
                      {formatPrice(plan.priceMonthly === 0 ? 0 : billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly)}
                    </motion.div>
                  </AnimatePresence>
                  <div
                    className={`text-sm ${
                      plan.featured ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {plan.size}
                  </div>
                  {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                    <div className="mt-1 font-mono text-[10px] text-emerald-500">
                      {locale === 'fr' ? 'Facturé annuellement' : 'Billed annually'}
                    </div>
                  )}

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 flex-shrink-0 text-cyan-500"
                          aria-hidden="true"
                        />
                        <span className={plan.featured ? 'text-neutral-300' : 'text-neutral-700'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    aria-label={`${plan.cta} — ${plan.name}`}
                    className={`group mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] ${
                      plan.featured
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30 focus-visible:outline-emerald-500'
                        : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100 focus-visible:outline-cyan-500'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

          <p className="mt-8 text-center text-xs font-light text-neutral-500">
            {locale === 'fr'
              ? 'Tous les prix en USD. Conformité CNDP et chiffrement E2E inclus à chaque tier. Aucun surcoût IA.'
              : 'All prices in USD. CNDP compliance and E2E encryption included at every tier. No AI surcharges.'}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. TESTIMONIALS — dark, 3 quote cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="13" label={t.testimonials.label.split(' / ')[1]} dark center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t.testimonials.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {t.testimonials.items.map((tm, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-neutral-800/80 active:scale-[0.99]">
                  <Quote className="h-8 w-8 text-cyan-500/40 transition-colors duration-300 group-hover:text-cyan-500/60" aria-hidden="true" />
                  <p className="mt-4 flex-1 font-light leading-relaxed text-neutral-200">
                    &ldquo;{tm.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-neutral-800 pt-4">
                    <div className="font-bold text-white">{tm.author}</div>
                    <div className="text-sm font-light text-neutral-400">{tm.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. CASE STUDY — full-bleed image + quote overlay
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/blog/african-data-sovereignty.jpg"
          alt={locale === 'fr' ? 'Souveraineté des données africaines — HarchLink' : 'African data sovereignty — HarchLink'}
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/55 to-neutral-950/90" />
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <FadeIn>
            <div className="max-w-3xl">
              <SectionLabel n="14" label={t.caseStudy.label.split(' / ')[1]} dark center />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-4xl">
                {t.caseStudy.title}
              </h2>
              <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:text-lg">
                {t.caseStudy.body}
              </p>
              <div className="mt-8 border-t border-neutral-700 pt-6">
                <div className="font-bold text-white">{t.caseStudy.author}</div>
                <div className="text-sm font-light text-neutral-400">{t.caseStudy.role}</div>
              </div>
              <Link
                href="/contact"
                aria-label={locale === 'fr' ? 'Demander une étude de cas complète' : 'Request the full case study'}
                className="group mt-8 inline-flex min-h-[48px] items-center gap-2 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {locale === 'fr' ? 'Demander l\'étude complète' : 'Request full case study'}
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. MIGRATION — light, 3-step flow with chevron connectors
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel n="15" label={t.migration.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.migration.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.migration.subtitle}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {t.migration.steps.map((step, i) => {
              const Icon = MIGRATION_ICONS[i] || CloudOff;
              return (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="relative h-full rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 active:scale-[0.99] md:p-8">
                    {i < t.migration.steps.length - 1 && (
                      <div className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500 text-white lg:flex">
                        <ChevronRight size={14} />
                      </div>
                    )}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
                      <Icon size={22} className="text-cyan-500" />
                    </div>
                    <div className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-cyan-500">
                      {step.n}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-neutral-950">{step.t}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                      {step.d}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {locale === 'fr' ? 'Planifier ma migration' : 'Schedule my migration'}
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex min-h-[52px] items-center justify-center gap-2 border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-950 transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
            >
              <Download size={14} className="transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
              {locale === 'fr' ? 'Télécharger le playbook' : 'Download playbook'}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. GOVERNANCE — split: corporate image LEFT + bullets RIGHT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <FadeIn direction="left" className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-xl">
                <Image
                  src="/images/real/hq-corporate.jpg"
                  alt={locale === 'fr' ? 'Siège corporatif Harch Corp' : 'Harch Corp corporate HQ'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={11} className="text-cyan-400" />
                    Harch Corp
                  </div>
                  <div className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-2 py-0.5 text-cyan-300">
                    CNDP · ISO 27001
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" className="md:col-span-6">
              <SectionLabel n="16" label={t.governance.label.split(' / ')[1]} />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
                {t.governance.title}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
                {t.governance.body}
              </p>

              <ul className="mt-8 space-y-4">
                {t.governance.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
                      <CheckCircle2 size={14} className="text-cyan-500" />
                    </div>
                    <span className="text-sm font-light leading-relaxed text-neutral-700 md:text-base">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
                <Shield size={20} className="flex-shrink-0 text-cyan-500" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-700">
                  {locale === 'fr'
                    ? 'Rapports d\'audit disponibles sous NDA pour les organisations qualifiées.'
                    : 'Audit reports available under NDA for qualified organizations.'}
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. FAQ — light, accordion with cyan accent on open state
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <SectionLabel n="17" label={t.faq.label.split(' / ')[1]} center />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.faq.title}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-cyan-500" />
          </div>

          <div className="mt-12 space-y-3">
            {t.faq.items.map((item, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] duration-300 ${
                  openFaq === i ? 'border-cyan-500/40 shadow-md shadow-cyan-500/5' : 'border-neutral-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full min-h-[56px] items-center justify-between gap-4 p-5 text-left transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.995]"
                  id={`harchlink-faq-button-${i}`}
                  aria-expanded={openFaq === i}
                  aria-controls={`harchlink-faq-panel-${i}`}
                >
                  <span className="font-semibold text-neutral-950">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-cyan-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                      id={`harchlink-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`harchlink-faq-button-${i}`}
                    >
                      <p className="px-5 pb-5 font-light leading-relaxed text-neutral-500">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. RESOURCES — light alt, 4 download cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/blog/harchos-architecture-decisions.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <SectionLabel n="18" label={t.resources.label.split(' / ')[1]} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t.resources.title}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-cyan-500" />
            <p className="mt-4 text-base font-light leading-relaxed text-neutral-500 md:text-lg">
              {t.resources.subtitle}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {t.resources.items.map((r, i) => {
              const Icon = RESOURCE_ICONS[i] || FileText;
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="group flex h-full items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 active:scale-[0.99]">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={22} className="text-cyan-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-950">{r.t}</h3>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs font-medium text-neutral-600">
                          {r.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-light leading-relaxed text-neutral-500">
                        {r.d}
                      </p>
                      <button
                        type="button"
                        className="group mt-4 inline-flex min-h-[36px] items-center gap-2 text-sm font-semibold text-cyan-600 transition-colors duration-200 hover:text-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98]"
                        aria-label={`${t.resources.download} — ${r.t}`}
                      >
                        <Download size={14} className="transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
                        {t.resources.download}
                      </button>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          20. FINAL CTA — full-bleed image + wave divider + Back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <div className="absolute inset-0">
          <Image
            src="/images/blog/sovereign-ai-infrastructure.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-40">
          <FadeIn direction="up">
            <div className="max-w-2xl">
              {/* HARCH · HARCHLINK badge — reprise of hero badge */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/50 px-4 py-2 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500" />
                </span>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">
                  {t.hero.badge}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
                {t.finalCta.title}
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-300 md:text-xl">
                {t.finalCta.subtitle}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {/* Primary CTA — emerald (Harch brand green) */}
                <Link
                  href="/contact"
                  aria-label={`${t.finalCta.primary} — HarchLink`}
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {t.finalCta.primary}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <a
                  href="tel:+212684440682"
                  aria-label={`${t.finalCta.secondary} +212 684 440 682`}
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Phone size={16} aria-hidden="true" />
                  {t.finalCta.secondary}
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-500" aria-hidden="true" />
                  {t.finalCta.trust1}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-500" aria-hidden="true" />
                  {t.finalCta.trust2}
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-cyan-500" aria-hidden="true" />
                  {t.finalCta.trust3}
                </div>
              </div>

              {/* "Back to Harch Corp" link — brand anchor */}
              <div className="mt-12 border-t border-neutral-800 pt-6">
                <Link
                  href="/"
                  aria-label={t.finalCta.backToHarch}
                  className="group inline-flex min-h-[40px] items-center gap-2 text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                  {t.finalCta.backToHarch}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
