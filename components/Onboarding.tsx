"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    eyebrow: "Step 1",
    title: "What this is",
    body: "Pre-Flight scores your ad against each network's ban rules and the FTC — before you spend a dollar. Nothing is published; this is a private check.",
  },
  {
    eyebrow: "Step 2",
    title: "Paste your ad",
    body: "Drop your text and landing-page URL on the left, pick the networks you'll run on, and press Run Pre-Flight. No ad handy? Press Load example.",
  },
  {
    eyebrow: "Step 3",
    title: "Read your risk",
    body: "You'll get a GO / HOLD / NO-GO verdict, a risk score per network, and a one-click fix for every issue. Hover any ⓘ for help, or flip on Help mode up top.",
  },
];

export function Onboarding({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);

  // Restart at the beginning each time it opens (adjust state during render).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStep(0);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <button
        type="button"
        aria-label="Close intro"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/55"
      />
      <div className="rise relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="h-1.5 bg-brand" />
        <div className="p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
            {current.eyebrow} of {STEPS.length}
          </p>
          <h2
            id="onboarding-title"
            className="mt-2 font-display text-xl font-bold tracking-tight text-ink"
          >
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {current.body}
          </p>

          <div className="mt-6 flex items-center justify-between">
            {/* progress dots */}
            <div className="flex gap-1.5" aria-hidden>
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-5 bg-brand" : "w-1.5 bg-line"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
                >
                  Back
                </button>
              )}
              {last ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-ink"
                >
                  Get started
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-ink"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {!last && (
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-xs font-medium text-muted hover:text-ink"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
