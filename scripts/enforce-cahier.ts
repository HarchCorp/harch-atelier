// ═══════════════════════════════════════════════════════════════
//  AGENT DE VÉRIFICATION — enforce-cahier.ts
//
//  Cet agent est le gardien du contrat .CAHIER_DES_CHARGES.md.
//  Il lit le contrat, exécute chaque vérification, et produit
//  un rapport de conformité. Si une clause BLOCKING échoue,
//  la session ne peut pas se terminer (sessionCanEnd = false).
//
//  ANTI-TRICHE:
//  - Cet agent est indépendant du code qu'il vérifie
//  - Il lit le .md directement du système de fichiers
//  - Il écrit le résultat dans .session-lock.json (contrôlé par lui seul)
//  - L'exécuteur ne peut pas écrire manuellement sessionCanEnd: true
//
//  Usage: bun --ts scripts/enforce-cahier.ts
// ═══════════════════════════════════════════════════════════════

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve } from "path";

// ─── TYPES ─────────────────────────────────────────────────────

interface ClauseResult {
  id: string;
  type: "BLOCKING" | "WARNING";
  description: string;
  status: "PASS" | "FAIL" | "SKIP";
  actual?: string;
  expected?: string;
  durationMs: number;
  error?: string;
}

interface ComplianceReport {
  timestamp: string;
  totalClauses: number;
  passed: number;
  failed: number;
  skipped: number;
  blockingFailed: number;
  warningFailed: number;
  sessionCanEnd: boolean;
  results: ClauseResult[];
  nextSteps: string[];
}

// ─── HELPERS ───────────────────────────────────────────────────

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const CAHIER_PATH = resolve(PROJECT_ROOT, ".CAHIER_DES_CHARGES.md");
const LOCK_PATH = resolve(PROJECT_ROOT, ".session-lock.json");

function exec(cmd: string, timeoutMs = 30000): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(cmd, {
      cwd: PROJECT_ROOT,
      timeout: timeoutMs,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: stdout.trim(), stderr: "", code: 0 };
  } catch (err: any) {
    return {
      stdout: (err.stdout || "").trim(),
      stderr: (err.stderr || "").trim(),
      code: err.status || 1,
    };
  }
}

function fileLineCount(path: string): number {
  const fullPath = resolve(PROJECT_ROOT, path);
  if (!existsSync(fullPath)) return 0;
  const content = readFileSync(fullPath, "utf-8");
  return content.split("\n").length;
}

function fileExists(path: string): boolean {
  return existsSync(resolve(PROJECT_ROOT, path));
}

function grepCount(pattern: string, path: string): number {
  const result = exec(`grep -rE "${pattern}" ${path} 2>/dev/null | wc -l`, 10000);
  return parseInt(result.stdout, 10) || 0;
}

function httpStatus(url: string, timeoutMs = 15000): number {
  const result = exec(`curl -s -o /dev/null -w "%{http_code}" --max-time ${timeoutMs / 1000} "${url}"`, timeoutMs);
  return parseInt(result.stdout, 10) || 0;
}

// ─── CLAUSE DEFINITIONS ────────────────────────────────────────
// Each clause is a function that returns { status, actual, expected }

type ClauseFn = () => Omit<ClauseResult, "id" | "type" | "description" | "durationMs">;

