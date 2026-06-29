// Module 02 (Creative Lab) request/output contracts.
import { z } from "zod";
import { CreativeSchema, NetworkIdSchema } from "@/schemas/verdict";

export const CreativeRequestSchema = z.object({
  offer: z.string().min(1).max(2000),
  network: NetworkIdSchema,
  count: z.number().int().min(1).max(5).default(3),
});

// What the generator returns. Each variant conforms to the same Creative shape the
// pre-flight engine validates, so variants can be sent straight to /api/preflight.
export const GenerateOutputSchema = z.object({
  variants: z.array(CreativeSchema).min(1),
});

export type CreativeRequest = z.infer<typeof CreativeRequestSchema>;
export type GenerateOutput = z.infer<typeof GenerateOutputSchema>;
