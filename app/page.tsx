"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreflightRequest, PreflightResult } from "@/schemas/verdict";
import sampleResult from "@/fixtures/sample_result.json";
import { HelpModeProvider, HelpTip, useHelpMode } from "@/components/HelpTip";
import { PreflightForm } from "@/components/PreflightForm";
import { ResultsPanel, type ResultStatus } from "@/components/ResultsPanel";
import { CreativeLab } from "@/components/CreativeLab";
import { Onboarding } from "@/components/Onboarding";
import { ModuleFooter } from "@/components/ModuleFooter";

// Live: POST the real request to /api/preflight. (Set true to render the offline mock fixture.)
const USE_MOCK = false;

const LS_ONBOARD = "adpf_onboarding_v1";
const LS_COACH = "adpf_coach_v1";

type Mode = "preflight" | "creative";

const COACH_STEPS: { key: string; title: string; body: string }[] = [
  {
    key: "verdict",
    title: "Start with the clearance",
    body: "GO, HOLD, or NO-GO. It reflects your riskiest network — if any platform says stop, this says stop.",
  },
  {
    key: "score",
    title: "Then each network's risk",
    body: "0 is clean, 10 is dangerous. The bar and color show how close this ad is to getting flagged there.",
  },
  {
    key: "fix",
    title: "Fix issues in one tap",
    body: "Every finding has a Fix button with a compliant rewrite you can paste straight in.",
  },
];

