// Indirection between the engine and Session B's rule packs (now merged).
import type { RulePack, NetworkId } from "@/lib/policy/types";
import { PACKS } from "@/lib/policy";

export function getPack(network: NetworkId | "ftc"): RulePack | null {
  return PACKS[network] ?? null;
}
