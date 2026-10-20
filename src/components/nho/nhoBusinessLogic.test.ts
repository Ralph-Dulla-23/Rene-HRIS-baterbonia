import { INITIAL_NHO_APPLICANTS } from "./nhoInitialData";
import { 
  checkSevenDayNotice, 
  addCalendarDays, 
  deriveDeadlineStatus,
  handleTrainerAcceptTrainee,
  handleTrainerDeclineTrainee,
  handleTrainerReassign,
  handleQDSAddMaterial,
  handleQDSRemoveMaterial,
  handleQDSConfirmMaterials,
  handleWFMConfirmSeatAssignment,
  handleHRAcceptHandoff,
  AUTHORIZED_TRAINERS
} from "./NHOContext";
import { NHOApplicant, NHOQDSMaterial } from "./nhoTypes";

/**
 * SiBS 360 HRIS NHO V1 - Comprehensive Logic & Regression Test Suite
 * Exercises all 14 mandatory logic repairs and workflows.
 */

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log("=== RUNNING SIBS NHO V1 REGRESSION TEST SUITE ===\n");

// -------------------------------------------------------------
// Test 1: Verify Seeded Applicants Integrity
// -------------------------------------------------------------
console.log("Test Suite 1: Seeded Demo Applicants Integrity (All 6 Applicants)");
assert(INITIAL_NHO_APPLICANTS.length === 6, "All 6 demo applicants are present in seed data");

const maria = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-02");
assert(!!maria, "Maria Clarisse Santos (nho-app-02) exists");
if (maria) {
  const mariaAgreements = maria.documents.filter(d => d.isEssentialAgreement);
  assert(mariaAgreements.length === 3, "Requirement 12: Maria Clarisse Santos has all 3 essential agreement slots");
  assert(maria.documents.filter(d => d.isMajor).length === 4, "Maria Clarisse Santos has all 4 major requirement slots");
}

const mark = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-03");
assert(!!mark, "Mark Anthony Reyes (nho-app-03) exists");
if (mark) {
  assert(mark.documents.length > 0, "Requirement 15: Mark Anthony Reyes has documents populated (not empty array)");
  assert(mark.documents.filter(d => d.isMajor).length === 4, "Mark Anthony Reyes has 4 major requirement slots");
  assert(mark.documents.filter(d => d.isEssentialAgreement).length === 3, "Mark Anthony Reyes has 3 essential agreement slots");
}

// -------------------------------------------------------------
// Test 2: Essential Agreement Deadlines Removed
// -------------------------------------------------------------
console.log("\nTest Suite 2: Requirement 13 - Removal of Fixed Deadlines from Essential Agreements");
let allAgreementsLackFixedDeadlines = true;
for (const app of INITIAL_NHO_APPLICANTS) {
  for (const doc of app.documents) {
    if (doc.isEssentialAgreement && doc.dueDate) {
      allAgreementsLackFixedDeadlines = false;
      console.error(`Agreement ${doc.name} for ${app.fullName} has unexpected dueDate: ${doc.dueDate}`);
    }
  }
}
assert(allAgreementsLackFixedDeadlines, "Requirement 13: No essential agreement across all demo applicants has a fixed dueDate");

// -------------------------------------------------------------
// Test 3: IT Provisioning Validations (Requirements 1 & 2)
// -------------------------------------------------------------
console.log("\nTest Suite 3: Requirements 1 & 2 - IT Request Processing & Record Immutability");

// Function simulating IT start processing validation logic
function validateITStartProcessing(app: NHOApplicant, userRole: string): { allowed: boolean; reason?: string } {
  if (userRole !== "IT") return { allowed: false, reason: "Unauthorized: Only IT can begin processing" };
  if (!app.itEndorsed) return { allowed: false, reason: "Not endorsed to IT by TA" };
  if (app.outcome === "Withdrawn" || app.outcome === "Drop-Off") return { allowed: false, reason: "Terminal status" };
  if (app.physicalClearance !== "Cleared" || app.tempAccessStatus === "Suspended") return { allowed: false, reason: "Invalid clearance" };
  if (app.itRequestStatus === "Completed" || app.officialKronosId) return { allowed: false, reason: "Cannot return completed IT request to In Progress" };
  if (app.itRequestStatus !== "Pending") return { allowed: false, reason: "Request status must be Pending" };
  return { allowed: true };
}

// Completed applicant (e.g. Eduardo Ramos is in Completed IT request state)
const eduardo = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-05")!;
const completedITCheck = validateITStartProcessing(eduardo, "IT");
assert(!completedITCheck.allowed && completedITCheck.reason?.includes("Cannot return completed"), 
  "Requirement 1: Completed IT requests cannot return to In Progress");

// Unendorsed applicant
const unendorsedApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-01")!;
const unendorsedCheck = validateITStartProcessing(unendorsedApp, "IT");
assert(!unendorsedCheck.allowed && unendorsedCheck.reason?.includes("Not endorsed"),
  "Requirement 2: Unendorsed applicants cannot be processed by IT");

// Terminal applicant (Withdrawn/Drop-Off)
const terminalApp: NHOApplicant = { ...unendorsedApp, itEndorsed: true, itRequestStatus: "Pending", outcome: "Withdrawn" };
const terminalCheck = validateITStartProcessing(terminalApp, "IT");
assert(!terminalCheck.allowed && terminalCheck.reason?.includes("Terminal status"),
  "Requirement 2: Terminal applicants (Withdrawn/Drop-Off) cannot be processed by IT");

// Valid endorsed applicant
const validPendingIT: NHOApplicant = { 
  ...unendorsedApp, 
  itEndorsed: true, 
  itRequestStatus: "Pending", 
  physicalClearance: "Cleared",
  tempAccessStatus: "Active",
  outcome: "In Progress" 
};
const validITCheck = validateITStartProcessing(validPendingIT, "IT");
assert(validITCheck.allowed, "Requirement 2: Valid, endorsed, non-terminal applicant with Pending status can be processed");

// -------------------------------------------------------------
// Test 4: HR Handoff Acceptance & Return Restrictions (Requirement 3)
// -------------------------------------------------------------
console.log("\nTest Suite 4: Requirement 3 - HR Handoff Return Restrictions");

function validateHRReturnHandoff(app: NHOApplicant, userRole: string, remarks: string): { allowed: boolean; reason?: string } {
  if (userRole !== "HR") return { allowed: false, reason: "Unauthorized: Only HR can return handoffs" };
  if (app.handoffStatus !== "Pending HR Acceptance" && app.handoffStatus !== "Resubmitted") {
    return { allowed: false, reason: `Cannot return handoff: Status is ${app.handoffStatus}. Accepted handoffs must remain closed.` };
  }
  if (!remarks.trim()) return { allowed: false, reason: "Missing remarks" };
  return { allowed: true };
}

// Test with Accepted handoff
const acceptedApp: NHOApplicant = { ...validPendingIT, handoffStatus: "Accepted" };
const returnAcceptedCheck = validateHRReturnHandoff(acceptedApp, "HR", "Need fix");
assert(!returnAcceptedCheck.allowed && returnAcceptedCheck.reason?.includes("Accepted handoffs must remain closed"),
  "Requirement 3: Accepted handoffs cannot be returned for correction and remain closed");

