// Input size caps the API route can enforce before spending a model call. Each helper returns
// { ok: true } or { ok: false, error } with a clear, user-facing message. Keeping these here
// (not in the Zod schema) lets the route reject oversized payloads with a friendly 413/400.
import type { Creative } from "@/schemas/verdict";

export const MAX_CREATIVE_BYTES = 5 * 1024; // 5KB of creative text total
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB decoded image

export interface SizeCheck {
  ok: boolean;
  error?: string;
}

function utf8Bytes(s: string): number {
  return Buffer.byteLength(s, "utf8");
}

export function checkCreativeSize(creative: Creative): SizeCheck {
  const total = utf8Bytes(
    [creative.headline, creative.primaryText, creative.description, creative.cta]
      .filter(Boolean)
      .join(""),
  );
  if (total > MAX_CREATIVE_BYTES) {
    return {
      ok: false,
      error: `Creative is too large (${(total / 1024).toFixed(1)}KB). Limit is ${MAX_CREATIVE_BYTES / 1024}KB of text.`,
    };
  }
  return { ok: true };
}

// Estimate decoded bytes from a base64 string without allocating the buffer.
function base64Bytes(b64: string): number {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64; // strip data: URI prefix
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

export function checkImageSize(imageBase64?: string): SizeCheck {
  if (!imageBase64) return { ok: true };
  const bytes = base64Bytes(imageBase64);
  if (bytes > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `Image is too large (${(bytes / (1024 * 1024)).toFixed(1)}MB). Limit is ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
    };
  }
  return { ok: true };
}
