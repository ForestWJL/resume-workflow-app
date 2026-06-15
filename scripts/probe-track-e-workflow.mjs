// scripts/probe-track-e-workflow.mjs
//
// Track E workflow integration audit.
//
// Verifies that the workflow layer — not just the classifier — is fully
// upgraded to Track E:
//   1. Round 1 / Round 2 / Round 3 prompts are distinct (no D_SUPPORT reuse).
//   2. Each round mentions the Track E base resume by name.
//   3. Each round contains the explicit anti-positioning guard
//      (Junior Data Analyst / Reporting Analyst / Dashboard Developer /
//      BI Specialist / Software Engineer).
//   4. Each round mentions the 10 core Track E themes at least implicitly.
//   5. The four variant fragments differ from each other.
//   6. The variant resolver substitutes the {{VARIANT_POSITIONING}}
//      placeholder for known variants and falls back to "mixed" for unknown.
//   7. End-to-end PERSOL-style JD test: Router → Selected Track / Variant /
//      File stack / Round 1/2/3 prompt heads.

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
const { getPromptPackage, PROMPTS } = load(resolve(projectRoot, "config/prompts/index.ts"));
const { FILE_STACKS } = load(resolve(projectRoot, "config/fileStacks.ts"));
const {
  resolveETransformationPrompt,
  E_TRANSFORMATION_VARIANT_FRAGMENTS,
} = load(resolve(projectRoot, "config/prompts/E_TRANSFORMATION.ts"));

let pass = 0;
let fail = 0;
const note = (ok, name) => {
  console.log(`${ok ? "✅" : "❌"} ${name}`);
  if (ok) pass++;
  else fail++;
};

console.log("\n========== Track E Workflow Integration Audit ==========\n");

/* ───── 1 · R1/R2/R3 distinctness ─────────────────────────────────────── */
const pkg = PROMPTS.E_TRANSFORMATION;
console.log("--- Round distinctness ---");
note(typeof pkg.round1 === "string" && pkg.round1.length > 500, "Round 1 has substantial body");
note(typeof pkg.round2 === "string" && pkg.round2.length > 500, "Round 2 has substantial body");
note(typeof pkg.round3 === "string" && pkg.round3.length > 500, "Round 3 has substantial body");
note(pkg.round1 !== pkg.round2, "Round 1 ≠ Round 2 (not reused)");
note(pkg.round2 !== pkg.round3, "Round 2 ≠ Round 3 (not reused)");
note(pkg.round1 !== pkg.round3, "Round 1 ≠ Round 3 (not reused)");

/* ───── 2 · D_SUPPORT prompt is NOT reused ────────────────────────────── */
console.log("\n--- D_SUPPORT non-reuse ---");
const d = PROMPTS.D_SUPPORT;
note(pkg.round1 !== d.round1, "Track E Round 1 ≠ D_SUPPORT Round 1");
note(pkg.round2 !== d.round2, "Track E Round 2 ≠ D_SUPPORT Round 2");
note(pkg.round3 !== d.round3, "Track E Round 3 ≠ D_SUPPORT Round 3");

/* ───── 3 · Each round names the Track E base resume ──────────────────── */
console.log("\n--- Track E file references in rounds ---");
const baseResume = "Forest_Wang_TrackE_SupplyChainBusinessAI.docx";
note(pkg.round1.includes(baseResume), "Round 1 references the Track E base resume");
note(pkg.round2.includes(baseResume), "Round 2 references the Track E base resume");
note(pkg.round3.includes(baseResume), "Round 3 references the Track E base resume");

/* ───── 4a · Prompt refinement rules (round-3-feedback fixes) ──────────── */
console.log("\n--- Round 1 prompt refinements ---");
note(!pkg.round1.includes("Digital Supply Chain Analyst, Supply Chain Transformation Analyst"),
  "Round 1 role-strategist list compressed (no long 8-title enumeration)");
note(/Supply Chain Business Analyst[\s\S]{0,80}Supply Chain Transformation[\s\S]{0,80}Operations Excellence[\s\S]{0,80}AI & Digital Transformation/.test(pkg.round1),
  "Round 1 lists exactly 4 role families");
note(!pkg.round1.includes("A. 10 role-relevant skills"),
  "Round 1 output is no longer the 9-item A–I list");
note(pkg.round1.includes("JD Fit Assessment") && pkg.round1.includes("Top 10 ATS Keywords")
  && pkg.round1.includes("Resume Gaps") && pkg.round1.includes("Final Tailored Resume"),
  "Round 1 output is the new 4-item list (JD Fit · ATS · Gaps · Final Resume)");

