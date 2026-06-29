// 20 fixture creatives with expected verdicts — the product's correctness gate.
// Coverage: obvious BLOCKs, REVIEW-tier borderlines, CLEAN ads (CLEAR), FTC disclosure,
// and 3 fixtures carrying a landingPageUrl (funnelExpected) for the live funnel path.
import type { Fixture } from "@/scripts/fixtures/types";

export const FIXTURES: Fixture[] = [
  // ───────────────────────── obvious BLOCKs ─────────────────────────
  {
    id: "block_weightloss_clickbait",
    desc: "Classic affiliate weight-loss clickbait — should hard-block everywhere.",
    creative: {
      headline: "Doctors HATE this",
      primaryText: "Doctors HATE this one weird trick — lose 30 lbs in 2 weeks, guaranteed!",
    },
    networks: ["meta", "google", "tiktok", "taboola"],
    landingPageUrl: "https://example.com/weightloss-offer",
    funnelExpected: true,
    expect: {
      perNetworkTier: { meta: "BLOCK", google: "BLOCK", tiktok: "BLOCK", taboola: "BLOCK" },
      mustFlagRuleIds: ["CB-01"],
    },
  },
  {
    id: "block_make_money",
    desc: "Get-rich-quick income claim.",
    creative: {
      primaryText: "Make $500/day from your phone — financial freedom, fire your boss!",
    },
    networks: ["meta", "google", "taboola"],
    expect: {
      perNetworkTier: { meta: "BLOCK", google: "BLOCK", taboola: "BLOCK" },
      ftcTier: "BLOCK",
      mustFlagRuleIds: ["FN-04"],
    },
  },
  {
    id: "block_rx_ed",
    desc: "Prescription drug + erectile-dysfunction full term.",
    creative: {
      primaryText: "Get Ozempic online — no prescription needed. Cure Erectile Dysfunction fast.",
    },
    networks: ["meta", "google", "taboola"],
    expect: {
      perNetworkTier: { meta: "BLOCK", google: "BLOCK", taboola: "BLOCK" },
      mustFlagRuleIds: ["HW-04", "A7"],
    },
  },
  {
    id: "block_crypto",
    desc: "Crypto ICO with guaranteed multiples.",
    creative: {
      primaryText: "Join our ICO — 100x guaranteed, double your money risk-free!",
    },
    networks: ["meta", "google", "tiktok"],
    expect: {
      perNetworkTier: { meta: "BLOCK", google: "BLOCK", tiktok: "BLOCK" },
      mustFlagRuleIds: ["FN-02"],
    },
  },
  {
    id: "block_supplement_disease",
    desc: "Disease cure claim + unsubstantiated proof + clickbait.",
    creative: {
      primaryText: "This herb cures type-2 diabetes — clinically proven, doctors hate this.",
    },
    networks: ["meta", "google", "taboola"],
    expect: {
      perNetworkTier: { meta: "BLOCK", google: "BLOCK", taboola: "BLOCK" },
      mustFlagRuleIds: ["HW-01"],
    },
  },
  {
    id: "block_body_shaming",
    desc: "Body-shaming + appearance-as-life-outcome (TikTok's strictest area).",
    creative: {
      primaryText: "Stop being embarrassed by your flabby arms — get the perfect body and finally feel confident.",
    },
    networks: ["tiktok", "meta"],
    expect: {
      perNetworkTier: { tiktok: "BLOCK", meta: "BLOCK" },
      mustFlagRuleIds: ["BI-01"],
    },
  },
  {
    id: "block_phishing_google",
    desc: "Government impersonation / phishing portal.",
    creative: {
      primaryText: "Official IRS refund portal — log in here to claim your refund.",
    },
    networks: ["google"],
    expect: {
      perNetworkTier: { google: "BLOCK" },
      mustFlagRuleIds: ["A7"],
    },
  },
  {
    id: "block_fake_endorsement",
    desc: "Unauthorized celebrity endorsement + crypto signals.",
    creative: {
      primaryText: "Elon Musk recommends this crypto trading bot — guaranteed 10x picks.",
    },
    networks: ["google", "tiktok", "meta"],
    expect: {
      perNetworkTier: { google: "BLOCK", tiktok: "BLOCK", meta: "BLOCK" },
      mustFlagRuleIds: ["A6"],
    },
  },
  {
    id: "block_before_after",
    desc: "Before/after transformation + dream-body framing.",
    creative: {
      primaryText: "See my before & after — same person, 30 days! Get your dream body.",
    },
    networks: ["tiktok", "meta", "taboola"],
    landingPageUrl: "https://example.com/transformation",
    funnelExpected: true,
    expect: {
      perNetworkTier: { tiktok: "BLOCK", meta: "BLOCK", taboola: "BLOCK" },
      mustFlagRuleIds: ["MF-01", "BA-01"],
    },
  },

  // ───────────────────────── REVIEW-tier ─────────────────────────
  {
    id: "review_structure_function",
    desc: "Borderline structure/function supplement language (med, no high).",
    creative: {
      primaryText: "Our detox blend helps support energy and balance hormones.",
    },
    networks: ["meta"],
    expect: {
      perNetworkTier: { meta: "REVIEW" },
      mustFlagRuleIds: ["HW-02"],
    },
  },
  {
    id: "review_clinically_proven_cosmetic",
    desc: "\"Clinically proven\" cosmetic claim — needs substantiation (med on Meta).",
    creative: {
      primaryText: "Our serum is clinically proven to reduce the look of wrinkles.",
    },
    networks: ["meta"],
    expect: {
      perNetworkTier: { meta: "REVIEW" },
      mustFlagRuleIds: ["EX-03"],
    },
  },
  {
    id: "review_urgency_scarcity",
    desc: "Fake-urgency / scarcity copy (med).",
    creative: {
      primaryText: "Only 3 bottles left — offer ends in 10 minutes!",
    },
    networks: ["meta", "google"],
    expect: {
      perNetworkTier: { meta: "REVIEW", google: "REVIEW" },
      mustFlagRuleIds: ["CB-02"],
    },
  },
  {
    id: "review_clickbait_phrasing",
    desc: "Clickbait phrasing — med on Google, only low on Meta (stays CLEAR there).",
    creative: {
      headline: "You won't believe this",
      primaryText: "Click here to find out more about our service.",
    },
    networks: ["google", "meta"],
    expect: {
      perNetworkTier: { google: "REVIEW", meta: "CLEAR" },
      mustFlagRuleIds: ["B1"],
    },
  },
  {
    id: "review_curiosity_gap_taboola",
    desc: "Curiosity-gap / slide-bait headline (med).",
    creative: {
      headline: "Number 7 will shock you",
      primaryText: "What happened next surprised everyone.",
    },
    networks: ["taboola"],
    expect: {
      perNetworkTier: { taboola: "REVIEW" },
      mustFlagRuleIds: ["D2"],
    },
  },

  // ───────────────────────── CLEAN (CLEAR) ─────────────────────────
  {
    id: "clean_supplement_compliant",
    desc: "Compliant ingredient-based supplement framing with FDA disclaimer present.",
    creative: {
      primaryText:
        "Contains milk thistle, traditionally used to support liver health. These statements have not been evaluated by the FDA.",
    },
    networks: ["meta", "google", "tiktok", "taboola"],
    expect: {
      perNetworkTier: { meta: "CLEAR", google: "CLEAR", tiktok: "CLEAR", taboola: "CLEAR" },
    },
  },
  {
    id: "clean_plain_product",
    desc: "Plain physical-product copy, no claims.",
    creative: {
      headline: "Handmade leather wallet",
      primaryText: "Full-grain leather, ships in 2 days. 30-day returns.",
    },
    networks: ["meta", "google", "taboola"],
    expect: {
      perNetworkTier: { meta: "CLEAR", google: "CLEAR", taboola: "CLEAR" },
    },
  },
  {
    id: "clean_saas",
    desc: "Plain SaaS copy.",
    creative: {
      primaryText: "Project management software for small teams. Start a free trial, no credit card required.",
    },
    networks: ["meta", "google"],
    expect: {
      perNetworkTier: { meta: "CLEAR", google: "CLEAR" },
    },
  },
  {
    id: "clean_fitness_service",
    desc: "Fitness service — no before/after, no body shaming.",
    creative: {
      primaryText: "Join our Pilates studio — first class free. Build strength at your pace.",
    },
    networks: ["meta", "tiktok"],
    expect: {
      perNetworkTier: { meta: "CLEAR", tiktok: "CLEAR" },
    },
  },
  {
    id: "clean_local_service",
    desc: "Local home service, plain copy.",
    creative: {
      primaryText: "Reliable plumbing in Wilmington. Licensed & insured. Call for a free estimate.",
    },
    networks: ["google", "meta"],
    expect: {
      perNetworkTier: { google: "CLEAR", meta: "CLEAR" },
    },
  },

  // ───────────────────────── FTC disclosure path ─────────────────────────
  {
    id: "ftc_missing_affiliate_disclosure",
    desc: "Affiliate link present, no disclosure — clean on Meta copy, FTC flags A1.",
    creative: {
      headline: "My top blender pick",
      primaryText: "Check out my top blender pick! Grab it here: shareasale.com/r/blender",
    },
    networks: ["meta"],
    landingPageUrl: "https://example.com/blender-review",
    funnelExpected: true,
    expect: {
      perNetworkTier: { meta: "CLEAR" },
      ftcTier: "BLOCK",
      mustFlagRuleIds: ["A1"],
    },
  },
];
