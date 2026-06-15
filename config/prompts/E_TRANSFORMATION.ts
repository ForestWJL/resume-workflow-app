// config/prompts/E_TRANSFORMATION.ts
//
// Track E — Supply Chain Business Analyst (AI & Digital Transformation).
//
// Distinct Round 1 / Round 2 / Round 3 prompt bodies — never reuse D_SUPPORT
// content. Track E positions the candidate as an operations-first practitioner
// who applies AI, automation, analytics and workflow redesign to solve
// business problems — NOT as a Data Analyst / Reporting Analyst / Dashboard
// Developer / BI Specialist / Software Engineer.
//
// Each round body contains a {{VARIANT_POSITIONING}} placeholder. The four
// variants (Business Analyst · Supply Chain Transformation · Operations
// Excellence · AI Enablement) each inject a distinct positioning fragment
// covering: variant lead, anchor companies/projects, and forbidden drifts.
//
// Use `resolveETransformationPrompt(variantId)` to substitute. The router
// resolves the variant id and the workflow page passes it through.

import type { TrackPromptPackage } from "./index";

/* ─────────────────────────────────────────────────────────────────────────
 * Shared identity block injected into every round — Track E core themes.
 * ────────────────────────────────────────────────────────────────────── */

const TRACK_E_CORE_IDENTITY = `Track E core themes (apply to every output):
  • Business ownership
  • Operational improvement
  • Root cause analysis
  • Workflow automation
  • AI enablement
  • Process redesign
  • Stakeholder alignment
  • Decision support
  • Change management
  • Digital transformation

Reading priority — the resume must read:
  1. Operations First
  2. Transformation Second
  3. Technology Third
If any sentence reverses this order, rewrite it.

Position me as a supply chain professional (8–15+ years of operational
experience) who applies AI, analytics, automation, workflow redesign, and
digital transformation to solve business problems. AI is used to improve
business outcomes — not as identity.

Business Ownership Rule (Track E — non-negotiable):
When strengthening bullets, do NOT merely describe reporting, monitoring,
or dashboard creation. Whenever supported by evidence, frame the work as:
  • identifying operational problems
  • analysing root causes
  • influencing decisions
  • driving operational improvements
  • supporting business outcomes
rather than reporting activities alone. "Built a dashboard" is a Track D
sentence. "Owned the operational call on stock-at-risk and drove the
decision through to action" is a Track E sentence.

JD Alignment Rule (Track E — non-negotiable):
Prioritise business outcomes and operational impact over tools. A bullet
that mentions Power BI, SQL, Python, AI, automation, dashboards, or
analytics MUST clearly connect to at least one of:
  • cost reduction
  • service improvement
  • risk mitigation
  • inventory improvement
  • stakeholder decision-making
  • process efficiency
Otherwise rewrite the bullet. The hiring manager is not buying a Power BI
user; they are buying someone who uses Power BI to solve a supply chain
problem. Every tool mention must answer "to what business end?"

NEVER position me as any of the following unless the JD explicitly requires
those titles in this exact wording:
  • Junior Data Analyst
  • Reporting Analyst
  • Dashboard Developer
  • BI Specialist / BI Developer
  • Data Scientist
  • Software Engineer
  • AI Researcher
  • Pure Supply Chain Manager
If the JD uses any of these words, anchor on the operations-side application
of the skill — never on the technical job title alone.`;

const TRACK_E_FILE_ROLES = `File roles for this Track E tailoring run:
  • Approved Track E Base Resume — Forest_Wang_TrackE_SupplyChainBusinessAI.docx
    Primary baseline. Use as the structural anchor and the default wording
    source. Stay close to its format, section order, density, and tone.

  • Content Master — Forest_Wang_TrainingDataAnalytic.docx
    Deeper evidence source. Use it to pull stronger phrasing or alternate
    bullets when the base resume is too thin for a specific JD requirement.
    It is a quarry, not a template.

  • AI Project Portfolio / Evidence Guardrails — Project_Bank_Analytics_AI.md
    Honesty and wording guardrail for projects, portfolio links, AI projects,
    and workflow work. Pull a project in only when it materially strengthens
    the Track E case for this JD. Follow the bank's labels exactly — concept
    / prototype / in progress / shipped — and use the resume-safe wording.

  • Supporting Track D Analytics Evidence — Forest_Wang_TrackD_OperationsAnalytics.docx
    Optional. Use only when the JD has analytics-adjacent tooling that needs
    light reinforcement.`;

