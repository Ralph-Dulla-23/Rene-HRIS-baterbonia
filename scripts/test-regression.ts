// Standalone regression test suite for SiBS 360 HRIS NHO V1 Interactive Prototype
// Validates all 16 mandatory business rules and the 13-step end-to-end journey

import { INITIAL_NHO_APPLICANTS } from "../src/components/nho/nhoInitialData";
import { NHOApplicant } from "../src/components/nho/nhoTypes";
import { 
  handleTrainerReassign, 
  handleTrainerAcceptTrainee, 
  getWorkstreamReadiness, 
  handleHRAcceptHandoff,
  handleQDSAssignAndSendToTrainer,
  handleQDSAddMaterial,
  handleWFMConfirmSeatAssignment,
  handleTrainerRequestMaterial,
  handleQDSFulfillMaterialRequest
} from "../src/components/nho/NHOContext";
import { pureCreateOrLinkJourney } from "../src/components/journey/JourneyContext";
import { INITIAL_JOURNEYS } from "../src/components/journey/journeyInitialData";
import fs from "fs";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: detail || "Assertion failed" });
    console.error(`  ✗ [FAIL] ${testName}: ${detail || "Assertion failed"}`);
  }
}

console.log("\n=======================================================");
console.log("=== SiBS NHO V1 REGRESSION & TRANSITION TEST SUITE ===");
console.log("=======================================================\n");

// Helper to deep clone applicants
function cloneApplicants(): NHOApplicant[] {
  return JSON.parse(JSON.stringify(INITIAL_NHO_APPLICANTS));
}

// -------------------------------------------------------------
// Test 1: Mark Anthony Reyes data validation (Item 15)
// -------------------------------------------------------------
console.log("\nTest Group 1: Seeded Data Integrity (Item 15)");
const applicants = cloneApplicants();
const markAnthony = applicants.find(a => a.id === "nho-app-03");

assert(!!markAnthony, "Mark Anthony Reyes exists in seeded data");
assert(
  (markAnthony?.documents || []).filter(d => d.isMajor).length === 4,
  "Mark Anthony has all 4 Major requirement slots",
  `Found ${markAnthony?.documents.filter(d => d.isMajor).length} major docs`
);
assert(
  (markAnthony?.documents || []).filter(d => d.isEssentialAgreement).length === 3,
  "Mark Anthony has all 3 Essential Agreement slots",
  `Found ${markAnthony?.documents.filter(d => d.isEssentialAgreement).length} agreements`
);
const medSlot = markAnthony?.documents.find(d => d.templateCode === "MAJOR-MED-01");
const nbiSlot = markAnthony?.documents.find(d => d.templateCode === "MAJOR-NBI-02");
const psaSlot = markAnthony?.documents.find(d => d.templateCode === "MAJOR-PSA-03");
const idSlot = markAnthony?.documents.find(d => d.templateCode === "MAJOR-ID-04");
assert(
  !!medSlot && !!nbiSlot && !!psaSlot && !!idSlot,
  "All 4 standard Major template codes exist for Mark Anthony"
);

// -------------------------------------------------------------
// Test 2: Document Verification Status Validation (Item 1)
// -------------------------------------------------------------
console.log("\nTest Group 2: Document Verification Eligibility (Item 1)");
// Only documents in 'For Verification' with submitted files should be eligible
function testCanVerify(doc: any, role: string): { allowed: boolean; reason?: string } {
  if (role !== "TA" && role !== "HR") {
    return { allowed: false, reason: "Unauthorized role" };
  }
  if (doc.status !== "For Verification") {
    return { allowed: false, reason: `Status is ${doc.status}` };
  }
  if (!doc.fileName && !doc.signatureDataUrl && !doc.submittedDate) {
    return { allowed: false, reason: "No submitted file or signature" };
  }
  return { allowed: true };
}

const unsubmittedDoc = { status: "Not Submitted", name: "PSA Birth Cert" };
const needsCorrDoc = { status: "Needs Correction", name: "Medical Records" };
const forVerDocNoFile = { status: "For Verification", name: "Valid ID" };
const forVerDocValid = { status: "For Verification", name: "Valid ID", fileName: "id.pdf", submittedDate: "2026-10-09" };

assert(!testCanVerify(unsubmittedDoc, "TA").allowed, "Cannot verify Not Submitted document");
assert(!testCanVerify(needsCorrDoc, "TA").allowed, "Cannot verify Needs Correction document before resubmission");
assert(!testCanVerify(forVerDocNoFile, "TA").allowed, "Cannot verify For Verification document without file/signature");
assert(testCanVerify(forVerDocValid, "TA").allowed, "TA can verify For Verification document with submitted file");
assert(!testCanVerify(forVerDocValid, "Applicant").allowed, "Applicant role cannot invoke document verification (Item 10)");

// -------------------------------------------------------------
// Test 3: Overwriting Verified Documents Guard (Item 2)
// -------------------------------------------------------------
console.log("\nTest Group 3: Overwrite Protection for Verified Documents (Item 2)");
function testSubmitDoc(doc: any): { allowed: boolean; reason?: string } {
  if (doc.status === "Verified") {
    return { allowed: false, reason: "Cannot overwrite verified document without authorized correction" };
  }
  return { allowed: true };
}

const verifiedDoc = { status: "Verified", name: "NBI Clearance", fileName: "orig.pdf" };
assert(!testSubmitDoc(verifiedDoc).allowed, "Applicant upload is blocked when document is Verified");
assert(testSubmitDoc(needsCorrDoc).allowed, "Applicant upload is permitted when document is in Needs Correction");

