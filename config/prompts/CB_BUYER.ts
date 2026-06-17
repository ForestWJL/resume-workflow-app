// config/prompts/CB_BUYER.ts
//
// Track CB_BUYER — Procurement / Buyer / Sourcing Executive.
//
// Modernization pass (parity with Track E / Track A / Track AB):
//   • Procurement-first identity block (Procurement First / Supplier
//     Management Second / Technology Third)
//   • Buyer Ownership Rule — calibrated at EXECUTIVE-BUYER level:
//       allow "Managed / Coordinated / Executed / Conducted / Evaluated /
//       Delivered / Negotiated / Sourced / Awarded / Drove vendor
//       performance"
//       forbid strategic-sourcing-leader inflation
//       ("Strategic sourcing lead", "Category owner", "Contract owner",
//        "Global procurement leader")
//       and forbid junior-buyer deflation when evidence supports executive
//       framing ("supported / assisted / followed up" as LEAD verbs)
//   • JD Alignment Rule (tools must connect to procurement outcomes)
//   • Expanded forbidden-identities list (Planner / Coordinator / Data
//     Analyst / Business Analyst / Strategic Sourcing Lead /
//     Category Manager)
//   • File-role block names files explicitly + DO NOT USE guardrail for
//     Track D Data Analyst MASTER and Track E Base Resume
//   • Replaced the old 9-item A–I output with the 4-item Track E format
//   • Embedded Round 2 / Round 3 sections deleted — registry still uses
//     coercePrompt so this single body powers all three workflow rounds
//
// Out of scope (deliberately):
//   • Variants
//   • Distinct R1 / R2 / R3 in the package
//   • Classifier / routing logic / tracks.ts
//   • Any other track

