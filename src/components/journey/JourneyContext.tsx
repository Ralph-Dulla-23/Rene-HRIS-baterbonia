import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { 
  EmployeeJourney, 
  Day30Milestone, 
  Day60Milestone, 
  Day90Milestone, 
  JourneyTouchpoint, 
  JourneyStage,
  TrainingAssignment,
  TrainingProgress,
  AssessmentItem,
  AssessmentGrade,
  PhaseTrainingScore,
  AttendanceRecord,
  EvidenceItem,
  CheckInItem,
  CoachingAction,
  NotificationEvent,
  QDSFollowUpRequest,
  ReviewRecord
} from "./journeyTypes";
import { 
  INITIAL_JOURNEYS,
  INITIAL_ASSIGNMENTS,
  INITIAL_PROGRESS,
  INITIAL_ASSESSMENTS,
  INITIAL_ASSESSMENT_GRADES,
  INITIAL_PHASE_TRAINING_SCORES,
  INITIAL_ATTENDANCE,
  INITIAL_EVIDENCE,
  INITIAL_CHECKINS,
  INITIAL_COACHING_ACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_QDS_REQUESTS,
  SNAPSHOT_DATE
} from "./journeyInitialData";
import { NHOApplicant } from "../nho/nhoTypes";

export const JOURNEY_STORAGE_KEY = "sibs_employee_journeys_data";
export const DEFAULT_SIMULATED_DATE = SNAPSHOT_DATE || "2026-10-14";

interface JourneyContextType {
  journeys: EmployeeJourney[];
  selectedJourney: EmployeeJourney | null;
  setSelectedJourney: (journey: EmployeeJourney | null) => void;
  simulatedCurrentDate: string;
  setSimulatedCurrentDate: (date: string) => void;
  
  // Datasets for Employee Dashboard & Workspace
  assignments: TrainingAssignment[];
  progress: TrainingProgress[];
  assessments: AssessmentItem[];
  assessmentGrades: AssessmentGrade[];
  phaseTrainingScores: PhaseTrainingScore[];
  attendance: AttendanceRecord[];
  evidence: EvidenceItem[];
  checkIns: CheckInItem[];
  coachingActions: CoachingAction[];
  notifications: NotificationEvent[];
  qdsRequests: QDSFollowUpRequest[];

  // Actions & Mutations
  createOrLinkJourneyFromNHO: (
    applicant: NHOApplicant,
    hrActor?: string,
    simulatedCurrentDate?: string
  ) => { success: boolean; journey: EmployeeJourney; isNew: boolean };
  updateDay30Milestone: (journeyId: string, updates: Partial<Day30Milestone>) => boolean;
  updateDay60Milestone: (journeyId: string, updates: Partial<Day60Milestone>) => boolean;
  updateDay90Milestone: (journeyId: string, updates: Partial<Day90Milestone>) => boolean;
  updateJourneyReview: (journeyId: string, milestoneDay: 30 | 60 | 90, review: ReviewRecord) => boolean;
  setFinalEmploymentOutcome: (journeyId: string, outcome: string, notes?: string, authorizedBy?: string) => boolean;
  acknowledgeReview: (journeyId: string) => boolean;
  addTouchpoint: (journeyId: string, touchpoint: Omit<JourneyTouchpoint, "id">) => boolean;
  linkEmployeeProfile: (
    journeyId: string, 
    sibsEmployeeId: string, 
    startDate: string,
    trainerId?: string,
    trainerName?: string,
    hireDate?: string
  ) => boolean;
  submitAssignment: (assignmentId: number, emp: string, note?: string) => void;
  verifyAssignment: (assignmentId: number, emp: string, status: "Verified" | "Revision requested", reviewer: string, feedback?: string) => void;
  saveAssessmentGrade: (grade: AssessmentGrade) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, "id" | "recorded">) => void;
  addEvidenceItem: (item: Omit<EvidenceItem, "id">) => void;
  addCheckIn: (item: Omit<CheckInItem, "id">) => void;
  addCoachingAction: (action: Omit<CoachingAction, "id">) => void;
  toggleCoachingAction: (id: number) => void;
  addQDSRequest: (req: Omit<QDSFollowUpRequest, "id" | "created" | "status">) => void;
  updateQDSRequestStatus: (id: number, status: "Open" | "Acknowledged" | "Closed", resolution?: string) => void;
  addNotification: (notif: Omit<NotificationEvent, "id">) => void;
  clearNotifications: () => void;
  resetJourneysToDefault: () => void;
  getJourneyByNhoApplicantId: (applicantId: string) => EmployeeJourney | undefined;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

