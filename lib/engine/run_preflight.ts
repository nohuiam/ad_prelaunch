// Engine entry point. Route AND eval both call this. Parallel judges (Promise.all).
// SPINE SKELETON — wiring is real; judge/lexicon bodies land in M2, fetchLandingPage in M3.
import {
  PreflightRequestSchema,
  type PreflightRequest,
  type PreflightResult,
  type Finding,
  type Funnel,
  type NetworkVerdict,
} from "@/schemas/verdict";
import { judgeNetwork } from "@/lib/engine/judge";
import { scoreFindings } from "@/lib/engine/score";
// M3 (Session D): import { fetchLandingPage } from "@/lib/engine/fetch_landing_page";

function creativeToText(c: PreflightRequest["creative"]): string {
  return [c.headline, c.primaryText, c.description, c.cta].filter(Boolean).join("\n");
}

function defaultFunnel(): Funnel {
  return { fetched: false, redirectChain: [], flags: [] };
}

export async function runPreflight(input: PreflightRequest): Promise<PreflightResult> {
  const req = PreflightRequestSchema.parse(input);
  const creativeText = creativeToText(req.creative);

  // M3: wire the real landing-page fetch (Session D's fetchLandingPage).
  const funnel: Funnel = defaultFunnel();
  const landingText: string | undefined = undefined;
  // if (req.landingPageUrl) {
  //   const lp = await fetchLandingPage(req.landingPageUrl);
  //   funnel = lp; landingText = lp.text;
  // }

  type Target = PreflightRequest["networks"][number] | "ftc";
  const targets: Target[] = [...req.networks, "ftc"];

  const judged = await Promise.all(
    targets.map(async (t) => {
      const raw = await judgeNetwork({
        network: t,
        creativeText,
        landingText,
        imageBase64: t === "ftc" ? undefined : req.imageBase64,
      });
      const findings: Finding[] = raw.map((f) => ({ ...f, network: t }));
      return { target: t, findings };
    }),
  );

  const perNetwork: NetworkVerdict[] = judged
    .filter((j) => j.target !== "ftc")
    .map(({ target, findings }) => ({ network: target, ...scoreFindings(findings), findings }));

  const ftc = { findings: judged.find((j) => j.target === "ftc")?.findings ?? [] };

  return { perNetwork, ftc, funnel };
}
