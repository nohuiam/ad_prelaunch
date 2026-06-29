// POST /api/creative — generate N compliance-aware ad variants for one network.
// Generation ONLY (short, well under maxDuration). The client then pre-flights each variant
// via the existing /api/preflight, so verification stays in its own short function invocations.
import { CreativeRequestSchema } from "@/schemas/creative";
import { generateVariants } from "@/lib/engine/generate";
import { checkRateLimit } from "@/lib/llm/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const parsed = CreativeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const variants = await generateVariants(parsed.data);
    return Response.json({ variants });
  } catch (err) {
    console.error("[creative] error:", err);
    const message = err instanceof Error ? err.message : "Internal error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