console.log("\n--- Identity-block rules in every round ---");
for (const round of ["round1", "round2", "round3"]) {
  const body = pkg[round];
  note(body.includes("Operations First") && body.includes("Transformation Second")
    && body.includes("Technology Third"),
    `${round} contains the Operations First / Transformation Second / Technology Third priority`);
  note(body.includes("Business Ownership Rule"),
    `${round} contains the Business Ownership Rule block`);
  note(body.includes("identifying operational problems")
    && body.includes("analysing root causes")
    && body.includes("influencing decisions"),
    `${round} lists the ownership-reframing verbs`);
}

/* ───── 4 · Anti-positioning guards in every round ────────────────────── */
console.log("\n--- Anti-positioning guard in every round ---");
const forbidden = [
  "Junior Data Analyst",
  "Reporting Analyst",
  "Dashboard Developer",
  "BI Specialist",
  "Software Engineer",
];
for (const round of ["round1", "round2", "round3"]) {
  const body = pkg[round];
  for (const phrase of forbidden) {
    note(body.includes(phrase), `${round} explicitly names "${phrase}" as forbidden positioning`);
  }
}

/* ───── 5 · Each round invokes Track E core themes ────────────────────── */
console.log("\n--- Track E core themes referenced ---");
const themes = [
  "Business ownership",
  "Operational improvement",
  "Root cause analysis",
  "Workflow automation",
  "AI enablement",
  "Process redesign",
  "Stakeholder alignment",
  "Decision support",
  "Change management",
  "Digital transformation",
];
for (const round of ["round1", "round2", "round3"]) {
  const body = pkg[round];
  const hits = themes.filter((t) => body.includes(t)).length;
  note(hits >= 8, `${round} mentions ≥8/10 Track E core themes (got ${hits})`);
}

/* ───── 6 · Variant fragments differ from each other ──────────────────── */
console.log("\n--- Variant fragments are distinct ---");
const variantIds = [
  "E_TRANSFORMATION-mixed",
  "E-business-analyst",
  "E-transformation",
  "E-operations-excellence",
  "E-ai-enablement",
];
note(
  variantIds.every((v) => E_TRANSFORMATION_VARIANT_FRAGMENTS[v]),
  "All 4 + mixed variant fragments exist"
);
const fragmentSet = new Set(variantIds.map((v) => E_TRANSFORMATION_VARIANT_FRAGMENTS[v]));
note(fragmentSet.size === variantIds.length, "Variant fragments are all distinct strings");

const variantSignals = {
  "E-business-analyst": ["requirement gathering", "use case definition", "stakeholder workshops"],
  "E-transformation": ["transformation roadmap", "change management", "operating-model"],
  "E-operations-excellence": ["continuous improvement", "kaizen", "lean six sigma", "value stream mapping"],
  "E-ai-enablement": ["AI adoption", "AI enablement", "workflow automation", "agentic AI"],
};
for (const [vid, sigs] of Object.entries(variantSignals)) {
  const frag = E_TRANSFORMATION_VARIANT_FRAGMENTS[vid];
  const hits = sigs.filter((s) => frag.includes(s)).length;
  note(hits >= 3, `${vid} fragment leads with its signature keywords (${hits}/${sigs.length})`);
}

/* ───── 7 · Resolver substitutes the placeholder ──────────────────────── */
console.log("\n--- Resolver substitutes {{VARIANT_POSITIONING}} ---");
for (const vid of variantIds) {
  const resolved = resolveETransformationPrompt(vid);
  for (const round of ["round1", "round2", "round3"]) {
    note(
      !resolved[round].includes("{{VARIANT_POSITIONING}}"),
      `${round} fully substituted for variant ${vid}`
    );
  }
}

console.log("\n--- Unknown variant falls back to mixed ---");
const fallback = resolveETransformationPrompt("not-a-real-variant");
const mixed = resolveETransformationPrompt("E_TRANSFORMATION-mixed");
note(fallback.round1 === mixed.round1, "Unknown variant → mixed fallback (R1)");
note(fallback.round2 === mixed.round2, "Unknown variant → mixed fallback (R2)");
note(fallback.round3 === mixed.round3, "Unknown variant → mixed fallback (R3)");

