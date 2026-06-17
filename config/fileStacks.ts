// config/fileStacks.ts

import type { TrackId } from "./tracks";

export interface FileStackRole {
label: string;
fileName: string;
note?: string;
optional?: boolean;
}

export interface FileStack {
formatTemplate: FileStackRole;
contentMaster: FileStackRole;
evidenceBank: FileStackRole;
supportingReference: FileStackRole;
trackNote?: string;
}

export const FILE_STACKS: Record<TrackId, FileStack> = {
// ===== A_PMC — Supply Planning / Inventory / MRP =====
A_PMC: {
formatTemplate: {
label: "Approved Track A Base Resume",
fileName: "ForestWang_PharmaSC.docx",
note: "Primary structural and wording anchor for Track A tailoring (Sanofi raw-material planning · 45-month zero write-offs · MRP · FEFO · SAP MM master data).",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
note: "Deeper skills catalogue. Use only where the base resume is thin.",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Interview-style scope + metrics. Extract and rephrase — do not copy directly.",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_RegionalSCAnalyst_Terumo_v2.docx",
note: "Medtech-flavoured planner format reference for medtech JDs.",
},
trackNote:
"Use the approved Track A base first; pull from the content master only when the base is thin. DO NOT pull phrasing from ForestWang_TrackD_DataAnalyst_MASTER.docx — that's Track D Data Analyst positioning and will cause identity drift.",
},

// ===== A_REGULATED — regulated supply chain / GMP-adjacent roles =====
A_REGULATED: {
formatTemplate: {
label: "Approved Track A-Regulated Base Resume",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
note: "Primary structural and wording anchor for Track A_REGULATED tailoring (regulated distribution planning · cold chain · GDP · clinical / pharma supply discipline · FEFO governance · regulated inventory accuracy). Cytiva life-science distribution shape is the closest existing fit to Clinical Supply Coordinator / Pharma Supply Planner / Cold Chain Coordinator / Drug Product Supply Coordinator / Regulated Distribution Planner JDs.",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
note: "Deeper operational bullets across Sanofi raw-material planning, Cainiao exception coordination, YCH key-account distribution, CWT inventory reconciliation, and Ryder BOM-based purchasing. Pull regulated-discipline phrasing only (FEFO · expiry · inventory accuracy · supply continuity) — do NOT pull operations-ownership identity from this file.",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Primary credibility anchor for Track A_REGULATED: Sanofi 45-month zero write-off, FEFO discipline on regulated raw materials, regional allocation under regulated constraint, supply continuity track record. Extract and rephrase — do not copy interview-style wording directly.",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_RegionalSCAnalyst_Terumo_v2.docx",
note: "Medtech-flavoured regulated planner format. Pull only when the JD has medtech / medical-device regulated context — ignore for pharma / clinical / cold-chain JDs.",
},
trackNote:
"Use the approved Track A_REGULATED base first; lean on the content master for regulated-discipline phrasing only. DO NOT pull phrasing from ForestWang_PharmaSC.docx (A_PMC pure-planner drift — loses the regulated identity), Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx (CB_BUYER procurement drift), Forest_Wang_TrackD_OperationsAnalytics.docx (D_SUPPORT analyst drift), or Forest_Wang_TrackE_SupplyChainBusinessAI.docx (E_TRANSFORMATION drift). A_REGULATED is regulated-discipline identity — clinical / pharma / cold-chain / GMP / GDP supply discipline + supply continuity — NOT pure planning, NOT buying, NOT analyst, NOT transformation, NOT QA / QP ownership.",
},

// ===== AB_HYBRID — Operations / Logistics / Coordination =====
AB_HYBRID: {
formatTemplate: {
label: "Approved Track AB Base Resume",
fileName: "Supply Chain Operations Specialist.docx",
note: "Primary structural and wording anchor for Track AB tailoring (operations execution · logistics coordination · inventory control · order fulfilment · cross-functional ownership).",
},
contentMaster: {
label: "Content Master",
fileName: "ForestWang_PharmaSC.docx",
note: "Deeper operational bullets (Sanofi raw-material coordination · Cainiao 3PL exception management · YCH key-account cost-to-serve · CWT process redesign · Ryder cross-functional planning). Pull operational ownership phrasing — do NOT pull Planner-only identity from this file.",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Interview-style operational scope + metrics. Extract and rephrase — do not copy directly.",
},
supportingReference: {
label: "Supplementary Operations Reference",
fileName: "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx",
note: "Cross-track purchasing-planning ops context. Pull only when the JD has procurement-adjacent coordination scope.",
},
trackNote:
"Use the approved Track AB base first; lean on the content master (PharmaSC) for ownership-flavored bullets. DO NOT pull phrasing from ForestWang_TrackD_DataAnalyst_MASTER.docx (analyst drift) or Forest_Wang_TrackE_SupplyChainBusinessAI.docx (transformation drift). AB_HYBRID is operations ownership, not analyst, not transformation.",
},

// ===== AC_DEMAND — demand / replenishment / forecasting =====
AC_DEMAND: {
formatTemplate: {
label: "Approved Track AC Base Resume",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
note: "Primary structural and wording anchor for Track AC tailoring (demand forecasting · replenishment planning · inventory availability · S&OP support · distribution planning). The Cytiva distribution-planning shape is the closest fit to Demand Planner / Replenishment Planner / Inventory Planner / Supply Planning Analyst JDs.",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
note: "Deeper operational bullets (Sanofi raw-material planning · Cainiao KPI / exception management · YCH FMCG distribution · CWT inventory reconciliation · Ryder demand-supply coordination). Pull demand-side and replenishment-flavoured phrasing — do NOT pull buyer-execution identity from this file.",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Interview-style planning scope + metrics. Extract demand-supply alignment and inventory-availability evidence; rephrase — do not copy directly.",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_SeniorSCExec_Watsons_v3.docx",
note: "FMCG / retail replenishment phrasing reference. Pull only when the JD has FMCG / retail / omni-channel context.",
},
trackNote:
"Use the approved Track AC base first; lean on the content master for demand-supply alignment and replenishment phrasing. DO NOT pull phrasing from ForestWang_PharmaSC.docx (planner / MRP / production drift toward A_PMC), Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx (buyer drift toward CB_BUYER), or Forest_Wang_TrackE_SupplyChainBusinessAI.docx (transformation drift toward E). AC_DEMAND is forecast-driven and replenishment-driven — NOT production-scheduling, NOT buying-cycle ownership, NOT transformation.",
},

// ===== CB_BUYER — buyer / procurement / sourcing =====
CB_BUYER: {
formatTemplate: {
label: "Approved Track CB Base Resume",
fileName: "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx",
note: "Primary structural and wording anchor for Track CB tailoring (procurement execution · RFQ / RFI · supplier coordination · PO lifecycle · BOM-based purchasing).",
},
contentMaster: {
label: "Content Master",
fileName: "ForestWang_PharmaSC.docx",
note: "Deeper procurement-adjacent bullets (Sanofi raw-material PO discipline · Ryder BOM-based procurement · YCH RFQ/RFI + vendor evaluation). Pull procurement and supplier-coordination phrasing — do NOT pull Planner-only or Transformation-only identity from this file.",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Interview-style procurement scope + metrics. Extract and rephrase — do not copy directly.",
},
supportingReference: {
label: "Supplementary Operations Reference",
fileName: "Supply Chain Operations Specialist.docx",
note: "Cross-track operations context. Pull only when the JD has warehouse / inventory-coordination scope adjacent to procurement.",
},
trackNote:
"Use the approved Track CB base first; lean on PharmaSC for ownership-tone procurement bullets. DO NOT pull phrasing from ForestWang_TrackD_DataAnalyst_MASTER.docx (analyst drift) or Forest_Wang_TrackE_SupplyChainBusinessAI.docx (transformation drift). Calibrate at executive-buyer level — NOT category manager / strategic sourcing lead / contract owner.",
},

// ===== D_SUPPORT — analytics / reporting / KPI =====
D_SUPPORT: {
formatTemplate: {
label: "Approved Track D Base Resume",
fileName: "Forest_Wang_TrackD_OperationsAnalytics.docx",
note: "Primary structural and wording anchor for Track D tailoring (KPI reporting · performance analytics · dashboard maintenance · spend analysis · business review support · PMO support).",
},
contentMaster: {
label: "Content Master",
fileName: "Forest_Wang_TrainingDataAnalytic.docx",
note: "Deeper analytics / training data content. Use only where the base resume is thin on a specific JD requirement.",
},
evidenceBank: {
label: "Project Bank / Evidence Guardrails",
fileName: "Project_Bank_Analytics_AI.md",
note: "Honest project labels (concept / prototype / in progress / shipped) and resume-safe wording for portfolio projects.",
},
supportingReference: {
label: "Optional Domain Proof",
fileName: "Supply Chain Operations Specialist.docx",
optional: true,
note: "Optional — pull only when the JD has supply-chain-domain context that needs light reinforcement.",
},
trackNote:
"Use the approved Track D base first; lean on the content master only when the base is thin. DO NOT pull phrasing from Forest_Wang_TrackE_SupplyChainBusinessAI.docx (transformation drift) or ForestWang_PharmaSC.docx (planner-ownership drift). Track D is analyst identity — performance analytics, reporting, PMO/business-review support — not transformation, not planning, not operations ownership.",
},

// ===== E_TRANSFORMATION — Supply Chain Business Analyst (AI & Digital Transformation) =====
E_TRANSFORMATION: {
formatTemplate: {
label: "Approved Track E Base Resume",
fileName: "Forest_Wang_TrackE_SupplyChainBusinessAI.docx",
note: "Primary structural and wording anchor for Track E tailoring.",
},
contentMaster: {
label: "Content Master",
fileName: "Forest_Wang_TrainingDataAnalytic.docx",
note: "Deeper analytics + AI content for alternate wording.",
},
evidenceBank: {
label: "AI Project Portfolio / Evidence Guardrails",
fileName: "Project_Bank_Analytics_AI.md",
note: "Track E project evidence — honest project labels, resume-safe wording.",
},
supportingReference: {
label: "Supporting Analytics Evidence",
fileName: "Forest_Wang_TrackD_OperationsAnalytics.docx",
note: "Optional — use when the JD has analytics-adjacent tooling that needs reinforcement.",
optional: true,
},
trackNote:
"Lead with operational ownership + AI-enabled transformation. Pull the AI project portfolio in only when the JD asks for it explicitly.",
},
};
