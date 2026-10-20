import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  NHOApplicant, 
  NHORole, 
  NHOAttendanceStatus, 
  NHOPhysicalClearance, 
  NHODocumentItem,
  NHOFollowUpLog,
  NHOAuditLog,
  NHOProductionWing,
  NHOWFMStatus,
  NHOTrainerStatus,
  NHOQDSStatus,
  NHOQDSMaterial,
  NHOHandoffStatus,
  NHOTrainerMaterialRequest,
  NHOQDSNotification,
  NHOQDSAttendanceSchedule
} from "./nhoTypes";
import { INITIAL_NHO_APPLICANTS } from "./nhoInitialData";
import { pureCreateOrLinkJourney, JOURNEY_STORAGE_KEY } from "../journey/JourneyContext";
import { INITIAL_JOURNEYS } from "../journey/journeyInitialData";

// ==========================================
// ASIA/MANILA DATE UTILITIES (UTC+8)
// ==========================================
export const parseManilaDate = (dateStr: string): Date => {
  const parts = dateStr.split(" ")[0].split("-").map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0));
};

export const formatManilaDate = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const addCalendarDays = (dateStr: string, days: number): string => {
  const dt = parseManilaDate(dateStr);
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatManilaDate(dt);
};

export const calendarDaysBetween = (fromDateStr: string, toDateStr: string): number => {
  const dt1 = parseManilaDate(fromDateStr);
  const dt2 = parseManilaDate(toDateStr);
  const diffMs = dt2.getTime() - dt1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const checkSevenDayNotice = (scheduledDateStr: string, fromDateStr: string = "2026-10-09"): boolean => {
  const days = calendarDaysBetween(fromDateStr, scheduledDateStr);
  return days >= 7;
};

export const deriveDeadlineStatus = (
  dueDate: string,
  submittedDate?: string,
  currentDate: string = "2026-10-09"
): "On Time" | "Due Soon" | "Overdue" | "Submitted Late" => {
  if (submittedDate) {
    return submittedDate > dueDate ? "Submitted Late" : "On Time";
  }
  if (currentDate > dueDate) {
    return "Overdue";
  }
  const daysLeft = calendarDaysBetween(currentDate, dueDate);
  if (daysLeft <= 3 && daysLeft >= 0) {
    return "Due Soon";
  }
  return "On Time";
};

// ==========================================
// CONTEXT INTERFACE
// ==========================================
interface NHOContextType {
  role: NHORole;
  setRole: (role: NHORole) => void;
  selectedApplicantId: string;
  setSelectedApplicantId: (id: string) => void;
  applicants: NHOApplicant[];
  activeApplicant: NHOApplicant;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  
  // Controllable Demo Date
  simulatedCurrentDate: string;
  setSimulatedCurrentDate: (dateStr: string) => void;

  // Operations
  resetDemoData: () => void;
  resetWalkthroughApplicant: () => void;
  markAttendance: (
    applicantId: string, 
    status: NHOAttendanceStatus, 
    correctionReason?: string,
    noShowReason?: string,
    noShowRemarks?: string
  ) => { success: boolean; error?: string };
  recordFollowUp: (applicantId: string, log: Omit<NHOFollowUpLog, "id" | "date" | "attemptedBy">) => void;
  rescheduleNHO: (applicantId: string, newDate: string, reason: string) => { success: boolean; error?: string };
  acceptRescheduledSchedule: (applicantId: string) => void;
  markDropOff: (applicantId: string, reason: string) => { success: boolean; error?: string };
  withdrawApplicant: (applicantId: string, reason: string) => { success: boolean; error?: string };
  
  // QDS Application Sync & Notifications
  qdsNotifications: NHOQDSNotification[];
  dismissQdsNotification: (notificationId: string) => void;
  qdsAssignAttendanceSchedule: (
    applicantId: string,
    schedule: {
      scheduledDate: string;
      shiftHours: string;
      trainingLocation: string;
      assignedBy?: string;
    }
  ) => { success: boolean; error?: string };
  
  // Applicant Portal Actions
  simulatePasswordRetrieval: (applicantId: string) => { success: boolean; password?: string; error?: string };
  sendTempAccessCredentialsLink: (applicantId: string, channel?: "Email" | "SMS" | "Both") => { success: boolean; error?: string };
  simulateLinkExpiration: (applicantId: string) => void;
  recoverRetrievalLink: (applicantId: string) => void;
  applicantChangePassword: (applicantId: string, newPass: string) => { success: boolean; error?: string };
  updateOrientationSlide: (applicantId: string, slideNumber: number) => void;
  submitQuizAnswer: (applicantId: string, questionIndex: number, optionIndex: number) => { success: boolean; error?: string };
  completeOrientation: (applicantId: string, acknowledged?: boolean) => { success: boolean; error?: string };
  submitAgreement: (
    applicantId: string, 
    documentId: string, 
    method: "Electronic Signature" | "Manual Upload",
    signatureDataUrl?: string,
    fileName?: string
  ) => { success: boolean; error?: string };
  submitOtherDocument: (applicantId: string, documentId: string, fileName: string, fileSize: string) => { success: boolean; error?: string };
  
  // TA Document Verification
  verifyDocument: (applicantId: string, documentId: string) => { success: boolean; error?: string };
  returnDocumentForCorrection: (applicantId: string, documentId: string, remarks: string) => { success: boolean; error?: string };
  
  // IT Endorsement & Provisioning
  checkITEndorsementEligibility: (applicant: NHOApplicant) => {
    isEligible: boolean;
    checks: { label: string; passed: boolean; message?: string }[];
    hasTerminalStatus: boolean;
    hasInvalidClearance: boolean;
    isAlreadyProcessed: boolean;
  };
  endorseToIT: (applicantId: string) => { success: boolean; error?: string };
  itStartProcessing: (applicantId: string) => { success: boolean; error?: string };
  itUpdatePermittedFields: (
    applicantId: string, 
    updates: { proposedUsername?: string; displayName?: string; dept?: string; remarks?: string }, 
    reason: string
  ) => { success: boolean; error?: string };
  itCompleteProvisioning: (applicantId: string, kronosId: string) => { success: boolean; error?: string };
  
  // Parallel Department Assignments (Post-IT Endorsement)
  // 1. Trainer Assignment
  trainerAcceptTrainee: (
    applicantId: string, 
    trainerIdOrName?: string, 
    reviewedMaterials?: boolean, 
    remarks?: string
  ) => { success: boolean; error?: string };
  trainerDeclineTrainee: (applicantId: string, reason: string, trainerIdOrName?: string) => { success: boolean; error?: string };
  trainerReassign: (applicantId: string, newTrainerId: string, newTrainerName?: string, actingRole?: NHORole) => { success: boolean; error?: string };
  trainerRequestMaterial: (
    applicantId: string,
    request: {
      materialTitle: string;
      category?: string;
      reason: string;
      priority?: "Standard" | "Urgent";
    },
    actingTrainerIdOrName?: string
  ) => { success: boolean; error?: string };

  // 2. QDS Training Materials
  qdsAddMaterial: (
    applicantId: string, 
    material: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">,
    correctionReason?: string,
    actingRole?: NHORole
  ) => { success: boolean; error?: string };
  qdsRemoveMaterial: (
    applicantId: string, 
    materialId: string,
    correctionReason?: string,
    actingRole?: NHORole
  ) => { success: boolean; error?: string };
  qdsConfirmMaterials: (applicantId: string, actingRole?: NHORole) => { success: boolean; error?: string };
  qdsAssignAndSendToTrainer: (
    applicantId: string,
    trainerId: string,
    trainerName?: string,
    actingRole?: NHORole
  ) => { success: boolean; error?: string };
  qdsFulfillMaterialRequest: (
    applicantId: string,
    requestId: string,
    fulfilledMaterial: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">
  ) => { success: boolean; error?: string };

  // 3. WFM Production Seat Assignment
  wfmConfirmSeatAssignment: (
    applicantId: string, 
    wing: NHOProductionWing, 
    seatNumber: string, 
    remarks?: string,
    actingRole?: NHORole
  ) => { success: boolean; error?: string };

  // HR Handoff
  hrAcceptHandoff: (applicantId: string, actingRole?: NHORole) => { success: boolean; error?: string };
  hrReturnHandoff: (applicantId: string, remarks: string) => { success: boolean; error?: string };
  taResubmitHandoff: (applicantId: string, resolutionRemarks?: string) => { success: boolean; error?: string };
  
  // Transition
  simulateFirstRegularLogin: (applicantId: string) => { success: boolean; error?: string };
}

const NHOContext = createContext<NHOContextType | undefined>(undefined);

export const DEFAULT_SIMULATED_DATE = "2026-10-09";

export const AUTHORIZED_TRAINERS = [
  { id: "TRN-001", name: "Maria Elena Garcia (Senior Trainer)" },
  { id: "TRN-002", name: "Carlos Mendoza (L&D Specialist)" },
  { id: "TRN-003", name: "Patricia Cruz (Lead Communications Coach)" },
  { id: "TRN-004", name: "Danielle Lopez (Operations Trainer)" }
];

export const createAuditLogEntry = (
  actor: string, 
  userRole: string, 
  action: string, 
  details: string, 
  prev?: string, 
  next?: string,
  simDate: string = DEFAULT_SIMULATED_DATE
): NHOAuditLog => ({
  id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  timestamp: `${simDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  actor,
  role: userRole,
  action,
  details,
  previousValue: prev,
  newValue: next
});

// =========================================================================
// PURE POST-IT PARALLEL DEPARTMENT & HR ACCEPTANCE HANDLERS
// =========================================================================

// =========================================================================
// WORKSTREAM READINESS (COMBINED 2/2 POST-IT EVALUATION)
// =========================================================================

export function getWorkstreamReadiness(app: NHOApplicant): {
  isItComplete: boolean;
  isTrainerAccepted: boolean;
  isQdsComplete: boolean;
  isWfmAssigned: boolean;
  trainingReadinessComplete: boolean;
  wfmReadinessComplete: boolean;
  readyCount: number;
  totalCount: number;
  isAllReady: boolean;
} {
  const isItComplete = app.itRequestStatus === "Completed" && !!app.officialKronosId?.trim();
  
  // Training Readiness strictly requires:
  // 1. QDS finalized at least 1 curriculum material
  // 2. Trainer status === "Accepted"
  // 3. trainerAcceptedById exists AND strictly matches assignedTrainerId (no name-only fallback)
  // 4. trainerReviewedMaterials === true
  const isQdsComplete = app.qdsStatus === "Completed" && Array.isArray(app.qdsMaterials) && app.qdsMaterials.length > 0;
  const isTrainerAccepted = app.trainerStatus === "Accepted"
    && !!app.trainerAcceptedById
    && app.trainerAcceptedById === app.assignedTrainerId
    && app.trainerReviewedMaterials === true;

  const trainingReadinessComplete = isQdsComplete && isTrainerAccepted;

  // WFM Seating workstream requires wing and seat assignment
  const isWfmAssigned = app.wfmStatus === "Assigned" && !!app.wfmProductionWing && !!app.wfmSeatNumber?.trim();
  const wfmReadinessComplete = isWfmAssigned;

  let readyCount = 0;
  if (trainingReadinessComplete) readyCount++;
  if (wfmReadinessComplete) readyCount++;

  return {
    isItComplete,
    isTrainerAccepted,
    isQdsComplete,
    isWfmAssigned,
    trainingReadinessComplete,
    wfmReadinessComplete,
    readyCount,
    totalCount: 2,
    isAllReady: isItComplete && trainingReadinessComplete && wfmReadinessComplete
  };
}

export function handleTrainerAcceptTrainee(
  applicants: NHOApplicant[],
  applicantId: string,
  actingTrainerIdOrName?: string,
  reviewedMaterials: boolean = false,
  remarks?: string,
  role: NHORole = "Trainer",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "Trainer") {
    return { success: false, error: "Unauthorized: Only Trainer role can accept trainee responsibility." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot accept trainee: HR has already accepted and finalized this onboarding case." };
  }

  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot accept trainee: IT provisioning must be completed with an official Kronos ID first." };
  }

  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot accept trainee: Applicant is in terminal status (${target.outcome}).` };
  }

  if (target.trainerStatus === "Accepted") {
    return { success: false, error: "Cannot accept trainee: Trainee responsibility has already been accepted." };
  }
  if (target.trainerStatus !== "Pending Acceptance") {
    return { success: false, error: `Cannot accept trainee: Trainer status must be 'Pending Acceptance'. Current status is '${target.trainerStatus}'.` };
  }

  // 1. QDS assignment must be finalized with at least 1 valid training material
  const targetMaterials = Array.isArray(target.qdsMaterials) ? target.qdsMaterials : [];
  if (target.qdsStatus !== "Completed" || targetMaterials.length === 0) {
    return {
      success: false,
      error: "Cannot accept trainee: QDS must finalize training materials before trainer acceptance."
    };
  }

  // 2. Explicit acting trainer identification required (never default when missing)
  if (!actingTrainerIdOrName || !actingTrainerIdOrName.trim()) {
    return {
      success: false,
      error: "Explicit trainer identification required: Acting trainer ID or name must be provided. Anonymous acceptance is blocked."
    };
  }

  const trimmedInput = actingTrainerIdOrName.trim();
  const matchedById = AUTHORIZED_TRAINERS.find(t => t.id.toLowerCase() === trimmedInput.toLowerCase());
  const matchedByName = AUTHORIZED_TRAINERS.find(t => t.name.toLowerCase() === trimmedInput.toLowerCase());
  const matchedTrainer = matchedById || matchedByName;

  if (!matchedTrainer) {
    return {
      success: false,
      error: `Invalid trainer identity: Submitted trainer "${trimmedInput}" is not recognized on the authorized SiBS L&D trainer roster.`
    };
  }

  // 3. Stable ID validation: acting trainer must match assigned trainer ID
  if (!target.assignedTrainerId || matchedTrainer.id !== target.assignedTrainerId) {
    return {
      success: false,
      error: `Unauthorized: Acting trainer "${matchedTrainer.name}" (${matchedTrainer.id}) does not match assigned trainer ID "${target.assignedTrainerId}". Only the assigned trainer can accept responsibility.`
    };
  }

  // 4. Explicit material review acknowledgment required (never default to true)
  if (reviewedMaterials !== true) {
    return {
      success: false,
      error: "Material review required: Trainer must explicitly confirm that they have reviewed all assigned training materials (reviewedMaterials === true)."
    };
  }

  const acceptedTimestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const isWfmComplete = a.wfmStatus === "Assigned";
    const newHandoffStatus: NHOHandoffStatus = isWfmComplete ? "Pending HR Acceptance" : "Waiting for Departments";

    const audit = createAuditLogEntry(
      matchedTrainer.name,
      "Trainer",
      "Trainee Responsibility Accepted",
      `Trainer ${matchedTrainer.name} (${matchedTrainer.id}) reviewed ${targetMaterials.length} curriculum materials and accepted training responsibility. Remarks: ${remarks?.trim() || "None"}.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    return {
      ...a,
      trainerStatus: "Accepted" as const,
      trainerAcceptedAt: acceptedTimestamp,
      trainerAcceptedBy: matchedTrainer.name,
      trainerAcceptedById: matchedTrainer.id,
      trainerReviewedMaterials: true,
      trainerRemarks: remarks?.trim() || a.trainerRemarks,
      trainerUnableReason: undefined,
      handoffStatus: newHandoffStatus,
      handoffSubmittedAt: isWfmComplete ? acceptedTimestamp : a.handoffSubmittedAt,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleTrainerDeclineTrainee(
  applicants: NHOApplicant[],
  applicantId: string,
  reason: string,
  actingTrainerIdOrName?: string,
  role: NHORole = "Trainer",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "Trainer") {
    return { success: false, error: "Unauthorized: Only Trainer role can record unable to accept." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot decline trainee: HR has already accepted and finalized this onboarding case." };
  }
  if (target.trainerStatus === "Accepted") {
    return { success: false, error: "Cannot decline trainee: Responsibility has already been accepted. Once accepted, trainee cannot be declined." };
  }
  if (target.trainerStatus !== "Pending Acceptance") {
    return { success: false, error: `Cannot decline trainee: Trainer status must be 'Pending Acceptance'. Current status is '${target.trainerStatus}'.` };
  }

  // 1. IT provisioning must be completed
  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot decline trainee: IT provisioning must be completed first." };
  }

  // 2. QDS assignment must be finalized
  if (target.qdsStatus !== "Completed") {
    return { success: false, error: "Cannot decline trainee: QDS assignment must be finalized before trainer review." };
  }

  // 3. Non-empty declination reason
  if (!reason || !reason.trim()) {
    return { success: false, error: "Mandatory requirement: Please provide a specific reason for being unable to accept this trainee." };
  }

  // 4. Explicit acting trainer identification required
  if (!actingTrainerIdOrName || !actingTrainerIdOrName.trim()) {
    return { success: false, error: "Explicit trainer identification required: Acting trainer ID or name must be provided." };
  }

  const trimmedInput = actingTrainerIdOrName.trim();
  const matchedById = AUTHORIZED_TRAINERS.find(t => t.id.toLowerCase() === trimmedInput.toLowerCase());
  const matchedByName = AUTHORIZED_TRAINERS.find(t => t.name.toLowerCase() === trimmedInput.toLowerCase());
  const matchedTrainer = matchedById || matchedByName;

  if (!matchedTrainer) {
    return {
      success: false,
      error: `Invalid trainer identity: Submitted trainer "${trimmedInput}" is not recognized on the authorized SiBS L&D trainer roster.`
    };
  }

  if (matchedTrainer.id !== target.assignedTrainerId) {
    return {
      success: false,
      error: `Unauthorized: Acting trainer "${matchedTrainer.name}" (${matchedTrainer.id}) cannot decline a trainee assigned to ${target.assignedTrainerName || target.assignedTrainerId}. Only the assigned trainer can decline.`
    };
  }

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const audit = createAuditLogEntry(
      matchedTrainer.name,
      "Trainer",
      "Unable to Accept Trainee",
      `Trainer ${matchedTrainer.name} (${matchedTrainer.id}) recorded unable to accept. Reason: "${reason.trim()}". Pending QDS reassignment.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );
    return {
      ...a,
      trainerStatus: "Unable to Accept" as const,
      trainerUnableReason: reason.trim(),
      trainerAcceptedAt: undefined,
      trainerAcceptedBy: undefined,
      trainerAcceptedById: undefined,
      trainerReviewedMaterials: false,
      handoffStatus: "Waiting for Departments" as const,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleTrainerRequestMaterial(
  applicants: NHOApplicant[],
  applicantId: string,
  request: {
    materialTitle: string;
    category?: string;
    reason: string;
    priority?: "Standard" | "Urgent";
  },
  actingTrainerIdOrName?: string,
  role: NHORole = "Trainer",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "Trainer") {
    return { success: false, error: "Unauthorized: Only Trainer role can submit curriculum material requests." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot request materials: HR has already accepted and finalized this onboarding case." };
  }

  if (!request.materialTitle?.trim()) {
    return { success: false, error: "Material title / subject is required." };
  }
  if (!request.reason?.trim()) {
    return { success: false, error: "Justification reason is required for requesting curriculum materials from QDS." };
  }

  const trimmedInput = (actingTrainerIdOrName || target.assignedTrainerName || "TRN-001").trim();
  const matchedById = AUTHORIZED_TRAINERS.find(t => t.id.toLowerCase() === trimmedInput.toLowerCase());
  const matchedByName = AUTHORIZED_TRAINERS.find(t => t.name.toLowerCase() === trimmedInput.toLowerCase());
  const trainer = matchedById || matchedByName || AUTHORIZED_TRAINERS[0];

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const newRequest: NHOTrainerMaterialRequest = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    requestedByTrainerId: trainer.id,
    requestedByTrainerName: trainer.name,
    requestedAt: timestamp,
    materialTitle: request.materialTitle.trim(),
    category: request.category || "Specialized Curriculum",
    reason: request.reason.trim(),
    priority: request.priority || "Standard",
    status: "Pending QDS Fulfillment"
  };

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const audit = createAuditLogEntry(
      trainer.name,
      "Trainer",
      "Curriculum Material Requested",
      `Trainer ${trainer.name} (${trainer.id}) requested curriculum material: "${request.materialTitle.trim()}" (Priority: ${request.priority || "Standard"}, Reason: "${request.reason.trim()}"). Awaiting QDS fulfillment.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );
    const existingReqs = a.trainerMaterialRequests || [];
    return {
      ...a,
      trainerMaterialRequests: [newRequest, ...existingReqs],
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleTrainerReassign(
  applicants: NHOApplicant[],
  applicantId: string,
  newTrainerId: string,
  newTrainerName?: string,
  actingRole?: NHORole,
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  // ONLY QDS can assign or reassign trainers. Reject TA, HR, IT, WFM, Trainer, Applicant, and omitted role.
  if (!actingRole || actingRole !== "QDS") {
    return {
      success: false,
      error: `Unauthorized: Only Quality Development Specialist (QDS) can assign or reassign trainers. Role "${actingRole || "omitted"}" is strictly unauthorized.`
    };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot reassign trainer: HR has already accepted and finalized this onboarding case." };
  }

  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot reassign trainer: IT account provisioning must be Completed with an official Kronos ID first." };
  }

  const validTrainer = AUTHORIZED_TRAINERS.find(t => t.id === newTrainerId);
  if (!validTrainer) {
    return {
      success: false,
      error: `Invalid replacement trainer: Trainer ID "${newTrainerId}" is not a recognized authorized trainer on the SiBS L&D roster.`
    };
  }

  if (newTrainerName && newTrainerName.trim() && newTrainerName.trim() !== validTrainer.name) {
    return {
      success: false,
      error: `Invalid replacement trainer: Provided name "${newTrainerName}" does not match registered roster name "${validTrainer.name}" for ID ${newTrainerId}.`
    };
  }

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const audit = createAuditLogEntry(
      "Quality Development Specialist",
      "QDS",
      "Trainer Reassigned",
      `QDS reassigned trainee from ${a.assignedTrainerName || "Unassigned"} (${a.assignedTrainerId || "none"}) to ${validTrainer.name} (${validTrainer.id}). Previous trainer acceptance invalidated.`,
      a.assignedTrainerId,
      validTrainer.id,
      simulatedCurrentDate
    );
    return {
      ...a,
      assignedTrainerId: validTrainer.id,
      assignedTrainerName: validTrainer.name,
      trainerStatus: "Pending Acceptance" as const,
      trainerAssignedAt: timestamp,
      trainerAcceptedAt: undefined,
      trainerAcceptedBy: undefined,
      trainerAcceptedById: undefined,
      trainerReviewedMaterials: false,
      trainerUnableReason: undefined,
      handoffStatus: a.handoffStatus === "Pending HR Acceptance" ? "Waiting for Departments" : a.handoffStatus,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSAssignAndSendToTrainer(
  applicants: NHOApplicant[],
  applicantId: string,
  trainerId: string,
  trainerName?: string,
  actingRole?: NHORole,
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  const effectiveRole = actingRole || "QDS";
  if (effectiveRole !== "QDS") {
    return {
      success: false,
      error: `Unauthorized: Only Quality Development Specialist (QDS) can assign trainer and send training package. Role "${effectiveRole}" is unauthorized.`
    };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot assign trainer: HR has already accepted and finalized this onboarding case." };
  }

  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot assign trainer: IT account provisioning must be Completed with an official Kronos ID first." };
  }

  const validTrainer = AUTHORIZED_TRAINERS.find(t => t.id === trainerId);
  if (!validTrainer) {
    return {
      success: false,
      error: `Invalid trainer: Trainer ID "${trainerId}" is not a recognized authorized trainer on the SiBS L&D roster.`
    };
  }

  if (trainerName && trainerName.trim() && trainerName.trim() !== validTrainer.name) {
    return {
      success: false,
      error: `Invalid replacement trainer: Provided name "${trainerName}" does not match registered roster name "${validTrainer.name}" for ID ${trainerId}.`
    };
  }

  const materials = Array.isArray(target.qdsMaterials) ? target.qdsMaterials : [];
  if (materials.length === 0) {
    return {
      success: false,
      error: "Cannot dispatch to Trainer: Please assign at least 1 training material to the trainee curriculum before sending."
    };
  }

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const audit = createAuditLogEntry(
      "Carla Villanueva",
      "QDS",
      "Trainer & Curriculum Dispatched to Trainer",
      `QDS assigned Trainer ${validTrainer.name} (${validTrainer.id}) alongside ${materials.length} training materials and dispatched package to Trainer for acceptance.`,
      a.assignedTrainerId,
      validTrainer.id,
      simulatedCurrentDate
    );

    return {
      ...a,
      assignedTrainerId: validTrainer.id,
      assignedTrainerName: validTrainer.name,
      trainerStatus: "Pending Acceptance" as const,
      trainerAssignedAt: timestamp,
      trainerAcceptedAt: undefined,
      trainerAcceptedBy: undefined,
      trainerAcceptedById: undefined,
      trainerReviewedMaterials: false,
      trainerUnableReason: undefined,
      qdsStatus: "Completed" as const,
      qdsCompletedAt: timestamp,
      qdsCompletedBy: "Carla Villanueva (Lead QDS)",
      handoffStatus: a.handoffStatus === "Pending HR Acceptance" ? "Waiting for Departments" : a.handoffStatus,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSFulfillMaterialRequest(
  applicants: NHOApplicant[],
  applicantId: string,
  requestId: string,
  fulfilledMaterial: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">,
  role: NHORole = "QDS",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "QDS") {
    return { success: false, error: "Unauthorized: Only Quality Development Specialist (QDS) can fulfill material requests." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot fulfill material request: HR has already accepted and finalized this onboarding case." };
  }

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const newMat: NHOQDSMaterial = {
    ...fulfilledMaterial,
    id: `qds-mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    assignedAt: timestamp,
    assignedBy: "Carla Villanueva (Lead QDS)"
  };

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const existingReqs = a.trainerMaterialRequests || [];
    const updatedReqs = existingReqs.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: "Fulfilled" as const,
        fulfilledMaterialId: newMat.id,
        fulfilledAt: timestamp,
        fulfilledBy: "Carla Villanueva (Lead QDS)"
      };
    });

    const audit = createAuditLogEntry(
      "Carla Villanueva",
      "QDS",
      "Trainer Material Request Fulfilled",
      `QDS fulfilled trainer material request with "${newMat.title}" (${newMat.type}). Attached to trainee curriculum.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    const existingMaterials = Array.isArray(a.qdsMaterials) ? a.qdsMaterials : [];
    return {
      ...a,
      qdsMaterials: [...existingMaterials, newMat],
      trainerMaterialRequests: updatedReqs,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSAssignAttendanceSchedule(
  applicants: NHOApplicant[],
  applicantId: string,
  schedule: {
    scheduledDate: string;
    shiftHours: string;
    trainingLocation: string;
    assignedBy?: string;
  },
  role: NHORole = "QDS",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "QDS") {
    return { success: false, error: "Unauthorized: Only Quality Development Specialist (QDS) can assign attendance schedules." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot modify schedule: HR has already accepted and finalized this onboarding case." };
  }
  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot assign schedule: Applicant is in terminal status (${target.outcome}).` };
  }
  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot assign attendance schedule: IT team must complete temporary access credentials and Kronos ID provisioning first." };
  }

  if (!schedule.scheduledDate?.trim()) {
    return { success: false, error: "Training attendance schedule date is required." };
  }
  if (!schedule.shiftHours?.trim()) {
    return { success: false, error: "Shift hours are required." };
  }
  if (!schedule.trainingLocation?.trim()) {
    return { success: false, error: "Training location/room is required." };
  }

  const assignedBy = schedule.assignedBy || "Carla Villanueva (Lead QDS)";
  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const audit: NHOAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    actor: assignedBy,
    role: "Quality Development (QDS)",
    action: "Attendance Schedule Assigned",
    details: `QDS assigned training attendance schedule: ${schedule.scheduledDate.trim()} (${schedule.shiftHours.trim()}) at ${schedule.trainingLocation.trim()}. Synchronized with HR Operations.`,
    previousValue: target.qdsAssignedScheduleDate || "Unassigned",
    newValue: schedule.scheduledDate.trim()
  };

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    return {
      ...a,
      qdsAssignedScheduleDate: schedule.scheduledDate.trim(),
      qdsShiftHours: schedule.shiftHours.trim(),
      qdsTrainingLocation: schedule.trainingLocation.trim(),
      qdsScheduleAssignedAt: timestamp,
      qdsScheduleAssignedBy: assignedBy,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSAddMaterial(
  applicants: NHOApplicant[],
  applicantId: string,
  material: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">,
  correctionReason?: string,
  role: NHORole = "QDS",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "QDS") {
    return { success: false, error: "Unauthorized: Only Quality Development Specialist (QDS) can assign training materials." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot modify materials: HR has already accepted and finalized this onboarding case." };
  }
  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot manage QDS materials: Applicant is in terminal status (${target.outcome}).` };
  }
  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot assign materials: Applicant must have completed IT provisioning with an official Kronos ID first." };
  }

  if (!material.title?.trim()) {
    return { success: false, error: "Material title is required." };
  }

  const cleanedRef = (material.fileOrLinkRef || "").trim();
  if (!cleanedRef) {
    return { success: false, error: "Missing material reference: An uploaded filename or approved URL link is required. System does not fabricate missing references." };
  }

  const isPreviouslyCompleted = target.qdsStatus === "Completed";
  if (isPreviouslyCompleted && (!correctionReason || !correctionReason.trim())) {
    return { success: false, error: "Curriculum is already finalized. Modifying finalized materials requires a documented correction reason." };
  }

  let materialSource: "Catalog" | "Uploaded File" | "Approved Link" = "Uploaded File";
  if (material.source) {
    materialSource = material.source;
  } else if (cleanedRef.startsWith("http://") || cleanedRef.startsWith("https://")) {
    materialSource = "Approved Link";
  } else if (cleanedRef.includes("Playbook") || cleanedRef.includes("Scripts") || cleanedRef.includes("Standards") || cleanedRef.includes("Compliance") || cleanedRef.includes("Fintech")) {
    materialSource = "Catalog";
  }

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const newMat: NHOQDSMaterial = {
    id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: material.title.trim(),
    type: material.type,
    fileOrLinkRef: cleanedRef,
    fileSize: material.fileSize || (materialSource === "Approved Link" ? "Web Link" : "2.4 MB"),
    description: material.description?.trim(),
    assignedAt: timestamp,
    assignedBy: "Carla Villanueva (Lead QDS)",
    source: materialSource
  };

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const newQdsStatus: NHOQDSStatus = isPreviouslyCompleted ? "In Progress" : (a.qdsStatus === "Completed" ? "Completed" : "In Progress");
    const newHandoffStatus = isPreviouslyCompleted ? "Waiting for Departments" : a.handoffStatus;

    const audit = createAuditLogEntry(
      "Carla Villanueva",
      "Quality Development Specialist",
      isPreviouslyCompleted ? "Curriculum Corrected (Material Added)" : "Training Material Added",
      isPreviouslyCompleted
        ? `Added material "${newMat.title}" (${newMat.type}, Source: ${newMat.source}) under documented correction: "${correctionReason?.trim()}". QDS readiness reset to In Progress.`
        : `Assigned material: "${newMat.title}" (${newMat.type}, Source: ${newMat.source}). Reference: ${cleanedRef}.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    const existingMaterials = Array.isArray(a.qdsMaterials) ? a.qdsMaterials : [];

    return {
      ...a,
      qdsMaterials: [...existingMaterials, newMat],
      qdsStatus: newQdsStatus,
      handoffStatus: newHandoffStatus,
      qdsAssignedAt: a.qdsAssignedAt || timestamp,
      auditLogs: [audit, ...(a.auditLogs || [])]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSRemoveMaterial(
  applicants: NHOApplicant[],
  applicantId: string,
  materialId: string,
  correctionReason?: string,
  role: NHORole = "QDS",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "QDS") {
    return { success: false, error: "Unauthorized: Only Quality Development Specialist (QDS) can remove training materials." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot remove materials: HR has already accepted and finalized this onboarding case." };
  }
  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot manage QDS materials: Applicant is in terminal status (${target.outcome}).` };
  }
  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot remove materials: Applicant must have completed IT provisioning with an official Kronos ID first." };
  }

  const isPreviouslyCompleted = target.qdsStatus === "Completed";
  if (isPreviouslyCompleted && (!correctionReason || !correctionReason.trim())) {
    return { success: false, error: "Curriculum is already finalized. Modifying finalized materials requires a documented correction reason." };
  }

  const currentMaterials = Array.isArray(target.qdsMaterials) ? target.qdsMaterials : [];
  const removedMat = currentMaterials.find(m => m.id === materialId);
  if (!removedMat) {
    return { success: false, error: "Material not found in trainee curriculum." };
  }

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const existingMaterials = Array.isArray(a.qdsMaterials) ? a.qdsMaterials : [];
    const remainingMaterials = existingMaterials.filter(m => m.id !== materialId);
    const newQdsStatus: NHOQDSStatus = remainingMaterials.length === 0 ? "Pending" : (isPreviouslyCompleted ? "In Progress" : a.qdsStatus);
    const newHandoffStatus = isPreviouslyCompleted ? "Waiting for Departments" : a.handoffStatus;

    const audit = createAuditLogEntry(
      "Carla Villanueva",
      "Quality Development Specialist",
      isPreviouslyCompleted ? "Curriculum Corrected (Material Removed)" : "Training Material Removed",
      isPreviouslyCompleted
        ? `Removed material: "${removedMat.title}" under documented correction: "${correctionReason?.trim()}". QDS readiness reset to In Progress.`
        : `Removed material: "${removedMat.title}".`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    return {
      ...a,
      qdsMaterials: remainingMaterials,
      qdsStatus: newQdsStatus,
      handoffStatus: newHandoffStatus,
      auditLogs: [audit, ...(a.auditLogs || [])]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleQDSConfirmMaterials(
  applicants: NHOApplicant[],
  applicantId: string,
  role: NHORole = "QDS",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "QDS") {
    return { success: false, error: "Unauthorized: Only Quality Development Specialist (QDS) can finalize training materials." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot finalize materials: HR has already accepted and finalized this onboarding case." };
  }
  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot finalize materials: Applicant must have completed IT provisioning with an official Kronos ID first." };
  }
  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot manage QDS materials: Applicant is in terminal status (${target.outcome}).` };
  }

  const currentMaterials = Array.isArray(target.qdsMaterials) ? target.qdsMaterials : [];
  if (currentMaterials.length === 0) {
    return { success: false, error: "Cannot finalize: Please assign at least one training curriculum item before confirming." };
  }

  // Idempotent no-op: if QDS has already confirmed, do not reset or duplicate
  if (target.qdsStatus === "Completed") {
    return { success: true, updatedApplicants: applicants };
  }

  const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const isTrainerAccepted = a.trainerStatus === "Accepted" && !!a.trainerAcceptedById && a.trainerReviewedMaterials === true;
    const isAllDeptComplete = isTrainerAccepted && a.wfmStatus === "Assigned";
    const newHandoffStatus: NHOHandoffStatus = isAllDeptComplete ? "Pending HR Acceptance" : "Waiting for Departments";
    const matsCount = Array.isArray(a.qdsMaterials) ? a.qdsMaterials.length : 0;

    const audit = createAuditLogEntry(
      "Carla Villanueva",
      "Quality Development Specialist",
      "QDS Training Materials Confirmed",
      `Finalized ${matsCount} curriculum materials for ${a.fullName}. ${isAllDeptComplete ? "All 3 post-IT departmental tasks complete. Forwarded to HR Operations." : "Awaiting completion of remaining post-IT departments."}`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    return {
      ...a,
      qdsStatus: "Completed" as const,
      qdsCompletedAt: timestamp,
      qdsCompletedBy: "Carla Villanueva (Lead QDS)",
      handoffStatus: newHandoffStatus,
      handoffSubmittedAt: isAllDeptComplete ? timestamp : a.handoffSubmittedAt,
      auditLogs: [audit, ...(a.auditLogs || [])]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleWFMConfirmSeatAssignment(
  applicants: NHOApplicant[],
  applicantId: string,
  wing: NHOProductionWing,
  seatNumber: string,
  remarks?: string,
  role: NHORole = "WFM",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[] } {
  if (role !== "WFM") {
    return { success: false, error: "Unauthorized: Only Workforce Management (WFM) can assign production workstations." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: false, error: "Cannot modify seat assignment: HR has already accepted and finalized this onboarding case." };
  }

  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot assign seat: Applicant must have completed IT provisioning with an official Kronos ID first." };
  }

  if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
    return { success: false, error: `Cannot assign seat: Applicant is in terminal status (${target.outcome}).` };
  }

  if (wing !== "Left Wing" && wing !== "Right Wing") {
    return { success: false, error: "Invalid production wing. Must be Left Wing or Right Wing." };
  }

  const cleanedSeat = (seatNumber || "").trim();
  if (!cleanedSeat) {
    return { success: false, error: "Workstation / seat number is required. Please enter a valid seat identifier." };
  }

  const duplicate = applicants.find(a =>
    a.id !== applicantId &&
    a.wfmStatus === "Assigned" &&
    a.wfmProductionWing === wing &&
    a.reportingLocation === target.reportingLocation &&
    a.wfmSeatNumber?.trim().toLowerCase() === cleanedSeat.toLowerCase()
  );

  if (duplicate) {
    return {
      success: false,
      error: `Workstation conflict: Seat "${cleanedSeat}" in ${wing} (${target.reportingLocation}) is already assigned to ${duplicate.fullName}.`
    };
  }

  const isAlreadyAssigned = target.wfmStatus === "Assigned";
  if (isAlreadyAssigned && (!remarks || !remarks.trim())) {
    return {
      success: false,
      error: "Mandatory requirement: A documented correction reason is required when modifying or reassigning an already assigned workstation."
    };
  }

  const assignedTimestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const isAllDeptComplete = a.trainerStatus === "Accepted" && a.qdsStatus === "Completed";
    const newHandoffStatus: NHOHandoffStatus = isAllDeptComplete ? "Pending HR Acceptance" : "Waiting for Departments";

    const audit = createAuditLogEntry(
      "Danilo Morales",
      "Workforce Management",
      isAlreadyAssigned ? "Workstation Reassigned / Corrected" : "Production Seat Assigned",
      isAlreadyAssigned
        ? `Workstation reassigned. Previous: ${a.wfmProductionWing || "None"} - ${a.wfmSeatNumber || "None"}. New: ${wing} - ${cleanedSeat}. Reason: "${remarks?.trim()}".`
        : `Assigned to ${wing}, Workstation ${cleanedSeat}${remarks?.trim() ? ` (Remarks: "${remarks.trim()}")` : ""}. ${isAllDeptComplete ? "All 3 post-IT departmental tasks complete. Forwarded to HR Operations." : "Awaiting completion of remaining post-IT departments."}`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    return {
      ...a,
      wfmStatus: "Assigned" as const,
      wfmProductionWing: wing,
      wfmSeatNumber: cleanedSeat,
      wfmAssignedBy: "Danilo Morales (WFM Lead)",
      wfmAssignedAt: assignedTimestamp,
      wfmRemarks: remarks?.trim() || undefined,
      handoffStatus: newHandoffStatus,
      handoffSubmittedAt: isAllDeptComplete ? assignedTimestamp : a.handoffSubmittedAt,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants };
}

export function handleHRAcceptHandoff(
  applicants: NHOApplicant[],
  applicantId: string,
  role: NHORole = "HR",
  simulatedCurrentDate: string = DEFAULT_SIMULATED_DATE
): { success: boolean; error?: string; updatedApplicants?: NHOApplicant[]; createdJourneyId?: string } {
  if (role !== "HR") {
    return { success: false, error: "Unauthorized: Only HR Operations can accept onboarding handoffs." };
  }

  const target = applicants.find(a => a.id === applicantId);
  if (!target) return { success: false, error: "Applicant not found" };

  // Idempotent: if already accepted, return success without duplicate creation
  if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
    return { success: true, updatedApplicants: applicants, createdJourneyId: target.linkedEmployeeJourneyId };
  }

  if (target.itRequestStatus !== "Completed" || !target.officialKronosId?.trim()) {
    return { success: false, error: "Cannot accept handoff: IT account provisioning must be Completed with a valid official Kronos ID before HR handoff acceptance." };
  }

  // Stable ID matching and material review required (No name-only fallback)
  if (
    target.trainerStatus !== "Accepted" ||
    !target.trainerAcceptedById ||
    target.trainerAcceptedById !== target.assignedTrainerId ||
    target.trainerReviewedMaterials !== true
  ) {
    return {
      success: false,
      error: "Cannot accept handoff: Assigned trainer must review materials and accept trainee responsibility with matching authorized trainer ID before HR handoff acceptance."
    };
  }

  const targetMaterials = Array.isArray(target.qdsMaterials) ? target.qdsMaterials : [];
  if (target.qdsStatus !== "Completed" || targetMaterials.length === 0) {
    return { success: false, error: "Cannot accept handoff: QDS training materials must be assigned and finalized before HR handoff acceptance." };
  }

  if (target.wfmStatus !== "Assigned" || !target.wfmProductionWing || !target.wfmSeatNumber?.trim()) {
    return { success: false, error: "Cannot accept handoff: WFM Production Seat Assignment must be confirmed with an assigned wing and workstation before HR handoff acceptance." };
  }

  if (target.handoffStatus !== "Pending HR Acceptance" && target.handoffStatus !== "Resubmitted") {
    return { success: false, error: `Cannot accept handoff: Current handoff status is "${target.handoffStatus}". All 3 post-IT departmental assignments (Trainer, QDS, WFM) must be completed.` };
  }

  const acceptedTimestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // 30/60/90 Employee Journey Integration Trigger:
  // Idempotently create or link 30/60/90 Employee Journey record
  let linkedJourneyId = target.linkedEmployeeJourneyId;
  try {
    let currentJourneys = INITIAL_JOURNEYS;
    const stored = typeof localStorage !== "undefined" ? (localStorage.getItem("sibs_journey_v2_journeys") || localStorage.getItem(JOURNEY_STORAGE_KEY)) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) currentJourneys = parsed;
    }
    const syncRes = pureCreateOrLinkJourney(
      currentJourneys,
      target,
      "Dulla, Ralph Vincent (HR Operations Lead)",
      simulatedCurrentDate
    );
    if (!syncRes || !syncRes.journey || !syncRes.journey.id) {
      return { success: false, error: "Failed to initialize Employee Journey: Invalid or empty journey record returned." };
    }
    linkedJourneyId = syncRes.journey.id;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("sibs_journey_v2_journeys", JSON.stringify(syncRes.updatedJourneys));
      localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(syncRes.updatedJourneys));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("journey-storage-updated"));
    }
  } catch (err: any) {
    return { success: false, error: `Failed to initialize Employee Journey: ${err?.message || "Unknown error"}` };
  }

  const updatedApplicants = applicants.map(a => {
    if (a.id !== applicantId) return a;
    const audit = createAuditLogEntry(
      "Dulla, Ralph Vincent",
      "HR Operations Lead",
      "HR Handoff Accepted",
      `HR accepted operational responsibility for employee onboarding. Transferred to 30/60/90 Employee Journey (Ref: ${linkedJourneyId || "JRN-ACTIVE"}). Assumed primary ownership of pending non-major requirements.`,
      undefined,
      undefined,
      simulatedCurrentDate
    );

    const updatedDocs = a.documents.map(d => {
      if (!d.isMajor && !d.isEssentialAgreement) {
        return {
          ...d,
          documentOwner: "HR" as const
        };
      }
      return d;
    });

    return {
      ...a,
      handoffStatus: "Accepted" as const,
      hrAcceptedAt: acceptedTimestamp,
      hrAcceptedBy: "Dulla, Ralph Vincent (HR Operations Lead)",
      outcome: "Completed Handoff" as const,
      linkedEmployeeJourneyId: linkedJourneyId || a.linkedEmployeeJourneyId,
      documents: updatedDocs,
      auditLogs: [audit, ...a.auditLogs]
    };
  });

  return { success: true, updatedApplicants, createdJourneyId: linkedJourneyId };
}