/* ─────────────────────────────────────────────────────────────────────────
 * Round 1 — Build the tailored Track E response (McKinsey-style)
 * ────────────────────────────────────────────────────────────────────── */

const ROUND_1 = `Act as both:
1) an ATS simulator, and
2) a resume strategist for:
   - Supply Chain Business Analyst
   - Supply Chain Transformation
   - Operations Excellence
   - AI & Digital Transformation
   roles.

${TRACK_E_FILE_ROLES}

${TRACK_E_CORE_IDENTITY}

{{VARIANT_POSITIONING}}

Title integrity rule:
- Keep all company names, official job titles, dates, and locations exactly
  as they appear in the approved Track E base resume.
- Do not rename, retitle, or relocate any role unless I explicitly approve a
  change.

Global rules:
- Treat the approved Track E base resume as the format and wording anchor.
- Keep the final resume ideally within 3 pages (the v1c base is 3 pages).
- Strengthen ATS match and recruiter clarity.
- Use natural human language.
- Make the top third strong enough for a 6-second HR scan.
- Be conservative, realistic, and credibility-first.
- Do not invent experience, tools, metrics, systems, certifications, or
  domain exposure.
- Label inferred items as Transferable.
- Unfinished projects must be labeled honestly as concept, prototype, or in
  progress — follow the AI Project Portfolio's labels exactly.
- Frame projects as Opportunity Intelligence & Workflow Automation Platform
  (Live) and Operational Visibility & Exception Management Platform (Live
  Demo) — never as "AI engineer side project."

For this role family, prioritize:
- Supply chain operations experience (Sanofi · Cainiao · YCH = high;
  CWT = medium; Ryder = supporting)
- Operational improvement experience — root cause analysis, process mapping,
  KPI design, cost-to-serve improvement
- Stakeholder management and cross-functional alignment
- AI adoption, AI enablement, AI-assisted workflow design
- Workflow automation, workflow redesign, business process re-engineering
- Decision-support capability — building tools that help operators decide
- Digital transformation exposure and change management
- Business ownership — owning the call, not just reporting the call
- Operating-model thinking — translating operational problems into use
  cases and workflows

De-emphasize:
- Pure-coding identity (Python wrangling for its own sake)
- Pure-analytics identity (KPI dashboards for their own sake)
- AI-research / model-development identity
- Generic supply chain manager identity without transformation hooks

Focus on tailoring the resume. The Router has already done the analysis
work — do not duplicate it. Spend your effort on the rewrite, not on
re-reporting JD insights.

Output (four items only):

1. JD Fit Assessment — 3–5 sentences. What does the JD really want, and
   how does the approved Track E base resume already match it? Lead with
   the Track E identity, not with tools.

2. Top 10 ATS Keywords — the 10 highest-priority phrases from this JD
   that must appear naturally in the final resume.

3. Resume Gaps — keyword / phrasing / positioning gaps between the
   approved Track E base resume and the JD. Separate real gaps from
   positioning gaps. Pull additional evidence from the content master,
   AI portfolio, or Track D analytics resume ONLY when the base resume
   is genuinely thin.

4. Final Tailored Resume — the rewritten resume text, anchored on the
   approved Track E base resume's format and wording. Rewrite only the
   highest-impact sections (top third + bullets where Track E framing
   can be tightened).`;

/* ─────────────────────────────────────────────────────────────────────────
 * Round 2 — Conservative refinement
 * ────────────────────────────────────────────────────────────────────── */

