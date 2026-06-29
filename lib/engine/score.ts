// Deterministic scoring. The LLM finds violations; THIS computes the number + tier.
// FROZEN CONSTANTS — see handoffs/contracts.md.
import type { Finding, Tier } from "@/schemas/verdict";

export const SEVERITY_WEIGHT = { high: 4, med: 2, low: 0.75 } as const;
export const TIER_THRESHOLD = { block: 7, review: 2.5 } as const;

export function scoreFindings(findings: Pick<Finding, "severity">[]): {
  score: number;
  tier: Tier;
} {
  const raw = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  const score = Math.round(Math.min(10, raw) * 10) / 10;
  const anyHigh = findings.some((f) => f.severity === "high");
  const anyMed = findings.some((f) => f.severity === "med");
  const tier: Tier =
    anyHigh || score >= TIER_THRESHOLD.block
      ? "BLOCK"
      : anyMed || score >= TIER_THRESHOLD.review
        ? "REVIEW"
        : "CLEAR";
  return { score, tier };
}