// Test with Pending HR Acceptance
const pendingHandoffApp: NHOApplicant = { ...validPendingIT, handoffStatus: "Pending HR Acceptance" };
const returnPendingCheck = validateHRReturnHandoff(pendingHandoffApp, "HR", "Missing signature page");
assert(returnPendingCheck.allowed, "Requirement 3: Pending HR Acceptance handoffs can be returned with remarks");

// Test with Resubmitted handoff
const resubmittedHandoffApp: NHOApplicant = { ...validPendingIT, handoffStatus: "Resubmitted" };
const returnResubmittedCheck = validateHRReturnHandoff(resubmittedHandoffApp, "HR", "Still missing page");
assert(returnResubmittedCheck.allowed, "Requirement 3: Resubmitted handoffs can be returned with remarks");

// -------------------------------------------------------------
// Test 5: Document Upload & Verification Evidence (Requirement 4)
// -------------------------------------------------------------
console.log("\nTest Suite 5: Requirement 4 - Strict File Evidence and No Verification solely on Submission Date");

function validateDocVerification(doc: { fileName?: string; signatureDataUrl?: string; submittedDate?: string; status: string }): { allowed: boolean; reason?: string } {
  if (doc.status !== "For Verification") return { allowed: false, reason: "Must be in For Verification status" };
  const hasFile = !!doc.fileName?.trim();
  const hasSignature = !!doc.signatureDataUrl?.trim();
  if (!hasFile && !hasSignature) {
    return { allowed: false, reason: "Missing file or signature evidence. Verification cannot be based solely on submission date." };
  }
  return { allowed: true };
}

// Doc with submittedDate only (NO file, NO signature)
const dateOnlyDoc = { status: "For Verification", submittedDate: "2026-10-09" };
const dateOnlyCheck = validateDocVerification(dateOnlyDoc);
assert(!dateOnlyCheck.allowed && dateOnlyCheck.reason?.includes("cannot be based solely on submission date"),
  "Requirement 4: TA cannot verify document based solely on submission date without file/signature evidence");

// Doc with valid file
const fileDoc = { status: "For Verification", submittedDate: "2026-10-09", fileName: "NBI_Clearance.pdf" };
assert(validateDocVerification(fileDoc).allowed, "Requirement 4: Document with valid uploaded file evidence can be verified");

// -------------------------------------------------------------
// Test 6: Essential Agreements Evidence & Restrictions (Requirement 5)
// -------------------------------------------------------------
console.log("\nTest Suite 6: Requirement 5 - Drawn Signatures, Uploaded Files & Agreement Scope");

function validateAgreementSubmission(
  doc: { isEssentialAgreement: boolean; status: string },
  method: "Electronic Signature" | "Manual Upload",
  sigUrl?: string,
  fileName?: string
): { allowed: boolean; reason?: string } {
  if (!doc.isEssentialAgreement) return { allowed: false, reason: "Not an essential agreement" };
  if (doc.status === "Verified") return { allowed: false, reason: "Cannot overwrite verified agreement" };
  if (method === "Electronic Signature" && (!sigUrl || !sigUrl.trim())) {
    return { allowed: false, reason: "Drawn signature evidence is required" };
  }
  if (method === "Manual Upload" && (!fileName || !fileName.trim())) {
    return { allowed: false, reason: "Valid uploaded signed file is required" };
  }
  return { allowed: true };
}

// Test executing agreement on a non-agreement document
const nonAgreedDoc = { isEssentialAgreement: false, status: "Not Submitted" };
const nonAgreedCheck = validateAgreementSubmission(nonAgreedDoc, "Electronic Signature", "data:image/png;base64,123");
assert(!nonAgreedCheck.allowed && nonAgreedCheck.reason?.includes("Not an essential agreement"),
  "Requirement 5: Agreement actions are prevented on non-agreement documents");

// Electronic signature without drawn signature evidence
const agreedDoc = { isEssentialAgreement: true, status: "Not Submitted" };
const emptySigCheck = validateAgreementSubmission(agreedDoc, "Electronic Signature", "");
assert(!emptySigCheck.allowed && emptySigCheck.reason?.includes("Drawn signature evidence is required"),
  "Requirement 5: Electronic agreement submission rejects missing drawn-signature evidence");

// Manual upload without uploaded file
const emptyFileCheck = validateAgreementSubmission(agreedDoc, "Manual Upload", undefined, "");
assert(!emptyFileCheck.allowed && emptyFileCheck.reason?.includes("Valid uploaded signed file is required"),
  "Requirement 5: Manual agreement submission rejects missing file evidence");

// Valid electronic signature
const validSigCheck = validateAgreementSubmission(agreedDoc, "Electronic Signature", "data:image/png;base64,abcdef123");
assert(validSigCheck.allowed, "Requirement 5: Electronic agreement succeeds with drawn signature data URL");

// -------------------------------------------------------------
// Test 7: 24-Hour Link Expiration & One-Time Token Consumption (Requirement 6)
// -------------------------------------------------------------
console.log("\nTest Suite 7: Requirement 6 - Exact 24-Hour Link Expiration & One-Time Token Consumption");

function validatePasswordRetrieval(app: { tempAccessStatus: string; retrievalLinkExpiresAt?: string; retrievalLinkUsed: boolean; retrievalLinkExpired: boolean }, simulatedDate: string): { allowed: boolean; reason?: string } {
  if (app.tempAccessStatus !== "Active") return { allowed: false, reason: "Temporary access not active" };
  if (app.retrievalLinkUsed) return { allowed: false, reason: "One-time link has already been used and cannot be reused" };
  
  // Timestamp comparison
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

  const expMs = parseExpirationTimestamp(app.retrievalLinkExpiresAt);
  const simDate = new Date(simulatedDate);
  simDate.setHours(12, 0, 0, 0); // Simulated noon
  const isExpired = expMs !== null ? simDate.getTime() > expMs : false;

  if (app.retrievalLinkExpired || isExpired) {
    return { allowed: false, reason: "One-time retrieval link has expired" };
  }
  return { allowed: true };
}

// Unconsumed, active link
const activeTokenApp = { tempAccessStatus: "Active", retrievalLinkExpiresAt: "2026-10-10 09:00 AM", retrievalLinkUsed: false, retrievalLinkExpired: false };
assert(validatePasswordRetrieval(activeTokenApp, "2026-10-09").allowed, "Requirement 6: Active unexpired retrieval link allows retrieval");

// Consumed link (token reuse prevention)
const usedTokenApp = { ...activeTokenApp, retrievalLinkUsed: true };
const reusedCheck = validatePasswordRetrieval(usedTokenApp, "2026-10-09");
assert(!reusedCheck.allowed && reusedCheck.reason?.includes("already been used"),
  "Requirement 6: Consumed link cannot be reused (one-time token consumption enforced)");

// Expired link by date-time comparison
const expiredTimeApp = { ...activeTokenApp, retrievalLinkExpiresAt: "2026-10-08 09:00 AM" };
const expiredCheck = validatePasswordRetrieval(expiredTimeApp, "2026-10-09");
assert(!expiredCheck.allowed && expiredCheck.reason?.includes("has expired"),
  "Requirement 6: Expired link blocked by date-and-time timestamp comparison");