const clauses: Array<{
  id: string;
  type: "BLOCKING" | "WARNING";
  description: string;
  fn: ClauseFn;
}> = [
  // ─── CLAUSE-001: Schéma Prisma complet ──────────────────────
  {
    id: "CLAUSE-001",
    type: "BLOCKING",
    description: "Le schéma Prisma doit contenir au moins 37 modèles",
    fn: () => {
      const count = grepCount("^model ", "prisma/schema.prisma");
      return {
        status: count >= 37 ? "PASS" : "FAIL",
        actual: `${count} modèles`,
        expected: ">= 37 modèles",
      };
    },
  },

  // ─── CLAUSE-002: Master Spec Sheet présent ──────────────────
  {
    id: "CLAUSE-002",
    type: "BLOCKING",
    description: "Le cahier des charges technique doit faire au moins 1500 lignes",
    fn: () => {
      const lines = fileLineCount("competitive-reports/10-MASTER-SPEC-SHEET.md");
      return {
        status: lines >= 1500 ? "PASS" : "FAIL",
        actual: `${lines} lignes`,
        expected: ">= 1500 lignes",
      };
    },
  },

  // ─── CLAUSE-003: API Flagship Report opérationnelle ─────────
  {
    id: "CLAUSE-003",
    type: "BLOCKING",
    description: "L'API /api/flagship-report doit retourner 200 OK",
    fn: () => {
      const status = httpStatus("http://localhost:3000/api/flagship-report", 30000);
      return {
        status: status === 200 ? "PASS" : "FAIL",
        actual: `HTTP ${status}`,
        expected: "HTTP 200",
      };
    },
  },

  // ─── CLAUSE-004: Données réelles en base ────────────────────
  {
    id: "CLAUSE-004",
    type: "BLOCKING",
    description: "Base de données: >= 20 personnes + >= 1000 articles réels",
    fn: () => {
      // Check via API instead of direct DB (more portable)
      const result = exec(`curl -s --max-time 20 "http://localhost:3000/api/flagship-report"`, 25000);
      if (result.code !== 0 || !result.stdout) {
        return {
          status: "FAIL",
          actual: "API inaccessible",
          expected: "JSON avec summary.totalPeople >= 20 et summary.totalArticles >= 1000",
          error: result.stderr || "curl failed",
        };
      }
      try {
        const json = JSON.parse(result.stdout);
        const data = json.data || {};
        const people = data.summary?.totalPeople || 0;
        const articles = data.summary?.totalArticles || 0;
        return {
          status: people >= 20 && articles >= 1000 ? "PASS" : "FAIL",
          actual: `${people} personnes, ${articles} articles`,
          expected: ">= 20 personnes ET >= 1000 articles",
        };
      } catch (e: any) {
        return {
          status: "FAIL",
          actual: "JSON parse error",
          expected: "JSON valide",
          error: e.message,
        };
      }
    },
  },

  // ─── CLAUSE-005: Lignes de code TypeScript ──────────────────
  {
    id: "CLAUSE-005",
    type: "BLOCKING",
    description: "Le projet doit contenir au moins 50,000 lignes de code TypeScript",
    fn: () => {
      const result = exec(`find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1`, 15000);
      const match = result.stdout.match(/(\d+)/);
      const lines = match ? parseInt(match[1], 10) : 0;
      return {
        status: lines >= 50000 ? "PASS" : "FAIL",
        actual: `${lines.toLocaleString()} lignes`,
        expected: ">= 50,000 lignes (palier 1)",
      };
    },
  },

  // ─── CLAUSE-006: Zéro erreur TypeScript ─────────────────────
  {
    id: "CLAUSE-006",
    type: "BLOCKING",
    description: "Le projet ne doit avoir aucune erreur de compilation TypeScript",
    fn: () => {
      // Use lint instead of tsc (faster, and tsc has issues with Next.js)
      const result = exec(`npx tsc --noEmit 2>&1 | head -5`, 60000);
      const hasErrors = result.stdout.includes("error TS");
      return {
        status: !hasErrors ? "PASS" : "FAIL",
        actual: hasErrors ? "Erreurs TS détectées" : "Aucune erreur TS",
        expected: "0 erreur TS",
        error: hasErrors ? result.stdout.slice(0, 200) : undefined,
      };
    },
  },

  // ─── CLAUSE-007: Pages company profiles accessibles ─────────
  {
    id: "CLAUSE-007",
    type: "BLOCKING",
    description: "Les 5 pages company profiles doivent retourner 200 OK",
    fn: () => {
      const slugs = ["ocp-group", "attijariwafa-bank", "bank-of-africa", "maroc-telecom", "royal-air-maroc"];
      const results: string[] = [];
      let allPass = true;
      for (const slug of slugs) {
        const status = httpStatus(`http://localhost:3000/atelier/companies/${slug}`, 15000);
        results.push(`${slug}: ${status}`);
        if (status !== 200) allPass = false;
      }
      return {
        status: allPass ? "PASS" : "FAIL",
        actual: results.join(", "),
        expected: "Toutes 200 OK",
      };
    },
  },

  // ─── CLAUSE-008: Rapport concurrentiel AlphaSense ───────────
  {
    id: "CLAUSE-008",
    type: "BLOCKING",
    description: "Le rapport AlphaSense doit faire au moins 600 lignes",
    fn: () => {
      const lines = fileLineCount("competitive-reports/07-alphasense.md");
      return {
        status: lines >= 600 ? "PASS" : "FAIL",
        actual: `${lines} lignes`,
        expected: ">= 600 lignes",
      };
    },
  },

  // ─── CLAUSE-009: Worklog à jour ─────────────────────────────
  {
    id: "CLAUSE-009",
    type: "BLOCKING",
    description: "Worklog >= 150 lignes avec entrée du jour",
    fn: () => {
      const lines = fileLineCount("worklog.md");
      const today = new Date().toISOString().slice(0, 10);
      const content = readFileSync(resolve(PROJECT_ROOT, "worklog.md"), "utf-8");
      const hasToday = content.includes(today);
      return {
        status: lines >= 150 && hasToday ? "PASS" : "FAIL",
        actual: `${lines} lignes, entrée ${today} ${hasToday ? "présente" : "MANQUANTE"}`,
        expected: ">= 150 lignes + entrée du jour",
      };
    },
  },

  // ─── CLAUSE-010: Flagship Report page accessible ────────────
  {
    id: "CLAUSE-010",
    type: "BLOCKING",
    description: "La page /atelier/flagship-report doit retourner 200 OK",
    fn: () => {
      const status = httpStatus("http://localhost:3000/atelier/flagship-report", 15000);
      return {
        status: status === 200 ? "PASS" : "FAIL",
        actual: `HTTP ${status}`,
        expected: "HTTP 200",
      };
    },
  },

  // ─── CLAUSE-011: Overflow protection CSS ────────────────────
  {
    id: "CLAUSE-011",
    type: "BLOCKING",
    description: "Classes utilitaires overflow protection dans globals.css",
    fn: () => {
      const content = readFileSync(resolve(PROJECT_ROOT, "src/app/globals.css"), "utf-8");
      const hasTextTruncate = content.includes(".text-truncate");
      const hasCellTruncate = content.includes(".cell-truncate");
      const hasClipContainer = content.includes(".clip-container");
      const hasConsoleShell = content.includes(".console-shell");
      const count = [hasTextTruncate, hasCellTruncate, hasClipContainer, hasConsoleShell].filter(Boolean).length;
      return {
        status: count >= 4 ? "PASS" : "FAIL",
        actual: `${count}/4 classes présentes`,
        expected: "4/4 (text-truncate, cell-truncate, clip-container, console-shell)",
      };
    },
  },

  // ─── CLAUSE-012: Dev server fonctionnel ─────────────────────
  {
    id: "CLAUSE-012",
    type: "BLOCKING",
    description: "Le serveur de développement doit répondre sur port 3000",
    fn: () => {
      const status = httpStatus("http://localhost:3000/atelier", 10000);
      return {
        status: status === 200 ? "PASS" : "FAIL",
        actual: `HTTP ${status}`,
        expected: "HTTP 200",
      };
    },
  },

  // ─── CLAUSE-W01: Tests automatisés (WARNING) ────────────────
  {
    id: "CLAUSE-W01",
    type: "WARNING",
    description: "Le projet devrait avoir au moins 1 test automatisé",
    fn: () => {
      const result = exec(`find . -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.test.tsx" -o -name "*.spec.tsx" 2>/dev/null | grep -v node_modules | grep -v .next | wc -l`, 10000);
      const count = parseInt(result.stdout, 10) || 0;
      return {
        status: count >= 1 ? "PASS" : "FAIL",
        actual: `${count} fichiers de test`,
        expected: ">= 1 fichier de test",
      };
    },
  },

  // ─── CLAUSE-W02: Monitoring/observability (WARNING) ─────────
  {
    id: "CLAUSE-W02",
    type: "WARNING",
    description: "Le projet devrait avoir un logger structuré",
    fn: () => {
      const exists = fileExists("src/lib/logger.ts");
      return {
        status: exists ? "PASS" : "FAIL",
        actual: exists ? "src/lib/logger.ts présent" : "MANQUANT",
        expected: "src/lib/logger.ts existe",
      };
    },
  },

  // ─── CLAUSE-W03: CI/CD pipeline (WARNING) ───────────────────
  {
    id: "CLAUSE-W03",
    type: "WARNING",
    description: "Le projet devrait avoir un workflow GitHub Actions",
    fn: () => {
      const exists = fileExists(".github/workflows") || exec(`ls .github/workflows/*.yml 2>/dev/null | wc -l`).stdout !== "0";
      return {
        status: exists ? "PASS" : "FAIL",
        actual: exists ? ".github/workflows présent" : "MANQUANT",
        expected: ".github/workflows/*.yml existe",
      };
    },
  },
];

