// Indirection between the engine and Session B's rule packs.
// Until B's `lib/policy/index.ts` (PACKS) is merged, getPack returns null and that network
// simply yields no findings (CLEAR). AT INTEGRATION: uncomment the import + the lookup.
import type { RulePack, NetworkId } from "@/lib/policy/types";
// import { PACKS } from "@/lib/policy"; // <-- Session B delivers this (Record<NetworkId|"ftc", RulePack>)

export function getPack(_network: NetworkId | "ftc"): RulePack | null {
  // return PACKS[_network] ?? null; // <-- enable at integration with Session B
  return null;
}