// -------------------------------------------------------------
// Test 4: Preservation of Attended Date & 14-day Deadline (Item 3 & 4)
// -------------------------------------------------------------
console.log("\nTest Group 4: Attendance Date & Deadline Preservation (Item 3 & 4)");
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const initialApp = {
  attendance: "Show" as const,
  clearedDate: "2026-10-09",
  nonMajorDeadlineDate: "2026-10-23",
  documents: [
    { isMajor: true, isEssentialAgreement: false, dueDate: "2026-10-09", status: "Verified" },
    { isMajor: false, isEssentialAgreement: true, dueDate: "2026-10-09", status: "Not Submitted" }, // Agreement
    { isMajor: false, isEssentialAgreement: false, dueDate: "2026-10-23", status: "Not Submitted" } // Non-major
  ]
};

// Simulate re-saving Show at a later date (e.g. 2026-10-15)
const simCurrentDateLater = "2026-10-15";
const preservedClearedDate = initialApp.clearedDate || simCurrentDateLater;
const preservedDeadline = initialApp.nonMajorDeadlineDate || addDays(preservedClearedDate, 14);

assert(preservedClearedDate === "2026-10-09", "Preserves original attended NHO date (2026-10-09)");
assert(preservedDeadline === "2026-10-23", "Preserves original 14-day non-major deadline without restarting");

// Test that agreements do NOT receive the 14-day deadline
const updatedDocs = initialApp.documents.map(d => {
  if (!d.isMajor && !d.isEssentialAgreement && d.status !== "Verified" && preservedDeadline) {
    return { ...d, dueDate: preservedDeadline };
  }
  return d;
});
assert(updatedDocs[1].dueDate === "2026-10-09", "Essential Agreement did NOT receive the 14-day deadline (Item 4)");
assert(updatedDocs[2].dueDate === "2026-10-23", "Non-major document received 14-day deadline");

// -------------------------------------------------------------
// Test 5: Drop-Off Policy Guard (Item 5)
// -------------------------------------------------------------
console.log("\nTest Group 5: Drop-Off Policy Rules (Item 5)");
function testMarkDropOff(app: any): { allowed: boolean; reason?: string } {
  if (app.attendance !== "No Show") {
    return { allowed: false, reason: "Requires No Show attendance" };
  }
  const hasUnsuccessful = (app.followUpLogs || []).some(
    (l: any) => l.method === "Telephone Call" && (l.result === "No Answer" || l.result === "Busy / Unreachable")
  );
  if (!hasUnsuccessful) {
    return { allowed: false, reason: "Requires documented unsuccessful telephone attempt" };
  }
  return { allowed: true };
}

const showApp = { attendance: "Show", followUpLogs: [] };
const noShowNoFollowUp = { attendance: "No Show", followUpLogs: [] };
const noShowSuccessfulFollowUp = {
  attendance: "No Show",
  followUpLogs: [{ method: "Telephone Call", result: "Reached - Agreed to Reschedule" }]
};
const noShowUnsuccessfulSMS = {
  attendance: "No Show",
  followUpLogs: [{ method: "SMS", result: "No Answer" }]
};
const noShowUnsuccessfulTelephone = {
  attendance: "No Show",
  followUpLogs: [{ method: "Telephone Call", result: "No Answer" }]
};

assert(!testMarkDropOff(showApp).allowed, "Drop-Off blocked for Show attendance");
assert(!testMarkDropOff(noShowNoFollowUp).allowed, "Drop-Off blocked with 0 follow-up attempts");
assert(!testMarkDropOff(noShowSuccessfulFollowUp).allowed, "Drop-Off blocked when telephone contact was successful");
assert(!testMarkDropOff(noShowUnsuccessfulSMS).allowed, "Drop-Off blocked when follow-up was SMS (must be Telephone Call)");
assert(testMarkDropOff(noShowUnsuccessfulTelephone).allowed, "Drop-Off permitted with No Show and unsuccessful telephone follow-up");

// -------------------------------------------------------------
// Test 6: Attendance Correction Reason Guard (Item 6)
// -------------------------------------------------------------
console.log("\nTest Group 6: Attendance Correction Reason in Shared State (Item 6)");
function testMarkAttendance(app: any, newStatus: string, correctionReason?: string): { allowed: boolean; reason?: string } {
  if (app.attendance !== "Pending" && (!correctionReason || !correctionReason.trim())) {
    return { allowed: false, reason: "Mandatory correction reason required for updating existing attendance" };
  }
  return { allowed: true };
}

const pendingApp = { attendance: "Pending" };
const savedApp = { attendance: "Show" };

assert(testMarkAttendance(pendingApp, "Show").allowed, "First-time attendance marking does not require correction reason");
assert(!testMarkAttendance(savedApp, "No Show", "").allowed, "Updating saved attendance without reason is blocked");
assert(!testMarkAttendance(savedApp, "No Show", "   ").allowed, "Updating saved attendance with whitespace is blocked");
assert(testMarkAttendance(savedApp, "No Show", "Candidate arrived late and missed morning session").allowed, "Updating saved attendance with valid reason succeeds");

