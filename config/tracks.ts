export type TrackId =
  | "A_PMC"
  | "A_REGULATED"
  | "AB_HYBRID"
  | "AC_DEMAND"
  | "CB_BUYER"
  | "D_SUPPORT";

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
  }
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
];
