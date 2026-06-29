// Layer 1: deterministic keyword/phrase pre-scan. Cheap recall that anchors the judge.
// Pure function (takes a RulePack) so it's decoupled from how packs are sourced.
import type { RulePack } from "@/lib/policy/types";

export interface LexiconHit {
  ruleId: string;
  matched: string; // the trigger phrase that fired
  severity: string;
}

export function lexiconScan(text: string, pack: RulePack): LexiconHit[] {
  const hay = text.toLowerCase();
  const hits: LexiconHit[] = [];
  const seen = new Set<string>();
  for (const rule of pack.rules) {
    for (const trigger of rule.triggers) {
      const t = trigger.toLowerCase().trim();
      if (!t) continue;
      if (hay.includes(t)) {
        const key = `${rule.id}::${t}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({ ruleId: rule.id, matched: trigger, severity: rule.severity });
        }
      }
    }
  }
  return hits;
}
