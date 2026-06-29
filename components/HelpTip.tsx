"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { help } from "@/content/help";

/* ── Help mode ───────────────────────────────────────────────────────────────
   When on, every HelpTip renders its hint inline at once instead of on hover. */

interface HelpModeValue {
  helpMode: boolean;
  setHelpMode: (v: boolean) => void;
}
const HelpModeContext = createContext<HelpModeValue>({
  helpMode: false,
  setHelpMode: () => {},
});

export function HelpModeProvider({ children }: { children: ReactNode }) {
  const [helpMode, setHelpMode] = useState(false);
  return (
    <HelpModeContext.Provider value={{ helpMode, setHelpMode }}>
      {/* One tooltip provider for the whole app: shared, snappy delay. */}
      <Tooltip.Provider delayDuration={120} skipDelayDuration={300}>
        {children}
      </Tooltip.Provider>
    </HelpModeContext.Provider>
  );
}

export function useHelpMode() {
  return useContext(HelpModeContext);
}

/* ── HelpTip ──────────────────────────────────────────────────────────────────
   An "ⓘ" affordance next to a control or result element.
   - Hover / focus → quick tooltip (Radix Tooltip).
   - Click / tap / Enter → persistent popover with the full hint (Radix Popover).
   - Help mode on → the hint renders inline, full-width, no interaction needed.
   Place inside a `flex flex-wrap items-center` row so the inline hint wraps cleanly. */

export function HelpTip({
  k,
  side = "top",
  tone = "light",
  className = "",
}: {
  k: string;
  side?: "top" | "right" | "bottom" | "left";
  tone?: "light" | "dark";
  className?: string;
}) {
  const { helpMode } = useHelpMode();
  const [open, setOpen] = useState(false);
  const entry = help[k];

  // Missing key: render nothing rather than a broken control.
  if (!entry) return null;

  if (helpMode) {
    const inlineTone =
      tone === "dark" ? "text-white/75" : "text-muted";
    const inlineTitleTone =
      tone === "dark" ? "text-white" : "text-ink-soft";
    return (
      <span
        className={`mt-1 block w-full text-xs leading-relaxed ${inlineTone} ${className}`}
      >
        <span aria-hidden className="mr-1 font-medium text-brand">
          ⓘ
        </span>
        <span className={`font-medium ${inlineTitleTone}`}>{entry.title}.</span>{" "}
        {entry.body}
      </span>
    );
  }

  const triggerTone =
    tone === "dark"
      ? "border-white/35 text-white/80 hover:border-white hover:bg-white/15 hover:text-white data-[state=open]:border-white data-[state=open]:bg-white data-[state=open]:text-ink"
      : "border-line text-muted hover:border-brand hover:bg-brand-soft hover:text-brand-ink data-[state=open]:border-brand data-[state=open]:bg-brand data-[state=open]:text-white";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label={`Help: ${entry.title}`}
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold leading-none transition-colors ${triggerTone} ${className}`}
            >
              <span aria-hidden>i</span>
            </button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={6}
            className="z-50 max-w-[15rem] rounded-md bg-ink px-2.5 py-1.5 text-xs leading-snug text-white shadow-lg"
          >
            {entry.body}
            <Tooltip.Arrow className="fill-ink" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Popover.Portal>
        <Popover.Content
          side={side}
          align="center"
          sideOffset={6}
          collisionPadding={12}
          className="rise z-50 w-[17rem] rounded-lg border border-line bg-surface p-3 text-sm shadow-xl"
        >
          <p className="font-display text-sm font-semibold text-ink">
            {entry.title}
          </p>
          <p className="mt-1 leading-relaxed text-muted">{entry.body}</p>
          <Popover.Arrow className="fill-surface stroke-line" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
