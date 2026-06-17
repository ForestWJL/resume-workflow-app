// scripts/demo-track-ac-regression.mjs
//
// Regression test for the AC_DEMAND modernization pass.
//
// Five demand-shape JDs:
//   1. Demand Planner                    → expect AC_DEMAND
//   2. Demand Planning Executive         → expect AC_DEMAND
//   3. Replenishment Planner             → expect AC_DEMAND
//   4. Inventory Planner                 → expect AC_DEMAND
//   5. Supply Planning Analyst           → expect AC_DEMAND (forecast-accuracy)
//
// Five boundary checks — confirm AC is NOT poaching neighbouring tracks:
//   6. Procurement Executive             → expect CB_BUYER
//   7. Assistant Logistics Manager       → expect AB_HYBRID
//   8. Production Planner (Anradus)      → expect A_PMC
//   9. Supply Chain Management Analyst   → expect D_SUPPORT
//  10. SC Business Analyst               → expect E_TRANSFORMATION
//
// Hybrid health check (Rule 10 from user spec):
//  11. Demand Planner & Buyer (HELIOS shape)
//      → AC_DEMAND and CB_BUYER must both be in the top 2
//      → |AC_DEMAND - CB_BUYER| <= 10 confidence points (raw points)
//      → A healthy classifier yields a tight split (e.g. CB 36 / AC 33).
//      → A failure mode is CB 70 / AC 10 (demand signal dead) or
//        AC 70 / CB 10 (buyer signal dead).

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
    name: "JD 1 · Demand Planner",
    expected: "AC_DEMAND",
    jd: `Demand Planner
Singapore

Drive monthly demand forecasting across the regional portfolio, partnering
with sales, marketing and supply planning to deliver demand visibility,
inventory availability, and S&OP support.

Responsibilities
- Develop and maintain monthly demand forecasts at SKU / customer level
- Analyse depletion reports, sell-through data, and demand trends
- Improve forecast accuracy (MAPE / bias) through statistical and consensus methods
- Coordinate with supply planning on inventory availability and replenishment cycles
- Surface demand risks and opportunities in the monthly S&OP review
- Maintain forecast inputs in SAP IBP / APO / planning systems
- Support promotion, launch, and campaign forecast loading

Requirements
- 3-5 years demand planning experience
- Strong forecasting / statistical method discipline
- SAP APO / IBP / Kinaxis / forecasting tool exposure
- S&OP cadence and stakeholder coordination experience`,
  },
  {
    name: "JD 2 · Demand Planning Executive",
    expected: "AC_DEMAND",
    jd: `Demand Planning Executive
Singapore

Responsibilities
- Generate monthly statistical demand forecasts at SKU level
- Analyse historical depletion data, sell-through trends, and seasonality
- Maintain forecast accuracy targets and review bias by category
- Coordinate with supply planning on demand-supply alignment and replenishment
- Support inventory availability and stockout reduction initiatives
- Participate in monthly S&OP review and consensus forecast meetings
- Maintain demand planning master data in SAP APO / IBP
- Support promotion forecast loading and campaign planning

Requirements
- 2-4 years demand planning / forecasting experience
- SAP APO / IBP / forecasting system familiarity
- Strong Excel / statistical analysis fundamentals`,
  },
  {
    name: "JD 3 · Replenishment Planner",
    expected: "AC_DEMAND",
    jd: `Replenishment Planner
Singapore

Own the replenishment cycle for the regional distribution network,
balancing demand forecast inputs with inventory availability and lead-time
constraints.

Responsibilities
- Develop replenishment plans based on demand forecast and inventory position
- Balance demand-supply alignment across distribution centres
- Monitor stock availability, DOH, and fill rate by SKU / location
- Coordinate with demand planning, supply planning, and distribution on cycle execution
- Surface slow-mover and excess-stock risks for review
- Maintain replenishment master data in SAP / planning systems
- Track replenishment efficiency, cycle time, and order coverage

Requirements
- 3+ years replenishment / supply planning experience
- Strong SAP / planning tool background
- Inventory-availability discipline and stakeholder coordination`,
  },
  {
    name: "JD 4 · Inventory Planner",
    expected: "AC_DEMAND",
    jd: `Inventory Planner
Singapore

Responsibilities
- Maintain inventory health across the regional portfolio: DOH, turnover, slow-mover, excess
- Balance demand forecast inputs with inventory availability and stockout risk
- Develop replenishment recommendations based on demand-supply alignment
- Monitor fill rate, service level, and stock availability
- Coordinate with demand planning and supply planning on cycle alignment
- Surface inventory risks (excess, obsolete, stockout) in monthly review
- Maintain inventory planning master data in SAP / planning systems

Requirements
- 3-5 years inventory / replenishment / demand-planning background
- SAP / planning tool discipline
- Strong inventory-availability focus`,
  },
  {
    name: "JD 5 · Supply Planning Analyst (forecast-accuracy)",
    expected: "AC_DEMAND",
    jd: `Supply Planning Analyst
Singapore

Support demand-supply alignment, forecast accuracy improvement, and
inventory-availability monitoring across the regional portfolio.

Responsibilities
- Analyse forecast accuracy (MAPE / bias) and surface improvement levers
- Develop demand-supply alignment models for monthly S&OP review
- Maintain inventory-availability and DOH visibility across the network
- Support replenishment cycle and stockout-reduction initiatives
- Build Power BI / Excel dashboards on forecast accuracy, fill rate, DOH
- Coordinate with demand planning, supply planning, and distribution
- Surface demand-side risks in the monthly business review

Requirements
- 2-4 years supply planning / demand planning analyst background
- Strong Power BI, Excel, SAP APO / IBP
- Forecast accuracy / inventory-availability literacy`,
  },
  // ─── Boundary checks ─────────────────────────────────────────────────
  {
    name: "JD 6 · Procurement Executive (should NOT win AC)",
    expected: "CB_BUYER",
    jd: `Procurement Executive
Singapore

Responsibilities
- Manage end-to-end procurement: RFQ, RFI, supplier evaluation, vendor onboarding
- Negotiate pricing within delegated authority and manage approved supplier list
- Issue and follow up on purchase orders in SAP MM
- Source new vendors and run quotation comparison cycles
- Supplier quality issues and claims settlement

Requirements
- 3-5 years procurement / sourcing execution experience
- Strong RFQ / RFI / supplier evaluation background
- SAP MM and contract management discipline`,
  },
  {
    name: "JD 7 · Assistant Logistics Manager (should NOT win AC)",
    expected: "AB_HYBRID",
    jd: `Assistant Logistics Manager
Singapore

Support the Logistics Manager in running daily logistics operations across
warehouse, transport, and 3PL coordination.

Responsibilities
- Lead daily warehouse and logistics operations across multiple customer accounts
- Drive 3PL performance through SLA tracking and exception escalation
- Coordinate cross-functional teams: warehouse, transport, customer service, finance
- Own inventory accuracy programmes and cycle count discipline
- Manage process improvement initiatives across recurring operational workflows
- Stakeholder management with key customer accounts and internal departments
- Root cause analysis on operational issues and corrective action follow-through

Requirements
- 5+ years logistics operations experience with team leadership background`,
  },
  {
    name: "JD 8 · Production Planner (Anradus shape, should NOT win AC)",
    expected: "A_PMC",
    jd: `Production Planner
Singapore

Responsibilities
- Plan production schedules to meet customer demand and capacity constraints
- Develop forecasts of raw materials, packaging, and finished goods requirements
- Maintain inventory levels of raw materials, packaging, and finished goods
- Run production scheduling software and Master Production Schedule (MPS)
- Coordinate with warehouse on receiving, storage, and dispatch
- Drive MRP execution discipline and capacity planning across the plant
- Monitor production performance and adherence to schedule

Requirements
- 5+ years production planning / MRP / MPS background
- Strong scheduling software and ERP discipline
- Manufacturing environment experience`,
  },
  {
    name: "JD 9 · Supply Chain Management Analyst (should NOT win AC)",
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
    name: "JD 10 · SC Business Analyst (should NOT win AC)",
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

// ─── Demand Planner & Buyer hybrid health check (HELIOS shape) ──────────
const HYBRID_JD = {
  name: "JD 11 · Demand Planner & Buyer (HELIOS hybrid health check)",
  jd: `Demand Planner and Buyer
HELIOS Singapore

A hybrid role responsible for both demand planning and procurement
execution across the regional portfolio.

Demand Planning Responsibilities
- Develop monthly demand forecasting models at SKU / customer level
- Analyse depletion reports, sell-through data, and historical demand trends
- Forecast procurement requirements based on demand outlook
- Analyse seasonal trends, promotion impact, and inventory availability
- Maintain forecast inputs in SAP / planning systems

Buyer Responsibilities
- Manage procurement activities across the assigned portfolio
- Coordinate with vendors, freight forwarders, and supply partners
- Drive supplier negotiation, supplier performance evaluation, and cost saving
- Monitor inventory positions and trigger replenishment POs
- Maintain approved vendor list and procurement records

Requirements
- 4+ years combined demand planning and procurement background
- SAP APO / IBP / MM exposure
- Demand-supply alignment and vendor coordination discipline`,
};

let pass = 0;
let fail = 0;

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  AC_DEMAND Modernization · Regression Test");
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

  if (r.selectedTrack === "AC_DEMAND") {
    const pkg = getPromptPackage(r.selectedTrack, r.variantId);
    const checks = [
      ["Demand Forecasting First priority", "Demand Forecasting First"],
      ["Replenishment Planning Second priority", "Replenishment Planning Second"],
      ["Inventory Availability Third priority", "Inventory Availability Third"],
      ["Planner Ownership Rule present", "PLANNER OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["Cytiva base resume named", "Forest_Wang_DistributionPlanner_CytivaV2.docx"],
      ["SC Ops Specialist content master named", "Supply Chain Operations Specialist.docx"],
      ["Sanofi evidence bank named", "Sanofi_Interview_Final_Condensed.docx"],
      ["Watsons supporting reference named", "Forest_Wang_SeniorSCExec_Watsons_v3.docx"],
      ["Track A PharmaSC DO NOT USE guard", "ForestWang_PharmaSC.docx"],
      ["Track CB DoodleLabs DO NOT USE guard", "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx"],
      ["Track E DO NOT USE guard", "Forest_Wang_TrackE_SupplyChainBusinessAI.docx"],
      ["Verb whitelist (Forecasted)", "Forecasted"],
      ["Verb whitelist (Replenished)", "Replenished"],
      ["Verb whitelist (Aligned)", "Aligned"],
      ["Anti-deflation guard (junior data analyst)", "junior demand analyst"],
      ["Anti-drift guard (Negotiated → CB_BUYER)", "Negotiated"],
      ["Anti-drift guard (MRP → A_PMC)", "Produced MRP plans"],
      ["Forbidden Production Planner identity", "Production Planner"],
      ["Forbidden Reporting Analyst identity", "Reporting Analyst"],
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

// Find AC_DEMAND and CB_BUYER raw scores
const findTrack = (id) => hr.allTrackScores.find((t) => t.trackId === id);
const ac = findTrack("AC_DEMAND");
const cb = findTrack("CB_BUYER");

// Sort top 2 by raw score
const top2 = [...hr.allTrackScores].sort((a, b) => b.rawScore - a.rawScore).slice(0, 2);
const top2Ids = top2.map((t) => t.trackId);

console.log(`   selected:  ${hr.selectedTrack}`);
console.log(`   AC_DEMAND raw: ${ac ? ac.rawScore.toFixed(2) : "n/a"}`);
console.log(`   CB_BUYER  raw: ${cb ? cb.rawScore.toFixed(2) : "n/a"}`);
console.log(`   top 2: ${top2.map((t) => `${t.trackId}=${t.rawScore.toFixed(2)}`).join("   ")}`);

const acIsTop2 = top2Ids.includes("AC_DEMAND");
const cbIsTop2 = top2Ids.includes("CB_BUYER");
const acVal = ac?.rawScore ?? 0;
const cbVal = cb?.rawScore ?? 0;
const gap = Math.abs(acVal - cbVal);
const gapHealthy = gap <= 10;

const checkLines = [
  ["AC_DEMAND in top 2", acIsTop2],
  ["CB_BUYER  in top 2", cbIsTop2],
  [`|AC - CB| gap ≤ 10 raw points (got ${gap.toFixed(2)})`, gapHealthy],
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
