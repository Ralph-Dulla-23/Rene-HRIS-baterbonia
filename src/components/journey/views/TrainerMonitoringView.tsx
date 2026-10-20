import { useDemoAuth } from "../../../auth/DemoAuthContext";
import React, { useState } from "react";
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

  // Trainee performance helper
  const getTraineePerf = (j: any) => {
    const empKey = j.sibsEmployeeId || j.id;
    // Look up phase training score, day30 nesting QA, etc.
    const fst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === j.id) && s.phase === "FST")?.score;
    const pst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === j.id) && s.phase === "PST")?.score;
    const nestingQa = j.day30?.nestingQaScore;

    // Trainer assessment average
    const trScore = fst !== undefined && pst !== undefined ? Math.round((fst + pst) / 2) : (fst ?? pst ?? nestingQa ?? null);

    // QA Audit score from evidence
    const qaEvid = evidence.filter(e => (e.emp === empKey || e.emp === j.id) && e.type === "QDS / QA");
    const qaScore = qaEvid.length > 0 ? Math.round(qaEvid.reduce((acc, e) => acc + (e.score || 85), 0) / qaEvid.length) : (nestingQa ?? null);

    // Work simulation score
    const simScore = j.day60?.coreProductionScore ?? j.day90?.compositeScore ?? null;

    // Composite calculation from valid present scores
    const validScores = [trScore, qaScore, simScore].filter((s): s is number => s !== null);
    const composite = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    const delta = j.id === "SIBS-2901" ? 4 : j.id === "SIBS-2902" ? 3 : 0;

    // Attendance rate
    const attRecords = attendance.filter(a => (a.emp === empKey || a.emp === j.id));
    const recent14 = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(dStr => {
      if (!j.hireDate || dStr < j.hireDate) return false;
      const w = new Date(dStr + "T12:00:00Z").getUTCDay();
      return w !== 0 && w !== 6;
    });
    let present = 0, late = 0, absent = 0, excused = 0, missing = 0;
    recent14.forEach(dStr => {
      const match = attRecords.find(a => a.date === dStr);
      const st = match?.status || "Unrecorded";
      if (st === "Present") present++;
      else if (st === "Late") late++;
      else if (st === "Absent") absent++;
      else if (st === "Excused") excused++;
      else missing++;
    });
    const covered = present + late + absent + excused;
    const attRate = covered ? Math.round(((present + late) / covered) * 100) : 100;

    // Daily learning verified
    const empAssign = assignments.filter(a => a.emp === empKey || a.emp === j.id);
    const empProg = progress.filter(p => p.emp === empKey || p.emp === j.id);
    const verifiedCount = empProg.filter(p => p.status === "Verified").length;
    const learningVerifiedPct = empAssign.length ? Math.round((100 * verifiedCount) / empAssign.length) : 0;

    return {
      trScore,
      qaScore,
      simScore,
      composite,
      delta,
      attRate,
      absentCount: absent + excused,
      missingAttCount: missing,
      totalAssign: empAssign.length,
      verifiedAssign: verifiedCount,
      learningVerifiedPct
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

  // Cohort summary statistics
  const cohortPerfs = cohortTrainees.map(j => getTraineePerf(j));
  const cohortAvgComposite = cohortPerfs.length ? Math.round(cohortPerfs.reduce((acc, p) => acc + p.composite, 0) / cohortPerfs.length) : 0;
  const cohortAvgQA = cohortPerfs.length ? Math.round(cohortPerfs.reduce((acc, p) => acc + p.qaScore, 0) / cohortPerfs.length) : 0;
  const cohortHighCount = cohortPerfs.filter(p => p.composite >= 85).length;
  const cohortSupportCount = cohortPerfs.filter(p => p.composite < 70).length;
  const cohortAvgAtt = cohortPerfs.length ? Math.round(cohortPerfs.reduce((acc, p) => acc + p.attRate, 0) / cohortPerfs.length) : 100;

  // Filtered trainees by risk
  const displayedTrainees = cohortTrainees.filter(j => {
    const p = getTraineePerf(j);
    if (riskFilter === "high") return p.composite >= 85;
    if (riskFilter === "developing") return p.composite >= 70 && p.composite < 85;
    if (riskFilter === "support") return p.composite < 70;
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
      {/* Hero Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            TRAINER → TRAINEE PERFORMANCE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Trainer Monitoring
          </h2>
          <p className="text-xs text-[#E6EAF0] max-w-3xl leading-relaxed">
            See every trainer, their assigned trainees, and how each cohort is progressing across assessments, independent QA, attendance, and daily training. Scores are evidence indicators, not automatic trainer appraisals.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white shrink-0">
          {trainerNames.length} Trainers • {cohortTrainees.length} Trainees in Selected Roster
        </span>
      </div>

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
            Select any trainer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainerNames.map(tName => {
            const tSummary = journeys.filter(j => j.trainerName === tName);
            const tPerfs = tSummary.map(j => getTraineePerf(j));
            const meanComp = tPerfs.length ? Math.round(tPerfs.reduce((a, p) => a + p.composite, 0) / tPerfs.length) : 0;
            const meanQA = tPerfs.length ? Math.round(tPerfs.reduce((a, p) => a + p.qaScore, 0) / tPerfs.length) : 0;
            const highCount = tPerfs.filter(p => p.composite >= 85).length;
            const supportCount = tPerfs.filter(p => p.composite < 70).length;
            const attMean = tPerfs.length ? Math.round(tPerfs.reduce((a, p) => a + p.attRate, 0) / tPerfs.length) : 100;
            const pendingReqs = qdsRequests.filter(q => q.trainer === tName && q.status !== "Closed").length;
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
                    <strong className="text-base font-black text-[#042C51]">{meanComp}%</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Independent QA</span>
                    <strong className="text-base font-black text-[#042C51]">{meanQA}%</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Attendance</span>
                    <strong className="text-base font-black text-[#042C51]">{attMean}%</strong>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${meanComp}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{highCount} high • {supportCount} need support</span>
                  <span className={pendingReqs ? "text-[#E67E22] font-bold" : "text-slate-400"}>
                    {pendingReqs} follow-up{pendingReqs === 1 ? "" : "s"}
                  </span>
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
              {cohortTrainees.length} assigned trainees • All fully scored
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Cohort Avg</span>
            <strong className="text-xl font-black text-white">{cohortAvgComposite}%</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Independent QA</span>
            <strong className="text-xl font-black text-white">{cohortAvgQA}%</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">High / Support</span>
            <strong className="text-xl font-black text-white">{cohortHighCount} / {cohortSupportCount}</strong>
          </div>
          <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center min-w-[110px]">
            <span className="text-[9.5px] uppercase font-bold text-[#BECBDA] block">Attendance</span>
            <strong className="text-xl font-black text-white">{cohortAvgAtt}%</strong>
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
                    {cat.label} ({perf.composite}%)
                  </span>
                </div>

                {/* Composite bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#042C51]">Composite Score</span>
                    <strong className="text-[#042C51] font-black">{perf.composite}%</strong>
                  </div>
                  <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${perf.composite}%` }} />
                  </div>
                </div>

                {/* 3 Score Rows */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs text-center">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Trainer Assessment (35%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{perf.trScore}%</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">QA Audit (40%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{perf.qaScore}%</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Work Simulation (25%)</span>
                    <strong className="font-extrabold text-[#042C51] text-sm">{perf.simScore}%</strong>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
                  <span>Attendance: <strong className="text-[#042C51]">{perf.attRate}%</strong></span>
                  <span>Verified learning: <strong className="text-[#042C51]">{perf.verifiedAssign} / {perf.totalAssign}</strong></span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTraineeId(j.sibsEmployeeId || j.id);
                      setShowGradingWorkspace(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Grade FST / PST
                  </button>

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

      {/* Staff-Only Grading Workspace Modal / Form */}
      {showGradingWorkspace && activeTrainee && (
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
