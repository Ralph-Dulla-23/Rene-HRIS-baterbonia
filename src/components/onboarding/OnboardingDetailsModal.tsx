import React, { useState } from "react";
import { 
  X, 
  User, 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  AlertTriangle, 
  Info, 
  Star,
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  Award,
  BookOpen,
  MessageSquare,
  FileText,
  Activity,
  Plus,
  Sparkles,
  Link as LinkIcon,
  Check,
  Send,
  Upload,
  UserCheck,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Layers,
  ShieldCheck,
  Lock,
  Eye,
  ChevronRight,
  Edit3,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingRecord } from "./types";
import { useJourney } from "../journey/JourneyContext";
import { useDemoAuth } from "../../auth/DemoAuthContext";
import { EmployeeJourney } from "../journey/journeyTypes";
import Day30HandoffCard from "../journey/Day30HandoffCard";
import TrainerCoachingDetailsModal from "../journey/TrainerCoachingDetailsModal";
import DailyPerformanceCalendarView from "../journey/views/DailyPerformanceCalendarView";
import TrainingProcessDetailModal from "../journey/views/TrainingProcessDetailModal";
import { coachingForEmployee, evaluationFor, kpiComparison, coachingStatus } from "../journey/trainerCoachingUtils";
import { getEmphasizedEmployeeStatus } from "../journey/employeeStatusUtils";

interface OnboardingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onOpenOutcomeModal?: (type: "Show" | "No Show" | "Withdrawn") => void;
  onOpenStageModal?: () => void;
}