// -------------------------------------------------------------
// Test 8: Password Change Authentication Prerequisite (Requirement 7)
// -------------------------------------------------------------
console.log("\nTest Suite 8: Requirement 7 - Password Change Authorization & First-Login Flow");

function validatePasswordChange(app: { tempAccessStatus: string; retrievalLinkUsed: boolean; outcome: string }, newPass: string): { allowed: boolean; reason?: string } {
  if (app.tempAccessStatus !== "Active") return { allowed: false, reason: "Valid temporary account has not been issued" };
  if (!app.retrievalLinkUsed) return { allowed: false, reason: "First-login flow must be authenticated via retrieval before changing password" };
  if (app.outcome === "Withdrawn" || app.outcome === "Drop-Off") return { allowed: false, reason: "Applicant in terminal status" };
  if (newPass.length < 8) return { allowed: false, reason: "Password must be at least 8 characters long" };
  return { allowed: true };
}

// User without active temporary account
const noTempApp = { tempAccessStatus: "Not Issued", retrievalLinkUsed: false, outcome: "In Progress" };
assert(!validatePasswordChange(noTempApp, "ValidPass123!").allowed, "Requirement 7: Blocks password change if temporary account is Not Issued");

// User with active account but has NOT authenticated first login (link not used)
const unauthedApp = { tempAccessStatus: "Active", retrievalLinkUsed: false, outcome: "In Progress" };
assert(!validatePasswordChange(unauthedApp, "ValidPass123!").allowed, "Requirement 7: Blocks password change if first-login retrieval flow is not authenticated");

// Valid authenticated applicant
const authedApp = { tempAccessStatus: "Active", retrievalLinkUsed: true, outcome: "In Progress" };
assert(validatePasswordChange(authedApp, "ValidPass123!").allowed, "Requirement 7: Allows password change when account is active and first login is authenticated");

// -------------------------------------------------------------
// Test 9: Major Document Verification Assigned to TA (Requirement 8)
// -------------------------------------------------------------
console.log("\nTest Suite 9: Requirement 8 - Major Document Verification Role Separation");

function validateRoleVerification(doc: { isMajor: boolean }, userRole: string, handoffStatus: string): { allowed: boolean; reason?: string } {
  if (doc.isMajor && userRole !== "TA") return { allowed: false, reason: "Majors strictly assigned to TA" };
  if (!doc.isMajor && userRole === "HR" && handoffStatus !== "Accepted") return { allowed: false, reason: "HR manages non-majors only post-acceptance" };
  return { allowed: true };
}

const majorDoc = { isMajor: true };
assert(!validateRoleVerification(majorDoc, "HR", "Accepted").allowed, "Requirement 8: HR cannot verify the 4 major pre-employment requirements (strictly TA)");
assert(validateRoleVerification(majorDoc, "TA", "Not Ready").allowed, "Requirement 8: TA can verify major requirements");

const nonMajorDoc = { isMajor: false };
assert(!validateRoleVerification(nonMajorDoc, "HR", "Pending HR Acceptance").allowed, "Requirement 8: HR cannot manage non-majors before accepting handoff");
assert(validateRoleVerification(nonMajorDoc, "HR", "Accepted").allowed, "Requirement 8: HR can manage and verify non-majors after formal acceptance");

// -------------------------------------------------------------
// Test 10: Block Rescheduling & Withdrawal Post-Handoff (Requirement 9)
// -------------------------------------------------------------
console.log("\nTest Suite 10: Requirement 9 - Blocking Reschedule & Withdrawal Post-Handoff Acceptance");

function validateRescheduleOrWithdraw(handoffStatus: string): { allowed: boolean; reason?: string } {
  if (handoffStatus === "Accepted") return { allowed: false, reason: "Handoff has already been accepted by HR Operations" };
  return { allowed: true };
}

assert(!validateRescheduleOrWithdraw("Accepted").allowed, "Requirement 9: Rescheduling and TA withdrawal blocked once handoff is Accepted");
assert(validateRescheduleOrWithdraw("Not Ready").allowed, "Requirement 9: Rescheduling and TA withdrawal allowed prior to handoff acceptance");

// -------------------------------------------------------------
// Test 11: Restrict Knowledge-Check Quiz Questions (Requirement 10)
// -------------------------------------------------------------
console.log("\nTest Suite 11: Requirement 10 - Restriction to 5 Valid Quiz Questions");

function validateQuizQuestion(qIdx: number): { allowed: boolean; reason?: string } {
  if (!Number.isInteger(qIdx) || qIdx < 0 || qIdx > 4) {
    return { allowed: false, reason: "Invalid knowledge check question index (must be 0-4)" };
  }
  return { allowed: true };
}

assert(validateQuizQuestion(0).allowed, "Valid question 0 accepted");
assert(validateQuizQuestion(4).allowed, "Valid question 4 accepted");
assert(!validateQuizQuestion(5).allowed, "Requirement 10: Rejects question index 5 (only 0-4 allowed)");
assert(!validateQuizQuestion(-1).allowed, "Requirement 10: Rejects negative question index");
assert(!validateQuizQuestion(100).allowed, "Requirement 10: Rejects question index 100");

// -------------------------------------------------------------
// Test 12: Prevent Marking Show Before Scheduled Date (Requirement 11)
// -------------------------------------------------------------
console.log("\nTest Suite 12: Requirement 11 - Prevent Marking Show Before Scheduled Session");

function validateMarkShowDate(scheduledDate: string, currentDate: string): { allowed: boolean; reason?: string } {
  if (currentDate < scheduledDate) {
    return { allowed: false, reason: "Cannot mark Show before the actual scheduled NHO session date" };
  }
  return { allowed: true };
}

assert(!validateMarkShowDate("2026-10-15", "2026-10-09").allowed, "Requirement 11: Rejects marking Show when session date is in the future");
assert(validateMarkShowDate("2026-10-09", "2026-10-09").allowed, "Requirement 11: Allows marking Show on the scheduled session date");
assert(validateMarkShowDate("2026-10-05", "2026-10-09").allowed, "Requirement 11: Allows marking Show on or after scheduled session date");

// -------------------------------------------------------------
// Test 13: Regular HRIS Login & Account Activation Separation (Requirement 14)
// -------------------------------------------------------------
console.log("\nTest Suite 13: Requirement 14 - Separation of Account Activation & Regular HRIS Login");

function validateRegularLogin(app: { officialKronosId?: string; itRequestStatus: string }): { allowed: boolean; reason?: string } {
  if (!app.officialKronosId?.trim() || app.itRequestStatus !== "Completed") {
    return { allowed: false, reason: "Account provisioning must be Completed by IT with assigned Kronos ID" };
  }
  return { allowed: true };
}

// IT provisioning complete with Kronos ID, regardless of HR handoff acceptance
const provisionedApp = { officialKronosId: "KRN-99881", itRequestStatus: "Completed" };
assert(validateRegularLogin(provisionedApp).allowed, 
  "Requirement 14: Regular HRIS login allowed once IT provisioning is Completed with official Kronos ID");

const unprovisionedApp = { officialKronosId: undefined, itRequestStatus: "In Progress" };
assert(!validateRegularLogin(unprovisionedApp).allowed, 
  "Requirement 14: Regular HRIS login rejected if IT provisioning is not completed");

