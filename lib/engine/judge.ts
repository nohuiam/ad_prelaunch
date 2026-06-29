// Layer 2: Claude semantic judge. Returns findings WITHOUT network/score/tier.
// SPINE STUB — M2 (lead) fills the body:
//   const pack = PACKS[network];                       // Session B
//   const hits = lexiconScan(creativeText, network);   // Layer 1 candidates
//   const { findings } = await parseStructured({
//     system: [{ text: ROLE }, { text: renderRules(pack), cache: true }],
//     user: [{ type: "text", text: renderInput(creativeText, landingText, hits) }, ...image?],
//     schema: JudgeOutputSchema,
//   });
//   return findings;
import type { JudgeFinding } from "@/schemas/verdict";
import type { NetworkId } from "@/lib/policy/types";

export interface JudgeArgs {
  network: NetworkId | "ftc";
  creativeText: string;
  landingText?: string;
  imageBase64?: string;
}

export async function judgeNetwork(_args: JudgeArgs): Promise<JudgeFinding[]> {
  return []; // TODO(M2): real semantic judging via parseStructured + rule packs
}