/* ───── 8 · File stack loads the right artefacts ──────────────────────── */
console.log("\n--- E_TRANSFORMATION file stack ---");
const fs = FILE_STACKS.E_TRANSFORMATION;
note(
  fs.formatTemplate.fileName === "Forest_Wang_TrackE_SupplyChainBusinessAI.docx",
  "Format template = Forest_Wang_TrackE_SupplyChainBusinessAI.docx (primary)"
);
note(
  fs.contentMaster.fileName === "Forest_Wang_TrainingDataAnalytic.docx",
  "Content master = Forest_Wang_TrainingDataAnalytic.docx"
);
note(
  fs.evidenceBank.fileName === "Project_Bank_Analytics_AI.md",
  "Evidence bank = Project_Bank_Analytics_AI.md (AI Project Portfolio)"
);
note(
  fs.supportingReference.fileName === "Forest_Wang_TrackD_OperationsAnalytics.docx",
  "Supporting reference = Forest_Wang_TrackD_OperationsAnalytics.docx (Track D analytics)"
);

/* ───── 9 · getPromptPackage routes Track E through the resolver ──────── */
console.log("\n--- getPromptPackage routing ---");
const baviaPkg = getPromptPackage("E_TRANSFORMATION", "E-business-analyst");
const oexPkg = getPromptPackage("E_TRANSFORMATION", "E-operations-excellence");
note(baviaPkg.round1 !== oexPkg.round1, "Different variants → different R1 body via getPromptPackage");
note(baviaPkg.round2 !== oexPkg.round2, "Different variants → different R2 body");
note(baviaPkg.round3 !== oexPkg.round3, "Different variants → different R3 body");

const dPkg = getPromptPackage("D_SUPPORT", null);
note(dPkg === PROMPTS.D_SUPPORT, "Non-Track-E tracks fall through to static PROMPTS");

/* ───── 10 · End-to-end PERSOL-style JD test ──────────────────────────── */
console.log("\n--- End-to-end PERSOL-style JD ---");
const persolJD = `Supply Chain Business Analyst (AI & Digital Transformation)

About the role
We are seeking a Supply Chain Business Analyst who can lead digital transformation and AI enablement across our regional supply chain operations. The role partners with operations stakeholders to identify pain points, translate them into use cases, and deliver workflow automation, decision-support tools, and process redesign initiatives.

Responsibilities
- Lead requirement gathering and stakeholder workshops with senior operations leaders
- Translate business problems into use cases, workflows, and decision-support systems
- Drive AI-assisted workflow automation across planning and execution
- Root cause analysis on operational issues; propose continuous improvement actions
- Own the transformation roadmap for the SC function
- Cross-functional transformation with IT, finance, and commercial teams
- Process mapping, value stream mapping, and operating-model design

Background expected
- 8+ years supply chain operations experience
- Strong business ownership and stakeholder alignment skills
- Experience with workflow automation, AI enablement, and digital adoption
- Operational excellence mindset

This role is NOT a pure Data Analyst or BI Developer position.`;

const result = scoreJD({ jdText: persolJD });
note(result.selectedTrack === "E_TRANSFORMATION", `Selected track = E_TRANSFORMATION (got ${result.selectedTrack})`);
note(["Business Analyst", "Supply Chain Transformation", "Operations Excellence", "AI Enablement"].includes(result.variantName ?? ""),
  `Variant resolved to one of the 4 Track E variants (got: ${result.variantName})`);
note(result.recommendation === "Strong Apply", `Recommendation = Strong Apply (got ${result.recommendation})`);

const resolvedPkg = getPromptPackage(result.selectedTrack, result.variantId);
note(resolvedPkg.round1.includes(baseResume), "Resolved R1 mentions Track E base resume");
note(resolvedPkg.round1.includes("Junior Data Analyst"), "Resolved R1 contains anti-positioning guard");
note(!resolvedPkg.round1.includes("{{VARIANT_POSITIONING}}"), "Resolved R1 placeholder fully substituted");

/* ───── 11 · JD Alignment Rule in every round ─────────────────────────── */
console.log("\n--- JD Alignment Rule in every round ---");
for (const round of ["round1", "round2", "round3"]) {
  const body = pkg[round];
  note(body.includes("JD Alignment Rule"),
    `${round} contains the JD Alignment Rule block`);
  // Six business-outcome anchors must all be present
  const anchors = [
    "cost reduction",
    "service improvement",
    "risk mitigation",
    "inventory improvement",
    "stakeholder decision-making",
    "process efficiency",
  ];
  const hits = anchors.filter((a) => body.includes(a)).length;
  note(hits === 6, `${round} lists all 6 business-outcome anchors (got ${hits}/6)`);
  // Tool list (the bullet "must connect" trigger)
  const tools = ["Power BI", "SQL", "Python", "AI", "automation", "dashboards", "analytics"];
  const toolHits = tools.filter((t) => body.includes(t)).length;
  note(toolHits >= 6, `${round} JD Alignment Rule names the tools to gate (${toolHits}/${tools.length})`);
}

