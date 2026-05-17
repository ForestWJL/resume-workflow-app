// config/memorySeed.ts
// Seed data for the Memory Bank. First-time visitors get these facts pre-loaded.
// Users can edit via the UI; their edits are stored in LocalStorage and override this seed.

import type { MemoryBank } from "@/lib/types";

export const MEMORY_SEED: MemoryBank = {
  experienceFacts: [
    {
      company: "Sanofi",
      fact: "Raw material planning, PO placement in SAP MM, 24-month rolling demand plans, FEFO / expiry discipline, stock-at-risk monitoring.",
      tags: ["A", "B"],
      verified: true,
    },
    {
      company: "Sanofi",
      fact: "45 consecutive months with zero raw material write-offs.",
      tags: ["A", "B"],
      verified: true,
    },
    {
      company: "Sanofi",
      fact: "Local Material Master Data Expert certified by Sanofi France.",
      tags: ["A", "B"],
      verified: true,
    },
    {
      company: "Ryder",
      fact: "Production planning for 10 HP lines, SAP MM, capacity forecasts, PO follow-up, BOM-based packaging procurement, supplier follow-up, material availability.",
      tags: ["A", "B"],
      verified: true,
    },
    {
      company: "YCH",
      fact: "FMCG / regional distribution, KPI reporting, RFQ / RFI, supplier evaluation, 20% lead time improvement, 30% cost reduction.",
      tags: ["B", "C"],
      verified: true,
    },
    {
      company: "Cainiao",
      fact: "KPI scorecards, backlog / exception tracking, SOP rollout, shipment coordination, e-commerce fulfilment, order visibility.",
      tags: ["A", "C", "D"],
      verified: true,
    },
    {
      company: "CWT",
      fact: "WMS / customer-system reconciliation, UAT, billing / record accuracy, process redesign.",
      tags: ["B", "D"],
      verified: true,
    },
    {
      company: "Sabbatical / NTUC",
      fact: "Excel, Power BI, SQL, dashboards, reporting tools, exception-based trackers, AI-assisted workflow support.",
      tags: ["C", "D"],
      verified: true,
    },
  ],
  projectFacts: [
    {
      name: "HDB Resale Price Prediction Model",
      status: "Completed portfolio project",
      tools: "Python, Pandas, NumPy",
      summary:
        "Structured data cleaning, exploratory analysis, feature handling, predictive modelling.",
      tags: ["D"],
      verified: true,
    },
    {
      name: "E-commerce BI Dashboard",
      status: "Completed portfolio project",
      tools: "Power BI, Excel / CSV, DAX / Power Query (where used)",
      summary:
        "KPI visibility for e-commerce performance — trend monitoring, decision support.",
      tags: ["C", "D"],
      verified: true,
    },
    {
      name: "Operational KPI Dashboards",
      status: "Completed / ongoing applied work",
      tools: "Power BI, Excel, basic SQL",
      summary:
        "Aging, delays, backlog, exception trends, KPI scorecards for operational visibility.",
      tags: ["A", "C", "D"],
      verified: true,
    },
    {
      name: "AI-Enabled 3PL Control Tower",
      status: "Concept project / prototype",
      tools: "Dashboard logic, reporting framework, AI-assisted structuring",
      summary:
        "Concept for centralised exception visibility, SLA risks, inventory issues. Label honestly.",
      tags: ["A", "D"],
      verified: false,
    },
    {
      name: "AI-Assisted Job Search Tracking Workflow",
      status: "In progress",
      tools: "Spreadsheets, AI prompts, structured tracking logic",
      summary:
        "Workflow for lead capture, application logging, follow-up discipline. Label as in progress.",
      tags: ["D"],
      verified: false,
    },
  ],
  summaryWordings: [
    "Regional supply chain / supply planning candidate with strong pharma operations foundation, PO and order execution discipline, inventory and shipment control, cross-functional collaboration, and upgraded reporting / data-visibility capability.",
    "Hands-on purchasing and material planning support candidate with strong supplier coordination, procurement execution, inventory record accuracy, ERP discipline, and practical Excel reporting capability.",
    "FMCG / retail supply planning and replenishment candidate with strong inventory control, PO fulfilment, KPI reporting, cross-functional collaboration, and practical Excel / Power BI support capability.",
    "Business-domain-backed operations analytics candidate with strong KPI reporting, dashboarding, workflow improvement, reporting automation, and practical AI-assisted process support capability.",
  ],
  bulletWordings: [
    "Placed POs in SAP MM against 24-month rolling demand plans to maintain raw material availability under FEFO / expiry discipline.",
    "Tracked stock-at-risk and slow-moving inventory to support stock exit action and protect regulated inventory health.",
    "Built KPI dashboards and scorecards to improve visibility of backlog aging, SLA trends, and operational exceptions.",
    "Coordinated supplier follow-up and PO tracking to maintain on-time material availability across production lines.",
  ],
  metricsToVerify: [
    "Exact % uplift from Power BI dashboard rollout",
    "Actual SOP adoption rate at Cainiao",
    "Forecast accuracy improvement figure at YCH",
    "Freight cost reduction % during sabbatical reporting work",
  ],
  doNotSaveYet: [
    "Any AI project framed as 'production deployment' without proof",
    "Stakeholder adoption claims that aren't verified",
    "Machine-learning leadership language — not demonstrated yet",
  ],
  trackNotes: {
    A: "Lead with Sanofi + Ryder. Keep analytics as a support layer only, not identity.",
    B: "Lead with Ryder + Sanofi procurement facts. Keep tone hands-on, not strategic.",
    C: "Lead with YCH FMCG anchor. Cainiao supports omni-channel angle.",
    D: "Lead with dashboards + portfolio projects. Label AI projects honestly — concept / in progress where true.",
  },
};
