"use client";

import type { NetworkVerdict } from "@/schemas/verdict";
import { TIER_META } from "@/components/VerdictBanner";
import { FindingCard } from "@/components/FindingCard";
import { HelpTip } from "@/components/HelpTip";

const NETWORK_NAMES: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  taboola: "Taboola",
};

function networkLabel(id: string) {
  return NETWORK_NAMES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export function NetworkCard({
  verdict,
  loading = false,
  coachScore = false,
  coachFix = false,
}: {
  verdict: NetworkVerdict;
  loading?: boolean;
  coachScore?: boolean;
  coachFix?: boolean;
}) {
  const name = networkLabel(verdict.network);

  if (loading) {
    return (
      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">
            {name}
          </h3>
          <span className="font-mono text-xs text-muted">Running checks…</span>
        </div>
        <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-line" />
        <div className="mt-3 h-16 w-full animate-pulse rounded-lg bg-paper" />
      </section>
    );
  }

  const meta = TIER_META[verdict.tier];
  const pct = Math.max(0, Math.min(100, (verdict.score / 10) * 100));

  return (
    <section className="rise rounded-xl border border-line bg-surface p-4">
      {/* header: name + tier badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-ink">{name}</h3>
        <div className="flex flex-wrap items-center gap-x-1.5">
          <span
            className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${meta.soft}`}
          >
            {verdict.tier}
          </span>
          <HelpTip k={`result.tier.${verdict.tier}`} side="left" />
        </div>
      </div>

      {/* score gauge — the instrument readout */}
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-x-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Risk score
          </span>
          <HelpTip k="result.score" />
          <span
            data-coach={coachScore ? "score" : undefined}
            className={`ml-auto font-mono text-sm font-semibold tnum ${meta.text}`}
          >
            {verdict.score.toFixed(1)}
            <span className="text-muted">/10</span>
          </span>
        </div>
        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-paper"
          role="meter"
          aria-valuenow={verdict.score}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-label={`${name} risk score ${verdict.score} out of 10`}
        >
          <div
            className={`h-full rounded-full ${meta.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* findings */}
      <div className="mt-3.5">
        {verdict.findings.length === 0 ? (
          <p className="rounded-lg border border-clear/30 bg-clear-soft px-3 py-2 text-[13px] text-clear">
            No issues found on {name}.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {verdict.findings.map((f, i) => (
              <li key={`${f.ruleId}-${i}`}>
                <FindingCard finding={f} coach={coachFix && i === 0} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
