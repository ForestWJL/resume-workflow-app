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

const ALMAC_JD = `
Project Coordinator

The Role

You will be joining the Project Services department in Almac as a Project Coordinator.

Responsibilities:
- Track ordering and receipt of drug product
- Calculate quantities and allocate drug product
- Manage inventory levels
- Monitor expiry dates
- Arrange shipment coordination
- Conduct supply chain health checks
- Generate reports
- Draft detailed GMP instructions

Requirements:
- MS Office
- stakeholder management
- multi-tasking
- attention to detail
`;

const r = scoreJD({
  jdText: ALMAC_JD,
});

console.log("\n===== ALMAC PROBE =====\n");

console.log("selectedTrack:", r.selectedTrack);
console.log("variantName:", r.variantName);
console.log("recommendation:", r.recommendation);

console.log("\ntrack scores:");
for (const s of r.allTrackScores) {
  console.log(
    s.trackId,
    "raw=",
    s.rawScore
  );
}

console.log("\nreasoning:");
console.log(r.reasoningSummary);

console.log("\n===== END =====\n");

const validTracks = [
  "A_PMC",
  "A_REGULATED",
  "AB_HYBRID",
  "AC_DEMAND",
  "CB_BUYER",
  "D_SUPPORT",
];

const ok = validTracks.includes(r.selectedTrack);

console.log(
  ok
    ? "✅ VALID 6-TRACK RESULT"
    : "❌ INVALID TRACK RESULT"
);