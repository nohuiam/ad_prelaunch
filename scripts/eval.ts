// Eval harness — the product's correctness gate.
//
//   npx tsx scripts/eval.ts            # offline: deterministic lexicon stub (no API key)
//   EVAL_LIVE=1 npx tsx scripts/eval.ts # integration: real engine (needs ANTHROPIC_API_KEY)
//
// Both paths return a PreflightResult and are compared identically. Until the lead's semantic
// judge is merged, the stub proves Layer-1 recall + scoring + tier mapping against real triggers.
// Target: >= 90% tier match.
import type {
  Creative,
  Finding,
  Funnel,
  NetworkVerdict,
  PreflightRequest,
  PreflightResult,
  Tier,
} from "@/schemas/verdict";
import type { NetworkId } from "@/lib/policy/types";
import { PACKS } from "@/lib/policy/index";
import { scoreFindings } from "@/lib/engine/score";
import { FIXTURES } from "@/scripts/fixtures/cases";

const LIVE = !!process.env.EVAL_LIVE;

// ── stub matcher: boundary-aware substring test on the lexicon triggers ──────────
// Word boundaries are applied only on edges that are word chars, so triggers ending in
// punctuation ("make $", "100%", "$500/day") still match the digits/text that follow.
function mentions(haystack: string, trigger: string): boolean {
  const t = trigger.toLowerCase().trim();
  if (!t) return false;
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const left = /^[a-z0-9]/.test(t) ? "(?<![a-z0-9])" : "";
  const right = /[a-z0-9]$/.test(t) ? "(?![a-z0-9])" : "";
  return new RegExp(`${left}${esc}${right}`, "i").test(haystack);
}

function creativeToText(c: Creative): string {
  return [c.headline, c.primaryText, c.description, c.cta].filter(Boolean).join("\n").toLowerCase();
}

// Deterministic lexicon judge: one finding per rule whose trigger fires.
function stubJudge(text: string, network: NetworkId | "ftc"): Finding[] {
  const pack = PACKS[network];
  const findings: Finding[] = [];
  for (const rule of pack.rules) {
    const hit = rule.triggers.find((tr) => mentions(text, tr));
    if (!hit) continue;
    findings.push({
      ruleId: rule.id,
      network,
      severity: rule.severity,
      title: rule.name,
      evidence: hit,
      why: `(lexicon stub) trigger "${hit}" matched ${rule.id}.`,
      suggestedFix: `Revise copy to address ${rule.id}: ${rule.name}.`,
    });
  }
  return findings;
}

function stubPreflight(req: PreflightRequest): PreflightResult {
  const text = creativeToText(req.creative);
  const perNetwork: NetworkVerdict[] = req.networks.map((n) => {
    const findings = stubJudge(text, n);
    return { network: n, ...scoreFindings(findings), findings };
  });
  const funnel: Funnel = { fetched: false, redirectChain: [], flags: [] };
  return { perNetwork, ftc: { findings: stubJudge(text, "ftc") }, funnel };
}

// ── runner ───────────────────────────────────────────────────────────────────
type Run = (req: PreflightRequest) => Promise<PreflightResult>;

interface Row {
  id: string;
  cells: string; // "meta:BLOCK✓ google:REVIEW✗(BLOCK)"
  flagNote: string;
  ok: boolean;
}

async function main() {
  let run: Run;
  if (LIVE) {
    const mod = await import("@/lib/engine/run_preflight");
    run = mod.runPreflight;
    console.log("Mode: LIVE (real engine via run_preflight)\n");
  } else {
    run = async (req) => stubPreflight(req);
    console.log("Mode: STUB (offline lexicon judge — set EVAL_LIVE=1 for the real engine)\n");
  }

  let comparisons = 0;
  let matches = 0;
  let mustFlagChecked = 0;
  let mustFlagPassed = 0;
  const rows: Row[] = [];

  for (const fx of FIXTURES) {
    const req: PreflightRequest = {
      creative: fx.creative,
      networks: fx.networks,
      ...(fx.landingPageUrl ? { landingPageUrl: fx.landingPageUrl } : {}),
    };
    const result = await run(req);
    const tierByNet = new Map<string, Tier>(result.perNetwork.map((v) => [v.network, v.tier]));

    const cells: string[] = [];
    let rowOk = true;

    for (const [net, want] of Object.entries(fx.expect.perNetworkTier)) {
      const got = tierByNet.get(net);
      comparisons++;
      const hit = got === want;
      if (hit) matches++;
      else rowOk = false;
      cells.push(`${net}:${got ?? "—"}${hit ? "✓" : `✗(want ${want})`}`);
    }

    if (fx.expect.ftcTier) {
      const got = scoreFindings(result.ftc.findings).tier;
      comparisons++;
      const hit = got === fx.expect.ftcTier;
      if (hit) matches++;
      else rowOk = false;
      cells.push(`ftc:${got}${hit ? "✓" : `✗(want ${fx.expect.ftcTier})`}`);
    }

    // mustFlag check across every finding (perNetwork + ftc)
    let flagNote = "";
    if (fx.expect.mustFlagRuleIds?.length) {
      const seen = new Set<string>([
        ...result.perNetwork.flatMap((v) => v.findings.map((f) => f.ruleId)),
        ...result.ftc.findings.map((f) => f.ruleId),
      ]);
      const missing = fx.expect.mustFlagRuleIds.filter((id) => !seen.has(id));
      mustFlagChecked++;
      if (missing.length === 0) mustFlagPassed++;
      else rowOk = false;
      flagNote = missing.length ? `missing ${missing.join(",")}` : "flags✓";
    }

    rows.push({ id: fx.id, cells: cells.join("  "), flagNote, ok: rowOk });
  }

  // ── report ──
  const idW = Math.max(...rows.map((r) => r.id.length), 2);
  console.log(`${"".padEnd(2)} ${"FIXTURE".padEnd(idW)}  TIERS / FLAGS`);
  console.log("─".repeat(idW + 40));
  for (const r of rows) {
    const mark = r.ok ? "✓ " : "✗ ";
    const flag = r.flagNote ? `  [${r.flagNote}]` : "";
    console.log(`${mark} ${r.id.padEnd(idW)}  ${r.cells}${flag}`);
  }

  const tierRate = comparisons ? (matches / comparisons) * 100 : 0;
  const flagRate = mustFlagChecked ? (mustFlagPassed / mustFlagChecked) * 100 : 100;
  const fixturesPassed = rows.filter((r) => r.ok).length;

  console.log("─".repeat(idW + 40));
  console.log(`\nFixtures:      ${fixturesPassed}/${rows.length} fully passing`);
  console.log(`Tier match:    ${matches}/${comparisons} (${tierRate.toFixed(1)}%)  [target ≥ 90%]`);
  console.log(`mustFlag:      ${mustFlagPassed}/${mustFlagChecked} (${flagRate.toFixed(1)}%)`);

  const pass = tierRate >= 90 && mustFlagPassed === mustFlagChecked;
  console.log(`\n${pass ? "PASS ✓" : "FAIL ✗"} — tier match ${tierRate.toFixed(1)}% / flags ${mustFlagPassed}/${mustFlagChecked}`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