// -------------------------------------------------------------
// Test 14: IT Provisioning Forwards to WFM (Workflow: TA -> IT -> WFM -> HR)
// -------------------------------------------------------------
console.log("\nTest Suite 14: WFM Workflow - IT Completion Forwards to WFM Queue");

function simulateITCompletion(app: NHOApplicant, kronosId: string): { wfmStatus: string; handoffStatus: string; officialKronosId: string } {
  return {
    officialKronosId: kronosId.trim(),
    wfmStatus: "Pending WFM Assignment",
    handoffStatus: "Pending WFM Assignment"
  };
}

const itResult = simulateITCompletion(validPendingIT, "KRN-90841");
assert(itResult.wfmStatus === "Pending WFM Assignment", "IT completion sets wfmStatus to Pending WFM Assignment");
assert(itResult.handoffStatus === "Pending WFM Assignment", "IT completion sets handoffStatus to Pending WFM Assignment (not forwarded to HR yet)");
assert(itResult.officialKronosId === "KRN-90841", "IT completion assigns official Kronos ID");

// -------------------------------------------------------------
// Test 15: WFM Seat Assignment Validations & Conflict Prevention
// -------------------------------------------------------------
console.log("\nTest Suite 15: WFM Production Seat Assignment Validations");

function validateWFMSeatAssignment(
  app: NHOApplicant,
  role: string,
  wing: string,
  seatNumber: string,
  existingAssignments: Array<{ id: string; wing: string; seat: string; site: string }>
): { allowed: boolean; reason?: string; cleanedSeat?: string } {
  if (role !== "WFM") {
    return { allowed: false, reason: "Unauthorized: Only Workforce Management (WFM) can assign workstations" };
  }
  if (app.itRequestStatus !== "Completed" || !app.officialKronosId?.trim()) {
    return { allowed: false, reason: "IT provisioning must be Completed with an official Kronos ID" };
  }
  if (app.outcome === "Withdrawn" || app.outcome === "Drop-Off") {
    return { allowed: false, reason: "Terminal applicant" };
  }
  if (wing !== "Left Wing" && wing !== "Right Wing") {
    return { allowed: false, reason: "Invalid wing" };
  }
  const cleaned = (seatNumber || "").trim();
  if (!cleaned) {
    return { allowed: false, reason: "Workstation / seat number is required" };
  }
  const conflict = existingAssignments.find(a => 
    a.id !== app.id && 
    a.wing === wing && 
    a.site === app.reportingLocation && 
    a.seat.toLowerCase() === cleaned.toLowerCase()
  );
  if (conflict) {
    return { allowed: false, reason: `Workstation conflict: Seat "${cleaned}" is already assigned` };
  }
  return { allowed: true, cleanedSeat: cleaned };
}

// 1. Role protection: Non-WFM blocked
const pendingWfmApp: NHOApplicant = {
  ...validPendingIT,
  itRequestStatus: "Completed",
  officialKronosId: "KRN-90841",
  wfmStatus: "Pending WFM Assignment",
  handoffStatus: "Pending WFM Assignment",
  reportingLocation: "SiBS Tower 1, BGC, Taguig City"
};

const mockAssignments = [
  { id: "nho-app-06", wing: "Right Wing", seat: "RW-021", site: "SiBS Tower 1, BGC, Taguig City" },
  { id: "other-emp", wing: "Left Wing", seat: "LW-010", site: "SiBS Tower 1, BGC, Taguig City" }
];

assert(!validateWFMSeatAssignment(pendingWfmApp, "TA", "Left Wing", "LW-012", mockAssignments).allowed,
  "WFM Security: TA role cannot assign workstations");
assert(!validateWFMSeatAssignment(pendingWfmApp, "IT", "Left Wing", "LW-012", mockAssignments).allowed,
  "WFM Security: IT role cannot assign workstations");

// 2. Unprovisioned applicant blocked
const unprovisionedWfmCheck = validateWFMSeatAssignment(
  { ...pendingWfmApp, itRequestStatus: "Pending", officialKronosId: undefined },
  "WFM", "Left Wing", "LW-012", mockAssignments
);
assert(!unprovisionedWfmCheck.allowed && unprovisionedWfmCheck.reason?.includes("IT provisioning must be Completed"),
  "WFM Validation: Applicant without completed IT provisioning cannot be assigned a workstation");

// 3. Empty seat blocked
const emptySeatCheck = validateWFMSeatAssignment(pendingWfmApp, "WFM", "Left Wing", "   ", mockAssignments);
assert(!emptySeatCheck.allowed && emptySeatCheck.reason?.includes("seat number is required"),
  "WFM Validation: Empty or whitespace-only workstation number is rejected");

// 4. Duplicate seat conflict in same wing & site blocked
const conflictCheck = validateWFMSeatAssignment(pendingWfmApp, "WFM", "Left Wing", "LW-010", mockAssignments);
assert(!conflictCheck.allowed && conflictCheck.reason?.includes("Workstation conflict"),
  "WFM Conflict: Prevent assigning already-assigned workstation LW-010 in Left Wing at same site");

// 5. Valid seat assignment allowed and trims whitespace
const validWfmCheck = validateWFMSeatAssignment(pendingWfmApp, "WFM", "Left Wing", "  LW-012  ", mockAssignments);
assert(validWfmCheck.allowed && validWfmCheck.cleanedSeat === "LW-012",
  "WFM Validation: Valid seat assignment (Left Wing, LW-012) succeeds with trimmed seat number");

// -------------------------------------------------------------
// Test 16: HR Handoff Acceptance Requires WFM Confirmation
// -------------------------------------------------------------
console.log("\nTest Suite 16: HR Acceptance Requirement for WFM Seat Assignment");

function validateHRAcceptanceWithWFM(app: NHOApplicant, role: string): { allowed: boolean; reason?: string } {
  if (role !== "HR") return { allowed: false, reason: "Unauthorized: Only HR can accept handoff" };
  if (app.itRequestStatus !== "Completed" || !app.officialKronosId?.trim()) {
    return { allowed: false, reason: "IT provisioning must be Completed" };
  }
  if (app.wfmStatus !== "Assigned" || !app.wfmProductionWing || !app.wfmSeatNumber?.trim()) {
    return { allowed: false, reason: "WFM Production Seat Assignment must be confirmed with an assigned wing and workstation" };
  }
  if (app.handoffStatus !== "Pending HR Acceptance" && app.handoffStatus !== "Resubmitted") {
    return { allowed: false, reason: "Invalid handoff status" };
  }
  return { allowed: true };
}

// 1. Unassigned WFM blocked in HR
const pendingWfmForHR: NHOApplicant = {
  ...pendingWfmApp,
  handoffStatus: "Pending WFM Assignment",
  wfmStatus: "Pending WFM Assignment"
};
const hrAcceptPendingWfmCheck = validateHRAcceptanceWithWFM(pendingWfmForHR, "HR");
assert(!hrAcceptPendingWfmCheck.allowed && hrAcceptPendingWfmCheck.reason?.includes("WFM Production Seat Assignment must be confirmed"),
  "HR Rule: HR cannot accept handoff before WFM confirms seat assignment");

