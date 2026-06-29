// Module 02: compliance-aware ad-variant generator.
// We feed the target network's policy rules INTO the generator so variants are likely-clean
// BEFORE verification — then the client independently pre-flights each one. Generation is the
// draft; the pre-flight engine is the guarantee.
import { GenerateOutputSchema } from "@/schemas/creative";
import type { Creative } from "@/schemas/verdict";
import type { NetworkId } from "@/lib/policy/types";
import { PACKS } from "@/lib/policy";
import { parseStructured, type SystemBlock } from "@/lib/llm/client";

const NETWORK_NORMS: Record<NetworkId, string> = {
  meta: "Meta (Facebook/Instagram) feed ads: a scroll-stopping primary text (1–3 short sentences), a punchy headline (~40 chars), and a CTA. Conversational and benefit-led.",
  google:
    "Google Search ads: tight, keyword-relevant headlines (~30 chars) and a clear description (~90 chars). Direct, no clickbait or sensationalism.",
  tiktok:
    "TikTok in-feed ads: native, sound-on, hook-first energy in the primary text (casual, first-person, UGC tone), a short headline, and a casual CTA.",
  taboola:
    "Taboola native ads: a curiosity-driven but HONEST headline (~60 chars) and a primary text that reads like an article teaser. No fake scarcity, no shock bait.",
};

const ROLE =
  "You are a senior direct-response copywriter who writes high-converting ad creative that ALSO " +
  "passes network policy review on the first try. Write compelling, specific, benefit-led copy with a " +
  "distinct angle per variant. You NEVER use prohibited patterns: no guarantees or absolute outcomes, " +
  "no disease cure/treat/reverse claims, no 'doctors hate this' / 'one weird trick', no before/after, " +
  "no get-rich-quick or income guarantees, no fake urgency/scarcity, no unsubstantiated 'clinically proven'. " +
  "Keep claims honest and qualified (e.g. 'may help', 'results vary').";

function renderAvoid(network: NetworkId): string {
  const pack = PACKS[network];
  const lines = pack.rules.map((r) => `- [${r.id}] ${r.name} (e.g. "${r.example}")`);
  return `AVOID every one of these ${pack.displayName} policy violations:\n${lines.join("\n")}`;
}

export async function generateVariants(args: {
  offer: string;
  network: NetworkId;
  count: number;
}): Promise<Creative[]> {
  const system: SystemBlock[] = [
    { text: ROLE },
    { text: renderAvoid(args.network), cache: true }, // stable per network → cached
  ];

  const user = [
    {
      type: "text" as const,
      text:
        `OFFER / PRODUCT:\n${args.offer}\n\n` +
        `Write ${args.count} DISTINCT, ready-to-run ad variants for ${NETWORK_NORMS[args.network]}\n` +
        `Each variant needs: a headline, a primaryText, and a short cta. Use a different angle/hook for each. ` +
        `Return JSON: {"variants":[{"headline":"…","primaryText":"…","cta":"…"}, …]}.`,
    },
  ];

  const out = await parseStructured({
    system,
    user,
    schema: GenerateOutputSchema,
    effort: "medium", // generation needn't be max-depth; faster + cheaper
    maxTokens: 4096,
  });

  return out.variants.slice(0, args.count);
}
