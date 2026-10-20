export type NHORole = "TA" | "Applicant" | "IT" | "QDS" | "Trainer" | "WFM" | "HR";

export type NHOAttendanceStatus = "Pending" | "Show" | "No Show";
export type NHOPhysicalClearance = "Pending" | "Cleared" | "Not Cleared";
export type NHOOrientationStatus = "Not Started" | "In Progress" | "Completed";
export type NHODocVerificationStatus = "Not Submitted" | "Draft" | "For Verification" | "Needs Correction" | "Verified";
export type NHODeadlineStatus = "On Time" | "Due Soon" | "Overdue" | "Submitted Late";
export type NHOITRequestStatus = "Pending" | "In Progress" | "Needs Correction" | "Completed";

// Parallel Departmental Assignment Statuses (Post-IT Endorsement)
export type NHOTrainerStatus = "Not Ready" | "Pending Assignment" | "Pending Acceptance" | "Accepted" | "Unable to Accept";
export type NHOQDSStatus = "Not Ready" | "Pending" | "In Progress" | "Completed";
export type NHOWFMStatus = "Not Ready" | "Pending" | "Pending WFM Assignment" | "Assigned";
export type NHOProductionWing = "Left Wing" | "Right Wing";
export type NHOHandoffStatus = "Not Ready" | "Waiting for Departments" | "Pending WFM Assignment" | "Pending HR Acceptance" | "Returned for Correction" | "Resubmitted" | "Accepted";
export type NHOTempAccessStatus = "Not Issued" | "Active" | "Suspended" | "Deactivated";
export type NHOOverallOutcome = "In Progress" | "Completed Handoff" | "Drop-Off" | "Withdrawn";

export interface NHOQDSMaterial {
  id: string;
  title: string;
  type: "PDF Document" | "PowerPoint Presentation" | "Word Document" | "Approved Training Resource Link";
  fileOrLinkRef: string;
  fileSize?: string;
  description?: string;
  assignedAt: string;
  assignedBy: string;
  source?: "Catalog" | "Uploaded File" | "Approved Link";
}

export interface NHOTrainerMaterialRequest {
  id: string;
  requestedByTrainerId: string;
  requestedByTrainerName: string;
  requestedAt: string;
  materialTitle: string;
  category?: string;
  reason: string;
  priority: "Standard" | "Urgent";
  status: "Pending QDS Fulfillment" | "Fulfilled" | "Declined";
  fulfilledMaterialId?: string;
  fulfilledAt?: string;
  fulfilledBy?: string;
  qdsResponseNotes?: string;
}

export interface NHOQDSNotification {
  id: string;
  applicantId: string;
  applicantName: string;
  officialKronosId: string;
  account: string;
  department: string;
  timestamp: string;
  message: string;
  isRead: boolean;
  type?: "credentials_ready" | "trainer_request";
  candidateId?: string;
  candidateName?: string;
  kronosId?: string;
  title?: string;
  status?: "Pending Schedule Assignment" | "Schedule Assigned";
}

export interface NHOQDSScheduleAssignment {
  date: string;
  shiftHours: string;
  trainingLocation: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  assignedAt?: string;
  assignedBy?: string;
  remarks?: string;
}

export interface NHODocumentItem {
  id: string;
  name: string;
  category: "Major" | "Essential Agreement" | "NHO Template" | "Pre-Employment";
  isMajor: boolean;
  isEssentialAgreement: boolean;
  status: NHODocVerificationStatus;
  deadlineStatus?: NHODeadlineStatus;
  dueDate?: string; // YYYY-MM-DD (14-day deadline strictly for non-major requirements)
  submittedDate?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  correctionRemarks?: string;
  submissionMethod?: "Electronic Signature" | "Manual Upload" | "Physical Copy" | "Direct Upload";
  signatureDataUrl?: string;
  fileName?: string;
  fileSize?: string;
  description?: string;
  templateCode?: string;
  documentOwner?: "TA" | "HR";
  previousSubmissions?: Array<{
    fileName?: string;
    fileSize?: string;
    submittedDate?: string;
    submissionMethod?: string;
    signatureDataUrl?: string;
    correctionRemarks?: string;
    verifiedDate?: string;
    verifiedBy?: string;
  }>;
}

export interface NHOFollowUpLog {
  id: string;
  date: string;
  attemptedBy: string;
  method: "Telephone Call" | "SMS" | "Email";
  result: "Reached - Agreed to Reschedule" | "Reached - Declining / Withdrawn" | "No Answer" | "Busy / Unreachable";
  remarks: string;
}

export interface NHOAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface NHOApplicant {
  id: string;
  applicantNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  account: string;
  cluster: string;
  reportingLocation: string;
  scheduledNhoDate: string; // YYYY-MM-DD
  invitationSentDate: string; // YYYY-MM-DD
  scheduleAccepted: boolean;
  