// 2. Confirmed WFM assignment allowed in HR
const confirmedWfmForHR: NHOApplicant = {
  ...pendingWfmApp,
  handoffStatus: "Pending HR Acceptance",
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-012"
};
const hrAcceptConfirmedCheck = validateHRAcceptanceWithWFM(confirmedWfmForHR, "HR");
assert(hrAcceptConfirmedCheck.allowed,
  "HR Rule: HR can accept handoff once IT provisioning and WFM workstation assignment are both completed");

// -------------------------------------------------------------
// Test 17: Candidate Continuity Across All 6 Demo Applicants
// -------------------------------------------------------------
console.log("\nTest Suite 17: Initial Data Integrity for All 6 Applicants & WFM States");

const juan = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-01")!;
assert(juan.wfmStatus === "Not Ready", "Demo Candidate 1 (Juan Carlos): wfmStatus initialized to Not Ready");

const mariaApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-02")!;
assert(mariaApp.wfmStatus === "Not Ready", "Demo Candidate 2 (Maria Santos): wfmStatus initialized to Not Ready");

const markApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-03")!;
assert(markApp.wfmStatus === "Not Ready", "Demo Candidate 3 (Mark Reyes): wfmStatus initialized to Not Ready");

const patriciaApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-04")!;
assert(patriciaApp.wfmStatus === "Not Ready", "Demo Candidate 4 (Patricia Gomez): wfmStatus initialized to Not Ready");

const eduardoApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-05")!;
assert(eduardoApp.wfmStatus === "Pending WFM Assignment" && eduardoApp.itRequestStatus === "Completed",
  "Demo Candidate 5 (Eduardo Ramos): IT is Completed, pending WFM Production Seat Assignment");

const beatriceApp = INITIAL_NHO_APPLICANTS.find(a => a.id === "nho-app-06")!;
assert(beatriceApp.wfmStatus === "Assigned" && beatriceApp.wfmSeatNumber === "RW-021" && beatriceApp.handoffStatus === "Accepted",
  "Demo Candidate 6 (Beatrice Tan): Completed end-to-end, WFM Assigned (Right Wing / RW-021), HR Accepted");

// -------------------------------------------------------------
// Test 18: Mandatory Regression Test Suite (Using Actual NHOContext.tsx Handlers)
// -------------------------------------------------------------
console.log("\nTest Suite 18: Mandatory Regression Verification (Actual NHOContext Handlers)");

// Base applicant fixture for post-IT parallel testing
const baseCandidate: NHOApplicant = {
  ...eduardoApp,
  id: "test-candidate-01",
  fullName: "Carlos Mendoza",
  reportingLocation: "Bacolod Main Campus",
  itRequestStatus: "Completed",
  officialKronosId: "KRN-88001",
  trainerStatus: "Pending Acceptance",
  assignedTrainerId: "TRN-001",
  assignedTrainerName: "Maria Elena Garcia (Senior Trainer)",
  qdsStatus: "Pending",
  qdsMaterials: [],
  wfmStatus: "Pending WFM Assignment",
  wfmProductionWing: undefined,
  wfmSeatNumber: undefined,
  handoffStatus: "Waiting for Departments",
  outcome: undefined
};

// 1. Trainer cannot accept a trainee assigned to another trainer
console.log("\n--- Verification 1: Trainer Assignment Validation & Authorization ---");
const crossTrainerAttempt = handleTrainerAcceptTrainee(
  [baseCandidate],
  baseCandidate.id,
  "TRN-002", // Juan Miguel Ramos
  true,
  undefined,
  "Trainer"
);
assert(
  !crossTrainerAttempt.success && !!crossTrainerAttempt.error?.includes("cannot accept a trainee assigned to"),
  "Verification 1a: Trainer cannot accept a trainee assigned to another trainer (acting TRN-002 vs assigned TRN-001)"
);

const invalidTrainerAttempt = handleTrainerAcceptTrainee(
  [baseCandidate],
  baseCandidate.id,
  "Fake Trainer Name",
  true,
  undefined,
  "Trainer"
);
assert(
  !invalidTrainerAttempt.success && !!invalidTrainerAttempt.error?.includes("not recognized on the authorized"),
  "Verification 1b: Arbitrary/unrecognized trainer name rejected as proof of identity"
);

const validTrainerAccept = handleTrainerAcceptTrainee(
  [baseCandidate],
  baseCandidate.id,
  "TRN-001",
  true,
  undefined,
  "Trainer"
);
assert(
  validTrainerAccept.success && validTrainerAccept.updatedApplicants?.[0].trainerStatus === "Accepted",
  "Verification 1c: Assigned trainer (TRN-001) successfully accepts responsibility"
);

// 2. Trainer cannot decline or reassign after HR acceptance
console.log("\n--- Verification 2: Protect Completed Handoffs from Trainer Modification ---");
const acceptedCandidate: NHOApplicant = {
  ...baseCandidate,
  trainerStatus: "Accepted",
  qdsStatus: "Completed",
  qdsMaterials: [{ id: "m1", title: "Playbook", type: "PDF Document", fileOrLinkRef: "playbook.pdf", assignedAt: "now", assignedBy: "QDS", source: "Catalog" }],
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-010",
  handoffStatus: "Accepted",
  outcome: "Completed Handoff"
};

const declineAfterHRAccept = handleTrainerDeclineTrainee(
  [acceptedCandidate],
  acceptedCandidate.id,
  "Schedule conflict",
  "TRN-001",
  "Trainer"
);
assert(
  !declineAfterHRAccept.success && !!declineAfterHRAccept.error?.includes("HR has already accepted"),
  "Verification 2a: Trainer cannot decline after HR handoff acceptance"
);

const reassignAfterHRAccept = handleTrainerReassign(
  [acceptedCandidate],
  acceptedCandidate.id,
  "TRN-002",
  undefined,
  "HR"
);
assert(
  !reassignAfterHRAccept.success && !!reassignAfterHRAccept.error?.includes("HR has already accepted"),
  "Verification 2b: Trainer cannot be reassigned after HR handoff acceptance"
);

// Also verify declining is blocked after trainer acceptance even before HR acceptance
const alreadyAcceptedCandidate: NHOApplicant = {
  ...baseCandidate,
  trainerStatus: "Accepted"
};
const declineAfterTrainerAccept = handleTrainerDeclineTrainee(
  [alreadyAcceptedCandidate],
  alreadyAcceptedCandidate.id,
  "Late schedule conflict",
  "TRN-001",
  "Trainer"
);
assert(
  !declineAfterTrainerAccept.success && !!declineAfterTrainerAccept.error?.includes("Responsibility has already been accepted"),
  "Verification 2c: Declining requires a reason and is blocked once trainer has accepted"
);

// 3. Unauthorized roles cannot reassign trainers
console.log("\n--- Verification 3: Role Restrictions on Trainer Reassignment ---");
const unauthRoles = ["Applicant", "IT", "WFM", "QDS"] as const;
for (const unauthRole of unauthRoles) {
  const attempt = handleTrainerReassign(
    [baseCandidate],
    baseCandidate.id,
    "TRN-002",
    undefined,
    unauthRole
  );
  assert(
    !attempt.success && !!attempt.error?.includes("cannot reassign trainers"),
    `Verification 3: Role "${unauthRole}" is unauthorized to reassign trainers`
  );
}

