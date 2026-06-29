# Ad Prelaunch

**Check your ad against network and FTC policy before you spend a dollar — or risk your account.**

**▶ Live demo: https://adprelaunch.vercel.app**

Paste your headline, body, CTA, and landing-page URL. In seconds you get a per-network verdict —
**BLOCK**, **REVIEW**, or **CLEAR** — with the exact offending words, why each one trips policy, and a
compliant rewrite you can copy straight back into your ad manager.

---

## What it does

Ad Prelaunch is a pre-flight compliance check for paid social and native ads. Before your creative ever
reaches a review queue, it tells you:

- **Where you'll get flagged** — line by line, per network (Meta, Google, TikTok, Taboola) and against
  FTC advertising rules, each issue tagged **high / med / low**.
- **Why** — in plain language a non-lawyer can act on, not a policy-doc link dump.
- **How to fix it** — a compliant rewrite of just the affected fields, generated on request, that keeps
  your offer and voice intact.
- **What's behind the click** — it follows your landing-page redirects, reads the destination, and flags
  funnel risks: domain mismatches, cloaking patterns, missing disclosures, parked or unreachable pages.

The output is a single verdict you can read in one glance and act on in one minute.

## Why this problem

For an affiliate or performance marketer, **a banned ad account is the number-one business threat.** It
isn't a rejected ad — it's a frozen pixel, a dead audience, lost spend, and sometimes a permanent ban
that takes the whole business with it. The rules are sprawling, they differ per network, they change
without notice, and the penalty for guessing wrong is severe and often irreversible.

Today the only "check" is to submit and pray, or to have done it long enough to have the rules in your
head. Ad Prelaunch puts that insider judgment — the pattern-matching a seasoned media buyer does
instinctively — in front of every ad, every time, before money is on the line. It's the difference
between catching a problem in a draft and catching it after your account is gone.

## How to use

1. **Add your key.** Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.
2. **Run it.** `npm install && npm run dev`, then open the app.
3. **Paste your creative.** Headline, primary text, description, and CTA — whatever you have.
4. **Add the landing-page URL** (optional but recommended — the funnel scan catches risks the copy alone
   can't show).
5. **Pick your networks** and run the check.
6. **Read the verdict.** Each network gets a tier and a list of findings with evidence, reasoning, and a
   fix. Ask for a rewrite on any flagged network to get compliant copy back.

Tiers at a glance: **BLOCK** = will almost certainly be rejected, fix before submitting. **REVIEW** =
borderline, a human should look. **CLEAR** = no policy issues detected.

## What's next

The compliance check is the first surface of a broader **operating layer for ad launches** — the
repeatable, accountable workflow between "I wrote an ad" and "money is live":

- **More networks and verticals** — Snap, Pinterest, Reddit, plus regulated categories (finance, health,
  crypto) where the rules are strictest and the bans hurt most.
- **Image and video creative** — extend the judge to on-creative text, thumbnails, and claims made in
  visuals, not just copy.
- **Account-history awareness** — weight findings by what a given network has actually rejected before.
- **A cheaper triage tier** — route the obvious-pass and obvious-fail cases through **Haiku 4.5** first
  and reserve the deep semantic judge for the genuinely borderline ads. Most ads are easy calls; spending
  a flagship model on every one is wasteful. Triage keeps the check fast and the cost-per-check low enough
  to run on every draft, which is the whole point.
- **Pre-launch checklist + audit trail** — disclosures, landing-page parity, and a record of what was
  checked, so a team can prove diligence.

## Tech notes

A two-layer engine, deliberately:

- **Layer 1 — deterministic lexicon pre-scan.** A curated keyword/phrase lexicon per network surfaces
  candidate violations instantly and for free. Cheap, transparent, and it never misses the obvious stuff.
- **Layer 2 — Claude Opus 4.8 semantic judge.** The model reads the creative (and the landing-page text)
  in context, catches what keywords can't — implication, tone, unstated guarantees — and returns
  **structured output** validated against a fixed schema, so the result is always machine-readable.

Scoring is **deterministic**: each finding carries a severity weight, the per-network score is a fixed
sum capped at 10, and the BLOCK/REVIEW/CLEAR tier comes from frozen thresholds — the same input always
yields the same verdict, no model coin-flips on the score.

The **funnel scan** fetches the landing page with a real browser User-Agent, follows every redirect by
hand and records the chain, strips the HTML to text, and derives risk flags (domain mismatch, cloaking,
missing disclosure, parked/unreachable). An unreachable or evasive page is treated as a signal, not an
error — the scanner never throws.

Hardening: per-IP rate limiting and request size caps guard the API; the model is only ever asked for
structured output, never freeform.

---

*We hold ourselves to the standard we enforce — no deceptive UI in this tool.*
