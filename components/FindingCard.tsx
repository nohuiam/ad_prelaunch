"use client";

import { useState } from "react";
import type { Finding, Severity } from "@/schemas/verdict";
import { HelpTip } from "@/components/HelpTip";

/* Shared severity visual + help key. Imported by NetworkCard / ResultsPanel. */
export const SEVERITY_META: Record<
  Severity,
  { label: string; chip: string; helpKey: string }
> = {
  high: {
    label: "High",
    chip: "bg-block-soft text-block border border-block/30",
    helpKey: "result.severity.high",
  },
  med: {
    label: "Medium",
    chip: "bg-review-soft text-review border border-review/30",
    helpKey: "result.severity.med",
  },
  low: {
    label: "Low",
    chip: "bg-brand-soft text-brand-ink border border-brand/30",
    helpKey: "result.severity.low",
  },
};

export function FindingCard({
  finding,
  coach = false,
}: {
  finding: Finding;
  coach?: boolean;
}) {
  const [showFix, setShowFix] = useState(false);
  const sev = SEVERITY_META[finding.severity];

  return (
    <article className="rounded-lg border border-line bg-surface p-3.5">
      {/* severity + title */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${sev.chip}`}
        >
          {sev.label}
        </span>
        <HelpTip k={sev.helpKey} />
        <h4 className="font-display text-sm font-semibold text-ink">
          {finding.title}
        </h4>
      </div>

      {/* evidence — the exact offending snippet, shown verbatim in mono */}
      <div className="mt-2.5 flex flex-wrap items-start gap-x-1.5">
        <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
          Found
        </span>
        <HelpTip k="result.evidence" />
        <p className="mt-1 w-full rounded border border-line bg-paper px-2.5 py-1.5 font-mono text-[13px] leading-snug text-ink-soft">
          “{finding.evidence}”
        </p>
      </div>

      {/* why it matters */}
      <div className="mt-2.5 flex flex-wrap items-start gap-x-1.5">
        <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
          Why
        </span>
        <HelpTip k="result.why" />
        <p className="mt-1 w-full text-[13px] leading-relaxed text-ink-soft">
          {finding.why}
        </p>
      </div>

      {/* one-click fix reveal */}
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-x-1.5">
          <button
            type="button"
            data-coach={coach ? "fix" : undefined}
            onClick={() => setShowFix((v) => !v)}
            aria-expanded={showFix}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand hover:text-white"
          >
            <span aria-hidden>{showFix ? "▾" : "▸"}</span>
            {showFix ? "Hide fix" : "Fix"}
          </button>
          <HelpTip k="result.fix" />
        </div>

        {showFix && (
          <div className="rise mt-2 rounded-lg border border-clear/30 bg-clear-soft p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-clear">
              Suggested rewrite
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              {finding.suggestedFix}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
