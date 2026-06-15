// scripts/probe-track-e.mjs
// Track E (Supply Chain Business Analyst — AI & Digital Transformation) probe.
//
// Validates seven JD shapes:
//   1. Pure SC Business Analyst (transformation-led)               → E_TRANSFORMATION
//   2. SC Transformation Analyst (AI + change management)         → E_TRANSFORMATION
//   3. Operations Excellence Analyst (continuous improvement)      → E_TRANSFORMATION
//   4. Almac clinical-supply coordinator                           → A_REGULATED (safeguard)
//   5. Pure analytics (SQL / Power BI / KPI dashboards / no biz)   → D_SUPPORT (safeguard)
//   6. Classic Bio-Rad Supply Planner                              → A_PMC
//   7. Operations Coordinator (Rule 2 ops-execution-ownership)     → AB_HYBRID

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

const cases = [
  {
    name: "1 · Supply Chain Business Analyst (transformation-led)",
    expectedTrack: "E_TRANSFORMATION",
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
- Experience translating operations into workflows and use case definition
- Process mapping, value stream mapping, kaizen, lean six sigma`,
  },
  {
    name: "2 · Supply Chain Transformation Analyst (AI + change)",
    expectedTrack: "E_TRANSFORMATION",
    jd: `Supply Chain Transformation Analyst — AI & Digital
You will own the supply chain transformation roadmap including AI enablement, workflow automation, change management, and operating model design.

Key activities
- Define transformation initiative roadmaps across the SC operating model
- Drive AI adoption: identify AI-assisted use cases that improve decision support
- Workflow redesign and business process re-engineering across SC functions
- Change management, change adoption, digital adoption with operations users
- Cross-functional transformation with operations, IT, business analysts
- Stakeholder management at senior level

Skills
- AI enablement, workflow automation, RPA, agentic AI exposure
- Supply chain operations background, operations excellence mindset`,
  },
  {
    name: "3 · Operations Excellence Analyst (continuous improvement)",
    expectedTrack: "E_TRANSFORMATION",
    jd: `Operations Excellence Analyst
Drive operational excellence and continuous improvement across our supply chain operations.

You will:
- Lead continuous improvement and process improvement initiatives
- Run root cause analysis on operational gaps; develop improvement roadmap
- Process mapping and value stream mapping to identify operational visibility gaps
- Stakeholder management across operations, planning and procurement teams
- AI-driven decision support and workflow automation where applicable
- Change management for new operating model rollouts
- Kaizen events and lean six sigma improvement projects

Background expected
- 8–15 years SC / operations experience
- Business ownership mindset; transformation thinking`,
  },
  {
    name: "4 · Almac clinical-supply coordinator (regulated safeguard)",
    expectedTrack: "A_REGULATED",
    jd: `Project Coordinator
The Role
You will be joining the Project Services department in Almac as a Project Coordinator. The candidate will perform all tasks associated with the successful management of the clinical trial supplies of the customer.

Responsibilities
- Assist in the generation and maintenance of project plans
- Track ordering and receipt of drug product and components for production activities
- Calculate quantities and allocate drug product and components to production jobs
- Set up distribution protocols
- Manage inventory levels and monitor expiry dates
- Arrange for and track shipment of samples to the customer
- Monitor temperature excursions and conduct supply chain health checks
- Ensure proper documentation and approvals
- Draft detailed instructions in compliance with Good Manufacturing Practice`,
  },
  {
    name: "5 · Pure analytics / KPI / SQL (pure-analytics safeguard)",
    expectedTrack: "D_SUPPORT",
    jd: `Operations Analyst — Analytics & Reporting
The Role
You will build and maintain KPI dashboards, automate reports, and surface insights for the operations leadership team.

Responsibilities
- Build automated reports and dashboards in Power BI and Tableau
- KPI reporting and KPI dashboards for operations leadership
- Data analysis, data visualisation, KPI tracking
- SQL queries and Python pandas for data wrangling
- Data validation and reporting workflows

Required
- Strong SQL, T-SQL, Power BI, Tableau
- Data Analyst or Reporting Analyst or BI Analyst background`,
  },
  {
    name: "6 · Classic Bio-Rad Supply Planner (A_PMC unchanged)",
    expectedTrack: "A_PMC",
    jd: `Supply Planner III — Bio-Rad
Life-science MNC supply planning role. Strong inventory control, FEFO, SAP MM, demand planning, S&OP.

Responsibilities
- Inventory planning and stock control across regional warehouse network
- Material planning, production planning, replenishment
- Cycle count discipline, stock accuracy targets
- MRP execution, allocation, SAP discipline
- Supply planning for regulated pharma products`,
  },
  {
    name: "7 · Operations Coordinator (AB_HYBRID — ops execution)",
    expectedTrack: "AB_HYBRID",
    jd: `Operations Coordinator
The Role
You will own execution end-to-end across multiple workstreams, coordinating vendors, shipments, and documentation handling on behalf of the operations director.

Responsibilities
- Own execution of all operations workstreams
- Vendor follow-up and supplier coordination
- Coordinate shipments and handle documentation
- Issue escalation and resolution across stakeholders
- Cross-functional coordination with planning and warehouse teams
- Maintain inventory accuracy in our ERP / WMS
- Track stock levels and warehouse activity`,
  },
];

let pass = 0;
let fail = 0;

for (const c of cases) {
  const r = scoreJD({ jdText: c.jd });
  const expected = Array.isArray(c.expectedTrack) ? c.expectedTrack : [c.expectedTrack];
  const ok = expected.includes(r.selectedTrack);
  if (ok) pass++;
  else fail++;
  console.log(`\n${ok ? "✅" : "❌"} ${c.name}`);
  console.log(`   expected: ${expected.join(" | ")}    got: ${r.selectedTrack}`);
  console.log(`   recommendation: ${r.recommendation}    confidence: ${r.confidence} (${Math.round(r.confidenceRatio * 100)}%)`);
  console.log(`   variant: ${r.variantName ?? "(none)"}`);
  console.log(`   raw scores:`);
  for (const b of r.allTrackScores) {
    const flags = [];
    if (b.transformationOverrideApplied) flags.push("transformation-override");
    if (b.operationsExecutionOverrideApplied) flags.push("op-exec-override");
    if (b.trackDOwnershipRestrictionApplied) flags.push("D-ownership");
    if (b.analystTitleGuardApplied) flags.push("analyst-title-guard");
    if (b.clinicalSupplyGuardApplied) flags.push("clinical-guard");
    if (b.supportShapeAdjustmentApplied) flags.push("support-shape");
    if (b.thinEvidencePenaltyApplied) flags.push("thin-evidence");
    console.log(
      `     ${b.trackId.padEnd(17)} raw=${b.rawScore.toFixed(2).padStart(7)} ` +
      `t=${b.title.toFixed(1).padStart(5)} d=${b.domain.toFixed(1).padStart(5)} ` +
      `f=${b.functional.toFixed(1).padStart(5)} tool=${b.tool.toFixed(1).padStart(4)}` +
      (flags.length ? `  [${flags.join(", ")}]` : "")
    );
  }
  if (r.transformationOverride?.active || r.transformationOverride?.pureAnalyticsSafeguardBlockedOverride) {
    console.log(
      `   transformation-override: active=${r.transformationOverride.active} ` +
      `transformationHits=${r.transformationOverride.transformationHits} ` +
      `pureAnalyticsHits=${r.transformationOverride.pureAnalyticsHits} ` +
      `regSafeguardBlocked=${r.transformationOverride.regulatedSafeguardBlockedARegulated} ` +
      `paSafeguardBlocked=${r.transformationOverride.pureAnalyticsSafeguardBlockedOverride}`
    );
  }
}

console.log("\n=================================");
console.log(`Pass ${pass}  Fail ${fail}`);
console.log("=================================");
process.exit(fail === 0 ? 0 : 1);
