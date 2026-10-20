import { NHOQDSMaterial, NHODocumentItem } from "../nho/nhoTypes";

export type JourneyStage = 
  | "Awaiting Start"
  | "Day 1-30 Nesting"
  | "Day 31-60 Ramp"
  | "Day 61-90 Regularization Assessment"
  | "Completed Onboarding"
  | "Review Completed — Continuing Support"
  | "Pending / Blocked"
  | "Ended Before Day 90"
  | "At Risk";

export type MilestoneStatus = "Pending" | "In Progress" | "Completed" | "At Risk" | "Extended";

export interface Day30Milestone {
  status: MilestoneStatus;
  targetDate: string;
  completedDate?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  nestingQaScore?: number; // Target >= 85%
  attendancePunctualityScore?: number; // Target >= 95%
  systemsNavigationRating?: number; // 1-5
  callHandlingRating?: number; // 1-5
  complianceAdherenceRating?: number; // 1-5
  coachingSessionsCount?: number;
  outstandingDocsCleared: boolean;
  trainerEndorsement?: "Floor Ready" | "Requires Coaching" | "At Risk";
  trainerNotes?: string;
  actionPlan?: string;
}

export interface Day60Milestone {
  status: MilestoneStatus;
  targetDate: string;
  completedDate?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  coreProductionScore?: number; // Target >= 88%
  averageHandleTimeSeconds?: number; // e.g. 380s (Target 400s)
  customerSatisfactionScore?: number; // Target >= 88%
  firstContactResolutionScore?: number; // Target >= 85%
  shrinkagePercentage?: number; // Target <= 8%
  supervisorRating?: number; // 1-5
  midProbationDecision?: "Progressing Well" | "Action Plan Required" | "Probation Warning";
  supervisorNotes?: string;
  actionPlan?: string;
  outstandingDocsCleared?: boolean;
}

export interface Day90Milestone {
  status: MilestoneStatus;
  targetDate: string;
  completedDate?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
  compositeScore?: number; // Target >= 90%
  overallPerformanceRating?: number; // 1-5
  behavioralComplianceRating?: number; // 1-5
  culturePillarAlignmentRating?: number; // 1-5
  finalRecommendation?: "Completed" | "Review Completed — Continuing Support" | "Pending / Blocked";
  trainerNotes?: string;
  operationsManagerSignOff?: {
    signedBy: string;
    signedAt: string;
    approved: boolean;
    remarks?: string;
  };
  trainerSignOff?: {
    signedBy: string;
    signedAt: string;
    approved: boolean;
    remarks?: string;
  };
  hrOperationsSignOff?: {
    signedBy: string;
    signedAt: string;
    approved: boolean;
    remarks?: string;
    regularizationContractIssued?: boolean;
    effectiveRegularDate?: string;
  };
}

export interface JourneyTouchpoint {
  id: string;
  date: string;
  authorName: string;
  authorRole: string;
  type: "1-on-1 Check-in" | "Trainer Coaching" | "QA Feedback" | "HR Wellness" | "Attendance Review";
  notes: string;
  moodRating?: "Thriving" | "Satisfied" | "Needs Support" | "Escalated";
  actionItems?: string[];
}

export interface TrainingAssignment {
  id: number;
  emp: string;
  date: string;
  type: "Material" | "Goal";
  category?: string;
  title: string;
  description: string;
  details: string;
  duration: string;
  priority: "Normal" | "High";
  owner: string;
  url?: string;
  created: string;
}

export interface TrainingProgress {
  id: number;
  assignmentId: number;
  emp: string;
  status: "Not started" | "In progress" | "Submitted" | "Verified" | "Revision requested";
  note?: string;
  submitted?: string;
  reviewer?: string | null;
  reviewed?: string | null;
  feedback?: string | null;
  opened?: string;
}

export interface PerformanceRecord {
  id: number;
  emp: string;
  metric: "Training Assessment" | "QA Audit" | "Work Simulation";
  score: number;
  date: string;
  owner: string;
  notes: string;
}

export interface AssessmentItem {
  id: number;
  title: string;
  skill: string;
  description: string;
  phase: "FST" | "PST";
  account: string;
  batch: string;
  max: number;
  passing: number;
  status: "Published" | "Draft";
}

