// Per-IP rate limiting via an in-memory token bucket: 20 requests per 10 minutes, refilling
// continuously. State lives in this module's Map, so it resets on cold start — acceptable for
// a contest demo on serverless. // productionize: Upstash Redis (durable, shared across instances).
const CAPACITY = 20; // burst size
const WINDOW_MS = 10 * 60 * 1000; // tokens fully refill over 10 minutes
const REFILL_PER_MS = CAPACITY / WINDOW_MS; // tokens added per millisecond
const PRUNE_AFTER_MS = WINDOW_MS * 2; // drop idle buckets so the Map can't grow unbounded

interface Bucket {
  tokens: number;
  last: number; // last refill timestamp (ms)
}

const buckets = new Map<string, Bucket>();
let lastPrune = 0;

function prune(now: number): void {
  if (now - lastPrune < WINDOW_MS) return;
  lastPrune = now;
  for (const [ip, b] of buckets) {
    if (now - b.last > PRUNE_AFTER_MS) buckets.delete(ip);
  }
}

export function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  prune(now);

  let b = buckets.get(ip);
  if (!b) {
    b = { tokens: CAPACITY, last: now };
    buckets.set(ip, b);
  } else {
    // Refill based on elapsed time since we last touched this bucket.
    // Clamp to >=0 so a backward clock jump (NTP) can't drain tokens.
    const elapsed = Math.max(0, now - b.last);
    b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_MS);
    b.last = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { ok: true };
  }

  // Not enough for one request — tell the caller when a token will be available (seconds).
  const retryAfter = Math.max(1, Math.ceil((1 - b.tokens) / REFILL_PER_MS / 1000));
  return { ok: false, retryAfter };
}

// Test/ops hook — clears all buckets (used by the local harness; harmless in prod).
export function resetRateLimits(): void {
  buckets.clear();
  lastPrune = 0;
}