async function callPreflight(req: PreflightRequest): Promise<PreflightResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900));
    return sampleResult as unknown as PreflightResult;
  }
  const res = await fetch("/api/preflight", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Request failed (${res.status}).`);
  }
  return res.json();
}

export default function Home() {
  return (
    <HelpModeProvider>
      <App />
    </HelpModeProvider>
  );
}

function App() {
  const [mode, setMode] = useState<Mode>("preflight");
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        if (!localStorage.getItem(LS_ONBOARD)) setOnboardingOpen(true);
      } catch {
        /* storage blocked — app still works */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false);
    try {
      localStorage.setItem(LS_ONBOARD, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <Header
        mode={mode}
        setMode={setMode}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {mode === "preflight" ? (
          <PreFlightView onboardingOpen={onboardingOpen} />
        ) : (
          <CreativeLab />
        )}
        <ModuleFooter />
      </main>

      <Onboarding open={onboardingOpen} onClose={closeOnboarding} />
    </div>
  );
}

/* ── Pre-Flight (Module 01) — behavior unchanged, just relocated ─────────── */

function PreFlightView({ onboardingOpen }: { onboardingOpen: boolean }) {
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestedNetworks, setRequestedNetworks] = useState<string[]>([]);
  const [coachActive, setCoachActive] = useState(false);
  const coachDoneRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        coachDoneRef.current = Boolean(localStorage.getItem(LS_COACH));
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const finishCoach = useCallback(() => {
    setCoachActive(false);
    coachDoneRef.current = true;
    try {
      localStorage.setItem(LS_COACH, "1");
    } catch {
      /* ignore */
    }
  }, []);

  async function handleRun(req: PreflightRequest, fromExample: boolean) {
    setStatus("running");
    setError(null);
    setRequestedNetworks(req.networks);
    setCoachActive(false);
    try {
      const data = await callPreflight(req);
      setResult(data);
      setStatus("done");
      if (fromExample && !coachDoneRef.current && !onboardingOpen) {
        setCoachActive(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-6">
          <div className="mb-2 flex items-baseline gap-2">
            <h1 className="font-display text-lg font-semibold text-ink">Your ad</h1>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Flight plan
            </span>
          </div>
          <PreflightForm onRun={handleRun} running={status === "running"} />
        </div>

        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <h1 className="font-display text-lg font-semibold text-ink">Your risk</h1>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Clearance
            </span>
          </div>
          <ResultsPanel
            status={status}
            result={result}
            error={error}
            requestedNetworks={requestedNetworks}
            coach={coachActive}
          />
        </div>
      </div>

      {coachActive && <Coachmarks steps={COACH_STEPS} onDone={finishCoach} />}
    </>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────── */

function Header({
  mode,
  setMode,
  onOpenOnboarding,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  onOpenOnboarding: () => void;
}) {
  const { helpMode, setHelpMode } = useHelpMode();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-bold text-white"
          >
            AP
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold tracking-tight text-ink">
              Ad Prelaunch
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Ad-Ops Operating Layer
            </p>
          </div>
        </div>

        {/* module tabs */}
        <nav className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          <ModeTab active={mode === "preflight"} onClick={() => setMode("preflight")}>
            Pre-Flight
          </ModeTab>
          <ModeTab active={mode === "creative"} onClick={() => setMode("creative")}>
            Creative Lab
          </ModeTab>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={helpMode}
              onClick={() => setHelpMode(!helpMode)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                helpMode
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-muted hover:border-brand hover:text-brand-ink"
              }`}
            >
              <span
                className={`relative h-3.5 w-6 rounded-full transition-colors ${
                  helpMode ? "bg-white/40" : "bg-line"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
                    helpMode ? "left-3" : "left-0.5"
                  }`}
                />
              </span>
              Help mode
            </button>
            <HelpTip k="action.helpMode" side="bottom" />
          </div>

          <button
            type="button"
            onClick={onOpenOnboarding}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand-ink"
          >
            How it works
          </button>
        </div>
      </div>
    </header>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors sm:flex-none ${
        active
          ? "bg-ink text-white"
          : "border border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Coachmarks ─────────────────────────────────────────────────────────────
   A lightweight first-run tour. Spotlights real result elements by their
   data-coach attribute and shows a callout anchored to each one. */

function Coachmarks({
  steps,
  onDone,
}: {
  steps: { key: string; title: string; body: string }[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const elRef = useRef<HTMLElement | null>(null);

  const total = steps.length;

  useEffect(() => {
    const step = steps[index];
    let el: HTMLElement | null = null;
    const update = () => {
      if (el) setRect(el.getBoundingClientRect());
    };

    const raf = requestAnimationFrame(() => {
      el = document.querySelector<HTMLElement>(`[data-coach="${step.key}"]`);

      if (elRef.current && elRef.current !== el) {
        elRef.current.classList.remove("coach-target");
      }

      if (!el) {
        if (index < total - 1) setIndex((i) => i + 1);
        else onDone();
        return;
      }

      elRef.current = el;
      el.classList.add("coach-target");
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [index, steps, total, onDone]);

  useEffect(() => {
    return () => {
      if (elRef.current) elRef.current.classList.remove("coach-target");
    };
  }, []);

  const step = steps[index];
  const last = index === total - 1;

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
  const calloutW = 288;
  let top = 120;
  let left = vw / 2 - calloutW / 2;
  if (rect) {
    const below = rect.bottom + 12;
    const placeBelow = below + 150 < vh;
    top = placeBelow ? below : Math.max(12, rect.top - 12 - 150);
    left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - calloutW / 2),
      vw - calloutW - 12,
    );
  }

  return (
    <div className="fixed inset-0 z-[55]" aria-live="polite">
      <button
        type="button"
        aria-label="Next step"
        onClick={() => (last ? onDone() : setIndex((i) => i + 1))}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-label={step.title}
        className="rise absolute w-72 rounded-xl border border-line bg-surface p-4 shadow-2xl"
        style={{ top, left }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">
          Tour · {index + 1} of {total}
        </p>
        <h3 className="mt-1.5 font-display text-sm font-semibold text-ink">
          {step.title}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onDone}
            className="text-xs font-medium text-muted hover:text-ink"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => (last ? onDone() : setIndex((i) => i + 1))}
            className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-ink"
          >
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
