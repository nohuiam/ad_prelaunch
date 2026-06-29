// FROZEN CONTRACT — see handoffs/contracts.md. The seam every session codes against.
import { z } from "zod";

export const SeveritySchema = z.enum(["high", "med", "low"]);

// What the LLM judge returns (NO score/tier/network — those are added by our code).
export const JudgeFindingSchema = z.object({
  ruleId: z.string(), // must match a Rule.id from the network's pack, or "" if novel
  severity: SeveritySchema,
  title: z.string(), // short label, e.g. "Unrealistic income claim"
  evidence: z.string(), // exact offending snippet copied from the ad/LP
  why: z.string(), // plain-language reason (for a non-expert)
  suggestedFix: z.string(), // compliant rephrase of just this issue
});
export const JudgeOutputSchema = z.object({ findings: z.array(JudgeFindingSchema) });

// A finding after our code attaches the network.
export const FindingSchema = JudgeFindingSchema.extend({ network: z.string() });

export const TierSchema = z.enum(["BLOCK", "REVIEW", "CLEAR"]);

export const NetworkVerdictSchema = z.object({
  network: z.string(),
  score: z.number(), // 0–10, computed by score.ts (NOT by the LLM)
  tier: TierSchema,
  findings: z.array(FindingSchema),
});

export const FunnelSchema = z.object({
  fetched: z.boolean(),
  finalUrl: z.string().optional(),
  redirectChain: z.array(z.string()), // each hop URL
  flags: z.array(z.string()), // e.g. "domain_mismatch","unreachable","cloaking_suspected","missing_disclosure"
});

export const PreflightResultSchema = z.object({
  perNetwork: z.array(NetworkVerdictSchema),
  ftc: z.object({ findings: z.array(FindingSchema) }),
  funnel: FunnelSchema,
});

// ---- API request ----
export const CreativeSchema = z.object({
  headline: z.string().max(2000).optional(),
  primaryText: z.string().max(5000),
  description: z.string().max(2000).optional(),
  cta: z.string().max(200).optional(),
});

export const NetworkIdSchema = z.enum(["meta", "google", "tiktok", "taboola"]);

export const PreflightRequestSchema = z.object({
  creative: CreativeSchema,
  landingPageUrl: z.string().url().optional(),
  networks: z.array(NetworkIdSchema).min(1),
  imageBase64: z.string().optional(), // stretch
});

export type Severity = z.infer<typeof SeveritySchema>;
export type JudgeFinding = z.infer<typeof JudgeFindingSchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type Tier = z.infer<typeof TierSchema>;
export type NetworkVerdict = z.infer<typeof NetworkVerdictSchema>;
export type Funnel = z.infer<typeof FunnelSchema>;
export type PreflightResult = z.infer<typeof PreflightResultSchema>;
export type Creative = z.infer<typeof CreativeSchema>;
export type PreflightRequest = z.infer<typeof PreflightRequestSchema>;
