// Policy knowledge-base types. FROZEN CONTRACT — see handoffs/contracts.md.
// Session B fills lib/policy/{meta,google,tiktok,taboola,ftc}.ts + index.ts against these.

export type Severity = "high" | "med" | "low";
export type NetworkId = "meta" | "google" | "tiktok" | "taboola";

export interface Rule {
  id: string; // e.g. "PA-01"
  name: string;
  triggers: string[]; // lowercase keyword/phrase strings for the lexicon pre-scan
  example: string; // a 1-line violating example
  severity: Severity;
}

export interface RulePack {
  network: NetworkId | "ftc";
  displayName: string;
  rules: Rule[];
  sourceUrls: string[];
}
