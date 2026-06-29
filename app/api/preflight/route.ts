// POST /api/preflight — validate, run the engine (parallel judges), return PreflightResult.
// Next 16 route handler. Node runtime (Anthropic SDK + node-html-parser need Node, not Edge).
import { PreflightRequestSchema } from "@/schemas/verdict";
import { runPreflight } from "@/lib/engine/run_preflight";
// M3 (Session D): import { checkRateLimit } from "@/lib/llm/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  // M3: rate-limit by IP before doing any work.
  // const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // const rl = checkRateLimit(ip);
  // if (!rl.ok) return Response.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429, headers: rl.retryAfter ? { "retry-after": String(rl.retryAfter) } : undefined });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = PreflightRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await runPreflight(parsed.data);
    return Response.json(result);
  } catch (err) {
    console.error("[preflight] error:", err);
    const message = err instanceof Error ? err.message : "Internal error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
