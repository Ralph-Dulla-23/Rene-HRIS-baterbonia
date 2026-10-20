export type ShowStatus = "Pending" | "Show" | "No Show" | "Withdrawn";
export type FinalOutcome = "Pending Start" | "True Hire" | "No Show" | "Pre-start Withdrawal";

export interface OnboardingRecord {
  id: string; // Database ID / Key
  onboardingId: string; // Formatted ID: ONB-XXXXXX
  offerId?: string;
  candidatePipelineId?: string;
  candidateApplicationId?: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  roleTitle: string;
  account: string;
  roleAccount?: string;
  acceptedOfferDate: string;
  expectedStartDate: string;
  actualStartDate?: string;
  showStatus: ShowStatus;
  finalOutcome: FinalOutcome;
  reasonCategory?: string;
  withdrawalReason?: string;
  candidateFeedback?: string;
  experienceRating?: number;
  feedbackTag?: string;
  owner: string;
  location: string;
  remarks?: string;
  convertedEmployeeId?: string;
  createdAt?: string;
  updatedAt?: string;
  auditTrail?: { date: string; action: string; user: string }[];
}

export interface OnboardingStatsData {
  total: number;
  trueHires: number;
  pending: number;
  noShow: number;
  withdrawals: number;
  showRate: number; // formula: Math.round((trueHires / (total - pending)) * 100) or 0
  trueHiresPct: number;
  pendingStartPct: number;
  noShowPct: number;
  withdrawalPct: number;
}

export interface AcceptedOfferOption {
  offerId: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  account: string;
  acceptedOfferDate: string;
  owner: string;
}