/* ───── 12 · Variant consistency end-to-end (Router → Workflow → Prompt) ── */
console.log("\n--- Variant consistency: Router → RoutingResult → display name → prompt ---");
const { TRACKS } = load(resolve(projectRoot, "config/tracks.ts"));

// Re-run the PERSOL JD and walk the variant through all four stages
const r = scoreJD({ jdText: persolJD });
const expectedVariants = TRACKS.E_TRANSFORMATION.variants ?? [];
const matchedVariant = expectedVariants.find((v) => v.id === r.variantId);

note(!!r.variantId, "Stage 1 (Router) — RoutingResult.variantId is populated");
note(!!r.variantName, "Stage 2 (Router) — RoutingResult.variantName is populated");
note(!!matchedVariant, `Stage 3 (RoutingResult vs TRACKS.variants) — variantId resolves to a real variant (${r.variantId})`);
note(matchedVariant ? matchedVariant.name === r.variantName : false,
  `Stage 4 (Display) — variantName matches the variant's name in tracks.ts ("${r.variantName}" === "${matchedVariant?.name}")`);

// The workflow page computes its "Sub-type" badge as routing.variantName when
// activeTrack === routing.selectedTrack; verify this end-to-end path.
const workflowSubtypeBadge =
  r.selectedTrack === "E_TRANSFORMATION" ? (r.variantName ?? null) : null;
note(workflowSubtypeBadge === r.variantName,
  `Stage 5 (Workflow Sub-type badge) — workflow display = "${workflowSubtypeBadge}" (same string as router)`);

// Verify the prompt resolver picks up the SAME variantId — no silent fallback to "mixed"
const resolvedFromRouter = getPromptPackage("E_TRANSFORMATION", r.variantId);
const resolvedDirect = resolveETransformationPrompt(r.variantId);
note(resolvedFromRouter.round1 === resolvedDirect.round1,
  "Stage 6 (Prompt) — getPromptPackage uses the same variant body as resolveETransformationPrompt");

// And explicitly verify it is NOT the mixed fallback (i.e. the variant fragment was actually injected)
const mixedRound1 = resolveETransformationPrompt("E_TRANSFORMATION-mixed").round1;
note(resolvedFromRouter.round1 !== mixedRound1,
  `Stage 7 (Prompt) — variant fragment for "${r.variantId}" was injected (not silently downgraded to "mixed")`);

// Cross-check: each of the 4 known variant ids round-trips cleanly
for (const v of expectedVariants) {
  const fromRouter = getPromptPackage("E_TRANSFORMATION", v.id);
  const direct = resolveETransformationPrompt(v.id);
  note(fromRouter.round1 === direct.round1,
    `Cross-check — variant "${v.id}" (${v.name}) is consistent through getPromptPackage`);
}

/* ───── Summary ───────────────────────────────────────────────────────── */
console.log("\n========================================================");
console.log(`Pass ${pass}  Fail ${fail}`);
console.log("========================================================");

/* ───── End-to-end output dump ────────────────────────────────────────── */
console.log("\n────── End-to-end test artefacts ──────");
console.log(`Router result:      Strong Apply / ${result.confidence} (${Math.round(result.confidenceRatio*100)}%)`);
console.log(`Selected Track:     ${result.selectedTrack}`);
console.log(`Variant:            ${result.variantName} (${result.variantId})`);
console.log(`Tracker tag:        ${result.trackerTag}`);
console.log(`Files loaded:`);
console.log(`  · Format template:      ${fs.formatTemplate.fileName}`);
console.log(`  · Content master:       ${fs.contentMaster.fileName}`);
console.log(`  · Evidence bank:        ${fs.evidenceBank.fileName}`);
console.log(`  · Supporting reference: ${fs.supportingReference.fileName}`);
console.log("");
console.log("Round 1 prompt — first 12 lines:");
console.log(resolvedPkg.round1.split("\n").slice(0, 12).map((l) => "  " + l).join("\n"));
console.log("");
console.log("Round 2 prompt — first 8 lines:");
console.log(resolvedPkg.round2.split("\n").slice(0, 8).map((l) => "  " + l).join("\n"));
console.log("");
console.log("Round 3 prompt — first 8 lines:");
console.log(resolvedPkg.round3.split("\n").slice(0, 8).map((l) => "  " + l).join("\n"));

process.exit(fail === 0 ? 0 : 1);