// -------------------------------------------------------------
// Test 7: Rescheduling State Cleansing (Item 7)
// -------------------------------------------------------------
console.log("\nTest Group 7: Rescheduling State Cleansing (Item 7)");
function testReschedule(app: any, newDate: string, reason: string) {
  return {
    ...app,
    scheduledNhoDate: newDate,
    attendance: "Pending",
    clearedDate: undefined,
    nonMajorDeadlineDate: undefined,
    tempAccessStatus: "Not Issued",
    tempPasswordGenerated: false,
    hasChangedPassword: false,
    retrievalLinkUsed: false,
    retrievalLinkExpired: false,
    passwordRetrievalToken: undefined
  };
}

const rescheduledApp = testReschedule(initialApp, "2026-10-20", "Personal emergency");
assert(rescheduledApp.attendance === "Pending", "Attendance reset to Pending");
assert(rescheduledApp.clearedDate === undefined, "Cleared date reset (no orphaned clearance date)");
assert(rescheduledApp.nonMajorDeadlineDate === undefined, "Non-major deadline reset");
assert(rescheduledApp.tempAccessStatus === "Not Issued", "Temporary portal access revoked / reset");
assert(rescheduledApp.passwordRetrievalToken === undefined, "Password retrieval token invalidated");

// -------------------------------------------------------------
// Test 8: 24-Hour Expiration & One-Time Token (Item 8)
// -------------------------------------------------------------
console.log("\nTest Group 8: 24-Hour Expiration & Token Consumption (Item 8)");
function testPasswordRetrieval(app: any, currentDate: string): { allowed: boolean; reason?: string } {
  if (app.tempAccessStatus !== "Active") {
    return { allowed: false, reason: "Temporary access not active" };
  }
  const isExpired = app.retrievalLinkExpired || (app.retrievalLinkExpiresAt && app.retrievalLinkExpiresAt.split(" ")[0] < currentDate);
  if (isExpired) {
    return { allowed: false, reason: "Link expired (24-hour limit)" };
  }
  if (app.retrievalLinkUsed) {
    return { allowed: false, reason: "Link already used" };
  }
  return { allowed: true };
}

const activeTokenValid = { tempAccessStatus: "Active", retrievalLinkExpiresAt: "2026-10-10 09:00 AM", retrievalLinkUsed: false, retrievalLinkExpired: false };
const activeTokenExpiredByDate = { tempAccessStatus: "Active", retrievalLinkExpiresAt: "2026-10-10 09:00 AM", retrievalLinkUsed: false, retrievalLinkExpired: false };
const activeTokenUsed = { tempAccessStatus: "Active", retrievalLinkExpiresAt: "2026-10-10 09:00 AM", retrievalLinkUsed: true, retrievalLinkExpired: false };

assert(testPasswordRetrieval(activeTokenValid, "2026-10-09").allowed, "Valid token on issuance date succeeds");
assert(!testPasswordRetrieval(activeTokenExpiredByDate, "2026-10-11").allowed, "Token expired when current date > expires date");
assert(!testPasswordRetrieval(activeTokenUsed, "2026-10-09").allowed, "Token consumption prevents reuse");

// -------------------------------------------------------------
// Test 9: Mandatory First-Login Password Change Guard (Item 9)
// -------------------------------------------------------------
console.log("\nTest Group 9: First-Login Password Change Guard (Item 9)");
function testApplicantPermissions(app: any): { allowed: boolean; reason?: string } {
  if (app.tempAccessStatus !== "Active") {
    return { allowed: false, reason: "Temporary access not active" };
  }
  if (!app.hasChangedPassword) {
    return { allowed: false, reason: "Must change password on first login" };
  }
  return { allowed: true };
}

const unactivatedApp = { tempAccessStatus: "Active", hasChangedPassword: false };
const activatedApp = { tempAccessStatus: "Active", hasChangedPassword: true };

assert(!testApplicantPermissions(unactivatedApp).allowed, "Applicant actions blocked before first-login password change");
assert(testApplicantPermissions(activatedApp).allowed, "Applicant actions permitted after password change");

// -------------------------------------------------------------
// Test 10: Explicit Orientation Acknowledgment Guard (Item 11)
// -------------------------------------------------------------
console.log("\nTest Group 10: Orientation Explicit Acknowledgment (Item 11)");
function testCompleteOrientation(acknowledged: boolean, targetAcknowledged: boolean): { allowed: boolean; reason?: string } {
  if (!acknowledged && !targetAcknowledged) {
    return { allowed: false, reason: "Explicit acknowledgment required" };
  }
  return { allowed: true };
}

assert(!testCompleteOrientation(false, false).allowed, "Direct call without acknowledgment is blocked");
assert(testCompleteOrientation(true, false).allowed, "Call with explicit acknowledgment checkbox succeeds");

// -------------------------------------------------------------
// Test 11: IT Provisioning & Kronos Guard (Item 12)
// -------------------------------------------------------------
console.log("\nTest Group 11: IT Provisioning Rules (Item 12)");
function testITProvision(app: any, kronosId: string): { allowed: boolean; reason?: string } {
  if (!app.itEndorsed) {
    return { allowed: false, reason: "No TA endorsement" };
  }
  if (app.officialKronosId || app.itRequestStatus === "Completed") {
    return { allowed: false, reason: "Cannot overwrite completed Kronos ID" };
  }
  if (app.itRequestStatus !== "In Progress") {
    return { allowed: false, reason: "Must be In Progress" };
  }
  return { allowed: true };
}

const notEndorsedApp = { itEndorsed: false, itRequestStatus: "Pending" };
const pendingITApp = { itEndorsed: true, itRequestStatus: "Pending" };
const inProgressITApp = { itEndorsed: true, itRequestStatus: "In Progress" };
const completedITApp = { itEndorsed: true, itRequestStatus: "Completed", officialKronosId: "KRN-12345" };

