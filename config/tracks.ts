export type TrackId =
  | "A_PMC"
  | "A_REGULATED"
  | "AB_HYBRID"
  | "AC_DEMAND"
  | "CB_BUYER"
  | "D_SUPPORT"
  | "E_TRANSFORMATION";

export interface TrackVariant {
  id: string;
  name: string;
  strongSignals: string[];
}

export interface TrackConfig {
  id: TrackId;
  name: string;
  titleSignals: string[];
  domainSignals: string[];
  functionalSignals: string[];
  toolSignals: string[];
  ambiguousTitleSignals?: string[];
  // Optional informational sub-variants used by `resolveVariant` in lib/score.ts.
  // No category in the current 6-track schema defines variants, but the field
  // stays present so downstream code compiles without per-track checks.
  variants?: TrackVariant[];
}

export const TRACKS: Record<TrackId, TrackConfig> = {

  A_PMC: {
    id: "A_PMC",

    name: "Supply Planning / Inventory / MRP",

    titleSignals: [
      "supply planner",
      "material planner",
      "inventory planner",
      "production planner",
      "supply chain planner",
      "planning executive",
      "planner"
    ],

    domainSignals: [
      "inventory",
      "stock",
      "warehouse",
      "material",
      "production",
      "distribution",
      "fulfillment"
    ],

    functionalSignals: [
      "inventory planning",
      "stock control",
      "material planning",
      "production planning",
      "mrp",
      "replenishment",
      "allocation",
      "inventory monitoring",
      "stock accuracy",
      "cycle count"
    ],

    toolSignals: [
      "sap",
      "erp",
      "mrp"
    ],

    ambiguousTitleSignals: [
      "supply chain executive",
      "operations executive"
    ]
  },

  A_REGULATED: {
    id: "A_REGULATED",

    name: "Regulated Supply Chain / GMP",

    titleSignals: [
      "pharma",
      "medtech",
      "clinical supply",
      "quality supply chain",
      "gmp",
      "regulatory"
    ],

    domainSignals: [
      "gmp",
      "cgmp",
      "gxp",
      "pharmaceutical",
      "biopharma",
      "clinical trial",
      "cold chain",
      "gdp",
      "sterile",
      "aseptic"
    ],

    functionalSignals: [
      "compliance",
      "batch release",
      "batch documentation",
      "fefo",
      "expiry",
      "temperature monitoring",
      "deviation",
      "capa",
      "audit",
      "validation"
    ],

    toolSignals: [],

    ambiguousTitleSignals: []
  },

  AB_HYBRID: {
    id: "AB_HYBRID",

    name: "Operations / Coordination / Execution",

    titleSignals: [
      "operations executive",
      "operations coordinator",
      "supply chain executive",
      "logistics executive",
      "customer operations",
      "fulfilment executive"
    ],

    domainSignals: [
      "operations",
      "logistics",
      "fulfilment",
      "distribution",
      "supply chain"
    ],

    functionalSignals: [
      "coordination",
      "stakeholder management",
      "order fulfilment",
      "issue resolution",
      "vendor coordination",
      "supplier coordination",
      "shipment coordination",
      "execution",
      "follow-up",
      "escalation",
      "process execution"
    ],

    toolSignals: [
      "erp"
    ],

    ambiguousTitleSignals: [
      "operations executive",
      "supply chain executive"
    ]
  },

  AC_DEMAND: {
    id: "AC_DEMAND",

    name: "Demand Planning / Forecasting",

    titleSignals: [
      "demand planner",
      "forecast analyst",
      "demand planning"
    ],

    domainSignals: [
      "forecast",
      "demand",
      "inventory",
      "stock",
      "shortage",
      "excess"
    ],

    functionalSignals: [
      "forecast",
      "demand planning",
      "replenishment",
      "inventory balancing",
      "stock planning",
      "prevent shortage",
      "forecast accuracy"
    ],

    toolSignals: [
      "excel",
      "erp",
      "power bi"
    ],

    ambiguousTitleSignals: []
  },

  CB_BUYER: {
    id: "CB_BUYER",

    name: "Procurement / Buyer",

    titleSignals: [
      "buyer",
      "procurement",
      "purchasing",
      "sourcing"
    ],

    domainSignals: [
      "supplier",
      "vendor",
      "procurement",
      "purchasing"
    ],

    functionalSignals: [
      "rfq",
      "rfi",
      "purchase order",
      "po",
      "supplier follow-up",
      "vendor coordination",
      "delivery tracking",
      "lead time",
      "cost tracking"
    ],

    toolSignals: [
      "sap",
      "erp"
    ],

    ambiguousTitleSignals: []
  },

  D_SUPPORT: {
    id: "D_SUPPORT",

    name: "Analytics / Reporting Support",

    titleSignals: [
      "analyst",
      "data analyst",
      "reporting analyst"
    ],

    domainSignals: [
      "data",
      "reporting",
      "dashboard",
      "analysis"
    ],

    functionalSignals: [
      "reporting",
      "dashboard",
      "data analysis",
      "kpi tracking",
      "visualization",
      "data validation"
    ],

    toolSignals: [
      "excel",
      "power bi",
      "tableau"
    ],

    ambiguousTitleSignals: []
  },

  // ===== E_TRANSFORMATION — Supply Chain Business Analyst (AI & Digital Transformation) =====
  // Sits BETWEEN A_PMC / AB_HYBRID and D_SUPPORT — not above D_SUPPORT.
  // Positions the candidate as an 8–15 yr supply chain professional who uses
  // AI, analytics and automation to improve operations and own business outcomes
  // — NOT as a data scientist, data analyst, SWE, or AI researcher.
  E_TRANSFORMATION: {
    id: "E_TRANSFORMATION",

    name: "Supply Chain Business Analyst (AI & Digital Transformation)",

    titleSignals: [
      "supply chain business analyst",
      "digital supply chain analyst",
      "supply chain transformation analyst",
      "supply chain transformation executive",
      "supply chain transformation",
      "ai enablement specialist",
      "ai enablement",
      "ai & operations business partner",
      "ai and operations business partner",
      "operations excellence analyst",
      "process improvement analyst",
      "process excellence analyst",
      "business transformation analyst",
      "transformation analyst",
      "digital transformation analyst",
    ],

    // "business analyst" alone is too broad — scored at functional weight, so
    // it only wins when paired with transformation/AI/SC domain signals.
    ambiguousTitleSignals: [
      "business analyst",
      "business process analyst",
    ],

    domainSignals: [
      "digital transformation",
      "supply chain transformation",
      "operations excellence",
      "operational excellence",
      "continuous improvement",
      "process improvement",
      "process optimisation",
      "process optimization",
      "business process re-engineering",
      "business process reengineering",
      "change management",
      "operational visibility",
      "decision support",
      "cross-functional transformation",
      "cross functional transformation",
      "business ownership",
      "stakeholder management",
      "ai adoption",
      "ai enablement",
      "digital adoption",
      "workflow automation",
      "workflow redesign",
      "workflow design",
      "process redesign",
    ],

    functionalSignals: [
      "root cause analysis",
      "stakeholder workshops",
      "stakeholder engagement",
      "requirement gathering",
      "requirements gathering",
      "use case definition",
      "use case design",
      "process mapping",
      "process map",
      "value stream mapping",
      "value stream map",
      "transformation roadmap",
      "transformation initiative",
      "change adoption",
      "kaizen",
      "lean six sigma",
      "ai-assisted",
      "ai assisted",
      "ai-driven",
      "ai driven",
      "ai-enabled",
      "ai enabled",
      "business process design",
      "operating model",
      "operating model design",
      "operations improvement",
      "improvement initiative",
      "improvement roadmap",
      "operational kpi design",
      "kpi design",
      "process governance",
      "workflow integration",
      "automation initiative",
      "translate business requirements",
      "business requirements",
      "translate operations",
      "bridge between business and",
      "bridge between operations and",
    ],

    // Tools are AI / workflow automation tools — distinct from D_SUPPORT's
    // pure analytics stack (SQL / Power BI / Tableau). Low weight (1) per
    // Rule 6 priority, but specific enough to add signal without overlap.
    toolSignals: [
      "llm",
      "claude",
      "gpt",
      "agentic ai",
      "agentic",
      "ai workflow",
      "ai assistant",
      "ai copilot",
      "rpa",
      "robotic process automation",
      "process mining",
      "uipath",
      "n8n",
      "zapier",
      "power automate",
      "make.com",
    ],

    // Variants — same prompt, but improve routing explanations and JD-shape
    // recognition.
    variants: [
      {
        id: "E-business-analyst",
        name: "Business Analyst",
        strongSignals: [
          "business analyst",
          "business process analyst",
          "business requirements",
          "requirement gathering",
          "requirements gathering",
          "use case definition",
          "stakeholder workshops",
          "stakeholder management",
        ],
      },
      {
        id: "E-transformation",
        name: "Supply Chain Transformation",
        strongSignals: [
          "supply chain transformation",
          "digital transformation",
          "transformation roadmap",
          "transformation initiative",
          "cross-functional transformation",
          "change management",
          "operating model",
        ],
      },
      {
        id: "E-operations-excellence",
        name: "Operations Excellence",
        strongSignals: [
          "operations excellence",
          "operational excellence",
          "continuous improvement",
          "process improvement",
          "kaizen",
          "lean six sigma",
          "root cause analysis",
          "process mapping",
          "value stream mapping",
        ],
      },
      {
        id: "E-ai-enablement",
        name: "AI Enablement",
        strongSignals: [
          "ai adoption",
          "ai enablement",
          "ai-assisted",
          "ai-driven",
          "ai-enabled",
          "ai workflow",
          "workflow automation",
          "workflow redesign",
          "agentic",
          "rpa",
          "robotic process automation",
          "process mining",
        ],
      },
    ],
  },
};

// TRACK_ORDER is the canonical ordering used by the router/library/workflow
// pages when iterating over the categories.
export const TRACK_ORDER: TrackId[] = [
  "A_PMC",
  "A_REGULATED",
  "AB_HYBRID",
  "AC_DEMAND",
  "CB_BUYER",
  "D_SUPPORT",
  "E_TRANSFORMATION",
];
