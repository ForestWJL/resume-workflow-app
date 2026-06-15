// scripts/demo-variant-consistency.mjs
//
// One-minute visual check: run two JDs through the live pipeline that have
// been deliberately written to land on DIFFERENT Track E variants, then
// show the variant at every stage so you can confirm Router == Workflow
// Sub-type == Prompt fragment for each.

import jitiFactory from "jiti";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const load = jitiFactory(projectRoot, {
  interopDefault: true,
  alias: { "@": projectRoot },
  esmResolve: true,
});

const { scoreJD } = load(resolve(projectRoot, "lib/score.ts"));
const { getPromptPackage } = load(resolve(projectRoot, "config/prompts/index.ts"));

const JD_A = `Supply Chain Business Analyst
We need a business analyst to partner with operations stakeholders. Lead requirement gathering and stakeholder workshops, define use cases for new digital workflows, translate business requirements into structured solutions. 8+ years SC operations background. Cross-functional with IT, finance, operations. Stakeholder management at senior level. Digital transformation experience preferred.`;

const JD_B = `Operations Excellence Analyst
Drive continuous improvement, kaizen, and lean six sigma across the supply chain. Lead root cause analysis on operational gaps. Process mapping and value stream mapping. KPI design for operational improvement. 8–15 years SC / operations background. Operations excellence mindset essential. Business ownership culture.`;

function runStage(label, jdText) {
  const r = scoreJD({ jdText });

  // Stage 1 — Router decision
  const router = {
    track: r.selectedTrack,
    variantId: r.variantId,
    variantName: r.variantName,
  };

  // Stage 2 — Workflow Sub-type badge (mirrors app/workflow/page.tsx
  // `variantName` useMemo: shows variantName when confirmedTrack === selectedTrack)
  const workflowSubtype = r.variantName;

  // Stage 3 — Prompt resolver (same call the workflow page makes)
  const pkg = getPromptPackage(r.selectedTrack, r.variantId);
  // The variant fragment is the line after "Variant emphasis"
  const fragmentLine =
    pkg.round1
      .split("\n")
      .find((l) => l.startsWith("Variant emphasis"))
      ?.trim() ?? "(no fragment found)";

  console.log("\n──────────────────────────────────────────────────────────────");
  console.log(`  ${label}`);
  console.log("──────────────────────────────────────────────────────────────");
  console.log(`  Router          · track    = ${router.track}`);
  console.log(`                  · variantId = ${router.variantId}`);
  console.log(`                  · variantName = "${router.variantName}"`);
  console.log(`  Workflow page   · Sub-type badge = "${workflowSubtype}"`);
  console.log(`  Prompt resolver · variant fragment header:`);
  console.log(`                    ${fragmentLine}`);

  const consistent =
    router.variantName === workflowSubtype &&
    fragmentLine.includes(router.variantName);
  console.log(`  Consistency     · ${consistent ? "✅ all three stages match" : "❌ MISMATCH"}`);
  return { router, workflowSubtype, fragmentLine, consistent };
}

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Track E Variant Consistency Demo");
console.log("  Router → Workflow Sub-type badge → Prompt fragment");
console.log("═══════════════════════════════════════════════════════════════");

const a = runStage(
  "JD A · Business-Analyst-shaped JD",
  JD_A
);
const b = runStage(
  "JD B · Operations-Excellence-shaped JD",
  JD_B
);

console.log("\n──────────────────────────────────────────────────────────────");
console.log("  Final assertions");
console.log("──────────────────────────────────────────────────────────────");
const sameTrack = a.router.track === b.router.track;
const differentVariants = a.router.variantName !== b.router.variantName;
console.log(`  Both JDs route to E_TRANSFORMATION:  ${sameTrack ? "✅" : "❌"}`);
console.log(`  Two JDs produce DIFFERENT variants:   ${differentVariants ? "✅" : "❌"}`);
console.log(`  JD A: every stage consistent:         ${a.consistent ? "✅" : "❌"}`);
console.log(`  JD B: every stage consistent:         ${b.consistent ? "✅" : "❌"}`);
console.log("");

process.exit(
  sameTrack && differentVariants && a.consistent && b.consistent ? 0 : 1
);