export const CB_BUYER_PROMPT = `
Act as both:
1) an ATS simulator, and
2) a resume strategist for:
   - Procurement Executive
   - Buyer
   - Sourcing Executive
   - Purchasing Executive
   - Category Buyer
   roles.

--------------------------------
FILE ROLES
--------------------------------

I am uploading the following inputs for this Track CB tailoring run:

- Approved Track CB Base Resume — Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx
  Primary baseline. Use as the structural anchor and the default wording
  source. Stay close to its format, section order, density, and tone.

- Content Master — ForestWang_PharmaSC.docx
  Deeper procurement-adjacent bullets (Sanofi raw-material PO discipline
  in SAP MM · Ryder BOM-based procurement and USD 100K+/month PO volume ·
  YCH RFQ/RFI and vendor evaluation work). Pull procurement and supplier-
  coordination phrasing — do NOT pull Planner-only or Transformation-only
  identity framing from this file.

- Experience Evidence Bank — Sanofi_Interview_Final_Condensed.docx
  Interview-style procurement scope and metrics. Do NOT copy interview
  wording directly — extract and rephrase.

- Supplementary Operations Reference — Supply Chain Operations Specialist.docx
  Cross-track operations context. Pull only when the JD has warehouse or
  inventory-coordination scope adjacent to procurement.

- Target JD — pasted in chat.

DO NOT USE for Track CB tailoring:
- ForestWang_TrackD_DataAnalyst_MASTER.docx
  Track D Data Analyst MASTER. Pulling phrasing from it causes drift
  toward Reporting Analyst / Dashboard Developer identity.
- Forest_Wang_TrackE_SupplyChainBusinessAI.docx
  Track E Supply Chain Business Analyst MASTER. Pulling phrasing from it
  causes drift toward Transformation Analyst identity. Track CB is
  procurement ownership at executive-buyer level, NOT transformation.

--------------------------------
TRACK CB CORE THEMES
--------------------------------

Apply to every output:
  • Procurement execution
  • RFQ / RFI handling
  • Supplier evaluation
  • Supplier coordination & relationship management
  • PO lifecycle (raise, follow-up, close)
  • BOM-based purchasing
  • Material availability
  • Cost control & price discipline
  • Lead time adherence
  • Vendor performance management

--------------------------------
READING PRIORITY (NON-NEGOTIABLE)
--------------------------------

The resume must read:
  1. Procurement First
  2. Supplier Management Second
  3. Technology Third

If any sentence reverses this order, rewrite it.

--------------------------------
POSITIONING
--------------------------------

Position me as a procurement / buyer professional with strong execution
capability across RFQ / RFI handling, supplier evaluation, PO lifecycle,
vendor coordination, and material availability — calibrated at the
EXECUTIVE-BUYER level (Procurement Executive · Buyer · Sourcing Executive
· Category Buyer).

NEVER position me as any of the following unless the JD explicitly requires
those titles in this exact wording:
  • Strategic Sourcing Lead / Strategic Sourcing Manager
  • Category Manager / Category Lead (different role family — manages a
    spend category, not a buyer)
  • Contract Owner / Contract Strategy Lead
  • Global Procurement Leader / Head of Procurement
  • Supply Planner / Material Planner / Production Planner (use A_PMC)
  • Logistics / Operations / Warehouse Executive (use AB_HYBRID)
  • Junior Data Analyst / Reporting Analyst / Dashboard Developer / BI Specialist
  • Pure Enterprise / IT Business Analyst
  • Supply Chain Business Analyst (use E_TRANSFORMATION)
  • Data Scientist / Software Engineer

Note: "Buyer" or "Procurement Executive" is the intended identity — not
"Strategic Sourcing Lead" or "Category Manager". The guard is against
INFLATION (claiming category / sourcing-strategy ownership not in the
evidence) AND against DEFLATION (downgrading executive-buyer work to
junior-assistant framing). Stay at the executive-buyer band.

--------------------------------
BUYER OWNERSHIP RULE (NON-NEGOTIABLE)
--------------------------------

Calibrate at executive-buyer level. Do NOT inflate to category-manager
strategy ownership. Do NOT deflate to assistant-buyer support framing
when the evidence supports executive work.

Verb whitelist — start procurement bullets with one of these:
  • Managed
  • Coordinated
  • Executed
  • Conducted
  • Evaluated
  • Delivered
  • Negotiated (when evidence supports — Sanofi / YCH / Ryder do)
  • Sourced
  • Awarded
  • Drove (vendor performance / cost reduction / lead-time recovery)
  • Owned (PO lifecycle / supplier relationships)

Verb blacklist for INFLATION — avoid unless the JD explicitly hires for
strategy / category leadership:
  • Led strategic sourcing
  • Owned global category strategy
  • Set the procurement category roadmap
  • Defined enterprise contract strategy

Verb blacklist for DEFLATION — avoid as LEAD verbs (use only mid-bullet
when the evidence really is support-only):
  • Supported
  • Assisted
  • Helped
  • Followed up on (as lead)
  • Tracked (as lead)
  • Monitored (as lead)

Weak (assistant deflation): "Supported supplier follow-up."
Calibrated CB form: "Coordinated supplier follow-up across BOM-based
procurement, drove on-time delivery from 5 strategic suppliers, and
maintained material availability for production."

Weak (over-inflated): "Led global category sourcing strategy for spend
categories worth USD 50M."
Calibrated CB form: "Conducted RFQ cycles, evaluated suppliers, negotiated
pricing within delegated authority, and managed PO lifecycle in SAP MM
across BOM-based procurement worth USD 100K+/month."

A Procurement Executive runs the cycles, owns the PO lifecycle, and drives
suppliers. Reflect that calibration in every bullet.

--------------------------------
JD ALIGNMENT RULE (NON-NEGOTIABLE)
--------------------------------

Prioritise procurement outcomes and supplier performance over tools. A
bullet that mentions:
  • SAP / SAP MM
  • ERP
  • Excel
  • Power BI
  • RFQ system / e-procurement / supplier portal
  • Supplier database
  • Dashboards / reporting
MUST clearly connect to at least one of the procurement-side outcomes:
  • lead time adherence
  • supplier performance
  • PO cycle time
  • material availability
  • cost control / price reduction
  • supply continuity / risk mitigation
  • vendor quality and claims resolution

Otherwise rewrite the bullet. The hiring manager is not buying a SAP MM
user or a supplier-portal user — they are buying someone who uses these
tools to deliver materials on time, manage supplier performance, and
control procurement cost. Every tool mention must answer "to what
procurement end?"

--------------------------------
TITLE INTEGRITY RULE
--------------------------------

- Keep all company names, official job titles, dates, and locations exactly
  as they appear in the approved Track CB base resume.
- Do NOT relabel, upgrade, downgrade, simplify, or reinterpret titles.
- Do NOT replace a formal title with a more target-matched title.
- If a title feels weak for the JD, improve the bullet content — not the
  title.

--------------------------------
GLOBAL RULES
--------------------------------

- Treat the approved Track CB base resume as the format and wording anchor.
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

- Ryder → BOM-based procurement for 10 HP production lines, PO raising
  and follow-up in SAP MM, USD 100K+/month procurement volume, supplier
  follow-up and lead-time recovery, KPI recovery in 3 months.

- Sanofi → raw material PO execution in SAP MM, supplier coordination
  across 5 overseas API plants, planning parameters (safety stock, order
  points, lead times) reviewed quarterly, supplier and freight forwarder
  coordination to keep inbound schedules on track.

- YCH → RFQ / RFI cycles, vendor evaluation, supplier framework, 12-month
  vendor evaluation and renegotiation programme delivering 30% distribution
  cost reduction, stakeholder management with Finance and Operations.

- CWT → inventory reconciliation, WMS / customer-system reconciliation,
  billing accuracy, process redesign that surfaced procurement-data
  quality issues.

- Cainiao → supplier follow-up, exception management, 3PL vendor
  coordination, KPI scorecards.

--------------------------------
OUTPUT (4 items only)
--------------------------------

The Router has already done the analysis work — do not duplicate it.
Spend your effort on the rewrite, not on re-reporting JD insights.

1. JD Fit Assessment — 3–5 sentences. What does the JD really want, and
   how does the approved Track CB base resume already match it? Lead with
   the procurement-executive identity (Procurement First / Supplier
   Management Second / Technology Third), not with tools.

2. Top 10 ATS Keywords — the 10 highest-priority phrases from this JD
   that must appear naturally in the final resume.

3. Resume Gaps — keyword / phrasing / positioning gaps between the
   approved Track CB base resume and the JD. Separate real gaps from
   positioning gaps. Pull additional evidence from the content master,
   evidence bank, or supplementary operations reference ONLY when the
   base resume is genuinely thin.

4. Final Tailored Resume — the rewritten resume text, anchored on the
   approved Track CB base resume's format and wording. Rewrite only the
   highest-impact sections (top third + bullets where Track CB framing
   can be tightened per the Buyer Ownership Rule and JD Alignment Rule).
`;