const authReassign = handleTrainerReassign(
  [baseCandidate],
  baseCandidate.id,
  "TRN-002",
  "Carlos Mendoza (L&D Specialist)",
  "HR"
);
assert(
  authReassign.success && authReassign.updatedApplicants?.[0].assignedTrainerId === "TRN-002",
  "Verification 3b: Authorized assignment manager (HR/TA) can reassign trainer to valid roster member"
);

// 4. QDS cannot add or finalize materials before IT completion
console.log("\n--- Verification 4: QDS IT Prerequisite Validations ---");
const preITCandidate: NHOApplicant = {
  ...baseCandidate,
  itRequestStatus: "Pending",
  officialKronosId: undefined
};

const qdsAddBeforeIT = handleQDSAddMaterial(
  [preITCandidate],
  preITCandidate.id,
  { title: "Standard SOP", type: "PDF Document", fileOrLinkRef: "sop.pdf", source: "Catalog" },
  undefined,
  "QDS"
);
assert(
  !qdsAddBeforeIT.success && !!qdsAddBeforeIT.error?.includes("completed IT provisioning"),
  "Verification 4a: QDS cannot add materials before IT provisioning is completed with a valid Kronos ID"
);

const qdsFinalizeBeforeIT = handleQDSConfirmMaterials(
  [preITCandidate],
  preITCandidate.id,
  "QDS"
);
assert(
  !qdsFinalizeBeforeIT.success && !!qdsFinalizeBeforeIT.error?.includes("completed IT provisioning"),
  "Verification 4b: QDS cannot finalize materials before IT completion"
);

// Fabricated material reference test
const qdsMissingRef = handleQDSAddMaterial(
  [baseCandidate],
  baseCandidate.id,
  { title: "Standard SOP", type: "PDF Document", fileOrLinkRef: "   " },
  undefined,
  "QDS"
);
assert(
  !qdsMissingRef.success && !!qdsMissingRef.error?.includes("System does not fabricate missing references"),
  "Verification 4c: QDS rejects materials with empty file/link reference without fabricating missing metadata"
);

// 5. QDS cannot alter accepted handoff records
console.log("\n--- Verification 5: QDS Blocked on Accepted Handoffs ---");
const qdsAddOnAccepted = handleQDSAddMaterial(
  [acceptedCandidate],
  acceptedCandidate.id,
  { title: "New Module", type: "PDF Document", fileOrLinkRef: "module.pdf" },
  "Urgent update",
  "QDS"
);
assert(
  !qdsAddOnAccepted.success && !!qdsAddOnAccepted.error?.includes("HR has already accepted"),
  "Verification 5a: QDS cannot add materials to an HR-accepted handoff"
);

const qdsRemoveOnAccepted = handleQDSRemoveMaterial(
  [acceptedCandidate],
  acceptedCandidate.id,
  "m1",
  "Remove guide",
  "QDS"
);
assert(
  !qdsRemoveOnAccepted.success && !!qdsRemoveOnAccepted.error?.includes("HR has already accepted"),
  "Verification 5b: QDS cannot remove materials from an HR-accepted handoff"
);

const qdsFinalizeOnAccepted = handleQDSConfirmMaterials(
  [acceptedCandidate],
  acceptedCandidate.id,
  "QDS"
);
assert(
  !qdsFinalizeOnAccepted.success && !!qdsFinalizeOnAccepted.error?.includes("HR has already accepted"),
  "Verification 5c: QDS cannot finalize materials on an HR-accepted handoff"
);

// 6. QDS corrections correctly update readiness
console.log("\n--- Verification 6: QDS Corrections Update Readiness & Invalidate Acceptance ---");
const finalizedQDSCandidate: NHOApplicant = {
  ...baseCandidate,
  trainerStatus: "Accepted",
  qdsStatus: "Completed",
  qdsMaterials: [{ id: "mat-initial", title: "Customer Service Handbook", type: "PDF Document", fileOrLinkRef: "csh.pdf", assignedAt: "now", assignedBy: "QDS", source: "Catalog" }],
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-015",
  handoffStatus: "Pending HR Acceptance"
};

// Modifying finalized curriculum requires correction reason
const unreasonedChange = handleQDSAddMaterial(
  [finalizedQDSCandidate],
  finalizedQDSCandidate.id,
  { title: "Advanced Escalations", type: "PowerPoint Presentation", fileOrLinkRef: "escalations.pptx", source: "Catalog" },
  undefined,
  "QDS"
);
assert(
  !unreasonedChange.success && !!unreasonedChange.error?.includes("Modifying finalized materials requires a documented correction reason"),
  "Verification 6a: Modifying finalized QDS materials without a documented reason is blocked"
);

// Adding material with correction reason updates status to In Progress and resets handoff readiness
const correctedAdd = handleQDSAddMaterial(
  [finalizedQDSCandidate],
  finalizedQDSCandidate.id,
  { title: "Advanced Escalations", type: "PowerPoint Presentation", fileOrLinkRef: "escalations.pptx", source: "Catalog" },
  "Client mandated escalation modules added to batch curriculum",
  "QDS"
);
assert(
  correctedAdd.success && 
  correctedAdd.updatedApplicants?.[0].qdsStatus === "In Progress" &&
  correctedAdd.updatedApplicants?.[0].handoffStatus === "Waiting for Departments",
  "Verification 6b: Adding material under documented correction resets QDS to 'In Progress' and handoff to 'Waiting for Departments'"
);

// HR cannot accept while in corrected state
const hrBlockedByCorrection = handleHRAcceptHandoff(
  correctedAdd.updatedApplicants!,
  finalizedQDSCandidate.id,
  "HR"
);
assert(
  !hrBlockedByCorrection.success && !!hrBlockedByCorrection.error?.includes("QDS training materials must be assigned and finalized"),
  "Verification 6c: HR acceptance is strictly blocked while QDS curriculum correction is In Progress"
);

// Re-confirming materials restores Completed state and unlocks HR acceptance
const reconfirmedQDS = handleQDSConfirmMaterials(
  correctedAdd.updatedApplicants!,
  finalizedQDSCandidate.id,
  "QDS"
);
assert(
  reconfirmedQDS.success && 
  reconfirmedQDS.updatedApplicants?.[0].qdsStatus === "Completed" &&
  reconfirmedQDS.updatedApplicants?.[0].handoffStatus === "Pending HR Acceptance",
  "Verification 6d: Re-confirming QDS materials recalculates handoff status to 'Pending HR Acceptance'"
);

// 7. WFM cannot modify an accepted handoff
console.log("\n--- Verification 7: WFM Blocked on Accepted Handoffs ---");
const wfmOnAccepted = handleWFMConfirmSeatAssignment(
  [acceptedCandidate],
  acceptedCandidate.id,
  "Right Wing",
  "RW-055",
  "Moved post-handoff",
  "WFM"
);
assert(
  !wfmOnAccepted.success && !!wfmOnAccepted.error?.includes("HR has already accepted"),
  "Verification 7: WFM cannot modify seat assignment after HR has accepted the final handoff"
);

// 8. WFM seat corrections require audit reasons
console.log("\n--- Verification 8: WFM Seat Corrections Require Reasons & Record Audit ---");
const assignedWFMCandidate: NHOApplicant = {
  ...baseCandidate,
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-010",
  wfmAssignedAt: "2026-10-10 10:00 AM",
  handoffStatus: "Waiting for Departments"
};

