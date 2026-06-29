"use client";

import type { PreflightResult, Tier } from "@/schemas/verdict";
import { HelpTip } from "@/components/HelpTip";

/* Shared tier visual + language. Imported by NetworkCard and ResultsPanel.
   The "clearance" words (GO / HOLD / NO-GO) are this product's signature. */
export const TIER_META: Record<
  Tier,
  {
    clearance: string;
    meaning: string;
    chip: string; // filled badge
    soft: string; // soft surface (bg + text + border)
    bar: string; // gauge fill
    text: string; // accent text
    dot: string; // status dot bg
  }
> = {
  BLOCK: {
    clearance: "NO-GO",
    meaning: "Do not launch — high suspension risk.",
    chip: "bg-block text-white",
    soft: "bg-block-soft text-block border-block/30",
    bar: "bg-block",
    text: "text-block",
    dot: "bg-block",
  },
  REVIEW: {
    clearance: "HOLD",
    meaning: "Fix the flagged items before launching.",
    chip: "bg-review text-white",
    soft: "bg-review-soft text-review border-review/30",
    bar: "bg-review",
    text: "text-review",
    dot: "bg-review",
  },
  CLEAR: {
    clearance: "GO",
    meaning: "Nothing flagged — looks safe to launch.",
    chip: "bg-clear text-white",
    soft: "bg-clear-soft text-clear border-clear/30",
    bar: "bg-clear",
    text: "text-clear",
    dot: "bg-clear",
  },
};

const RANK: Record<Tier, number> = { CLEAR: 0, REVIEW: 1, BLOCK: 2 };
const SEVERITY_TIER = { high: "BLOCK", med: "REVIEW", low: "CLEAR" } as const;
// Funnel flags that escalate the overall verdict on their own.
const FLAG_TIER: Record<string, Tier> = {
  cloaking_suspected: "BLOCK",
  domain_mismatch: "REVIEW",
  missing_disclosure: "REVIEW",
  unreachable: "REVIEW",
};

/** Worst tier across networks, FTC findings, and funnel flags. */
export function computeOverall(result: PreflightResult): Tier {
  let worst: Tier = "CLEAR";
  const bump = (t: Tier) => {
    if (RANK[t] > RANK[worst]) worst = t;
  };
  for (const n of result.perNetwork) bump(n.tier);
  for (const f of result.ftc.findings) bump(SEVERITY_TIER[f.severity]);
  for (const flag of result.funnel.flags) bump(FLAG_TIER[flag] ?? "REVIEW");
  return worst;
}

export function VerdictBanner({ result }: { result: PreflightResult }) {
  const overall = computeOverall(result);
  const meta = TIER_META[overall];

  const counts = { BLOCK: 0, REVIEW: 0, CLEAR: 0 } as Record<Tier, number>;
  for (const n of result.perNetwork) counts[n.tier] += 1;
  const totalFindings =
    result.perNetwork.reduce((sum, n) => sum + n.findings.length, 0) +
    result.ftc.findings.length;

  return (
    <section
      data-coach="verdict"
      aria-label="Overall clearance"
      className="rise overflow-hidden rounded-xl bg-ink text-white shadow-lg"
    >
      {/* tier strip — instant color read across the top */}
      <div className={`h-1.5 ${meta.bar}`} />

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
              Pre-Flight Clearance
            </span>
            <HelpTip k="result.verdict" tone="dark" side="bottom" />
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <span
              className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
              aria-hidden
            />
            <span className="font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl">
              {meta.clearance}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${meta.chip}`}
            >
              {overall}
            </span>
          </div>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
            {meta.meaning}
          </p>
        </div>

        {/* readout summary — quiet, monospace, instrument-panel feel */}
        <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-white/5 p-4 font-mono text-xs sm:grid-cols-1 sm:text-right">
          <SummaryRow label="No-go networks" value={counts.BLOCK} tone="block" />
          <SummaryRow label="Hold networks" value={counts.REVIEW} tone="review" />
          <SummaryRow label="Cleared networks" value={counts.CLEAR} tone="clear" />
          <SummaryRow label="Total findings" value={totalFindings} />
        </dl>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "block" | "review" | "clear";
}) {
  const dot =
    tone === "block"
      ? "bg-block"
      : tone === "review"
        ? "bg-review"
        : tone === "clear"
          ? "bg-clear"
          : "bg-white/40";
  return (
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      <span className="flex items-center gap-1.5 text-white/60">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </span>
      <span className="tnum text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
