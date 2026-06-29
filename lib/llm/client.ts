// Shared Anthropic client (lazy) + a structured-output helper.
// Lead (judge) and Session D (rewrite) both call parseStructured so behavior stays consistent.
// Lazy construction: importing this module never throws on a missing key — only an actual call does.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export const MODEL = "claude-opus-4-8";

let _client: Anthropic | null = null;
export function client(): Anthropic {
  if (!_client) _client = new Anthropic(); // reads ANTHROPIC_API_KEY; throws here only when first used
  return _client;
}

export interface SystemBlock {
  text: string;
  cache?: boolean; // set true for stable content (rule packs) — helps on REPEAT runs only
}

/**
 * One structured-output call. Returns the validated object (throws if the model returns null).
 * Note: output_config carries both `effort` and `format`; if a future SDK rejects the pairing,
 * drop `effort` here — adaptive thinking alone still gives strong depth.
 */
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export async function parseStructured<S extends z.ZodType>(opts: {
  system: SystemBlock[];
  user: Anthropic.MessageParam["content"];
  schema: S;
  maxTokens?: number;
  effort?: Effort; // default "high"; use "medium" for cheaper/faster generation
}): Promise<z.infer<S>> {
  const system = opts.system.map((b) =>
    b.cache
      ? { type: "text" as const, text: b.text, cache_control: { type: "ephemeral" as const } }
      : { type: "text" as const, text: b.text },
  );

  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 8192,
    thinking: { type: "adaptive" },
    output_config: { effort: opts.effort ?? "high", format: zodOutputFormat(opts.schema) },
    system,
    messages: [{ role: "user", content: opts.user }],
  });

  if (!res.parsed_output) throw new Error("structured parse returned null output");
  return res.parsed_output;
}
