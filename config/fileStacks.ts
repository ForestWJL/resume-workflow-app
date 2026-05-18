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
// ===== A_PMC — pharma / medtech supply planning =====
A_PMC: {
formatTemplate: {
label: "Format Template",
fileName: "Forest_Wang_DistributionPlanner_CytivaV2.docx",
note: "Layout, section order, density only.",
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

// ===== AB_HYBRID — planning + procurement hybrid =====
AB_HYBRID: {
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
};
