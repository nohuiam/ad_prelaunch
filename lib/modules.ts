// Platform module registry. Module 01 is live; 02–05 are roadmap.
// IMPORTANT: roadmap items render as clearly NON-INTERACTIVE "coming soon" — a compliance
// tool must not use the deceptive-UI patterns (fake buttons) it flags.
export interface ModuleEntry {
  id: string;
  name: string;
  status: "live" | "soon";
  blurb: string;
}

export const modules: ModuleEntry[] = [
  { id: "01", name: "Compliance Pre-Flight", status: "live", blurb: "Score an ad's ban-risk per network and get a compliant rewrite before you launch." },
  { id: "02", name: "Creative Lab", status: "soon", blurb: "Generate launch-ready ad variants tailored to each platform's specs." },
  { id: "03", name: "Attribution Stitcher", status: "soon", blurb: "Blend ad-platform + network + ESP data into true ROI per offer." },
  { id: "04", name: "Email Angle Lab", status: "soon", blurb: "Subject + angle variants with deliverability scoring for your lists." },
  { id: "05", name: "Ad-Ops Copilot", status: "soon", blurb: "Surface underperformers and propose pause/scale/swap actions with reasoning." },
];
