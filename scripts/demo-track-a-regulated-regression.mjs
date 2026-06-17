// scripts/demo-track-a-regulated-regression.mjs
//
// Regression test for the A_REGULATED modernization pass.
//
// Five regulated-shape JDs:
//   1. Clinical Supply Project Coordinator (Almac shape) → expect A_REGULATED
//   2. Pharma Supply Chain Executive (Sanofi shape)      → expect A_REGULATED
//   3. Cold Chain Coordinator                            → expect A_REGULATED
//   4. Drug Product Supply Coordinator                   → expect A_REGULATED
//   5. Regulated Distribution Planner (Cytiva shape)     → expect A_REGULATED
//
// Five boundary checks — confirm A_REGULATED is NOT poaching neighbouring
// tracks:
//   6. Pharma Buyer (RFQ-dominant)                       → expect CB_BUYER
//   7. Pharma Operations Executive                       → expect AB_HYBRID
//   8. Pure non-regulated Supply Planner                 → expect A_PMC
//   9. Supply Chain Management Analyst                   → expect D_SUPPORT
//  10. SC Business Analyst (transformation)              → expect E_TRANSFORMATION
//
// Hybrid health check:
//  11. Pharma Buyer with Quality Liaison shape
//      → A_REGULATED and CB_BUYER must BOTH be in the top 2
//      → |A_REGULATED - CB_BUYER| <= 10 raw points
//      → Confirms the ×1.28 regulated boost vs ×1.22 procurement boost
//        stays balanced when both signals are strong.

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
    name: "JD 1 · Clinical Supply Project Coordinator (Almac shape)",
    expected: "A_REGULATED",
    jd: `Clinical Supply Project Coordinator
Almac Singapore

You will join the Project Services department supporting clinical trial
supply chain operations.

Responsibilities
- Track ordering and receipt of drug product across clinical trial portfolio
- Calculate quantities and allocate drug product to depots and sites
- Monitor expiry dates and manage near-expiry drug product risk
- Coordinate cold chain shipment scheduling and temperature excursion follow-up
- Maintain GMP-aligned inventory levels and clinical supply continuity
- Draft detailed GMP instructions and clinical supply documentation
- Conduct supply chain health checks for the clinical trial supply chain
- Coordinate with QA, Regulatory, and Production on batch release status

Requirements
- 3-5 years clinical supply / drug product coordination background
- GMP / GDP / clinical trial supply familiarity
- SAP / IRT / IWRS / validated systems exposure
- Cold chain and temperature monitoring discipline`,
  },
  {
    name: "JD 2 · Pharma Supply Chain Executive (Sanofi shape)",
    expected: "A_REGULATED",
    jd: `Pharma Supply Chain Executive
Singapore

Own raw-material supply planning and inventory governance across a
GMP-regulated pharmaceutical portfolio.

Responsibilities
- Plan regulated raw-material supply across the regional product portfolio
- Maintain FEFO discipline and expiry-driven write-off prevention
- Govern batch documentation coordination from supply side
- Coordinate with QA on batch release status and quarantine stock
- Allocate inventory under regulated lead-time and shelf-life constraint
- Monitor cold chain integrity for temperature-sensitive raw materials
- Surface supply continuity risks for cross-functional review
- Maintain SAP MM master data for regulated raw materials
- Drive zero stockout and zero write-off across the regulated inventory pool

Requirements
- 4-6 years pharma / biopharma supply chain background
- GMP / FEFO / expiry governance discipline
- SAP MM, batch documentation, and supply continuity track record
- QA / Production / Regulatory liaison experience`,
  },
  {
    name: "JD 3 · Cold Chain Coordinator",
    expected: "A_REGULATED",
    jd: `Cold Chain Coordinator
Singapore

Responsibilities
- Coordinate cold chain shipment scheduling across the regional distribution network
- Monitor temperature excursions and follow up with QA on disposition
- Maintain cold chain integrity from depot to site
- Document temperature monitoring data per GDP requirements
- Allocate temperature-sensitive drug product under regulated lead-time
- Coordinate with QA, Regulatory, and logistics partners on cold chain governance
- Support deviation and CAPA documentation from supply side
- Track expiry-driven write-off prevention across cold chain inventory
- Maintain SAP and validated cold chain monitoring system data

Requirements
- 3+ years cold chain / GDP coordination background
- Temperature monitoring / temperature excursion follow-up discipline
- GMP / GDP / pharmaceutical industry familiarity
- Cross-functional QA / Regulatory liaison experience`,
  },
  {
    name: "JD 4 · Drug Product Supply Coordinator",
    expected: "A_REGULATED",
    jd: `Drug Product Supply Coordinator
Clinical Trial Supplies
Singapore

You will own drug product supply coordination across the regional
clinical trial supply chain.

Responsibilities
- Track drug product receipt, allocation, and depot-to-site distribution
- Monitor expiry dates and near-expiry drug product risk across the portfolio
- Coordinate cold chain shipment scheduling under GDP cadence
- Maintain GMP-aligned inventory accuracy across clinical trial supplies
- Document batch disposition status and quarantine stock from supply side
- Allocate drug product against QA release status and clinical trial demand
- Support deviation / CAPA documentation from the supply continuity side
- Coordinate with QA, Regulatory, Production, and clinical operations
- Maintain IRT / IWRS / SAP data for clinical supply governance

Requirements
- 3-5 years clinical trial supply / drug product coordination background
- GMP / GDP / clinical supply discipline
- Cold chain and temperature excursion follow-up experience
- Cross-functional QA / Regulatory liaison capability`,
  },
  {
    name: "JD 5 · Regulated Distribution Planner (Cytiva shape)",
    expected: "A_REGULATED",
    jd: `Regulated Distribution Planner
Life Sciences MNC
Singapore

Plan regulated distribution across the regional depot network for
life-science / pharmaceutical products under GDP cadence.

Responsibilities
- Plan distribution allocation across regional depots under GDP discipline
- Maintain cold chain integrity and temperature monitoring cadence
- Coordinate shipment scheduling and depot-to-site allocation
- Monitor expiry dates and govern FEFO discipline across distribution stock
- Maintain GMP-aligned inventory accuracy at the distribution layer
- Surface temperature excursions and coordinate disposition with QA
- Document batch documentation status from the distribution side
- Allocate regulated product under quarantine / release status
- Maintain SAP MM and validated distribution system data

Requirements
- 4-6 years regulated distribution planning / pharma logistics background
- GMP / GDP / cold chain / pharmaceutical industry discipline
- SAP MM and temperature monitoring system familiarity
- Cross-functional QA / Regulatory liaison experience`,
  },
  // ─── Boundary checks ─────────────────────────────────────────────────
  {
    name: "JD 6 · Pharma Buyer (RFQ-dominant, should NOT win A_REGULATED)",
    expected: "CB_BUYER",
    jd: `Pharma Buyer
Singapore

Drive end-to-end procurement execution across raw materials and packaging
for the pharmaceutical operations.

Responsibilities
- Manage end-to-end procurement: RFQ, RFI, supplier evaluation, vendor onboarding
- Negotiate pricing within delegated authority and manage approved supplier list
- Issue and follow up on purchase orders in SAP MM
- Source new vendors and run quotation comparison cycles
- Drive supplier negotiation and vendor performance evaluation
- Maintain procurement records, vendor database, and contract documentation
- Coordinate with planning and QC on incoming material acceptance

Requirements
- 3-5 years procurement / sourcing execution experience in regulated environment
- Strong RFQ / RFI / supplier evaluation background
- SAP MM PO execution and contract management discipline
- BOM-based purchasing familiarity`,
  },
  {
    name: "JD 7 · Pharma Operations Executive (should NOT win A_REGULATED)",
    expected: "AB_HYBRID",
    jd: `Operations Executive
Pharma Logistics Singapore

Lead daily operations execution across warehouse, transport, and 3PL
coordination for a pharmaceutical logistics provider.

Responsibilities
- Lead daily warehouse and logistics operations across pharma customer accounts
- Drive 3PL performance through SLA tracking and exception escalation
- Coordinate cross-functional teams: warehouse, transport, customer service, finance
- Own inventory accuracy programmes and cycle count discipline
- Manage process improvement initiatives across recurring operational workflows
- Stakeholder management with key pharma customer accounts and internal departments
- Root cause analysis on operational issues and corrective action follow-through

Requirements
- 5+ years logistics operations execution background with team leadership`,
  },
  {
    name: "JD 8 · Pure Supply Planner (no regulated context, should NOT win A_REG)",
    expected: "A_PMC",
    jd: `Supply Planner III
Industrial Components MNC
Singapore

Responsibilities
- Own supply planning across the regional product portfolio
- Material planning, MRP execution, and demand-supply balancing in SAP MM
- Monitor inventory levels, stock accuracy, safety stock, and order points
- Coordinate with production, procurement, and warehouse on material availability
- Drive supplier follow-up and supply continuity
- Master Production Schedule and capacity planning across the plant

Requirements
- 5+ years supply planning experience in industrial / electronics / consumer
- Strong SAP MM, inventory control, and ERP discipline
- MRP execution and master production schedule background`,
  },
  {
    name: "JD 9 · SC Management Analyst (should NOT win A_REGULATED)",
    expected: "D_SUPPORT",
    jd: `Supply Chain Management Analyst
Singapore

Drive supply chain performance visibility and PMO support through KPI
reporting, productivity savings tracking, and monthly business review
preparation.

Responsibilities
- Productivity Savings Report — track committed savings against delivery
  across the procurement and supply chain function
- Spend Analysis — consolidate spend data, identify cost drivers, support
  category review meetings
- Monthly Business Review — prepare KPI scorecards, performance trends,
  and decision-support visuals for senior leadership
- PMO Coordination — track programme milestones, surface risks and
  dependencies, consolidate status reporting
- KPI Reporting — build and maintain dashboards covering OTD, supplier
  performance, cost-to-serve, productivity-savings status

Requirements
- 3-5 years supply chain analytics / PMO support / business reporting
- Strong Power BI, SAP, and Excel
- Stakeholder-facing reporting experience`,
  },
  {
    name: "JD 10 · SC Business Analyst (should NOT win A_REGULATED)",
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

// ─── Pharma Buyer with Quality Liaison hybrid health check ──────────────
const HYBRID_JD = {
  name: "JD 11 · Pharma Buyer + Quality Liaison (regulated/buyer hybrid health check)",
  jd: `Pharma Buyer with Quality Liaison
Singapore

A hybrid role responsible for pharma procurement execution AND
regulated-supply / quality coordination across raw materials, packaging,
and clinical trial supplies.

Procurement Responsibilities
- Manage RFQ / RFI cycles across regulated raw materials and packaging suppliers
- Negotiate pricing and lead-time commitments within delegated authority
- Issue and follow up on purchase orders in SAP MM
- Conduct supplier evaluation and vendor performance reviews
- Maintain approved supplier list, vendor qualification, and procurement records

Regulated Supply / Quality Liaison Responsibilities
- Maintain FEFO discipline and expiry control across incoming raw materials
- Coordinate batch documentation status and quarantine stock with QA
- Track cold chain integrity and temperature excursion follow-up for sensitive materials
- Coordinate clinical trial supply readiness with QA and Regulatory
- Document GDP-aligned distribution status from the supply side
- Support deviation / CAPA documentation from the supply continuity side

Requirements
- 4+ years combined procurement and regulated-supply / quality liaison background
- GMP / FEFO / expiry / batch documentation discipline
- SAP MM, RFQ cycle, and supplier evaluation discipline
- Cross-functional QA / Regulatory liaison experience`,
};

let pass = 0;
let fail = 0;

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  A_REGULATED Modernization · Regression Test");
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

  if (r.selectedTrack === "A_REGULATED") {
    const pkg = getPromptPackage(r.selectedTrack, r.variantId);
    const checks = [
      ["Regulated Supply Discipline First priority", "Regulated Supply Discipline First"],
      ["Supply Continuity Second priority", "Supply Continuity Second"],
      ["Cross-Functional Compliance Third priority", "Cross-Functional Compliance Third"],
      ["Regulated Discipline Ownership Rule present", "REGULATED DISCIPLINE OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["Cytiva base resume named", "Forest_Wang_DistributionPlanner_CytivaV2.docx"],
      ["SC Ops Specialist content master named", "Supply Chain Operations Specialist.docx"],
      ["Sanofi evidence bank named", "Sanofi_Interview_Final_Condensed.docx"],
      ["Terumo supporting reference named", "Forest_Wang_RegionalSCAnalyst_Terumo_v2.docx"],
      ["Track A_PMC PharmaSC DO NOT USE guard", "ForestWang_PharmaSC.docx"],
      ["Track CB DoodleLabs DO NOT USE guard", "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx"],
      ["Track D OperationsAnalytics DO NOT USE guard", "Forest_Wang_TrackD_OperationsAnalytics.docx"],
      ["Track E DO NOT USE guard", "Forest_Wang_TrackE_SupplyChainBusinessAI.docx"],
      ["Verb whitelist (Planned)", "Planned"],
      ["Verb whitelist (Coordinated)", "Coordinated"],
      ["Verb whitelist (Allocated)", "Allocated"],
      ["Anti-deflation guard (expiry checker)", "expiry checker"],
      ["Anti-drift guard (Negotiated → CB_BUYER)", "Negotiated"],
      ["Anti-drift guard (Led MRP → A_PMC)", "Led MRP"],
      ["Anti-QA-officer guard (Released the batch)", "Released the batch"],
      ["Forbidden Operations Executive identity", "Operations Executive"],
      ["Forbidden QP identity", "Qualified Person"],
      ["Sanofi 45-month zero write-off anchor", "45-month zero write-off"],
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

// ─── Hybrid health check ───────────────────────────────────────────────
console.log(`\n🔬 ${HYBRID_JD.name}`);
const hr = scoreJD({ jdText: HYBRID_JD.jd });

const findTrack = (id) => hr.allTrackScores.find((t) => t.trackId === id);
const areg = findTrack("A_REGULATED");
const cb = findTrack("CB_BUYER");

const top2 = [...hr.allTrackScores].sort((a, b) => b.rawScore - a.rawScore).slice(0, 2);
const top2Ids = top2.map((t) => t.trackId);

console.log(`   selected:  ${hr.selectedTrack}`);
console.log(`   A_REGULATED raw: ${areg ? areg.rawScore.toFixed(2) : "n/a"}`);
console.log(`   CB_BUYER    raw: ${cb ? cb.rawScore.toFixed(2) : "n/a"}`);
console.log(`   top 2: ${top2.map((t) => `${t.trackId}=${t.rawScore.toFixed(2)}`).join("   ")}`);

const aregIsTop2 = top2Ids.includes("A_REGULATED");
const cbIsTop2 = top2Ids.includes("CB_BUYER");
const aregVal = areg?.rawScore ?? 0;
const cbVal = cb?.rawScore ?? 0;
const gap = Math.abs(aregVal - cbVal);
const gapHealthy = gap <= 10;

const checkLines = [
  ["A_REGULATED in top 2", aregIsTop2],
  ["CB_BUYER    in top 2", cbIsTop2],
  [`|A_REG - CB| gap ≤ 10 raw points (got ${gap.toFixed(2)})`, gapHealthy],
];

for (const [label, ok2] of checkLines) {
  console.log(`     ${ok2 ? "✓" : "✗"} ${label}`);
  if (ok2) pass++;
  else fail++;
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log(`  Pass ${pass}  Fail ${fail}`);
console.log("══════════════════════════════════════════════════════════════\n");

process.exit(fail === 0 ? 0 : 1);
