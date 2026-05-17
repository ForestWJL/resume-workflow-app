export type TrackId =
  | "A_PMC"
  | "A_REGULATED"
  | "AB_HYBRID"
  | "AC_DEMAND"
  | "CB_BUYER"
  | "D_SUPPORT";

export interface TrackConfig {
  id: TrackId;
  name: string;   
  titleSignals: string[];
  domainSignals: string[];
  functionalSignals: string[];
  toolSignals: string[];
  ambiguousTitleSignals?: string[];
}

export const TRACKS: Record<TrackId, TrackConfig> = {
A_PMC: {
  id: "A_PMC",

  name: "Pharma / Medtech / Supply Planning",

  titleSignals: [
    "supply planner",
    "material planner",
    "inventory planner",
    "production planner",
    "supply chain planner",
    "planning executive",
    "supply chain executive",
    "warehouse planner",
    "logistics planner"
  ],

  domainSignals: [
    "inventory",
    "inventory control",
    "stock",
    "warehouse",
    "shipment",
    "material",
    "production",
    "fulfillment",
    "distribution",
    "packing",
    "picking",
    "batch",
    "expiry"
  ],

  functionalSignals: [
    "inventory planning",
    "stock control",
    "warehouse operations",
    "warehouse process",
    "workflow improvement",
    "process improvement",
    "process monitoring",
    "inventory monitoring",
    "material planning",
    "production planning",
    "supply planning",
    "allocation",
    "replenishment",
    "shipment coordination",
    "receiving",
    "picking",
    "packing",
    "cycle count",
    "stock accuracy"
  ],

  toolSignals: [
    "sap",
    "erp",
    "wms"
  ],

  ambiguousTitleSignals: [
    "supply chain executive",
    "operations executive"
  ]
},

  A_REGULATED: {
    id: "A_REGULATED",
    name: "Regulated Supply Chain",
    titleSignals: ["pharma", "medtech"],
    domainSignals: ["gmp", "regulatory", "validation"],
    functionalSignals: ["compliance"],
    toolSignals: [],
    ambiguousTitleSignals: []
  },

  AB_HYBRID: {
    id: "AB_HYBRID",
    name: "Planning + Procurement",
 
    titleSignals: [
      "planner",
      "supply chain planner",
      "demand planner"
    ],
   
    domainSignals: [
      "inventory",
      "forecast",
      "planning"
    ],
  
    functionalSignals: [
      "planning",
      "forecast",
      "inventory planning",
      "demand planning"
    ],
  
    toolSignals: ["erp"],
    ambiguousTitleSignals: []
  },

  AC_DEMAND: {
    id: "AC_DEMAND",
    name: "Demand / Replenishment",
  
    titleSignals: [
      "demand planner",
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
      "inventory monitoring",
      "replenishment",
      "stock planning",
      "prevent shortage"
    ],
  
    toolSignals: ["excel", "erp"],
    ambiguousTitleSignals: []
  },

  CB_BUYER: {
    id: "CB_BUYER",
    name: "Buyer / Procurement",
    titleSignals: ["buyer", "procurement"],
    domainSignals: ["supplier", "rfq"],
    functionalSignals: [
      "rfq",
      "quotation",
      "vendor coordination",
      "vendor sourcing",
      "procurement",
      "cost comparison",
      "comparison sheet",
      "cost calculation",
      "costing sheet",
      "rate management",
      "vendor quotation",
      "quotation support",
      "logistics pricing",
      "transport costing",
      "warehouse costing",
      "commercial support",
      "procurement records",
      "vendor database",
      "pricing template",
      "pricing",
      "costing",
      "tender",
      "bidding",
      "rate card",
      "subcontractor",
      "supplier follow-up",
      "pricing analysis",
      "margin tracking",
    ],
  toolSignals: [
      "excel",
      "cost calculation",
      "pricing template",
      "rate card",
      "erp"
    ],
    ambiguousTitleSignals: []
  },

  D_SUPPORT: {
    id: "D_SUPPORT",
    name: "Analytics / Reporting",
    titleSignals: ["analyst", "data"],
    domainSignals: ["kpi", "reporting"],
    functionalSignals: [
      "reporting",
      "data management",
      "cost tracking",
      "vendor tracking",
      "record maintenance",
      "kpi",
      "dashboard",
      "power bi",
      "sql",
      "python",
      "analytics",
      "visualization",
     ],
    toolSignals: ["sql", "python", "power bi"],
    ambiguousTitleSignals: []
  }
};
export const TRACK_ORDER = [
  "A_PMC",
  "A_REGULATED",
  "AB_HYBRID",
  "AC_DEMAND",
  "CB_BUYER",
  "D_SUPPORT"
];  