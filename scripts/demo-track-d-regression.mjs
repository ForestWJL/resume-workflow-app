// scripts/demo-track-d-regression.mjs
//
// Regression test for the D_SUPPORT modernization pass.
//
// Five analyst-shape JDs:
//   1. Supply Chain Analyst              → expect D_SUPPORT
//   2. Supply Chain Management Analyst   → expect D_SUPPORT
//   3. Reporting Analyst                 → expect D_SUPPORT
//   4. Operations Analyst                → expect D_SUPPORT
//   5. Performance Analyst               → expect D_SUPPORT
//
// Four boundary checks — confirm D is NOT poaching neighbouring tracks:
//   6. Pure Supply Planner               → expect A_PMC
//   7. Pure Procurement Executive        → expect CB_BUYER
//   8. Assistant Logistics Manager       → expect AB_HYBRID
//   9. SC Business Analyst               → expect E_TRANSFORMATION

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
    name: "JD 1 · Supply Chain Analyst",
    expected: "D_SUPPORT",
    jd: `Supply Chain Analyst
Singapore

You will analyse supply chain performance data, build KPI reports, and
support operational decision-making through structured analytics.

Responsibilities
- Develop and maintain supply chain KPI dashboards in Power BI / Excel
- Consolidate weekly performance reports for management review
- Analyse trends in OTD, fill rate, inventory aging, and backlog
- Track productivity savings and cost-control initiatives
- Surface operational insights and exception patterns from raw data
- Coordinate with stakeholders for data inputs and reporting cadence
- Build ad-hoc analytical models for business decisions

Requirements
- 3-5 years supply chain analytics / reporting background
- Strong Power BI, SQL, and Excel data analysis skills
- Supply chain domain literacy`,
  },
  {
    name: "JD 2 · Supply Chain Management Analyst",
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
- Cost Reduction Tracking — analyse savings initiatives, present quarterly
  status to finance and procurement leadership

Requirements
- 3-5 years supply chain analytics / PMO support / business reporting
- Strong Power BI, SAP, and Excel
- Stakeholder-facing reporting experience`,
  },
  {
    name: "JD 3 · Reporting Analyst",
    expected: "D_SUPPORT",
    jd: `Reporting Analyst
Singapore

Responsibilities
- Develop and maintain reporting dashboards for operations and finance
- Consolidate KPI data from multiple source systems into weekly business reports
- Analyse trends, variances, and exceptions across operational metrics
- Identify reporting gaps and propose data improvements
- Present findings to stakeholders in business review meetings
- Coordinate with data owners on source-data accuracy
- Track productivity and performance KPIs across recurring cadence

Requirements
- 3+ years reporting / analytics experience
- Strong Power BI, Excel, SQL fundamentals
- Stakeholder-facing reporting comfort`,
  },
  {
    name: "JD 4 · Operations Analyst",
    expected: "D_SUPPORT",
    jd: `Operations Analyst
Singapore

Support operations leadership through KPI reporting, performance analytics,
and decision-support reporting cadence.

Responsibilities
- Analyse operational performance: throughput, exceptions, SLA, productivity
- Build and maintain operations dashboards
- Consolidate weekly and monthly performance reports
- Track operational improvement programmes — milestones, dependencies, savings
- Surface exception patterns and root-cause data for ops leadership
- Coordinate with operations teams on data quality and reporting cadence
- Present analytical findings in business review meetings

Requirements
- 3+ years operations / supply chain analyst background
- Strong Excel, Power BI, basic SQL
- Operational domain literacy`,
  },
  {
    name: "JD 5 · Performance Analyst",
    expected: "D_SUPPORT",
    jd: `Performance Analyst
Singapore

You will own KPI governance and performance analytics across the supply
chain function — supporting monthly business reviews, productivity tracking,
and stakeholder-facing reporting.

Responsibilities
- KPI governance: define cadence, source-data ownership, reporting standards
- Develop performance dashboards in Power BI / Excel
- Consolidate productivity savings data and present to leadership
- Analyse cost variance, spend transparency, and operational performance
- Track improvement initiatives and savings delivery against committed targets
- Support PMO programmes through milestone tracking and risk reporting
- Coordinate with finance, procurement, and operations stakeholders

Requirements
- 3-5 years performance analytics / KPI reporting / business reporting
- Strong Power BI, Excel, SQL
- Stakeholder management and presentation skills`,
  },
  // ─── Boundary checks ─────────────────────────────────────────────────
  {
    name: "JD 6 · Pure Supply Planner (should NOT win D)",
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
    name: "JD 7 · Pure Procurement Executive (should NOT win D)",
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
    name: "JD 8 · Assistant Logistics Manager (should NOT win D)",
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
    name: "JD 9 · SC Business Analyst (should NOT win D)",
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
console.log("  D_SUPPORT Modernization · Regression Test");
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

  if (r.selectedTrack === "D_SUPPORT") {
    const pkg = getPromptPackage(r.selectedTrack, r.variantId);
    const checks = [
      ["Performance Analytics First priority", "Performance Analytics First"],
      ["Business Reporting Second priority", "Business Reporting Second"],
      ["Operations Support Third priority", "Operations Support Third"],
      ["Analyst Ownership Rule present", "ANALYST OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["TrackD base resume named", "Forest_Wang_TrackD_OperationsAnalytics.docx"],
      ["TrainingDataAnalytic content master named", "Forest_Wang_TrainingDataAnalytic.docx"],
      ["Project Bank evidence guardrails named", "Project_Bank_Analytics_AI.md"],
      ["Track A PharmaSC DO NOT USE guard", "ForestWang_PharmaSC.docx"],
      ["Track E DO NOT USE guard", "Forest_Wang_TrackE_SupplyChainBusinessAI.docx"],
      ["Analyst verb whitelist (Analysed)", "Analysed"],
      ["Analyst verb whitelist (Consolidated)", "Consolidated"],
      ["Anti-deflation guard", "Generated daily reports"],
      ["Anti-inflation guard (procurement category)", "Owned procurement category"],
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
