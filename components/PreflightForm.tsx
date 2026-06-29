"use client";

import {
  cloneElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { PreflightRequest } from "@/schemas/verdict";
import { HelpTip } from "@/components/HelpTip";

const NETWORKS: { id: "meta" | "google" | "tiktok" | "taboola"; label: string }[] =
  [
    { id: "meta", label: "Meta" },
    { id: "google", label: "Google" },
    { id: "tiktok", label: "TikTok" },
    { id: "taboola", label: "Taboola" },
  ];

type NetworkId = (typeof NETWORKS)[number]["id"];

const EXAMPLE = {
  headline: "Doctors HATE this one weird trick",
  primaryText:
    "Reverse diabetes in 30 days — clinically proven! Thousands have already ditched their meds using this at-home secret. Tap the link before Big Pharma gets it banned.",
  description: "Clinically proven at-home method",
  cta: "Claim Yours Now",
  landingPageUrl: "https://healthnews-today.example/article",
  networks: ["meta", "google", "tiktok", "taboola"] as NetworkId[],
};

export function PreflightForm({
  onRun,
  running,
}: {
  onRun: (req: PreflightRequest, fromExample: boolean) => void;
  running: boolean;
}) {
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [description, setDescription] = useState("");
  const [cta, setCta] = useState("");
  const [url, setUrl] = useState("");
  const [networks, setNetworks] = useState<NetworkId[]>(["meta"]);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageName, setImageName] = useState<string | undefined>();

  const [loadedExample, setLoadedExample] = useState(false);
  const [errors, setErrors] = useState<{
    primaryText?: string;
    networks?: string;
    url?: string;
  }>({});

  // Any manual edit means this is no longer "the example" run.
  function edited<T>(setter: (v: T) => void) {
    return (v: T) => {
      setLoadedExample(false);
      setter(v);
    };
  }

  function toggleNetwork(id: NetworkId) {
    setLoadedExample(false);
    setNetworks((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  }

  function loadExample() {
    setHeadline(EXAMPLE.headline);
    setPrimaryText(EXAMPLE.primaryText);
    setDescription(EXAMPLE.description);
    setCta(EXAMPLE.cta);
    setUrl(EXAMPLE.landingPageUrl);
    setNetworks(EXAMPLE.networks);
    setImageBase64(undefined);
    setImageName(undefined);
    setErrors({});
    setLoadedExample(true);
  }

  function onImage(file: File | undefined) {
    setLoadedExample(false);
    if (!file) {
      setImageBase64(undefined);
      setImageName(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      // Keep just the base64 payload (drop the data: prefix).
      setImageBase64(result.split(",")[1] ?? undefined);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const next: typeof errors = {};
    if (primaryText.trim().length === 0) {
      next.primaryText = "Paste your ad's primary text to run a check.";
    }
    if (networks.length === 0) {
      next.networks = "Pick at least one network.";
    }
    if (url.trim().length > 0) {
      try {
        new URL(url.trim());
      } catch {
        next.url = "That doesn't look like a full URL (include https://).";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (running) return;
    if (!validate()) return;

    const req: PreflightRequest = {
      creative: {
        primaryText: primaryText.trim(),
        ...(headline.trim() ? { headline: headline.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(cta.trim() ? { cta: cta.trim() } : {}),
      },
      networks,
      ...(url.trim() ? { landingPageUrl: url.trim() } : {}),
      ...(imageBase64 ? { imageBase64 } : {}),
    };
    onRun(req, loadedExample);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
      noValidate
    >
      <Field label="Primary text" helpKey="field.primaryText" required error={errors.primaryText}>
        <textarea
          value={primaryText}
          onChange={(e) => edited(setPrimaryText)(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="Paste the main body of your ad exactly as you'll run it…"
          className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Headline" helpKey="field.headline">
        <input
          type="text"
          value={headline}
          onChange={(e) => edited(setHeadline)(e.target.value)}
          maxLength={2000}
          placeholder="The bold first line"
          className={inputCls}
        />
      </Field>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Description" helpKey="field.description">
          <input
            type="text"
            value={description}
            onChange={(e) => edited(setDescription)(e.target.value)}
            maxLength={2000}
            placeholder="The smaller line below"
            className={inputCls}
          />
        </Field>
        <Field label="Call to action" helpKey="field.cta">
          <input
            type="text"
            value={cta}
            onChange={(e) => edited(setCta)(e.target.value)}
            maxLength={200}
            placeholder="e.g. Shop Now"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Landing page URL" helpKey="field.landingPageUrl" error={errors.url}>
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => edited(setUrl)(e.target.value)}
          placeholder="https://example.com/offer"
          className={inputCls}
        />
      </Field>

      {/* networks */}
      <fieldset className="mt-4">
        <div className="flex flex-wrap items-center gap-x-1.5">
          <legend className="text-sm font-medium text-ink">Networks</legend>
          <HelpTip k="field.networks" />
          <span className="ml-1 text-xs text-block" aria-hidden>
            *
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {NETWORKS.map((n) => {
            const on = networks.includes(n.id);
            return (
              <button
                key={n.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleNetwork(n.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-muted hover:border-brand hover:text-brand-ink"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </div>
        {errors.networks && <ErrorText>{errors.networks}</ErrorText>}
      </fieldset>

      {/* image (stretch — wired, can no-op until vision lands) */}
      <Field label="Image" helpKey="field.image">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-brand-ink">
            <span aria-hidden>＋</span>
            {imageName ? "Replace image" : "Attach image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onImage(e.target.files?.[0])}
            />
          </label>
          {imageName && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="max-w-[10rem] truncate font-mono">{imageName}</span>
              <button
                type="button"
                onClick={() => onImage(undefined)}
                className="rounded text-block hover:underline"
              >
                remove
              </button>
            </span>
          )}
        </div>
      </Field>

      {/* actions */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Running…
            </>
          ) : (
            <>Run Pre-Flight</>
          )}
        </button>
        <button
          type="button"
          onClick={loadExample}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-ink disabled:opacity-60"
        >
          Load example
        </button>
        <span className="self-center">
          <HelpTip k="action.loadExample" side="top" />
        </span>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

function Field({
  label,
  helpKey,
  required,
  error,
  children,
}: {
  label: string;
  helpKey: string;
  required?: boolean;
  error?: string;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  // Wire the single input child to its label and any error message.
  const control = cloneElement(children, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  });
  return (
    <div className="mt-4 first:mt-0">
      <div className="mb-1.5 flex flex-wrap items-center gap-x-1.5">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {required && (
          <span className="text-xs text-block" aria-hidden>
            *
          </span>
        )}
        <HelpTip k={helpKey} />
      </div>
      {control}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs font-medium text-block"
    >
      {children}
    </p>
  );
}
