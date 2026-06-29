// FTC rule pack — transcribed from research/policy_ftc.md.
// Authority: 16 CFR Part 255 (Endorsement Guides), FTC Act §5, 16 CFR Part 465 (penalty-bearing).
// FTC findings are cross-cutting (not per-network); engine returns them under result.ftc.
import type { RulePack } from "@/lib/policy/types";

export const FTC: RulePack = {
  network: "ftc",
  displayName: "FTC (US affiliate disclosure & substantiation)",
  rules: [
    // A. Material-connection disclosure
    {
      id: "A1",
      name: "Missing affiliate disclosure",
      triggers: ["affiliate link", "?tag=", "/ref/", "amazon associates", "shareasale", "earn a commission", "commission"],
      example: "\"Buy my #1 recommended blender [affiliate link]\" with no disclosure.",
      severity: "high",
    },
    {
      id: "A2",
      name: "Disclosure not clear & conspicuous (placement)",
      triggers: ["disclosure in footer", "footer disclosure", "behind a disclosure link", "read more disclosure"],
      example: "Affiliate links throughout, disclosure only in footer.",
      severity: "high",
    },
    {
      id: "A3",
      name: "Disclosure unclear / ambiguous wording",
      triggers: ["#partner", "#collab", "#ambassador", "#sp", "#spon", "thanks to"],
      example: "Only label is \"#ambassador\".",
      severity: "med",
    },
    {
      id: "A4",
      name: "Low-contrast / easy-to-miss formatting",
      triggers: ["tiny font disclosure", "low contrast disclosure", "gray-on-white"],
      example: "Disclosure in tiny gray-on-white font.",
      severity: "med",
    },
    {
      id: "A5",
      name: "Disclosure medium mismatch (video/audio)",
      triggers: ["caption-only disclosure", "paid partnership tool only", "description-only disclosure"],
      example: "Video endorsement, disclosure only in the text caption.",
      severity: "med",
    },
    // B. Fake / manipulated reviews & testimonials (Part 465)
    {
      id: "B1",
      name: "Fabricated or AI-generated reviews/testimonials",
      triggers: ["verified buyer", "stock-photo reviewer", "ai-generated review", "purchased reviews"],
      example: "\"Verified buyer Jane D.\" with a stock-photo headshot.",
      severity: "high",
    },
    {
      id: "B2",
      name: "Undisclosed incentivized reviews",
      triggers: ["free product for review", "discount for review", "incentivized review"],
      example: "Reviews obtained via free product without disclosing the incentive.",
      severity: "high",
    },
    {
      id: "B3",
      name: "Conditioned / gated reviews",
      triggers: ["leave a 5-star review", "5-star review to get", "review for a rebate"],
      example: "Leave a 5-star review to get your rebate.",
      severity: "high",
    },
    {
      id: "B4",
      name: "Review suppression / manipulation",
      triggers: ["hide negative reviews", "delete negative reviews", "review hijacking"],
      example: "Hiding/deleting negative reviews.",
      severity: "high",
    },
    {
      id: "B5",
      name: "Paid competitor smears",
      triggers: ["paid negative reviews", "smear competitor", "incentivized competitor attack"],
      example: "Paid negative statements about competitors presented as organic.",
      severity: "med",
    },
    // C. Substantiation & results claims
    {
      id: "C1",
      name: "Atypical results without \"generally expected performance\"",
      triggers: ["i lost 35 lbs", "i lost", "lbs in 3 weeks", "dramatic results"],
      example: "\"I lost 35 lbs in 3 weeks!\" with no generally-expected-results disclosure.",
      severity: "high",
    },
    {
      id: "C2",
      name: "\"Results not typical\" used as the sole fix",
      triggers: ["results not typical", "individual results may vary"],
      example: "Dramatic before/after captioned only \"Results not typical.\"",
      severity: "high",
    },
    {
      id: "C3",
      name: "Unsubstantiated health/disease claims",
      triggers: ["cure", "cures", "cures diabetes", "reverses diabetes", "treats", "clinically proven", "doctor recommended", "fda approved"],
      example: "Reverses diabetes in 30 days — clinically proven.",
      severity: "high",
    },
    {
      id: "C4",
      name: "Unsubstantiated earnings / income claims",
      triggers: ["make $", "/month working", "earn $10,000", "/week working", "members earn"],
      example: "Members earn $10,000/month working part-time.",
      severity: "high",
    },
    {
      id: "C5",
      name: "False \"I personally used it\" claims",
      triggers: ["i personally use", "i use this daily", "i've been using"],
      example: "Endorser represents personal use without basis.",
      severity: "med",
    },
    // D. Deceptive design / dark patterns
    {
      id: "D1",
      name: "Fake countdown timer / fake deadline",
      triggers: ["offer ends in", "countdown", "today only", "timer resets"],
      example: "\"Offer ends in HH:MM:SS\" where the timer resets.",
      severity: "high",
    },
    {
      id: "D2",
      name: "Fake scarcity / inventory pressure",
      triggers: ["only 2 left", "almost sold out", "only 3 left", "selling fast"],
      example: "\"Only 2 left\" not tied to real stock.",
      severity: "med",
    },
    {
      id: "D3",
      name: "Fake social-proof activity",
      triggers: ["people viewing now", "just bought this", "x people are looking"],
      example: "\"Jane just bought this\" popups that are fabricated.",
      severity: "med",
    },
    {
      id: "D4",
      name: "Native-ad / editorial camouflage",
      triggers: ["top 10 honest reviews", "best of review", "honest review", "as seen on"],
      example: "\"Top 10 Honest Reviews\" page that is entirely paid affiliate placements.",
      severity: "high",
    },
    {
      id: "D5",
      name: "Buried disclaimers in dense terms",
      triggers: ["free trial", "auto-renew", "recurring billing", "see terms for details"],
      example: "\"Free trial\" headline; auto-renew $99/mo only in T&C scroll-box.",
      severity: "med",
    },
    // E. Lead-gen specific
    {
      id: "E1",
      name: "Deceptive consent / \"consent farm\" patterns",
      triggers: ["by clicking you agree", "marketing partners", "pre-checked box", "200 partners"],
      example: "\"By clicking you agree\" linking to 200 unnamed marketing partners.",
      severity: "high",
    },
    {
      id: "E2",
      name: "Bait-and-switch lead offers",
      triggers: ["check your eligibility", "resells the lead", "eligibility form"],
      example: "\"Check your eligibility\" form that just resells the lead.",
      severity: "high",
    },
  ],
  sourceUrls: [
    "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255",
    "https://www.ftc.gov/system/files/ftc_gov/pdf/p204500_endorsement_guides_in_2023.pdf",
    "https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising",
    "https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements",
    "https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers",
    "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-465",
  ],
};
