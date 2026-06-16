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
label: "Format Template",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_RegionalSCAnalyst_Terumo_v2.docx",
},
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
label: "Format Template",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
note: "Optional — planning proof only.",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_SeniorSCExec_Watsons_v3.docx",
},
},

// ===== CB_BUYER — buyer / procurement / sourcing =====
CB_BUYER: {
formatTemplate: {
label: "Format Template",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
},
contentMaster: {
label: "Content Master",
fileName: "Supply Chain Operations Specialist.docx",
},
evidenceBank: {
label: "Experience Evidence Bank",
fileName: "Sanofi_Interview_Final_Condensed.docx",
},
supportingReference: {
label: "Supporting Reference",
fileName: "Forest_Wang_PurchasingPlanning_DoodleLabs_v2.docx",
},
},

// ===== D_SUPPORT — analytics / reporting / KPI =====
D_SUPPORT: {
formatTemplate: {
label: "Approved Base Resume / Format Anchor",
fileName: "Forest_Wang_TrackD_OperationsAnalytics.docx",
},
contentMaster: {
label: "Content Master",
fileName: "Forest_Wang_TrainingDataAnalytic.docx",
},
evidenceBank: {
label: "Project Bank / Evidence Guardrails",
fileName: "Project_Bank_Analytics_AI.md",
},
supportingReference: {
label: "Optional Domain Proof",
fileName: "Supply Chain Operations Specialist.docx",
optional: true,
},
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