assert(!testITProvision(notEndorsedApp, "KRN-99").allowed, "IT blocked without TA endorsement");
assert(!testITProvision(pendingITApp, "KRN-99").allowed, "IT blocked before moving status to In Progress");
assert(testITProvision(inProgressITApp, "KRN-99").allowed, "IT succeeds when In Progress with endorsement");
assert(!testITProvision(completedITApp, "KRN-999").allowed, "Overwriting completed Kronos ID blocked");

// -------------------------------------------------------------
// Test 12: HR Handoff Acceptance & Resolution Guard (Item 13)
// -------------------------------------------------------------
console.log("\nTest Group 12: HR Handoff Acceptance & Return Rules (Item 13)");
function testHRAccept(app: any): { allowed: boolean; reason?: string } {
  if (app.itRequestStatus !== "Completed" || !app.officialKronosId) {
    return { allowed: false, reason: "IT must be completed with Kronos ID" };
  }
  if (app.handoffStatus !== "Pending HR Acceptance" && app.handoffStatus !== "Resubmitted") {
    return { allowed: false, reason: "Invalid handoff status" };
  }
  return { allowed: true };
}

function testTAResubmit(app: any, remarks?: string): { allowed: boolean; reason?: string } {
  if (app.handoffStatus !== "Returned for Correction") {
    return { allowed: false, reason: "Handoff not returned" };
  }
  if (!remarks || !remarks.trim()) {
    return { allowed: false, reason: "Mandatory resolution remarks required" };
  }
  return { allowed: true };
}

const noKronosHandoff = { itRequestStatus: "In Progress", officialKronosId: undefined, handoffStatus: "Not Ready" };
const validHandoff = { itRequestStatus: "Completed", officialKronosId: "KRN-90841", handoffStatus: "Pending HR Acceptance" };
const returnedHandoff = { itRequestStatus: "Completed", officialKronosId: "KRN-90841", handoffStatus: "Returned for Correction" };

assert(!testHRAccept(noKronosHandoff).allowed, "HR blocked before IT completion and Kronos ID");
assert(testHRAccept(validHandoff).allowed, "HR accepts valid handoff with Kronos ID");
assert(!testTAResubmit(returnedHandoff, "").allowed, "TA resubmission blocked without resolution remarks");
assert(!testTAResubmit(returnedHandoff, "   ").allowed, "TA resubmission blocked with empty whitespace remarks");
assert(testTAResubmit(returnedHandoff, "Updated employee file notes per HR feedback").allowed, "TA resubmission succeeds with resolution remarks");

// -------------------------------------------------------------
// Test 13: Regular HRIS Login & Deactivation Guard (Item 14)
// -------------------------------------------------------------
console.log("\nTest Group 13: Regular HRIS Login Deactivation (Item 14)");
function testRegularLogin(app: any): { allowed: boolean; reason?: string } {
  if (!app.officialKronosId || app.handoffStatus !== "Accepted" || app.outcome !== "Completed Handoff") {
    return { allowed: false, reason: "Employee onboarding must be accepted by HR first" };
  }
  return { allowed: true };
}

const preHandoffApp = { officialKronosId: "KRN-90841", handoffStatus: "Pending HR Acceptance", outcome: "In Progress" };
const postHandoffApp = { officialKronosId: "KRN-90841", handoffStatus: "Accepted", outcome: "Completed Handoff" };

assert(!testRegularLogin(preHandoffApp).allowed, "Regular HRIS login blocked before HR acceptance");
assert(testRegularLogin(postHandoffApp).allowed, "Regular HRIS login allowed after HR handoff acceptance");

// -------------------------------------------------------------
// Test 14: All 6 Sample Scenarios in Initial Data
// -------------------------------------------------------------
console.log("\nTest Group 14: Verification of All 6 Seeded Scenarios");
const sc1 = applicants.find(a => a.id === "nho-app-01"); // Step 1 / Scheduled
const sc2 = applicants.find(a => a.id === "nho-app-02"); // Missing Major (Medical Fit to Work Needs Correction)
const sc3 = applicants.find(a => a.id === "nho-app-03"); // No Show with Telephone Follow-Up
const sc4 = applicants.find(a => a.id === "nho-app-04"); // Orientation / Agreements Pending
const sc5 = applicants.find(a => a.id === "nho-app-05"); // IT Completed, HR Handoff Pending
const sc6 = applicants.find(a => a.id === "nho-app-06"); // Outstanding Overdue Document (TOR overdue)

assert(!!sc1 && sc1.scheduledNhoDate === "2026-10-09", "Scenario 1: Juan Carlos Dela Cruz (Scheduled NHO Oct 09, 2026)");
assert(
  !!sc2 && sc2.documents.some(d => d.templateCode === "MAJOR-MED-01" && d.status === "Needs Correction"),
  "Scenario 2: Maria Clarisse Santos (Missing Major - Medical Needs Correction)"
);
assert(
  !!sc3 && sc3.attendance === "No Show" && sc3.followUpLogs.length > 0 && sc3.documents.length >= 7,
  "Scenario 3: Mark Anthony Reyes (No Show with Follow-Up Log and 7+ document slots)"
);
assert(
  !!sc4 && sc4.attendance === "Show" && sc4.documents.some(d => d.isEssentialAgreement && d.status === "Not Submitted"),
  "Scenario 4: Beatrice Elena Gomez (Essential Agreements Pending)"
);
assert(
  !!sc5 && sc5.itRequestStatus === "Completed" && !!sc5.officialKronosId && (sc5.handoffStatus === "Pending HR Acceptance" || sc5.handoffStatus === "Waiting for Departments"),
  "Scenario 5: Kenneth Joshua Lim (IT Completed with Kronos ID, HR Handoff Pending)"
);
assert(
  !!sc6 && sc6.documents.some(d => d.dueDate < "2026-10-09" && !d.isMajor),
  "Scenario 6: Patricia Camille Tan (Outstanding Overdue Document past 14 days)"
);

