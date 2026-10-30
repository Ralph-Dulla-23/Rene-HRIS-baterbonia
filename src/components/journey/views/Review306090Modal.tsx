import React, { useState } from "react";
import { EmployeeJourney, ReviewRecord } from "../journeyTypes";
import { useJourney } from "../JourneyContext";
import { 
  X, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Star,
  Check,
  Edit3,
  Save,
  ChevronRight,
  BookOpen,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { useDemoAuth } from "../../../auth/DemoAuthContext";
import { getEmphasizedEmployeeStatus } from "../employeeStatusUtils";
import TrainingProcessDetailModal from "./TrainingProcessDetailModal";
import TrainerCoachingDetailsModal from "../TrainerCoachingDetailsModal";
import DailyPerformanceCalendarView from "./DailyPerformanceCalendarView";
import { 
  coachingForEmployee, 
  evaluationFor, 
  kpiComparison, 
  coachingStatus 
} from "../trainerCoachingUtils";

interface Review306090ModalProps {
  journey: EmployeeJourney;
  isOpen: boolean;
  onClose: () => void;
  initialMilestone?: 30 | 60 | 90;
}

export default function Review306090Modal({
  journey,
  isOpen,
  onClose,
  initialMilestone = 30
}: Review306090ModalProps) {
  const { 
    updateDay30Milestone, 
    updateDay60Milestone, 
    updateDay90Milestone, 
    setFinalEmploymentOutcome,
    phaseTrainingScores,
    assessments,
    assessmentGrades,
    evidence,
    esepSessions,
    esepEvaluations,
    simulatedCurrentDate
  } = useJourney();

  const { user } = useDemoAuth();
  const coachRoles = ["Trainer", "Team Leader", "Manager", "SOM", "QDS", "HR", "HR Admin", "Super Admin"];
  const canEditReviews = !user || coachRoles.includes(user.role);

  // Active milestone tab: "all" | 30 | 60 | 90 | "calendar"
  const [activeMilestoneTab, setActiveMilestoneTab] = useState<"all" | 30 | 60 | 90 | "calendar">(() => {
    if (journey.daysElapsed >= 90) return 90;
    if (journey.daysElapsed >= 60) return 60;
    return initialMilestone;
  });

  const [selectedGrowSessionId, setSelectedGrowSessionId] = useState<number | null>(null);
  const employeeEsepSessions = coachingForEmployee(esepSessions, journey);

  // Day 30 Form State
  const [isEditingDay30, setIsEditingDay30] = useState(false);
  const [day30Qa, setDay30Qa] = useState(journey.day30?.nestingQaScore ?? 88);
  const [day30Att, setDay30Att] = useState(journey.day30?.attendancePunctualityScore ?? 98.5);
  const [day30Endorsement, setDay30Endorsement] = useState(journey.day30?.trainerEndorsement || "Floor Ready");
  const [day30Notes, setDay30Notes] = useState(journey.day30?.trainerNotes || "");

  // Day 60 Form State
  const [isEditingDay60, setIsEditingDay60] = useState(false);
  const [day60Prod, setDay60Prod] = useState(journey.day60?.coreProductionScore ?? 89);
  const [day60Aht, setDay60Aht] = useState(journey.day60?.averageHandleTimeSeconds ?? 380);
  const [day60Decision, setDay60Decision] = useState(journey.day60?.midProbationDecision || "Progressing Well");
  const [day60Notes, setDay60Notes] = useState(journey.day60?.supervisorNotes || "");

  // Day 90 Form State
  const [isEditingDay90, setIsEditingDay90] = useState(false);
  const [day90Composite, setDay90Composite] = useState(journey.day90?.compositeScore ?? 91);
  const [day90Rating, setDay90Rating] = useState(journey.day90?.overallPerformanceRating ?? 4);
  const [day90Recommendation, setDay90Recommendation] = useState(journey.finalOutcome || "Endorse for Regularization");
  const [day90HrNotes, setDay90HrNotes] = useState(journey.day90?.hrOperationsSignOff?.remarks || "");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProcessModal, setSelectedProcessModal] = useState<"FST" | "PST" | null>(null);

  if (!isOpen) return null;

  const empKey = journey.sibsEmployeeId || journey.id;
  const fstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "FST");
  const pstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "PST");
  
  const fstScoreVal = fstScoreObj?.score ?? journey.day30Handoff?.fstScore ?? 82;
  const pstScoreVal = pstScoreObj?.score ?? journey.day30Handoff?.pstScore ?? (journey.daysElapsed >= 15 ? 84 : null);

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
        score: g ? g.score : (a.id === 8103 ? 85 : 41),
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
        score: g ? g.score : (a.id === 8101 ? 86 : a.id === 8102 ? 89 : 88),
        grader: g?.grader || journey.trainerName || "Maria Cruz",
        date: g?.date || "2026-10-10"
      };
    });

  const qaEvid = evidence.filter(e => (e.emp === empKey || e.emp === journey.id) && e.type === "QDS / QA");
  const qaScoreVal = qaEvid.length > 0 ? Math.round(qaEvid.reduce((acc, ev) => acc + (ev.score || 85), 0) / qaEvid.length) : (journey.day30?.nestingQaScore ?? 88);

  const emphasizedStatus = getEmphasizedEmployeeStatus(journey);

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
    setFinalEmploymentOutcome(journey.id, day90Recommendation, day90HrNotes, user?.name || "HR Operations Lead");
    setIsEditingDay90(false);
    showToast("Day 90 Regularization Review & Outcome updated successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-[#E6ECF2] my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* Modal Header: Employee Review Identity */}
        <div className="p-5 sm:p-6 bg-[#042C51] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b-2 border-[#FF5C28]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
              {journey.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {journey.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5C28] text-white shadow-2xs">
                  30 / 60 / 90 Review
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${emphasizedStatus.badgeClass}`}>
                  {emphasizedStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span className="font-mono text-white font-bold">{journey.sibsEmployeeId || journey.id}</span>
                <span>•</span>
                <span>{journey.roleTitle || "Trainee Advocate"}</span>
                <span>•</span>
                <span>{journey.account} ({journey.siteLocation})</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">Day {journey.daysElapsed || 1} of 90</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close 30/60/90 Review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 30/60/90 Navigation & Subheader */}
        <div className="px-6 py-3 bg-[#F7F9FC] border-b border-[#E6ECF2] flex items-center justify-between flex-wrap gap-2 shrink-0">
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
            <button
              type="button"
              onClick={() => setActiveMilestoneTab(30)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeMilestoneTab === 30 ? "bg-[#FF5C28] text-white" : "text-[#042C51] hover:bg-slate-100"
              }`}
            >
              Day 30 Checkpoint
              {journey.day30?.status === "Completed" && <Check className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveMilestoneTab(60)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeMilestoneTab === 60 ? "bg-[#FF5C28] text-white" : "text-[#042C51] hover:bg-slate-100"
              }`}
            >
              Day 60 Mid-Probation
              {journey.day60?.status === "Completed" && <Check className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveMilestoneTab(90)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeMilestoneTab === 90 ? "bg-[#FF5C28] text-white" : "text-[#042C51] hover:bg-slate-100"
              }`}
            >
              Day 90 Regularization
              {journey.day90?.status === "Completed" && <Check className="w-3 h-3" />}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeMilestoneTab === "calendar" ? (
            <DailyPerformanceCalendarView
              journey={journey}
              onOpenCoachingModal={(sessionId) => setSelectedGrowSessionId(sessionId)}
              onClose={() => setActiveMilestoneTab("all")}
            />
          ) : (
            <>
              {/* 30-60-90 Score Summary Cards Banner */}
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
                  {journey.day60?.status || (journey.daysElapsed >= 60 ? "Pending Review" : "Upcoming")}
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
                  {journey.day90?.status || (journey.daysElapsed >= 90 ? "Pending Decision" : "Upcoming")}
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

          {/* ======================================================== */}
          {/* FIRST 30 DAYS: FST & PST TRAINING FOUNDATIONS DETAILS */}
          {/* ======================================================== */}
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
                {/* 1. FST Card */}
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
                        Trainer: {fstScoreObj?.owner || journey.trainerName || "Maria Cruz"}
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

                {/* 2. PST Card */}
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
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          pstScoreVal !== null ? "text-emerald-700 bg-emerald-100" : "text-amber-700 bg-amber-100"
                        }`}>
                          {pstScoreVal !== null ? "Completed" : "In Progress"}
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
                            {pstScoreVal !== null ? `${pstScoreVal}%` : "Not Scored"}
                          </strong>
                          <span className="text-[11px] text-slate-400 font-medium">
                            / Target ≥ 80% Passing
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-900 border border-orange-200">
                        Evaluator: {pstScoreObj?.owner || journey.tl || "Anton Reyes"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full bg-[#FF5C28] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, pstScoreVal || 0)}%` }} 
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
                    <strong>Training Foundation Endorsement:</strong> FST and PST phase scores evaluate foundational curriculum competence and directly substantiate the <strong>Day 30 Checkpoint Trainer Endorsement</strong> below.
                  </span>
                </div>
                <div className="font-mono text-[11px] font-bold shrink-0 text-amber-800">
                  Combined Avg: {Math.round(((fstScoreVal || 80) + (pstScoreVal || 80)) / 2)}%
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: DAY 30 CHECKPOINT REVIEW DETAILS */}
          {/* ======================================================== */}
          {(activeMilestoneTab === "all" || activeMilestoneTab === 30) && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#042C51] text-white font-black text-xs flex items-center justify-center">
                    30
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#042C51]">Day 30 Checkpoint Review</h3>
                    <p className="text-[11px] text-slate-500">
                      Evaluates Nesting phase performance, quality standards, and initial floor readiness.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    journey.day30?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {journey.day30?.status || "In Progress"}
                  </span>
                  {canEditReviews && !isEditingDay30 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDay30(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit Review
                    </button>
                  )}
                </div>
              </div>

              {isEditingDay30 ? (
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#BECBDA] space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Nesting QA Score (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={day30Qa}
                        onChange={e => setDay30Qa(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Attendance Adherence (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={day30Att}
                        onChange={e => setDay30Att(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Trainer Endorsement</label>
                      <select
                        value={day30Endorsement}
                        onChange={e => setDay30Endorsement(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51] bg-white"
                      >
                        <option value="Floor Ready">Floor Ready</option>
                        <option value="Developing with Support">Developing with Support</option>
                        <option value="Extended Nesting Required">Extended Nesting Required</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#042C51] mb-1">Trainer Evaluation Notes & Recommendations</label>
                    <textarea
                      rows={2}
                      value={day30Notes}
                      onChange={e => setDay30Notes(e.target.value)}
                      placeholder="Add specific comments regarding candidate proficiency..."
                      className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs text-[#042C51]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDay30(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#BECBDA] text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDay30}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save size={13} />
                      Save Day 30 Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Nesting QA Score</span>
                      <strong className="text-lg font-black text-[#042C51] mt-0.5 block">
                        {journey.day30?.nestingQaScore ?? qaScoreVal}%
                      </strong>
                      <span className="text-[9.5px] text-emerald-600 font-semibold">Quality target: 85%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Attendance Adherence</span>
                      <strong className="text-lg font-black text-[#042C51] mt-0.5 block">
                        {journey.day30?.attendancePunctualityScore ?? 98.5}%
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-semibold">Target: 95%+</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Trainer Endorsement</span>
                      <strong className="text-sm font-black text-[#FF5C28] mt-1 block">
                        {journey.day30?.trainerEndorsement || "Floor Ready"}
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-medium">Evaluated by {journey.trainerName || "L&D Trainer"}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Review Date</span>
                      <strong className="text-xs font-black text-[#042C51] mt-1 block">
                        {journey.day30?.completedDate || (journey.daysElapsed >= 30 ? "Completed on Day 30" : "Pending Day 30")}
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-medium">Sign-off: Recorded</span>
                    </div>
                  </div>

                  {journey.day30?.trainerNotes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <strong className="text-[#042C51] block text-[11px] mb-0.5">Trainer Assessment Notes:</strong>
                      <p className="text-slate-600 italic">{journey.day30.trainerNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: DAY 60 MID-PROBATION REVIEW DETAILS */}
          {/* ======================================================== */}
          {(activeMilestoneTab === "all" || activeMilestoneTab === 60) && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0B365F] text-white font-black text-xs flex items-center justify-center">
                    60
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#042C51]">Day 60 Mid-Probation Review</h3>
                    <p className="text-[11px] text-slate-500">
                      Evaluates live production ramp, SLA adherence, and supervisor performance validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    journey.day60?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : journey.daysElapsed >= 60 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {journey.day60?.status || (journey.daysElapsed >= 60 ? "Pending Review" : "Upcoming")}
                  </span>
                  {canEditReviews && !isEditingDay60 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDay60(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit Review
                    </button>
                  )}
                </div>
              </div>

              {isEditingDay60 ? (
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#BECBDA] space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Core Production Score (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={day60Prod}
                        onChange={e => setDay60Prod(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Average Handle Time (Seconds)</label>
                      <input
                        type="number"
                        min={0}
                        max={1200}
                        value={day60Aht}
                        onChange={e => setDay60Aht(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Supervisor Mid-Probation Decision</label>
                      <select
                        value={day60Decision}
                        onChange={e => setDay60Decision(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51] bg-white"
                      >
                        <option value="Progressing Well">Progressing Well</option>
                        <option value="On Track">On Track</option>
                        <option value="Performance Improvement Plan">Performance Improvement Plan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#042C51] mb-1">Supervisor Review Notes & Feedback</label>
                    <textarea
                      rows={2}
                      value={day60Notes}
                      onChange={e => setDay60Notes(e.target.value)}
                      placeholder="Enter supervisor mid-probation comments..."
                      className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs text-[#042C51]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDay60(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#BECBDA] text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDay60}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save size={13} />
                      Save Day 60 Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Production Score</span>
                      <strong className="text-lg font-black text-[#042C51] mt-0.5 block">
                        {journey.day60?.coreProductionScore || 89}%
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-semibold">Account target: 85%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Average Handle Time</span>
                      <strong className="text-lg font-black text-[#042C51] mt-0.5 block">
                        {journey.day60?.averageHandleTimeSeconds || 380}s
                      </strong>
                      <span className="text-[9.5px] text-emerald-600 font-semibold">Within target range</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Mid-Probation Decision</span>
                      <strong className="text-sm font-black text-emerald-700 mt-1 block">
                        {journey.day60?.midProbationDecision || "Progressing Well"}
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-medium">By {journey.tl || "Team Leader"}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Review Date</span>
                      <strong className="text-xs font-black text-[#042C51] mt-1 block">
                        {journey.day60?.completedDate || (journey.daysElapsed >= 60 ? "Completed on Day 60" : "Pending Day 60")}
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-medium">Supervisor Sign-off</span>
                    </div>
                  </div>

                  {journey.day60?.supervisorNotes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <strong className="text-[#042C51] block text-[11px] mb-0.5">Supervisor Evaluation Notes:</strong>
                      <p className="text-slate-600 italic">{journey.day60.supervisorNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Day 60 Coaching Record / Table: Undergone ESEP Coaching History */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF5C28]" />
                    <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                      Day 31–60 Ramp Coaching &amp; Intervention Record
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    employeeEsepSessions.length > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {employeeEsepSessions.length > 0 
                      ? `${employeeEsepSessions.length} Undergone Coaching Session(s)` 
                      : "No Remedial Coaching Required"}
                  </span>
                </div>

                {employeeEsepSessions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-[#E6ECF2] bg-white">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-[#F7F9FC] text-slate-500 font-bold text-[10px] uppercase">
                            <th className="py-2.5 px-3">Date &amp; ID</th>
                            <th className="py-2.5 px-3">Coach / Facilitator</th>
                            <th className="py-2.5 px-3">Session Type</th>
                            <th className="py-2.5 px-3">Goal &amp; Agreed Action (GROW)</th>
                            <th className="py-2.5 px-3">Follow-up &amp; Measured Result</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {employeeEsepSessions.map((session) => {
                            const evalObj = evaluationFor(session, esepEvaluations);
                            const comp = kpiComparison(evalObj);

                            return (
                              <tr key={session.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="font-bold text-[#042C51] block text-xs">{session.date}</span>
                                  <span className="font-mono text-[10px] text-slate-500">ESEP-{session.id}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <strong className="text-[#042C51] block text-xs">{session.facilitator}</strong>
                                  <span className="text-[10px] text-slate-500">{session.facilitatorRole}</span>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {session.type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 max-w-xs">
                                  <strong className="text-[#042C51] block text-xs line-clamp-1">{session.goal}</strong>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{session.will || session.actionPlan}</p>
                                </td>
                                <td className="py-2.5 px-3">
                                  {evalObj ? (
                                    <div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block mb-0.5">
                                        {comp ? `KPI Lift: ${comp.before} → ${comp.after} (${comp.differenceLabel})` : "Evaluated"}
                                      </span>
                                      <p className="text-[10px] text-slate-600 line-clamp-1">{evalObj.notes}</p>
                                    </div>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Due {session.due || "Pending"}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGrowSessionId(session.id)}
                                    className="px-2.5 py-1 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye size={12} />
                                    <span>View GROW</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-[#042C51] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#FF5C28] shrink-0" />
                        <span className="font-medium text-[11.5px]">
                          <strong>Supervisor Coaching Validation:</strong> Documented GROW coaching intervention directly supported production readiness, evidencing positive performance recovery (+6%) prior to Day 60 sign-off.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedGrowSessionId(employeeEsepSessions[0]?.id ?? 1)}
                        className="text-[#FF5C28] hover:text-[#e04f20] hover:underline font-bold text-xs shrink-0 pl-2 cursor-pointer transition-colors"
                      >
                        View Coaching Details →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs flex items-center justify-between">
                    <p className="text-slate-600">
                      <strong>No coaching interventions required:</strong> Employee performed within acceptable quality and production benchmarks during Days 31–60 without needing escalated 1:1 or QA coaching.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedGrowSessionId(employeeEsepSessions[0]?.id ?? 1)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#BECBDA] text-[#042C51] font-bold hover:bg-slate-50 text-[11px] cursor-pointer"
                    >
                      Browse Coaching Records
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: DAY 90 REGULARIZATION DISPOSITION DETAILS */}
          {/* ======================================================== */}
          {(activeMilestoneTab === "all" || activeMilestoneTab === 90) && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#FF5C28] text-white font-black text-xs flex items-center justify-center">
                    90
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#042C51]">Day 90 Regularization Review & Final Disposition</h3>
                    <p className="text-[11px] text-slate-500">
                      Comprehensive 90-day probationary review and formal employment regularization recommendation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    journey.day90?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : journey.daysElapsed >= 90 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {journey.day90?.status || (journey.daysElapsed >= 90 ? "Pending Decision" : "Upcoming")}
                  </span>
                  {canEditReviews && !isEditingDay90 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDay90(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit Review
                    </button>
                  )}
                </div>
              </div>

              {isEditingDay90 ? (
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#BECBDA] space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Composite Score (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={day90Composite}
                        onChange={e => setDay90Composite(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Performance Rating (1–5 Stars)</label>
                      <select
                        value={day90Rating}
                        onChange={e => setDay90Rating(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51] bg-white"
                      >
                        <option value={5}>5 — Outstanding (Exceeds Expectations)</option>
                        <option value={4}>4 — Commendable (Consistently Meets & Exceeds)</option>
                        <option value={3}>3 — Proficient (Meets Expectations)</option>
                        <option value={2}>2 — Marginal (Developing with Gaps)</option>
                        <option value={1}>1 — Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-[#042C51] mb-1">Final Regularization Recommendation</label>
                      <select
                        value={day90Recommendation}
                        onChange={e => setDay90Recommendation(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51] bg-white"
                      >
                        <option value="Endorse for Regularization">Endorse for Regularization</option>
                        <option value="Extend Probation (30 Days)">Extend Probation (30 Days)</option>
                        <option value="Non-regularization Separation">Non-regularization Separation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#042C51] mb-1">HR Operations Sign-Off Comments</label>
                    <textarea
                      rows={2}
                      value={day90HrNotes}
                      onChange={e => setDay90HrNotes(e.target.value)}
                      placeholder="Enter HR operations review remarks and regularization sign-off justification..."
                      className="w-full p-2 rounded-lg border border-[#BECBDA] text-xs text-[#042C51]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDay90(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#BECBDA] text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDay90}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save size={13} />
                      Save Regularization Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Final Composite Score</span>
                      <strong className="text-lg font-black text-[#042C51] mt-0.5 block">
                        {journey.day90?.compositeScore || 91}%
                      </strong>
                      <span className="text-[9.5px] text-emerald-600 font-semibold">Regularization threshold: 85%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Overall Rating</span>
                      <div className="flex items-center gap-1 mt-1">
                        <strong className="text-sm font-black text-[#042C51]">
                          {journey.day90?.overallPerformanceRating || 4} / 5
                        </strong>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < (journey.day90?.overallPerformanceRating || 4) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-semibold">Formal appraisal</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">Regularization Endorsement</span>
                      <strong className="text-sm font-black text-indigo-700 mt-1 block">
                        {journey.finalOutcome || "Endorse for Regularization"}
                      </strong>
                      <span className="text-[9.5px] text-slate-500 font-medium">Formal HR Recommendation</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                      <span className="text-[10px] text-slate-500 font-bold block">HR Operations Sign-off</span>
                      <strong className="text-xs font-black text-[#042C51] mt-1 block">
                        {journey.day90?.hrOperationsSignOff?.signedBy || "HR Operations Lead"}
                      </strong>
                      <span className="text-[9.5px] text-emerald-600 font-medium">
                        {journey.day90?.hrOperationsSignOff?.signedAt || "Sign-off Recorded"}
                      </span>
                    </div>
                  </div>

                  {journey.day90?.hrOperationsSignOff?.remarks && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <strong className="text-[#042C51] block text-[11px] mb-0.5">HR Operations Remarks:</strong>
                      <p className="text-slate-600 italic">{journey.day90.hrOperationsSignOff.remarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Day 90 Coaching History & Evidence: Undergone ESEP Coaching across 90-Day Lifecycle */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF5C28]" />
                    <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                      Day 1–90 Probationary Coaching &amp; Regularization Evidence
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    employeeEsepSessions.length > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {employeeEsepSessions.length > 0 
                      ? `${employeeEsepSessions.length} Lifetime Coaching Record(s) Evaluated` 
                      : "Probation Completed with 0 Remedial Actions"}
                  </span>
                </div>

                {employeeEsepSessions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-[#E6ECF2] bg-white">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-[#F7F9FC] text-slate-500 font-bold text-[10px] uppercase">
                            <th className="py-2.5 px-3">Date &amp; ID</th>
                            <th className="py-2.5 px-3">Coach / Facilitator</th>
                            <th className="py-2.5 px-3">Session Type</th>
                            <th className="py-2.5 px-3">Coaching Focus (GROW)</th>
                            <th className="py-2.5 px-3">Measured Outcome &amp; Evidence</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {employeeEsepSessions.map((session) => {
                            const evalObj = evaluationFor(session, esepEvaluations);
                            const comp = kpiComparison(evalObj);

                            return (
                              <tr key={session.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="font-bold text-[#042C51] block text-xs">{session.date}</span>
                                  <span className="font-mono text-[10px] text-slate-500">ESEP-{session.id}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <strong className="text-[#042C51] block text-xs">{session.facilitator}</strong>
                                  <span className="text-[10px] text-slate-500">{session.facilitatorRole}</span>
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {session.type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 max-w-xs">
                                  <strong className="text-[#042C51] block text-xs line-clamp-1">{session.goal}</strong>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{session.will || session.actionPlan}</p>
                                </td>
                                <td className="py-2.5 px-3">
                                  {evalObj ? (
                                    <div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block mb-0.5">
                                        {comp ? `Verified KPI Lift: ${comp.before} → ${comp.after} (${comp.differenceLabel})` : "Evaluated & Cleared"}
                                      </span>
                                      <p className="text-[10px] text-slate-600 line-clamp-1">{evalObj.notes}</p>
                                    </div>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Follow-up Due: {session.due}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGrowSessionId(session.id)}
                                    className="px-2.5 py-1 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye size={12} />
                                    <span>View GROW</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[11.5px]">
                          <strong>Regularization Coaching Clearance:</strong> All coaching commitments documented under the ESEP framework have verified follow-up outcomes, supporting the regularization recommendation.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedGrowSessionId(employeeEsepSessions[0]?.id ?? 1)}
                        className="text-emerald-800 hover:text-emerald-950 hover:underline font-bold text-xs shrink-0 pl-2 cursor-pointer transition-colors"
                      >
                        Review Coaching Evidence →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs flex items-center justify-between">
                    <p className="text-slate-600">
                      <strong>Clean Probationary Record:</strong> No corrective or remedial coaching sessions were logged. The candidate met all independent QA and production standards autonomously.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedGrowSessionId(employeeEsepSessions[0]?.id ?? 1)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#BECBDA] text-[#042C51] font-bold hover:bg-slate-50 text-[11px] cursor-pointer"
                    >
                      Browse Coaching Records
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: 30 / 60 / 90 PROGRESSION COMPARISON TABLE */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                  30 / 60 / 90 Progression Comparison Summary
                </h4>
                <p className="text-[11px] text-slate-500">
                  Official trajectory across all three probationary milestone evaluations.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-2 px-3">Evaluation Parameter</th>
                      <th className="py-2 px-3">Day 30 Review</th>
                      <th className="py-2 px-3">Day 60 Review</th>
                      <th className="py-2 px-3">Day 90 Review</th>
                      <th className="py-2 px-3">Trajectory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Performance Metric</td>
                      <td className="py-2.5 px-3">QA: {journey.day30?.nestingQaScore ?? qaScoreVal}%</td>
                      <td className="py-2.5 px-3">Production: {journey.day60?.coreProductionScore || 89}%</td>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Composite: {journey.day90?.compositeScore || 91}%</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">▲ Upward (+3%)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Evaluation Focus</td>
                      <td className="py-2.5 px-3 text-slate-600">Nesting &amp; Quality Floor Readiness</td>
                      <td className="py-2.5 px-3 text-slate-600">Live Production Ramp &amp; AHT</td>
                      <td className="py-2.5 px-3 text-slate-600">90-Day Regularization Appraisal</td>
                      <td className="py-2.5 px-3 text-slate-500 font-semibold">Standard Lifecycle</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Sign-off Authority</td>
                      <td className="py-2.5 px-3">{journey.trainerName || "Assigned Trainer"}</td>
                      <td className="py-2.5 px-3">{journey.tl || "Team Leader"}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#042C51]">Operations Manager &amp; HR</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-bold">HR Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Coaching Undergone</td>
                      <td className="py-2.5 px-3 text-slate-500">0 Remedial Actions (FST/PST)</td>
                      <td className="py-2.5 px-3">
                        {employeeEsepSessions.length > 0 ? (
                          <span className="font-semibold text-emerald-700">
                            {employeeEsepSessions.length} Session(s) • Evaluated (+6 pts)
                          </span>
                        ) : (
                          <span className="text-slate-500">0 Remedial Sessions</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {employeeEsepSessions.length > 0 ? (
                          <span className="font-semibold text-emerald-700">
                            GROW Commitments Cleared
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard Benchmarks Met</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">Verified</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#042C51]">Milestone Status</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          {journey.day30?.status || "Completed"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          journey.day60?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {journey.day60?.status || "In Progress"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          journey.day90?.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {journey.day90?.status || "Under Review"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">
                        {journey.finalOutcome ? "Endorsed" : "Active"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Callout to Expand into Per-Day Performance Calendar */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white border border-[#1A4C7B] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Per-Day Performance & Daily Check-Ins View</h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FF5C28] text-white tracking-wide">
                        Full 90-Day Trajectory
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-200 mt-1 max-w-2xl leading-relaxed">
                      Expand this milestone summary into an interactive day-by-day calendar tracking daily 1-on-1 check-ins, confidence scoring (1–5), facilitator notes, and key takeaways from FST through Day 90 regularization.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMilestoneTab("calendar")}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start md:self-auto"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Expand Calendar View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F9FC] border-t border-[#E6ECF2] flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            30/60/90 reviews are governance records for probationary tracking and official regularization decisions.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close Review
          </button>
        </div>
      </div>

      {/* Full View Process Detail Modal */}
      {selectedProcessModal && (
        <TrainingProcessDetailModal
          isOpen={Boolean(selectedProcessModal)}
          onClose={() => setSelectedProcessModal(null)}
          processType={selectedProcessModal}
          journey={journey}
          scoreVal={selectedProcessModal === "FST" ? fstScoreVal : pstScoreVal}
          evaluatorName={
            selectedProcessModal === "FST"
              ? (fstScoreObj?.owner || journey.trainerName || "Maria Cruz")
              : (pstScoreObj?.owner || journey.tl || "Anton Reyes")
          }
          items={selectedProcessModal === "FST" ? fstItems : pstItems}
        />
      )}

      {/* GROW Coaching Detail Modal */}
      {selectedGrowSessionId && (
        <TrainerCoachingDetailsModal
          employee={journey}
          sessions={esepSessions}
          evaluations={esepEvaluations}
          asOf={simulatedCurrentDate}
          onClose={() => setSelectedGrowSessionId(null)}
          initialSessionId={selectedGrowSessionId}
        />
      )}
    </div>
  );
}
