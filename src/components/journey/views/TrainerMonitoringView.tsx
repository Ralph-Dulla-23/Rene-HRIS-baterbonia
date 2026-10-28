import { useDemoAuth } from "../../../auth/DemoAuthContext";
import React, { useState } from "react";
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
  ChevronDown
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
  const {user} = useDemoAuth();
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

  const dateLabel = (dStr: string) => {
    if (!dStr) return "—";
    return new Date(dStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Missing sources stay missing. No invented QA=85%, composite=0%, delta or attendance=100%.
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
    if (val === null || val === undefined) return { label: "Insufficient data", tone: "bg-slate-100 text-slate-600" };
    if (val >= 85) return { label: "High", tone: "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" };
    if (val >= 70) return { label: "Developing", tone: "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" };
    return { label: "Needs support", tone: "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border" };
  };

  // Trainees assigned to active trainer
  const cohortTrainees = journeys.filter(j => j.trainerName === activeTrainer);
  const activeTrainee = cohortTrainees.find(j => (j.sibsEmployeeId || j.id) === activeTraineeId) || cohortTrainees[0] || journeys[0];

  // Cohort means exclude unscored trainees instead of treating missing evidence as zero.
  const cohortPerfs = cohortTrainees.map(j => getTraineePerf(j));
  const cohortAvgComposite = averageAvailable(cohortPerfs.map(p => p.composite));
  const cohortAvgQA = averageAvailable(cohortPerfs.map(p => p.qaScore));
  const cohortHighCount = cohortPerfs.filter(p => p.composite !== null && p.composite >= 85).length;
  const cohortSupportCount = cohortPerfs.filter(p => p.composite !== null && p.composite < 70).length;
  const cohortAvgAtt = averageAvailable(cohortPerfs.map(p => p.attRate));
  const cohortFullyScored = cohortPerfs.filter(p => p.composite !== null).length;
  const cohortCoaching = coachingSummary(cohortTrainees, esepSessions, esepEvaluations, simulatedCurrentDate);

  // Filtered trainees by risk
  const displayedTrainees = cohortTrainees.filter(j => {
    const p = getTraineePerf(j);
    if (riskFilter === "high") return p.composite !== null && p.composite >= 85;
    if (riskFilter === "developing") return p.composite !== null && p.composite >= 70 && p.composite < 85;
    if (riskFilter === "support") return p.composite !== null && p.composite < 70;
    if (riskFilter === "missing") return p.composite === null;
    return true;
  });

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
    <div className="space-y-6">
      {/* SiBS HRIS Standard Header: White card with top accent gradient bar */}
      <section className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white shadow-xs">
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
              Trainer → Trainee Performance Intelligence
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#042C51]">
              Trainer Monitoring
            </h1>
            <p className="text-xs text-[#667085] max-w-3xl leading-normal">
              See every trainer, their assigned trainees, and cohort progress across assessments, independent QA audits, attendance, and daily learning. Scores are evidence indicators, not automatic appraisals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F9FC] border border-[#E6ECF2] text-[#042C51] shrink-0">
              {trainerNames.length} Trainers • {cohortTrainees.length} Trainees in Selected Roster
            </span>

            {onSwitchModule && (
              <button
                type="button"
                onClick={() => onSwitchModule("New Hire Orientation (NHO)")}
                className="px-3.5 py-2 rounded-xl border border-[#BECBDA] hover:bg-[#F7F9FC] text-[#042C51] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Layers className="w-4 h-4 text-[#FF5C28]" />
                <span>Back to NHO</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {toastMessage && (
        <div className="sibs-tone-green-bg border sibs-tone-green-border sibs-tone-green-text text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Trainer Directory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Trainer Directory</h2>
            <p className="text-xs text-slate-500">Select a trainer to view the trainees they supervise and underlying evidence.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
            {isAssignedTrainer ? "Your assigned trainees" : "Select any trainer"}
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

            return (
              <button
                key={tName}
                onClick={() => {
                  if (!isAssignedTrainer || tName === user?.trainerName) setSelectedTrainer(tName);
                  const firstTrainee = tSummary[0];
                  if (firstTrainee) setActiveTraineeId(firstTrainee.sibsEmployeeId || firstTrainee.id);
                }}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                  isActive 
                    ? "bg-[#E9F0FC] border-2 border-[#042C51] shadow-xs" 
                    : "bg-white border-[#E6ECF2] hover:border-[#FF5C28]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6EAF0] text-[#042C51] font-black text-xs flex items-center justify-center">
                      {tName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-[#042C51] block">{tName}</strong>
                      <span className="text-[10px] text-slate-500">{tSummary.length} assigned trainee{tSummary.length === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <span className="text-[#042C51] font-bold text-lg">↗</span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Avg. Performance</span>
                    <strong className="text-base font-black text-[#042C51]">{displayPercent(meanComp)}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Independent QA</span>
                    <strong className="text-base font-black text-[#042C51]">{displayPercent(meanQA)}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Attendance</span>
                    <strong className="text-base font-black text-[#042C51]">{displayPercent(attMean)}</strong>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${displayPercent(meanComp)}` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{highCount} high • {supportCount} need support</span>
                  <span className={pendingReqs ? "text-[#E67E22] font-bold" : "text-slate-400"}>
                    {pendingReqs} follow-up{pendingReqs === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-[#E6ECF2] pt-3 text-[11px] font-semibold text-[#042C51]">
                  <span>ESEP: {coachInfo.coached}/{coachInfo.total} trainees coached</span>
                  <span>{coachInfo.evaluated}/{coachInfo.sessions.length} evaluated · {coachInfo.overdue} overdue</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Trainer Spotlight */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#042C51] font-black text-xl flex items-center justify-center shrink-0">
            {activeTrainer.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
              SELECTED TRAINER
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">{activeTrainer}</h2>
            <p className="text-xs text-[#E6EAF0] mt-1">
              {cohortTrainees.length} assigned trainees • {cohortFullyScored} fully scored • {cohortCoaching.evaluated} evaluated coaching follow-ups
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Cohort Avg</span>
            <strong className="text-xl font-black text-white">{displayPercent(cohortAvgComposite)}</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Independent QA</span>
            <strong className="text-xl font-black text-white">{displayPercent(cohortAvgQA)}</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">High / Support</span>
            <strong className="text-xl font-black text-white">{cohortHighCount} / {cohortSupportCount}</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Attendance</span>
            <strong className="text-xl font-black text-white">{displayPercent(cohortAvgAtt)}</strong>
          </div>
        </div>
      </div>

      {/* Trainees Under Trainer Cards & Details */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Trainees Supervised by {activeTrainer}</h2>
            <p className="text-xs text-slate-500">Breakdown of composite scores, Trainer assessment, QA audits, and attendance.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter by category:</span>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="text-xs font-semibold text-[#042C51] bg-[#F7F9FC] border border-[#BECBDA] rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All trainees ({cohortTrainees.length})</option>
              <option value="high">High (85%+)</option>
              <option value="developing">Developing (70–84%)</option>
              <option value="support">Needs support (&lt;70%)</option>
              <option value="missing">Insufficient score data</option>
            </select>
          </div>
        </div>

        {/* Individual Trainee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTrainees.map(j => {
            const perf = getTraineePerf(j);
            const cat = scoreCategory(perf.composite);
            const isSelected = (j.sibsEmployeeId || j.id) === activeTraineeId;

            return (
              <div 
                key={j.id} 
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isSelected ? "bg-[#F7F9FC] border-2 border-[#042C51] shadow-xs" : "bg-white border-[#E6ECF2] hover:border-[#BECBDA]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6EAF0] text-[#042C51] font-black text-xs flex items-center justify-center shrink-0">
                      {j.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-[#042C51] block">{j.fullName}</strong>
                      <span className="text-[10px] text-slate-500">{j.sibsEmployeeId || j.id} • {j.account}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.tone}`}>
                    {cat.label} {perf.composite !== null ? `(${perf.composite}%)` : ''}
                  </span>
                </div>

                {/* Composite bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#042C51]">Composite Score</span>
                    <strong className="text-[#042C51] font-black">{displayPercent(perf.composite)}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${perf.composite ?? 0}%` }} />
                  </div>
                </div>

                {/* 3 Score Rows */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs text-center">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Trainer Assessment (35%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{displayPercent(perf.trScore)}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">QA Audit (40%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{displayPercent(perf.qaScore)}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Work Simulation (25%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{displayPercent(perf.simScore)}</strong>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
                  <span>Attendance: <strong className="text-[#042C51]">{displayPercent(perf.attRate)}</strong></span>
                  <span>Verified learning: <strong className="text-[#042C51]">{perf.verifiedAssign} / {perf.totalAssign}</strong></span>
                </div>

                {(() => {
                  const coaching = coachingForEmployee(esepSessions, j);
                  const evaluated = coaching.filter(row => evaluationFor(row, esepEvaluations));
                  const latest = coaching[0];
                  return <div className="rounded-xl border border-[#DBE8F4] bg-[#F7F9FC] p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-[#042C51]">Coaching results · {coaching.length} session{coaching.length === 1 ? '' : 's'}</strong><span className="rounded-full bg-[#E9F0FC] px-2 py-0.5 text-[10px] font-bold text-[#042C51]">{evaluated.length}/{coaching.length} evaluated</span></div>
                    <p className="mt-1 text-[11px] text-slate-500">{latest ? `${latest.facilitator} (${latest.facilitatorRole}) · ${coachingStatus(latest, esepEvaluations, simulatedCurrentDate)}` : 'No coaching sessions recorded'}</p>
                    <button type="button" onClick={() => setCoachingEmployee(j)} className="mt-2 font-bold text-[#0B668B] hover:underline">View coaching form & results →</button>
                  </div>;
                })()}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {isAssignedTrainer && <button
                    onClick={() => {
                      setActiveTraineeId(j.sibsEmployeeId || j.id);
                      setShowGradingWorkspace(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Grade FST / PST
                  </button>}

                  <button
                    onClick={() => setSelectedJourney(j)}
                    className="px-3 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] text-xs font-semibold shadow-xs transition-colors"
                  >
                    View Record →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence-based ESEP coaching results, scoped to the selected Trainer's assigned trainees. */}
      <section className="space-y-4" aria-label="Coaching outcomes for selected trainer">
        <div><span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28]">ESEP · COACHING FOLLOW-UP EVIDENCE</span><h2 className="mt-1 text-base font-extrabold text-[#042C51]">Coaching outcomes · {activeTrainer}'s trainees</h2><p className="text-xs text-slate-500">Sessions and measured follow-ups for this trainer's assigned trainees, credited to their actual Team Leader or QDS facilitator.</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Trainees with coaching', value: `${cohortCoaching.coached} / ${cohortCoaching.total}`, note: cohortCoaching.coverage === null ? 'No trainees assigned' : `${cohortCoaching.coverage}% cohort coverage` },
            { label: 'Evaluated follow-ups', value: `${cohortCoaching.evaluated} / ${cohortCoaching.sessions.length}`, note: cohortCoaching.evaluationRate === null ? 'No sessions recorded' : `${cohortCoaching.evaluationRate}% of sessions reviewed` },
            { label: 'Numeric KPI comparisons', value: `${cohortCoaching.measured}`, note: 'Before/after evidence; KPI units remain separate' },
            { label: 'Overdue coaching reviews', value: `${cohortCoaching.overdue}`, note: 'Past due without an effectiveness result' }
          ].map((item, index) => <div key={item.label} className={`rounded-xl border border-[#E6ECF2] border-t-[3px] bg-white p-4 shadow-xs ${index === 1 ? 'border-t-emerald-500' : index === 2 ? 'border-t-blue-500' : index === 3 ? 'border-t-orange-400' : 'border-t-[#042C51]'}`}>
            <p className="text-[11px] font-bold uppercase text-slate-500">{item.label}</p><div className="mt-2 text-2xl font-black tabular-nums text-[#042C51]">{item.value}</div><p className="mt-1 text-[11px] text-slate-500">{item.note}</p>
          </div>)}
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white shadow-xs">
          <div className="border-b border-[#E6ECF2] p-4"><h3 className="text-sm font-extrabold text-[#042C51]">Trainee Coaching Results</h3><p className="text-[11px] text-slate-500">These are development outcomes, not Trainer appraisal grades or independent QA scores.</p></div>
          <div className="overflow-x-auto"><table className="min-w-[930px] w-full text-left text-xs"><thead><tr className="border-b border-[#E6ECF2] bg-[#F7F9FC] text-[10px] uppercase tracking-wide text-slate-500">{['Trainee', 'Sessions', 'Evaluated', 'Latest documented outcome', 'Follow-up', 'Most recent facilitator', 'Form / Details'].map(x => <th key={x} scope="col" className="px-3 py-3">{x}</th>)}</tr></thead><tbody className="divide-y divide-[#E6ECF2]">{cohortTrainees.map(j => {
            const records = coachingForEmployee(esepSessions, j);
            const evaluated = records.filter(r => evaluationFor(r, esepEvaluations)).length;
            const latest = records[0];
            const latestReviewed = records.find(r => evaluationFor(r, esepEvaluations));
            const outcome = latestReviewed ? evaluationFor(latestReviewed, esepEvaluations) : null;
            const comparison = kpiComparison(outcome);
            const overdue = records.filter(r => coachingStatus(r, esepEvaluations, simulatedCurrentDate) === 'Overdue').length;
            const pending = records.length - evaluated;
            return <tr key={j.id} className="hover:bg-[#F7F9FC]"><td className="px-3 py-3"><strong className="text-[#042C51]">{j.fullName}</strong><span className="block text-[10px] text-slate-500">{j.sibsEmployeeId ?? j.id} · {j.account}</span></td><td className="px-3 py-3 font-bold">{records.length}</td><td className="px-3 py-3 font-bold">{evaluated}/{records.length}</td><td className="px-3 py-3 max-w-[230px]">{comparison ? <><strong className="block">{comparison.before} → {comparison.after} ({comparison.differenceLabel})</strong><span className="text-[10px] text-slate-500">Original KPI units; direction not inferred</span></> : outcome ? <span className="text-slate-600">{outcome.notes}</span> : 'No measured follow-up yet'}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${overdue ? 'bg-red-50 text-red-700' : pending ? 'bg-amber-50 text-amber-700' : records.length ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{overdue ? `${overdue} overdue` : pending ? `${pending} awaiting` : records.length ? 'Up to date' : 'Not recorded'}</span></td><td className="px-3 py-3"><strong>{latest?.facilitator ?? '—'}</strong><span className="block text-[10px] text-slate-500">{latest ? `${latest.facilitatorRole} · ${latest.date}` : ''}</span></td><td className="px-3 py-3"><button type="button" onClick={() => setCoachingEmployee(j)} className="rounded-lg border border-[#BECBDA] px-3 py-2 font-semibold text-[#042C51] hover:bg-[#E9F0FC]">View coaching results →</button></td></tr>;
          })}</tbody></table></div>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">Coaching evidence belongs to each trainee and is attributed to the recorded facilitator. A KPI change does not automatically prove a Trainer caused the result.</p>
      </section>

      {coachingEmployee && <TrainerCoachingDetailsModal employee={coachingEmployee} sessions={esepSessions} evaluations={esepEvaluations} asOf={simulatedCurrentDate} onClose={() => setCoachingEmployee(null)} />}

      {/* Independent QDS requests stay separate from completed ESEP coaching sessions. */}
      <section className="space-y-3">
        <div><h2 className="text-sm font-extrabold text-[#042C51]">Trainer coaching & QDS feedback</h2><p className="text-xs text-slate-500">Independent QDS review requests and follow-ups for the selected trainer.</p></div>
        {trainerQdsFeedback.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{trainerQdsFeedback.map(req => {
          const trainee = cohortTrainees.find(j => [j.id, j.sibsEmployeeId].includes(req.emp));
          return <article key={req.id} className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-xs"><div className="flex flex-wrap justify-between gap-2"><strong className="text-xs text-[#042C51]">{req.type}</strong><span className="rounded-full bg-[#E9F0FC] px-2 py-1 text-[10px] font-semibold text-[#042C51]">{req.status}</span></div><p className="mt-2 text-xs text-[#042C51]">{trainee?.fullName ?? req.emp}</p><p className="mt-1 text-xs text-slate-500">{req.notes}</p><p className="mt-2 text-[11px] text-slate-500">Assigned to: {req.assignedTo} · Due: {req.due}</p></article>;
        })}</div> : <div className="rounded-xl border border-[#E6ECF2] bg-white p-6 text-center text-xs text-slate-500">No QDS follow-up requests have been recorded for this trainer.</div>}
      </section>

      {/* Folded registers retain evidence-level context without a second dashboard. */}
      <section className="space-y-3" aria-label="Detailed trainer cohort registers">
        <div><h2 className="text-sm font-extrabold text-[#042C51]">Detailed cohort registers</h2><p className="text-xs text-slate-500">Expand to review recorded assessment, attendance and learning evidence for the selected cohort.</p></div>
        <details className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white"><summary className="cursor-pointer px-4 py-3 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC]">Assessment score matrix</summary><div className="overflow-x-auto border-t border-[#E6ECF2]"><table className="min-w-[750px] w-full text-left text-xs"><thead className="bg-[#F7F9FC] text-[10px] font-bold uppercase text-slate-500"><tr>{['Trainee','Trainer assessment','Independent QA','Work simulation','Composite','Evidence status'].map(t=><th key={t} className="px-3 py-3">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#E6ECF2]">{cohortTrainees.map(j=>{const p=getTraineePerf(j);return <tr key={j.id}><td className="px-3 py-3 font-bold">{j.fullName}</td><td className="px-3 py-3">{displayPercent(p.trScore)}</td><td className="px-3 py-3">{displayPercent(p.qaScore)}</td><td className="px-3 py-3">{displayPercent(p.simScore)}</td><td className="px-3 py-3 font-bold">{displayPercent(p.composite)}</td><td className="px-3 py-3">{p.composite === null ? 'Incomplete score sources' : 'All 3 sources'}</td></tr>})}</tbody></table></div></details>
        <details className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white"><summary className="cursor-pointer px-4 py-3 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC]">Attendance & absenteeism ledger</summary><div className="overflow-x-auto border-t border-[#E6ECF2]"><table className="min-w-[690px] w-full text-left text-xs"><thead className="bg-[#F7F9FC] text-[10px] font-bold uppercase text-slate-500"><tr>{['Trainee','Attendance (confirmed shifts)','Absent / Excused','Missing shifts','Evidence coverage'].map(t=><th key={t} className="px-3 py-3">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#E6ECF2]">{cohortTrainees.map(j=>{const p=getTraineePerf(j);return <tr key={j.id}><td className="px-3 py-3 font-bold">{j.fullName}</td><td className="px-3 py-3">{displayPercent(p.attRate)}</td><td className="px-3 py-3">{p.absentCount}</td><td className="px-3 py-3">{p.missingAttCount}</td><td className="px-3 py-3">{p.recordedAttCount} recorded days</td></tr>})}</tbody></table><p className="p-3 text-[11px] text-slate-500">Missing records are unrecorded—not automatic absences. Weekend exclusions use the prototype workweek.</p></div></details>
        <details className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white"><summary className="cursor-pointer px-4 py-3 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC]">Daily learning activities</summary><div className="overflow-x-auto border-t border-[#E6ECF2]"><table className="min-w-[750px] w-full text-left text-xs"><thead className="bg-[#F7F9FC] text-[10px] font-bold uppercase text-slate-500"><tr>{['Trainee','Assigned activity','Date','Type','Verification'].map(t=><th key={t} className="px-3 py-3">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#E6ECF2]">{assignments.filter(a => cohortTrainees.some(j => [j.id,j.sibsEmployeeId].includes(a.emp))).slice(0, 35).map(a=>{const trainee=cohortTrainees.find(j=>[j.id,j.sibsEmployeeId].includes(a.emp));const state=progress.find(p=>p.assignmentId===a.id && p.emp===a.emp);return <tr key={a.id}><td className="px-3 py-3 font-bold">{trainee?.fullName ?? a.emp}</td><td className="px-3 py-3">{a.title}</td><td className="px-3 py-3">{a.date}</td><td className="px-3 py-3">{a.type}</td><td className="px-3 py-3">{state?.status ?? 'Not started'}</td></tr>})}</tbody></table></div></details>
      </section>

      {/* Staff-Only Grading Workspace Modal / Form */}
      {showGradingWorkspace && isAssignedTrainer && activeTrainee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#FF5C28] uppercase">STAFF-ONLY FST / PST ASSESSMENT GRADING</span>
                <h3 className="text-base font-extrabold text-[#042C51]">{activeTrainee.fullName}</h3>
                <p className="text-xs text-slate-500">{activeTrainee.sibsEmployeeId || activeTrainee.id} • {activeTrainee.account}</p>
              </div>
              <button onClick={() => setShowGradingWorkspace(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Select Skill Assessment</label>
                <select
                  value={selectedAssessmentId}
                  onChange={e => setSelectedAssessmentId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] font-semibold text-xs text-[#042C51] outline-none focus:border-[#FF5C28]"
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
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#215789] uppercase">Evaluator Identity:</span>
                <p className="text-[#042C51] font-semibold">{activeTrainer} (Assigned Trainer)</p>
                <p className="text-slate-500 text-[11px]">Saving this grade updates the employee's FST / PST records immediately.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGradingWorkspace(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Save Assessment Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
