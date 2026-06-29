"use client";

import { useState } from "react";
import type { Creative, Finding, NetworkVerdict, PreflightResult } from "@/schemas/verdict";
import type { NetworkId } from "@/lib/policy/types";
import { HelpTip } from "@/components/HelpTip";
import { VariantCard, type CreativeItem } from "@/components/VariantCard";
import sampleCreative from "@/fixtures/sample_creative.json";

interface CreativeExample {
  offer: string;
  network: string;
  count: number;
  items: { creative: Creative; verdict: NetworkVerdict; ftcFindings: Finding[] }[];
}

const NETWORKS: { id: NetworkId; label: string }[] = [
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "tiktok", label: "TikTok" },
  { id: "taboola", label: "Taboola" },
];

const JSON_HEADERS = { "content-type": "application/json" };

export function CreativeLab() {
  const [offer, setOffer] = useState("");
  const [network, setNetwork] = useState<NetworkId>("meta");
  const [count, setCount] = useState(3);
  const [items, setItems] = useState<CreativeItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function preflightOne(it: CreativeItem, net: NetworkId) {
    try {
      const res = await fetch("/api/preflight", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ creative: it.creative, networks: [net] }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Check failed (${res.status}).`);
      }
      const result = (await res.json()) as PreflightResult;
      const verdict = result.perNetwork[0];
      const ftcFindings = result.ftc.findings;
      setItems((prev) =>
        prev.map((p) => (p.id === it.id ? { ...p, status: "done", verdict, ftcFindings } : p)),
      );
    } catch (e) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === it.id
            ? { ...p, status: "error", error: e instanceof Error ? e.message : "Check failed." }
            : p,
        ),
      );
    }
  }

  async function handleGenerate() {
    if (!offer.trim() || generating) return;
    setError(null);
    setGenerating(true);
    setItems([]);
    const net = network;
    try {
      const res = await fetch("/api/creative", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ offer, network: net, count }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Generation failed (${res.status}).`);
      }
      const { variants } = (await res.json()) as { variants: Creative[] };
      const initial: CreativeItem[] = variants.map((c, i) => ({
        id: `v${i}`,
        network: net,
        creative: c,
        status: "flighting",
      }));
      setItems(initial);
      setGenerating(false);
      // Verify each variant independently (parallel, each its own short request).
      initial.forEach((it) => void preflightOne(it, net));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setGenerating(false);
    }
  }

  async function handleMakeCompliant(id: string) {
    const it = items.find((p) => p.id === id);
    if (!it || !it.verdict) return;
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, rewriting: true } : p)));
    try {
      const findings = [...it.verdict.findings, ...(it.ftcFindings ?? [])];
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ network: it.network, creative: it.creative, findings }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "Rewrite failed.");
      }
      const rewrite = (await res.json()) as { rewritten: Partial<Creative>; note: string };
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, rewriting: false, rewrite } : p)));
    } catch {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, rewriting: false } : p)));
    }
  }

  function loadExample() {
    const ex = sampleCreative as unknown as CreativeExample;
    setOffer(ex.offer);
    setNetwork((ex.network as NetworkId) ?? "meta");
    setCount(ex.count);
    setError(null);
    setGenerating(false);
    setItems(
      ex.items.map((it, i) => ({
        id: `ex${i}`,
        network: (ex.network as NetworkId) ?? "meta",
        creative: it.creative,
        status: "done" as const,
        verdict: it.verdict,
        ftcFindings: it.ftcFindings,
      })),
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Left — the brief */}
      <div className="lg:sticky lg:top-6">
        <div className="mb-2 flex items-baseline gap-2">
          <h1 className="font-display text-lg font-semibold text-ink">Your offer</h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Creative brief
          </span>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface p-4">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label htmlFor="offer" className="text-sm font-medium text-ink">
                What are you advertising?
              </label>
              <HelpTip k="creative.offer" />
            </div>
            <textarea
              id="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Describe the product or offer — what it is, who it's for, the main benefit. The more specific, the better the variants."
              className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-brand"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-sm font-medium text-ink">Network</span>
              <HelpTip k="creative.network" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setNetwork(n.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    network === n.id
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-paper text-muted hover:border-brand hover:text-brand-ink"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label htmlFor="count" className="text-sm font-medium text-ink">
                How many variants?
              </label>
              <HelpTip k="creative.count" />
            </div>
            <select
              id="count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none focus-visible:border-brand"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !offer.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-ink disabled:opacity-60"
            >
              {generating ? "Generating…" : "Generate compliant ads"}
              <HelpTip k="creative.generate" tone="dark" />
            </button>
            <button
              type="button"
              onClick={loadExample}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand-ink"
            >
              Load example
            </button>
          </div>
        </div>
      </div>

      {/* Right — the variants */}
      <div>
        <div className="mb-2 flex items-baseline gap-2">
          <h1 className="font-display text-lg font-semibold text-ink">Your variants</h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Generated &amp; pre-flighted
          </span>
        </div>

        {error && (
          <div className="rounded-xl border border-block/30 bg-block-soft p-5">
            <h3 className="font-display text-base font-semibold text-block">
              Couldn&apos;t generate
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{error}</p>
          </div>
        )}

        {!error && items.length === 0 && (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/60 p-8 text-center">
            <span className="font-display text-2xl font-bold tracking-tight text-line">
              GENERATE · VERIFY · SHIP
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Describe your offer and press{" "}
              <span className="font-medium text-ink">Generate</span>. Each variant is written to
              pass policy, then run through the same pre-flight check — you ship only the green ones.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((it, i) => (
              <VariantCard
                key={it.id}
                item={it}
                index={i}
                onMakeCompliant={handleMakeCompliant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
