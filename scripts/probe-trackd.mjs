// Track D verification probe — walks the F-checklist from the prompt update.

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
const { PROMPTS } = load(resolve(projectRoot, "config/prompts/index.ts"));

const expectedSlots = [
  { key: "formatTemplate",     fileName: "Forest_Wang_TrackD_OperationsAnalytics.docx",
    label: "Approved Base Resume / Format Anchor",          optional: false },
  { key: "contentMaster",      fileName: "Forest_Wang_TrainingDataAnalytic.docx",
    label: "Content Master",                                optional: false },
  { key: "evidenceBank",       fileName: "Project_Bank_Analytics_AI.md",
    label: "Project Bank / Evidence Guardrails",            optional: false },
  { key: "supportingReference", fileName: "Supply Chain Operations Specialist.docx",
    label: "Optional Domain Proof",                         optional: true },
];

const D = FILE_STACKS.D;
const results = [];

console.log("===== F. CHECKLIST =====\n");

// Checks 2–5: slot contents
for (let i = 0; i < expectedSlots.length; i++) {
  const exp = expectedSlots[i];
  const got = D[exp.key];
  const okFile = got.fileName === exp.fileName;
  const okLabel = got.label === exp.label;
  const okOptional = !!got.optional === exp.optional;
  const ok = okFile && okLabel && okOptional;
  results.push(ok);
  console.log(
    `Slot ${i + 1} [${ok ? "✅" : "❌"}]\n` +
    `   key:      ${exp.key}\n` +
    `   label:    "${got.label}" ${okLabel ? "" : `(expected "${exp.label}")`}\n` +
    `   file:     ${got.fileName} ${okFile ? "" : `(expected ${exp.fileName})`}\n` +
    `   optional: ${got.optional === true} ${okOptional ? "" : `(expected ${exp.optional})`}\n` +
    `   note:     ${got.note ?? "(none)"}\n`
  );
}

// Slot 1 ≠ Slot 2 (the original duplication bug)
const distinct = D.formatTemplate.fileName !== D.contentMaster.fileName;
results.push(distinct);
console.log(`No-duplicate-bug [${distinct ? "✅" : "❌"}] slot 1 ≠ slot 2: ${distinct}\n`);

// Track-level note
console.log(`Track-level note:\n   "${D.trackNote ?? "(none)"}"\n`);
results.push(typeof D.trackNote === "string" && D.trackNote.length > 0);

// Round 1 prompt content checks (checks 7 + 8)
const round1 = PROMPTS.D.round1;
const promptChecks = [
  { name: "references approved Track D base resume", re: /approved track d base resume/i },
  { name: "references content master",                re: /content master/i },
  { name: "references project bank / guardrails",     re: /project bank|evidence guardrails/i },
  { name: "references optional domain proof",         re: /optional domain proof/i },
  { name: "marks domain proof as optional / supply-chain-adjacent", re: /supply.chain.adjacent/i },
  { name: "no longer treats one file as both template + content master",
    re: /(format template).+\1/is, expectMatch: false },
  { name: "explicit honest project labels", re: /concept.+prototype.+in progress/is },
  { name: "blocks pure data-scientist positioning", re: /pure data scientist/i },
  { name: "blocks AI engineer positioning", re: /ai engineer/i },
  { name: "blocks pure supply chain manager positioning", re: /pure supply chain manager/i },
  { name: "title integrity preserved", re: /keep all company names.+job titles.+dates.+locations/is },
  { name: "discourages project overuse", re: /materially strengthen|do not overuse|do not flood/i },
];
console.log("Round 1 prompt checks:");
for (const c of promptChecks) {
  const matched = c.re.test(round1);
  const ok = (c.expectMatch === false) ? !matched : matched;
  results.push(ok);
  console.log(`   [${ok ? "✅" : "❌"}] ${c.name}`);
}

// Track A / B / C unchanged (snapshot key fields)
console.log("\nTrack A / B / C unchanged (spot check):");
const expectACBfileNames = {
  A: { fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
       content: "Supply Chain Operations Specialist.docx",
       evidence: "Sanofi_Interview_Final_Condensed.docx" },
  B: { fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
       content: "Supply Chain Operations Specialist.docx",
       evidence: "Sanofi_Interview_Final_Condensed.docx" },
  C: { fmt: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
       content: "Supply Chain Operations Specialist.docx",
       evidence: "Sanofi_Interview_Final_Condensed.docx" },
};
for (const t of ["A", "B", "C"]) {
  const s = FILE_STACKS[t];
  const exp = expectACBfileNames[t];
  const ok =
    s.formatTemplate.fileName === exp.fmt &&
    s.contentMaster.fileName === exp.content &&
    s.evidenceBank.fileName === exp.evidence &&
    s.formatTemplate.label === "Format Template" &&
    s.evidenceBank.label === "Experience Evidence Bank";
  results.push(ok);
  console.log(`   Track ${t} [${ok ? "✅" : "❌"}] labels + filenames preserved`);
}

const allPass = results.every(Boolean);
console.log("\n=========================================");
console.log(allPass ? "✅ ALL CHECKS PASS" : "❌ SOME CHECKS FAILED");
console.log("=========================================");

// Echo the salient prompt excerpt so the user can eyeball it.
console.log("\n----- Round 1 prompt — file roles excerpt -----");
const start = round1.indexOf("File roles");
const end   = round1.indexOf("Target role family");
if (start >= 0 && end >= 0) {
  console.log(round1.slice(start, end).trim());
}
console.log("\n----- Round 1 prompt — input list -----");
const inputsStart = round1.indexOf("I am uploading");
const inputsEnd   = round1.indexOf("File roles");
if (inputsStart >= 0 && inputsEnd >= 0) {
  console.log(round1.slice(inputsStart, inputsEnd).trim());
}
