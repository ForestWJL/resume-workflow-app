// scripts/demo-track-cb-regression.mjs
//
// Regression test for the CB_BUYER modernization pass.
//
// Five procurement-shape JDs:
//   1. Procurement Executive         → expect CB_BUYER
//   2. Buyer (life sciences)         → expect CB_BUYER
//   3. Sourcing Executive            → expect CB_BUYER
//   4. Purchasing Executive          → expect CB_BUYER
//   5. Category Buyer (FMCG)         → expect CB_BUYER
//
// Three boundary checks to confirm CB is NOT poaching neighbours:
//   6. Pure Supply Planner           → expect A_PMC
//   7. Pure Operations Executive     → expect AB_HYBRID
//   8. SC Business Analyst           → expect E_TRANSFORMATION

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
    name: "JD 1 · Procurement Executive",
    expected: "CB_BUYER",
    jd: `Procurement Executive
Singapore

Responsibilities
- Manage end-to-end procurement: RFQ, RFI, supplier evaluation, vendor onboarding
- Negotiate pricing within delegated authority and manage approved supplier list
- Issue and follow up on purchase orders in SAP MM
- Source new vendors and run quotation comparison cycles
- Maintain procurement records, vendor database, and contract documentation
- Supplier quality issues and claims settlement
- Coordinate with Warehouse, QC, Finance on delivery lead time and material availability

Requirements
- 3-5 years procurement / sourcing experience
- Strong RFQ / RFI / supplier evaluation background
- SAP MM and contract management discipline`,
  },
  {
    name: "JD 2 · Buyer (life sciences)",
    expected: "CB_BUYER",
    jd: `Buyer
Life Sciences MNC
Singapore

You will own the PO lifecycle and supplier coordination across raw materials
and packaging for our regional operations.

Responsibilities
- Raise and follow up purchase orders in SAP MM across BOM-based purchasing
- Conduct RFQ and price negotiation with approved suppliers
- Evaluate supplier performance: on-time delivery, quality, lead time adherence
- Coordinate with planning and warehouse on material availability and stock-out prevention
- Maintain supplier database and procurement records
- Drive vendor performance through monthly review meetings

Requirements
- 3+ years buyer / purchasing experience in regulated environment
- SAP MM PO execution and supplier coordination discipline
- BOM-based purchasing familiarity`,
  },
  {
    name: "JD 3 · Sourcing Executive",
    expected: "CB_BUYER",
    jd: `Sourcing Executive
Singapore

Drive sourcing cycles across indirect spend categories and own RFQ /
supplier evaluation programmes.

Responsibilities
- Run sourcing cycles: RFI, RFQ, quotation comparison, vendor evaluation
- Negotiate pricing and lead-time commitments within delegated authority
- Award POs and manage PO lifecycle through to closure in SAP MM
- Maintain approved supplier list and vendor qualification records
- Conduct supplier performance reviews and drive corrective actions
- Coordinate with internal stakeholders (Operations, Finance, QC)

Requirements
- 3-5 years sourcing / procurement execution experience
- Strong RFQ cycle ownership and supplier evaluation discipline
- SAP MM and contract administration familiarity`,
  },
  {
    name: "JD 4 · Purchasing Executive",
    expected: "CB_BUYER",
    jd: `Purchasing Executive
Singapore

Responsibilities
- Execute purchasing activities across direct and indirect spend
- Raise purchase requisitions and POs in SAP MM
- Follow up on supplier delivery, lead times, and PO closure
- Conduct quotation comparison and vendor evaluation
- Maintain purchasing records, supplier database, pricing sheets
- Coordinate with stores, warehouse, and QC on incoming material acceptance
- Support supplier qualification and approved supplier list maintenance

Requirements
- 3+ years purchasing / procurement experience
- SAP MM purchasing module discipline
- Supplier follow-up and lead-time tracking skills`,
  },
  {
    name: "JD 5 · Category Buyer (FMCG)",
    expected: "CB_BUYER",
    jd: `Category Buyer
FMCG Singapore

You will manage the buying activity for an assigned category, working
within the category strategy set by the Category Manager.

Responsibilities
- Manage day-to-day buying within the assigned category
- Execute RFQ and quotation comparison cycles
- Negotiate pricing and lead-time commitments with category suppliers
- Award POs and manage PO lifecycle in SAP MM
- Evaluate supplier performance and conduct vendor reviews
- Maintain supplier records and vendor qualification within category
- Coordinate with planning and warehouse on availability and lead time

Requirements
- 3-5 years category buyer / procurement execution experience
- RFQ ownership and supplier evaluation within an assigned category
- SAP MM PO execution discipline`,
  },
  // ─── Boundary checks ─────────────────────────────────────────────────
  {
    name: "JD 6 · Pure Supply Planner (should NOT win CB)",
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
- Strong SAP MM, inventory control, and ERP discipline`,
  },
  {
    name: "JD 7 · Pure Operations Executive (should NOT win CB)",
    expected: "AB_HYBRID",
    jd: `Operations Executive
Singapore

Responsibilities
- Manage daily operations across warehouse, transport, and customer service
- Coordinate cross-functional teams to resolve operational exceptions
- Drive process compliance and SOP adherence
- KPI tracking and performance reporting for service level, fill rate, and OTIF
- Own backlog resolution and exception escalation
- Stakeholder management with internal teams and external 3PL partners

Requirements
- 5+ years operations execution background
- Strong coordination and ownership mindset
- WMS / ERP discipline`,
  },
  {
    name: "JD 8 · SC Business Analyst (should NOT win CB)",
    expected: "E_TRANSFORMATION",
    jd: `Supply Chain Business Analyst
We are looking for a Supply Chain Business Analyst to lead digital transformation, AI adoption and process improvement across our operations.

Responsibilities
- Partner with operations stakeholders to identify pain points and translate business requirements into use cases
- Lead workflow redesign and process mapping initiatives
- Drive AI-assisted decision support across planning and execution
- Root cause analysis and stakeholder workshops
- Own the transformation roadmap for the SC function

Requirements
- 8+ years supply chain operations experience
- Strong business ownership and stakeholder alignment skills
- Workflow automation and AI enablement experience`,
  },
];

let pass = 0;
let fail = 0;

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  CB_BUYER Modernization · Regression Test");
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

  if (r.selectedTrack === "CB_BUYER") {
    const pkg = getPromptPackage(r.selectedTrack, r.variantId);
    const checks = [
      ["Procurement First priority", "Procurement First"],
      ["Supplier Management Second priority", "Supplier Management Second"],
      ["Technology Third priority", "Technology Third"],
      ["Buyer Ownership Rule present", "BUYER OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["PurchasingPlanning DoodleLabs base resume named", "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx"],
      ["PharmaSC content master named", "ForestWang_PharmaSC.docx"],
      ["Track D MASTER DO NOT USE guard", "TrackD_DataAnalyst_MASTER"],
      ["Track E MASTER DO NOT USE guard", "TrackE_SupplyChainBusinessAI"],
      ["Verb whitelist Negotiated / Sourced / Awarded", "Negotiated"],
      ["Inflation guard (Strategic Sourcing Lead)", "Strategic Sourcing Lead"],
      ["Deflation guard (Supported / Assisted / lead verb)", "as LEAD verbs"],
      ["4-item output (JD Fit)", "JD Fit Assessment"],
      ["4-item output (ATS Keywords)", "Top 10 ATS Keywords"],
      ["4-item output (Resume Gaps)", "Resume Gaps"],
      ["4-item output (Final Resume)", "Final Tailored Resume"],
    ];
    for (const [label, needle] of checks) {
      const ok2 = pkg.round1.includes(needle);
      console.log(`     ${ok2 ? "✓" : "✗"} ${label}`);
      if (ok2) pass++;
      else fail++;
    }
  }
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log(`  Pass ${pass}  Fail ${fail}`);
console.log("══════════════════════════════════════════════════════════════\n");

process.exit(fail === 0 ? 0 : 1);
