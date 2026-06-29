// Landing-page / funnel scanner. Fetches the destination URL, follows redirects by hand
// (recording every hop), strips the HTML to plain text, and derives risk flags. An
// unreachable or cloaked page is itself a signal, so this module NEVER throws — every
// failure path returns a well-formed Funnel with the relevant flags instead.
import { parse } from "node-html-parser";
import type { Funnel } from "@/schemas/verdict";

const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_000_000; // 1MB response cap
const MAX_TEXT_CHARS = 32_000; // ~8K tokens of stripped text
const MAX_HOPS = 10;
const TINY_BODY_CHARS = 200; // a "page" this short is suspicious

// Lowercase markers that signal the page carries the disclosures advertisers are expected to.
const DISCLOSURE_MARKERS = [
  "advertis", // advertisement / advertising / advertiser
  "sponsored",
  "affiliate",
  "results not typical",
  "privacy",
];

// Phrases that betray a parked / for-sale placeholder rather than a real funnel.
const PARKED_MARKERS = [
  "domain is for sale",
  "this domain is for sale",
  "buy this domain",
  "the domain may be for sale",
  "this domain may be for sale",
  "domain parking",
  "domain for sale",
  "parked free",
  "hugedomains",
  "sedoparking",
  "godaddy.com/domainsearch",
];

type FetchResult = {
  fetched: boolean;
  finalUrl?: string;
  redirectChain: string[];
  flags: string[];
  text: string;
};

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function unreachable(redirectChain: string[], finalUrl?: string): FetchResult {
  return { fetched: false, finalUrl, redirectChain, flags: ["unreachable"], text: "" };
}

// Read the response body but stop once we cross the 1MB cap (defensive against huge pages).
async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return await res.text();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (received >= MAX_BYTES) {
        await reader.cancel().catch(() => {});
        break;
      }
    }
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
}

export async function fetchLandingPage(url: string): Promise<Funnel & { text: string }> {
  const redirectChain: string[] = [];

  // Validate the input URL up front; an unparseable URL is just unreachable.
  let current: string;
  try {
    current = new URL(url).toString();
  } catch {
    return unreachable(redirectChain);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let finalRes: Response | null = null;

    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      redirectChain.push(current);

      let res: Response;
      try {
        res = await fetch(current, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent": DESKTOP_UA,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
      } catch {
        // network error / abort / DNS failure — but keep the hops we recorded.
        return unreachable(redirectChain, redirectChain[redirectChain.length - 1]);
      }

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) {
          finalRes = res; // redirect without a target — treat this as the terminal response
          break;
        }
        let next: string;
        try {
          next = new URL(loc, current).toString();
        } catch {
          return unreachable(redirectChain, current);
        }
        if (redirectChain.includes(next)) {
          // redirect loop — unreachable, but the cross-domain hops still inform cloaking below.
          return finalizeUnreachableLoop(redirectChain);
        }
        current = next;
        continue;
      }

      finalRes = res;
      break;
    }

    if (!finalRes) {
      // Exhausted MAX_HOPS without a terminal response — excessive redirection.
      return finalizeUnreachableLoop(redirectChain);
    }

    const finalUrl = current;
    const ok2xx = finalRes.status >= 200 && finalRes.status < 300;

    let html = "";
    if (ok2xx) {
      try {
        html = await readCapped(finalRes);
      } catch {
        return unreachable(redirectChain, finalUrl);
      }
    } else {
      // Drain/close the body so the connection is released; non-2xx => unreachable.
      await finalRes.body?.cancel().catch(() => {});
    }

    return buildResult({ redirectChain, finalUrl, html, ok2xx });
  } finally {
    clearTimeout(timer);
  }
}

// A loop / hop-exhaustion is unreachable, but we still surface cross-domain hopping as cloaking.
function finalizeUnreachableLoop(redirectChain: string[]): FetchResult {
  const flags = new Set<string>(["unreachable"]);
  if (countCrossDomainHops(redirectChain) >= 2) flags.add("cloaking_suspected");
  if (hostsMismatch(redirectChain)) flags.add("domain_mismatch");
  return {
    fetched: false,
    finalUrl: redirectChain[redirectChain.length - 1],
    redirectChain,
    flags: [...flags],
    text: "",
  };
}

function countCrossDomainHops(chain: string[]): number {
  let crossings = 0;
  for (let i = 1; i < chain.length; i++) {
    if (hostOf(chain[i]) && hostOf(chain[i]) !== hostOf(chain[i - 1])) crossings++;
  }
  return crossings;
}

function hostsMismatch(chain: string[]): boolean {
  const first = hostOf(chain[0]);
  const last = hostOf(chain[chain.length - 1]);
  return Boolean(first) && Boolean(last) && first !== last;
}

function buildResult(args: {
  redirectChain: string[];
  finalUrl: string;
  html: string;
  ok2xx: boolean;
}): FetchResult {
  const { redirectChain, finalUrl, html, ok2xx } = args;
  const flags = new Set<string>();

  // --- Extract text + external-link signal from the parsed DOM ---
  // Use the parser's safe defaults: script/style/noscript content stays opaque (block text),
  // so removing those nodes cleanly drops their text without parsing JS/CSS as markup.
  let text = "";
  let externalLinks = 0;
  const finalHost = hostOf(finalUrl);
  if (html) {
    try {
      const root = parse(html);
      root.querySelectorAll("script, style, noscript, template, svg").forEach((n) => n.remove());
      const body = root.querySelector("body") ?? root;
      text = body.structuredText.replace(/\n{3,}/g, "\n\n").trim();
      if (text.length > MAX_TEXT_CHARS) text = text.slice(0, MAX_TEXT_CHARS);

      for (const a of root.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href") ?? "";
        if (!/^https?:/i.test(href)) continue;
        const h = hostOf(href);
        if (h && finalHost && h !== finalHost) externalLinks++;
      }
    } catch {
      text = "";
    }
  }

  const hasText = text.trim().length > 0;
  const reachable = ok2xx && hasText;

  // --- Chain-derived flags (valid even when the body was unreadable) ---
  if (hostsMismatch(redirectChain)) flags.add("domain_mismatch");
  if (countCrossDomainHops(redirectChain) >= 2) flags.add("cloaking_suspected");

  // --- Content-derived flags: ONLY assert these when we actually read a body.
  // Claiming "missing_disclosure" or "parked" about a page we never received is a false signal.
  if (hasText) {
    const lowered = text.toLowerCase();
    if (text.length < TINY_BODY_CHARS && externalLinks === 1) flags.add("cloaking_suspected");
    if (PARKED_MARKERS.some((m) => lowered.includes(m))) flags.add("parked");
    if (!DISCLOSURE_MARKERS.some((m) => lowered.includes(m))) flags.add("missing_disclosure");
  }

  if (!reachable) flags.add("unreachable");

  return {
    fetched: reachable,
    finalUrl,
    redirectChain,
    flags: [...flags],
    text,
  };
}
