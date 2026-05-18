/**
 * Six-track routing smoke tests (regulated vs procurement vs file stacks).
 * Run: node scripts/probe-routing.mjs
 */
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
const { FILE_STACKS } = load(resolve(projectRoot, "config/fileStacks.ts"));

const TRACKS = [
  "A_PMC",
  "A_REGULATED",
  "AB_HYBRID",
  "AC_DEMAND",
  "CB_BUYER",
  "D_SUPPORT",
];

const REGULATED_JD = `
GMP Supply Chain Coordinator

Responsibilities:
- Support batch release documentation and batch record review
- Monitor expiry dates and FEFO inventory rotation
- Cold chain shipment coordination and temperature excursion reporting
- Clinical supply allocation and drug product inventory checks
- Maintain GDP-compliant documentation

Requirements:
- Pharmaceutical industry experience
- Attention to detail
`;

const PROCUREMENT_JD = `
Procurement Specialist

You will manage RFQ and RFI cycles, vendor quotations, and supplier evaluation.
Coordinate sourcing with internal stakeholders, run cost comparison sheets,
and maintain the vendor database. Support tender documentation and logistics
pricing templates.

Requirements:
- Excel, ERP
`;

function assertTrack(name, jd, expected) {
  const r = scoreJD({ jdText: jd });
  const ok = r.selectedTrack === expected;
  console.log(
    `${ok ? "✅" : "❌"} ${name}: expected ${expected}, got ${r.selectedTrack}`
  );
  if (!ok) {
    console.log("   reasoning:", r.reasoningSummary?.slice(0, 200) + "…");
  }
  return ok;
}

function assertRecommendation(label, jd) {
  const r = scoreJD({ jdText: jd });
  const allowed = ["Strong Apply", "Apply", "Stretch", "Skip"];
  const ok = allowed.includes(r.recommendation);
  console.log(
    `${ok ? "✅" : "❌"} ${label}: recommendation "${r.recommendation}"`
  );
  return ok;
}

console.log("\n=== ROUTING PROBE (6-track) ===\n");

let all = true;
all &&= assertTrack("regulated JD → A_REGULATED", REGULATED_JD, "A_REGULATED");
all &&= assertTrack("procurement JD → CB_BUYER", PROCUREMENT_JD, "CB_BUYER");
all &&= assertRecommendation("recommendation label set", REGULATED_JD);

console.log("\n--- FILE_STACKS keys ---\n");
for (const id of TRACKS) {
  const ok = !!FILE_STACKS[id];
  all &&= ok;
  console.log(`${ok ? "✅" : "❌"} FILE_STACKS[${id}]`);
}

console.log("\n=================================");
console.log(all ? "✅ ALL ROUTING CHECKS PASS" : "❌ SOME CHECKS FAILED");
console.log("=================================\n");

process.exit(all ? 0 : 1);
