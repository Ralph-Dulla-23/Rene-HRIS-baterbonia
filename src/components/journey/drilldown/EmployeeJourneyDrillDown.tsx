import React, { useState } from "react";
import { EmployeeJourney, ReviewRecord } from "../journeyTypes";
import { useJourney } from "../JourneyContext";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  User, 
  Award, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  Activity, 
  Building2, 
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
  Layers
} from "lucide-react";

interface EmployeeJourneyDrillDownProps {
  journey: EmployeeJourney;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "timeline" | "attendance" | "evidence" | "checkins" | "coaching" | "reviews" | "handoffs";
}

export default function EmployeeJourneyDrillDown({ 
  journey, 
  isOpen, 
  onClose,
  initialTab = "timeline"
}: EmployeeJourneyDrillDownProps) {
  const { 
    updateDay30Milestone, 
    updateDay60Milestone, 
    updateDay90Milestone, 
    updateJourneyReview,
    setFinalEmploymentOutcome,
    acknowledgeReview,
    addTouchpoint, 
    linkEmployeeProfile,
    attendance,
    addAttendanceRecord,
    evidence,
    addEvidenceItem,
    checkIns,
    addCheckIn,
    coachingActions,
    addCoachingAction,
    toggleCoachingAction,
    assignments,
    progress,
    phaseTrainingScores,
    assessments,
    assessmentGrades,
    simulatedCurrentDate
  } = useJourney();

  const [activeTab, setActiveTab] = useState<"timeline" | "attendance" | "evidence" | "checkins" | "coaching" | "reviews" | "handoffs">(initialTab);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(() => {
    const d = journey.daysElapsed || 1;
    return d <= 14 ? 0 : d <= 28 ? 1 : d <= 30 ? 2 : d <= 59 ? 3 : d === 60 ? 4 : d <= 89 ? 5 : 6;
  });

  // Modals state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSibsId, setLinkSibsId] = useState(journey.sibsEmployeeId || "");
  const [linkTrainerId, setLinkTrainerId] = useState(journey.trainerId || "TRN-001");
  const [linkTrainerName, setLinkTrainerName] = useState(journey.trainerName || "Maria Cruz (Senior Trainer)");
  const [linkHireDate, setLinkHireDate] = useState(journey.hireDate || "");
  const [linkStartDate, setLinkStartDate] = useState(journey.startDate || "2026-10-15");

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
  const [ciType, setCiType] = useState<"Trainer" | "Team Leader" | "Manager" | "HR Coordinator">("Trainer");
  const [ciOwner, setCiOwner] = useState("Maria Cruz");
  const [ciConfidence, setCiConfidence] = useState(4);
  const [ciNotes, setCiNotes] = useState("");

  const [showAddCoaching, setShowAddCoaching] = useState(false);
  const [coachTitle, setCoachTitle] = useState("");
  const [coachOwner, setCoachOwner] = useState("Anton Reyes (Team Leader)");
  const [coachDue, setCoachDue] = useState("2026-10-25");
  const [coachNotes, setCoachNotes] = useState("");

  // Review forms
  const [day30Qa, setDay30Qa] = useState(journey.day30.nestingQaScore || 85);
  const [day30Attendance, setDay30Attendance] = useState(journey.day30.attendancePunctualityScore || 98.0);
  const [day30Endorsement, setDay30Endorsement] = useState(journey.day30.trainerEndorsement || "Floor Ready");
  const [day30Notes, setDay30Notes] = useState(journey.day30.trainerNotes || "");

  const [day60Prod, setDay60Prod] = useState(journey.day60.coreProductionScore || 89);
  const [day60Aht, setDay60Aht] = useState(journey.day60.averageHandleTimeSeconds || 380);
  const [day60Decision, setDay60Decision] = useState(journey.day60.midProbationDecision || "Progressing Well");
  const [day60Notes, setDay60Notes] = useState(journey.day60.supervisorNotes || "");

  const [day90Composite, setDay90Composite] = useState(journey.day90.compositeScore || 91);
  const [day90Rating, setDay90Rating] = useState(journey.day90.overallPerformanceRating || 4);
  const [officialDecision, setOfficialDecision] = useState(journey.finalOutcome || "Endorse for Regularization");
  const [decisionNotes, setDecisionNotes] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const empKey = journey.sibsEmployeeId || journey.id;

  // Filter collections for this specific employee
  const employeeAttendance = attendance.filter(a => a.emp === empKey || a.emp === journey.id);
  const employeeEvidence = evidence.filter(e => e.emp === empKey || e.emp === journey.id);
  const employeeCheckIns = checkIns.filter(c => c.emp === empKey || c.emp === journey.id);
  const employeeCoaching = coachingActions.filter(c => c.emp === empKey || c.emp === journey.id);
  const employeeAssignments = assignments.filter(a => a.emp === empKey || a.emp === journey.id);

  // Helper date function
  const dayOffset = (dateStr: string, numDays: number) => {
    const d = new Date(dateStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + numDays);
    return d.toISOString().slice(0, 10);
  };

  const dateLabel = (dStr: string) => {
    if (!dStr) return "—";
    return new Date(dStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // 14-day attendance rate
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
  const attRate = attRecorded ? Math.round(((attPresent + attLate) / attRecorded) * 100) : 100;

  // Phase training scores (FST / PST)
  const fstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "FST");
  const pstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "PST");
  const fstScoreVal = fstScoreObj?.score ?? null;
  const pstScoreVal = pstScoreObj?.score ?? null;

  // QA Audit score
  const qaEvid = employeeEvidence.filter(e => e.type === "QDS / QA");
  const qaScoreVal = journey.id === "SIBS-2906" ? 62 : (qaEvid.length ? 88 : 84);

  // Learning progress
  const empProg = progress.filter(p => p.emp === empKey || p.emp === journey.id);
  const verifiedAssigns = empProg.filter(p => p.status === "Verified").length;
  const learningPct = employeeAssignments.length ? Math.round((100 * verifiedAssigns) / employeeAssignments.length) : 0;

  // Benchmark scores for 30 / 60 / 90
  const day30Score = journey.daysElapsed >= 30 ? Math.round((fstScoreVal || 85) * 0.35 + qaScoreVal * 0.40 + 85 * 0.25) : null;
  const day60Score = journey.daysElapsed >= 60 ? (journey.day60.coreProductionScore || 89) : null;
  const day90Score = journey.daysElapsed >= 90 ? (journey.day90.compositeScore || 91) : null;

  // Timeline phase definitions
  const timelinePhases = [
    ["Days 1–14", "FST — Fundamental Skill Training", "Assigned Trainer + QDS/QA Lead", 1, 14],
    ["Days 15–28", "PST — Product Skills Training", "Team Leader + Assigned Trainer", 15, 28],
    ["Day 30", "Day 30 Milestone Checkpoint", "Operations Manager + HR Coordinator", 29, 30],
    ["Days 31–59", "Supported Operations (Ramp)", "Team Leader", 31, 59],
    ["Day 60", "Day 60 Mid-Probation Checkpoint", "Operations Manager + HR Coordinator", 60, 60],
    ["Days 61–89", "Performance Consistency", "Team Leader + Operations Manager", 61, 89],
    ["Day 90+", "Day 90 Onboarding Disposition", "HR Process Owner + Operations Manager", 90, 120]
  ] as const;

  const activePhaseDef = timelinePhases[selectedPhaseIndex];
  const activePhaseInfo = {
    start: dayOffset(hire, activePhaseDef[3] - 1),
    end: dayOffset(hire, activePhaseDef[4] - 1),
    future: dayOffset(hire, activePhaseDef[3] - 1) > simulatedCurrentDate
  };

  const getCheckpointScore = (day: number) => {
    if (day === 30) return day30Score;
    if (day === 60) return day60Score;
    if (day === 90) return day90Score;
    return null;
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    linkEmployeeProfile(journey.id, linkSibsId, linkTrainerId, linkTrainerName, linkHireDate, linkStartDate);
    setToastMessage("Linked employee profile successfully!");
    setShowLinkModal(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAttendanceRecord({
      emp: empKey,
      date: attDate,
      status: attStatus,
      source: attSource,
      notes: attNotes
    });
    setToastMessage(`Recorded ${attStatus} for ${attDate}`);
    setShowAddAttendance(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvidenceItem({
      emp: empKey,
      type: evType,
      title: evTitle,
      owner: evOwner,
      notes: evNotes,
      date: simulatedCurrentDate
    });
    setToastMessage(`Added evidence "${evTitle}"`);
    setShowAddEvidence(false);
    setEvTitle("");
    setEvNotes("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheckIn({
      emp: empKey,
      date: simulatedCurrentDate,
      type: ciType,
      owner: ciOwner,
      confidence: ciConfidence,
      notes: ciNotes
    });
    setToastMessage("Logged 1-on-1 check-in!");
    setShowAddCheckIn(false);
    setCiNotes("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCoachingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCoachingAction({
      emp: empKey,
      title: coachTitle,
      owner: coachOwner,
      due: coachDue,
      status: "Open",
      notes: coachNotes
    });
    setToastMessage("Created coaching support action!");
    setShowAddCoaching(false);
    setCoachTitle("");
    setCoachNotes("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // SVG Chart Math
  const plotY = (val: number) => Math.round(184 - (val / 100) * 150);
  const plotX = [120, 270, 420];
  const trendScores = [day30Score, day60Score, day90Score];
  const points = trendScores.map((sc, idx) => sc !== null ? { x: plotX[idx], score: sc } : null).filter(Boolean) as { x: number; score: number }[];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#E6ECF2]">
        
        {/* Header / Banner */}
        <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-5 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#042C51] font-black text-lg flex items-center justify-center shrink-0">
                {journey.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-white">{journey.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-white">
                    {journey.stage}
                  </span>
                  {journey.isAwaitingLinkage && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E67E22] text-white">
                      Needs Authorized Linkage
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#E6EAF0] mt-1">
                  <span>SIB ID: <strong>{journey.sibsEmployeeId || "Not Linked"}</strong></span>
                  <span>Kronos ID: <strong>{journey.kronosId || "Not Linked"}</strong></span>
                  <span>Account: <strong>{journey.account}</strong></span>
                  <span>Trainer: <strong>{journey.trainerName || "Unassigned"}</strong></span>
                  <span>WFM Station: <strong>{journey.wfmSeating ? `${journey.wfmSeating.wing} • ${journey.wfmSeating.seatNumber}` : "Pending"}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {journey.isAwaitingLinkage && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#d35400] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Authorize Linkage</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 7 Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pt-2 border-t border-white/10 scrollbar-none text-xs">
            {[
              ["timeline", "◇", "Journey Timeline"],
              ["attendance", "◫", "Attendance & Absenteeism"],
              ["evidence", "▣", "Evidence Library"],
              ["checkins", "☑", "Check-ins"],
              ["coaching", "⚑", "Coaching & Support"],
              ["reviews", "★", "30 / 60 / 90 Reviews"],
              ["handoffs", "⇄", "Handoffs"]
            ].map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === id ? "bg-white text-[#042C51] shadow-xs" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="sibs-tone-green-bg border-b sibs-tone-green-border sibs-tone-green-text text-xs px-6 py-2 flex items-center justify-between shrink-0">
            <span className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {toastMessage}
            </span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* EMPLOYEE PERFORMANCE VISUALIZATION ABOVE TABS */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-widest block">EMPLOYEE PERFORMANCE RESULTS</span>
                <h3 className="text-base font-extrabold text-[#042C51]">Training & Milestone Performance</h3>
                <p className="text-xs text-slate-500">Phase assessment results, independent quality evidence, attendance, and 30–60–90 checkpoint trends for {journey.fullName}.</p>
              </div>
              <button
                onClick={() => setActiveTab("reviews")}
                className="px-3 py-1.5 rounded-xl border border-[#BECBDA] bg-[#F7F9FC] hover:bg-slate-100 font-semibold text-xs text-[#042C51] cursor-pointer shadow-xs self-start sm:self-auto transition-colors"
              >
                Open Checkpoint Reviews
              </button>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
                <span className="text-[10px] font-bold text-slate-500 block">Latest Assessed Checkpoint</span>
                <strong className="text-2xl font-black text-[#042C51] my-1 block">{day30Score ? day30Score + "%" : "N/A"}</strong>
                <span className="text-[10px] text-slate-500 block">{day30Score ? "Day 30 checkpoint • High" : "No completed checkpoint"}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
                <span className="text-[10px] font-bold text-slate-500 block">Latest Independent QA</span>
                <strong className="text-2xl font-black text-[#042C51] my-1 block">{qaScoreVal}%</strong>
                <span className="text-[10px] text-slate-500 block">Audited recently</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
                <span className="text-[10px] font-bold text-slate-500 block">Attendance • Last 14 Days</span>
                <strong className="text-2xl font-black text-[#042C51] my-1 block">{attRate}%</strong>
                <span className="text-[10px] text-slate-500 block">{attAbsent} absent • {attExcused} excused • {attMissing} missing</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
                <span className="text-[10px] font-bold text-slate-500 block">Learning Activities Verified</span>
                <strong className="text-2xl font-black text-[#042C51] my-1 block">{employeeAssignments.length ? `${verifiedAssigns} / ${employeeAssignments.length}` : "N/A"}</strong>
                <span className="text-[10px] text-slate-500 block">{learningPct}% verified by assigned owner</span>
              </div>
            </div>

            {/* Main Viz & FST/PST Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* SVG Trend Line Panel */}
              <div className="border border-[#E6ECF2] rounded-xl p-4 bg-[#FAFCFF] space-y-3">
                <h4 className="text-xs font-bold text-[#042C51]">30 / 60 / 90 Performance Trend</h4>
                <p className="text-[11px] text-slate-500">Checkpoint composite scores from eligible, complete phase scorecards only.</p>

                {/* SVG Chart */}
                <svg className="w-full h-auto max-h-48 overflow-visible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 222">
                  <line x1="57" x2="496" y1={plotY(85)} y2={plotY(85)} stroke="#E6ECF2" strokeDasharray="4 5" />
                  <text x="12" y={plotY(85) + 4} fill="#667085" fontSize="12">85%</text>

                  <line x1="57" x2="496" y1={plotY(70)} y2={plotY(70)} stroke="#E6ECF2" strokeDasharray="4 5" />
                  <text x="12" y={plotY(70) + 4} fill="#667085" fontSize="12">70%</text>

                  <line x1="57" x2="496" y1={plotY(0)} y2={plotY(0)} stroke="#E6ECF2" />
                  <text x="12" y={plotY(0) + 4} fill="#667085" fontSize="12">0%</text>

                  {points.length > 1 && (
                    <polyline
                      points={points.map(pt => `${pt.x},${plotY(pt.score!)}`).join(" ")}
                      fill="none"
                      stroke="#042C51"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {[
                    { day: 30, score: day30Score, x: plotX[0], rev: journey.day30.status },
                    { day: 60, score: day60Score, x: plotX[1], rev: journey.day60.status },
                    { day: 90, score: day90Score, x: plotX[2], rev: journey.day90.status }
                  ].map(pt => {
                    const valid = pt.score !== null;
                    const y = valid ? plotY(pt.score!) : 184;

                    return (
                      <g key={pt.day}>
                        {valid ? (
                          <>
                            <circle cx={pt.x} cy={y} r="7" fill="#FF5C28" stroke="#fff" strokeWidth="3" />
                            <text textAnchor="middle" x={pt.x} y={Math.max(17, y - 17)} fill="#042C51" fontSize="14" fontWeight="800">
                              {pt.score}%
                            </text>
                          </>
                        ) : (
                          <circle cx={pt.x} cy="184" r="5" fill="#BECBDA" />
                        )}
                        <text textAnchor="middle" x={pt.x} y="210" fill="#042C51" fontSize="12" fontWeight="700">
                          Day {pt.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Benchmark Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { day: 30, score: day30Score, status: journey.day30.status },
                    { day: 60, score: day60Score, status: journey.day60.status },
                    { day: 90, score: day90Score, status: journey.day90.status }
                  ].map(b => (
                    <button
                      key={b.day}
                      onClick={() => {
                        setActiveTab("reviews");
                      }}
                      className="p-2 border border-[#E6ECF2] rounded-lg bg-white text-left hover:bg-[#F7F9FC] cursor-pointer transition-colors"
                    >
                      <span className="text-[10px] text-slate-500 font-bold block">DAY {b.day}</span>
                      <strong className="text-base font-extrabold text-[#042C51] block my-0.5">
                        {b.score ? b.score + "%" : "Upcoming"}
                      </strong>
                      <span className="text-[9.5px] text-slate-400 block">{b.status}</span>
                      <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${b.score || 0}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FST & PST Progress Bars Panel */}
              <div className="border border-[#E6ECF2] rounded-xl p-4 bg-[#FAFCFF] space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#042C51]">First 30 Days • FST & PST</h4>
                  <p className="text-[11px] text-slate-500">Individual training phase assessments. These remain separate from the Day 30 checkpoint composite.</p>

                  <div className="space-y-3 mt-3">
                    {/* FST */}
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-[#042C51]">FST <span className="text-[10px] font-normal text-slate-500">Fundamental Skill Training</span></strong>
                        <span className="font-extrabold text-[#042C51]">{fstScoreVal !== null ? fstScoreVal + "%" : "Not scored"}</span>
                      </div>
                      <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${fstScoreVal || 0}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Phase 1 (Days 1–14) assessment</span>
                    </div>

                    {/* PST */}
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-[#042C51]">PST <span className="text-[10px] font-normal text-slate-500">Product Skills Training</span></strong>
                        <span className="font-extrabold text-[#FF5C28]">{pstScoreVal !== null ? pstScoreVal + "%" : "Not scored"}</span>
                      </div>
                      <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${pstScoreVal || 0}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Phase 2 (Days 15–28) assessment</span>
                    </div>
                  </div>
                </div>

                {/* Verified Completion Bar */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <strong className="text-[#042C51]">Verified learning completion</strong>
                    <span className="font-bold text-[#FF5C28]">{learningPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${learningPct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {verifiedAssigns} of {employeeAssignments.length} assigned activities verified by owner.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: JOURNEY TIMELINE (WITH 7 CLICKABLE TIMELINE PHASES) */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              
              {/* 7 CLICKABLE JOURNEY PHASES STRIP */}
              <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#042C51] uppercase tracking-wider">7 Journey Timeline Phases</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">Click any phase to inspect details</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    ["Days 1–14", "FST – Fundamental", "Trainer + QDS/QA", 14],
                    ["Days 15–28", "PST – Product", "Team Leader + Trainer", 28],
                    ["Day 30", "Checkpoint", "Manager + HR", 30],
                    ["Days 31–59", "Operations", "Team Leader", 59],
                    ["Day 60", "Checkpoint", "Manager + HR", 60],
                    ["Days 61–89", "Consistency", "TL / Manager", 89],
                    ["Day 90+", "HR disposition", "Manager + HR", 90]
                  ].map(([date, name, owner, last], i) => {
                    const daysElapsed = journey.daysElapsed || 1;
                    const prevEnd = i === 0 ? 0 : [14, 28, 30, 59, 60, 89][i - 1];
                    const active = daysElapsed >= (i === 2 ? 29 : i === 0 ? 1 : prevEnd + 1) && daysElapsed <= Number(last);
                    const isSelected = selectedPhaseIndex === i;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPhaseIndex(i)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative min-h-[110px] ${
                          isSelected 
                            ? "bg-[#E9F0FC] border-2 border-[#042C51] shadow-xs" 
                            : active 
                              ? "bg-[#F7F9FC] border-2 border-[#042C51]" 
                              : "bg-[#FAFCFF] border-[#E6ECF2] hover:border-[#FF5C28]"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">{date}</span>
                          <strong className="text-xs font-extrabold text-[#042C51] block mt-1 leading-snug">{name}</strong>
                          <span className="text-[9.5px] text-slate-500 block mt-1">{owner}</span>
                        </div>

                        <span className="text-[10px] font-extrabold text-[#FF5C28] mt-2 block">
                          {isSelected ? "Viewing →" : "Inspect →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">
                  Days 1–14: FST (Fundamental Skill Training). Days 15–28: PST (Product Skills Training). Day 29 prepares for the Day 30 checkpoint. Select a phase to view its specific training materials, assessments, audits, or review outcomes.
                </p>
              </div>

              {/* ACTIVE PHASE DETAILS PANEL */}
              <div className="bg-white rounded-2xl border border-[#E6ECF2] p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-widest block">
                      SELECTED JOURNEY PHASE • {dateLabel(activePhaseInfo.start)} – {dateLabel(activePhaseInfo.end)}
                    </span>
                    <h3 className="text-lg font-black text-[#042C51] mt-0.5">{activePhaseDef[0]}</h3>
                    <p className="text-xs text-slate-500 mt-1">{activePhaseDef[1]}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    activePhaseInfo.future ? "bg-slate-100 text-slate-600" : "sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border"
                  }`}>
                    {activePhaseInfo.future ? "Upcoming Phase" : "Phase Records"}
                  </span>
                </div>

                {/* Phase Specific Content */}
                {selectedPhaseIndex === 0 || selectedPhaseIndex === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Phase Assessment</span>
                        <strong className="text-2xl font-black text-[#042C51] my-1 block">
                          {selectedPhaseIndex === 0 ? (fstScoreVal !== null ? fstScoreVal + "%" : "Not scored") : (pstScoreVal !== null ? pstScoreVal + "%" : "Not scored")}
                        </strong>
                        <span className="text-[10px] text-slate-400">Recorded phase score</span>
                      </div>

                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Training Activities</span>
                        <strong className="text-2xl font-black text-[#042C51] my-1 block">
                          {employeeAssignments.length}
                        </strong>
                        <span className="text-[10px] text-slate-400">{verifiedAssigns} verified</span>
                      </div>

                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Independent QA Audits</span>
                        <strong className="text-2xl font-black text-[#042C51] my-1 block">
                          {qaEvid.length}
                        </strong>
                        <span className="text-[10px] text-slate-400">Audits recorded</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl space-y-2">
                      <h4 className="text-xs font-extrabold text-[#042C51]">
                        {selectedPhaseIndex === 0 ? "FST Phase Materials & Tasks" : "PST Phase Materials & Tasks"}
                      </h4>
                      {employeeAssignments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No training materials assigned in this phase.</p>
                      ) : (
                        <div className="space-y-2 text-xs">
                          {employeeAssignments.slice(0, 4).map(a => (
                            <div key={a.id} className="p-2.5 bg-white border border-[#E6ECF2] rounded-lg flex items-center justify-between">
                              <div>
                                <strong className="text-[#042C51]">{a.title}</strong>
                                <span className="text-[10px] text-slate-400 block">{a.type} • {a.duration} • By {a.owner}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {a.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : [2, 4, 6].includes(selectedPhaseIndex) ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Checkpoint Result</span>
                        <strong className="text-2xl font-black text-[#042C51] my-1 block">
                          {getCheckpointScore(selectedPhaseIndex === 2 ? 30 : selectedPhaseIndex === 4 ? 60 : 90) ? getCheckpointScore(selectedPhaseIndex === 2 ? 30 : selectedPhaseIndex === 4 ? 60 : 90) + "%" : "Not scored"}
                        </strong>
                        <span className="text-[10px] text-slate-400">Formal milestone score</span>
                      </div>

                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Independent QA</span>
                        <strong className="text-2xl font-black text-[#042C51] my-1 block">{qaScoreVal}%</strong>
                        <span className="text-[10px] text-slate-400">QDS / QA evidence</span>
                      </div>

                      <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">Review Status</span>
                        <strong className="text-base font-black text-[#042C51] my-1 block">
                          {journey.reviews?.[selectedPhaseIndex === 2 ? 30 : selectedPhaseIndex === 4 ? 60 : 90]?.decision || "Pending Review"}
                        </strong>
                        <span className="text-[10px] text-slate-400">Manager & HR outcome</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs text-slate-600 space-y-2">
                    <strong className="text-[#042C51] block">Operational Support Phase</strong>
                    <p>Production monitoring, coaching check-ins, and performance consistency tracking.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#042C51]">Attendance & Biometric History</h3>
                  <p className="text-xs text-slate-500">Log and verify attendance records for {journey.fullName}.</p>
                </div>
                <button
                  onClick={() => setShowAddAttendance(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + Record Attendance
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">14-Day Rate</span>
                  <strong className="text-xl font-black text-[#042C51] block mt-0.5">{attRate}%</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
                  <strong className="text-xl font-black text-[#2ECC71] block mt-0.5">{attPresent}</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Late</span>
                  <strong className="text-xl font-black text-[#E67E22] block mt-0.5">{attLate}</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Absent / Excused</span>
                  <strong className="text-xl font-black text-[#E74C3C] block mt-0.5">{attAbsent + attExcused}</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFCFF] text-slate-500 font-bold text-[10px] uppercase border-b border-[#E6ECF2]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeAttendance.map(a => (
                      <tr key={a.id} className="hover:bg-[#F7F9FC]">
                        <td className="py-2.5 px-3 font-bold text-[#042C51]">{a.date}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === "Present" 
                              ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" 
                              : a.status === "Late" 
                                ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" 
                                : "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{a.source}</td>
                        <td className="py-2.5 px-3 text-slate-500">{a.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE */}
          {activeTab === "evidence" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#042C51]">Evidence Library</h3>
                  <p className="text-xs text-slate-500">Scored quality audits, training records, and coaching artifacts.</p>
                </div>
                <button
                  onClick={() => setShowAddEvidence(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + Add Evidence
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employeeEvidence.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-white space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#FF5C28]">{ev.type}</span>
                      <span className="text-[10px] text-slate-400">{ev.date}</span>
                    </div>
                    <strong className="text-xs font-bold text-[#042C51] block">{ev.title}</strong>
                    <p className="text-xs text-slate-600">{ev.notes}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">Owner: {ev.owner}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKINS */}
          {activeTab === "checkins" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#042C51]">1-on-1 Touchpoints & Check-ins</h3>
                  <p className="text-xs text-slate-500">Logged conversations between employee and supervisors.</p>
                </div>
                <button
                  onClick={() => setShowAddCheckIn(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + Log Check-in
                </button>
              </div>

              <div className="space-y-3">
                {employeeCheckIns.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#042C51]">{c.type} Touchpoint</span>
                      <span className="text-[10px] text-slate-400">{c.date}</span>
                    </div>
                    <p className="text-xs text-[#042C51] font-medium">{c.notes}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Owner: {c.owner}</span>
                      <span>Confidence Score: <strong>{c.confidence} / 5</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COACHING */}
          {activeTab === "coaching" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#042C51]">Coaching & Corrective Support</h3>
                  <p className="text-xs text-slate-500">Action items assigned by Team Leader or Trainer.</p>
                </div>
                <button
                  onClick={() => setShowAddCoaching(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + Add Action
                </button>
              </div>

              <div className="space-y-3">
                {employeeCoaching.map(co => (
                  <div key={co.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-white flex items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-[#042C51]">{co.title}</strong>
                        <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold ${
                          co.status === "Done" 
                            ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" 
                            : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
                        }`}>
                          {co.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{co.notes}</p>
                      <span className="text-[10px] text-slate-400 block">Owner: {co.owner} • Due: {co.due}</span>
                    </div>

                    <button
                      onClick={() => toggleCoachingAction(co.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs ${
                        co.status === "Done" 
                          ? "bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC]" 
                          : "bg-[#FF5C28] hover:bg-[#e04f20] text-white"
                      }`}
                    >
                      {co.status === "Done" ? "Reopen Action" : "Mark Complete"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS (30 / 60 / 90) */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-[#042C51]">30 / 60 / 90 Milestone Evaluations</h3>
                <p className="text-xs text-slate-500">Formal manager and HR checkpoint sign-offs.</p>
              </div>

              {/* Day 30 Review Card */}
              <div className="p-5 rounded-2xl border border-[#E6ECF2] bg-[#FAFCFF] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-[#042C51]">Day 30 Checkpoint</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    journey.day30.status === "Completed" ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
                  }`}>
                    {journey.day30.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Nesting QA Score</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day30.nestingQaScore || 85}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Attendance Adherence</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day30.attendancePunctualityScore || 98}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Trainer Endorsement</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day30.trainerEndorsement || "Floor Ready"}</strong>
                  </div>
                </div>
              </div>

              {/* Day 60 Review Card */}
              <div className="p-5 rounded-2xl border border-[#E6ECF2] bg-[#FAFCFF] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-[#042C51]">Day 60 Checkpoint</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    journey.day60.status === "Completed" ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
                  }`}>
                    {journey.day60.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Core Production Score</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day60.coreProductionScore || 89}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Average Handle Time (AHT)</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day60.averageHandleTimeSeconds || 380}s</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Supervisor Decision</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day60.midProbationDecision || "Progressing Well"}</strong>
                  </div>
                </div>
              </div>

              {/* Day 90 Review Card */}
              <div className="p-5 rounded-2xl border border-[#E6ECF2] bg-[#FAFCFF] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-[#042C51]">Day 90 Regularization Disposition</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    journey.day90.status === "Completed" ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
                  }`}>
                    {journey.day90.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Composite Score</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day90.compositeScore || 91}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Performance Rating</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.day90.overallPerformanceRating || 4} / 5</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold block">Final Recommendation</span>
                    <strong className="text-base font-black text-[#042C51]">{journey.finalOutcome || "Endorse for Regularization"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: HANDOFFS */}
          {activeTab === "handoffs" && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-[#042C51]">Handoff & Transition Status</h3>
                <p className="text-xs text-slate-500">Track NHO to Journey, Trainer to Operations, and HR Regularization handoffs.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex items-center justify-between">
                  <div>
                    <strong className="text-[#042C51] block">NHO → Employee Journey Handoff</strong>
                    <span className="text-slate-500 text-[11px]">Accepted by HR Coordinator: {journey.nhoAcceptedBy || "System"}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border">
                    Completed
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex items-center justify-between">
                  <div>
                    <strong className="text-[#042C51] block">Training → Operations Handoff (Day 30)</strong>
                    <span className="text-slate-500 text-[11px]">Accepted by Team Leader: Anton Reyes</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border">
                    Completed
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] flex items-center justify-between">
                  <div>
                    <strong className="text-[#042C51] block">Day 90 Regularization Contract Issuance</strong>
                    <span className="text-slate-500 text-[11px]">HR Operations Sign-off</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Authorized Linkage Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Authorize Profile Linkage</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">SiBS Employee ID</label>
                <input
                  type="text"
                  value={linkSibsId}
                  onChange={e => setLinkSibsId(e.target.value)}
                  placeholder="e.g. SIBS-2901"
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Assigned Trainer Name</label>
                <input
                  type="text"
                  value={linkTrainerName}
                  onChange={e => setLinkTrainerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Link & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {showAddAttendance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Record Attendance Entry</h3>
              <button onClick={() => setShowAddAttendance(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAttendanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Shift Date</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={e => setAttDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Status</label>
                <select
                  value={attStatus}
                  onChange={e => setAttStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Excused">Excused</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Source</label>
                <input
                  type="text"
                  value={attSource}
                  onChange={e => setAttSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Notes</label>
                <input
                  type="text"
                  value={attNotes}
                  onChange={e => setAttNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAttendance(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddEvidence && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Add Quality / Training Evidence</h3>
              <button onClick={() => setShowAddEvidence(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvidenceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Evidence Type</label>
                <select
                  value={evType}
                  onChange={e => setEvType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                >
                  <option value="Training">Training</option>
                  <option value="QDS / QA">QDS / QA</option>
                  <option value="Performance">Performance</option>
                  <option value="Coaching">Coaching</option>
                  <option value="Work quality">Work quality</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Title</label>
                <input
                  type="text"
                  value={evTitle}
                  onChange={e => setEvTitle(e.target.value)}
                  placeholder="e.g. Side-by-side call audit scorecard"
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Notes / Score</label>
                <textarea
                  rows={3}
                  value={evNotes}
                  onChange={e => setEvNotes(e.target.value)}
                  placeholder="Enter detailed audit findings..."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvidence(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Add Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Check-in Modal */}
      {showAddCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Log 1-on-1 Touchpoint</h3>
              <button onClick={() => setShowAddCheckIn(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCheckInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Touchpoint Role</label>
                <select
                  value={ciType}
                  onChange={e => setCiType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                >
                  <option value="Trainer">Trainer</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Manager">Manager</option>
                  <option value="HR Coordinator">HR Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Confidence Score (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={ciConfidence}
                  onChange={e => setCiConfidence(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Discussion Notes</label>
                <textarea
                  rows={3}
                  value={ciNotes}
                  onChange={e => setCiNotes(e.target.value)}
                  placeholder="Record summary of 1-on-1 check-in..."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCheckIn(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Log Touchpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coaching Action Modal */}
      {showAddCoaching && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Create Coaching Action</h3>
              <button onClick={() => setShowAddCoaching(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoachingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Action Title</label>
                <input
                  type="text"
                  value={coachTitle}
                  onChange={e => setCoachTitle(e.target.value)}
                  placeholder="e.g. Targeted AHT reduction practice"
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Due Date</label>
                <input
                  type="date"
                  value={coachDue}
                  onChange={e => setCoachDue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Notes / Strategy</label>
                <textarea
                  rows={3}
                  value={coachNotes}
                  onChange={e => setCoachNotes(e.target.value)}
                  placeholder="Describe coaching steps..."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoaching(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Create Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
