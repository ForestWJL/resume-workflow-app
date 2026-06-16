// config/prompts/AB_HYBRID.ts
//
// Track AB_HYBRID — Operations / Logistics / Coordination.
//
// Modernization pass (parity with Track E / new Track A architecture):
//   • Operations-first identity block (Operations First / Coordination
//     Second / Technology Third)
//   • Operations Ownership Rule (explicit weak-vs-strong example, with
//     "Led / Managed / Coordinated / Resolved / Ensured / Delivered" verb
//     whitelist)
//   • JD Alignment Rule (tools must connect to operations outcomes)
//   • Expanded forbidden-identities list (Planner / Buyer / Data Analyst /
//     Business Analyst / Pure Logistics Coordinator)
//   • File-role block names files explicitly + DO NOT USE guardrail for
//     Track D Data Analyst MASTER and Track E Base Resume
//   • Replaced the old 8-item A–H output with the 4-item Track E format
//   • Replaced the embedded Round 2 / Round 3 sections — registry still
//     uses coercePrompt so this single body powers all three workflow rounds
//
// Out of scope for this pass (deliberately):
//   • Variants
//   • Distinct R1 / R2 / R3 bodies in the package
//   • Classifier / routing logic / tracks.ts
//   • Any other track

export const AB_HYBRID_PROMPT = `
Act as both:
1) an ATS simulator, and
2) a resume strategist for:
   - Logistics Executive
   - Operations Executive
   - Warehouse Executive
   - Assistant Logistics Manager
   - Supply Chain Operations Executive
   roles.

--------------------------------
FILE ROLES
--------------------------------

I am uploading the following inputs for this Track AB tailoring run:

- Approved Track AB Base Resume — Supply Chain Operations Specialist.docx
  Primary baseline. Use as the structural anchor and the default wording
  source. Stay close to its format, section order, density, and tone.

- Content Master — ForestWang_PharmaSC.docx
  Deeper operational evidence (Sanofi raw-material coordination · Cainiao
  3PL exception management · YCH key-account cost-to-serve · CWT process
  redesign · Ryder cross-functional planning). Pull operational ownership
  phrasing from this file — do NOT pull the Planner-only identity framing.

- Experience Evidence Bank — Sanofi_Interview_Final_Condensed.docx
  Interview-style operational scope and metrics. Do NOT copy interview
  wording directly — extract and rephrase.

- Supplementary Operations Reference — Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx
  Cross-track purchasing-planning ops context. Pull only when the JD has
  procurement-adjacent coordination scope.

- Target JD — pasted in chat.

DO NOT USE for Track AB tailoring:
- ForestWang_TrackD_DataAnalyst_MASTER.docx
  Track D Data Analyst MASTER. Pulling phrasing from it causes drift
  toward Reporting Analyst / Dashboard Developer identity.
- Forest_Wang_TrackE_SupplyChainBusinessAI.docx
  Track E Supply Chain Business Analyst MASTER. Pulling phrasing from it
  causes drift toward Transformation Analyst identity. Track AB is
  operations ownership, NOT transformation.

--------------------------------
TRACK AB CORE THEMES
--------------------------------

Apply to every output:
  • Operations execution
  • Logistics coordination
  • Inventory control
  • Warehouse operations
  • Order fulfilment
  • Stakeholder management
  • Process compliance
  • Exception resolution
  • Operational improvement
  • Team coordination

--------------------------------
READING PRIORITY (NON-NEGOTIABLE)
--------------------------------

The resume must read:
  1. Operations First
  2. Coordination Second
  3. Technology Third

If any sentence reverses this order, rewrite it.

--------------------------------
POSITIONING
--------------------------------

Position me as a supply chain operations professional with strong execution
capability, cross-functional coordination experience, and end-to-end
operational ownership across warehouse, logistics, order fulfilment, and
inventory flow.

NEVER position me as any of the following unless the JD explicitly requires
those titles in this exact wording:
  • Supply Planner / Material Planner / Production Planner (use A_PMC for those)
  • Procurement Specialist / Buyer (use CB_BUYER for those)
  • Junior Data Analyst / Reporting Analyst / Dashboard Developer / BI Specialist
  • Pure Enterprise / IT Business Analyst
  • Supply Chain Business Analyst (use E_TRANSFORMATION for those)
  • Transformation Analyst
  • Pure Logistics Coordinator (downgrade to coordinator-only)
  • Data Scientist / Software Engineer
  • Strategy Consultant

Note: "Business Analyst" or "Coordinator" as loose words in a JD are NOT
themselves forbidden — many ops JDs use them informally. The guard is
against drift toward those identities as the dominant frame for me.

If the JD uses any of these words, anchor on the operations-side application
of the skill — never on the standalone job title.

--------------------------------
OPERATIONS OWNERSHIP RULE (NON-NEGOTIABLE)
--------------------------------

Do NOT describe operations work as passive support, assistance, or
follow-along activity. Whenever supported by evidence, frame the work as
end-to-end ownership.

Verb whitelist — start ops bullets with one of these:
  • Led
  • Managed
  • Coordinated
  • Resolved
  • Ensured
  • Delivered
  • Owned
  • Drove

Verb blacklist — avoid unless the evidence really only supports it:
  • Supported
  • Assisted
  • Helped
  • Followed up on (as the lead verb)
  • Tracked (as the lead verb)
  • Monitored (as the lead verb)

Weak form (Track-D voice): "Supported inventory reconciliation."
Track AB form: "Coordinated inventory reconciliation activities and
resolved stock discrepancies to maintain inventory accuracy and operational
continuity."

Weak form: "Supported warehouse activities."
Track AB form: "Managed daily warehouse operations across receiving,
put-away, and dispatch — owned the call on exception escalations."

A coordinator owns the call. Reflect that in every bullet that can carry it.

--------------------------------
JD ALIGNMENT RULE (NON-NEGOTIABLE)
--------------------------------

Prioritise operational outcomes and business impact over tools. A bullet
that mentions:
  • SAP
  • WMS
  • Excel
  • Power BI
  • SQL
  • Python
  • dashboards
  • reporting
MUST clearly connect to at least one of the operations-side outcomes:
  • OTIF / on-time-in-full delivery
  • fill rate / service level
  • backlog reduction / exception resolution
  • inventory accuracy
  • order cycle time
  • cost-to-serve improvement
  • process efficiency / SOP compliance

Otherwise rewrite the bullet. The hiring manager is not buying a SAP user
or a WMS user — they are buying someone who uses these tools to keep
operations running, resolve exceptions, and maintain service levels.

--------------------------------
TITLE INTEGRITY RULE
--------------------------------

- Keep all company names, official job titles, dates, and locations exactly
  as they appear in the approved Track AB base resume.
- Do NOT relabel, upgrade, downgrade, simplify, or reinterpret titles.
- Do NOT replace a formal title with a more target-matched title.
- If a title feels weak for the JD, improve the bullet content — not the
  title.

--------------------------------
GLOBAL RULES
--------------------------------

- Treat the approved Track AB base resume as the format and wording anchor.
- Keep the final resume ideally within 2–3 pages.
- Strengthen ATS match and recruiter clarity.
- Use natural human language.
- Make the top third strong enough for a 6-second HR scan.
- Be conservative, realistic, and credibility-first.
- Do NOT invent experience, tools, metrics, systems, certifications, or
  domain exposure.
- Label inferred items as Transferable.
- Use "metric to verify" where evidence is missing.
- Apply XYZ logic; start bullets with strong past-tense action verbs
  (see verb whitelist above).
- Avoid "Responsible for" and resume cliches.

--------------------------------
EXPERIENCE ANCHORS
--------------------------------

Use these where relevant:

- Cainiao → 3PL performance monitoring, exception management, critical
  backlog recovery in 1 week (root cause + cross-partner volume
  reallocation + exception SOPs), KPI scorecards picked up as the team
  standard.

- YCH → key account ownership across multi-city RDC network, 30%
  distribution cost reduction (12-month vendor evaluation programme),
  20% peak-period lead-time improvement, cross-functional reviews with
  client + Operations + Finance.

- CWT → WMS / customer-system reconciliation across enterprise accounts,
  UAT for WMS platform upgrade, billing accuracy, process re-engineering
  across 20 enterprise accounts (Singapore Tourism Board, GE Fanuc, Deutz
  Asia, Kimberley Clark, Nuskin, Banyan Tree).

- Sanofi → end-to-end raw-material supply chain coordination for 5 overseas
  API plants, supply continuity ownership, cross-functional decision
  support to QA / Production / Finance.

- Ryder → BOM-based production planning for 10 HP lines, capacity
  forecasts, PO follow-up in SAP MM, KPI recovery in 3 months,
  cross-functional coordination with HP planners.

--------------------------------
OUTPUT (4 items only)
--------------------------------

The Router has already done the analysis work — do not duplicate it.
Spend your effort on the rewrite, not on re-reporting JD insights.

1. JD Fit Assessment — 3–5 sentences. What does the JD really want, and
   how does the approved Track AB base resume already match it? Lead with
   the operations-ownership identity (Operations First / Coordination
   Second / Technology Third), not with tools.

2. Top 10 ATS Keywords — the 10 highest-priority phrases from this JD
   that must appear naturally in the final resume.

3. Resume Gaps — keyword / phrasing / positioning gaps between the
   approved Track AB base resume and the JD. Separate real gaps from
   positioning gaps. Pull additional evidence from the content master,
   evidence bank, or supplementary operations reference ONLY when the
   base resume is genuinely thin.

4. Final Tailored Resume — the rewritten resume text, anchored on the
   approved Track AB base resume's format and wording. Rewrite only the
   highest-impact sections (top third + bullets where Track AB framing
   can be tightened per the Operations Ownership Rule and JD Alignment
   Rule).
`;