// Helper function to calculate stage and elapsed days
// Corrected Issue 3: Do not automatically regularize employees at Day 90. Keep Journey completion separate from the official employment decision.
export function calculateJourneyStage(startDate?: string, simDate: string = DEFAULT_SIMULATED_DATE): {
  daysElapsed: number;
  stage: JourneyStage;
  progressPct: number;
} {
  if (!startDate) {
    return { daysElapsed: 0, stage: "Awaiting Start", progressPct: 0 };
  }

  const start = new Date(startDate).getTime();
  const current = new Date(simDate).getTime();
  const diffTime = current - start;
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { daysElapsed: 0, stage: "Awaiting Start", progressPct: 0 };
  }

  const daysElapsed = days + 1; // Day 1 on start date
  let stage: JourneyStage = "Day 1-30 Nesting";
  let progressPct = Math.min(100, Math.round((daysElapsed / 90) * 100));

  if (daysElapsed > 90) {
    // Stage remains Day 61-90 Regularization Assessment / Completed Onboarding, NEVER automatically "Regularized"
    stage = "Completed Onboarding";
    progressPct = 100;
  } else if (daysElapsed > 60) {
    stage = "Day 61-90 Regularization Assessment";
  } else if (daysElapsed > 30) {
    stage = "Day 31-60 Ramp";
  }

  return { daysElapsed, stage, progressPct };
}

