// Shared Anthropic client + a structured-output helper.
// Lead (judge) and Session D (rewrite) both call parseStructured so behavior stays consistent.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export const MODEL = "claude-opus-4-8";
export const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export interface SystemBlock {
  text: string;
  cache?: boolean; // set true for stable content (rule packs) — helps on REPEAT runs only
}

/**
 * One structured-output call. Returns the validated object (throws if the model returns null).
 * Note: output_config carries both `effort` and `format`; if a future SDK rejects the pairing,
 * drop `effort` here — adaptive thinking alone still gives strong depth.
 */
export async function parseStructured<S extends z.ZodType>(opts: {
  system: SystemBlock[];
  user: Anthropic.MessageParam["content"];
  schema: S;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const system = opts.system.map((b) =>
    b.cache
      ? { type: "text" as const, text: b.text, cache_control: { type: "ephemeral" as const } }
      : { type: "text" as const, text: b.text },
  );

  const res = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(opts.schema) },
    system,
    messages: [{ role: "user", content: opts.user }],
  });

  if (!res.parsed_output) throw new Error("structured parse returned null output");
  return res.parsed_output;
}
