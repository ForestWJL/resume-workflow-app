/**
 * Verifies `config/fileStacks.ts` for all six TrackId keys (local asset names).
 * Run: node scripts/probe-trackd.mjs
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

const { FILE_STACKS } = load(resolve(projectRoot, "config/fileStacks.ts"));

console.log("\n=== TRACK FILE STACK PROBE ===\n");

const EXPECTED = {
  A_PMC: {
    fmt: "ForestWang_PharmaSC.docx",
    content: "Supply Chain Operations Specialist.docx",
    evidence: "Sanofi_Interview_Final_Condensed.docx",
  },

  A_REGULATED: {
    fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
    content: "Supply Chain Operations Specialist.docx",
    evidence: "Sanofi_Interview_Final_Condensed.docx",
  },

  AB_HYBRID: {
    fmt: "Supply Chain Operations Specialist.docx",
    content: "ForestWang_PharmaSC.docx",
    evidence: "Sanofi_Interview_Final_Condensed.docx",
  },

  AC_DEMAND: {
    fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
    content: "Supply Chain Operations Specialist.docx",
    evidence: "Sanofi_Interview_Final_Condensed.docx",
  },

  CB_BUYER: {
    fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
    content: "Supply Chain Operations Specialist.docx",
    evidence: "Sanofi_Interview_Final_Condensed.docx",
  },

  D_SUPPORT: {
    fmt: "Forest_Wang_TrackD_OperationsAnalytics.docx",
    content: "Forest_Wang_TrainingDataAnalytic.docx",
    evidence: "Project_Bank_Analytics_AI.md",
  },

  E_TRANSFORMATION: {
    fmt: "Forest_Wang_TrackE_SupplyChainBusinessAI.docx",
    content: "Forest_Wang_TrainingDataAnalytic.docx",
    evidence: "Project_Bank_Analytics_AI.md",
  },
};

const results = [];

for (const trackId of Object.keys(EXPECTED)) {
  const s = FILE_STACKS[trackId];
  const exp = EXPECTED[trackId];

  if (!s) {
    console.log(`❌ ${trackId} missing in FILE_STACKS`);
    results.push(false);
    continue;
  }

  const ok =
    s.formatTemplate?.fileName === exp.fmt &&
    s.contentMaster?.fileName === exp.content &&
    s.evidenceBank?.fileName === exp.evidence;

  results.push(ok);

  console.log(`${ok ? "✅" : "❌"} ${trackId}`);

  console.log("   format:", s.formatTemplate?.fileName);
  console.log("   content:", s.contentMaster?.fileName);
  console.log("   evidence:", s.evidenceBank?.fileName);

  console.log("");
}

const allPass = results.every(Boolean);

console.log("=================================");
console.log(allPass ? "✅ ALL CHECKS PASS" : "❌ SOME CHECKS FAILED");
console.log("=================================");

process.exit(allPass ? 0 : 1);