export interface AssessmentGrade {
  assessmentId: number;
  emp: string;
  score: number;
  date: string;
  grader: string;
}

export interface PhaseTrainingScore {
  emp: string;
  phase: "FST" | "PST";
  score: number;
  date: string;
  owner: string;
  source: string;
}

export interface AttendanceRecord {
  id: number;
  emp: string;
  date: string;
  status: "Present" | "Late" | "Absent" | "Excused" | "Unrecorded" | "Rest day";
  source: string;
  notes: string;
  recorded: string;
}

export interface EvidenceItem {
  id: number;
  emp: string;
  type: "Training" | "QDS / QA" | "Performance" | "Coaching" | "Attendance" | "Employee feedback" | "Work quality" | "Other";
  title: string;
  owner: string;
  notes: string;
  date: string;
  score?: number;
}

export interface CheckInItem {
  id: number;
  emp: string;
  date: string;
  type: "Trainer" | "QDS / QA" | "Team Leader" | "Manager" | "HR Coordinator" | "Employee";
  owner: string;
  confidence: number;
  notes: string;
}

export interface CoachingAction {
  id: number;
  emp: string;
  title: string;
  owner: string;
  due: string;
  status: "Open" | "Done";
  notes: string;
}

export interface NotificationEvent {
  id: number;
  emp: string;
  text: string;
  date: string;
  role: string;
}

export interface QDSFollowUpRequest {
  id: number;
  emp: string;
  trainer: string;
  assignedTo: string;
  type: "Independent QA recheck" | "Trainer coaching review" | "Targeted trainee support";
  notes: string;
  due: string;
  status: "Open" | "Acknowledged" | "Closed";
  created: string;
  resolution?: string;
  closed?: string;
}

export interface ReviewRecord {
  decision: string;
  notes: string;
  manager: string;
  hr: boolean;
  date: string;
}

export interface EmployeeJourney {
  id: string; // JRN-2026-001 or SIBS-2901
  nhoApplicantId?: string; // e.g. nho-app-05 or nho-app-06
  nhoHandoffId?: string;
  kronosId?: string; // Official Kronos ID (e.g. KRN-90846) - undefined if missing
  sibsEmployeeId?: string; // SIB-XXXX or directory ID - undefined if missing
  fullName: string;
  preferredName?: string;
  avatarUrl?: string;
  email: string;
  contactNumber?: string;
  roleTitle: string;
  department: string;
  account: string;
  siteLocation: string;
  
  // WFM Seating carried forward from NHO
  wfmSeating?: {
    wing: string;
    seatNumber: string;
    floor?: string;
    assignedBy?: string;
  };

  // Trainer & L&D carried forward from NHO
  trainerId?: string;
  trainerName?: string;
  trainerAcceptedAt?: string;
  qdsMaterials: NHOQDSMaterial[];

  // Role actors
  tl?: string;
  manager?: string;
  hr?: string;
  qa?: string;

  // Readiness & Handoff flags
  readiness?: boolean;
  handoff?: boolean;

  // Unified Milestone Reviews (Day 30, Day 60, Day 90)
  reviews: Record<number, ReviewRecord>;
  finalOutcome?: string; // "Completed" | "Review Completed — Continuing Support" | "Pending / Blocked" | "Ended Before Day 90"
  acknowledged?: boolean; // Employee acknowledgment of Day 90 review

  // Dates
  hireDate?: string; // Preserved original hire date (undefined if missing)
  nhoAcceptedAt?: string;
  nhoAcceptedBy?: string;
  startDate?: string; // Official Day 1
  daysElapsed: number; // Simulated days from start date
  stage: JourneyStage;
  overallProgressPct: number; // 0 - 100%

  // Inherited 14-day non-major requirements from NHO
  outstandingNhoDocuments: NHODocumentItem[];

  // 30 / 60 / 90 Milestones
  day30: Day30Milestone;
  day60: Day60Milestone;
  day90: Day90Milestone;

  // Touchpoint & Coaching History
  touchpoints: JourneyTouchpoint[];

  // Audit Log
  auditTrail: {
    date: string;
    action: string;
    actor: string;
    details?: string;
  }[];

  // Needs manual linkage if employee profile / trainer / start date missing
  isAwaitingLinkage?: boolean;
}
