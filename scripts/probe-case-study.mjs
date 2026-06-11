// Case-study probe.
// Asserts the recruiter-facing landing page renders all required sections
// with the expected anchors and copy.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
// Case-study copy is centralised in config/caseStudy.ts and referenced from
// app/page.tsx via {CASE_STUDY.*}. Concat both sources for content checks.
const pageOnly = readFileSync(resolve(projectRoot, "app/page.tsx"), "utf8");
const cfgSrc = readFileSync(resolve(projectRoot, "config/caseStudy.ts"), "utf8");
const pageSrc = pageOnly + "\n" + cfgSrc;
const navSrc = readFileSync(resolve(projectRoot, "components/Nav.tsx"), "utf8");
const layoutSrc = readFileSync(resolve(projectRoot, "app/layout.tsx"), "utf8");

const checks = [
  // Title + spine
  { name: "Brand uses new title", re: /AI-Assisted Opportunity Screening/, src: pageSrc },
  { name: "Subtitle present", re: /Applying supply chain prioritisation and workflow routing/, src: pageSrc },
  { name: "Spine sentence quoted", re: /exception-management and prioritisation logic/, src: pageSrc },

  // Required sections (new order: Hero, Summary, Workflow, Why, Week, Impact, BuiltBy)
  { name: "Executive Summary anchor", re: /id="summary"/, src: pageSrc },
  { name: "Workflow anchor", re: /id="workflow"/, src: pageSrc },
  { name: "Why I Built This anchor", re: /id="why"/, src: pageSrc },
  { name: "Representative Week anchor", re: /id="week"/, src: pageSrc },
  { name: "Business Impact anchor", re: /id="impact"/, src: pageSrc },
  { name: "Built By anchor", re: /id="built-by"/, src: pageSrc },

  // Executive Summary content
  { name: "Exec summary · Problem", re: /Problem/, src: pageSrc },
  { name: "Exec summary · Solution", re: /Solution/, src: pageSrc },
  { name: "Exec summary · Outcome", re: /Outcome/, src: pageSrc },
  { name: "Exec summary · Technology Stack", re: /Technology Stack/, src: pageSrc },
  { name: "Tech stack lists Claude", re: /Claude/, src: pageSrc },
  { name: "Tech stack lists GPT", re: /GPT/, src: pageSrc },
  { name: "Tech stack lists Gmail", re: /Gmail/, src: pageSrc },
  { name: "Tech stack lists Excel", re: /Excel/, src: pageSrc },
  { name: "Tech stack lists Next.js", re: /Next\.js/, src: pageSrc },

  // Built By has the "Why this project matters" intro
  { name: "Built By intro: 'Why this project matters'", re: /Why this project matters/, src: pageSrc },
  { name: "Built By intro: 'operational decision-making principles'", re: /operational decision-making principles/, src: pageSrc },

  // AI visibility
  { name: "AI-assisted classification visible", re: /AI-assisted/, src: pageSrc },
  { name: "Human-in-the-loop visible", re: /human-in-the-loop|Human-in-the-loop/, src: pageSrc },

  // Production Run Example (NEW)
  { name: "Production Run Example anchor", re: /id="production"/, src: pageSrc },
  { name: "Production Run · 08:00 entry", re: /08:00/, src: pageSrc },
  { name: "Production Run · 08:03 entry", re: /08:03/, src: pageSrc },
  { name: "Production Run · 08:05 entry", re: /08:05/, src: pageSrc },
  { name: "Production Run · 08:06 entry", re: /08:06/, src: pageSrc },
  { name: "Production Run · ingestion title", re: /Gmail and web sources ingested/, src: pageSrc },
  { name: "Production Run · dedup title", re: /Deduplication completed/, src: pageSrc },
  { name: "Production Run · AI classification title", re: /AI classification and scoring completed/, src: pageSrc },
  { name: "Production Run · audit tracker title", re: /Audit tracker updated/, src: pageSrc },
  { name: "Production Run · raw alerts count", re: /196 raw alerts captured/, src: pageSrc },
  { name: "Production Run · unique opps count", re: /49 unique opportunities/, src: pageSrc },
  { name: "Production Run · prioritised count", re: /23 prioritised/, src: pageSrc },
  { name: "Production Run · tracker filename", re: /job_triage_log_LIVE\.xlsx refreshed/, src: pageSrc },

  // Real numbers from this week
  { name: "196 raw alerts shown", re: /196/, src: pageSrc },
  { name: "49 unique opportunities shown", re: /49/, src: pageSrc },
  { name: "23 prioritised entries shown", re: /23/, src: pageSrc },

  // What it demonstrates
  { name: "Workflow automation mentioned", re: /Workflow automation/, src: pageSrc },
  { name: "Classification design mentioned", re: /Classification design/, src: pageSrc },
  { name: "Decision support mentioned", re: /Decision support/, src: pageSrc },
  { name: "AI-assisted prioritisation mentioned", re: /AI-assisted prioritisation/, src: pageSrc },
  { name: "Human-in-the-loop review mentioned", re: /Human-in-the-loop review/, src: pageSrc },

  // Operator brand list
  { name: "Sanofi listed", re: /Sanofi/, src: pageSrc },
  { name: "YCH listed", re: /YCH/, src: pageSrc },
  { name: "Cainiao listed", re: /Cainiao/, src: pageSrc },
  { name: "Ryder listed", re: /Ryder/, src: pageSrc },
  { name: "CWT listed", re: /CWT/, src: pageSrc },

  // Stage 7 evidence
  { name: "Tracker file referenced", re: /job_triage_log_LIVE\.xlsx/, src: pageSrc },
  { name: "Tracker preview rows present", re: /TRACKER_PREVIEW/, src: pageSrc },

  // Nav uses new labels
  { name: "Nav: Case Study", re: /label: "Case Study"/, src: navSrc },
  { name: "Nav: Screening", re: /label: "Screening"/, src: navSrc },
  { name: "Nav: Workflow", re: /label: "Workflow"/, src: navSrc },
  { name: "Nav: Knowledge", re: /label: "Knowledge"/, src: navSrc },
  { name: "Nav: Resources", re: /label: "Resources"/, src: navSrc },
  { name: "Brand mark uses new title", re: /AI-Assisted Opportunity Screening/, src: navSrc },

  // Layout metadata
  { name: "Layout title swapped", re: /title:\s*"AI-Assisted Opportunity Screening/, src: layoutSrc },
  { name: "Footer swapped", re: /runs[\s\n]+entirely on your device/, src: layoutSrc },

  // Sentences we must NOT include
  { name: "No 'Resume Workflow' brand left", re: /Resume Workflow/, src: pageOnly, expectMatch: false },
  { name: "No 'Page 1 · JD Router' chrome", re: /Page 1 · JD Router/, src: pageOnly, expectMatch: false },
  { name: "Old long brand not used anywhere on page", re: /Supply Chain Opportunity Screening/, src: pageOnly, expectMatch: false },
];

let pass = 0;
let fail = 0;
for (const c of checks) {
  const matched = c.re.test(c.src);
  const ok = c.expectMatch === false ? !matched : matched;
  console.log(`${ok ? "✅" : "❌"} ${c.name}`);
  if (ok) pass++;
  else fail++;
}
console.log("");
console.log("=================================");
console.log(`${fail === 0 ? "✅" : "❌"} pass ${pass}  fail ${fail}`);
console.log("=================================");
process.exit(fail === 0 ? 0 : 1);
