// TikTok rule pack — transcribed from research/policy_tiktok.md (US market, 2026).
// Enforcement is multimodal; lexicon triggers are the Layer-1 recall anchor only.
import type { RulePack } from "@/lib/policy/types";

export const TIKTOK: RulePack = {
  network: "tiktok",
  displayName: "TikTok",
  rules: [
    // Health / weight-loss / supplements
    {
      id: "WM-01",
      name: "Exaggerated weight-loss / muscle-gain claims",
      triggers: ["lose 10 lbs", "lbs in", "melt fat", "burn fat fast", "shed pounds", "drop a dress size", "torch", "slim down fast", "shredded in"],
      example: "Melts belly fat in 7 days — guaranteed!",
      severity: "high",
    },
    {
      id: "WM-02",
      name: "\"No diet or exercise needed\" / effortless results",
      triggers: ["without diet or exercise", "no gym", "no effort", "while you sleep", "effortless", "no diet"],
      example: "Lose weight without changing your diet or hitting the gym.",
      severity: "high",
    },
    {
      id: "WM-03",
      name: "Banned weight-management product categories",
      triggers: ["diet pill", "appetite suppressant", "fat burner", "carb blocker", "detox tea", "skinny tea", "meal replacement", "diet shake", "slimming cream", "glp-1", "semaglutide", "ozempic"],
      example: "Our GLP-1 fat-burner gummies suppress appetite all day.",
      severity: "high",
    },
    {
      id: "WM-04",
      name: "Missing 18+ gating on permissible weight claims",
      triggers: ["weight loss no age gate", "no 18+ targeting"],
      example: "Residual weight claim with no 18+ audience restriction.",
      severity: "med",
    },
    {
      id: "WM-05",
      name: "Health / disease cure or unsubstantiated efficacy",
      triggers: ["cures", "treats", "prevents", "clinically proven", "doctor recommended", "dermatologist tested", "scientifically formulated"],
      example: "Clinically proven to cure anxiety and insomnia.",
      severity: "high",
    },
    {
      id: "WM-06",
      name: "Missing required supplement disclaimer (US)",
      // Absence rule: triggers describe the GAP, not the disclaimer text itself
      // (matching "not evaluated by the FDA" would flag copy that DOES carry the disclaimer).
      triggers: ["supplement claim missing disclaimer", "no fda disclaimer present"],
      example: "Supplement claim with no \"not evaluated by the FDA\" disclaimer.",
      severity: "med",
    },
    // Negative body image / appearance
    {
      id: "BI-01",
      name: "Body shaming / \"ideal body type\"",
      triggers: ["flabby", "ugly", "embarrassing body", "fix your body", "ideal body", "perfect body", "dream body", "bikini body"],
      example: "Stop being embarrassed by your flabby arms — get the perfect body.",
      severity: "high",
    },
    {
      id: "BI-02",
      name: "Appearance tied to life outcomes / desirability",
      triggers: ["more attractive", "feel confident", "be popular", "more successful", "find love", "finally feel"],
      example: "Lose 20 lbs and finally feel confident and desirable.",
      severity: "high",
    },
    {
      id: "BI-03",
      name: "Negative social comparison / disordered-eating cues",
      triggers: ["skinny", "thinspo", "cheat your hunger", "starve", "what's your excuse"],
      example: "What's your excuse? Get skinny fast.",
      severity: "high",
    },
    // Misleading / false claims & imagery
    {
      id: "MF-01",
      name: "Before/after imagery or comparison",
      triggers: ["before and after", "before & after", "before/after", "same person, 30 days", "day 1 vs day 30"],
      example: "See my before & after — same person, 30 days!",
      severity: "high",
    },
    {
      id: "MF-02",
      name: "Exaggerated / guaranteed results",
      triggers: ["guaranteed", "100%", "instant", "in 10 seconds", "overnight", "miracle", "number 1 in", "#1 in"],
      example: "Get money in 10 seconds — guaranteed.",
      severity: "high",
    },
    {
      id: "MF-03",
      name: "Clickbait / fake UI elements",
      triggers: ["fake play button", "fake close button", "fake cta", "non-functional"],
      example: "Creative with a fake play button to bait taps.",
      severity: "high",
    },
    {
      id: "MF-04",
      name: "Inconsistent ad ↔ landing page",
      triggers: ["product mismatch", "discount mismatch", "irrelevant destination"],
      example: "Product in ad ≠ product on page.",
      severity: "med",
    },
    {
      id: "MF-05",
      name: "False urgency / scarcity not reflected on page",
      triggers: ["only 3 left", "ends tonight", "countdown"],
      example: "\"Only 3 left\" not honored on landing page.",
      severity: "low",
    },
    {
      id: "MF-06",
      name: "Fake reviews / unauthorized endorsement",
      triggers: ["swears by this", "elon musk swears", "celebrity endorsement", "fabricated testimonial"],
      example: "Elon Musk swears by this token.",
      severity: "high",
    },
    {
      id: "MF-07",
      name: "Malicious competitor comparison",
      triggers: ["competitor violations", "mock competitor", "rivals are scammers"],
      example: "Accuses a competitor of \"violations.\"",
      severity: "med",
    },
    // Financial / make-money / crypto
    {
      id: "FN-01",
      name: "Get-rich-quick / guaranteed returns",
      triggers: ["get rich quick", "passive income guaranteed", "double your money", "risk-free returns", "financial freedom", "guaranteed roi", "easy money"],
      example: "Turn $100 into $10k risk-free — passive income on autopilot.",
      severity: "high",
    },
    {
      id: "FN-02",
      name: "Prohibited financial product categories",
      triggers: ["ico", "cfd", "binary options", "forex signals", "penny stocks", "spread betting", "payday loan", "crypto atm", "downline", "recruit"],
      example: "Trade binary options for fast profits.",
      severity: "high",
    },
    {
      id: "FN-03",
      name: "Crypto without approval / licensing / 18+",
      triggers: ["crypto", "exchange", "wallet", "nft", "100x", "before it moons"],
      example: "Buy $MOON now before it 100x's.",
      severity: "high",
    },
    {
      id: "FN-04",
      name: "Missing financial disclosures",
      triggers: ["loan no apr", "no interest rate shown", "no repayment terms"],
      example: "Loan ad lacking APR, fees, repayment terms.",
      severity: "med",
    },
    {
      id: "FN-05",
      name: "Eligibility / licensing not established",
      triggers: ["no licensed entity", "unregulated provider"],
      example: "Financial-services copy with no licensed entity identifiable.",
      severity: "med",
    },
    // Required disclosures
    {
      id: "DC-01",
      name: "AI-generated content (AIGC) undisclosed",
      triggers: ["ai-generated", "ai voice", "deepfake", "synthetic media"],
      example: "AI voice-clone of a person with no AIGC label.",
      severity: "med",
    },
    {
      id: "DC-02",
      name: "Affiliate / branded-content disclosure",
      triggers: ["affiliate link", "sponsored", "earn a commission"],
      example: "Affiliate creative with no branded-content disclosure.",
      severity: "med",
    },
    // Tone / native-creative expectations
    {
      id: "TN-01",
      name: "Ad-like creative that clashes with native expectation",
      triggers: ["buy now!!!", "limited time only!!!", "shop now!!!"],
      example: "Overly polished hard-sell creative (\"BUY NOW!!!\").",
      severity: "low",
    },
  ],
  sourceUrls: [
    "https://ads.tiktok.com/help/article/tiktok-ads-policy-weight-management",
    "https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content",
    "https://ads.tiktok.com/help/article/tiktok-ads-policy-financial-services",
    "https://ads.tiktok.com/help/article/tiktok-ads-policy-healthcare-pharmaceuticals",
    "https://ads.tiktok.com/help/article/update-to-cosmetic-surgery-na-march-2026",
    "https://seller-us.tiktok.com/university/essay?knowledge_id=1399532709988097",
    "https://newsroom.tiktok.com/en-us/coming-together-to-support-body-positivity-on-tiktok",
  ],
};