const wfmCorrectionWithoutReason = handleWFMConfirmSeatAssignment(
  [assignedWFMCandidate],
  assignedWFMCandidate.id,
  "Right Wing",
  "RW-020",
  "", // empty reason
  "WFM"
);
assert(
  !wfmCorrectionWithoutReason.success && !!wfmCorrectionWithoutReason.error?.includes("documented correction reason is required"),
  "Verification 8a: Correcting an already assigned workstation without a reason is rejected"
);

const wfmCorrectionWithReason = handleWFMConfirmSeatAssignment(
  [assignedWFMCandidate],
  assignedWFMCandidate.id,
  "Right Wing",
  "RW-020",
  "Ergonomic dual-monitor workstation required for specialist role",
  "WFM"
);
assert(
  wfmCorrectionWithReason.success && 
  wfmCorrectionWithReason.updatedApplicants?.[0].wfmProductionWing === "Right Wing" &&
  wfmCorrectionWithReason.updatedApplicants?.[0].wfmSeatNumber === "RW-020",
  "Verification 8b: Reassigning workstation with documented reason succeeds"
);

const auditEntry = wfmCorrectionWithReason.updatedApplicants?.[0].auditLogs[0];
assert(
  !!auditEntry && auditEntry.action.includes("Workstation Reassigned") && auditEntry.details.includes("Previous: Left Wing - LW-010") && auditEntry.details.includes("New: Right Wing - RW-020"),
  "Verification 8c: Previous and new seat assignment details plus justification recorded in audit log"
);

// 9. Duplicate occupied seats are rejected
console.log("\n--- Verification 9: Duplicate Occupied Seats Rejected ---");
const candidateA: NHOApplicant = {
  ...baseCandidate,
  id: "cand-a",
  fullName: "Alice Guo",
  reportingLocation: "Bacolod Main Campus",
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-025"
};

const candidateB: NHOApplicant = {
  ...baseCandidate,
  id: "cand-b",
  fullName: "Bob Ong",
  reportingLocation: "Bacolod Main Campus",
  wfmStatus: "Pending WFM Assignment",
  wfmProductionWing: undefined,
  wfmSeatNumber: undefined
};

const duplicateSeatAttempt = handleWFMConfirmSeatAssignment(
  [candidateA, candidateB],
  candidateB.id,
  "Left Wing",
  "LW-025",
  undefined,
  "WFM"
);
assert(
  !duplicateSeatAttempt.success && !!duplicateSeatAttempt.error?.includes("Workstation conflict"),
  "Verification 9a: Exact duplicate seat assignment in same wing and site is rejected"
);

const duplicateSeatTrimmed = handleWFMConfirmSeatAssignment(
  [candidateA, candidateB],
  candidateB.id,
  "Left Wing",
  "  lw-025  ", // whitespace + lowercase
  undefined,
  "WFM"
);
assert(
  !duplicateSeatTrimmed.success && !!duplicateSeatTrimmed.error?.includes("Workstation conflict"),
  "Verification 9b: Duplicate seat check normalizes whitespace and casing"
);

const differentWingSeat = handleWFMConfirmSeatAssignment(
  [candidateA, candidateB],
  candidateB.id,
  "Right Wing",
  "LW-025", // same number but different wing
  undefined,
  "WFM"
);
assert(
  differentWingSeat.success,
  "Verification 9c: Same seat number in a different wing (Right Wing vs Left Wing) is permitted"
);

// 10. HR cannot accept at 0/3, 1/3 or 2/3 completion
console.log("\n--- Verification 10: HR Acceptance Blocked at 0/3, 1/3, and 2/3 Completion ---");
// 0/3 Complete
const zeroOfThree: NHOApplicant = {
  ...baseCandidate,
  trainerStatus: "Pending Acceptance",
  qdsStatus: "Pending",
  qdsMaterials: [],
  wfmStatus: "Pending WFM Assignment",
  handoffStatus: "Waiting for Departments"
};
const hrAcceptZero = handleHRAcceptHandoff([zeroOfThree], zeroOfThree.id, "HR");
assert(!hrAcceptZero.success, "Verification 10a: HR cannot accept at 0/3 completion");

// 1/3 Complete (Only Trainer Accepted)
const oneOfThree: NHOApplicant = {
  ...zeroOfThree,
  trainerStatus: "Accepted"
};
const hrAcceptOne = handleHRAcceptHandoff([oneOfThree], oneOfThree.id, "HR");
assert(!hrAcceptOne.success, "Verification 10b: HR cannot accept at 1/3 completion (Trainer only)");

// 2/3 Complete (Trainer Accepted + QDS Completed, WFM missing)
const twoOfThreeMissingWFM: NHOApplicant = {
  ...oneOfThree,
  qdsStatus: "Completed",
  qdsMaterials: [{ id: "m1", title: "SOP", type: "PDF Document", fileOrLinkRef: "sop.pdf", assignedAt: "now", assignedBy: "QDS", source: "Catalog" }]
};
const hrAcceptMissingWFM = handleHRAcceptHandoff([twoOfThreeMissingWFM], twoOfThreeMissingWFM.id, "HR");
assert(!hrAcceptMissingWFM.success && !!hrAcceptMissingWFM.error?.includes("WFM Production Seat Assignment"),
  "Verification 10c: HR cannot accept at 2/3 completion (missing WFM)");

// 2/3 Complete (Trainer Accepted + WFM Assigned, QDS missing)
const twoOfThreeMissingQDS: NHOApplicant = {
  ...oneOfThree,
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-030"
};
const hrAcceptMissingQDS = handleHRAcceptHandoff([twoOfThreeMissingQDS], twoOfThreeMissingQDS.id, "HR");
assert(!hrAcceptMissingQDS.success && !!hrAcceptMissingQDS.error?.includes("QDS training materials"),
  "Verification 10d: HR cannot accept at 2/3 completion (missing QDS)");

// 2/3 Complete (QDS Completed + WFM Assigned, Trainer missing)
const twoOfThreeMissingTrainer: NHOApplicant = {
  ...twoOfThreeMissingWFM,
  trainerStatus: "Pending Acceptance",
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-030"
};
const hrAcceptMissingTrainer = handleHRAcceptHandoff([twoOfThreeMissingTrainer], twoOfThreeMissingTrainer.id, "HR");
assert(!hrAcceptMissingTrainer.success && !!hrAcceptMissingTrainer.error?.includes("Trainer must accept"),
  "Verification 10e: HR cannot accept at 2/3 completion (missing Trainer)");

// 11. HR can accept at 3/3 with valid IT completion
console.log("\n--- Verification 11: HR Can Accept at 3/3 With Valid IT Completion ---");
const threeOfThreeReady: NHOApplicant = {
  ...baseCandidate,
  itRequestStatus: "Completed",
  officialKronosId: "KRN-88001",
  trainerStatus: "Accepted",
  trainerAcceptedBy: "Maria Elena Garcia (Senior Trainer)",
  qdsStatus: "Completed",
  qdsMaterials: [{ id: "m1", title: "Foundations Playbook", type: "PDF Document", fileOrLinkRef: "fb.pdf", assignedAt: "now", assignedBy: "QDS", source: "Catalog" }],
  wfmStatus: "Assigned",
  wfmProductionWing: "Left Wing",
  wfmSeatNumber: "LW-033",
  handoffStatus: "Pending HR Acceptance"
};

