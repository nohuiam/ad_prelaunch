// Layer 1: deterministic keyword/phrase pre-scan. Cheap recall that anchors the judge.
// SPINE STUB — M2 (lead) fills the body: scan text against PACKS[network].rules[].triggers
// (from Session B's lib/policy/index.ts) and return candidate hits the judge confirms/denies.
import type { NetworkId } from "@/lib/policy/types";

export interface LexiconHit {
  ruleId: string;
  matched: string; // the trigger phrase that fired
}

export function lexiconScan(_text: string, _network: NetworkId | "ftc"): LexiconHit[] {
  return []; // TODO(M2): real keyword/regex scan against the network's rule pack
}
