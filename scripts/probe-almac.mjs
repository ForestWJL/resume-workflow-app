// End-to-end probe: run the real scoreJD() pipeline against the exact Almac JD.
// Uses jiti so @/… path aliases and .ts imports resolve the same as in Next.

import jitiFactory from "jiti";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// jiti v1 API: callable factory, returns a `require`-like loader.
const load = jitiFactory(projectRoot, {
  interopDefault: true,
  alias: { "@": projectRoot },
  esmResolve: true,
});

const { scoreJD } = load(resolve(projectRoot, "lib/score.ts"));

// Exact Almac JD from the transcript.
const ALMAC_JD = `Project Coordinator
The Role
You will be joining the Project Services department in Almac as a Project Coordinator. The Project Services department handles the day-to-day management of Almac Clinical Services customers, coordinating all aspects of the delivery of a customer's project.
The Project Coordinator, as entry level to the department, will work with and support Project Managers and/or the supply chain. The candidate will perform all tasks associated with the successful management of the clinical trial supplies of the customer.
Responsibilities
Assist in the generation and maintenance of project plans
Schedule operations to meet customer timelines
Track ordering and receipt of drug product and components for production activities
Calculate quantities and allocate drug product and components to production jobs
Set up distribution protocols with the Software Development/Quality Assurance Departments to enable a timely and accurate drug delivery process
Manage inventory levels and monitor expiry dates of components and supplies to ensure adequate quantities
Arrange for and track shipment of samples to the customer or third party
Monitor temperature excursions and conduct supply chain health checks on integrated studies
Communicate with customers and address their issues in a timely and professional manner
Support the Project Team and escalate issues when necessary
Ensure proper documentation and approvals
Generate accurate reports for relevant parties
Draft detailed instructions in compliance with Good Manufacturing Practice
Other tasks as required by the manager
Criteria
Bachelor's Degree in Life Science, Engineering or Business OR Diploma holder with relevant experience
Able to use MS Office Suite
Effective communication and stakeholder management skill
Able to multi-task
Attention to detail
Comfortable with working alone and as part of a team
Methodical
Comfortable with handling deadlines
Applicants must already be based in Singapore.
The office is situated in Changi Business Park.`;

const r = scoreJD({ jdText: ALMAC_JD });

// Pretty-print the RoutingResult the way the router card would render it.
console.log("╭─────────────────────────────────────────────────────────────╮");
console.log("│  FINAL ROUTER RESULT — Almac Project Coordinator (fresh)   │");
console.log("╰─────────────────────────────────────────────────────────────╯");
console.log("JD title guess:    ", r.jdTitleGuess);
console.log("JD company guess:  ", r.jdCompanyGuess || "(none)");
console.log("");
console.log("Selected track:    ", r.selectedTrack);
console.log("Variant:           ", r.variantName, `(${r.variantId})`);
console.log("Confidence:        ", r.confidence, `(${Math.round(r.confidenceRatio * 100)}%)`);
console.log("Worth-apply score: ", r.worthApplyingScore, "/ 100");
console.log("Recommendation:    ", r.recommendation);
console.log("Functional fit:    ", r.functionalFit);
console.log("Domain fit:        ", r.domainFit);
console.log("Lead type:         ", r.leadType);
console.log("");
console.log("Runner-up:         ", r.runnerUp
  ? `Track ${r.runnerUp.trackId} (raw ${r.runnerUp.rawScore}, gap ${r.runnerUp.gap})`
  : "(none)");
console.log("");
console.log("All track raw scores:");
for (const b of r.allTrackScores) {
  const flags = [];
  if (b.thinEvidencePenaltyApplied) flags.push("thin-evidence");
  if (b.supportShapeAdjustmentApplied) flags.push("support-shape-adj");
  if (b.clinicalSupplyGuardApplied) flags.push("clinical-guard");
  console.log(
    `  Track ${b.trackId}: raw=${b.rawScore.toFixed(2)}  ` +
    `title=${b.title.toFixed(1)}  domain=${b.domain.toFixed(1)}  ` +
    `functional=${b.functional.toFixed(1)}  tool=${b.tool.toFixed(1)}` +
    (flags.length ? `  [${flags.join(", ")}]` : "")
  );
}
console.log("");
console.log("Top matched signals (winner):");
console.log("  title:       ", r.topMatchedSignals?.title ?? []);
console.log("  domain:      ", r.topMatchedSignals?.domain ?? []);
console.log("  functional:  ", r.topMatchedSignals?.functional ?? []);
console.log("  tool:        ", r.topMatchedSignals?.tool ?? []);
console.log("");
console.log("Rescue / flags:");
console.log("  transferable:", r.transferable, " borderline:", r.borderline);
console.log("  promotedFrom:", r.promotedFrom ?? "(none)");
console.log("  rescueReason:", r.rescueReason ?? "(none)");
console.log("  seniorityPenaltyApplied:", r.seniorityPenaltyApplied);
console.log("");
console.log("Support-shape:");
console.log("  active:", r.supportShape?.active, " density:", r.supportShape?.density);
console.log("  A penalty applied:", r.supportShape?.trackAPenaltyApplied);
console.log("  B boost applied:  ", r.supportShape?.trackBBoostApplied);
console.log("  suppressed by full-weight A title:", r.supportShape?.suppressedByFullWeightATitle);
console.log("  suppressed by regulated-planning:",  r.supportShape?.suppressedByRegulatedPlanning);
console.log("  matched verbs:", r.supportShape?.matchedVerbs);
console.log("");
console.log("Tracker tag:");
console.log("  ", r.trackerTag);
console.log("");
console.log("Suggested next step:");
console.log("  ", r.suggestedNextStep);
console.log("");
console.log("Reasoning summary:");
console.log("  ", r.reasoningSummary);
console.log("");

// Acceptance check
const ok =
  r.selectedTrack === "A" &&
  r.variantName === "Regulated Clinical Supply Coordination" &&
  r.recommendation === "Light Tailor";
console.log("─────────────────────────────────────────────────────────────");
console.log("ACCEPTANCE:",
  ok ? "✅ PASS" : "❌ FAIL",
  "— expected Track A · Regulated Clinical Supply Coordination · Light Tailor");
console.log("  got:", r.selectedTrack, "·", r.variantName, "·", r.recommendation);
