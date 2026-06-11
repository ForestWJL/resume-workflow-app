// End-to-end probe for the Rules 1–6 classifier upgrade.
// Runs the real scoreJD() pipeline against four shaped JDs:
//   1. Operations / coordination / execution-ownership (the target of Rule 2)
//   2. Almac clinical-supply coordination — Rule 4 safeguard must protect A_REGULATED
//   3. Pure analyst / KPI / dashboard role — D_SUPPORT should still win
//   4. "Supply Chain Analyst — Planning" role — Rule 5 should block D_SUPPORT title pull
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
    name: "Operations / Coordination / Execution Ownership (Rule 2)",
    expectedTrack: "AB_HYBRID",
    jd: `Operations Coordinator
The Role
You will own execution end-to-end across multiple workstreams, coordinating vendors, shipments, and documentation handling on behalf of the operations director. The role requires you to operate independently, manage multiple workstreams, drive issue escalation and resolution, and own execution of day-to-day operations.

Responsibilities
- Own execution of all operations workstreams
- Vendor follow-up and supplier coordination
- Coordinate shipments and handle documentation
- Issue escalation and resolution across stakeholders
- Cross-functional coordination with planning, warehouse, and customer service teams
- Maintain inventory accuracy in our ERP / WMS
- Track stock levels and warehouse activity

Requirements
- Diploma or Bachelor's in supply chain / business
- Experience with ERP / WMS systems
- Strong stakeholder coordination skills`,
  },
  {
    name: "Almac clinical-supply coordinator (Rule 4 safeguard)",
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
    name: "Pure analytics / KPI role (Rule 3 should NOT block D_SUPPORT)",
    expectedTrack: "D_SUPPORT",
    jd: `Operations Analyst — Analytics & Reporting
The Role
You will build and maintain KPI dashboards, automate reports, and surface insights for the operations leadership team. Strong SQL, Python, and Power BI required.

Responsibilities
- Build automated reports and dashboards
- KPI reporting and performance reporting
- Data analysis and trend identification
- Stakeholder communication of insights
- Build visualisations in Power BI / Tableau
- SQL queries and Python pandas for data wrangling`,
  },
  {
    name: "Supply Chain Analyst — Planning (Rule 5 analyst-title guard)",
    expectedTrack: ["A_PMC", "AB_HYBRID", "AC_DEMAND"], // must not be D_SUPPORT
    jd: `Supply Chain Analyst
The Role
You will own supply planning, production planning, and material planning for our medical-device manufacturing operations. The analyst will drive demand forecast, manage safety stock, and coordinate with procurement.

Responsibilities
- Supply planning, production planning, material planning
- Demand forecast and forecast consolidation
- Manage safety stock and inventory turns
- Coordinate with procurement on raw material lead times
- Use SAP MM for ERP discipline
- Some KPI reporting`,
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
  console.log(`   recommendation: ${r.recommendation}    confidence: ${r.confidence} (${Math.round(r.confidenceRatio*100)}%)`);
  console.log(`   functionalFit: ${r.functionalFit}   domainFit: ${r.domainFit}`);
  console.log(`   raw scores:`);
  for (const b of r.allTrackScores) {
    const flags = [];
    if (b.operationsExecutionOverrideApplied) flags.push("op-exec-override");
    if (b.trackDOwnershipRestrictionApplied) flags.push("D-ownership-restrict");
    if (b.analystTitleGuardApplied) flags.push("analyst-title-guard");
    if (b.clinicalSupplyGuardApplied) flags.push("clinical-guard");
    if (b.supportShapeAdjustmentApplied) flags.push("support-shape-adj");
    if (b.thinEvidencePenaltyApplied) flags.push("thin-evidence");
    console.log(
      `     ${b.trackId.padEnd(13)} raw=${b.rawScore.toFixed(2).padStart(7)} ` +
      `t=${b.title.toFixed(1).padStart(5)} d=${b.domain.toFixed(1).padStart(5)} ` +
      `f=${b.functional.toFixed(1).padStart(5)} tool=${b.tool.toFixed(1).padStart(4)}` +
      (flags.length ? `  [${flags.join(", ")}]` : "")
    );
  }
  if (r.operationsExecutionOverride?.active) {
    console.log(`   op-exec override hits=${r.operationsExecutionOverride.hits}  regulatedHits=${r.operationsExecutionOverride.regulatedHits}  regSafeguardBlocked=${r.operationsExecutionOverride.regulatedSafeguardBlockedARegulated}`);
  }
  if (r.trackDOwnership?.active) {
    console.log(`   trackDOwnership hits=${r.trackDOwnership.hits} penaltyApplied=${r.trackDOwnership.trackDPenaltyApplied}`);
  }
  if (r.analystTitleGuard?.active) {
    console.log(`   analystTitleGuard share=${(r.analystTitleGuard.trackDTitleShare*100).toFixed(0)}% bestFunc=${r.analystTitleGuard.bestCompetingFunctional}`);
  }
}

console.log("\n=================================");
console.log(`Pass ${pass}  Fail ${fail}`);
console.log("=================================");
process.exit(fail === 0 ? 0 : 1);
