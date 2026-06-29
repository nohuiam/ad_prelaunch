// Guided-help registry. One entry per control and per result element.
// Voice: plain, specific, written for a non-expert running ads — never jargon.
// Keys are referenced by <HelpTip k="..."/> throughout the UI.

export interface HelpEntry {
  title: string;
  body: string;
}

export const help: Record<string, HelpEntry> = {
  // ── Input fields ─────────────────────────────────────────────────────────
  "field.headline": {
    title: "Headline",
    body: "The bold line people read first. Networks scan it hardest, so over-the-top claims here are the fastest way to get flagged.",
  },
  "field.primaryText": {
    title: "Primary text",
    body: "The main body of your ad — the paragraph above or below the image. Paste exactly what you plan to run, typos and all, so the check matches what reviewers see.",
  },
  "field.description": {
    title: "Description",
    body: "The smaller line under the headline (Meta and Google show this). Optional, but worth checking — claims hide here too.",
  },
  "field.cta": {
    title: "Call to action",
    body: "The button text, like “Shop Now” or “Learn More.” Some phrases (“Claim now,” “Act fast”) read as pressure and draw extra scrutiny.",
  },
  "field.landingPageUrl": {
    title: "Landing page URL",
    body: "Where the ad sends people after they click. We follow the link, check where it really lands, and look for missing disclosures — a common reason accounts get banned.",
  },
  "field.networks": {
    title: "Networks",
    body: "Pick every platform you plan to run this ad on. Each has its own rules, so the same ad can be fine on one and blocked on another. Choose at least one.",
  },
  "field.image": {
    title: "Image (optional)",
    body: "Attach the ad creative if you have it. Image checks are coming soon — for now we focus on your text and landing page.",
  },

  // ── Actions ──────────────────────────────────────────────────────────────
  "action.run": {
    title: "Run Pre-Flight",
    body: "Scores your ad against each network's rules and the FTC, then shows what to fix. Nothing is published — this is a private check.",
  },
  "action.loadExample": {
    title: "Load example",
    body: "Fills the form with a deliberately risky affiliate ad so you can see a full report without typing anything. Great for your first run.",
  },
  "action.helpMode": {
    title: "Help mode",
    body: "Turn this on to show every hint inline at once, instead of hovering each ⓘ. Turn it off for a cleaner screen once you know your way around.",
  },
  "action.onboarding": {
    title: "How it works",
    body: "Reopen the quick three-step intro anytime.",
  },

  // ── Verdict + scoring ────────────────────────────────────────────────────
  "result.verdict": {
    title: "Overall clearance",
    body: "Your launch decision at a glance. It reflects the riskiest network — if any platform says stop, the whole verdict says stop.",
  },
  "result.score": {
    title: "Risk score (0–10)",
    body: "How risky this ad looks on this network. Higher is worse. The score adds up the issues we found, weighted by how serious each one is.",
  },
  "result.tier.BLOCK": {
    title: "BLOCK — do not launch",
    body: "High chance this gets your ad account suspended. Fix the red items before you launch anything on this network.",
  },
  "result.tier.REVIEW": {
    title: "REVIEW — fix before launching",
    body: "Likely to be rejected or to draw a warning. Clean up these items first; you probably won't get banned, but it may not run as-is.",
  },
  "result.tier.CLEAR": {
    title: "CLEAR — good to go",
    body: "Nothing flagged on this network. Always use your own judgment, but this ad looks safe to launch here.",
  },

  // ── Findings ─────────────────────────────────────────────────────────────
  "result.severity.high": {
    title: "High severity",
    body: "A likely account-level problem. Treat these as must-fix before launch.",
  },
  "result.severity.med": {
    title: "Medium severity",
    body: "Could get the ad rejected or limited. Worth fixing now to avoid back-and-forth.",
  },
  "result.severity.low": {
    title: "Low severity",
    body: "Minor — unlikely to cause a ban, but cleaning it up makes the ad stronger.",
  },
  "result.evidence": {
    title: "What triggered this",
    body: "The exact words from your ad or landing page that set off the rule. Search for this snippet to find and change it.",
  },
  "result.why": {
    title: "Why it matters",
    body: "Plain-language reason the network or the FTC cares about this, so you can decide how to handle it.",
  },
  "result.fix": {
    title: "Suggested fix",
    body: "A compliant way to say the same thing. Use it as a starting point — adjust the wording to your voice.",
  },

  // ── FTC ──────────────────────────────────────────────────────────────────
  "result.ftc": {
    title: "FTC check",
    body: "U.S. truth-in-advertising rules apply on every network. These are about honesty and disclosure — like telling people when you earn a commission.",
  },

  // ── Funnel ───────────────────────────────────────────────────────────────
  "result.funnel": {
    title: "Landing-page check",
    body: "What happens after the click. We follow your link and inspect where it really sends people and what's on the page.",
  },
  "result.funnel.redirectChain": {
    title: "Redirect path",
    body: "Every hop between your link and the final page. Long or sneaky chains are a classic cloaking signal that gets accounts banned.",
  },
  "result.funnel.finalUrl": {
    title: "Final destination",
    body: "The page people actually land on after all redirects. If it doesn't match what your ad promises, that's a problem.",
  },
  "result.funnel.flags": {
    title: "Landing-page flags",
    body: "Specific issues we spotted on the path or page — for example a domain that doesn't match your ad, or a missing disclosure.",
  },
};

// Funnel flag codes are emitted by the engine; translate them to plain labels.
export const funnelFlagLabels: Record<string, string> = {
  domain_mismatch: "Final domain doesn't match the ad",
  unreachable: "Landing page couldn't be reached",
  cloaking_suspected: "Looks like cloaking (hidden redirects)",
  missing_disclosure: "No disclosure found on the page",
};
