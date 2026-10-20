import type { FactorCategory, FactorConfidence, CompensableFactorEvidence } from "../data/compensableFactorsConfig.ts";

export interface CompensableFactorAssessmentItem {
  key: string;
  factorNumber: number;
  factor: string;
  category: FactorCategory;
  assessment: string | null;
  confidence: FactorConfidence;
  summary: string;
  evidence: CompensableFactorEvidence[];
  missingContext: string[];
  requiresUserInput: boolean;
  criteria?: string;
  weightOrPoints?: number;
  additionalNotes?: string;
  reviewed?: boolean;
  source?: "AI" | "Manual";
  userSuppliedContext?: Record<string, string>;
}

export interface CompensableFactorAnalysisResponse {
  factors: CompensableFactorAssessmentItem[];
  overallSummary?: string;
  analyzedAt: string;
  modelUsed?: string;
}

export interface NormalizedJobDescriptionContext {
  documentTitle?: string;
  roleTitle: string;
  department: string;
  account: string;
  reportsTo: string;
  supervisory: boolean;
  supervisoryLevel: string;
  positionOverview: string;
  responsibilities: string[];
  qualifications: string;
  competencies: string[] | string;
  targetPersonality?: string;
  workingConditions?: string;
  remarks?: string;
  additionalContext?: Record<string, string>;
}
