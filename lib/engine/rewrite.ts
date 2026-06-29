// One-shot compliant rewrite. Given a creative and the findings for a single network,
// asks Claude (via the shared structured-output client) to rephrase ONLY the affected
// fields into compliant copy, plus a one-line note on what changed. Never throws — on any
// failure it returns an empty rewrite with an explanatory note so the engine keeps moving.
import { z } from "zod";
import { parseStructured } from "@/lib/llm/client";
import type { Creative, Finding } from "@/schemas/verdict";

// Mirror the Creative fields (all optional — only changed fields come back) + a change note.
const RewriteOutputSchema = z.object({
  headline: z.string().optional(),
  primaryText: z.string().optional(),
  description: z.string().optional(),
  cta: z.string().optional(),
  note: z.string(),
});

const ROLE = [
  "You are a senior paid-ads compliance editor. You rewrite ad creative so it passes",
  "network and FTC review while keeping the marketer's intent, voice, and offer intact.",
  "",
  "Rules:",
  "- Fix ONLY the fields implicated by the findings. Return a field only if you changed it;",
  "  omit fields that need no change.",
  "- Never invent new claims, prices, stats, guarantees, or testimonials. Soften, qualify,",
  "  or remove the non-compliant claim instead (e.g. add 'results vary', drop absolute",
  "  guarantees, replace unverifiable numbers with honest framing).",
  "- Keep each field within its original length budget and tone. Plain, human copy.",
  "- 'note' is ONE short sentence summarizing what you changed and why.",
].join("\n");

// Only keep string fields the schema knows about — defends against an over-eager model.
const CREATIVE_FIELDS = ["headline", "primaryText", "description", "cta"] as const;

export async function rewriteCreative(args: {
  network: string;
  creative: Creative;
  findings: Finding[];
}): Promise<{ rewritten: Partial<Creative>; note: string }> {
  const { network, creative, findings } = args;

  if (!findings.length) {
    return { rewritten: {}, note: `No changes needed — no ${network} findings to address.` };
  }

  const findingsBlock = findings
    .map(
      (f, i) =>
        `${i + 1}. [${f.severity}] ${f.title}\n` +
        `   offending: ${f.evidence}\n` +
        `   why: ${f.why}\n` +
        `   suggested fix: ${f.suggestedFix}`,
    )
    .join("\n");

  const userText = [
    `Network: ${network}`,
    "",
    "Current creative (JSON):",
    JSON.stringify(creative, null, 2),
    "",
    `Findings to resolve (${findings.length}):`,
    findingsBlock,
    "",
    "Return a compliant rewrite of only the affected fields, plus a one-line note.",
  ].join("\n");

  try {
    const out = await parseStructured({
      system: [{ text: ROLE }],
      user: [{ type: "text", text: userText }],
      schema: RewriteOutputSchema,
      maxTokens: 4096, // effort=high + adaptive thinking needs headroom so the rewrite isn't truncated
    });

    const rewritten: Partial<Creative> = {};
    for (const field of CREATIVE_FIELDS) {
      const v = out[field];
      // Only surface a field if the model actually rewrote it and it differs from the original.
      if (typeof v === "string" && v.trim() && v.trim() !== (creative[field] ?? "").trim()) {
        rewritten[field] = v.trim();
      }
    }

    const note =
      out.note?.trim() ||
      (Object.keys(rewritten).length
        ? "Rewrote the affected fields for compliance."
        : "No rewrite was necessary.");

    return { rewritten, note };
  } catch (err) {
    console.error("[rewrite] error:", err);
    return {
      rewritten: {},
      note: "Automatic rewrite unavailable right now — apply each finding's suggested fix manually.",
    };
  }
}