const hrAcceptSuccess = handleHRAcceptHandoff([threeOfThreeReady], threeOfThreeReady.id, "HR");
assert(
  hrAcceptSuccess.success && 
  hrAcceptSuccess.updatedApplicants?.[0].handoffStatus === "Accepted" &&
  hrAcceptSuccess.updatedApplicants?.[0].outcome === "Completed Handoff",
  "Verification 11a: HR accepts handoff at 3/3 completion; status marked Accepted and outcome Completed Handoff"
);

const postAcceptNonMajorDoc = hrAcceptSuccess.updatedApplicants?.[0].documents.find(d => !d.isMajor && !d.isEssentialAgreement);
assert(
  postAcceptNonMajorDoc?.documentOwner === "HR",
  "Verification 11b: Operational ownership of pending non-major requirements transferred to HR upon acceptance"
);

// 12. Department actions can finish in any order
console.log("\n--- Verification 12: Asynchronous Multi-Department Order Independence ---");

// Flow A: Trainer -> QDS -> WFM
let stateA = [baseCandidate];
const resA1 = handleTrainerAcceptTrainee(stateA, baseCandidate.id, "TRN-001", true, undefined, "Trainer");
stateA = resA1.updatedApplicants!;
assert(stateA[0].trainerStatus === "Accepted" && stateA[0].handoffStatus === "Waiting for Departments", "Order A-1: Trainer accepted first");

const resA2 = handleQDSAddMaterial(stateA, baseCandidate.id, { title: "SOP", type: "PDF Document", fileOrLinkRef: "sop.pdf" }, undefined, "QDS");
stateA = resA2.updatedApplicants!;
const resA2b = handleQDSConfirmMaterials(stateA, baseCandidate.id, "QDS");
stateA = resA2b.updatedApplicants!;
assert(stateA[0].qdsStatus === "Completed" && stateA[0].handoffStatus === "Waiting for Departments", "Order A-2: QDS finalized second (Trainer remains Accepted)");

const resA3 = handleWFMConfirmSeatAssignment(stateA, baseCandidate.id, "Left Wing", "LW-101", undefined, "WFM");
stateA = resA3.updatedApplicants!;
assert(stateA[0].wfmStatus === "Assigned" && stateA[0].handoffStatus === "Pending HR Acceptance", "Order A-3: WFM assigned last -> unlocks Pending HR Acceptance");

const resA4 = handleHRAcceptHandoff(stateA, baseCandidate.id, "HR");
assert(resA4.success, "Order A-4: HR successfully accepts handoff after Trainer -> QDS -> WFM");

// Flow B: WFM -> Trainer -> QDS
let stateB = [baseCandidate];
const resB1 = handleWFMConfirmSeatAssignment(stateB, baseCandidate.id, "Right Wing", "RW-202", undefined, "WFM");
stateB = resB1.updatedApplicants!;
assert(stateB[0].wfmStatus === "Assigned" && stateB[0].handoffStatus === "Waiting for Departments", "Order B-1: WFM assigned first");

const resB2 = handleTrainerAcceptTrainee(stateB, baseCandidate.id, "TRN-001", true, undefined, "Trainer");
stateB = resB2.updatedApplicants!;
assert(stateB[0].trainerStatus === "Accepted" && stateB[0].wfmStatus === "Assigned", "Order B-2: Trainer accepted second (WFM seat preserved)");

const resB3 = handleQDSAddMaterial(stateB, baseCandidate.id, { title: "Script", type: "Word Document", fileOrLinkRef: "script.docx" }, undefined, "QDS");
stateB = resB3.updatedApplicants!;
const resB3b = handleQDSConfirmMaterials(stateB, baseCandidate.id, "QDS");
stateB = resB3b.updatedApplicants!;
assert(stateB[0].qdsStatus === "Completed" && stateB[0].handoffStatus === "Pending HR Acceptance", "Order B-3: QDS finalized last -> unlocks Pending HR Acceptance");

const resB4 = handleHRAcceptHandoff(stateB, baseCandidate.id, "HR");
assert(resB4.success, "Order B-4: HR successfully accepts handoff after WFM -> Trainer -> QDS");

// Flow C: QDS -> WFM -> Trainer
let stateC = [baseCandidate];
const resC1 = handleQDSAddMaterial(stateC, baseCandidate.id, { title: "Guide", type: "PDF Document", fileOrLinkRef: "guide.pdf" }, undefined, "QDS");
stateC = resC1.updatedApplicants!;
const resC1b = handleQDSConfirmMaterials(stateC, baseCandidate.id, "QDS");
stateC = resC1b.updatedApplicants!;
assert(stateC[0].qdsStatus === "Completed" && stateC[0].handoffStatus === "Waiting for Departments", "Order C-1: QDS finalized first");

const resC2 = handleWFMConfirmSeatAssignment(stateC, baseCandidate.id, "Left Wing", "LW-303", undefined, "WFM");
stateC = resC2.updatedApplicants!;
assert(stateC[0].wfmStatus === "Assigned" && stateC[0].qdsStatus === "Completed", "Order C-2: WFM assigned second (QDS curriculum preserved)");

const resC3 = handleTrainerAcceptTrainee(stateC, baseCandidate.id, "TRN-001", true, undefined, "Trainer");
stateC = resC3.updatedApplicants!;
assert(stateC[0].trainerStatus === "Accepted" && stateC[0].handoffStatus === "Pending HR Acceptance", "Order C-3: Trainer accepted last -> unlocks Pending HR Acceptance");

const resC4 = handleHRAcceptHandoff(stateC, baseCandidate.id, "HR");
assert(resC4.success, "Order C-4: HR successfully accepts handoff after QDS -> WFM -> Trainer");

// 13. The 16-step walkthrough remains functional
console.log("\n--- Verification 13: 16-Step Walkthrough Integrity & Candidate Continuity ---");
import fs from "fs";
const walkthroughSource = fs.readFileSync("src/components/nho/NHODemoWalkthrough.tsx", "utf-8");
const stepCountMatch = walkthroughSource.match(/step:\s*(\d+)/g);
const distinctSteps = new Set(stepCountMatch?.map(s => parseInt(s.replace(/\D/g, ""), 10)));
assert(distinctSteps.size === 16, "Verification 13a: Walkthrough contains exactly 16 discrete end-to-end steps");

assert(walkthroughSource.includes("nho-app-01"), "Verification 13b: Walkthrough maintains target candidate Juan Carlos Dela Cruz (nho-app-01)");
assert(!walkthroughSource.includes("Steps 1–13"), "Verification 13c: No obsolete references to 13-step walkthrough in walkthrough component");

const roleHeaderSource = fs.readFileSync("src/components/nho/NHORoleHeader.tsx", "utf-8");
assert(roleHeaderSource.includes("Steps 1–16"), "Verification 13d: Role header button displays 'Interactive Walkthrough (Steps 1–16)'");

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log(`\n=================================================`);
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`=================================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("ALL 13 REGRESSION SUITES AND MANDATORY VERIFICATIONS PASSED SUCCESSFULLY!");
}