const ROUND_2 = `Please do a final conservative content refinement of this Track E resume
for the target role. Do NOT re-analyse the JD. Do NOT rewrite the resume.
Keep the current format, structure, and overall wording style.

Anchor file: Forest_Wang_TrackE_SupplyChainBusinessAI.docx (the approved
Track E base resume — every refinement must stay faithful to this file's
section order, titles, dates, and metric anchors).

${TRACK_E_CORE_IDENTITY}

{{VARIANT_POSITIONING}}

Title integrity rule:
- Keep all company names, official job titles, dates, and locations exactly
  as they appear in the approved Track E base resume.
- Do not rename, retitle, or relocate any role.

Refine ONLY the following layers:

1. Top third (Name → Subtitle → Summary → Key Achievements → top row of
   Core Competencies). Make sure it passes a 6-second recruiter scan with
   the Track E identity (Supply Chain Business Analyst · AI & Digital
   Transformation) — not Data Analyst, not BI Developer.

2. Bullet wording where Track E framing can be tightened:
   - Lead bullets with ownership / decision verbs ("owned", "drove",
     "redesigned", "translated", "stood up") — not passive analytics verbs
     ("analysed", "reported", "tracked").
   - Replace any wording that drifts toward a Data Analyst / BI Developer
     / Reporting Analyst identity with operations-first phrasing.
   - Keep AI as enabler, not identity, in every mention.

3. Core Competencies emphasis — reorder the 3-column grid so the variant-
   relevant competencies sit in the top row (left to right). Do not add or
   remove competencies; only reorder.

4. Selected AI & Transformation Projects — confirm the names read as
   business platforms (Opportunity Intelligence & Workflow Automation
   Platform · Operational Visibility & Exception Management Platform) and
   not as technical demos. Tighten the one-line description if needed.

5. Additional Commercial & Leadership Experience — confirm Hand Global,
   Tianci, Edulight, Taiping read as transferable business / stakeholder
   / vendor management experience, not as marketing/sales identities.

Strict don'ts:
- Don't invent experience, tools, metrics, systems, or domain exposure.
- Don't change company / title / date / location strings.
- Don't reposition me as Data Analyst / Reporting Analyst / Dashboard
  Developer / BI Specialist / Software Engineer / AI Researcher.
- Don't relabel projects as "Concept" / "Portfolio Project" — Track E uses
  business-platform framing for the live ones.

Output:
A. Updated final resume text (only the refined sections)
B. Top 5 final refinements made (one line each, anchored on the variant emphasis)
C. Any optional subtitle suggestions (separate only, not applied)
D. Metrics to verify`;

/* ─────────────────────────────────────────────────────────────────────────
 * Round 3 — Recruiter QA / ATS review
 * ────────────────────────────────────────────────────────────────────── */

