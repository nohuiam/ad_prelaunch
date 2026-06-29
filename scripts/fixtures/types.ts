// Fixture shape for the eval harness. Written against the FROZEN contract so the same
// fixtures run unchanged against the real engine at integration (EVAL_LIVE=1).
import type { Creative, Tier } from "@/schemas/verdict";
import type { NetworkId } from "@/lib/policy/types";

export interface Fixture {
  id: string;
  desc?: string;
  creative: Creative;
  networks: NetworkId[]; // >= 1
  landingPageUrl?: string;
  // When true, the LP can't be deterministically fetched offline; the eval skips funnel
  // assertions in stub mode and only checks funnel once Session D's fetch is wired (live mode).
  funnelExpected?: boolean;
  expect: {
    perNetworkTier: Partial<Record<NetworkId, Tier>>;
    ftcTier?: Tier; // optional: tier derived from result.ftc.findings via scoreFindings
    mustFlagRuleIds?: string[]; // rule ids that must appear somewhere in the verdict
  };
}
