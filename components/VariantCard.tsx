"use client";

import type { Creative, Finding, NetworkVerdict } from "@/schemas/verdict";
import { TIER_META } from "@/components/VerdictBanner";
import { FindingCard } from "@/components/FindingCard";
import { HelpTip } from "@/components/HelpTip";

export type ItemStatus = "flighting" | "done" | "error";

export interface CreativeItem {
  id: string;
  creative: Creative;
  status: ItemStatus;
  verdict?: NetworkVerdict; // the single requested network's verdict
  ftcFindings?: Finding[];
  error?: string;
  rewrite?: { rewritten: Partial<Creative>; note: string };
  rewriting?: boolean;
}

const READY_LABEL: Record<string, { tag: string; help: string }> = {
  CLEAR: { tag: "✓ Ready to run", help: "creative.ready" },
  REVIEW: { tag: "⚠ Needs a tweak", help: "creative.tweak" },
  BLOCK: { tag: "✗ Don't run as-is", help: "creative.tweak" },
};

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-start gap-x-1.5">
      <span className="mt-0.5 w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <p className="flex-1 text-[13px] leading-relaxed text-ink">{value}</p>
    </div>
  );
}

export function VariantCard({
  item,
  index,
  onMakeCompliant,
}: {
  item: CreativeItem;
  index: number;
  onMakeCompliant: (id: string) => void;
}) {
  const { creative, verdict, status } = item;
  const allFindings = [...(verdict?.findings ?? []), ...(item.ftcFindings ?? [])];

  return (
    <section className="rise rounded-xl border border-line bg-surface p-4">
      {/* header: variant number + readiness badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-ink">
          Variant {index + 1}
        </h3>
        {status === "flighting" && (
          <span className="font-mono text-xs text-muted">Checking…</span>
        )}
        {status === "error" && (
          <span className="rounded-md border border-review/30 bg-review-soft px-2 py-0.5 text-xs font-semibold text-review">
            Check failed
          </span>
        )}
        {status === "done" && verdict && (
          <div className="flex flex-wrap items-center gap-x-1.5">
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${TIER_META[verdict.tier].soft}`}
            >
              {READY_LABEL[verdict.tier].tag}
            </span>
            <HelpTip k={READY_LABEL[verdict.tier].help} side="left" />
          </div>
        )}
      </div>

      {/* the generated copy */}
      <div className="mt-3 space-y-2 rounded-lg border border-line bg-paper p-3">
        <Field label="Headline" value={creative.headline} />
        <Field label="Body" value={creative.primaryText} />
        <Field label="CTA" value={creative.cta} />
      </div>

      {/* findings (only if any) */}
      {status === "done" && (
        <div className="mt-3">
          {allFindings.length === 0 ? (
            <p className="rounded-lg border border-clear/30 bg-clear-soft px-3 py-2 text-[13px] text-clear">
              Cleared — no policy issues found. Safe to run.
            </p>
          ) : (
            <>
              <ul className="space-y-2.5">
                {allFindings.map((f, i) => (
                  <li key={`${f.ruleId}-${i}`}>
                    <FindingCard finding={f} />
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onMakeCompliant(item.id)}
                  disabled={item.rewriting}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand hover:text-white disabled:opacity-60"
                >
                  {item.rewriting ? "Rewriting…" : "Make this compliant"}
                </button>
              </div>
            </>
          )}

          {item.rewrite && (
            <div className="rise mt-3 rounded-lg border border-clear/30 bg-clear-soft p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-clear">
                Compliant rewrite
              </p>
              <div className="mt-1.5 space-y-1.5">
                <Field label="Headline" value={item.rewrite.rewritten.headline} />
                <Field label="Body" value={item.rewrite.rewritten.primaryText} />
                <Field label="CTA" value={item.rewrite.rewritten.cta} />
              </div>
              {item.rewrite.note && (
                <p className="mt-2 text-[12px] italic leading-relaxed text-ink-soft">
                  {item.rewrite.note}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="mt-3 text-[13px] text-ink-soft">
          {item.error ?? "We couldn't check this variant."} You can still use the copy above.
        </p>
      )}
    </section>
  );
}
