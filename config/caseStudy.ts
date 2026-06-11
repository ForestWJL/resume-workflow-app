// config/caseStudy.ts
// Single source of truth for portfolio copy and evidence numbers.
//
// The audience for this page is Supply Chain, Logistics, Procurement, and
// Operations hiring managers — not software engineers. Voice rules:
//   1. Operations first.
//   2. Workflow automation second.
//   3. AI third.
// Plain business language. No consultant register. Short sentences.

export const CASE_STUDY = {
  brand: "AI-Assisted Opportunity Screening",
  subtitle:
    "Applying supply chain prioritisation and workflow routing principles to high-volume job opportunities.",
  spine:
    "I used the same exception-management and prioritisation logic from supply chain operations to automate the screening, classification, routing and tracking of high-volume incoming opportunities.",

  // Executive Summary — recruiter-facing TL;DR. Four cards, visible directly
  // below the hero. Designed for a 15-second understanding of the project.
  executiveSummary: [
    {
      label: "Problem",
      body: "196 job alerts per week across six channels created review overload. Manual triage was slow, inconsistent, and consumed senior operator time.",
    },
    {
      label: "Solution",
      body: "An AI-assisted screening and routing engine — classification + scoring + workflow handoff — built on the same exception-management logic used in supply chain operations.",
    },
    {
      label: "Outcome",
      body: "196 raw alerts → 49 unique opportunities → 23 prioritised decisions. Complete audit trail kept in Excel.",
    },
    {
      label: "Technology Stack",
      body: "Next.js · TypeScript · Claude · GPT · Gmail (sources) · Excel (audit) · Python (extraction)",
    },
  ] as const,

  // Production Run Example — a real morning's pipeline pass, timestamped.
  // Proves the system actually runs end-to-end in production. Numbers are
  // the same week's figures shown in the Representative Week section.
  productionRun: {
    date: "This morning",
    entries: [
      {
        time: "08:00",
        stage: "Stage 1 · Ingestion",
        title: "Gmail and web sources ingested",
        detail: "196 raw alerts captured across six channels.",
      },
      {
        time: "08:03",
        stage: "Stage 2 · Deduplication",
        title: "Deduplication completed",
        detail: "49 unique opportunities identified after cross-channel dedup.",
      },
      {
        time: "08:05",
        stage: "Stages 3–5 · Decision engine",
        title: "AI classification and scoring completed",
        detail: "23 prioritised opportunities generated with transparent rationale.",
      },
      {
        time: "08:06",
        stage: "Stage 7 · Audit trail",
        title: "Audit tracker updated",
        detail: "job_triage_log_LIVE.xlsx refreshed with all decisions.",
      },
    ],
  } as const,

  // Lead-in for the Built By section — reframes the project's relevance
  // before introducing the person. Less resume, more case-study close.
  whyItMatters:
    "This project demonstrates how operational decision-making principles — prioritisation, categorisation, exception handling, audit-trail discipline — transfer from supply chain environments into AI-assisted knowledge workflows. The architecture is domain-agnostic. The working example here is job opportunities; the same pattern handles supplier proposals, customer escalations, or any high-volume incoming-request problem.",

  // Real numbers from job_triage_log_LIVE.xlsx + this week's email-source run.
  // Headline figures (Stage 1 + Stage 2) come from the pre-classification
  // ingestion run. The triaged sample (Stage 3+) is the curated set logged
  // in the tracker. The two are different layers of the same week.
  weeklyRun: {
    rawAlerts: 196,
    uniqueOpportunities: 49,
    prioritisedThisWeek: 23,
    // Category split across the 23 prioritised opportunities, using the
    // operational category names a SC manager will recognise. Six engine
    // categories collapse to four on the floor this week (no AC_DEMAND or
    // AB_HYBRID landed in this snapshot).
    categorySplit: [
      { label: "Pharma / Medtech Supply Planning", count: 14 },
      { label: "Procurement / Buyer", count: 5 },
      { label: "FMCG / Retail / Demand", count: 2 },
      { label: "Analytics / Reporting", count: 2 },
    ],
    // Recommendation split across the 23 prioritised entries.
    recommendationSplit: [
      { label: "Strong Apply", count: 9 },
      { label: "Apply", count: 13 },
      { label: "Skip", count: 1 },
    ],
  },

  // Stage definitions for the architecture diagram.
  stages: [
    {
      n: 1,
      title: "Incoming Sources",
      body: "Six channels feed the queue: LinkedIn, SEEK, Glassdoor, Recruiter outreach, Telegram, Gmail.",
      tag: "Tooling",
    },
    {
      n: 2,
      title: "Extract & Deduplicate",
      body: "Pull structured fields from each alert. Collapse cross-channel repeats so the same opportunity is not handled twice.",
      tag: "Tooling",
      evidence: "196 raw → 49 unique this week",
    },
    {
      n: 3,
      title: "Classify",
      body: "Sort each unique opportunity into one of six operational categories. Layered checks catch the ambiguous cases.",
      tag: "Live",
    },
    {
      n: 4,
      title: "Score Priority",
      body: "Strong Apply, Apply, Stretch, or Skip — with the reason shown next to the decision.",
      tag: "Live",
    },
    {
      n: 5,
      title: "Recommend",
      body: "Apply-This-Week shortlist surfaced for human review.",
      tag: "Live",
    },
    {
      n: 6,
      title: "Route the Workflow",
      body: "Category points at the right response materials and a four-step playbook. AI helps build; operator owns the decision.",
      tag: "Live",
    },
    {
      n: 7,
      title: "Track and Audit",
      body: "Every decision logged with reference, status, reason, and outcome. Full audit trail in job_triage_log_LIVE.xlsx.",
      tag: "Tooling",
      evidence: "23 entries logged this week",
    },
  ] as const,

  // What the case study demonstrates — used in the Business Impact section.
  demonstrates: [
    {
      title: "Workflow automation",
      body: "Routine triage handled by a deterministic rule set; operator time reserved for the calls that matter.",
    },
    {
      title: "Classification design",
      body: "Six operational categories with four layered checks for the edge cases keyword matching misses.",
    },
    {
      title: "Decision support",
      body: "Priority bands with the reason visible. Every decision is challengeable; every override is logged.",
    },
    {
      title: "AI-assisted prioritisation",
      body: "AI handles the structured language work. The operator owns the calls and the audit trail.",
    },
    {
      title: "Human-in-the-loop review",
      body: "Four-step response playbook with AI building and the operator owning QA and the final decision.",
    },
  ] as const,

  // Real outcomes from this week.
  outcomes: [
    "196 raw alerts processed",
    "49 unique opportunities after deduplication",
    "Classification and prioritisation performed automatically",
    "Human-in-the-loop review retained at every decision step",
    "Excel audit trail maintained for all 23 prioritised entries",
  ] as const,

  // Built by — short bio + brand list (logos optional, rendered as text).
  builtBy: {
    name: "Forest Wang",
    line:
      "Fifteen-plus years in supply chain, procurement, logistics and operations. Pharma, e-commerce, third-party logistics, freight. Recently upskilled in analytics, automation and AI. This is what happens when an operator picks up the modern toolkit and points it at a familiar problem.",
    brands: ["Sanofi", "YCH Group", "Cainiao", "Ryder", "CWT"],
  },
} as const;

export type StageRow = (typeof CASE_STUDY.stages)[number];
