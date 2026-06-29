// Rule-pack registry. The engine (judge + lexicon) and the eval harness read PACKS.
import type { NetworkId, RulePack } from "@/lib/policy/types";
import { META } from "@/lib/policy/meta";
import { GOOGLE } from "@/lib/policy/google";
import { TIKTOK } from "@/lib/policy/tiktok";
import { TABOOLA } from "@/lib/policy/taboola";
import { FTC } from "@/lib/policy/ftc";

export const PACKS: Record<NetworkId | "ftc", RulePack> = {
  meta: META,
  google: GOOGLE,
  tiktok: TIKTOK,
  taboola: TABOOLA,
  ftc: FTC,
};

export { META, GOOGLE, TIKTOK, TABOOLA, FTC };
