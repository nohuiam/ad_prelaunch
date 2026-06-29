// Layer 2: Claude semantic judge. Returns findings WITHOUT network/score/tier
// (our code attaches network in run_preflight; score.ts computes score/tier).
// Decoupled: resolves its pack via getPack(); if null (B not merged yet) → returns [] (CLEAR).
import { JudgeOutputSchema, type JudgeFinding } from "@/schemas/verdict";
import type { NetworkId, RulePack } from "@/lib/policy/types";
import { parseStructured, type SystemBlock } from "@/lib/llm/client";
import { getPack } from "@/lib/engine/packs";
import { lexiconScan } from "@/lib/engine/lexicon";

export interface JudgeArgs {
  network: NetworkId | "ftc";
  creativeText: string;
  landingText?: string;
  imageBase64?: string; // M6 stretch — accepted now, used once vision lands
}

const ROLE = (displayName: string) =>
  `You are a strict advertising-policy compliance reviewer for ${displayName}. ` +
  `Identify ONLY genuine, likely policy violations in the ad creative (and landing-page text, if given). ` +
  `For each violation: copy the exact offending text into "evidence"; set "severity" (high|med|low) to the ` +
  `policy's severity; write a one-sentence plain-language "why" a non-expert understands; and give a ` +
  `"suggestedFix" that rewrites just that issue compliantly. Set "ruleId" to the matching rule id from the ` +
  `catalog, or "" if it is a real violation not in the catalog. Do NOT invent violations or flag compliant ` +
  `copy. If nothing violates policy, return an empty "findings" array.`;

function renderRules(pack: RulePack): string {
  const lines = pack.rules.map(
    (r) => `- [${r.id}] (${r.severity}) ${r.name} — e.g. ${r.example}`,
  );
  return `POLICY RULE CATALOG for ${pack.displayName}:\n${lines.join("\n")}`;
}

export async function judgeNetwork(args: JudgeArgs): Promise<JudgeFinding[]> {
  const pack = getPack(args.network);
  if (!pack) return []; // packs not merged yet → no findings

  const hits = lexiconScan(`${args.creativeText}\n${args.landingText ?? ""}`, pack);
  const candidateHint =
    hits.length > 0
      ? `Keyword pre-scan flagged these candidates (VERIFY each; do not trust blindly): ` +
        hits.map((h) => `${h.ruleId}:"${h.matched}"`).join(", ")
      : `Keyword pre-scan found no obvious matches — still review for implied/indirect violations.`;

  const system: SystemBlock[] = [
    { text: ROLE(pack.displayName) },
    { text: renderRules(pack), cache: true }, // stable per network → cache (helps repeat runs)
  ];

  const userText =
    `AD CREATIVE:\n${args.creativeText}\n\n` +
    `LANDING PAGE TEXT (may be empty):\n${args.landingText ?? "(none provided)"}\n\n` +
    `${candidateHint}\n\nReturn your findings.`;

  // M6 stretch: when args.imageBase64 is set, append an image content block here.
  const out = await parseStructured({
    system,
    user: [{ type: "text", text: userText }],
    schema: JudgeOutputSchema,
    maxTokens: 16000, // headroom: effort=high + adaptive thinking must not truncate the findings JSON
  });

  return out.findings;
}