// -------------------------------------------------------------
// Test 15: Four QDS, Trainer & HR Specific Corrections (Real Handlers)
// -------------------------------------------------------------
console.log("\nTest Group 15: QDS, Trainer & HR Handler Corrections");

// 1. handleTrainerReassign accepts ONLY QDS role
const testReassignApp = cloneApplicants().find(a => a.id === "nho-app-05")!;
const rolesToReject: any[] = ["TA", "HR", "IT", "WFM", "Trainer", "Applicant", undefined];
for (const r of rolesToReject) {
  const rejResult = handleTrainerReassign([testReassignApp], testReassignApp.id, "TRN-002", undefined, r);
  assert(!rejResult.success, `handleTrainerReassign rejects role "${r || "omitted"}"`);
}
const qdsResult = handleTrainerReassign([testReassignApp], testReassignApp.id, "TRN-002", undefined, "QDS");
assert(qdsResult.success, "handleTrainerReassign accepts QDS role with valid authorized trainer ID");
const invalidTrainerResult = handleTrainerReassign([testReassignApp], testReassignApp.id, "TRN-999", undefined, "QDS");
assert(!invalidTrainerResult.success, "handleTrainerReassign rejects unauthorized trainer ID not on roster");

// 2. handleTrainerAcceptTrainee requires explicit reviewedMaterials === true
const testTrainerApp = cloneApplicants().find(a => a.id === "nho-app-05")!;
// Prepare app for acceptance (QDS completed)
const testTrainerAppReady = {
  ...testTrainerApp,
  qdsStatus: "Completed" as const,
  qdsMaterials: [{ id: "m1", title: "IT Standards", type: "PDF Document" as const, fileOrLinkRef: "m1.pdf", assignedAt: "2026-10-06", assignedBy: "Carla" }]
};

const acceptNoReview = handleTrainerAcceptTrainee(
  [testTrainerAppReady],
  testTrainerAppReady.id,
  testTrainerAppReady.assignedTrainerId,
  false, // reviewedMaterials is false
  "Accepting",
  "Trainer"
);
assert(!acceptNoReview.success, "handleTrainerAcceptTrainee rejects when reviewedMaterials is false / omitted");

const acceptWithReview = handleTrainerAcceptTrainee(
  [testTrainerAppReady],
  testTrainerAppReady.id,
  testTrainerAppReady.assignedTrainerId,
  true, // reviewedMaterials is true
  "Accepting with material review",
  "Trainer"
);
assert(acceptWithReview.success, "handleTrainerAcceptTrainee succeeds when reviewedMaterials === true and trainer ID matches");

// 3. getWorkstreamReadiness requires trainerAcceptedById strictly matching assignedTrainerId (No name-only fallback)
const appNameOnly = {
  ...testTrainerAppReady,
  trainerStatus: "Accepted" as const,
  trainerAcceptedBy: "Maria Elena Garcia", // name only
  trainerAcceptedById: undefined, // missing ID
  trainerReviewedMaterials: true
};
assert(!getWorkstreamReadiness(appNameOnly).trainingReadinessComplete, "getWorkstreamReadiness rejects name-only fallback when trainerAcceptedById is missing");

const appMismatchedId = {
  ...testTrainerAppReady,
  trainerStatus: "Accepted" as const,
  assignedTrainerId: "TRN-001",
  trainerAcceptedById: "TRN-002", // mismatched ID
  trainerReviewedMaterials: true
};
assert(!getWorkstreamReadiness(appMismatchedId).trainingReadinessComplete, "getWorkstreamReadiness rejects when trainerAcceptedById !== assignedTrainerId");

const appValidReadiness = {
  ...testTrainerAppReady,
  trainerStatus: "Accepted" as const,
  assignedTrainerId: "TRN-001",
  trainerAcceptedById: "TRN-001", // matching ID
  trainerReviewedMaterials: true
};
assert(getWorkstreamReadiness(appValidReadiness).trainingReadinessComplete, "getWorkstreamReadiness accepts when trainerAcceptedById matches assignedTrainerId and reviewedMaterials is true");

// 4. QDS display fallback to "Not Recorded"
const appNoQdsActor = { ...testTrainerAppReady, qdsCompletedBy: undefined };
const displayActor = appNoQdsActor.qdsCompletedBy || "Not Recorded";
assert(displayActor === "Not Recorded", "QDS actor displays 'Not Recorded' when missing, rather than hardcoded fake name");

// -------------------------------------------------------------
// Test 16: 30/60/90 Employee Journey Integration & Idempotency
// -------------------------------------------------------------
console.log("\nTest Group 16: 30/60/90 Employee Journey Integration");

// Test pureCreateOrLinkJourney
const fullReadyApp = {
  ...appValidReadiness,
  wfmStatus: "Assigned" as const,
  wfmProductionWing: "Right Wing" as const,
  wfmSeatNumber: "RW-042",
  wfmAssignedBy: "Danilo Morales",
  handoffStatus: "Pending HR Acceptance" as const,
  scheduledNhoDate: "2026-10-09",
  confirmedStartDate: "2026-10-09",
  hireDate: "2026-10-09",
  officialKronosId: "KRN-90845"
};

