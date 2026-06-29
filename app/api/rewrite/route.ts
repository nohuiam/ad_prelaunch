// POST /api/rewrite — on-demand compliant rewrite of a creative for ONE network.
// Body: { network: string, creative: Creative, findings: Finding[] } → { rewritten, note }.
// Separate from /api/preflight so we only pay for a rewrite when the user asks for one.
import { z } from "zod";
import { CreativeSchema, FindingSchema } from "@/schemas/verdict";
import { rewriteCreative } from "@/lib/engine/rewrite";
import { checkRateLimit } from "@/lib/llm/ratelimit";
import { checkCreativeSize } from "@/lib/llm/limits";

export const runtime = "nodejs";
export const maxDuration = 60;

const RewriteRequestSchema = z.object({
  network: z.string().min(1),
  creative: CreativeSchema,
  findings: z.array(FindingSchema),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return Response.json(
      { error: "Rate limit exceeded. Try again shortly." },
      { status: 429, headers: rl.retryAfter ? { "retry-after": String(rl.retryAfter) } : undefined },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RewriteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const size = checkCreativeSize(parsed.data.creative);
  if (!size.ok) return Response.json({ error: size.error }, { status: 413 });

  try {
    const result = await rewriteCreative(parsed.data);
    return Response.json(result);
  } catch (err) {
    console.error("[rewrite] error:", err);
    const message = err instanceof Error ? err.message : "Internal error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
