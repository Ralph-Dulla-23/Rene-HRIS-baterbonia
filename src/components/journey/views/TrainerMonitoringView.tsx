import { useDemoAuth } from "../../../auth/DemoAuthContext";
import React, { useState, useMemo } from "react";
import TrainerCoachingDetailsModal from "../TrainerCoachingDetailsModal";
import { averageAvailable, coachingForEmployee, coachingStatus, coachingSummary, evaluationFor, kpiComparison, displayPercent } from "../trainerCoachingUtils";
import type { EmployeeJourney } from "../journeyTypes";
import { useJourney } from "../JourneyContext";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Award, 
  Search, 
  Check, 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  BookOpen, 
  Filter, 
  Eye, 
  Plus, 
  Layers, 
  ChevronDown,
  TrendingUp,
  GraduationCap,
  FileText,
  Calendar,
  Sparkles,
  UserCheck
} from "lucide-react";

interface TrainerMonitoringViewProps {
  onSwitchModule?: (moduleKey: string) => void;
}

const SCORE_WEIGHTS = {
  "Training Assessment": 0.35,
  "QA Audit": 0.40,
  "Work Simulation": 0.25
};

export default function TrainerMonitoringView({ onSwitchModule }: TrainerMonitoringViewProps) {
  const { user } = useDemoAuth();
  const isAssignedTrainer = user?.role === 'Trainer';
  const { 
    journeys, 
    assignments, 
    progress, 
    assessments, 
    assessmentGrades, 
    phaseTrainingScores, 
    attendance,
    evidence,
    checkIns,
    coachingActions,
    qdsRequests,
    esepSessions,
    esepEvaluations,
    saveAssessmentGrade,
    verifyAssignment,
    addQDSRequest,
    updateQDSRequestStatus,
    simulatedCurrentDate,
    setSelectedJourney 
  } = useJourney();

  // State
  const [selectedTrainer, setSelectedTrainer] = useState<string>("Maria Cruz");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [coachingEmployee, setCoachingEmployee] = useState<EmployeeJourney | null>(null);
  const [showGradingWorkspace, setShowGradingWorkspace] = useState(false);
  const [activeTraineeId, setActiveTraineeId] = useState<string>(journeys[0]?.sibsEmployeeId || journeys[0]?.id || "SIBS-2901");

  // Accordion open states
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>("assessment");

  // Search in trainee table
  const [traineeSearch, setTraineeSearch] = useState("");

  // Grading form state
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number>(assessments[0]?.id || 8101);
  const [enteredScore, setEnteredScore] = useState<number>(85);

  // QDS Follow-up Modal State
  const [showQdsModal, setShowQdsModal] = useState(false);
  const [qdsTargetEmp, setQdsTargetEmp] = useState("");
  const [qdsType, setQdsType] = useState<"Independent QA recheck" | "Trainer coaching review" | "Targeted trainee support">("Trainer coaching review");
  const [qdsNotes, setQdsNotes] = useState("");
  const [qdsDue, setQdsDue] = useState("2026-10-25");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // All trainers list
  const trainerNames = (Array.from(new Set(journeys.map(j => j.trainerName).filter(Boolean))) as string[])
    .filter(name => !isAssignedTrainer || name === user?.trainerName || name.toLowerCase() === user?.name.toLowerCase());
  const activeTrainer = trainerNames.includes(selectedTrainer) ? selectedTrainer : (trainerNames[0] || (isAssignedTrainer ? 'Unassigned Trainer' : 'Maria Cruz'));

  // Helper date functions
  const dayOffset = (dateStr: string, numDays: number) => {
    const d = new Date(dateStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + numDays);
    return d.toISOString().slice(0, 10);
  };

  const getTraineePerf = (j: EmployeeJourney) => {
    const empKeys = [j.sibsEmployeeId, j.id];
    const trainingScore = (phase: 'FST' | 'PST') => {
      const phaseRecords = phaseTrainingScores.filter(row => empKeys.includes(row.emp) && row.phase === phase);
      const grades = assessmentGrades.flatMap(grade => {
        const item = assessments.find(a => a.id === grade.assessmentId && a.phase === phase);
        return item && empKeys.includes(grade.emp) ? [{ score: grade.score, date: grade.date }] : [];
      });
      const all = [...phaseRecords, ...grades].filter(x => typeof x.score === 'number' && Number.isFinite(x.score));
      return all.sort((a, b) => b.date.localeCompare(a.date))[0]?.score ?? null;
    };
    const fst = trainingScore('FST');
    const pst = trainingScore('PST');
    const trScore = averageAvailable([fst, pst]);
    const qaScores = evidence.filter(e => empKeys.includes(e.emp) && e.type === 'QDS / QA' && typeof e.score === 'number' && Number.isFinite(e.score))
      .map(e => ({ score: e.score as number, date: e.date }));
    const qaScore = qaScores.sort((a, b) => b.date.localeCompare(a.date))[0]?.score ?? j.day30?.nestingQaScore ?? null;
    const simScore = j.day60?.coreProductionScore ?? null;
    const composite = trScore !== null && qaScore !== null && simScore !== null
      ? Math.round(trScore * SCORE_WEIGHTS['Training Assessment'] + qaScore * SCORE_WEIGHTS['QA Audit'] + simScore * SCORE_WEIGHTS['Work Simulation']) : null;
    const attRecords = attendance.filter(a => empKeys.includes(a.emp));
    const recent14 = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(dStr => {
      if (!j.hireDate || dStr < j.hireDate) return false;
      const w = new Date(dStr + 'T12:00:00Z').getUTCDay();
      return w !== 0 && w !== 6;
    });
    let present = 0, late = 0, absent = 0, excused = 0, missing = 0;
    recent14.forEach(dStr => {
      const match = attRecords.find(a => a.date === dStr);
      const st = match?.status ?? 'Unrecorded';
      if (st === 'Present') present++;
      else if (st === 'Late') late++;
      else if (st === 'Absent') absent++;
      else if (st === 'Excused') excused++;
      else missing++;
    });
    const covered = present + late + absent + excused;
    const attRate = covered ? Math.round(((present + late) / covered) * 100) : null;
    const empAssign = assignments.filter(a => empKeys.includes(a.emp));
    const assignmentIds = new Set(empAssign.map(a => a.id));
    const verifiedIds = new Set(progress.filter(p => empKeys.includes(p.emp) && assignmentIds.has(p.assignmentId) && p.status === 'Verified').map(p => p.assignmentId));
    const verifiedCount = verifiedIds.size;
    return {
      trScore, qaScore, simScore, composite, delta: null as number | null, attRate,
      absentCount: absent + excused, missingAttCount: missing, recordedAttCount: covered,
      totalAssign: empAssign.length, verifiedAssign: verifiedCount,
      learningVerifiedPct: empAssign.length ? Math.round(100 * verifiedCount / empAssign.length) : null
    };
  };

  const scoreCategory = (val: number | null) => {
    if (val === null || val === undefined) return { label: "Insufficient data", tone: "bg-slate-100 text-slate-600 border border-slate-200" };
    if (val >= 85) return { label: "High", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    if (val >= 70) return { label: "Developing", tone: "bg-amber-50 text-amber-700 border border-amber-200" };
    return { label: "Needs support", tone: "bg-rose-50 text-rose-700 border border-rose-200" };
  };

  // Trainees assigned to active trainer
  const cohortTrainees = journeys.filter(j => j.trainerName === activeTrainer);
  const activeTrainee = cohortTrainees.find(j => (j.sibsEmployeeId || j.id) === activeTraineeId) || cohortTrainees[0] || journeys[0];

  // Cohort statistics
  const cohortPerfs = cohortTrainees.map(j => getTraineePerf(j));
  const cohortAvgComposite = averageAvailable(cohortPerfs.map(p => p.composite));
  const cohortAvgQA = averageAvailable(cohortPerfs.map(p => p.qaScore));
  const cohortHighCount = cohortPerfs.filter(p => p.composite !== null && p.composite >= 85).length;
  const cohortSupportCount = cohortPerfs.filter(p => p.composite !== null && p.composite < 70).length;
  const cohortAvgAtt = averageAvailable(cohortPerfs.map(p => p.attRate));
  const cohortFullyScored = cohortPerfs.filter(p => p.composite !== null).length;
  const cohortCoaching = coachingSummary(cohortTrainees, esepSessions, esepEvaluations, simulatedCurrentDate);

  // Filtered trainees by risk and search
  const displayedTrainees = useMemo(() => {
    return cohortTrainees.filter(j => {
      const p = getTraineePerf(j);
      let matchRisk = true;
      if (riskFilter === "high") matchRisk = p.composite !== null && p.composite >= 85;
      else if (riskFilter === "developing") matchRisk = p.composite !== null && p.composite >= 70 && p.composite < 85;
      else if (riskFilter === "support") matchRisk = p.composite !== null && p.composite < 70;
      else if (riskFilter === "missing") matchRisk = p.composite === null;

      if (!matchRisk) return false;
      if (!traineeSearch.trim()) return true;
      const q = traineeSearch.toLowerCase();
      return (
        j.fullName.toLowerCase().includes(q) ||
        (j.sibsEmployeeId && j.sibsEmployeeId.toLowerCase().includes(q)) ||
        (j.account && j.account.toLowerCase().includes(q))
      );
    });
  }, [cohortTrainees, riskFilter, traineeSearch]);

  // Trainer QDS feedback requests
  const trainerQdsFeedback = qdsRequests.filter(q => q.trainer === activeTrainer);

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    if (!assessment) return;

    saveAssessmentGrade({
      assessmentId: selectedAssessmentId,
      emp: activeTrainee.sibsEmployeeId || activeTrainee.id,
      score: Number(enteredScore),
      date: simulatedCurrentDate,
      grader: activeTrainer
    });

    setToastMessage(`Saved grade ${enteredScore}% for ${activeTrainee.fullName}!`);
    setShowGradingWorkspace(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateQdsRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qdsTargetEmp) return;
    const targetJ = journeys.find(j => (j.sibsEmployeeId || j.id) === qdsTargetEmp);
    addQDSRequest({
      emp: qdsTargetEmp,
      trainer: targetJ?.trainerName || activeTrainer,
      assignedTo: targetJ?.qa || "Elena Santos (Quality Lead)",
      type: qdsType,
      notes: qdsNotes,
      due: qdsDue
    });
    setToastMessage("QDS follow-up request submitted!");
    setShowQdsModal(false);
    setQdsNotes("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-5 select-none animate-in fade-in duration-200 pb-12 font-jakarta">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#042C51] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#FF5C28] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#FF5C28]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAGE HEADER: STANDARDIZED SiBS HRIS WHITE CARD HEADER   */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(4,44,81,0.05)] sm:px-6 2xl:px-7 2xl:py-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#042C51] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                <GraduationCap className="h-3 w-3 text-[#FF5C28]" />
                TRAINER SUPERVISION • L&amp;D NESTING
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700">
                Cohort Assessment &amp; QA Audit Alignment
              </span>
              <span className="inline-flex items-center rounded-full border border-[#DCE5EF] bg-[#F8FAFC] px-2.5 py-1 text-[9px] font-extrabold text-[#042C51]">
                {trainerNames.length} Trainers • {cohortTrainees.length} Cohort Trainees
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              Trainer Monitoring &amp; Cohort Intelligence
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              See every trainer, their assigned trainees, and cohort progression across assessments, independent QA audits, attendance, and coaching follow-ups.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            {/* Quick Trainer Switcher */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] px-2.5 py-1.5 text-xs">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Trainer:</span>
              <select
                value={activeTrainer}
                onChange={(e) => {
                  setSelectedTrainer(e.target.value);
                  const firstTrainee = journeys.find(j => j.trainerName === e.target.value);
                  if (firstTrainee) setActiveTraineeId(firstTrainee.sibsEmployeeId || firstTrainee.id);
                }}
                className="bg-transparent font-extrabold text-[#042C51] text-xs focus:outline-hidden cursor-pointer"
              >
                {trainerNames.map(tName => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>

            {/* Request QDS Feedback Button */}
            <button
              type="button"
              onClick={() => {
                setQdsTargetEmp(cohortTrainees[0]?.sibsEmployeeId || cohortTrainees[0]?.id || "");
                setShowQdsModal(true);
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-bold text-[#042C51] shadow-2xs hover:bg-[#F8FAFC] hover:border-[#BECBDA] transition cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#042C51]" />
              <span>Request QDS Feedback</span>
            </button>

            {/* Grade Assessment Button */}
            {isAssignedTrainer && (
              <button
                type="button"
                onClick={() => setShowGradingWorkspace(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Grade FST / PST</span>
              </button>
            )}

            {onSwitchModule && (
              <button
                type="button"
                onClick={() => onSwitchModule("New Hire Orientation")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3 text-xs font-bold text-[#667085] hover:text-[#042C51] hover:bg-[#F8FAFC] transition cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>NHO Module</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Jump Quick Navigation Bar */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#E6ECF2] pt-3 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085] pr-1 shrink-0">
            Jump to Section:
          </span>

          <button
            type="button"
            onClick={() => document.getElementById("section-trainer-directory")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Users className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Trainer Directory</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-trainer-spotlight")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Award className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Trainer Spotlight</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-supervised-trainees")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <UserCheck className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Supervised Trainees ({cohortTrainees.length})</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-coaching-outcomes")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <TrendingUp className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Coaching Outcomes</span>
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("section-cohort-registers")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#042C51] hover:bg-[#042C51] hover:text-white border border-[#E6ECF2] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#FF5C28]" />
            <span>Cohort Registers</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 1: TRAINER DIRECTORY CARDS                      */}
      {/* ======================================================== */}
      <section id="section-trainer-directory" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#042C51]">Trainer Directory</h2>
            <p className="text-xs text-[#667085]">Select a trainer to inspect supervised cohort progression and performance metrics.</p>
          </div>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10.5px] font-extrabold text-blue-700">
            {isAssignedTrainer ? "Your assigned cohort" : "Select any trainer to inspect"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerNames.map(tName => {
            const tSummary = journeys.filter(j => j.trainerName === tName);
            const tPerfs = tSummary.map(j => getTraineePerf(j));
            const meanComp = averageAvailable(tPerfs.map(p => p.composite));
            const meanQA = averageAvailable(tPerfs.map(p => p.qaScore));
            const highCount = tPerfs.filter(p => p.composite !== null && p.composite >= 85).length;
            const supportCount = tPerfs.filter(p => p.composite !== null && p.composite < 70).length;
            const attMean = averageAvailable(tPerfs.map(p => p.attRate));
            const pendingReqs = qdsRequests.filter(q => q.trainer === tName && q.status !== "Closed").length;
            const coachInfo = coachingSummary(tSummary, esepSessions, esepEvaluations, simulatedCurrentDate);
            const isActive = tName === activeTrainer;
            const initials = tName.split(" ").map(n => n[0]).slice(0, 2).join("");

            return (
              <div
                key={tName}
                onClick={() => {
                  setSelectedTrainer(tName);
                  const firstTrainee = tSummary[0];
                  if (firstTrainee) setActiveTraineeId(firstTrainee.sibsEmployeeId || firstTrainee.id);
                }}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all cursor-pointer shadow-[0_8px_22px_rgba(4,44,81,0.04)] ${
                  isActive 
                    ? "bg-white border-[#042C51] ring-2 ring-[#042C51]/20 shadow-md" 
                    : "bg-white border-[#DCE5EF] hover:border-[#FF5C28] hover:-translate-y-0.5"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF5C28]" />
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#042C51] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-[#042C51] block">{tName}</strong>
                      <span className="text-[10.5px] font-semibold text-slate-500">
                        {tSummary.length} assigned trainee{tSummary.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isActive ? "bg-[#FF5C28] text-white" : "bg-[#F8FAFC] text-slate-400"
                  }`}>
                    ↗
                  </span>
                </div>

                {/* 3 Metric Summary Boxes */}
                <div className="grid grid-cols-3 gap-2 my-3.5 py-2.5 border-y border-[#E6ECF2] text-center">
                  <div className="p-1 rounded-lg bg-[#F8FAFC]">
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">Avg. Perf</span>
                    <strong className="text-sm font-black text-[#042C51]">{displayPercent(meanComp)}</strong>
                  </div>
                  <div className="p-1 rounded-lg bg-[#F8FAFC]">
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">QA Audit</span>
                    <strong className="text-sm font-black text-[#042C51]">{displayPercent(meanQA)}</strong>
                  </div>
                  <div className="p-1 rounded-lg bg-[#F8FAFC]">
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">Attendance</span>
                    <strong className="text-sm font-black text-[#042C51]">{displayPercent(attMean)}</strong>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] font-extrabold text-[#667085]">
                    <span>Cohort Progression</span>
                    <span className="text-[#042C51]">{displayPercent(meanComp)}</span>
                  </div>
                  <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden p-0.5 border border-[#E6ECF2]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, Math.min(100, meanComp ?? 0))}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-[#667085]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {highCount} high • {supportCount} need support
                  </span>
                  <span className={pendingReqs ? "text-[#E67E22] font-black" : "text-slate-400"}>
                    {pendingReqs} follow-up{pendingReqs === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#E6ECF2] pt-2.5 text-[10.5px] font-bold text-[#042C51]">
                  <span>ESEP: {coachInfo.coached}/{coachInfo.total} coached</span>
                  <span className="text-[#667085]">{coachInfo.evaluated}/{coachInfo.sessions.length} evaluated • {coachInfo.overdue} overdue</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: SELECTED TRAINER SPOTLIGHT                   */}
      {/* ======================================================== */}
      <section id="section-trainer-spotlight" className="relative overflow-hidden rounded-2xl border border-[#083A69] bg-[#042C51] p-5 sm:p-6 text-white shadow-sm">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#FF5C28]/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#042C51] font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              {activeTrainer.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28]">
                  SELECTED TRAINER COHORT OVERVIEW
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.2 text-[9px] font-extrabold text-white">
                  Active Focus
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">{activeTrainer}</h2>
              <p className="text-xs text-[#BECBDA] mt-1 font-medium">
                {cohortTrainees.length} assigned trainees • {cohortFullyScored} fully scored • {cohortCoaching.evaluated} evaluated coaching follow-ups
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl text-center min-w-[110px]">
              <span className="text-[9.5px] uppercase font-extrabold text-[#94A9C1] block">Cohort Avg</span>
              <strong className="text-lg font-black text-white block mt-0.5">{displayPercent(cohortAvgComposite)}</strong>
            </div>
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl text-center min-w-[110px]">
              <span className="text-[9.5px] uppercase font-extrabold text-[#94A9C1] block">Independent QA</span>
              <strong className="text-lg font-black text-emerald-300 block mt-0.5">{displayPercent(cohortAvgQA)}</strong>
            </div>
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl text-center min-w-[110px]">
              <span className="text-[9.5px] uppercase font-extrabold text-[#94A9C1] block">High / Support</span>
              <strong className="text-lg font-black text-white block mt-0.5">{cohortHighCount} / {cohortSupportCount}</strong>
            </div>
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl text-center min-w-[110px]">
              <span className="text-[9.5px] uppercase font-extrabold text-[#94A9C1] block">Attendance</span>
              <strong className="text-lg font-black text-white block mt-0.5">{displayPercent(cohortAvgAtt)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: SUPERVISED TRAINEES CARDS & BENCHMARKS        */}
      {/* ======================================================== */}
      <section id="section-supervised-trainees" className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6ECF2] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#042C51]">Trainees Supervised by {activeTrainer}</h2>
              <span className="rounded-full bg-[#042C51] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                {displayedTrainees.length} Cohort Members
              </span>
            </div>
            <p className="text-xs font-medium text-[#667085] mt-0.5">
              Breakdown of composite scores, Trainer assessment, QA audits, and attendance reliability.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={traineeSearch}
                onChange={e => setTraineeSearch(e.target.value)}
                placeholder="Search trainee..."
                className="h-8 rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] pl-8 pr-3 text-xs font-semibold text-[#042C51] placeholder-[#98A2B3] focus:border-[#FF5C28] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="h-8 text-xs font-bold text-[#042C51] bg-[#F8FAFC] border border-[#BECBDA] rounded-lg px-2.5 outline-hidden cursor-pointer"
              >
                <option value="all">All trainees ({cohortTrainees.length})</option>
                <option value="high">High (85%+)</option>
                <option value="developing">Developing (70–84%)</option>
                <option value="support">Needs support (&lt;70%)</option>
                <option value="missing">Insufficient score data</option>
              </select>
            </div>
          </div>
        </div>

        {/* Individual Trainee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTrainees.map(j => {
            const perf = getTraineePerf(j);
            const cat = scoreCategory(perf.composite);
            const isSelected = (j.sibsEmployeeId || j.id) === activeTraineeId;
            const initials = j.fullName.split(" ").map(n => n[0]).slice(0, 2).join("");

            return (
              <div 
                key={j.id} 
                className={`relative overflow-hidden p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs ${
                  isSelected 
                    ? "bg-[#F8FAFC] border-2 border-[#042C51] shadow-xs" 
                    : "bg-white border-[#E6ECF2] hover:border-[#BECBDA]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF5C28]" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#042C51] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-[#042C51] block">{j.fullName}</strong>
                      <span className="text-[10.5px] font-semibold text-slate-500">{j.sibsEmployeeId || j.id} • {j.account}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${cat.tone}`}>
                    {cat.label} {perf.composite !== null ? `(${perf.composite}%)` : ''}
                  </span>
                </div>

                {/* Composite bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#042C51]">Composite Score</span>
                    <strong className="text-[#042C51] font-black">{displayPercent(perf.composite)}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden p-0.5 border border-[#E6ECF2]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full transition-all duration-500" 
                      style={{ width: `${perf.composite ?? 0}%` }} 
                    />
                  </div>
                </div>

                {/* 3 Score Rows */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] text-xs text-center">
                  <div>
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">Trainer (35%)</span>
                    <strong className="font-black text-[#042C51] text-sm block mt-0.5">{displayPercent(perf.trScore)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">QA Audit (40%)</span>
                    <strong className="font-black text-[#042C51] text-sm block mt-0.5">{displayPercent(perf.qaScore)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#667085] font-black uppercase tracking-wider block">Sim (25%)</span>
                    <strong className="font-black text-[#042C51] text-sm block mt-0.5">{displayPercent(perf.simScore)}</strong>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-0.5">
                  <span>Attendance: <strong className="text-[#042C51] font-extrabold">{displayPercent(perf.attRate)}</strong></span>
                  <span>Verified learning: <strong className="text-[#042C51] font-extrabold">{perf.verifiedAssign} / {perf.totalAssign}</strong></span>
                </div>

                {/* Coaching sub-card */}
                {(() => {
                  const coaching = coachingForEmployee(esepSessions, j);
                  const evaluated = coaching.filter(row => evaluationFor(row, esepEvaluations));
                  const latest = coaching[0];
                  return (
                    <div className="rounded-xl border border-[#DCE5EF] bg-white p-3 text-xs space-y-1 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-[#042C51] font-extrabold">Coaching results • {coaching.length} session{coaching.length === 1 ? '' : 's'}</strong>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          {evaluated.length}/{coaching.length} evaluated
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] font-medium">
                        {latest ? `${latest.facilitator} (${latest.facilitatorRole}) • ${coachingStatus(latest, esepEvaluations, simulatedCurrentDate)}` : 'No coaching sessions recorded'}
                      </p>
                      <button 
                        type="button" 
                        onClick={() => setCoachingEmployee(j)} 
                        className="text-[#FF5C28] hover:text-[#e04f20] font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <span>View coaching form &amp; results</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E6ECF2]">
                  {isAssignedTrainer && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTraineeId(j.sibsEmployeeId || j.id);
                        setShowGradingWorkspace(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
                    >
                      Grade FST / PST
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedJourney(j)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] hover:bg-[#042C51] hover:text-white hover:border-[#042C51] text-[#042C51] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <span>View Record</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: EVIDENCE-BASED ESEP COACHING RESULTS          */}
      {/* ======================================================== */}
      <section id="section-coaching-outcomes" className="space-y-4 select-none">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28]">
                ESEP • COACHING FOLLOW-UP EVIDENCE
              </span>
              <h2 className="text-base font-extrabold text-[#042C51]">
                Coaching outcomes • {activeTrainer}'s trainees
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Sessions and measured follow-ups for this trainer's assigned trainees, credited to their actual Team Leader or QDS facilitator.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">4 Metrics</span>
          </div>

          {/* 4 Standard SiBS 115px KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 min-w-0">
            {/* 1. Trainees with Coaching */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Trainees with Coaching</span>
                <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{cohortCoaching.coached} / {cohortCoaching.total}</div>
                <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                  {cohortCoaching.coverage === null ? 'No trainees assigned' : `${cohortCoaching.coverage}% cohort coverage`}
                </div>
              </div>
            </div>

            {/* 2. Evaluated Follow-ups */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Evaluated Follow-ups</span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-xl font-extrabold text-emerald-700 tracking-tight">{cohortCoaching.evaluated} / {cohortCoaching.sessions.length}</div>
                <div className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">
                  {cohortCoaching.evaluationRate === null ? 'No sessions recorded' : `${cohortCoaching.evaluationRate}% reviewed`}
                </div>
              </div>
            </div>

            {/* 3. Numeric KPI Comparisons */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Numeric KPI Evidence</span>
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-xl font-extrabold text-blue-700 tracking-tight">{cohortCoaching.measured}</div>
                <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Before/after measured results</div>
              </div>
            </div>

            {/* 4. Overdue Reviews */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overdue Reviews</span>
                <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E74C3C]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-xl font-extrabold text-[#E74C3C] tracking-tight">{cohortCoaching.overdue}</div>
                <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Past due without result</div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Trainee Coaching Results Table */}
        <div className="relative z-[10] overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
          <header className="border-b border-[#E6ECF2] bg-white p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#042C51]">Trainee Coaching Results</h3>
                <p className="text-xs font-semibold text-[#667085] mt-0.5">
                  Development outcomes attributed to respective Team Leader or QDS facilitators.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-[10.5px] font-extrabold text-[#667085]">
                {cohortTrainees.length} Cohort Trainees
              </span>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6ECF2] bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">TRAINEE</th>
                  <th className="py-3 px-4">SESSIONS</th>
                  <th className="py-3 px-4">EVALUATED</th>
                  <th className="py-3 px-4">LATEST DOCUMENTED OUTCOME</th>
                  <th className="py-3 px-4">FOLLOW-UP</th>
                  <th className="py-3 px-4">FACILITATOR</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2] font-medium">
                {cohortTrainees.map(j => {
                  const records = coachingForEmployee(esepSessions, j);
                  const evaluated = records.filter(r => evaluationFor(r, esepEvaluations)).length;
                  const latest = records[0];
                  const latestReviewed = records.find(r => evaluationFor(r, esepEvaluations));
                  const outcome = latestReviewed ? evaluationFor(latestReviewed, esepEvaluations) : null;
                  const comparison = kpiComparison(outcome);
                  const overdue = records.filter(r => coachingStatus(r, esepEvaluations, simulatedCurrentDate) === 'Overdue').length;
                  const pending = records.length - evaluated;
                  const initials = j.fullName.split(" ").map(n => n[0]).slice(0, 2).join("");

                  return (
                    <tr key={j.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-extrabold text-[10.5px] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <strong className="text-[#042C51] block font-extrabold">{j.fullName}</strong>
                            <span className="text-[10px] text-slate-500">{j.sibsEmployeeId ?? j.id} • {j.account}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-[#042C51]">{records.length}</td>
                      <td className="py-3 px-4 font-bold text-[#042C51]">{evaluated} / {records.length}</td>

                      <td className="py-3 px-4 max-w-xs">
                        {comparison ? (
                          <div>
                            <strong className="block text-emerald-700 font-extrabold">
                              {comparison.before} → {comparison.after} ({comparison.differenceLabel})
                            </strong>
                            <span className="text-[9.5px] text-slate-400 font-bold uppercase">Measured KPI Evidence</span>
                          </div>
                        ) : outcome ? (
                          <span className="text-slate-600 font-medium line-clamp-1">{outcome.notes}</span>
                        ) : (
                          <span className="text-slate-400 font-medium">No measured follow-up yet</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                          overdue 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : pending 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : records.length 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {overdue ? `${overdue} overdue` : pending ? `${pending} awaiting` : records.length ? 'Up to date' : 'Not recorded'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-[#042C51] block text-xs">{latest?.facilitator ?? '—'}</strong>
                        <span className="text-[10px] text-slate-500 block">{latest ? `${latest.facilitatorRole} • ${latest.date}` : ''}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button 
                          type="button" 
                          onClick={() => setCoachingEmployee(j)} 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] hover:bg-[#042C51] hover:text-white hover:border-[#042C51] text-[#042C51] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <span>View results</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {coachingEmployee && (
        <TrainerCoachingDetailsModal 
          employee={coachingEmployee} 
          sessions={esepSessions} 
          evaluations={esepEvaluations} 
          asOf={simulatedCurrentDate} 
          onClose={() => setCoachingEmployee(null)} 
        />
      )}

      {/* ======================================================== */}
      {/* SECTION 5: TRAINER COACHING & QDS FEEDBACK REQUESTS      */}
      {/* ======================================================== */}
      <section className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6ECF2] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF5C28]" />
              <h2 className="text-sm font-extrabold text-[#042C51]">Trainer Coaching &amp; QDS Feedback</h2>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Independent Quality Development (QDS) review requests and follow-ups for {activeTrainer}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setQdsTargetEmp(cohortTrainees[0]?.sibsEmployeeId || cohortTrainees[0]?.id || "");
              setShowQdsModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5C28] text-white text-xs font-extrabold shadow-2xs hover:bg-[#e04f20] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus size={13} />
            <span>New QDS Request</span>
          </button>
        </div>

        {trainerQdsFeedback.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {trainerQdsFeedback.map(req => {
              const trainee = cohortTrainees.find(j => [j.id, j.sibsEmployeeId].includes(req.emp));
              return (
                <article key={req.id} className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] p-4 shadow-2xs space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <strong className="text-xs font-extrabold text-[#042C51]">{req.type}</strong>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#042C51]">Target Trainee: {trainee?.fullName ?? req.emp}</p>
                  <p className="text-xs text-slate-600 font-medium">{req.notes}</p>
                  <p className="text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                    Assigned to: <strong className="text-[#042C51]">{req.assignedTo}</strong> • Due: {req.due}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#BECBDA] bg-[#F8FAFC] p-6 text-center text-xs text-slate-500">
            No active QDS follow-up requests recorded for {activeTrainer}. All trainer reviews are up to date.
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: DETAILED COHORT REGISTERS ACCORDIONS          */}
      {/* ======================================================== */}
      <section id="section-cohort-registers" className="space-y-3" aria-label="Detailed trainer cohort registers">
        <div>
          <h2 className="text-base font-extrabold text-[#042C51]">Detailed Cohort Registers</h2>
          <p className="text-xs text-[#667085]">
            Expand to review recorded assessment matrices, attendance ledgers, and verified daily learning activities for the selected cohort.
          </p>
        </div>

        {/* 1. Assessment Score Matrix */}
        <div className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setExpandedAccordion(expandedAccordion === "assessment" ? null : "assessment")}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-extrabold text-[#042C51] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#FF5C28]" />
              <span className="text-sm">Assessment Score Matrix</span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                {cohortTrainees.length} records
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordion === "assessment" ? "rotate-180 text-[#042C51]" : ""}`} />
          </button>

          {expandedAccordion === "assessment" && (
            <div className="overflow-x-auto border-t border-[#E6ECF2]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider border-b border-[#E6ECF2]">
                  <tr>
                    {['Trainee', 'Trainer Assessment', 'Independent QA', 'Work Simulation', 'Composite', 'Evidence Status'].map(t => (
                      <th key={t} className="px-4 py-3">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF2] font-medium">
                  {cohortTrainees.map(j => {
                    const p = getTraineePerf(j);
                    return (
                      <tr key={j.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 font-extrabold text-[#042C51]">{j.fullName}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{displayPercent(p.trScore)}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{displayPercent(p.qaScore)}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{displayPercent(p.simScore)}</td>
                        <td className="px-4 py-3 font-extrabold text-[#042C51]">{displayPercent(p.composite)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            p.composite === null 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {p.composite === null ? 'Incomplete score sources' : 'All 3 sources verified'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. Attendance & Absenteeism Ledger */}
        <div className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setExpandedAccordion(expandedAccordion === "attendance" ? null : "attendance")}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-extrabold text-[#042C51] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#FF5C28]" />
              <span className="text-sm">Attendance &amp; Absenteeism Ledger</span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                14-day cycle
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordion === "attendance" ? "rotate-180 text-[#042C51]" : ""}`} />
          </button>

          {expandedAccordion === "attendance" && (
            <div className="border-t border-[#E6ECF2]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider border-b border-[#E6ECF2]">
                    <tr>
                      {['Trainee', 'Attendance Rate', 'Absent / Excused', 'Unrecorded Shifts', 'Evidence Coverage'].map(t => (
                        <th key={t} className="px-4 py-3">{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] font-medium">
                    {cohortTrainees.map(j => {
                      const p = getTraineePerf(j);
                      return (
                        <tr key={j.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3 font-extrabold text-[#042C51]">{j.fullName}</td>
                          <td className="px-4 py-3 font-extrabold text-[#042C51]">{displayPercent(p.attRate)}</td>
                          <td className="px-4 py-3 text-slate-600 font-semibold">{p.absentCount} shifts</td>
                          <td className="px-4 py-3 text-slate-500">{p.missingAttCount}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{p.recordedAttCount} recorded workdays</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="p-3 text-[11px] font-medium text-slate-500 bg-[#F8FAFC] border-t border-[#E6ECF2]">
                Note: Missing records are unrecorded shifts — not automatic absences. Prototype workweek excludes standard weekend non-scheduled dates.
              </p>
            </div>
          )}
        </div>

        {/* 3. Daily Learning Activities */}
        <div className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setExpandedAccordion(expandedAccordion === "learning" ? null : "learning")}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-extrabold text-[#042C51] hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#FF5C28]" />
              <span className="text-sm">Daily Learning Activities</span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                Assigned Curriculum
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedAccordion === "learning" ? "rotate-180 text-[#042C51]" : ""}`} />
          </button>

          {expandedAccordion === "learning" && (
            <div className="overflow-x-auto border-t border-[#E6ECF2]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider border-b border-[#E6ECF2]">
                  <tr>
                    {['Trainee', 'Assigned Activity', 'Date', 'Type', 'Verification Status'].map(t => (
                      <th key={t} className="px-4 py-3">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF2] font-medium">
                  {assignments
                    .filter(a => cohortTrainees.some(j => [j.id, j.sibsEmployeeId].includes(a.emp)))
                    .slice(0, 30)
                    .map(a => {
                      const trainee = cohortTrainees.find(j => [j.id, j.sibsEmployeeId].includes(a.emp));
                      const state = progress.find(p => p.assignmentId === a.id && p.emp === a.emp);
                      return (
                        <tr key={a.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3 font-extrabold text-[#042C51]">{trainee?.fullName ?? a.emp}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{a.title}</td>
                          <td className="px-4 py-3 text-slate-500">{a.date}</td>
                          <td className="px-4 py-3 text-slate-600 font-semibold">{a.type}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              state?.status === 'Verified' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {state?.status ?? 'Not started'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL: STAFF-ONLY GRADING WORKSPACE                      */}
      {/* ======================================================== */}
      {showGradingWorkspace && isAssignedTrainer && activeTrainee && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative overflow-hidden bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#DCE5EF]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

            <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3.5">
              <div>
                <span className="text-[10px] font-black text-[#FF5C28] uppercase tracking-wider">
                  STAFF-ONLY FST / PST ASSESSMENT GRADING
                </span>
                <h3 className="text-base font-extrabold text-[#042C51]">{activeTrainee.fullName}</h3>
                <p className="text-xs text-[#667085]">{activeTrainee.sibsEmployeeId || activeTrainee.id} • {activeTrainee.account}</p>
              </div>
              <button 
                onClick={() => setShowGradingWorkspace(false)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#042C51] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Select Skill Assessment</label>
                <select
                  value={selectedAssessmentId}
                  onChange={e => setSelectedAssessmentId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] font-semibold text-xs text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
                >
                  {assessments.filter(a => a.status === "Published").map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.phase}] {a.title} ({a.skill}) — Max {a.max} pts
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Grade / Score Obtained (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={enteredScore}
                  onChange={e => setEnteredScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] text-xs space-y-1">
                <span className="text-[10px] font-black text-[#215789] uppercase tracking-wider">Evaluator Identity:</span>
                <p className="text-[#042C51] font-bold">{activeTrainer} (Assigned Trainer)</p>
                <p className="text-slate-500 text-[11px]">Saving this grade updates the employee's FST / PST records immediately.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF2]">
                <button
                  type="button"
                  onClick={() => setShowGradingWorkspace(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-bold text-xs hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-extrabold text-xs shadow-xs cursor-pointer"
                >
                  Save Assessment Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE QDS FOLLOW-UP REQUEST                      */}
      {/* ======================================================== */}
      {showQdsModal && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative overflow-hidden bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#DCE5EF]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />

            <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF5C28]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#042C51] text-base">Request QDS Review / Follow-Up</h3>
                  <p className="text-[11px] text-[#667085]">Escalate to Quality Lead for independent audit or calibration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowQdsModal(false)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#042C51] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQdsRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Target Trainee</label>
                <select
                  value={qdsTargetEmp}
                  onChange={e => setQdsTargetEmp(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
                >
                  {cohortTrainees.map(t => (
                    <option key={t.id} value={t.sibsEmployeeId || t.id}>
                      {t.fullName} ({t.sibsEmployeeId || t.id}) • {t.account}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Request Type</label>
                  <select
                    value={qdsType}
                    onChange={e => setQdsType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
                  >
                    <option value="Trainer coaching review">Trainer coaching review</option>
                    <option value="Independent QA recheck">Independent QA recheck</option>
                    <option value="Targeted trainee support">Targeted trainee support</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={qdsDue}
                    onChange={e => setQdsDue(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Observation &amp; Instructions</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the specific call/case reference or rationale for this QDS review..."
                  value={qdsNotes}
                  onChange={e => setQdsNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#BECBDA] text-slate-800 focus:border-[#FF5C28] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E6ECF2]">
                <button
                  type="button"
                  onClick={() => setShowQdsModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F8FAFC] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send size={13} />
                  <span>Submit QDS Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