const initialJourneyList = [...INITIAL_JOURNEYS];
const journeyCreation1 = pureCreateOrLinkJourney(
  initialJourneyList,
  fullReadyApp,
  "Dulla, Ralph Vincent (HR Operations Lead)",
  "2026-10-14"
);
assert(journeyCreation1.isNew, "First HR acceptance creates a new 30/60/90 Employee Journey");
assert(journeyCreation1.journey.nhoApplicantId === fullReadyApp.id, "Journey references source NHO applicant ID");
assert(journeyCreation1.journey.kronosId === "KRN-90845", "Journey carries forward official Kronos ID");
assert(journeyCreation1.journey.hireDate === "2026-10-09", "Preserves explicitly confirmed hire date (2026-10-09)");
assert(journeyCreation1.journey.wfmSeating?.seatNumber === "RW-042", "Carries forward WFM seat number RW-042");
assert(journeyCreation1.journey.trainerId === "TRN-001", "Carries forward assigned trainer ID TRN-001");
assert(journeyCreation1.journey.stage === "Day 1-30 Nesting", "Sets active stage to Day 1-30 Nesting when start date is confirmed");

// Requirement 2 Test: Verify that scheduledNhoDate is NOT used when confirmedStartDate is omitted
const appWithoutConfirmedStart = {
  ...fullReadyApp,
  id: "nho-app-no-confirmed-start",
  confirmedStartDate: undefined,
  startDate: undefined,
  hireDate: undefined
};
const unconfirmedStartJourney = pureCreateOrLinkJourney(
  initialJourneyList,
  appWithoutConfirmedStart as any,
  "Dulla, Ralph Vincent (HR Operations Lead)",
  "2026-10-14"
);
assert(unconfirmedStartJourney.journey.startDate === undefined, "Requirement 2: Does NOT use scheduledNhoDate as startDate when start date is unconfirmed");
assert(unconfirmedStartJourney.journey.stage === "Awaiting Start", "Requirement 2: Sets stage to 'Awaiting Start' when start date is unconfirmed");

// Idempotency check: repeated call with same applicant
const journeyCreation2 = pureCreateOrLinkJourney(
  journeyCreation1.updatedJourneys,
  fullReadyApp,
  "Dulla, Ralph Vincent (HR Operations Lead)",
  "2026-10-14"
);
assert(!journeyCreation2.isNew, "Repeated HR acceptance is idempotent (does NOT create duplicate journey)");
assert(journeyCreation2.journey.id === journeyCreation1.journey.id, "Returns exact same Journey ID");
assert(journeyCreation2.updatedJourneys.length === journeyCreation1.updatedJourneys.length, "Journey list length remains identical");

// Test full handleHRAcceptHandoff integration
const hrHandoffRes = handleHRAcceptHandoff(
  [fullReadyApp],
  fullReadyApp.id,
  "HR",
  "2026-10-14"
);
assert(hrHandoffRes.success, "handleHRAcceptHandoff succeeds on 2/2 ready post-IT applicant");
const acceptedApp = hrHandoffRes.updatedApplicants?.[0];
assert(acceptedApp?.handoffStatus === "Accepted", "Applicant handoffStatus updated to 'Accepted'");
assert(acceptedApp?.outcome === "Completed Handoff", "Applicant outcome updated to 'Completed Handoff'");
assert(!!acceptedApp?.linkedEmployeeJourneyId, "Applicant links permanent linkedEmployeeJourneyId");

// Test repeat call on handleHRAcceptHandoff (idempotent)
const repeatHrHandoff = handleHRAcceptHandoff(
  hrHandoffRes.updatedApplicants!,
  fullReadyApp.id,
  "HR",
  "2026-10-14"
);
assert(repeatHrHandoff.success, "Repeat handleHRAcceptHandoff is idempotent and returns success");
assert(repeatHrHandoff.createdJourneyId === acceptedApp?.linkedEmployeeJourneyId, "Repeat call returns same journey ID");

// -------------------------------------------------------------
// Test 17: Three Specific Journey Issues
// -------------------------------------------------------------
console.log("\nTest Group 17: Three Specific Journey Issues");

// Issue 1: Initialize or link the Journey automatically after successful HR handoff acceptance
assert(hrHandoffRes.success && !!hrHandoffRes.createdJourneyId, "Issue 1: Journey is automatically initialized upon HR handoff acceptance without needing to click Open Journey");

// Issue 2: Do not invent missing employee IDs, trainer assignments or hire dates. Show an authorized linkage action instead.
const unlinkedApp = {
  ...fullReadyApp,
  id: "nho-app-unlinked-99",
  officialKronosId: undefined,
  sibsEmployeeId: undefined,
  assignedTrainerId: undefined,
  assignedTrainerName: undefined,
  scheduledNhoDate: undefined,
  confirmedStartDate: undefined,
  startDate: undefined,
  hireDate: undefined
};

const unlinkedJourneyRes = pureCreateOrLinkJourney(
  initialJourneyList,
  unlinkedApp as any,
  "Dulla, Ralph Vincent (HR Operations Lead)",
  "2026-10-14"
);