const ROUND_3 = `Act as a final ATS reviewer and recruiter QA editor for a Track E (Supply
Chain Business Analyst — AI & Digital Transformation) resume.

Anchor file: Forest_Wang_TrackE_SupplyChainBusinessAI.docx (the approved
Track E base resume — the QA review is against this file's titles, dates,
metrics, and structure).

Do NOT rewrite the resume. Do NOT change any official company names, job
titles, dates, or locations. Focus only on final QA checks and light
wording corrections.

${TRACK_E_CORE_IDENTITY}

{{VARIANT_POSITIONING}}

Title integrity check:
- Verify all company names, official job titles, dates, and locations
  remain exactly as in the approved Track E base resume.
- Flag any title changes, reinterpretations, or role relabeling.

Track E identity check — the top section must signal "Supply Chain
Business Analyst (AI & Digital Transformation)", NOT any of:
  • Junior Data Analyst
  • Reporting Analyst
  • Dashboard Developer
  • BI Specialist / BI Developer
  • Data Scientist
  • Software Engineer
  • AI Researcher
  • Pure Supply Chain Manager

If the resume drifts toward any of those identities, flag the exact line
and propose a light rewording — do not apply it automatically.

Please review the resume and check:
1. Top third — does it pass a 6-second recruiter scan as a Supply Chain
   Business Analyst (AI & Digital Transformation)?
2. Are the official titles preserved exactly?
3. Is the wording natural, concise, and recruiter-friendly?
4. Are the strongest variant-relevant experiences and projects visible
   enough? (See variant emphasis above.)
5. Are there any ATS keyword gaps for the JD's transformation/AI vocabulary?
6. Are there any credibility risks — AI claims that read as research/SWE
   identity, or P&L claims that imply a seniority I haven't held?
7. Are projects framed as business platforms with clear operational
   purpose, not as "Concept Project" or "Portfolio Project" wording?
8. Is AI consistently framed as an enabler of business outcomes — not as
   identity?
9. Is the candidate's Operations-first identity intact across every role?
10. Are all hard metrics (45 months · 30% · 20% · 11 months · 9 months
    break-even · 130% · RMB 3M · 50% · 80% · 300% · USD 100K · 10 HP
    lines · 375 hours · 11 modules) intact and unchanged?

Output:
A. Top 5 final fixes only (Track E framing focused)
B. Any title / company / date integrity issues
C. Any credibility risks (esp. anything drifting toward forbidden identities)
D. Any repeated-word / grammar issues found
E. Submission readiness: Yes / Almost / No`;

/* ─────────────────────────────────────────────────────────────────────────
 * Variant-specific positioning fragments
 * Each fragment is injected at the {{VARIANT_POSITIONING}} placeholder in
 * every round. They lead with the variant emphasis, list anchor companies/
 * projects, and call out forbidden drifts unique to that variant.
 * ────────────────────────────────────────────────────────────────────── */

export const E_TRANSFORMATION_VARIANT_FRAGMENTS: Record<string, string> = {
  // Default fragment when no variant is resolved (mixed JD)
  "E_TRANSFORMATION-mixed": `Variant emphasis (Track E — mixed / balanced JD):
- Lead with operations ownership + AI as business enabler. No single variant
  dominates this JD — keep all four pillars visible in the top half:
  business analyst skills, transformation roadmap, operations excellence,
  AI enablement.
- Anchor balanced: Sanofi (regulated SC discipline + decision support) +
  Cainiao (operational visibility + exception management) + YCH
  (cost-to-serve + stakeholder alignment) + CWT (UAT + process redesign).
- Forbidden drifts: any positioning that picks a single sub-identity over
  the others; any wording that reads as Data Analyst / BI Developer.`,

  "E-business-analyst": `Variant emphasis (Business Analyst):
- Lead with requirement gathering, use case definition, stakeholder workshops,
  and translating business needs into structured solutions.
- Position as the bridge between operations, business users, and digital
  solutions — operations-side business analyst, not enterprise IT BA.
- Anchor on: YCH (cross-functional reviews with client + Operations +
  Finance) · CWT (UAT for WMS upgrade · process re-engineering across 20
  enterprise accounts) · Sanofi (cross-functional supply-risk decision
  support to QA + Production + Finance) · Opportunity Intelligence &
  Workflow Automation Platform (use case definition + classifier design).
- Forbidden drifts: pure enterprise BA wording (no Jira / Confluence / SDLC
  identity unless the JD explicitly calls for it); Data Analyst wording.`,

  "E-transformation": `Variant emphasis (Supply Chain Transformation):
- Lead with transformation roadmap, change management, operating-model
  design, cross-functional transformation, and digital transformation
  ownership.
- Position as the operator who drives transformation, not the analyst who
  watches it. Programme-led, multi-month, milestone-tracked work.
- Anchor on: YCH (12-month vendor evaluation and renegotiation programme —
  30% cost-to-serve · milestones tracked) · CWT (re-engineered processes
  across 6 enterprise accounts · UAT + WMS upgrade) · Cainiao (exception
  SOP rollout · decision-support views for management).
- Forbidden drifts: any wording that reduces multi-month programmes to
  one-off projects; any wording that reads as Data Analyst.`,

  "E-operations-excellence": `Variant emphasis (Operations Excellence):
- Lead with continuous improvement, kaizen, lean six sigma, root cause
  analysis, process mapping, value stream mapping, and KPI design for
  operational improvement.
- Position as the operations-excellence practitioner who improves operations
  daily and owns the operational metrics.
- Anchor on: Sanofi (45 months zero write-off discipline · weekly shelf-life
  reviews · proactive risk flagging) · YCH (20% peak-period lead-time
  improvement · redesigned SOPs · top-1 KPI for 11 months) · Cainiao (root
  cause + exception SOPs cleared a major backlog in one week) · Ryder
  (KPI recovery in 3 months · backlog cleanup line-by-line).
- Forbidden drifts: Data Analyst wording; BI Developer wording; any framing
  that treats Op Ex as project work instead of an operating discipline.`,

  "E-ai-enablement": `Variant emphasis (AI Enablement):
- Lead with AI adoption, AI enablement, AI-assisted workflow design,
  workflow automation, agentic AI, RPA, and process redesign with AI as
  the enabler.
- Position as the operator who deploys AI into operations to improve
  business outcomes — NOT as an AI engineer, AI researcher, or model builder.
- Anchor on: Opportunity Intelligence & Workflow Automation Platform (Live —
  LLM-assisted classification and drafting; operator owns the decisions and
  the four-step human-in-the-loop review) · Operational Visibility &
  Exception Management Platform (Live Demo — anchored on Cainiao KPI work) ·
  NTUC Generative AI training applied to real SC use cases · Cainiao KPI
  scorecards as the upstream operational visibility work.
- Forbidden drifts: AI Researcher framing; Software Engineer framing;
  Data Scientist framing; any wording that positions AI as the identity
  instead of the enabler.`,
};