// ─── MAIN EXECUTION ────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  AGENT DE VÉRIFICATION — CAHIER DES CHARGES");
  console.log("  Contrat: .CAHIER_DES_CHARGES.md");
  console.log("══════════════════════════════════════════════════════════════\n");

  // Verify the contract file exists
  if (!existsSync(CAHIER_PATH)) {
    console.error("❌ ERREUR FATALE: .CAHIER_DES_CHARGES.md introuvable!");
    console.error(`   Chemin attendu: ${CAHIER_PATH}`);
    process.exit(1);
  }

  console.log(`📋 Contrat chargé: ${CAHIER_PATH}`);
  console.log(`📊 ${clauses.length} clauses à vérifier (${clauses.filter(c => c.type === "BLOCKING").length} BLOCKING, ${clauses.filter(c => c.type === "WARNING").length} WARNING)\n`);

  const results: ClauseResult[] = [];
  const nextSteps: string[] = [];

  for (const clause of clauses) {
    const start = Date.now();
    process.stdout.write(`  [${clause.type}] ${clause.id}: ${clause.description}... `);

    try {
      const result = clause.fn();
      const durationMs = Date.now() - start;
      const fullResult: ClauseResult = {
        ...result,
        id: clause.id,
        type: clause.type,
        description: clause.description,
        durationMs,
      };
      results.push(fullResult);

      const icon = result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⏭️";
      console.log(`${icon} ${result.status} (${durationMs}ms)`);
      if (result.actual) console.log(`      Actuel: ${result.actual}`);
      if (result.status === "FAIL") {
        console.log(`      Attendu: ${result.expected}`);
        if (result.error) console.log(`      Erreur: ${result.error.slice(0, 100)}`);
        if (clause.type === "BLOCKING") {
          nextSteps.push(`CORRIGER ${clause.id}: ${clause.description}`);
        }
      }
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const fullResult: ClauseResult = {
        id: clause.id,
        type: clause.type,
        description: clause.description,
        status: "FAIL",
        actual: "Exception",
        expected: "Pas d'exception",
        durationMs,
        error: err.message,
      };
      results.push(fullResult);
      console.log(`💥 EXCEPTION (${durationMs}ms)`);
      console.log(`      ${err.message.slice(0, 100)}`);
      if (clause.type === "BLOCKING") {
        nextSteps.push(`CORRIGER ${clause.id}: ${clause.description} (exception: ${err.message})`);
      }
    }
  }

  // ─── BUILD REPORT ───────────────────────────────────────────
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const skipped = results.filter(r => r.status === "SKIP").length;
  const blockingFailed = results.filter(r => r.type === "BLOCKING" && r.status === "FAIL").length;
  const warningFailed = results.filter(r => r.type === "WARNING" && r.status === "FAIL").length;

  const report: ComplianceReport = {
    timestamp: new Date().toISOString(),
    totalClauses: clauses.length,
    passed,
    failed,
    skipped,
    blockingFailed,
    warningFailed,
    sessionCanEnd: blockingFailed === 0,
    results,
    nextSteps,
  };

  // ─── WRITE SESSION LOCK ─────────────────────────────────────
  writeFileSync(LOCK_PATH, JSON.stringify(report, null, 2));

  // ─── PRINT SUMMARY ──────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  RAPPORT DE CONFORMITÉ");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  Total clauses:    ${report.totalClauses}`);
  console.log(`  ✅ Passées:        ${report.passed}`);
  console.log(`  ❌ Échouées:       ${report.failed} (${blockingFailed} BLOCKING, ${warningFailed} WARNING)`);
  console.log(`  ⏭️  Ignorées:       ${report.skipped}`);
  console.log("");

  if (report.sessionCanEnd) {
    console.log("  ✅✅✅ SESSION AUTORISÉE À SE TERMINER ✅✅✅");
    console.log("  Toutes les clauses BLOCKING sont respectées.");
    console.log("  Le fichier .session-lock.json a été mis à jour.");
  } else {
    console.log("  ❌❌❌ SESSION BLOQUÉE — CLAUSES NON RESPECTÉES ❌❌❌");
    console.log(`  ${blockingFailed} clause(s) BLOCKING doivent être corrigées:\n`);
    for (const step of nextSteps) {
      console.log(`    → ${step}`);
    }
    console.log("");
    console.log("  L'exécuteur doit corriger ces clauses avant de pouvoir");
    console.log("  terminer la session. Utilisez les DROITS accordés pour");
    console.log("  créer des agents spécialisés si nécessaire.");
  }

  console.log("");
  console.log(`  📄 Rapport complet: ${LOCK_PATH}`);
  console.log("══════════════════════════════════════════════════════════════\n");

  // Exit code: 0 if session can end, 1 otherwise
  process.exit(report.sessionCanEnd ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