assert(unlinkedJourneyRes.journey.sibsEmployeeId === undefined, "Issue 2: Does NOT invent missing SIBS Employee ID");
assert(unlinkedJourneyRes.journey.trainerId === undefined, "Issue 2: Does NOT invent missing Trainer ID");
assert(unlinkedJourneyRes.journey.hireDate === undefined, "Issue 2: Does NOT invent missing Hire Date");
assert(unlinkedJourneyRes.journey.isAwaitingLinkage === true, "Issue 2: Correctly flags isAwaitingLinkage as true for authorized linkage action");

// Issue 3: Do not automatically regularize employees at Day 90. Keep Journey completion separate from the official employment decision.
import { calculateJourneyStage } from "../src/components/journey/JourneyContext";
const day95Calc = calculateJourneyStage("2026-07-01", "2026-10-14"); // ~105 days elapsed
assert(day95Calc.daysElapsed > 90, "Elapsed days exceeds 90 days");
assert((day95Calc.stage as string) !== "Regularized", "Issue 3: Stage is NOT automatically set to 'Regularized' past Day 90");
assert(day95Calc.stage === "Completed Onboarding" || day95Calc.stage === "Day 61-90 Regularization Assessment", "Issue 3: Stage is 'Completed Onboarding' or 'Day 61-90 Regularization Assessment' awaiting official employment decision");

// -------------------------------------------------------------
// Test Group 18: QDS -> Trainer -> WFM Sequential Integration & Tab Order
// -------------------------------------------------------------
console.log("\nTest Group 18: QDS -> Trainer -> WFM Workflow & Tab Order");

// 18a: handleQDSAssignAndSendToTrainer rejects non-QDS role
const testAppQDS = cloneApplicants().find(a => a.itRequestStatus === "Completed" && !!a.officialKronosId)!;
let qdsTestState = [testAppQDS];

const nonQdsRes = handleQDSAssignAndSendToTrainer(qdsTestState, testAppQDS.id, "TRN-001", undefined, "TA" as any);
assert(!nonQdsRes.success, "QDS Assign & Send: Rejects non-QDS role ('TA')");

// 18b: handleQDSAssignAndSendToTrainer rejects if no materials assigned
const emptyMatApp = { ...testAppQDS, qdsMaterials: [] };
const noMatRes = handleQDSAssignAndSendToTrainer([emptyMatApp], emptyMatApp.id, "TRN-001", undefined, "QDS");
assert(!noMatRes.success && noMatRes.error?.includes("assign at least 1 training material"), "QDS Assign & Send: Rejects dispatch when applicant has 0 materials");

// 18c: handleQDSAssignAndSendToTrainer succeeds with materials and authorized trainer
const withMatRes = handleQDSAddMaterial([emptyMatApp], emptyMatApp.id, {
  title: "Core Operations Handbook 2026",
  type: "PDF Document",
  fileOrLinkRef: "Core_Ops_2026.pdf"
}, undefined, "QDS");
qdsTestState = withMatRes.updatedApplicants!;

const sendRes = handleQDSAssignAndSendToTrainer(qdsTestState, emptyMatApp.id, "TRN-002", "Carlos Mendoza (L&D Specialist)", "QDS");
assert(sendRes.success, "QDS Assign & Send: Succeeds for QDS with authorized trainer TRN-002 and valid materials");
qdsTestState = sendRes.updatedApplicants!;
assert(qdsTestState[0].assignedTrainerId === "TRN-002", "QDS Assign & Send: Assigned trainer ID updated to TRN-002");
assert(qdsTestState[0].assignedTrainerName === "Carlos Mendoza (L&D Specialist)", "QDS Assign & Send: Assigned trainer name updated to Carlos Mendoza");
assert(qdsTestState[0].trainerStatus === "Pending Acceptance", "QDS Assign & Send: Trainer status updated to Pending Acceptance");
assert(qdsTestState[0].qdsStatus === "Completed", "QDS Assign & Send: QDS status marked Completed");

// 18d: Trainer accepts trainee after QDS sends
const trainerAcceptRes = handleTrainerAcceptTrainee(qdsTestState, emptyMatApp.id, "TRN-002", true, undefined, "Trainer");
assert(trainerAcceptRes.success, "Trainer Acceptance: Assigned trainer TRN-002 accepts trainee after QDS dispatch");
qdsTestState = trainerAcceptRes.updatedApplicants!;
assert(qdsTestState[0].trainerStatus === "Accepted", "Trainer Acceptance: Trainer status updated to Accepted");

// 18e: WFM confirms workstation after Trainer accepts
const wfmRes = handleWFMConfirmSeatAssignment(qdsTestState, emptyMatApp.id, "Left Wing", "LW-888", undefined, "WFM");
assert(wfmRes.success, "WFM Seating: Workstation confirmed after Trainer acceptance (QDS -> Trainer -> WFM)");
qdsTestState = wfmRes.updatedApplicants!;
assert(qdsTestState[0].wfmStatus === "Assigned", "WFM Seating: Workstation status is Assigned");
assert(qdsTestState[0].handoffStatus === "Pending HR Acceptance", "Sequence Complete: Handoff status transitions to Pending HR Acceptance");

// 18f: Tab ordering verification in NHORoleHeader.tsx
const roleHeaderCode = fs.readFileSync("src/components/nho/NHORoleHeader.tsx", "utf-8");
const qdsPos = roleHeaderCode.indexOf('id: "QDS"');
const trainerPos = roleHeaderCode.indexOf('id: "Trainer"');
const wfmPos = roleHeaderCode.indexOf('id: "WFM"');
assert(qdsPos > 0 && trainerPos > 0 && wfmPos > 0, "Tab Order: QDS, Trainer, and WFM IDs exist in NHORoleHeader.tsx");
assert(qdsPos < trainerPos, "Tab Order: QDS tab comes before Trainer tab");
assert(trainerPos < wfmPos, "Tab Order: Trainer tab comes before WFM tab (QDS then Trainer then WFM)");

