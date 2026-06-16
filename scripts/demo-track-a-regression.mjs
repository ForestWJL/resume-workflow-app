// scripts/demo-track-a-regression.mjs
//
// Regression test for the Track A modernization pass — verifies that the
// four JD families requested in the review still route correctly after the
// file-stack swap, identity block, ownership rule, JD alignment rule, and
// refined forbidden-identities list.
//
// JD 1 · Supply Planner               → expect A_PMC
// JD 2 · Material Planner             → expect A_PMC
// JD 3 · Inventory Planner            → expect A_PMC
// JD 4 · Supply Chain Business Analyst → expect E_TRANSFORMATION
//
// The fourth case is the boundary check: even though Track A's prompt
// mentions "Business Analyst" loosely, the CLASSIFIER must still route the
// SC Business Analyst JD to Track E. The forbidden-identities list only
// affects prompt output AFTER classification.

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
const { FILE_STACKS } = load(resolve(projectRoot, "config/fileStacks.ts"));

const JDS = [
  {
    name: "JD 1 · Supply Planner (Bio-Rad style)",
    expected: "A_PMC",
    jd: `Supply Planner III
Bio-Rad Laboratories
Singapore

Responsibilities
- Own supply planning across the regional product portfolio
- Material planning, MRP execution, and demand-supply balancing in SAP MM
- Monitor inventory levels, stock accuracy, safety stock, and order points
- Coordinate with production, procurement, and warehouse on material availability
- Drive supplier follow-up and supply continuity
- FEFO discipline and shelf-life monitoring for regulated products

Requirements
- 5+ years supply planning experience in life science / pharma / medtech
- Strong SAP MM, inventory control, and ERP discipline
- Cross-functional coordination skills`,
  },
  {
    name: "JD 2 · Material Planner (Manufacturing)",
    expected: "A_PMC",
    jd: `Material Planner
Singapore

We are seeking a Material Planner to manage BOM-driven procurement and
production planning across our manufacturing operations.

Responsibilities
- BOM-based material planning and PO raising in SAP MM
- Production planning and capacity forecasting
- Supplier follow-up and lead time tracking
- Material availability and stock-out prevention
- Inventory accuracy and cycle count discipline

Requirements
- 5+ years material planning experience
- SAP MM expertise
- Manufacturing background preferred`,
  },
  {
    name: "JD 3 · Inventory Planner (Warehouse)",
    expected: "A_PMC",
    jd: `Inventory Planner
Singapore

You will own inventory control and stock-at-risk monitoring across the
regional distribution centre network.

Responsibilities
- Inventory planning, stock control, and replenishment
- FEFO discipline, expiry monitoring, slow-mover analysis
- Inventory accuracy and variance reduction
- Cycle count programme ownership
- Cross-functional coordination with planning, warehouse, and customer service

Requirements
- 5+ years inventory planning experience
- Strong WMS and SAP MM
- FMCG or pharma distribution background`,
  },
  {
    name: "JD 4 · Supply Chain Business Analyst (boundary case)",
    expected: "E_TRANSFORMATION",
    jd: `Supply Chain Business Analyst
We are looking for a Supply Chain Business Analyst to lead digital transformation, AI adoption and process improvement across our operations.

Responsibilities
- Partner with operations stakeholders to identify pain points and translate business requirements into use cases
- Lead workflow redesign and process mapping initiatives
- Drive AI-assisted decision support across planning and execution
- Stakeholder management and stakeholder workshops with senior operations leaders
- Root cause analysis on operational issues; propose continuous improvement actions
- Own the transformation roadmap for the SC function
- Cross-functional transformation with IT, finance, and commercial teams

Requirements
- 8+ years supply chain operations experience
- Strong business ownership and stakeholder engagement skills
- Experience translating operations into workflows and use case definition`,
  },
];

let pass = 0;
let fail = 0;

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  Track A Modernization · Regression Test");
console.log("══════════════════════════════════════════════════════════════");

for (const c of JDS) {
  const r = scoreJD({ jdText: c.jd });
  const ok = r.selectedTrack === c.expected;
  if (ok) pass++;
  else fail++;

  console.log(`\n${ok ? "✅" : "❌"} ${c.name}`);
  console.log(`   expected: ${c.expected}    got: ${r.selectedTrack}`);
  console.log(`   recommendation: ${r.recommendation}    confidence: ${r.confidence} (${Math.round(r.confidenceRatio*100)}%)`);

  const fs = FILE_STACKS[r.selectedTrack];
  console.log(`   workflow loads (base resume): ${fs.formatTemplate.fileName}`);
  console.log(`   label: "${fs.formatTemplate.label}"`);

  const pkg = getPromptPackage(r.selectedTrack, r.variantId);
  // Track A boundary check: when A_PMC wins, confirm the prompt body
  // contains the new identity block and the refined Business Analyst note.
  if (r.selectedTrack === "A_PMC") {
    const checks = [
      ["Planning First priority block", "Planning First"],
      ["Operations Second priority", "Operations Second"],
      ["Technology Third priority", "Technology Third"],
      ["Planner Ownership Rule present", "PLANNER OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["PharmaSC base resume named", "ForestWang_PharmaSC.docx"],
      ["Track D MASTER DO NOT USE guard", "TrackD_DataAnalyst_MASTER"],
      [`Refined "Pure Enterprise / IT Business Analyst" phrasing`, "Pure Enterprise / IT Business Analyst"],
      [`Note that "Business Analyst" phrase is NOT itself forbidden`, "is NOT itself forbidden"],
    ];
    for (const [label, needle] of checks) {
      const ok2 = pkg.round1.includes(needle);
      console.log(`   ${ok2 ? "  ✓" : "  ✗"} ${label}`);
      if (ok2) pass++;
      else fail++;
    }
  } else if (r.selectedTrack === "E_TRANSFORMATION") {
    console.log(`   variant: ${r.variantName} (${r.variantId})`);
    console.log(`   (Track A's forbidden list does not gate this path; Track E prompt resolves normally)`);
  }
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log(`  Pass ${pass}  Fail ${fail}`);
console.log("══════════════════════════════════════════════════════════════\n");

process.exit(fail === 0 ? 0 : 1);
