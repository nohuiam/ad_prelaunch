"use client";

import type { PreflightResult } from "@/schemas/verdict";
import { VerdictBanner } from "@/components/VerdictBanner";
import { NetworkCard } from "@/components/NetworkCard";
import { FindingCard } from "@/components/FindingCard";
import { HelpTip } from "@/components/HelpTip";
import { funnelFlagLabels } from "@/content/help";

export type ResultStatus = "idle" | "running" | "done" | "error";

export function ResultsPanel({
  status,
  result,
  error,
  requestedNetworks,
  coach = false,
}: {
  status: ResultStatus;
  result: PreflightResult | null;
  error?: string | null;
  requestedNetworks: string[];
  coach?: boolean;
}) {
  if (status === "idle") {
    return (
      <PanelShell>
        <EmptyState />
      </PanelShell>
    );
  }

  if (status === "error") {
    return (
      <PanelShell>
        <ErrorState message={error} />
      </PanelShell>
    );
  }

  if (status === "running") {
    return (
      <PanelShell>
        <LoadingState networks={requestedNetworks} />
      </PanelShell>
    );
  }

  if (!result) return null;

  return (
    <PanelShell>
      <div className="space-y-4">
        <VerdictBanner result={result} />

        {/* per-network verdicts */}
        <div className="space-y-3">
          <SectionLabel>Networks</SectionLabel>
          {result.perNetwork.map((n, i) => (
            <NetworkCard
              key={n.network}
              verdict={n}
              coachScore={coach && i === 0}
              coachFix={coach && i === 0}
            />
          ))}
        </div>

        {/* FTC */}
        <section className="rise rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <h3 className="font-display text-base font-semibold text-ink">
              FTC
            </h3>
            <HelpTip k="result.ftc" />
          </div>
          <div className="mt-3">
            {result.ftc.findings.length === 0 ? (
              <p className="rounded-lg border border-clear/30 bg-clear-soft px-3 py-2 text-[13px] text-clear">
                No FTC disclosure issues found.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {result.ftc.findings.map((f, i) => (
                  <li key={`${f.ruleId}-${i}`}>
                    <FindingCard finding={f} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Funnel / landing page */}
        <FunnelSection result={result} />
      </div>
    </PanelShell>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
      {children}
    </h2>
  );
}

/* ── Funnel ─────────────────────────────────────────────────────────────── */

function FunnelSection({ result }: { result: PreflightResult }) {
  const { funnel } = result;
  return (
    <section className="rise rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-1.5">
        <h3 className="font-display text-base font-semibold text-ink">
          Landing page
        </h3>
        <HelpTip k="result.funnel" />
      </div>

      {!funnel.fetched ? (
        <p className="mt-3 rounded-lg border border-review/30 bg-review-soft px-3 py-2 text-[13px] text-review">
          We couldn&apos;t open the landing page, so it wasn&apos;t checked. Add
          a reachable URL and run again to include it.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {funnel.finalUrl && (
            <div className="flex flex-wrap items-start gap-x-1.5">
              <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                Lands on
              </span>
              <HelpTip k="result.funnel.finalUrl" />
              <p className="mt-1 w-full break-all font-mono text-[13px] text-ink-soft">
                {funnel.finalUrl}
              </p>
            </div>
          )}

          {/* redirect path */}
          <div>
            <div className="flex flex-wrap items-center gap-x-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Redirect path
              </span>
              <HelpTip k="result.funnel.redirectChain" />
              <span className="ml-auto font-mono text-xs text-muted tnum">
                {funnel.redirectChain.length} hop
                {funnel.redirectChain.length === 1 ? "" : "s"}
              </span>
            </div>
            <ol className="mt-2 space-y-0">
              {funnel.redirectChain.map((hop, i) => {
                const last = i === funnel.redirectChain.length - 1;
                return (
                  <li key={i} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          last ? "bg-brand" : "bg-line"
                        }`}
                        aria-hidden
                      />
                      {!last && (
                        <span className="my-0.5 w-px flex-1 bg-line" aria-hidden />
                      )}
                    </div>
                    <p
                      className={`break-all pb-2 font-mono text-[13px] ${
                        last ? "font-medium text-ink" : "text-muted"
                      }`}
                    >
                      {hop}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* flags */}
          <div className="flex flex-wrap items-center gap-x-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Flags
            </span>
            <HelpTip k="result.funnel.flags" />
            <ul className="mt-1 flex w-full flex-wrap gap-1.5">
              {funnel.flags.length === 0 ? (
                <li className="rounded border border-clear/30 bg-clear-soft px-2 py-0.5 text-xs text-clear">
                  None
                </li>
              ) : (
                funnel.flags.map((flag) => (
                  <li
                    key={flag}
                    className="rounded border border-block/30 bg-block-soft px-2 py-0.5 text-xs font-medium text-block"
                    title={flag}
                  >
                    {funnelFlagLabels[flag] ?? flag}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── States ─────────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex h-full min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/60 p-8 text-center">
      <span
        aria-hidden
        className="font-display text-3xl font-bold tracking-tight text-line"
      >
        GO · HOLD · NO-GO
      </span>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
        Your report shows up here. Fill in the ad on the left and press{" "}
        <span className="font-medium text-ink">Run Pre-Flight</span> — or press{" "}
        <span className="font-medium text-ink">Load example</span> to see one
        first.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message?: string | null }) {
  return (
    <div className="rounded-xl border border-block/30 bg-block-soft p-5">
      <h3 className="font-display text-base font-semibold text-block">
        The check didn&apos;t finish
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        {message ?? "Something went wrong on our side."} Check your ad text and
        landing-page URL, then press Run Pre-Flight again.
      </p>
    </div>
  );
}

function LoadingState({ networks }: { networks: string[] }) {
  const list = networks.length > 0 ? networks : ["meta"];
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-ink p-6 text-white">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
          Pre-Flight Clearance
        </span>
        <div className="mt-3 flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white/60" />
          <span className="font-display text-3xl font-bold tracking-tight text-white/70">
            Running checks…
          </span>
        </div>
        <p className="mt-3 text-sm text-white/70">
          Scoring your ad against each network and the FTC. This takes a few
          seconds.
        </p>
      </div>
      <div className="space-y-3">
        <SectionLabel>Networks</SectionLabel>
        {list.map((n) => (
          <NetworkCard
            key={n}
            loading
            verdict={{ network: n, score: 0, tier: "CLEAR", findings: [] }}
          />
        ))}
      </div>
    </div>
  );
}