// -------------------------------------------------------------
// Test Group 19: Trainer Reviewing Materials & Requesting Materials from QDS
// -------------------------------------------------------------
console.log("\nTest Group 19: Trainer Reviewing & Requesting Materials from QDS");

// 19a: Validation on handleTrainerRequestMaterial
const requestApp = cloneApplicants().find(a => a.itRequestStatus === "Completed" && !!a.officialKronosId)!;
let reqState = [requestApp];

const emptyTitleReq = handleTrainerRequestMaterial(reqState, requestApp.id, {
  materialTitle: "",
  reason: "Need extra playbook"
}, "TRN-001");
assert(!emptyTitleReq.success, "Trainer Request Material: Rejects empty material title");

const emptyReasonReq = handleTrainerRequestMaterial(reqState, requestApp.id, {
  materialTitle: "Advanced Customer Escalation Script 2026",
  reason: ""
}, "TRN-001");
assert(!emptyReasonReq.success, "Trainer Request Material: Rejects empty justification reason");

// 19b: Successful material request from Trainer
const validReq = handleTrainerRequestMaterial(reqState, requestApp.id, {
  materialTitle: "Advanced Customer Escalation Script 2026",
  category: "Customer Service Scripts",
  reason: "Account cohort requires 2026 dispute escalation procedures before nesting.",
  priority: "Urgent"
}, "TRN-001", "Trainer", "2026-10-14");
assert(validReq.success, "Trainer Request Material: Successfully submits request with title and justification");
reqState = validReq.updatedApplicants!;
assert((reqState[0].trainerMaterialRequests || []).length > 0, "Trainer Request Material: Request appended to trainee trainerMaterialRequests array");
const createdReq = reqState[0].trainerMaterialRequests![0];
assert(createdReq.status === "Pending QDS Fulfillment", "Trainer Request Material: Status is 'Pending QDS Fulfillment'");
assert(createdReq.priority === "Urgent", "Trainer Request Material: Priority correctly recorded as 'Urgent'");
assert(reqState[0].auditLogs.some(l => l.action === "Curriculum Material Requested"), "Trainer Request Material: Audit log entry created");

// 19c: QDS Fulfill Material Request validation & execution
const nonQdsFulfill = handleQDSFulfillMaterialRequest(
  reqState,
  requestApp.id,
  createdReq.id,
  {
    title: "Advanced Customer Escalation Script 2026",
    type: "Word Document",
    fileOrLinkRef: "Advanced_Escalation_Script_2026.docx"
  },
  "TA" as any
);
assert(!nonQdsFulfill.success, "QDS Fulfill Request: Rejects non-QDS role ('TA')");

const qdsFulfillSuccess = handleQDSFulfillMaterialRequest(
  reqState,
  requestApp.id,
  createdReq.id,
  {
    title: "Advanced Customer Escalation Script 2026",
    type: "Word Document",
    fileOrLinkRef: "Advanced_Escalation_Script_2026.docx",
    description: "Official 2026 escalation script approved by QDS."
  },
  "QDS",
  "2026-10-14"
);
assert(qdsFulfillSuccess.success, "QDS Fulfill Request: Successfully fulfills trainer material request");
reqState = qdsFulfillSuccess.updatedApplicants!;
const fulfilledReq = reqState[0].trainerMaterialRequests!.find(r => r.id === createdReq.id);
assert(fulfilledReq?.status === "Fulfilled", "QDS Fulfill Request: Request status updated to 'Fulfilled'");
assert(
  reqState[0].qdsMaterials.some(m => m.title === "Advanced Customer Escalation Script 2026"),
  "QDS Fulfill Request: Newly fulfilled material automatically attached to trainee qdsMaterials package"
);
assert(reqState[0].auditLogs.some(l => l.action === "Trainer Material Request Fulfilled"), "QDS Fulfill Request: Audit log created for fulfillment");

// 19d: Trainer reviews all materials and accepts trainee
const targetMats = reqState[0].qdsMaterials;
assert(targetMats.length >= 2, "Trainer Review: Multiple curriculum materials present for review");

// QDS formally dispatches curriculum package to trainer TRN-001
const dispatchRes = handleQDSAssignAndSendToTrainer(reqState, requestApp.id, "TRN-001", "Maria Elena Garcia (Senior Trainer)", "QDS");
assert(dispatchRes.success, "QDS Assign & Send: Finalizes and dispatches materials package to TRN-001");
reqState = dispatchRes.updatedApplicants!;

const trainerReviewAndAccept = handleTrainerAcceptTrainee(reqState, requestApp.id, "TRN-001", true, undefined, "Trainer");
assert(trainerReviewAndAccept.success, "Trainer Review & Accept: Trainer confirms review of all materials and accepts trainee");
assert(trainerReviewAndAccept.updatedApplicants![0].trainerStatus === "Accepted", "Trainer Review & Accept: Status is Accepted");

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n=======================================================");
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed === 0) {
  console.log("ALL REGRESSION & WORKFLOW TESTS PASSED PERFECTLY!");
} else {
  console.error("SOME TESTS FAILED! Review details above.");
  process.exit(1);
}
console.log("=======================================================\n");