/* ─────────────────────────────────────────────────────────────────────────
 * Track-package construction + resolver
 * ────────────────────────────────────────────────────────────────────── */

export const E_TRANSFORMATION_PROMPT_PACKAGE: TrackPromptPackage = {
  sourceFile: "track_e_supply_chain_business_ai",
  displayName: "Supply Chain Business Analyst (AI & Digital Transformation)",
  round1: ROUND_1,
  round2: ROUND_2,
  round3: ROUND_3,
};

/**
 * Resolve the Track E prompt package for a given variant id.
 * Substitutes the {{VARIANT_POSITIONING}} placeholder with the variant's
 * fragment. Falls back to the mixed fragment when the variant is unknown.
 */
export function resolveETransformationPrompt(
  variantId?: string
): TrackPromptPackage {
  const key =
    variantId && E_TRANSFORMATION_VARIANT_FRAGMENTS[variantId]
      ? variantId
      : "E_TRANSFORMATION-mixed";
  const fragment = E_TRANSFORMATION_VARIANT_FRAGMENTS[key];
  const sub = (round: string) =>
    round.replace(/\{\{VARIANT_POSITIONING\}\}/g, fragment);
  return {
    sourceFile: E_TRANSFORMATION_PROMPT_PACKAGE.sourceFile,
    displayName: E_TRANSFORMATION_PROMPT_PACKAGE.displayName,
    round1: sub(E_TRANSFORMATION_PROMPT_PACKAGE.round1),
    round2: sub(E_TRANSFORMATION_PROMPT_PACKAGE.round2),
    round3: sub(E_TRANSFORMATION_PROMPT_PACKAGE.round3),
  };
}

/**
 * Backward-compat: the existing lib/buildPrompt.ts switch imports this as
 * a string. We export the resolved Round 1 (mixed variant) for that path.
 * The workflow page uses resolveETransformationPrompt() directly to get
 * variant-aware R1/R2/R3.
 */
export const E_TRANSFORMATION_PROMPT: string = resolveETransformationPrompt().round1;