  // Attendance & Physical Clearance
  attendance: NHOAttendanceStatus;
  attendanceMarkedAt?: string;
  noShowReason?: string;
  noShowRemarks?: string;
  showEmailDispatchedAt?: string;
  showInstructionsSent?: boolean;
  physicalClearance: NHOPhysicalClearance;
  clearedDate?: string; // successfully completed physical NHO date
  nonMajorDeadlineDate?: string; // 14 calendar days after clearedDate
  
  // Follow up / Reschedule
  rescheduledCount: number;
  followUpLogs: NHOFollowUpLog[];
  
  // Temporary Portal Access
  tempAccessStatus: NHOTempAccessStatus;
  tempPasswordGenerated?: boolean;
  tempPasswordHash?: string;
  passwordRetrievalToken?: string;
  retrievalLinkExpiresAt?: string;
  retrievalLinkUsed?: boolean;
  retrievalLinkExpired?: boolean;
  retrievalRecoveryCount?: number;
  hasChangedPassword?: boolean;
  firstRegularHrisLoginAt?: string;

  // Orientation
  orientationStatus: NHOOrientationStatus;
  orientationVersion?: string;
  orientationCurrentSlide: number;
  orientationSlidesViewed: number[];
  orientationQuizAnswers: Record<number, number>; // questionIndex -> selectedOptionIndex
  orientationAcknowledged: boolean;
  orientationCompletedAt?: string;

  // Documents
  documents: NHODocumentItem[];

  // IT Endorsement
  itEndorsed: boolean;
  itEndorsedAt?: string;
  itEndorsedBy?: string;
  itRequestStatus: NHOITRequestStatus;
  proposedKronosUsername: string;
  kronosDisplayName: string;
  assignedDepartment: string;
  itProvisioningRemarks?: string;
  officialKronosId?: string;
  itCompletedAt?: string;
  itCredentialsNotifiedToQds?: boolean;
  itCredentialsNotifiedAt?: string;

  // Trainer Assignment (Post-IT Endorsement)
  trainerStatus: NHOTrainerStatus;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  trainerAssignedAt?: string;
  trainerAcceptedAt?: string;
  trainerAcceptedBy?: string;
  trainerAcceptedById?: string;
  trainerReviewedMaterials?: boolean;
  trainerUnableReason?: string;
  trainerRemarks?: string;
  trainerMaterialRequests?: NHOTrainerMaterialRequest[];

  // QDS Training Materials Assignment & Attendance Scheduling
  qdsStatus: NHOQDSStatus;
  qdsAssignedAt?: string;
  qdsCompletedAt?: string;
  qdsCompletedBy?: string;
  qdsMaterials: NHOQDSMaterial[];
  qdsAssignedScheduleDate?: string; // YYYY-MM-DD
  qdsShiftHours?: string; // e.g. "08:00 AM – 05:00 PM"
  qdsTrainingLocation?: string; // e.g. "Fintech Training Room 4A"
  qdsScheduleAssignedAt?: string;
  qdsScheduleAssignedBy?: string;

  // WFM Production Seat Assignment
  wfmStatus: NHOWFMStatus;
  wfmProductionWing?: NHOProductionWing;
  wfmSeatNumber?: string;
  wfmAssignedBy?: string;
  wfmAssignedAt?: string;
  wfmRemarks?: string;

  // HR Handoff
  handoffStatus: NHOHandoffStatus;
  handoffSubmittedAt?: string;
  handoffReviewedAt?: string;
  handoffReviewedBy?: string;
  handoffCorrectionRemarks?: string;
  hrAcceptedAt?: string;
  hrAcceptedBy?: string;
  linkedEmployeeJourneyId?: string;

  twoWeekSchedule?: NHODailyTrainingSchedule[];

  // Overall outcome
  outcome: NHOOverallOutcome;
  withdrawalReason?: string;
  withdrawnAt?: string;

  // Audit trail
  auditLogs: NHOAuditLog[];
}

export type NHOTrainingPhase = "FST" | "PST";

export interface NHODailyTrainingSchedule {
  dayNumber: number; // 1 to 10
  phase: NHOTrainingPhase; // "FST" (Week 1, Days 1-5) | "PST" (Week 2, Days 6-10)
  weekNumber: 1 | 2;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  date: string; // YYYY-MM-DD
  title: string;
  topics: string[];
  shiftHours: string;
  room: string;
  trainerId: string;
  trainerName: string;
  trainerRole?: string;
  materials: NHOQDSMaterial[];
  status?: "Scheduled" | "In Progress" | "Completed";
}

export interface NHOQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface NHOQDSAttendanceSchedule {
  scheduledDate: string;
  shiftHours: string;
  trainingLocation: string;
  assignedBy?: string;
  assignedAt?: string;
}

