"use client";

import { modules } from "@/lib/modules";

// A compliance tool must not use the deceptive-UI patterns it flags, so
// roadmap modules are plainly static text — no clickable-looking buttons.
export function ModuleFooter() {
  return (
    <footer className="mt-12 border-t border-line pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          The platform
        </h2>
        <p className="text-xs text-muted">
          Pre-Flight is module 01. More are on the way.
        </p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const live = m.status === "live";
          return (
            <li
              key={m.id}
              className={`rounded-xl border p-4 ${
                live
                  ? "border-brand/40 bg-brand-soft"
                  : "border-line bg-surface/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-xs ${
                    live ? "text-brand-ink" : "text-muted"
                  }`}
                >
                  {m.id}
                </span>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-clear-soft px-2 py-0.5 text-[11px] font-semibold text-clear">
                    <span className="h-1.5 w-1.5 rounded-full bg-clear" aria-hidden />
                    Live now
                  </span>
                ) : (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                    Coming soon
                  </span>
                )}
              </div>
              <h3
                className={`mt-2 font-display text-sm font-semibold ${
                  live ? "text-ink" : "text-ink-soft"
                }`}
              >
                {m.name}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {m.blurb}
              </p>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
