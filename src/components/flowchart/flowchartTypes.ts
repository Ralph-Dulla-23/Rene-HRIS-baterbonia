import React from "react";

export type FlowchartProcessId = 
  | "process-1-ia" 
  | "process-2-recruitment" 
  | "process-3-workforce" 
  | "process-4-core-hr" 
  | "process-5-governance" 
  | "process-summary-matrix";

export interface SystemModuleSummary {
  area: string;
  primaryScreens: string[];
  keyActions: string[];
  primaryModuleKey: string;
  badgeColor: string;
  icon: string;
}

export interface IABranch {
  id: string;
  name: string;
  code: string;
  roleAudience: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  subModules: {
    id: string;
    name: string;
    moduleKey: string;
    description: string;
    badge?: string;
  }[];
}