// Pure idempotent helper that can also be called directly outside React tree
// Corrected Issue 2: Do not invent missing employee IDs, trainer assignments or hire dates. Show an authorized linkage action instead.
export function pureCreateOrLinkJourney(
  existingJourneys: EmployeeJourney[],
  applicant: NHOApplicant,
  hrActor: string = "Dulla, Ralph Vincent (HR Operations Lead)",
  simDate: string = DEFAULT_SIMULATED_DATE
): { updatedJourneys: EmployeeJourney[]; journey: EmployeeJourney; isNew: boolean } {
  // 1. Idempotency check: see if a journey is already associated with this applicant or Kronos ID
  const existing = existingJourneys.find(
    j => (applicant.id && j.nhoApplicantId === applicant.id) ||
         (applicant.officialKronosId && j.kronosId === applicant.officialKronosId)
  );

  if (existing) {
    // Return existing record idempotently; do not duplicate
    return { updatedJourneys: existingJourneys, journey: existing, isNew: false };
  }

  // 2. Establish start date & hire date WITHOUT inventing missing data
  const kronosId = applicant.officialKronosId || undefined;
  const sibsEmployeeId = (applicant as any).sibsEmployeeId || undefined;
  const trainerId = applicant.assignedTrainerId || undefined;
  const trainerName = applicant.assignedTrainerName || undefined;

  // Preserve real hire date or confirmed start date if explicitly set; do NOT default to scheduledNhoDate
  const hireDate = (applicant as any).hireDate || (applicant as any).confirmedStartDate || (applicant as any).startDate || undefined;
  const startDate = (applicant as any).confirmedStartDate || (applicant as any).startDate || (applicant as any).hireDate || undefined;

  const { daysElapsed, stage, progressPct } = calculateJourneyStage(startDate, simDate);

  // 3. Extract pending non-major documents with preserved 14-day deadline
  const outstandingDocs = (applicant.documents || []).filter(
    d => !d.isMajor && !d.isEssentialAgreement && d.status !== "Verified"
  );

  const targetDate30 = startDate ? new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : "";
  const targetDate60 = startDate ? new Date(new Date(startDate).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : "";
  const targetDate90 = startDate ? new Date(new Date(startDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : "";

  const newJourneyId = `JRN-2026-${String(existingJourneys.length + 1).padStart(3, "0")}`;

  // Flag awaiting authorized linkage if vital employee ID, trainer or hire date is missing
  const isAwaitingLinkage = !sibsEmployeeId || !trainerId || !hireDate;

  const newJourney: EmployeeJourney = {
    id: newJourneyId,
    nhoApplicantId: applicant.id,
    nhoHandoffId: `handoff-${applicant.id}`,
    kronosId,
    sibsEmployeeId,
    fullName: applicant.fullName,
    email: applicant.email,
    contactNumber: applicant.phone || "+63 917 000 0000",
    roleTitle: applicant.position || "Customer Support Advocate",
    department: applicant.assignedDepartment || "Operations",
    account: applicant.account || "CD - CONNECT",
    siteLocation: applicant.reportingLocation || "SiBS Davao",
    wfmSeating: applicant.wfmSeatNumber ? {
      wing: applicant.wfmProductionWing || "Main Wing",
      seatNumber: applicant.wfmSeatNumber,
      floor: "2nd Floor Main Operations",
      assignedBy: applicant.wfmAssignedBy || "Danilo Morales (WFM Lead)"
    } : undefined,
    trainerId,
    trainerName,
    trainerAcceptedAt: applicant.trainerAcceptedAt,
    qdsMaterials: Array.isArray(applicant.qdsMaterials) ? applicant.qdsMaterials : [],
    hireDate,
    nhoAcceptedAt: applicant.hrAcceptedAt || `${simDate} 09:30 AM`,
    nhoAcceptedBy: hrActor,
    startDate,
    daysElapsed,
    stage,
    overallProgressPct: progressPct,
    outstandingNhoDocuments: outstandingDocs,
    reviews: {},
    finalOutcome: "",
    acknowledged: false,
    day30: {
      status: stage === "Awaiting Start" ? "Pending" : "In Progress",
      targetDate: targetDate30,
      evaluatorId: trainerId,
      evaluatorName: trainerName,
      evaluatorRole: "Assigned Trainer",
      nestingQaScore: 85,
      attendancePunctualityScore: 98.0,
      systemsNavigationRating: 4,
      callHandlingRating: 4,
      complianceAdherenceRating: 5,
      outstandingDocsCleared: outstandingDocs.length === 0,
      trainerEndorsement: "Floor Ready"
    },
    day60: {
      status: "Pending",
      targetDate: targetDate60
    },
    day90: {
      status: "Pending",
      targetDate: targetDate90
    },
    touchpoints: [
      {
        id: `tp-${Date.now()}`,
        date: simDate,
        authorName: hrActor,
        authorRole: "HR Operations",
        type: "1-on-1 Check-in",
        notes: `NHO Handoff successfully accepted. Trainee officially registered on 30/60/90 Employee Journey roadmap.${trainerName ? ` Assigned to Trainer ${trainerName}.` : " Trainer assignment pending authorized linkage."}`,
        moodRating: "Thriving"
      }
    ],
    auditTrail: [
      {
        date: `${simDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        action: "Handoff Accepted & Journey Created",
        actor: hrActor,
        details: `NHO Handoff completed. Created Journey ${newJourneyId}.${hireDate ? ` Preserved hire date: ${hireDate}.` : " Hire date pending authorized linkage."}`
      }
    ],
    isAwaitingLinkage
  };

  return {
    updatedJourneys: [newJourney, ...existingJourneys],
    journey: newJourney,
    isNew: true
  };
}

export const STORAGE_PREFIX = "sibs_journey_v2_";

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
      if (typeof parsed === "object" && parsed !== null) return parsed as unknown as T;
    }
  } catch {
    // fallback
  }
  return defaultValue;
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [simulatedCurrentDate, setSimulatedCurrentDate] = useState<string>(DEFAULT_SIMULATED_DATE);

  // Journeys list
  const [journeys, setJourneys] = useState<EmployeeJourney[]>(() => {
    try {
      const storedV2 = localStorage.getItem(STORAGE_PREFIX + "journeys");
      if (storedV2) {
        const parsed = JSON.parse(storedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const storedLegacy = localStorage.getItem(JOURNEY_STORAGE_KEY);
      if (storedLegacy) {
        const parsed = JSON.parse(storedLegacy);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_JOURNEYS;
  });

  const [selectedJourney, setSelectedJourney] = useState<EmployeeJourney | null>(null);

  // Shared state collections persisted to versioned browser storage
  const [assignments, setAssignments] = useState<TrainingAssignment[]>(() => loadStorage("assignments", INITIAL_ASSIGNMENTS));
  const [progress, setProgress] = useState<TrainingProgress[]>(() => loadStorage("progress", INITIAL_PROGRESS));
  const [assessments] = useState<AssessmentItem[]>(INITIAL_ASSESSMENTS);
  const [assessmentGrades, setAssessmentGrades] = useState<AssessmentGrade[]>(() => loadStorage("assessment_grades", INITIAL_ASSESSMENT_GRADES));
  const [phaseTrainingScores] = useState<PhaseTrainingScore[]>(INITIAL_PHASE_TRAINING_SCORES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStorage("attendance", INITIAL_ATTENDANCE));
  const [evidence, setEvidence] = useState<EvidenceItem[]>(() => loadStorage("evidence", INITIAL_EVIDENCE));
  const [checkIns, setCheckIns] = useState<CheckInItem[]>(() => loadStorage("checkins", INITIAL_CHECKINS));
  const [coachingActions, setCoachingActions] = useState<CoachingAction[]>(() => loadStorage("coaching", INITIAL_COACHING_ACTIONS));
  const [notifications, setNotifications] = useState<NotificationEvent[]>(() => loadStorage("notifications", INITIAL_NOTIFICATIONS));
  const [qdsRequests, setQdsRequests] = useState<QDSFollowUpRequest[]>(() => loadStorage("qds_requests", INITIAL_QDS_REQUESTS));

  // Synchronize automatically on HR handoff acceptance via storage event
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_PREFIX + "journeys") || localStorage.getItem(JOURNEY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJourneys(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("journey-storage-updated", handleStorageSync);
    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener("journey-storage-updated", handleStorageSync);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  // Sync datasets to versioned local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + "journeys", JSON.stringify(journeys));
      localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(journeys));
    } catch {}
  }, [journeys]);

  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "assignments", JSON.stringify(assignments)); } catch {} }, [assignments]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "progress", JSON.stringify(progress)); } catch {} }, [progress]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "assessment_grades", JSON.stringify(assessmentGrades)); } catch {} }, [assessmentGrades]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "attendance", JSON.stringify(attendance)); } catch {} }, [attendance]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "evidence", JSON.stringify(evidence)); } catch {} }, [evidence]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "checkins", JSON.stringify(checkIns)); } catch {} }, [checkIns]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "coaching", JSON.stringify(coachingActions)); } catch {} }, [coachingActions]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "notifications", JSON.stringify(notifications)); } catch {} }, [notifications]);
  useEffect(() => { try { localStorage.setItem(STORAGE_PREFIX + "qds_requests", JSON.stringify(qdsRequests)); } catch {} }, [qdsRequests]);

  const createOrLinkJourneyFromNHO = (
    applicant: NHOApplicant,
    hrActor: string = "Dulla, Ralph Vincent (HR Operations Lead)",
    simDate: string = simulatedCurrentDate
  ) => {
    const res = pureCreateOrLinkJourney(journeys, applicant, hrActor, simDate);
    if (res.isNew) {
      setJourneys(res.updatedJourneys);
      // Requirement 3: Convert NHO QDS materials into trainee learning assignments without duplicates
      if (Array.isArray(applicant.qdsMaterials) && applicant.qdsMaterials.length > 0) {
        const empKey = res.journey.sibsEmployeeId || res.journey.id;
        const newAssignments: TrainingAssignment[] = [];
        applicant.qdsMaterials.forEach((m, idx) => {
          const exists = assignments.some(a => (a.emp === empKey || a.emp === res.journey.id) && a.title.toLowerCase() === m.title.toLowerCase());
          if (!exists) {
            newAssignments.push({
              id: Date.now() + idx + Math.floor(Math.random() * 10000),
              emp: empKey,
              date: res.journey.startDate || simDate,
              category: m.type || "QDS Curriculum",
              title: m.title,
              type: "Material",
              description: m.description || m.fileOrLinkRef,
              owner: applicant.assignedTrainerName || "Assigned Trainer",
              duration: "30 mins",
              priority: "Normal",
              details: m.description || m.fileOrLinkRef,
              created: simDate
            });
          }
        });
        if (newAssignments.length > 0) {
          setAssignments(prev => [...prev, ...newAssignments]);
        }
      }
    }
    return { success: true, journey: res.journey, isNew: res.isNew };
  };

  const updateDay30Milestone = (journeyId: string, updates: Partial<Day30Milestone>) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      const updated30: Day30Milestone = { ...j.day30, ...updates };
      return {
        ...j,
        day30: updated30,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Day 30 Milestone Updated (${updated30.status})`,
            actor: updated30.evaluatorName || "Carlos Mendoza (L&D Specialist)",
            details: updated30.trainerNotes || "Updated Day 30 nesting scorecard metrics."
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  const updateDay60Milestone = (journeyId: string, updates: Partial<Day60Milestone>) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      const updated60: Day60Milestone = { ...j.day60, ...updates };
      return {
        ...j,
        day60: updated60,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Day 60 Milestone Updated (${updated60.status})`,
            actor: updated60.evaluatorName || "Michael Corpuz (Operations Supervisor)",
            details: updated60.supervisorNotes || "Updated Day 60 core performance scorecard."
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  // Issue 3: Do not automatically regularize employees at Day 90. Keep Journey completion separate from the official employment decision.
  const updateDay90Milestone = (journeyId: string, updates: Partial<Day90Milestone>) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      const updated90: Day90Milestone = { ...j.day90, ...updates };
      return {
        ...j,
        day90: updated90,
        // Keep stage separated from automatic regularization
        stage: updated90.status === "Completed" ? ("Completed Onboarding" as JourneyStage) : j.stage,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Day 90 Review Assessment Updated (${updated90.status})`,
            actor: updated90.evaluatorName || "Dulla, Ralph Vincent (HR Operations Lead)",
            details: updated90.trainerNotes || "Updated Day 90 milestone review records."
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  // Milestone reviews for Day 30, 60, 90
  const updateJourneyReview = (journeyId: string, milestoneDay: 30 | 60 | 90, review: ReviewRecord) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      const newReviews = { ...j.reviews, [milestoneDay]: review };
      return {
        ...j,
        reviews: newReviews,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Day ${milestoneDay} Review Recorded (${review.decision})`,
            actor: review.manager,
            details: review.notes
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  // Issue 3: Separate official employment regularization decision
  const setFinalEmploymentOutcome = (journeyId: string, outcome: string, notes?: string, authorizedBy: string = "Paolo Vega (Operations Manager)") => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      return {
        ...j,
        finalOutcome: outcome,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Official Employment Decision: ${outcome}`,
            actor: authorizedBy,
            details: notes || `Recorded official employment outcome: ${outcome}.`
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  const acknowledgeReview = (journeyId: string) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      return {
        ...j,
        acknowledged: true,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: "Employee Milestone Review Acknowledged",
            actor: j.fullName,
            details: "Employee signed and confirmed review records."
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  const addTouchpoint = (journeyId: string, touchpoint: Omit<JourneyTouchpoint, "id">) => {
    const newTp: JourneyTouchpoint = {
      ...touchpoint,
      id: `tp-${Date.now()}`
    };
    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      return {
        ...j,
        touchpoints: [newTp, ...j.touchpoints],
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Logged Touchpoint: ${touchpoint.type}`,
            actor: touchpoint.authorName,
            details: touchpoint.notes
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  // Authorized profile linkage: Reject incomplete or invalid linkage instead of silently using simulation date
  const linkEmployeeProfile = (
    journeyId: string, 
    sibsEmployeeId: string, 
    startDate: string,
    trainerId?: string,
    trainerName?: string,
    hireDate?: string
  ) => {
    if (!sibsEmployeeId || !sibsEmployeeId.trim() || !startDate || !startDate.trim()) {
      return false;
    }
    const cleanId = sibsEmployeeId.trim();
    const cleanStart = startDate.trim();

    setJourneys(prev => prev.map(j => {
      if (j.id !== journeyId) return j;
      const { daysElapsed, stage, progressPct } = calculateJourneyStage(cleanStart, simulatedCurrentDate);
      return {
        ...j,
        sibsEmployeeId: cleanId,
        startDate: cleanStart,
        hireDate: hireDate?.trim() || j.hireDate || cleanStart,
        trainerId: trainerId || j.trainerId,
        trainerName: trainerName || j.trainerName,
        daysElapsed,
        stage,
        overallProgressPct: progressPct,
        isAwaitingLinkage: false,
        auditTrail: [
          {
            date: `${simulatedCurrentDate} ` + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: "Authorized Linkage Completed",
            actor: "HR Operations Lead",
            details: `Linked SIB ID: ${cleanId}. Confirmed Start Date: ${cleanStart}.${trainerName ? ` Trainer: ${trainerName}.` : ""}`
          },
          ...j.auditTrail
        ]
      };
    }));
    return true;
  };

  // Trainee & Trainer Learning verification actions
  const submitAssignment = (assignmentId: number, emp: string, note: string = "Trainee completed material") => {
    setProgress(prev => {
      const existing = prev.find(p => p.assignmentId === assignmentId && p.emp === emp);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, status: "Submitted" as const, note, submitted: simulatedCurrentDate } : p);
      }
      return [
        ...prev,
        {
          id: Date.now(),
          assignmentId,
          emp,
          status: "Submitted" as const,
          note,
          submitted: simulatedCurrentDate
        }
      ];
    });
  };

  const verifyAssignment = (assignmentId: number, emp: string, status: "Verified" | "Revision requested", reviewer: string, feedback?: string) => {
    setProgress(prev => {
      const existing = prev.find(p => p.assignmentId === assignmentId && p.emp === emp);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, status, reviewer, reviewed: simulatedCurrentDate, feedback } : p);
      }
      return [
        ...prev,
        {
          id: Date.now(),
          assignmentId,
          emp,
          status,
          reviewer,
          reviewed: simulatedCurrentDate,
          feedback
        }
      ];
    });
  };

  const saveAssessmentGrade = (grade: AssessmentGrade) => {
    setAssessmentGrades(prev => {
      const existing = prev.findIndex(g => g.assessmentId === grade.assessmentId && g.emp === grade.emp);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = grade;
        return copy;
      }
      return [...prev, grade];
    });
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, "id" | "recorded">) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now(),
      recorded: simulatedCurrentDate
    };
    setAttendance(prev => [newRecord, ...prev]);
  };

  const addEvidenceItem = (item: Omit<EvidenceItem, "id">) => {
    const newItem: EvidenceItem = {
      ...item,
      id: Date.now()
    };
    setEvidence(prev => [newItem, ...prev]);
  };

  const addCheckIn = (item: Omit<CheckInItem, "id">) => {
    const newItem: CheckInItem = {
      ...item,
      id: Date.now()
    };
    setCheckIns(prev => [newItem, ...prev]);
  };

  const addCoachingAction = (action: Omit<CoachingAction, "id">) => {
    const newAction: CoachingAction = {
      ...action,
      id: Date.now()
    };
    setCoachingActions(prev => [newAction, ...prev]);
  };

  const toggleCoachingAction = (id: number) => {
    setCoachingActions(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "Open" ? "Done" : "Open" } : c));
  };

  const addQDSRequest = (req: Omit<QDSFollowUpRequest, "id" | "created" | "status">) => {
    const newReq: QDSFollowUpRequest = {
      ...req,
      id: Date.now(),
      created: simulatedCurrentDate,
      status: "Open"
    };
    setQdsRequests(prev => [newReq, ...prev]);
  };

  const updateQDSRequestStatus = (id: number, status: "Open" | "Acknowledged" | "Closed", resolution?: string) => {
    setQdsRequests(prev => prev.map(q => q.id === id ? { ...q, status, resolution, closed: status === "Closed" ? simulatedCurrentDate : undefined } : q));
  };

  const addNotification = (notif: Omit<NotificationEvent, "id">) => {
    const newNotif: NotificationEvent = {
      ...notif,
      id: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetJourneysToDefault = () => {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);
    const keys = ["journeys", "assignments", "progress", "assessment_grades", "attendance", "evidence", "checkins", "coaching", "notifications", "qds_requests"];
    keys.forEach(k => localStorage.removeItem(STORAGE_PREFIX + k));
    setJourneys(INITIAL_JOURNEYS);
    setSelectedJourney(null);
    setAssignments(INITIAL_ASSIGNMENTS);
    setProgress(INITIAL_PROGRESS);
    setAssessmentGrades(INITIAL_ASSESSMENT_GRADES);
    setAttendance(INITIAL_ATTENDANCE);
    setEvidence(INITIAL_EVIDENCE);
    setCheckIns(INITIAL_CHECKINS);
    setCoachingActions(INITIAL_COACHING_ACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setQdsRequests(INITIAL_QDS_REQUESTS);
  };

  const getJourneyByNhoApplicantId = (applicantId: string) => {
    return journeys.find(j => j.nhoApplicantId === applicantId);
  };

  const value = useMemo(() => ({
    journeys,
    selectedJourney,
    setSelectedJourney,
    simulatedCurrentDate,
    setSimulatedCurrentDate,
    assignments,
    progress,
    assessments,
    assessmentGrades,
    phaseTrainingScores,
    attendance,
    evidence,
    checkIns,
    coachingActions,
    notifications,
    qdsRequests,
    createOrLinkJourneyFromNHO,
    updateDay30Milestone,
    updateDay60Milestone,
    updateDay90Milestone,
    updateJourneyReview,
    setFinalEmploymentOutcome,
    acknowledgeReview,
    addTouchpoint,
    linkEmployeeProfile,
    submitAssignment,
    verifyAssignment,
    saveAssessmentGrade,
    addAttendanceRecord,
    addEvidenceItem,
    addCheckIn,
    addCoachingAction,
    toggleCoachingAction,
    addQDSRequest,
    updateQDSRequestStatus,
    addNotification,
    clearNotifications,
    resetJourneysToDefault,
    getJourneyByNhoApplicantId
  }), [
    journeys,
    selectedJourney,
    simulatedCurrentDate,
    assignments,
    progress,
    assessments,
    assessmentGrades,
    phaseTrainingScores,
    attendance,
    evidence,
    checkIns,
    coachingActions,
    notifications,
    qdsRequests
  ]);

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextType {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
}