export default function OnboardingDetailsModal({
  isOpen,
  onClose,
  record,
  onOpenOutcomeModal,
  onOpenStageModal
}: OnboardingDetailsModalProps) {
  const { 
    journeys, 
    updateDay30Milestone, 
    updateDay60Milestone, 
    updateDay90Milestone,
    setFinalEmploymentOutcome,
    addTouchpoint, 
    attendance, 
    addAttendanceRecord,
    evidence, 
    addEvidenceItem,
    checkIns, 
    addCheckIn,
    coachingActions, 
    esepSessions, 
    esepEvaluations, 
    addCoachingAction, 
    toggleCoachingAction,
    assignments, 
    progress, 
    phaseTrainingScores,
    assessments,
    assessmentGrades,
    simulatedCurrentDate
  } = useJourney();

  const { user } = useDemoAuth();

  // Active Tab: default to "timeline"
  const [activeTab, setActiveTab] = useState<"timeline" | "coaching" | "handoffs">("timeline");
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);

  // Milestone Evaluations Active Sub-Tab: "all" | 30 | 60 | 90 | "calendar"
  const [activeMilestoneTab, setActiveMilestoneTab] = useState<"all" | 30 | 60 | 90 | "calendar">("all");
  const [selectedProcessModal, setSelectedProcessModal] = useState<"FST" | "PST" | null>(null);
  const [selectedGrowSessionId, setSelectedGrowSessionId] = useState<number | null>(null);

  // Day 30 Form State
  const [isEditingDay30, setIsEditingDay30] = useState(false);
  const [day30Qa, setDay30Qa] = useState(88);
  const [day30Att, setDay30Att] = useState(98.5);
  const [day30Endorsement, setDay30Endorsement] = useState("Floor Ready");
  const [day30Notes, setDay30Notes] = useState("");

  // Day 60 Form State
  const [isEditingDay60, setIsEditingDay60] = useState(false);
  const [day60Prod, setDay60Prod] = useState(89);
  const [day60Aht, setDay60Aht] = useState(380);
  const [day60Decision, setDay60Decision] = useState("Progressing Well");
  const [day60Notes, setDay60Notes] = useState("");

  // Day 90 Form State
  const [isEditingDay90, setIsEditingDay90] = useState(false);
  const [day90Composite, setDay90Composite] = useState(91);
  const [day90Rating, setDay90Rating] = useState(4);
  const [day90Recommendation, setDay90Recommendation] = useState("Endorse for Regularization");
  const [day90HrNotes, setDay90HrNotes] = useState("");

  // Modal sub-states
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [attDate, setAttDate] = useState(simulatedCurrentDate || "2026-10-14");
  const [attStatus, setAttStatus] = useState<"Present" | "Late" | "Absent" | "Excused">("Present");
  const [attSource, setAttSource] = useState("Kronos Biometric Punch");
  const [attNotes, setAttNotes] = useState("Standard operational shift");

  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evType, setEvType] = useState<"Training" | "QDS / QA" | "Performance" | "Coaching" | "Work quality">("Training");
  const [evTitle, setEvTitle] = useState("");
  const [evOwner, setEvOwner] = useState("Maria Cruz (Assigned Trainer)");
  const [evNotes, setEvNotes] = useState("");

  const [showAddCheckIn, setShowAddCheckIn] = useState(false);
  const [ciType, setCiType] = useState<"Trainer" | "Team Leader" | "Manager" | "HR Coordinator">("HR Coordinator");
  const [ciOwner, setCiOwner] = useState("Alena Batacan (TA Recruiter)");
  const [ciConfidence, setCiConfidence] = useState(5);
  const [ciNotes, setCiNotes] = useState("");

  const [showAddCoaching, setShowAddCoaching] = useState(false);
  const [showEsepDetails, setShowEsepDetails] = useState(false);
  const [coachTitle, setCoachTitle] = useState("");
  const [coachOwner, setCoachOwner] = useState("Maria Cruz (Senior Trainer)");
  const [coachDue, setCoachDue] = useState("2026-10-25");
  const [coachNotes, setCoachNotes] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const candidateName = record.name || record.candidateName || "Candidate";
  const candidateEmail = record.email || record.candidateEmail || "";
  const candidatePhone = record.phone || record.candidatePhone || "+63 917 000 0000";
  const candidateRole = record.role || record.roleTitle || "Customer Support Advocate";
  const candidateSiteLocation = record.siteLocation || record.location || "SiBS Davao";

  // Resolve matching EmployeeJourney if available
  const matchingJourney = journeys.find(
    j => (record.convertedEmployeeId && (j.sibsEmployeeId === record.convertedEmployeeId || j.id === record.convertedEmployeeId)) ||
         j.fullName.toLowerCase() === candidateName.toLowerCase()
  );

  // Synthesize journey object if none exists yet for pre-boarding candidate
  const journey: EmployeeJourney = matchingJourney || {
    id: record.id,
    sibsEmployeeId: record.convertedEmployeeId || record.id,
    kronosId: `KRN-${(record.id || "001").replace(/\D/g, "") || "90001"}`,
    fullName: candidateName,
    email: candidateEmail,
    contactNumber: candidatePhone,
    roleTitle: candidateRole,
    department: "Customer Operations",
    account: record.account || "Enterprise Operations",
    siteLocation: candidateSiteLocation,
    stage: (record.finalOutcome === "True Hire" || record.showStatus === "Show") ? "Day 1-30 Nesting" : "Awaiting Start",
    daysElapsed: record.actualStartDate ? Math.max(1, Math.floor((new Date(simulatedCurrentDate).getTime() - new Date(record.actualStartDate).getTime()) / (1000 * 60 * 60 * 24))) : (record.daysToStart ? 0 : 27),
    overallProgressPct: 35,
    startDate: record.actualStartDate || record.expectedStartDate || "2026-08-01",
    hireDate: record.actualStartDate || record.expectedStartDate || "2026-08-01",
    trainerName: "Maria Cruz",
    trainerId: "TRN-001",
    tl: "Anton Reyes",
    qa: "Quality Assurance Lead",
    manager: "Ralph Vincent Dulla",
    wfmSeating: {
      wing: "Wing A",
      seatNumber: "Station 42",
      floor: "3F"
    },
    qdsMaterials: [],
    reviews: {},
    outstandingNhoDocuments: [],
    auditTrail: [],
    day30: { 
      status: record.finalOutcome === "True Hire" ? "In Progress" : "Pending",
      targetDate: "2026-08-31",
      outstandingDocsCleared: true,
      nestingQaScore: 88,
      attendancePunctualityScore: 98.5,
      trainerEndorsement: "Floor Ready"
    },
    day60: { status: "Pending", targetDate: "2026-09-30", coreProductionScore: 89, averageHandleTimeSeconds: 380 },
    day90: { status: "Pending", targetDate: "2026-10-31", compositeScore: 91, overallPerformanceRating: 4 },
    finalOutcome: record.finalOutcome === "True Hire" ? "Completed" : undefined,
    touchpoints: [],
    day30Handoff: {
      status: (record.convertedEmployeeId === "SIBS-2901" || candidateName === "Alyssa Rivera") ? "Pending" : "Pending",
      trainerName: "Maria Cruz",
      targetTlName: "Anton Reyes",
      readinessRating: "Floor Ready",
      coreStrengths: ["High Customer Empathy", "Quick Systems Navigation"],
      focusAreas: ["AHT Optimization"],
      attendanceRate: 100,
      qaScore: 88,
      trainerNotes: "Candidate completed Product Skills Training with high marks."
    }
  };

  const empKey = journey.sibsEmployeeId || journey.id;
  const employeeAttendance = attendance.filter(a => a.emp === empKey || a.emp === journey.id);
  const employeeEvidence = evidence.filter(e => e.emp === empKey || e.emp === journey.id);
  const employeeCheckIns = checkIns.filter(c => c.emp === empKey || c.emp === journey.id);
  const employeeCoaching = coachingActions.filter(c => c.emp === empKey || c.emp === journey.id);
  const employeeEsepSessions = coachingForEmployee(esepSessions, journey);
  const employeeAssignments = assignments.filter(a => a.emp === empKey || a.emp === journey.id);
  const empProg = progress.filter(p => p.emp === empKey || p.emp === journey.id);
  const verifiedAssigns = empProg.filter(p => p.status === "Verified").length;

  const fstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "FST");
  const pstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "PST");
  const fstScoreVal = fstScoreObj?.score ?? 84;
  const pstScoreVal = pstScoreObj?.score ?? 91;

  const qaEvid = employeeEvidence.filter(e => e.type === "QDS / QA");
  const qaScoreVal = qaEvid.length > 0 ? 88 : (journey.day30?.nestingQaScore || 88);

  const employeeGrades = (assessmentGrades || []).filter(g => g.emp === empKey || g.emp === journey.id);
  const fstItems = (assessments || [])
    .filter(a => a.phase === "FST")
    .map(a => {
      const g = employeeGrades.find(gr => gr.assessmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        skill: a.skill,
        max: a.max,
        passing: a.passing,
        score: g ? g.score : (a.id === 8103 ? 85 : 84),
        grader: g?.grader || journey.trainerName || "Maria Cruz",
        date: g?.date || "2026-09-28"
      };
    });

  const pstItems = (assessments || [])
    .filter(a => a.phase === "PST")
    .map(a => {
      const g = employeeGrades.find(gr => gr.assessmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        skill: a.skill,
        max: a.max,
        passing: a.passing,
        score: g ? g.score : (a.id === 8101 ? 86 : a.id === 8102 ? 89 : 91),
        grader: g?.grader || journey.tl || "Anton Reyes",
        date: g?.date || "2026-10-10"
      };
    });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveDay30 = () => {
    updateDay30Milestone(journey.id, {
      status: "Completed",
      nestingQaScore: Number(day30Qa),
      attendancePunctualityScore: Number(day30Att),
      trainerEndorsement: day30Endorsement as any,
      trainerNotes: day30Notes,
      completedDate: journey.day30?.completedDate || simulatedCurrentDate
    });
    setIsEditingDay30(false);
    showToast("Day 30 Milestone Review updated successfully!");
  };

  const handleSaveDay60 = () => {
    updateDay60Milestone(journey.id, {
      status: "Completed",
      coreProductionScore: Number(day60Prod),
      averageHandleTimeSeconds: Number(day60Aht),
      midProbationDecision: day60Decision as any,
      supervisorNotes: day60Notes,
      completedDate: journey.day60?.completedDate || simulatedCurrentDate
    });
    setIsEditingDay60(false);
    showToast("Day 60 Milestone Review updated successfully!");
  };

  const handleSaveDay90 = () => {
    updateDay90Milestone(journey.id, {
      status: "Completed",
      compositeScore: Number(day90Composite),
      overallPerformanceRating: Number(day90Rating),
      finalRecommendation: day90Recommendation as any,
      hrOperationsSignOff: {
        approved: true,
        signedBy: user?.name || "HR Operations Lead",
        signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        remarks: day90HrNotes
      }
    });
    if (setFinalEmploymentOutcome) {
      setFinalEmploymentOutcome(journey.id, day90Recommendation, day90HrNotes, user?.name || "HR Operations Lead");
    }
    setIsEditingDay90(false);
    showToast("Day 90 Regularization Review & Outcome updated successfully!");
  };

  const emphasizedStatus = getEmphasizedEmployeeStatus(journey);

  // Compute Days to Start
  const startMs = new Date(record.expectedStartDate).getTime();
  const acceptMs = new Date((record as any).acceptedOfferDate || (record as any).offerAcceptedDate || "2026-07-16").getTime();
  const calculatedDaysToStart = Math.max(0, Math.ceil((startMs - acceptMs) / (1000 * 3600 * 24)));
  const daysToStart = (record as any).daysToStart ?? calculatedDaysToStart;

  const dayOffset = (dateStr: string, numDays: number) => {
    const d = new Date(dateStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + numDays);
    return d.toISOString().slice(0, 10);
  };

  const hire = journey.hireDate || journey.startDate || "2026-09-01";
  const recent14 = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(dStr => {
    if (dStr < hire) return false;
    const w = new Date(dStr + "T12:00:00Z").getUTCDay();
    return w !== 0 && w !== 6;
  });

  let attPresent = 0, attLate = 0, attAbsent = 0, attExcused = 0, attMissing = 0;
  recent14.forEach(dStr => {
    const match = employeeAttendance.find(a => a.date === dStr);
    const st = match?.status || "Unrecorded";
    if (st === "Present") attPresent++;
    else if (st === "Late") attLate++;
    else if (st === "Absent") attAbsent++;
    else if (st === "Excused") attExcused++;
    else attMissing++;
  });
  const attRecorded = attPresent + attLate + attAbsent + attExcused;
  const attRate = attRecorded ? Math.round(((attPresent + attLate) / attRecorded) * 100) : (journey.day30?.attendancePunctualityScore ? Math.round(journey.day30.attendancePunctualityScore) : 50);

  const timelinePhases = [
    ["Days 1–14", "FST — Fundamental Skill Training", "Assigned Trainer + QDS/QA Lead", 1, 14],
    ["Days 15–28", "PST — Product Skills Training", "Team Leader + Assigned Trainer", 15, 28],
    ["Day 30", "Day 30 Milestone Checkpoint", "Operations Manager + HR Coordinator", 29, 30],
    ["Days 31–59", "Supported Operations (Ramp)", "Team Leader", 31, 59],
    ["Day 60", "Day 60 Mid-Probation Checkpoint", "Operations Manager + HR Coordinator", 60, 60],
    ["Days 61–89", "Performance Consistency", "Team Leader + Operations Manager", 61, 89],
    ["Day 90+", "Day 90 Regularization Disposition", "HR Process Owner + Operations Manager", 90, 120]
  ] as const;

  const activePhaseDef = timelinePhases[selectedPhaseIndex];

  const handleAddAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAttendanceRecord({
      emp: empKey,
      date: attDate,
      status: attStatus,
      source: attSource,
      notes: attNotes
    });
    setShowAddAttendance(false);
    setToastMessage(`Attendance record for ${attDate} logged as ${attStatus}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    addEvidenceItem({
      emp: empKey,
      type: evType,
      title: evTitle.trim(),
      owner: evOwner,
      date: simulatedCurrentDate,
      score: evType === "QDS / QA" ? 88 : undefined,
      notes: evNotes
    });
    setShowAddEvidence(false);
    setEvTitle("");
    setEvNotes("");
    setToastMessage("Document / Evidence item added to employee record.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckIn({
      emp: empKey,
      type: ciType,
      owner: ciOwner,
      date: simulatedCurrentDate,
      confidence: ciConfidence,
      notes: ciNotes
    });
    setShowAddCheckIn(false);
    setCiNotes("");
    setToastMessage("Check-in touchpoint logged.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCoachingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachTitle.trim()) return;
    addCoachingAction({
      emp: empKey,
      title: coachTitle.trim(),
      owner: coachOwner,
      due: coachDue,
      notes: coachNotes,
      status: "Open"
    });
    setShowAddCoaching(false);
    setCoachTitle("");
    setCoachNotes("");
    setToastMessage("Support / Coaching action assigned.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const candidateDisplayName = (record as any).candidateName || (record as any).name || journey.fullName;
  const candidateDisplayEmail = (record as any).candidateEmail || (record as any).email || journey.email;
  const isHandoffDue = (journey.daysElapsed || 1) >= 20 && (!journey.day30Handoff || journey.day30Handoff.status === "Pending");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] z-10 relative my-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              {toastMessage}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL HEADER: EXACT ENTERPRISE HEADER AS IN SCREENSHOT */}
          {/* ======================================================== */}
          <div className="p-4 sm:p-5 bg-[#042C51] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 border-t-4 border-[#FF5C28]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
                {candidateDisplayName.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                    {candidateDisplayName}
                  </h2>

                  {isHandoffDue ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5C28] text-white shadow-2xs flex items-center gap-1">
                      <AlertTriangle size={11} />
                      DAY 30 HANDOFF TO TL PENDING
                    </span>
                  ) : (record as any).onboardingStage ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      {(record as any).onboardingStage}
                    </span>
                  ) : null}

                  {record.finalOutcome === "True Hire" && (
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                      True Hire • Day 1 Completed
                    </span>
                  )}
                </div>

                {/* Subtitle Details Strip */}
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2.5 flex-wrap font-medium">
                  <span>
                    SIB ID: <strong className="text-white font-mono">{journey.sibsEmployeeId || record.convertedEmployeeId || record.id}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Kronos ID: <strong className="text-white font-mono">{journey.kronosId || "Pending"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Account: <strong className="text-white">{record.account || journey.account}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Trainer: <strong className="text-white">{journey.trainerName || "Maria Cruz"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    WFM Station: <strong className="text-white">{journey.wfmSeating ? `${journey.wfmSeating.wing} - ${journey.wfmSeating.seatNumber}` : "Pending"}</strong>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {onOpenOutcomeModal && (
                <button
                  type="button"
                  onClick={() => onOpenOutcomeModal("Show")}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} />
                  Update Stage
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB NAVIGATION STRIP */}
          {/* ======================================================== */}
          <div className="px-5 bg-white border-b border-[#E6ECF2] flex items-center gap-1 overflow-x-auto shrink-0 select-none">
            {[
              { id: "timeline", label: "Journey Timeline", icon: Sparkles },
              { id: "coaching", label: "Coaching & Support", icon: Activity },
              { id: "handoffs", label: "Handoffs", icon: Layers, badge: isHandoffDue ? "Action Due" : undefined },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? "border-[#FF5C28] text-[#FF5C28] bg-orange-50/20" 
                      : "border-transparent text-slate-600 hover:text-[#042C51] hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#FF5C28]" : "text-slate-400"} />
                  {tab.label}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#FF5C28] text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* ACTION BANNER (When Day 30 Handoff is Due or Start Pending) */}
          {/* ======================================================== */}
          {isHandoffDue && (
            <div className="px-5 py-3 bg-orange-50/90 border-b border-orange-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs shrink-0">
                  !
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-xs font-black text-[#042C51]">
                      DAY 30 CHECKPOINT HANDOFF DUE • HR &amp; SUPERVISOR ACTION REQUIRED
                    </strong>
                    <span className="px-2 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      PST &amp; QA Audit Complete (88%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Trainee has completed Product Skills Training (PST) and independent QA audit. Trainer Maria Cruz must endorse custody transfer to Team Leader Anton Reyes for operational Ramp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("handoffs")}
                className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                Perform Handoff →
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCROLLABLE MODAL BODY (UNIFIED FULL-HEIGHT SCROLL AREA) */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-6">

            {/* TAB 1: JOURNEY TIMELINE -> MILESTONE EVALUATIONS VIEW */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                {/* 1. Sub-nav Header Filter Bar */}
                <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl flex items-center justify-between flex-wrap gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#FF5C28]" />
                    <span className="text-xs font-black text-[#042C51] uppercase tracking-wider">Milestone Evaluations</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#BECBDA] shadow-2xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setActiveMilestoneTab("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        activeMilestoneTab === "all" ? "bg-[#042C51] text-white" : "text-[#042C51] hover:bg-slate-100"
                      }`}
                    >
                      All 30 / 60 / 90
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setActiveMilestoneTab("calendar")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeMilestoneTab === "calendar" 
                          ? "bg-[#FF5C28] text-white shadow-xs" 
                          : "text-[#042C51] hover:bg-orange-50 hover:text-[#FF5C28]"
                      }`}
                      title="Daily Performance & 1-on-1 Check-Ins Calendar (Days 1–90)"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Daily Performance Calendar</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                        activeMilestoneTab === "calendar" ? "bg-white/20 text-white" : "bg-orange-100 text-[#FF5C28]"
                      }`}>
                        FST → 90 Days
                      </span>
                    </button>
                  </div>
                </div>

                {activeMilestoneTab === "calendar" ? (
                  <DailyPerformanceCalendarView
                    journey={journey}
                    onOpenCoachingModal={(sessionId) => setSelectedGrowSessionId(sessionId)}
                    onClose={() => setActiveMilestoneTab("all")}
                  />
                ) : (
                  <>
                    {/* 2. Three Milestone Summary Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Day 30 Summary */}
                      <div 
                        onClick={() => setActiveMilestoneTab(30)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          activeMilestoneTab === 30 ? "ring-2 ring-[#FF5C28] border-transparent bg-white shadow-md" : "bg-[#FAFCFF] border-[#E6ECF2] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#042C51]" />
                            <h4 className="text-xs font-black text-[#042C51]">Day 30 Checkpoint</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                            journey.day30?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {journey.day30?.status || "In Progress"}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Nesting QA Score:</span>
                            <strong className="text-base font-black text-[#042C51]">
                              {journey.day30?.nestingQaScore ?? qaScoreVal}%
                            </strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Attendance Adherence:</span>
                            <strong className="text-xs font-bold text-slate-700">
                              {journey.day30?.attendancePunctualityScore ?? 98.5}%
                            </strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Endorsement:</span>
                            <span className="text-[10.5px] font-bold text-[#FF5C28]">
                              {journey.day30?.trainerEndorsement || "Floor Ready"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Day 60 Summary */}
                      <div 
                        onClick={() => setActiveMilestoneTab(60)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          activeMilestoneTab === 60 ? "ring-2 ring-[#FF5C28] border-transparent bg-white shadow-md" : "bg-[#FAFCFF] border-[#E6ECF2] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0B365F]" />
                            <h4 className="text-xs font-black text-[#042C51]">Day 60 Mid-Probation</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                            journey.day60?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : journey.daysElapsed >= 60 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {journey.day60?.status || (journey.daysElapsed >= 60 ? "Pending Review" : "In Progress")}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Core Production:</span>
                            <strong className="text-base font-black text-[#042C51]">
                              {journey.day60?.coreProductionScore || 89}%
                            </strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Average Handle Time:</span>
                            <strong className="text-xs font-bold text-slate-700">
                              {journey.day60?.averageHandleTimeSeconds || 380}s
                            </strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Supervisor Decision:</span>
                            <span className="text-[10.5px] font-bold text-emerald-700 truncate">
                              {journey.day60?.midProbationDecision || "Progressing Well"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Day 90 Summary */}
                      <div 
                        onClick={() => setActiveMilestoneTab(90)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          activeMilestoneTab === 90 ? "ring-2 ring-[#FF5C28] border-transparent bg-white shadow-md" : "bg-[#FAFCFF] border-[#E6ECF2] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FF5C28]" />
                            <h4 className="text-xs font-black text-[#042C51]">Day 90 Regularization</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                            journey.day90?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : journey.daysElapsed >= 90 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {journey.day90?.status || (journey.daysElapsed >= 90 ? "Pending Decision" : "Pending")}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Composite Score:</span>
                            <strong className="text-base font-black text-[#042C51]">
                              {journey.day90?.compositeScore || 91}%
                            </strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Performance Rating:</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} className={i < (journey.day90?.overallPerformanceRating || 4) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-slate-500 font-medium">Final Outcome:</span>
                            <span className="text-[10.5px] font-black text-indigo-700 truncate">
                              {journey.finalOutcome || "Endorse for Regularization"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. First 30 Days: FST & PST Training Details Container */}
                    {(activeMilestoneTab === "all" || activeMilestoneTab === 30) && (
                      <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#042C51] text-white flex items-center justify-center font-black text-xs shadow-xs">
                              <BookOpen size={15} className="text-[#FF5C28]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-extrabold text-[#042C51]">
                                  First 30 Days: FST &amp; PST Training Details
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5C28] border border-orange-200">
                                  Prerequisites to Day 30 Checkpoint
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Curriculum phase evaluations completed during Fundamental and Product Skills Training prior to operational nesting.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Training Foundations Verified
                            </span>
                          </div>
                        </div>

                        {/* FST & PST 2-Column Split Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* FST Card */}
                          <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex flex-col justify-between space-y-3.5">
                            <div>
                              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#042C51] text-white">
                                    Phase 1 • Days 1–14
                                  </span>
                                  <h4 className="text-xs font-black text-[#042C51]">
                                    FST — Fundamental Skill Training
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProcessModal("FST")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#042C51] bg-white border border-[#BECBDA] hover:bg-[#F7F9FC] hover:border-[#FF5C28] hover:text-[#FF5C28] shadow-2xs transition-all cursor-pointer"
                                    title="Open Full View of FST Process"
                                  >
                                    <Eye size={12} className="text-[#FF5C28]" />
                                    <span>Full View</span>
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex items-baseline justify-between">
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium">Phase Assessment Score:</span>
                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <strong className="text-2xl font-black text-[#042C51]">
                                      {fstScoreVal}%
                                    </strong>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      / Target ≥ 80% Passing
                                    </span>
                                  </div>
                                </div>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-[#042C51] border border-blue-200">
                                  Trainer: {journey.trainerName || "Maria Cruz"}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-2">
                                <div 
                                  className="h-full bg-[#042C51] rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, fstScoreVal)}%` }} 
                                />
                              </div>
                            </div>

                            {/* FST Assessment Modules Breakdown */}
                            <div className="space-y-2 pt-1 border-t border-slate-200/60">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                  FST Assessment Modules &amp; Practicals
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedProcessModal("FST")}
                                  className="text-[10.5px] font-bold text-[#FF5C28] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View All 4</span>
                                  <ChevronRight size={11} />
                                </button>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                {fstItems.slice(0, 2).map((item) => (
                                  <div key={item.id} className="p-2.5 rounded-lg bg-white border border-[#E6ECF2] flex items-center justify-between shadow-2xs">
                                    <div className="min-w-0 pr-2">
                                      <strong className="text-[11.5px] text-[#042C51] block truncate">{item.title}</strong>
                                      <span className="text-[10px] text-slate-400">Skill: {item.skill} • Evaluator: {item.grader}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <strong className="text-xs font-black text-[#042C51]">{item.score}%</strong>
                                      <span className="text-[9.5px] text-emerald-600 block font-bold">Passed (≥{item.passing}%)</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedProcessModal("FST")}
                                className="w-full mt-2 py-1.5 px-3 rounded-lg border border-[#BECBDA] bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
                              >
                                <Eye size={12} className="text-[#FF5C28] group-hover:scale-110 transition-transform" />
                                <span>Full View FST Process Details</span>
                              </button>
                            </div>
                          </div>

                          {/* PST Card */}
                          <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex flex-col justify-between space-y-3.5">
                            <div>
                              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FF5C28] text-white">
                                    Phase 2 • Days 15–28
                                  </span>
                                  <h4 className="text-xs font-black text-[#042C51]">
                                    PST — Product Skills Training
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProcessModal("PST")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#042C51] bg-white border border-[#BECBDA] hover:bg-[#F7F9FC] hover:border-[#FF5C28] hover:text-[#FF5C28] shadow-2xs transition-all cursor-pointer"
                                    title="Open Full View of PST Process"
                                  >
                                    <Eye size={12} className="text-[#FF5C28]" />
                                    <span>Full View</span>
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex items-baseline justify-between">
                                <div>
                                  <span className="text-[11px] text-slate-500 font-medium">Phase Assessment Score:</span>
                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <strong className="text-2xl font-black text-[#FF5C28]">
                                      {pstScoreVal}%
                                    </strong>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      / Target ≥ 80% Passing
                                    </span>
                                  </div>
                                </div>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-900 border border-orange-200">
                                  Evaluator: {journey.tl || "Anton Reyes"}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-2">
                                <div 
                                  className="h-full bg-[#FF5C28] rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, pstScoreVal)}%` }} 
                                />
                              </div>
                            </div>

                            {/* PST Assessment Modules Breakdown */}
                            <div className="space-y-2 pt-1 border-t border-slate-200/60">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                  PST Product Assessments &amp; Simulation
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedProcessModal("PST")}
                                  className="text-[10.5px] font-bold text-[#FF5C28] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View All 4</span>
                                  <ChevronRight size={11} />
                                </button>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                {pstItems.slice(0, 2).map((item) => (
                                  <div key={item.id} className="p-2.5 rounded-lg bg-white border border-[#E6ECF2] flex items-center justify-between shadow-2xs">
                                    <div className="min-w-0 pr-2">
                                      <strong className="text-[11.5px] text-[#042C51] block truncate">{item.title}</strong>
                                      <span className="text-[10px] text-slate-400">Account: {journey.account} • Evaluator: {item.grader}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <strong className="text-xs font-black text-[#FF5C28]">{item.score}%</strong>
                                      <span className="text-[9.5px] text-emerald-600 block font-bold">Passed (≥{item.passing}%)</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedProcessModal("PST")}
                                className="w-full mt-2 py-1.5 px-3 rounded-lg border border-[#BECBDA] bg-white hover:bg-slate-50 text-[#042C51] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
                              >
                                <Eye size={12} className="text-[#FF5C28] group-hover:scale-110 transition-transform" />
                                <span>Full View PST Process Details</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Explanatory footer linking FST/PST into Day 30 Nesting */}
                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                            <span>
                              <strong>Training Foundation Endorsement:</strong> FST and PST phase scores evaluate foundational curriculum competence and directly substantiate the <strong>Day 30 Checkpoint Trainer Endorsement</strong>.
                            </span>
                          </div>
                          <div className="font-mono text-[11px] font-bold shrink-0 text-amber-800">
                            Combined Avg: {Math.round(((fstScoreVal || 84) + (pstScoreVal || 91)) / 2)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}



            {/* TAB: COACHING & SUPPORT */}
            {activeTab === "coaching" && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">
                        ESEP • COACHING &amp; DEVELOPMENT OUTCOMES
                      </span>
                      <h3 className="text-base font-black text-[#042C51] mt-0.5">
                        Coaching outcomes • {candidateDisplayName}
                      </h3>
                      <p className="text-[11.5px] text-slate-500 mt-0.5">
                        Read-only development results: coaching observations, agreed commitments, follow-up findings and measured KPI changes when recorded.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                        {employeeEsepSessions.filter(s => evaluationFor(s, esepEvaluations)).length} evaluated / {employeeEsepSessions.length} GROW sessions
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCoaching(!showAddCoaching)}
                        className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus size={13} />
                        Assign Action Item
                      </button>
                    </div>
                  </div>

                  {/* Add Action Item Inline Form */}
                  {showAddCoaching && (
                    <form onSubmit={handleAddCoachingSubmit} className="p-4 rounded-xl bg-[#F7F9FC] border border-[#BECBDA] space-y-3 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <strong className="text-xs font-black text-[#042C51]">Assign Support / Action Item</strong>
                        <span className="text-[10px] text-slate-400 font-semibold">Assignee: {candidateDisplayName}</span>
                      </div>
                      <div>
                        <label className="block font-bold text-[#042C51] mb-1">Action Title</label>
                        <input
                          type="text"
                          value={coachTitle}
                          onChange={e => setCoachTitle(e.target.value)}
                          placeholder="e.g. Systems Navigation & Probing Practice"
                          className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs bg-white focus:ring-1 focus:ring-[#FF5C28]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-[#042C51] mb-1">Owner / Facilitator</label>
                          <input
                            type="text"
                            value={coachOwner}
                            onChange={e => setCoachOwner(e.target.value)}
                            className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#042C51] mb-1">Target Due Date</label>
                          <input
                            type="date"
                            value={coachDue}
                            onChange={e => setCoachDue(e.target.value)}
                            className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-[#042C51] mb-1">Development Notes &amp; Plan</label>
                        <textarea
                          rows={2}
                          value={coachNotes}
                          onChange={e => setCoachNotes(e.target.value)}
                          placeholder="Specific action steps or shadow guidelines..."
                          className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCoaching(false)}
                          className="px-3 py-1 rounded-lg border border-[#BECBDA] text-slate-600 text-xs font-semibold hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold shadow-xs"
                        >
                          Assign Action
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of ESEP GROW Coaching Sessions */}
                  {employeeEsepSessions.length > 0 ? (
                    <div className="space-y-4 pt-1">
                      {employeeEsepSessions.map((session) => {
                        const evaluation = evaluationFor(session, esepEvaluations);
                        const comparison = kpiComparison(evaluation);
                        const status = coachingStatus(session, esepEvaluations, simulatedCurrentDate);

                        return (
                          <div 
                            key={session.id} 
                            className="rounded-2xl border border-[#E6ECF2] bg-[#FAFCFF] p-4 sm:p-5 space-y-4 shadow-2xs hover:border-[#FF5C28]/30 transition-colors"
                          >
                            {/* Session Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-extrabold text-[#042C51]">
                                    {session.type} • {session.date}
                                  </h4>
                                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700">
                                    ESEP-{session.id}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                  Facilitator: <strong className="text-slate-700">{session.facilitator}</strong> ({session.facilitatorRole})
                                  {session.taskOrder ? ` • ${session.taskOrder}` : ""}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {session.reasons && session.reasons.length > 0 && (
                                  <div className="hidden md:flex items-center gap-1">
                                    {session.reasons.map((r, ri) => (
                                      <span key={ri} className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {r}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                                  status === "Evaluated" 
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                    : status === "Overdue" 
                                    ? "bg-red-100 text-red-800 border border-red-200" 
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}>
                                  {status}
                                </span>
                              </div>
                            </div>

                            {/* 2-Column Grid (Goal, Observed Behavior, Agreed Action, Commitment Follow-up) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-xl bg-white border border-[#E6ECF2] space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                  COACHING GOAL
                                </span>
                                <p className="font-bold text-[#042C51] text-xs leading-snug">
                                  {session.goal}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-[#E6ECF2] space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                  ISSUE / OBSERVED BEHAVIOR
                                </span>
                                <p className="font-bold text-slate-700 text-xs leading-snug">
                                  {session.reality}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-[#E6ECF2] space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                  AGREED ACTION / WAY FORWARD
                                </span>
                                <p className="font-bold text-[#042C51] text-xs leading-snug">
                                  {session.will || session.actionPlan}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-[#E6ECF2] space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                  COMMITMENT FOLLOW-UP
                                </span>
                                <p className="font-bold text-[#042C51] text-xs">
                                  {session.due || "Pending schedule"}
                                </p>
                              </div>
                            </div>

                            {/* Follow-up Evaluation Banner */}
                            {evaluation ? (
                              <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <strong className="text-emerald-950 font-extrabold">
                                    Follow-up result • {comparison ? `Recorded KPI ${comparison.before} → ${comparison.after} (${comparison.differenceLabel})` : "Follow-up Evaluated"}
                                  </strong>
                                </div>
                                <p className="text-emerald-900 font-medium pl-6 leading-relaxed">
                                  {evaluation.notes}
                                </p>
                                <p className="text-[10.5px] text-emerald-700 font-semibold pl-6 pt-0.5">
                                  Reviewed {evaluation.date} • {evaluation.owner} • Evidence: {evaluation.source}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>Awaiting supervisor follow-up evaluation. Target commitment due: <strong>{session.due}</strong></span>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase text-amber-800">Pending Review</span>
                              </div>
                            )}

                            {/* View GROW Details Button */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedGrowSessionId(session.id)}
                                className="px-3.5 py-1.5 rounded-xl border border-[#BECBDA] text-[#042C51] bg-white hover:bg-[#F7F9FC] hover:border-[#FF5C28] hover:text-[#FF5C28] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                              >
                                <Eye size={13} className="text-[#FF5C28]" />
                                <span>View GROW details</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl border border-dashed border-[#BECBDA] bg-[#FAFCFF] space-y-2">
                      <p className="text-xs font-semibold text-slate-500">
                        No ESEP GROW coaching sessions recorded for {candidateDisplayName}.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Candidate is tracking within operational benchmarks. You can assign action items or record new coaching logs.
                      </p>
                    </div>
                  )}
                </div>

                {/* Assigned Support & Action Items (Local Coaching Actions) */}
                <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                        Support &amp; Action Item Checklist ({employeeCoaching.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Individual task assignments and corrective development items.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {employeeCoaching.length > 0 ? (
                      employeeCoaching.map(co => (
                        <div key={co.id} className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-bold text-[#042C51]">{co.title}</strong>
                              <span className={`px-2 py-0.2 rounded text-[9.5px] font-extrabold ${
                                co.status === "Done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {co.status}
                              </span>
                            </div>
                            {co.notes && <p className="text-xs text-slate-600">{co.notes}</p>}
                            <span className="text-[10px] text-slate-400 block">Owner: {co.owner} • Due: {co.due}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleCoachingAction(co.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] cursor-pointer shadow-2xs"
                          >
                            {co.status === "Done" ? "Reopen" : "Mark Complete"}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        No additional action items assigned.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: HANDOFFS */}
            {activeTab === "handoffs" && (
              <div className="space-y-4">
                {/* Day 30 Trainer -> Team Leader Handoff Card */}
                <Day30HandoffCard 
                  journey={journey}
                  onUpdateSuccess={msg => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                />

                {/* Transition Lifecycle */}
                <div className="bg-white rounded-xl border border-[#E6ECF2] p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#042C51]">Transition Lifecycle</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-[#FAFCFF] border border-[#E6ECF2] flex items-center justify-between">
                      <div>
                        <strong className="text-[#042C51] block">1. NHO → Training Induction</strong>
                        <span className="text-slate-500 text-[11px]">Endorsed by TA Recruiter: {record.owner || "Alena Batacan"}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Completed</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFCFF] border border-[#E6ECF2] flex items-center justify-between">
                      <div>
                        <strong className="text-[#042C51] block">2. Training → Live Operations (Day 30)</strong>
                        <span className="text-slate-500 text-[11px]">Trainer {journey.trainerName || "Maria Cruz"} ➔ TL {journey.tl || "Anton Reyes"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        journey.day30Handoff?.status === "Accepted" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {journey.day30Handoff?.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}



            </div>

          {/* Submodals for FST / PST full view process and Grow session */}
          {selectedProcessModal && (
            <TrainingProcessDetailModal
              processType={selectedProcessModal}
              journey={journey}
              isOpen={!!selectedProcessModal}
              onClose={() => setSelectedProcessModal(null)}
              scoreVal={selectedProcessModal === "FST" ? fstScoreVal : pstScoreVal}
              evaluatorName={selectedProcessModal === "FST" ? (journey.trainerName || "Maria Cruz") : (journey.tl || "Anton Reyes")}
              items={selectedProcessModal === "FST" ? fstItems : pstItems}
            />
          )}

          {selectedGrowSessionId && (
            <TrainerCoachingDetailsModal
              employee={journey}
              sessions={esepSessions}
              evaluations={esepEvaluations}
              asOf={simulatedCurrentDate}
              initialSessionId={selectedGrowSessionId}
              onClose={() => setSelectedGrowSessionId(null)}
            />
          )}

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-[#F7F9FC] border-t border-[#E6ECF2] flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Candidate Owner: <strong className="text-[#042C51]">{record.owner || "Alena Batacan"}</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
