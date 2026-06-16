// scripts/demo-track-ab-regression.mjs
//
// Regression test for the AB_HYBRID modernization pass.
//
// Five ops-shape JDs from the review spec:
//   1. Logistics Executive               → expect AB_HYBRID
//   2. Operations Executive              → expect AB_HYBRID
//   3. Warehouse Executive               → expect AB_HYBRID
//   4. Assistant Logistics Manager       → expect AB_HYBRID
//   5. Supply Chain Operations Executive → expect AB_HYBRID
//
// Plus three boundary checks to confirm AB_HYBRID is NOT poaching from
// neighbouring tracks after the modernization:
//   6. Pure Supply Planner               → expect A_PMC (Track A guard)
//   7. Pure Procurement / Buyer          → expect CB_BUYER (CB guard)
//   8. Supply Chain Business Analyst     → expect E_TRANSFORMATION (Track E guard)

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
    name: "JD 1 · Logistics Executive",
    expected: "AB_HYBRID",
    jd: `Logistics Executive
Singapore

Responsibilities
- Manage daily logistics operations: receiving, put-away, picking, packing, and dispatch coordination
- Coordinate with 3PL partners on shipment scheduling and exception escalations
- Own order fulfilment cycle and OTIF performance for assigned customers
- Resolve operational exceptions across warehouse, transport, and customer-service teams
- Process compliance and SOP discipline across daily workflows
- Inventory flow management and stock availability across the warehouse network

Requirements
- 3-5 years logistics operations experience
- Strong stakeholder management with 3PL, internal teams, and customers
- WMS / SAP MM familiarity`,
  },
  {
    name: "JD 2 · Operations Executive",
    expected: "AB_HYBRID",
    jd: `Operations Executive
Singapore

We are seeking an Operations Executive to own end-to-end operational
execution across logistics, inventory, and order fulfilment.

Responsibilities
- Manage daily operations across warehouse, transport, and customer service
- Coordinate cross-functional teams to resolve operational exceptions
- Drive process compliance and SOP adherence
- KPI tracking and performance reporting for service level, fill rate, and OTIF
- Own backlog resolution and exception escalation
- Stakeholder management with internal teams and external 3PL partners
- Continuous improvement of operational workflows

Requirements
- 5+ years operations execution background
- Strong coordination and ownership mindset
- WMS / ERP discipline`,
  },
  {
    name: "JD 3 · Warehouse Executive",
    expected: "AB_HYBRID",
    jd: `Warehouse Executive
Singapore

You will lead daily warehouse operations, manage the shift team, and own
exception resolution across the regional distribution centre.

Responsibilities
- Lead daily warehouse operations across receiving, put-away, picking, packing, and dispatch
- Manage shift team leaders and contractor staff; own team coordination, briefings, and escalation handling
- Coordinate cross-functional execution with transport providers, 3PL partners, and customer service
- Drive operational SOP compliance, process improvement, and daily operational rhythm
- Own exception resolution: investigate root causes, coordinate corrective actions, escalate when needed
- Manage 3PL service-level reviews and OTIF delivery performance for assigned customer accounts
- Stakeholder management with internal departments, vendors, and customer representatives

Requirements
- 3-5 years warehouse / logistics operations leadership experience
- Strong people coordination, exception resolution, and stakeholder management
- Operations execution discipline; WMS familiarity an advantage`,
  },
  {
    name: "JD 4 · Assistant Logistics Manager",
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
- 5+ years logistics operations experience with team leadership background
- Strong process improvement, exception resolution, and stakeholder management
- WMS / SAP MM / 3PL coordination expertise`,
  },
  {
    name: "JD 5 · Supply Chain Operations Executive",
    expected: "AB_HYBRID",
    jd: `Supply Chain Operations Executive
Singapore

Own end-to-end supply chain operations across order fulfilment, inventory
flow, and 3PL performance management.

Responsibilities
- Manage end-to-end supply chain operations from order receipt through customer delivery
- Coordinate across planning, warehouse, transport, and 3PL partners
- Own KPI performance — OTIF, fill rate, exception resolution time, cost-to-serve
- Resolve operational exceptions across the network
- Process compliance and continuous improvement of recurring workflows
- Stakeholder management across internal departments and 3PL ecosystem
- Team coordination across shift and partner teams

Requirements
- 5-8 years supply chain operations experience
- Strong execution ownership, coordination, and stakeholder management
- WMS / SAP MM / 3PL management discipline`,
  },
  // ─── Boundary checks ─────────────────────────────────────────────────
  {
    name: "JD 6 · Pure Supply Planner (boundary — should NOT win AB)",
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
    name: "JD 7 · Pure Procurement / Buyer (boundary — should NOT win AB)",
    expected: "CB_BUYER",
    jd: `Procurement Executive
Singapore

Responsibilities
- Manage end-to-end procurement: RFQ, RFI, supplier evaluation, vendor onboarding
- Negotiate contracts and pricing with strategic suppliers
- Issue purchase orders and manage vendor follow-up in SAP MM
- Source new vendors and run quotation comparison cycles
- Procurement records, vendor database, contract management
- Cost analysis and pricing benchmarking

Requirements
- 3-5 years procurement / sourcing experience
- Strong RFQ / RFI / vendor evaluation background
- SAP MM and contract management discipline`,
  },
  {
    name: "JD 8 · SC Business Analyst (boundary — should NOT win AB)",
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
console.log("  AB_HYBRID Modernization · Regression Test");
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

  // For AB winners, confirm the new prompt content is wired
  if (r.selectedTrack === "AB_HYBRID") {
    const pkg = getPromptPackage(r.selectedTrack, r.variantId);
    const checks = [
      ["Operations First priority", "Operations First"],
      ["Coordination Second priority", "Coordination Second"],
      ["Technology Third priority", "Technology Third"],
      ["Operations Ownership Rule present", "OPERATIONS OWNERSHIP RULE"],
      ["JD Alignment Rule present", "JD ALIGNMENT RULE"],
      ["SC Ops Specialist base resume named", "Supply Chain Operations Specialist.docx"],
      ["PharmaSC content master named", "ForestWang_PharmaSC.docx"],
      ["Track D MASTER DO NOT USE guard", "TrackD_DataAnalyst_MASTER"],
      ["Track E MASTER DO NOT USE guard", "TrackE_SupplyChainBusinessAI"],
      ["Verb whitelist Led/Managed/Coordinated", "Led"],
      ["Verb blacklist Supported/Assisted", "Supported"],
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