export const NHOProvider: React.FC<{ children: React.ReactNode; initialRole?: NHORole }> = ({ children, initialRole = "TA" }) => {
  const [role, setRole] = useState<NHORole>(initialRole);
  React.useEffect(() => {setRole(initialRole);},[initialRole]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>("nho-app-01");
  const [simulatedCurrentDate, setSimulatedCurrentDate] = useState<string>(() => {
    return localStorage.getItem("sibs_nho_v1_sim_date") || DEFAULT_SIMULATED_DATE;
  });

  const [applicants, setApplicants] = useState<NHOApplicant[]>(() => {
    const saved = localStorage.getItem("sibs_nho_v1_applicants");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((app: any) => ({
            ...app,
            qdsMaterials: Array.isArray(app.qdsMaterials) ? app.qdsMaterials : [],
            auditLogs: Array.isArray(app.auditLogs) ? app.auditLogs : [],
            documents: Array.isArray(app.documents) ? app.documents : []
          }));
        }
      } catch (e) {
        console.error("Failed to parse saved NHO applicants", e);
      }
    }
    return INITIAL_NHO_APPLICANTS;
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [qdsNotifications, setQdsNotifications] = useState<NHOQDSNotification[]>(() => [
    {
      id: "notif-qds-init-01",
      applicantId: "nho-app-05",
      applicantName: "Kenneth Joshua Lim",
      officialKronosId: "KRN-90845",
      account: "Information Technology",
      department: "Information Technology",
      timestamp: "2026-10-06 03:45 PM",
      isRead: false,
      message: "IT credentials completed! Candidate Kronos ID: KRN-90845. Please assign attendance schedule and training curriculum.",
      type: "credentials_ready"
    }
  ]);

  const dismissQdsNotification = (notificationId: string) => {
    setQdsNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    localStorage.setItem("sibs_nho_v1_applicants", JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem("sibs_nho_v1_sim_date", simulatedCurrentDate);
  }, [simulatedCurrentDate]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const activeApplicant = applicants.find(a => a.id === selectedApplicantId) || applicants[0];

  const resetDemoData = () => {
    localStorage.removeItem("sibs_nho_v1_applicants");
    localStorage.removeItem("sibs_nho_v1_sim_date");
    setApplicants(INITIAL_NHO_APPLICANTS);
    setSelectedApplicantId("nho-app-01");
    setSimulatedCurrentDate(DEFAULT_SIMULATED_DATE);
    setRole("TA");
    showToast("NHO Prototype state reset to all 6 initial demo scenarios.", "info");
  };

  // Dedicated walkthrough reset that prepares Juan Carlos Dela Cruz (nho-app-01)
  // in the initial scheduled state, so reviewers can follow one candidate through all 16 steps!
  const resetWalkthroughApplicant = () => {
    setApplicants(prev => prev.map(app => {
      if (app.id !== "nho-app-01") return app;
      
      const resetDocs: NHODocumentItem[] = app.documents.map(d => {
        if (d.isMajor) {
          return {
            ...d,
            status: "Not Submitted",
            deadlineStatus: "On Time",
            dueDate: "2026-10-09",
            fileName: undefined,
            fileSize: undefined,
            submittedDate: undefined,
            verifiedDate: undefined,
            verifiedBy: undefined,
            signatureDataUrl: undefined,
            correctionRemarks: undefined
          };
        }
        if (d.isEssentialAgreement) {
          return {
            ...d,
            status: "Not Submitted",
            deadlineStatus: undefined,
            dueDate: undefined,
            submittedDate: undefined,
            verifiedDate: undefined,
            verifiedBy: undefined,
            signatureDataUrl: undefined,
            correctionRemarks: undefined
          };
        }
        return {
          ...d,
          status: "Not Submitted",
          deadlineStatus: "On Time",
          dueDate: "",
          submittedDate: undefined,
          verifiedDate: undefined,
          verifiedBy: undefined,
          correctionRemarks: undefined
        };
      });

      return {
        ...app,
        scheduledNhoDate: "2026-10-09",
        invitationSentDate: "2026-10-01",
        scheduleAccepted: true,
        attendance: "Pending",
        attendanceMarkedAt: undefined,
        physicalClearance: "Pending",
        clearedDate: undefined,
        nonMajorDeadlineDate: undefined,
        tempAccessStatus: "Not Issued",
        tempPasswordGenerated: false,
        tempPasswordHash: undefined,
        passwordRetrievalToken: undefined,
        retrievalLinkExpiresAt: undefined,
        retrievalLinkUsed: false,
        retrievalLinkExpired: false,
        retrievalRecoveryCount: 0,
        hasChangedPassword: false,
        firstRegularHrisLoginAt: undefined,
        orientationStatus: "Not Started",
        orientationCurrentSlide: 1,
        orientationSlidesViewed: [],
        orientationQuizAnswers: {},
        orientationAcknowledged: false,
        orientationCompletedAt: undefined,
        orientationVersion: undefined,
        documents: resetDocs,
        itEndorsed: false,
        itEndorsedAt: undefined,
        itEndorsedBy: undefined,
        itRequestStatus: "Pending",
        proposedKronosUsername: "jdelacruz",
        kronosDisplayName: "Dela Cruz, Juan Carlos",
        assignedDepartment: "Operations - Fintech",
        itProvisioningRemarks: "Shift Group A, Fintech Customer Specialist profile",
        officialKronosId: undefined,
        itCompletedAt: undefined,
        trainerStatus: "Not Ready",
        assignedTrainerId: undefined,
        assignedTrainerName: undefined,
        trainerAssignedAt: undefined,
        trainerAcceptedAt: undefined,
        trainerAcceptedBy: undefined,
        trainerUnableReason: undefined,
        trainerRemarks: undefined,
        qdsStatus: "Not Ready",
        qdsAssignedAt: undefined,
        qdsCompletedAt: undefined,
        qdsCompletedBy: undefined,
        qdsMaterials: [],
        wfmStatus: "Not Ready",
        wfmProductionWing: undefined,
        wfmSeatNumber: undefined,
        wfmAssignedBy: undefined,
        wfmAssignedAt: undefined,
        wfmRemarks: undefined,
        handoffStatus: "Not Ready",
        handoffSubmittedAt: undefined,
        handoffReviewedAt: undefined,
        handoffReviewedBy: undefined,
        handoffCorrectionRemarks: undefined,
        hrAcceptedAt: undefined,
        hrAcceptedBy: undefined,
        outcome: "In Progress",
        withdrawalReason: undefined,
        withdrawnAt: undefined,
        auditLogs: [
          {
            id: `walkthrough-init-${Date.now()}`,
            timestamp: `${simulatedCurrentDate} 08:00 AM`,
            actor: "System Walkthrough Reset",
            role: "System",
            action: "Candidate Initialized for 16-Step Walkthrough",
            details: "Juan Carlos Dela Cruz initialized to scheduled status for end-to-end NHO V1 demonstration."
          }
        ]
      };
    }));
    setSelectedApplicantId("nho-app-01");
    setRole("TA");
    showToast("Walkthrough candidate (Juan Carlos Dela Cruz) reset to Step 1 initial scheduled state.", "info");
  };

  // 7-day rule check helper (Asia/Manila calendar date difference)
  const checkSevenDayNotice = (scheduledDateStr: string, fromDateStr = simulatedCurrentDate): boolean => {
    const days = calendarDaysBetween(fromDateStr, scheduledDateStr);
    return days >= 7;
  };

  // Helper to create audit logs with timestamp
  const createAuditLog = (
    actor: string, 
    userRole: string, 
    action: string, 
    details: string, 
    prev?: string, 
    next?: string
  ): NHOAuditLog => ({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    actor,
    role: userRole,
    action,
    details,
    previousValue: prev,
    newValue: next
  });

  // Action permission guard for applicant actions
  const canApplicantPerformActions = (app: NHOApplicant): { allowed: boolean; reason?: string } => {
    if (app.outcome === "Withdrawn" || app.outcome === "Drop-Off") {
      return { 
        allowed: false, 
        reason: `Applicant case has reached a terminal status (${app.outcome}). Portal actions are disabled.` 
      };
    }
    if (app.tempAccessStatus === "Suspended") {
      return { 
        allowed: false, 
        reason: "Temporary portal access is suspended. Please contact Talent Acquisition." 
      };
    }
    if (app.tempAccessStatus === "Deactivated") {
      return { 
        allowed: false, 
        reason: "Temporary portal access is deactivated. Please access regular HRIS portal with your corporate Kronos account." 
      };
    }
    if (app.tempAccessStatus !== "Active") {
      return { 
        allowed: false, 
        reason: "Temporary portal access has not been issued yet. Attendance must be marked Show by TA first." 
      };
    }
    // Requirement 9: Prevent applicant document actions before temporary account activation and mandatory first-login password change.
    if (!app.hasChangedPassword) {
      return {
        allowed: false,
        reason: "Mandatory security requirement: You must activate your temporary account and complete your first-login password change before accessing orientation or uploading documents."
      };
    }
    return { allowed: true };
  };

  // ==========================================
  // 1. ATTENDANCE & AUTOMATIC PORTAL ACCESS
  // ==========================================
  const markAttendance = (
    applicantId: string, 
    status: NHOAttendanceStatus, 
    correctionReason?: string,
    noShowReason?: string,
    noShowRemarks?: string
  ): { success: boolean; error?: string } => {
    // Requirement 10: Protect shared state actions by role
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can record or update NHO attendance.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      const errorMsg = `Cannot mark attendance: Applicant is in a terminal status (${target.outcome}).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!target.scheduleAccepted) {
      const errorMsg = "Cannot mark attendance: The applicant has not yet accepted the rescheduled NHO invitation.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (status === "Pending") {
      const errorMsg = "Please choose Show or No Show before saving attendance.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }
    if (status === "No Show" && (!noShowReason?.trim() || !noShowRemarks?.trim())) {
      const errorMsg = "No Show requires a selected reason and additional remarks.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 11: Prevent marking Show before the actual scheduled NHO session
    if (status === "Show" && simulatedCurrentDate < target.scheduledNhoDate) {
      const errorMsg = `Cannot mark Show: Scheduled NHO session date is ${target.scheduledNhoDate}, which is in the future relative to current date (${simulatedCurrentDate}). Attendance can only be recorded on or after the scheduled session.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 6: Enforce attendance correction reasons in shared state, not only in the modal
    if (target.attendance !== "Pending" && (!correctionReason || !correctionReason.trim())) {
      const errorMsg = "Mandatory requirement: A valid correction reason must be provided when updating an existing attendance record.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;

      const prevAttendance = app.attendance;
      const isCorrection = !!correctionReason?.trim();

      let newPhysicalClearance: NHOPhysicalClearance = app.physicalClearance;
      let newClearedDate = app.clearedDate;
      let newDeadline = app.nonMajorDeadlineDate;
      let newTempStatus = app.tempAccessStatus;
      let newRetrievalToken = app.passwordRetrievalToken;
      let newRetrievalExpires = app.retrievalLinkExpiresAt;
      let newRetrievalUsed = app.retrievalLinkUsed ?? false;
      let newRetrievalExpired = app.retrievalLinkExpired ?? false;

      if (status === "Show") {
        newPhysicalClearance = "Cleared";
        // Requirement 3: Preserve the original attended NHO date and 14-calendar-day non-major deadline.
        // Repeatedly saving Show must not restart the deadline!
        newClearedDate = app.clearedDate || simulatedCurrentDate;
        newDeadline = app.nonMajorDeadlineDate || addCalendarDays(newClearedDate, 14);

        // Issue unique temporary portal access if not already active
        if (newTempStatus === "Not Issued" || newTempStatus === "Suspended") {
          newTempStatus = "Active";
          if (!newRetrievalToken) {
            newRetrievalToken = `TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            newRetrievalExpires = `${addCalendarDays(simulatedCurrentDate, 1)} 09:00 AM`;
            newRetrievalUsed = false;
            newRetrievalExpired = false;
          }
        }
      } else if (status === "No Show") {
        newPhysicalClearance = "Not Cleared";
        newClearedDate = undefined;
        newDeadline = undefined;
        if (newTempStatus === "Active") {
          newTempStatus = "Suspended";
        }
      }

      // Requirement 4: Do not apply the 14-day deadline to the three essential agreements.
      // They remain mandatory before IT endorsement but have no fixed completion deadline.
      let updatedDocs = app.documents.map(d => {
        if (!d.isMajor && !d.isEssentialAgreement && d.status !== "Verified" && newDeadline) {
          return {
            ...d,
            dueDate: newDeadline,
            deadlineStatus: deriveDeadlineStatus(newDeadline, d.submittedDate, simulatedCurrentDate)
          };
        }
        return d;
      });

      const noShowDesc = noShowReason
        ? `Attendance Marked: No Show. Reason: "${noShowReason}". Remarks: "${noShowRemarks || "None provided"}". Temporary portal access not generated / suspended. Follow-up required.`
        : `Attendance Marked: No Show. Candidate did not attend physical NHO session. Temporary portal access not generated / suspended. Telephone follow-up required.`;

      const log = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        isCorrection ? "Attendance Correction" : `Attendance Marked: ${status}`,
        isCorrection 
          ? `Correction Reason: "${correctionReason.trim()}". Previous Attendance: ${prevAttendance}, Updated: ${status}.`
          : status === "Show"
            ? `Attendance Marked: Show. Physical NHO session completed. Temporary employee portal invitation generated and sent to ${app.email}. 14-day non-major deadline established: ${newDeadline}.`
            : noShowDesc,
        prevAttendance,
        status
      );

      const existingFollowUps = app.followUpLogs || [];
      const updatedFollowUpLogs = (status === "No Show" && noShowReason)
        ? [
            {
              id: `fl-noshow-${Date.now()}`,
              date: simulatedCurrentDate,
              attemptedBy: "Alena Batacan (TA)",
              method: "Telephone Call" as const,
              result: "No Answer" as const,
              remarks: `[Attendance Marked: No Show] Reason: ${noShowReason}. Remarks: ${noShowRemarks || "Absent from session"}`
            },
            ...existingFollowUps
          ]
        : existingFollowUps;

      return {
        ...app,
        attendance: status,
        attendanceMarkedAt: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        physicalClearance: newPhysicalClearance,
        clearedDate: newClearedDate,
        nonMajorDeadlineDate: newDeadline,
        tempAccessStatus: newTempStatus,
        tempPasswordGenerated: newTempStatus === "Active" ? true : app.tempPasswordGenerated,
        tempPasswordHash: newTempStatus === "Active" ? (app.tempPasswordHash || "[SIMULATED_HASH_2026]") : app.tempPasswordHash,
        passwordRetrievalToken: newRetrievalToken,
        retrievalLinkExpiresAt: newRetrievalExpires,
        retrievalLinkUsed: newRetrievalUsed,
        retrievalLinkExpired: newRetrievalExpired,
        documents: updatedDocs,
        followUpLogs: updatedFollowUpLogs,
        auditLogs: [log, ...app.auditLogs]
      };
    }));

    if (status === "Show") {
      showToast("Attendance marked Show! Temporary employee portal invitation dispatched to candidate's email.", "success");
    } else {
      showToast("Attendance recorded as No Show. Reason and remarks saved to follow-up history.", "info");
    }
    return { success: true };
  };

  // ==========================================
  // 2. NO SHOW, FOLLOW-UP, RESCHEDULING & DROP-OFF
  // ==========================================
  const recordFollowUp = (applicantId: string, logData: Omit<NHOFollowUpLog, "id" | "date" | "attemptedBy">) => {
    // Requirement 10: Protect shared state actions by role
    if (role !== "TA") {
      showToast("Unauthorized: Only Talent Acquisition can log follow-up calls.", "error");
      return;
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const newFollowUp: NHOFollowUpLog = {
        id: `fup-${Date.now()}`,
        date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        attemptedBy: "Alena Batacan (TA Lead)",
        ...logData
      };
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Telephone Follow-Up Attempt Logged",
        `Method: ${logData.method}, Result: ${logData.result}. Remarks: ${logData.remarks}`
      );
      return {
        ...app,
        followUpLogs: [newFollowUp, ...app.followUpLogs],
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Telephone follow-up attempt recorded in audit log.", "success");
  };

  const rescheduleNHO = (applicantId: string, newDate: string, reason: string): { success: boolean; error?: string } => {
    // Requirement 10: Protect shared state actions by role
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can reschedule NHO sessions.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 9: Block rescheduling after NHO handoff has been accepted
    if (target.handoffStatus === "Accepted") {
      const errorMsg = "Cannot reschedule NHO: Handoff has already been formally accepted by HR Operations. The NHO stage is closed.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!reason || !reason.trim()) {
      const errorMsg = "Mandatory requirement: A rescheduling reason must be provided.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!checkSevenDayNotice(newDate, simulatedCurrentDate)) {
      const errorMsg = "Cannot schedule NHO: SiBS policy requires a minimum preparation period of 7 calendar days between the invitation notice and the scheduled NHO date (Asia/Manila calendar).";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const prevDate = app.scheduledNhoDate;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "NHO Rescheduled",
        `Rescheduled from ${prevDate} to ${newDate} (7+ calendar days notice verified). Acceptance required. Reason: ${reason.trim()}. Prior attendance, temporary access, and deadlines reset.`,
        prevDate,
        newDate
      );

      // Requirement 7: When rescheduling, properly handle previous attendance, clearance dates, temporary portal access and deadlines.
      // Never leave inconsistent active access or orphaned clearance information!
      const resetDocs = app.documents.map(d => {
        if (!d.isMajor && !d.isEssentialAgreement && d.status !== "Verified") {
          return {
            ...d,
            dueDate: "",
            deadlineStatus: "On Time" as const
          };
        }
        return d;
      });

      return {
        ...app,
        scheduledNhoDate: newDate,
        invitationSentDate: simulatedCurrentDate,
        scheduleAccepted: false, // Requires acceptance of rescheduled invitation
        attendance: "Pending",
        attendanceMarkedAt: undefined,
        physicalClearance: "Pending",
        clearedDate: undefined,
        nonMajorDeadlineDate: undefined,
        tempAccessStatus: "Not Issued" as const,
        tempPasswordGenerated: false,
        tempPasswordHash: undefined,
        passwordRetrievalToken: undefined,
        retrievalLinkExpiresAt: undefined,
        retrievalLinkUsed: false,
        retrievalLinkExpired: false,
        retrievalRecoveryCount: 0,
        hasChangedPassword: false,
        rescheduledCount: app.rescheduledCount + 1,
        documents: resetDocs,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    showToast(`NHO successfully rescheduled to ${newDate}. 7-day notice validated. Pending candidate acceptance.`, "success");
    return { success: true };
  };

  const acceptRescheduledSchedule = (applicantId: string) => {
    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        "Rescheduled NHO Invitation Accepted",
        `Applicant confirmed attendance for rescheduled date: ${app.scheduledNhoDate}.`
      );
      return {
        ...app,
        scheduleAccepted: true,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Rescheduled NHO schedule accepted. Attendance can now be marked.", "success");
  };

  const markDropOff = (applicantId: string, reason: string): { success: boolean; error?: string } => {
    // Requirement 10: Protect shared state actions by role
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can mark an applicant as Drop-Off.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 5: Ensure Drop-Off requires No Show
    if (target.attendance !== "No Show") {
      const errorMsg = "Policy restriction: Drop-Off status can only be applied to applicants marked as No Show.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 5: Ensure an appropriate documented unsuccessful telephone follow-up. Successful contact must not satisfy this requirement.
    const hasRecordedUnreached = target.followUpLogs.some(
      l => l.method === "Telephone Call" && (l.result === "No Answer" || l.result === "Busy / Unreachable")
    );

    if (!hasRecordedUnreached) {
      const errorMsg = "Policy restriction: Cannot mark Drop-Off without at least one documented unsuccessful telephone follow-up attempt (No Answer or Busy / Unreachable). Successful contact does not satisfy this requirement.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!reason || !reason.trim()) {
      const errorMsg = "Mandatory requirement: A reason must be recorded when marking an applicant as Drop-Off.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Applicant Marked Drop-Off",
        `Reason: ${reason.trim()}. Case closed following documented unreached telephone follow-up history.`
      );
      return {
        ...app,
        outcome: "Drop-Off",
        tempAccessStatus: "Deactivated",
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Applicant marked as Drop-Off. Process closed.", "info");
    return { success: true };
  };


  const withdrawApplicant = (applicantId: string, reason: string): { success: boolean; error?: string } => {
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can withdraw an applicant.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 9: Block TA withdrawal after NHO handoff has been accepted
    if (target.handoffStatus === "Accepted") {
      const errorMsg = "Cannot withdraw applicant: Handoff has already been formally accepted by HR Operations.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!reason || !reason.trim()) {
      const errorMsg = "Mandatory requirement: A withdrawal reason must be recorded.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Applicant Withdrawn",
        `Reason: ${reason.trim()}. Temporary portal access deactivated. Pending IT requests flagged for review.`
      );

      // Flag outstanding IT request if endorsed
      const updatedITStatus = app.itEndorsed && app.itRequestStatus !== "Completed" 
        ? ("Needs Correction" as const) 
        : app.itRequestStatus;

      return {
        ...app,
        outcome: "Withdrawn",
        withdrawalReason: reason.trim(),
        withdrawnAt: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        tempAccessStatus: "Deactivated",
        itRequestStatus: updatedITStatus,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("NHO case closed as Withdrawn. Temporary access deactivated.", "info");
    return { success: true };
  };

  // ==========================================
  // 3. TEMPORARY ACCOUNT & AUTHENTICATION LIFECYCLE
  // ==========================================
  const simulatePasswordRetrieval = (applicantId: string): { success: boolean; password?: string; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    if (target.tempAccessStatus !== "Active") {
      const errorMsg = "Temporary access is not active. Attendance Show is required to issue temporary portal access.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 6: Enforce exact 24-hour expiration by comparing retrievalLinkExpiresAt timestamp with current date and time
    const parseExpirationTimestamp = (str?: string): number | null => {
      if (!str) return null;
      const parsed = Date.parse(str);
      if (!isNaN(parsed)) return parsed;
      const parts = str.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i);
      if (parts) {
        const datePart = parts[1];
        let hours = parts[2] ? parseInt(parts[2], 10) : 0;
        const mins = parts[3] ? parseInt(parts[3], 10) : 0;
        const meridiem = parts[4]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        const d = new Date(datePart);
        d.setHours(hours, mins, 0, 0);
        return d.getTime();
      }
      return null;
    };

    const expMs = parseExpirationTimestamp(target.retrievalLinkExpiresAt);
    const now = new Date();
    const currSimDate = new Date(simulatedCurrentDate);
    currSimDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    const currMs = currSimDate.getTime();

    const isExpiredByTime = expMs !== null
      ? currMs > expMs
      : (target.retrievalLinkExpiresAt ? target.retrievalLinkExpiresAt.split(" ")[0] < simulatedCurrentDate : false);

    if (target.retrievalLinkExpired || isExpiredByTime) {
      const errorMsg = "Cannot retrieve password: The one-time retrieval link has expired (24-hour limit elapsed). Please request a replacement link via Recovery.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 6: Proper one-time token consumption - link cannot be reused
    if (target.retrievalLinkUsed) {
      const errorMsg = "Cannot retrieve password: This one-time link has already been used and cannot be reused.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        "One-Time Temporary Password Retrieved",
        `Accessed one-time retrieval link (${app.passwordRetrievalToken}). Link is now consumed and marked as used.`
      );
      return {
        ...app,
        retrievalLinkUsed: true,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    const simulatedTempPassword = "SiBS$Demo#Temp2026!";
    showToast("One-time temporary password retrieved! Please change your password upon initial login.", "success");
    return { success: true, password: simulatedTempPassword };
  };

  const simulateLinkExpiration = (applicantId: string) => {
    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        "System Simulation",
        "System",
        "Retrieval Link Expired",
        "24-hour expiration threshold reached. Retrieval link marked expired for testing."
      );
      return {
        ...app,
        retrievalLinkExpired: true,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Retrieval link expired (simulated for QA test #5).", "info");
  };

  const recoverRetrievalLink = (applicantId: string) => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return;

    if (target.tempAccessStatus !== "Active") {
      showToast("Cannot recover retrieval link: Temporary access is not active.", "error");
      return;
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const newToken = `TOKEN-RECOVER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const newExpires = `${addCalendarDays(simulatedCurrentDate, 1)} 09:00 AM`;
      const prevToken = app.passwordRetrievalToken || "old-token";
      
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Retrieval Link Replaced via Recovery",
        `Old link (${prevToken}) invalidated. Replacement link (${newToken}) generated with 24-hour expiration.`
      );

      return {
        ...app,
        passwordRetrievalToken: newToken,
        retrievalLinkExpiresAt: newExpires,
        retrievalLinkUsed: false,
        retrievalLinkExpired: false,
        retrievalRecoveryCount: (app.retrievalRecoveryCount || 0) + 1,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Recovery successful: Old link invalidated and replacement 24-hr retrieval link issued.", "success");
  };

  const sendTempAccessCredentialsLink = (
    applicantId: string,
    channel: "Email" | "SMS" | "Both" = "Both"
  ): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    if (target.attendance !== "Show") {
      const msg = "Temporary NHO access can only be sent after TA marks the candidate as Show.";
      showToast(msg, "error");
      return { success: false, error: msg };
    }

    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      const msg = `Cannot send credentials link: Candidate is in terminal status (${target.outcome}).`;
      showToast(msg, "error");
      return { success: false, error: msg };
    }

    let token = target.passwordRetrievalToken;
    let expires = target.retrievalLinkExpiresAt;

    if (!token || target.tempAccessStatus === "Not Issued" || target.tempAccessStatus === "Suspended") {
      token = `TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      expires = `${addCalendarDays(simulatedCurrentDate, 1)} 09:00 AM`;
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        `Temporary Access & Portal Credentials Dispatched (${channel})`,
        `Direct Portal Access Link & One-Time Password Token (${token}) dispatched to ${app.email} / ${app.phone} via ${channel}. Valid through ${expires}.`
      );

      return {
        ...app,
        tempAccessStatus: "Active",
        tempPasswordGenerated: true,
        tempPasswordHash: app.tempPasswordHash || "[SIMULATED_HASH_2026]",
        passwordRetrievalToken: token,
        retrievalLinkExpiresAt: expires,
        retrievalLinkUsed: false,
        retrievalLinkExpired: false,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    showToast(`Temporary portal link and credentials successfully sent to ${target.fullName} (${target.email})!`, "success");
    return { success: true };
  };

  const applicantChangePassword = (applicantId: string, newPass: string): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 7: Prevent password changes unless a valid temporary account has been issued
    if (target.tempAccessStatus !== "Active") {
      const errorMsg = "Cannot change password: Valid temporary account has not been issued.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 7: First-login flow must be authenticated via temporary password retrieval
    if (!target.retrievalLinkUsed) {
      const errorMsg = "Cannot change password: First-login flow must be authenticated via temporary password retrieval before changing password.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      const errorMsg = `Cannot change password: Applicant is in terminal status (${target.outcome}).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (newPass.length < 8) {
      const errorMsg = "Password must be at least 8 characters long.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        "Initial Temporary Password Changed",
        "Applicant established a secure personal password upon first login. Full portal access enabled."
      );
      return {
        ...app,
        hasChangedPassword: true,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Password updated! Welcome to the SiBS NHO Portal.", "success");
    return { success: true };
  };

  // ==========================================
  // 4. ORIENTATION MODULE
  // ==========================================
  const updateOrientationSlide = (applicantId: string, slideNumber: number) => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return;

    const perm = canApplicantPerformActions(target);
    if (!perm.allowed) {
      showToast(perm.reason!, "error");
      return;
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const viewed = Array.from(new Set([...app.orientationSlidesViewed, slideNumber]));
      return {
        ...app,
        orientationCurrentSlide: slideNumber,
        orientationSlidesViewed: viewed,
        orientationStatus: app.orientationStatus === "Completed" ? "Completed" : "In Progress"
      };
    }));
  };

  const submitQuizAnswer = (applicantId: string, questionIndex: number, optionIndex: number): { success: boolean; error?: string } => {
    // Requirement 10: Restrict orientation knowledge-check answers to the five valid questions (0-4)
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex > 4) {
      const errorMsg = `Invalid knowledge check question index: ${questionIndex}. Must be one of the five valid questions (0-4).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    const perm = canApplicantPerformActions(target);
    if (!perm.allowed) {
      showToast(perm.reason!, "error");
      return { success: false, error: perm.reason };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      return {
        ...app,
        orientationQuizAnswers: {
          ...app.orientationQuizAnswers,
          [questionIndex]: optionIndex
        }
      };
    }));
    return { success: true };
  };

  const completeOrientation = (applicantId: string, acknowledged: boolean = false): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    const perm = canApplicantPerformActions(target);
    if (!perm.allowed) {
      showToast(perm.reason!, "error");
      return { success: false, error: perm.reason };
    }

    // 1. All 7 required slides viewed
    const requiredSlides = [1, 2, 3, 4, 5, 6, 7];
    const hasViewedAllSlides = requiredSlides.every(s => target.orientationSlidesViewed.includes(s));
    if (!hasViewedAllSlides) {
      const errorMsg = "Cannot complete orientation: You must view all seven (7) presentation slides first.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // 2. All 5 knowledge-check questions answered
    const quizAnswerCount = Object.keys(target.orientationQuizAnswers || {}).length;
    if (quizAnswerCount < 5) {
      const errorMsg = "Cannot complete orientation: You must answer all five (5) knowledge check questions first.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 11: Require explicit acknowledgment when completing orientation, even when the shared action is invoked directly
    if (!acknowledged && !target.orientationAcknowledged) {
      const errorMsg = "Cannot complete orientation: Explicit orientation policy acknowledgment is strictly required.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        "Orientation Completed & Acknowledged",
        "All 7 presentation slides reviewed, 5 interactive knowledge check questions answered, and final policy acknowledgment signed (Orientation Version: v1.0-sample)."
      );
      return {
        ...app,
        orientationStatus: "Completed",
        orientationVersion: "v1.0-sample",
        orientationAcknowledged: true,
        orientationCompletedAt: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    showToast("Orientation successfully completed and acknowledged!", "success");
    return { success: true };
  };

  // ==========================================
  // 5. APPLICANT AGREEMENTS & DOCUMENT SUBMISSION
  // ==========================================
  const submitAgreement = (
    applicantId: string, 
    documentId: string, 
    method: "Electronic Signature" | "Manual Upload",
    signatureDataUrl?: string,
    fileName?: string
  ): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    const perm = canApplicantPerformActions(target);
    if (!perm.allowed) {
      showToast(perm.reason!, "error");
      return { success: false, error: perm.reason };
    }

    const doc = target.documents.find(d => d.id === documentId || d.templateCode === documentId);
    if (!doc) {
      showToast("Agreement document not found.", "error");
      return { success: false, error: "Document not found" };
    }

    // Requirement 5: Prevent agreement actions on non-agreement documents
    if (!doc.isEssentialAgreement) {
      const errorMsg = `Cannot execute agreement submission: "${doc.name}" is not an essential agreement document.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 5: Require actual drawn-signature evidence for electronic agreement or valid uploaded signed file for manual
    if (method === "Electronic Signature") {
      if (!signatureDataUrl || !signatureDataUrl.trim()) {
        const errorMsg = "Cannot submit electronic agreement: Drawn signature evidence is required.";
        showToast(errorMsg, "error");
        return { success: false, error: errorMsg };
      }
    } else if (method === "Manual Upload") {
      if (!fileName || !fileName.trim()) {
        const errorMsg = "Cannot submit manual agreement: A valid uploaded signed file is required.";
        showToast(errorMsg, "error");
        return { success: false, error: errorMsg };
      }
    }

    // Requirement 2: Never allow applicant uploads to overwrite Verified documents without an authorized correction
    if (doc.status === "Verified") {
      const errorMsg = `Cannot overwrite verified agreement: "${doc.name}" is already Verified. An authorized TA correction is required to reopen this document for re-signing.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const updatedDocs = app.documents.map(d => {
        if (d.id === documentId || d.templateCode === documentId) {
          const priorHistory = (d.fileName || d.signatureDataUrl) ? [
            ...(d.previousSubmissions || []),
            {
              fileName: d.fileName,
              signatureDataUrl: d.signatureDataUrl,
              submittedDate: d.submittedDate,
              submissionMethod: d.submissionMethod,
              correctionRemarks: d.correctionRemarks,
              verifiedDate: d.verifiedDate,
              verifiedBy: d.verifiedBy
            }
          ] : d.previousSubmissions;

          return {
            ...d,
            status: "For Verification" as const,
            submittedDate: simulatedCurrentDate,
            deadlineStatus: "On Time" as const,
            submissionMethod: method,
            signatureDataUrl,
            fileName: fileName || (method === "Electronic Signature" ? `${d.name}_ElectronicSigned.pdf` : "Scanned_Agreement.pdf"),
            correctionRemarks: undefined,
            previousSubmissions: priorHistory
          };
        }
        return d;
      });

      const docName = doc.name;
      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        `Submitted ${docName}`,
        `Submitted via ${method}. Status set to For Verification.`
      );

      return {
        ...app,
        documents: updatedDocs,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    showToast("Agreement submitted for TA verification.", "success");
    return { success: true };
  };

  const submitOtherDocument = (
    applicantId: string, 
    documentId: string, 
    fileName: string, 
    fileSize: string
  ): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    const perm = canApplicantPerformActions(target);
    if (!perm.allowed) {
      showToast(perm.reason!, "error");
      return { success: false, error: perm.reason };
    }

    const doc = target.documents.find(d => d.id === documentId || d.templateCode === documentId);
    if (!doc) {
      showToast("Document not found.", "error");
      return { success: false, error: "Document not found" };
    }

    // Requirement 4: Reject uploads with missing or invalid file evidence
    if (!fileName || !fileName.trim()) {
      const errorMsg = "Cannot upload document: Missing or invalid file evidence.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 2: Never allow applicant uploads to overwrite Verified documents without an authorized correction
    if (doc.status === "Verified") {
      const errorMsg = `Cannot overwrite verified document: "${doc.name}" is already Verified. An authorized TA correction is required to reopen this document.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      const updatedDocs = app.documents.map(d => {
        if (d.id === documentId || d.templateCode === documentId) {
          const isLate = d.dueDate ? simulatedCurrentDate > d.dueDate : false;
          const priorHistory = (d.fileName || d.submittedDate) ? [
            ...(d.previousSubmissions || []),
            {
              fileName: d.fileName,
              fileSize: d.fileSize,
              submittedDate: d.submittedDate,
              submissionMethod: d.submissionMethod,
              correctionRemarks: d.correctionRemarks,
              verifiedDate: d.verifiedDate,
              verifiedBy: d.verifiedBy
            }
          ] : d.previousSubmissions;

          return {
            ...d,
            status: "For Verification" as const,
            submittedDate: simulatedCurrentDate,
            submissionMethod: "Direct Upload" as const,
            deadlineStatus: isLate ? ("Submitted Late" as const) : ("On Time" as const),
            fileName,
            fileSize,
            correctionRemarks: undefined,
            previousSubmissions: priorHistory
          };
        }
        return d;
      });

      const audit = createAuditLog(
        app.fullName,
        "Applicant",
        "Document Uploaded",
        `Uploaded file: ${fileName} (${fileSize}) for "${doc.name}". Status set to For Verification.`
      );

      return {
        ...app,
        documents: updatedDocs,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));

    showToast(`Document "${fileName}" uploaded successfully.`, "success");
    return { success: true };
  };

  // ==========================================
  // 6. TA DOCUMENT VERIFICATION
  // ==========================================
  const verifyDocument = (applicantId: string, documentId: string): { success: boolean; error?: string } => {
    // Requirement 10: Protect shared state actions by role. An Applicant role must never be able to invoke TA document verification.
    if (role !== "TA" && role !== "HR") {
      const errorMsg = "Unauthorized: Only Talent Acquisition or HR Operations can verify documents.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) {
      showToast("Applicant not found", "error");
      return { success: false, error: "Applicant not found" };
    }

    const doc = target.documents.find(d => d.id === documentId || d.templateCode === documentId);
    if (!doc) {
      showToast("Document not found", "error");
      return { success: false, error: "Document not found" };
    }

    // Requirement 1: In NHOContext.tsx, prevent TA verification of documents that have not actually been submitted. Only allow eligible items in For Verification status.
    if (doc.status !== "For Verification") {
      const errorMsg = `Cannot verify document: "${doc.name}" is currently in "${doc.status}" status. Only items in "For Verification" status can be verified.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 4: Reject verification with missing or invalid file/signature evidence. Never allow TA verification based solely on a submission date.
    const hasFile = !!doc.fileName?.trim();
    const hasSignature = !!doc.signatureDataUrl?.trim();
    if (!hasFile && !hasSignature) {
      const errorMsg = `Cannot verify document: Missing file or signature evidence for "${doc.name}". Verification cannot be based solely on a submission date.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 8: Keep major-document verification assigned to TA. HR manages pending non-major requirements after accepting the handoff.
    if (doc.isMajor && role !== "TA") {
      const errorMsg = "Unauthorized: Verification of the four major pre-employment requirements is strictly assigned to Talent Acquisition.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!doc.isMajor && role === "HR" && target.handoffStatus !== "Accepted") {
      const errorMsg = "Unauthorized: HR Operations can only manage and verify pending non-major requirements after formal acceptance of the NHO handoff.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const verifier = role === "HR" ? "Dulla, Ralph Vincent (HR)" : "Alena Batacan (TA Lead)";
    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      let verifiedName = "";
      const updatedDocs = app.documents.map(d => {
        if (d.id === documentId || d.templateCode === documentId) {
          verifiedName = d.name;
          return {
            ...d,
            status: "Verified" as const,
            verifiedDate: simulatedCurrentDate,
            verifiedBy: verifier,
            correctionRemarks: undefined
          };
        }
        return d;
      });

      const audit = createAuditLog(
        verifier,
        role === "HR" ? "HR" : "Talent Acquisition",
        `Document Verified: ${verifiedName}`,
        `Document marked as Verified by ${verifier}.`
      );

      return {
        ...app,
        documents: updatedDocs,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Document verified successfully.", "success");
    return { success: true };
  };

  const returnDocumentForCorrection = (applicantId: string, documentId: string, remarks: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "TA" && role !== "HR") {
      const errorMsg = "Unauthorized: Only Talent Acquisition or HR Operations can return documents for correction.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!remarks || !remarks.trim()) {
      showToast("Mandatory requirement: Please provide correction remarks explaining why this document is returned.", "error");
      return { success: false, error: "Missing remarks" };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    const doc = target.documents.find(d => d.id === documentId || d.templateCode === documentId);
    if (!doc) return { success: false, error: "Document not found" };

    // Requirement 8: Keep major-document verification assigned to TA. HR manages pending non-major requirements after accepting the handoff.
    if (doc.isMajor && role !== "TA") {
      const errorMsg = "Unauthorized: Returning the four major pre-employment requirements for correction is strictly assigned to Talent Acquisition.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!doc.isMajor && role === "HR" && target.handoffStatus !== "Accepted") {
      const errorMsg = "Unauthorized: HR Operations can only manage non-major requirements after formal acceptance of the NHO handoff.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const actor = role === "HR" ? "Dulla, Ralph Vincent (HR)" : "Alena Batacan (TA Lead)";
    setApplicants(prev => prev.map(app => {
      if (app.id !== applicantId) return app;
      let docName = "";
      const updatedDocs = app.documents.map(d => {
        if (d.id === documentId || d.templateCode === documentId) {
          docName = d.name;
          return {
            ...d,
            status: "Needs Correction" as const,
            correctionRemarks: remarks.trim()
          };
        }
        return d;
      });

      const audit = createAuditLog(
        actor,
        role === "HR" ? "HR" : "Talent Acquisition",
        `Document Returned: ${docName}`,
        `Correction Remarks: ${remarks.trim()}. Returned specifically to candidate for revision.`
      );

      return {
        ...app,
        documents: updatedDocs,
        auditLogs: [audit, ...app.auditLogs]
      };
    }));
    showToast("Document marked as Needs Correction.", "info");
    return { success: true };
  };

  // ==========================================
  // 7. IT ENDORSEMENT VALIDATION & DISPATCH
  // ==========================================
  const checkITEndorsementEligibility = (app: NHOApplicant) => {
    const docs = app.documents || [];
    const getDocStatus = (code: string) => docs.find(d => d.templateCode === code || d.id === code)?.status === "Verified";

    const checks = [
      { label: "1. Attendance Marked 'Show'", passed: app.attendance === "Show" },
      { label: "2. Medical Records Verified", passed: getDocStatus("MAJOR-MED-01") },
      { label: "3. NBI Clearance Verified", passed: getDocStatus("MAJOR-NBI-02") },
      { label: "4. PSA Birth Certificate Verified", passed: getDocStatus("MAJOR-PSA-03") },
      { label: "5. Valid Government ID Verified", passed: getDocStatus("MAJOR-ID-04") },
      { label: "6. Orientation Completed & Acknowledged", passed: app.orientationStatus === "Completed" && app.orientationAcknowledged },
      { label: "7. Company Policy Acceptance Verified", passed: getDocStatus("AGR-POL-01") },
      { label: "8. Training Bond Verified", passed: getDocStatus("AGR-BOND-02") },
      { label: "9. NDA (Non-Disclosure Agreement) Verified", passed: getDocStatus("AGR-NDA-03") },
    ];

    const hasTerminalStatus = app.outcome === "Withdrawn" || app.outcome === "Drop-Off";
    const hasInvalidClearance = app.physicalClearance !== "Cleared" || app.tempAccessStatus === "Suspended";
    const isAlreadyProcessed = app.itEndorsed && (app.itRequestStatus === "In Progress" || app.itRequestStatus === "Completed");

    const isEligible = checks.every(c => c.passed) && !hasTerminalStatus && !hasInvalidClearance && !isAlreadyProcessed;
    return { isEligible, checks, hasTerminalStatus, hasInvalidClearance, isAlreadyProcessed };
  };

  const endorseToIT = (applicantId: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can endorse applicants to IT.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const app = applicants.find(a => a.id === applicantId);
    if (!app) return { success: false, error: "Applicant not found" };

    if (app.outcome === "Withdrawn" || app.outcome === "Drop-Off") {
      const errorMsg = `Cannot endorse to IT: Candidate is in terminal status (${app.outcome}).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (app.physicalClearance !== "Cleared" || app.tempAccessStatus === "Suspended") {
      const errorMsg = "Cannot endorse to IT: Physical clearance is invalid or suspended.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (app.itEndorsed && (app.itRequestStatus === "In Progress" || app.itRequestStatus === "Completed")) {
      const errorMsg = "Cannot re-endorse: ID Creation Request is already In Progress or Completed by IT.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const { isEligible, checks } = checkITEndorsementEligibility(app);
    if (!isEligible) {
      const failing = checks.filter(c => !c.passed).map(c => c.label).join(", ");
      const errorMsg = `Cannot endorse to IT. Unmet mandatory conditions: ${failing}`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Endorsed to IT for ID Creation",
        "All 9 mandatory criteria verified. Dispatched one active ID Creation Request to IT Queue."
      );
      return {
        ...a,
        itEndorsed: true,
        itEndorsedAt: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        itEndorsedBy: "Alena Batacan (TA Lead)",
        itRequestStatus: "Pending",
        auditLogs: [audit, ...a.auditLogs]
      };
    }));

    showToast("Applicant successfully endorsed to IT! ID Creation Request submitted.", "success");
    return { success: true };
  };

  // ==========================================
  // 8. IT QUEUE PROCESSING & PROVISIONING
  // ==========================================
  const itStartProcessing = (applicantId: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "IT") {
      const errorMsg = "Unauthorized: Only IT can begin processing ID requests.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 2: Allow IT processing only for valid, endorsed, non-terminal applicants in the correct request state
    if (!target.itEndorsed) {
      const errorMsg = "Cannot begin processing: Applicant has not been endorsed to IT by TA.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      const errorMsg = `Cannot process request: Applicant is in terminal status (${target.outcome}).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (target.physicalClearance !== "Cleared" || target.tempAccessStatus === "Suspended") {
      const errorMsg = "Cannot process request: Clearance is invalid or temporary access is suspended.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 1: Prevent completed IT requests from returning to In Progress
    if (target.itRequestStatus === "Completed" || target.officialKronosId) {
      const errorMsg = "Cannot return completed IT request to In Progress. Completed provisioning records cannot be modified.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 2: Correct request state (must be Pending)
    if (target.itRequestStatus !== "Pending") {
      const errorMsg = `Cannot start processing: IT request status is already "${target.itRequestStatus}". Only "Pending" requests can transition to In Progress.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const audit = createAuditLog(
        "Rodrigo Morales",
        "IT Manager",
        "Started Processing ID Request",
        "Reviewing account provisioning parameters and preparing manual Kronos assignment."
      );
      return {
        ...a,
        itRequestStatus: "In Progress",
        auditLogs: [audit, ...a.auditLogs]
      };
    }));
    showToast("IT request set to In Progress.", "info");
    return { success: true };
  };

  const itUpdatePermittedFields = (
    applicantId: string, 
    updates: { proposedUsername?: string; displayName?: string; dept?: string; remarks?: string }, 
    reason: string
  ): { success: boolean; error?: string } => {
    if (role !== "IT") {
      const errorMsg = "Unauthorized: Only IT can update provisioning fields.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Protect Completed Handoffs: HR accepted handoffs cannot be modified
    if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
      const errorMsg = "Cannot edit provisioning fields: HR has already accepted and finalized this onboarding case.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 1: Block edits to completed provisioning records and existing Kronos IDs
    if (target.itRequestStatus === "Completed" || target.officialKronosId) {
      const errorMsg = "Cannot edit provisioning fields: IT account provisioning is already completed and official Kronos ID is assigned.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 2: Non-terminal applicants
    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      const errorMsg = `Cannot edit provisioning fields: Applicant is in terminal status (${target.outcome}).`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!reason.trim()) {
      showToast("Audit requirement: A reason is required when modifying provisioning fields.", "error");
      return { success: false, error: "Missing reason" };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const beforeVals = {
        proposedUsername: a.proposedKronosUsername,
        displayName: a.kronosDisplayName,
        dept: a.assignedDepartment,
        remarks: a.itProvisioningRemarks
      };

      const audit = createAuditLog(
        "Rodrigo Morales",
        "IT Manager",
        "Updated Permitted Provisioning Fields",
        `Reason: "${reason}". Before: ${JSON.stringify(beforeVals)}, After: ${JSON.stringify(updates)}`
      );

      return {
        ...a,
        proposedKronosUsername: updates.proposedUsername || a.proposedKronosUsername,
        kronosDisplayName: updates.displayName || a.kronosDisplayName,
        assignedDepartment: updates.dept || a.assignedDepartment,
        itProvisioningRemarks: updates.remarks || a.itProvisioningRemarks,
        auditLogs: [audit, ...a.auditLogs]
      };
    }));
    showToast("Provisioning details updated with audit trail.", "success");
    return { success: true };
  };

  const itCompleteProvisioning = (applicantId: string, kronosId: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "IT") {
      const errorMsg = "Unauthorized: Only IT can provision Kronos accounts.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Protect Completed Handoffs: HR accepted handoffs cannot be modified
    if (target.handoffStatus === "Accepted" || target.outcome === "Completed Handoff") {
      const errorMsg = "Cannot complete provisioning: HR has already accepted and finalized this onboarding case.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 12: IT must not begin processing without a valid TA endorsement.
    if (!target.itEndorsed) {
      showToast("Validation failed: No existing TA endorsement found for this applicant.", "error");
      return { success: false, error: "No TA endorsement" };
    }

    // Requirement 12: prevent overwriting completed Kronos IDs
    if (target.officialKronosId || target.itRequestStatus === "Completed") {
      const errorMsg = `Cannot overwrite completed Kronos account: ID "${target.officialKronosId || "Existing"}" has already been provisioned.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Requirement 12: Require In Progress before provisioning completion
    if (target.itRequestStatus !== "In Progress") {
      const errorMsg = "Cannot complete provisioning: IT request must be marked 'In Progress' before completing account provisioning.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (target.outcome === "Withdrawn" || target.outcome === "Drop-Off") {
      showToast(`Cannot complete provisioning: Applicant is in terminal status (${target.outcome}).`, "error");
      return { success: false, error: "Terminal status" };
    }

    if (target.physicalClearance !== "Cleared") {
      showToast("Cannot complete provisioning: Unresolved physical clearance issue.", "error");
      return { success: false, error: "Invalid physical clearance" };
    }

    const cleaned = kronosId.trim();
    if (!cleaned) {
      showToast("Please enter an official Kronos ID.", "error");
      return { success: false, error: "Empty Kronos ID" };
    }

    // Check duplicate Kronos ID across all applicants
    const isDuplicate = applicants.some(a => a.id !== applicantId && a.officialKronosId?.toLowerCase() === cleaned.toLowerCase());
    if (isDuplicate) {
      const errorMsg = `Duplicate Kronos ID: "${cleaned}" is already assigned to another employee.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const timestamp = `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const audit = createAuditLog(
        "Rodrigo Morales",
        "IT Manager",
        "Kronos Account Provisioned",
        `Official Kronos ID assigned: ${cleaned}. Dispatched in parallel to Trainer, QDS (Quality Development), and WFM (Workforce Management).`
      );

      const defaultTrainerName = a.assignedTrainerName || "Maria Elena Garcia (Senior Trainer)";
      const defaultTrainerId = a.assignedTrainerId || "TRN-001";

      return {
        ...a,
        officialKronosId: cleaned,
        itRequestStatus: "Completed",
        itCompletedAt: timestamp,
        itCredentialsNotifiedToQds: true,
        itCredentialsNotifiedAt: timestamp,
        // Post-IT Parallel Department Activation
        trainerStatus: a.trainerStatus === "Accepted" ? "Accepted" : "Pending Acceptance",
        assignedTrainerId: defaultTrainerId,
        assignedTrainerName: defaultTrainerName,
        trainerAssignedAt: a.trainerAssignedAt || timestamp,
        qdsStatus: a.qdsStatus === "Completed" ? "Completed" : "Pending",
        qdsAssignedAt: a.qdsAssignedAt || timestamp,
        wfmStatus: a.wfmStatus === "Assigned" ? "Assigned" : "Pending WFM Assignment",
        handoffStatus: "Waiting for Departments",
        auditLogs: [audit, ...a.auditLogs]
      };
    }));

    // Requirement 3: Automatically send notification to separate QDS application
    const qdsNotif: NHOQDSNotification = {
      id: `notif-qds-${Date.now()}`,
      applicantId: target.id,
      applicantName: target.fullName,
      officialKronosId: cleaned,
      account: target.account || target.assignedDepartment,
      department: target.assignedDepartment,
      timestamp: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
      message: `IT credentials completed for ${target.fullName} (Kronos ID: ${cleaned}). Attendance schedule assignment ready.`,
      type: "credentials_ready"
    };
    setQdsNotifications(prev => [qdsNotif, ...prev]);

    showToast(`Kronos ID ${cleaned} recorded! Notification dispatched to QDS application & parallel departments.`, "success");
    return { success: true };
  };

  // ==========================================
  // 9. PARALLEL DEPARTMENT 1: TRAINER ASSIGNMENT
  // ==========================================
  const trainerAcceptTrainee = (
    applicantId: string,
    trainerIdOrName?: string,
    reviewedMaterials: boolean = false,
    remarks?: string
  ): { success: boolean; error?: string } => {
    const res = handleTrainerAcceptTrainee(
      applicants,
      applicantId,
      trainerIdOrName,
      reviewedMaterials,
      remarks,
      role,
      simulatedCurrentDate
    );
    if (!res.success) {
      showToast(res.error || "Failed to accept trainee.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("Trainee responsibility accepted successfully!", "success");
    return { success: true };
  };

  const trainerDeclineTrainee = (
    applicantId: string,
    reason: string,
    trainerIdOrName?: string
  ): { success: boolean; error?: string } => {
    const res = handleTrainerDeclineTrainee(applicants, applicantId, reason, trainerIdOrName, role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to decline trainee.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("Recorded unable to accept. Trainee is pending reassignment.", "info");
    return { success: true };
  };

  const trainerReassign = (
    applicantId: string,
    newTrainerId: string,
    newTrainerName?: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    // Only QDS can reassign. Callers cannot override their actual active role
    const effectiveRole: NHORole = role;
    const res = handleTrainerReassign(applicants, applicantId, newTrainerId, newTrainerName, effectiveRole, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to reassign trainer.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("Trainee reassigned successfully.", "success");
    return { success: true };
  };

  const trainerRequestMaterial = (
    applicantId: string,
    request: {
      materialTitle: string;
      category?: string;
      reason: string;
      priority?: "Standard" | "Urgent";
    },
    actingTrainerIdOrName?: string
  ): { success: boolean; error?: string } => {
    const res = handleTrainerRequestMaterial(applicants, applicantId, request, actingTrainerIdOrName, role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to request material.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast(`Material request for "${request.materialTitle}" sent to QDS Lead!`, "success");
    return { success: true };
  };

  // ==========================================
  // 10. PARALLEL DEPARTMENT 2: QDS TRAINING MATERIALS
  // ==========================================
  const qdsAddMaterial = (
    applicantId: string,
    material: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">,
    correctionReason?: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const res = handleQDSAddMaterial(applicants, applicantId, material, correctionReason, actingRole || role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to add material.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast(`Material "${material.title}" assigned successfully!`, "success");
    return { success: true };
  };

  const qdsRemoveMaterial = (
    applicantId: string,
    materialId: string,
    correctionReason?: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const res = handleQDSRemoveMaterial(applicants, applicantId, materialId, correctionReason, actingRole || role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to remove material.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("Material removed from trainee curriculum.", "info");
    return { success: true };
  };

  const qdsConfirmMaterials = (
    applicantId: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const res = handleQDSConfirmMaterials(applicants, applicantId, actingRole || role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to finalize materials.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("QDS training materials confirmed and finalized!", "success");
    return { success: true };
  };

  const qdsAssignAndSendToTrainer = (
    applicantId: string,
    trainerId: string,
    trainerName?: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const effectiveRole: NHORole = role;
    const res = handleQDSAssignAndSendToTrainer(applicants, applicantId, trainerId, trainerName, effectiveRole, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to dispatch to trainer.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    const assignedName = res.updatedApplicants?.find(a => a.id === applicantId)?.assignedTrainerName;
    showToast(`Assigned ${assignedName} and dispatched training package to Trainer!`, "success");
    return { success: true };
  };

  const qdsFulfillMaterialRequest = (
    applicantId: string,
    requestId: string,
    fulfilledMaterial: Omit<NHOQDSMaterial, "id" | "assignedAt" | "assignedBy">
  ): { success: boolean; error?: string } => {
    const res = handleQDSFulfillMaterialRequest(applicants, applicantId, requestId, fulfilledMaterial, role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to fulfill material request.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast(`Material "${fulfilledMaterial.title}" attached and request fulfilled!`, "success");
    return { success: true };
  };

  const qdsAssignAttendanceSchedule = (
    applicantId: string,
    schedule: {
      scheduledDate: string;
      shiftHours: string;
      trainingLocation: string;
      assignedBy?: string;
    }
  ): { success: boolean; error?: string } => {
    const res = handleQDSAssignAttendanceSchedule(applicants, applicantId, schedule, role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to assign attendance schedule.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    const target = applicants.find(a => a.id === applicantId);
    showToast(`Attendance schedule assigned for ${target?.fullName || "trainee"}! Synchronized with HR Operations.`, "success");
    return { success: true };
  };

  // ==========================================
  // 11. PARALLEL DEPARTMENT 3: WFM PRODUCTION SEAT ASSIGNMENT
  // ==========================================
  const wfmConfirmSeatAssignment = (
    applicantId: string,
    wing: NHOProductionWing,
    seatNumber: string,
    remarks?: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const res = handleWFMConfirmSeatAssignment(applicants, applicantId, wing, seatNumber, remarks, actingRole || role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to confirm seat assignment.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast(`Production seat ${seatNumber.trim()} (${wing}) confirmed!`, "success");
    return { success: true };
  };

  // ==========================================
  // 12. HR HANDOFF & DOCUMENT OWNERSHIP TRANSFER
  // ==========================================
  const hrAcceptHandoff = (
    applicantId: string,
    actingRole?: NHORole
  ): { success: boolean; error?: string } => {
    const res = handleHRAcceptHandoff(applicants, applicantId, actingRole || role, simulatedCurrentDate);
    if (!res.success) {
      showToast(res.error || "Failed to accept handoff.", "error");
      return res;
    }
    if (res.updatedApplicants) setApplicants(res.updatedApplicants);
    showToast("NHO Handoff successfully accepted by HR! Ownership of pending non-majors transferred.", "success");
    return { success: true };
  };

  const hrReturnHandoff = (applicantId: string, remarks: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "HR") {
      const errorMsg = "Unauthorized: Only HR Operations can return handoffs for correction.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 3: Permit HR to return handoffs only while Pending HR Acceptance or Resubmitted. Accepted handoffs must remain closed.
    if (target.handoffStatus !== "Pending HR Acceptance" && target.handoffStatus !== "Resubmitted") {
      const errorMsg = `Cannot return handoff: Status is "${target.handoffStatus}". Hand-offs can only be returned while "Pending HR Acceptance" or "Resubmitted". Accepted handoffs must remain closed.`;
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!remarks.trim()) {
      showToast("Mandatory requirement: Please provide correction remarks for returning the handoff.", "error");
      return { success: false, error: "Missing remarks" };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const audit = createAuditLog(
        "Dulla, Ralph Vincent",
        "HR Operations Lead",
        "Handoff Returned to TA for Correction",
        `Correction Reason: "${remarks.trim()}"`
      );
      return {
        ...a,
        handoffStatus: "Returned for Correction",
        handoffCorrectionRemarks: remarks.trim(),
        auditLogs: [audit, ...a.auditLogs]
      };
    }));
    showToast("Handoff returned to TA for correction.", "info");
    return { success: true };
  };

  const taResubmitHandoff = (applicantId: string, resolutionRemarks?: string): { success: boolean; error?: string } => {
    // Requirement 10: Role protection
    if (role !== "TA") {
      const errorMsg = "Unauthorized: Only Talent Acquisition can resubmit handoffs to HR.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 13: Returned handoffs must require a recorded correction or resolution before resubmission.
    if (target.handoffStatus !== "Returned for Correction") {
      const errorMsg = "Cannot resubmit handoff: Handoff has not been returned for correction.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!resolutionRemarks || !resolutionRemarks.trim()) {
      const errorMsg = "Mandatory requirement: A documented correction or resolution explanation must be provided before resubmitting the handoff.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const audit = createAuditLog(
        "Alena Batacan",
        "Talent Acquisition",
        "Handoff Resubmitted to HR",
        `Resolution Remarks: "${resolutionRemarks.trim()}". Addressed HR correction notes and resubmitted the existing handoff record without recreating Kronos credentials.`
      );
      return {
        ...a,
        handoffStatus: "Resubmitted",
        auditLogs: [audit, ...a.auditLogs]
      };
    }));
    showToast("Handoff resubmitted to HR for review.", "success");
    return { success: true };
  };

  // ==========================================
  // 10. TRANSITION TO REGULAR HRIS LOGIN
  // ==========================================
  const simulateFirstRegularLogin = (applicantId: string): { success: boolean; error?: string } => {
    const target = applicants.find(a => a.id === applicantId);
    if (!target) return { success: false, error: "Applicant not found" };

    // Requirement 14: Regular HRIS login requires valid official Kronos ID provisioned by IT, deactivating temporary portal access and preserving separation from NHO handoff
    if (!target.officialKronosId?.trim() || target.itRequestStatus !== "Completed") {
      const errorMsg = "Cannot perform regular HRIS login: Account provisioning must be Completed by IT with an assigned official Kronos ID.";
      showToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    setApplicants(prev => prev.map(a => {
      if (a.id !== applicantId) return a;
      const audit = createAuditLog(
        a.fullName,
        "Employee",
        "First Regular HRIS Login Detected",
        `Employee authenticated via corporate SSO/Kronos (${a.officialKronosId}). Temporary NHO portal access automatically deactivated.`
      );
      return {
        ...a,
        firstRegularHrisLoginAt: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        tempAccessStatus: "Deactivated",
        auditLogs: [audit, ...a.auditLogs]
      };
    }));
    showToast("First regular HRIS login successful! Temporary NHO access deactivated.", "success");
    return { success: true };
  };

  return (
    <NHOContext.Provider
      value={{
        role,
        setRole,
        selectedApplicantId,
        setSelectedApplicantId,
        applicants,
        activeApplicant,
        toast,
        showToast,
        simulatedCurrentDate,
        setSimulatedCurrentDate,
        resetDemoData,
        resetWalkthroughApplicant,
        markAttendance,
        recordFollowUp,
        rescheduleNHO,
        acceptRescheduledSchedule,
        markDropOff,
        withdrawApplicant,
        simulatePasswordRetrieval,
        sendTempAccessCredentialsLink,
        simulateLinkExpiration,
        recoverRetrievalLink,
        applicantChangePassword,
        updateOrientationSlide,
        submitQuizAnswer,
        completeOrientation,
        submitAgreement,
        submitOtherDocument,
        verifyDocument,
        returnDocumentForCorrection,
        checkITEndorsementEligibility,
        endorseToIT,
        itStartProcessing,
        itUpdatePermittedFields,
        itCompleteProvisioning,
        trainerAcceptTrainee,
        trainerDeclineTrainee,
        trainerReassign,
        trainerRequestMaterial,
        qdsAddMaterial,
        qdsRemoveMaterial,
        qdsConfirmMaterials,
        qdsAssignAndSendToTrainer,
        qdsFulfillMaterialRequest,
        qdsNotifications,
        dismissQdsNotification,
        qdsAssignAttendanceSchedule,
        wfmConfirmSeatAssignment,
        hrAcceptHandoff,
        hrReturnHandoff,
        taResubmitHandoff,
        simulateFirstRegularLogin
      }}
    >
      {children}
    </NHOContext.Provider>
  );
};

export const useNHO = (): NHOContextType => {
  const context = useContext(NHOContext);
  if (!context) {
    throw new Error("useNHO must be used within an NHOProvider");
  }
  return context;
};
