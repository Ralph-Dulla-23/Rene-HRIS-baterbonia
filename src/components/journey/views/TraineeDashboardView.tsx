import { useDemoAuth } from "../../../auth/DemoAuthContext";
import React, { useState } from "react";
import { useJourney } from "../JourneyContext";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Award, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  User, 
  Send, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check,
  Sparkles,
  Layers,
  Eye,
  ChevronLeft,
  Filter,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";

interface TraineeDashboardViewProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function TraineeDashboardView({ onSwitchModule }: TraineeDashboardViewProps) {
  const {user} = useDemoAuth();
  const isEmployee = user?.role === 'Employee';
  const { 
    journeys, 
    assignments, 
    progress, 
    assessments, 
    assessmentGrades, 
    phaseTrainingScores, 
    attendance, 
    submitAssignment,
    verifyAssignment,
    simulatedCurrentDate,
    setSelectedJourney 
  } = useJourney();

  // Selected trainee for personal view
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return journeys[0]?.sibsEmployeeId || journeys[0]?.id || "SIBS-2901";
  });

  const [trainingDate, setTrainingDate] = useState<string>(simulatedCurrentDate || "2026-10-14");
  const [taskFilter, setTaskFilter] = useState<"All" | "To do" | "For review" | "Verified">("All");

  const [activeMaterialModal, setActiveMaterialModal] = useState<any | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const ownJourney = isEmployee ? journeys.find(j => j.sibsEmployeeId === user?.journeyEmployeeId || j.id === user?.journeyEmployeeId || (user?.email && j.email?.toLowerCase() === user.email.toLowerCase())) : null;
  const currentJourney = isEmployee ? ownJourney : (journeys.find(j => j.sibsEmployeeId === selectedEmpId || j.id === selectedEmpId) || journeys[0]);
  if (!currentJourney) return <div className="p-6 rounded-xl bg-white border border-[#E6ECF2] text-slate-600">No Employee Journey is linked to your demo profile.</div>;
  const empKey = currentJourney.sibsEmployeeId || currentJourney.id;

  // Helper date functions
  const dayOffset = (dateStr: string, numDays: number) => {
    const d = new Date(dateStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + numDays);
    return d.toISOString().slice(0, 10);
  };

  const dateLabel = (dStr: string) => {
    if (!dStr) return "—";
    return new Date(dStr + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const weekOf = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00Z");
    const mon = dayOffset(dateStr, -((d.getUTCDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => dayOffset(mon, i));
  };

  const getAttendanceAt = (dateStr: string) => {
    if (!currentJourney.hireDate || dateStr < currentJourney.hireDate || dateStr > simulatedCurrentDate) return "Not scheduled";
    const weekday = new Date(dateStr + "T12:00:00Z").getUTCDay();
    if (weekday === 0 || weekday === 6) return "Rest day";
    const match = attendance.find(a => (a.emp === empKey || a.emp === currentJourney.id) && a.date === dateStr);
    return match?.status || "Unrecorded";
  };

  const attendanceTone = (status: string) => {
    switch (status) {
      case "Present": return "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border";
      case "Late": return "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border";
      case "Absent": return "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border";
      case "Excused": return "sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border";
      default: return "bg-[#F7F9FC] text-slate-600 border border-[#E6ECF2]";
    }
  };

  // Trainee assignments & materials
  const traineeAssignments = assignments.filter(a => a.emp === empKey || a.emp === currentJourney?.id);
  const selectedDayAssignments = traineeAssignments.filter(a => a.date === trainingDate);
  const materialRows = selectedDayAssignments.filter(a => a.type === "Material");
  const goalRows = selectedDayAssignments.filter(a => a.type === "Goal");

  const getSubmission = (item: any) => {
    return progress.find(p => (p.emp === empKey || p.emp === currentJourney.id) && p.assignmentId === item.id);
  };

  const getStatus = (item: any) => {
    return getSubmission(item)?.status || "Not started";
  };

  const getTone = (status: string) => {
    switch (status) {
      case "Verified": return "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border";
      case "Submitted": return "sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border";
      case "Revision requested": return "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border";
      case "In progress": return "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const filterMatches = (item: any) => {
    const st = getStatus(item);
    if (taskFilter === "All") return true;
    if (taskFilter === "To do") return ["Not started", "In progress", "Revision requested"].includes(st);
    if (taskFilter === "For review") return st === "Submitted";
    if (taskFilter === "Verified") return st === "Verified";
    return true;
  };

  // Weekly stats
  const weekDays = weekOf(trainingDate);
  const weekMaterials = weekDays.flatMap(day => traineeAssignments.filter(a => a.date === day && a.type === "Material"));
  const weekSubmitted = weekMaterials.filter(a => ["Submitted", "Verified"].includes(getStatus(a))).length;
  const weekVerified = weekMaterials.filter(a => getStatus(a) === "Verified").length;
  const weekRevision = weekMaterials.filter(a => getStatus(a) === "Revision requested").length;
  const weekPct = weekMaterials.length ? Math.round((100 * weekSubmitted) / weekMaterials.length) : 0;

  // Selected day stats
  const daySubmitted = materialRows.filter(a => ["Submitted", "Verified"].includes(getStatus(a))).length;
  const dayVerified = materialRows.filter(a => getStatus(a) === "Verified").length;
  const dayPct = materialRows.length ? Math.round((100 * daySubmitted) / materialRows.length) : 0;

  // Trainee 14-day attendance
  const traineeAttendance = attendance.filter(a => a.emp === empKey || a.emp === currentJourney?.id);
  const recent14Days = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(dStr => {
    if (!currentJourney.hireDate || dStr < currentJourney.hireDate) return false;
    const w = new Date(dStr + "T12:00:00Z").getUTCDay();
    return w !== 0 && w !== 6;
  });
  let attPresent = 0, attLate = 0, attAbsent = 0, attExcused = 0, attMissing = 0;
  recent14Days.forEach(dStr => {
    const st = getAttendanceAt(dStr);
    if (st === "Present") attPresent++;
    else if (st === "Late") attLate++;
    else if (st === "Absent") attAbsent++;
    else if (st === "Excused") attExcused++;
    else attMissing++;
  });
  const attRecorded = attPresent + attLate + attAbsent + attExcused;
  const attRate = attRecorded ? Math.round(((attPresent + attLate) / attRecorded) * 100) : 100;

  // Trainee FST & PST assessment grades
  const publishedAssessments = assessments.filter(a => a.status === "Published" && (a.account === "All accounts" || a.account === currentJourney.account));
  const traineeGrades = assessmentGrades.filter(g => g.emp === empKey || g.emp === currentJourney.id);
  const assessmentResults = publishedAssessments.map(a => {
    const grade = traineeGrades.find(g => g.assessmentId === a.id);
    const pct = grade ? Math.round((100 * grade.score) / a.max) : null;
    const passed = grade ? grade.score >= a.passing : false;
    return { a, grade, pct, passed };
  });

  const gradedItems = assessmentResults.filter(x => x.pct !== null);
  const passedItems = gradedItems.filter(x => x.passed);
  const overallAvg = gradedItems.length ? Math.round(gradedItems.reduce((acc, x) => acc + (x.pct || 0), 0) / gradedItems.length) : null;

  const fstItems = assessmentResults.filter(x => x.a.phase === "FST");
  const fstGraded = fstItems.filter(x => x.pct !== null);
  const fstAvg = fstGraded.length ? Math.round(fstGraded.reduce((acc, x) => acc + (x.pct || 0), 0) / fstGraded.length) : null;

  const pstItems = assessmentResults.filter(x => x.a.phase === "PST");
  const pstGraded = pstItems.filter(x => x.pct !== null);
  const pstAvg = pstGraded.length ? Math.round(pstGraded.reduce((acc, x) => acc + (x.pct || 0), 0) / pstGraded.length) : null;

  const upcomingMaterials = traineeAssignments.filter(a => a.type === "Material" && a.date > trainingDate).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaterialModal) return;
    submitAssignment(activeMaterialModal.id, empKey, submissionNote);
    setShowSuccessToast(`Submitted "${activeMaterialModal.title}" for trainer review!`);
    setActiveMaterialModal(null);
    setSubmissionNote("");
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const selectedAttendance = getAttendanceAt(trainingDate);
  const isToday = trainingDate === simulatedCurrentDate;

  return (
    <div className="space-y-6">
      {/* Top Controls / Persona Selector */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#042C51] text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-[#FF5C28]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#042C51]">Trainee Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5C28] text-white uppercase tracking-wider">
                Persona Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personal learning materials, daily goals, attendance, and assessment results.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#BECBDA] rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-[#042C51] uppercase tracking-wider">Trainee Persona:</span>
            <select 
              disabled={isEmployee}
              value={isEmployee ? (currentJourney.sibsEmployeeId || currentJourney.id) : selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="text-xs font-semibold text-[#042C51] bg-transparent outline-none cursor-pointer"
            >
              {(isEmployee ? [currentJourney] : journeys).map(j => (
                <option key={j.id} value={j.sibsEmployeeId || j.id}>
                  {j.fullName} ({j.sibsEmployeeId || j.kronosId || "No ID"})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSelectedJourney(currentJourney)}
            className="text-xs font-semibold text-[#042C51] bg-white hover:bg-[#F7F9FC] border border-[#BECBDA] px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>Open 7-Tab Record</span>
          </button>

          {!isEmployee && onSwitchModule && (
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

      {showSuccessToast && (
        <div className="sibs-tone-green-bg border sibs-tone-green-border sibs-tone-green-text text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Hero Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            MY LEARNING WORKSPACE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Good to see you, {currentJourney.fullName.split(" ")[0]}!
          </h2>
          <p className="text-xs text-[#E6EAF0] max-w-2xl leading-relaxed">
            Your daily learning materials, FST/PST grades, and training progress in one place.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-white">
              Day {currentJourney.daysElapsed} of 90
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-white">
              Training owner: {currentJourney.trainerName || "Assigned Trainer"}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${attendanceTone(selectedAttendance)}`}>
              Attendance: {selectedAttendance}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-white">
              Sample learning workspace
            </span>
          </div>
        </div>

        {/* Learning Day Badge */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[140px] text-center shrink-0 w-full md:w-auto">
          <small className="text-[10px] font-bold uppercase tracking-wider text-[#BECBDA] block">
            {isToday ? "TODAY" : "SELECTED DAY"}
          </small>
          <strong className="text-3xl font-black text-white block my-0.5">
            {new Date(trainingDate + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric" })}
          </strong>
          <small className="text-xs text-[#BECBDA] block font-medium">
            {new Date(trainingDate + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </small>
          <small className="mt-2 block font-bold text-xs text-white">
            {selectedAttendance}
          </small>
        </div>
      </div>

      {/* Date Navigation & 7-Day Week Schedule Strip */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">My Training Schedule</h2>
            <p className="text-xs text-slate-500">Choose a day to view assigned materials and tasks.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setTrainingDate(dayOffset(trainingDate, -1))}
              className="p-1.5 rounded-lg border border-[#BECBDA] hover:bg-[#F7F9FC] text-[#042C51] cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 bg-[#F7F9FC] border border-[#BECBDA] px-2.5 py-1.5 rounded-xl">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <input 
                type="date" 
                value={trainingDate}
                onChange={e => setTrainingDate(e.target.value)}
                className="text-xs font-bold text-[#042C51] bg-transparent outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setTrainingDate(dayOffset(trainingDate, 1))}
              className="p-1.5 rounded-lg border border-[#BECBDA] hover:bg-[#F7F9FC] text-[#042C51] cursor-pointer"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTrainingDate(simulatedCurrentDate)}
              className="px-3 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] font-semibold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Jump to Today
            </button>
          </div>
        </div>

        {/* 7-Day Week Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDays.map(dStr => {
            const isSelected = dStr === trainingDate;
            const att = getAttendanceAt(dStr);
            const dayAssigns = traineeAssignments.filter(a => a.date === dStr && a.type === "Material");
            const verified = dayAssigns.filter(a => getStatus(a) === "Verified").length;

            return (
              <button
                key={dStr}
                type="button"
                onClick={() => setTrainingDate(dStr)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative min-h-[100px] ${
                  isSelected 
                    ? "bg-[#E9F0FC] border-2 border-[#042C51] shadow-xs" 
                    : "bg-[#FAFCFF] border-[#E6ECF2] hover:border-[#FF5C28]"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {new Date(dStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <strong className="text-sm font-black text-[#042C51] block my-0.5">
                    {new Date(dStr + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </strong>
                  <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded mt-1 ${attendanceTone(att)}`}>
                    {att}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>{dayAssigns.length} materials</span>
                  {verified > 0 && <span className="text-[#1E8449] font-bold">{verified} ✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Top Summary Metrics & Progress Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metric 1: Selected Day Materials */}
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SELECTED DAY MATERIALS</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
              {trainingDate}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-[#042C51]">{daySubmitted} / {materialRows.length}</strong>
            <span className="text-xs font-bold text-[#FF5C28]">{dayPct}% Submitted</span>
          </div>

          <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${dayPct}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
            <span>{dayVerified} verified by trainer</span>
            <span>{materialRows.length - daySubmitted} pending</span>
          </div>
        </div>

        {/* Metric 2: Weekly Progress */}
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">WEEKLY PROGRESS</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
              7-day window
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-[#042C51]">{weekSubmitted} / {weekMaterials.length}</strong>
            <span className="text-xs font-bold text-[#FF5C28]">{weekPct}% Submitted</span>
          </div>

          <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
            <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${weekPct}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
            <span>{weekVerified} verified</span>
            {weekRevision > 0 && <span className="text-[#E74C3C] font-bold">{weekRevision} revision needed</span>}
          </div>
        </div>

        {/* Metric 3: Attendance Summary */}
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">14-DAY ATTENDANCE</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${attendanceTone(selectedAttendance)}`}>
              {attRate}% Rate
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <strong className="text-2xl font-black text-[#042C51]">{attPresent} Present</strong>
            <span className="text-xs text-slate-500 font-semibold">{attRecorded} days recorded</span>
          </div>

          <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
            <div className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${attRate}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
            <span>{attLate} late • {attAbsent} absent</span>
            <span>{attExcused} excused</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Materials List & Assessment Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Learning Materials & Goals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#042C51]">Assigned Learning Materials ({trainingDate})</h2>
                <p className="text-xs text-slate-500">Read materials, complete tasks, and submit for trainer verification.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F7F9FC] border border-[#BECBDA] p-1 rounded-xl">
                {(["All", "To do", "For review", "Verified"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      taskFilter === f ? "bg-white text-[#042C51] shadow-xs" : "text-slate-500 hover:text-[#042C51]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Itemized Materials Table / List */}
            {materialRows.filter(filterMatches).length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">No materials found for {trainingDate} matching filter "{taskFilter}".</p>
                <p className="text-[11px] text-slate-400">Select another day on the schedule strip above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materialRows.filter(filterMatches).map(item => {
                  const sub = getSubmission(item);
                  const st = getStatus(item);

                  return (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-xl border border-[#E6ECF2] bg-white hover:border-[#BECBDA] transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category || "General"}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${getTone(st)}`}>
                            {st}
                          </span>
                          {item.priority === "High" && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border">
                              High Priority
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-extrabold text-[#042C51]">{item.title}</h3>
                        <p className="text-xs text-slate-500">{item.description}</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>Owner: {item.owner}</span>
                          <span>•</span>
                          <span>Duration: {item.duration}</span>
                        </div>

                        {sub?.feedback && (
                          <div className="mt-2 p-2.5 rounded-lg sibs-tone-blue-bg border sibs-tone-blue-border text-xs text-[#042C51]">
                            <strong className="block text-[10px] uppercase font-bold text-[#215789]">Trainer Feedback:</strong>
                            <p className="mt-0.5">{sub.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => setActiveMaterialModal(item)}
                          className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs ${
                            st === "Verified" 
                              ? "bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC]" 
                              : "bg-[#FF5C28] hover:bg-[#e04f20] text-white"
                          }`}
                        >
                          {st === "Verified" ? "View Material" : st === "Submitted" ? "View Submission" : "Open & Submit"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Operational Goals */}
          {goalRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-[#042C51]">Daily Operational Goals ({trainingDate})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalRows.map(g => (
                  <div key={g.id} className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{g.category}</span>
                    <strong className="text-xs font-bold text-[#042C51] block">{g.title}</strong>
                    <p className="text-[11px] text-slate-500">{g.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Personal FST / PST Assessment Grades (Read-Only for Trainees) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#042C51]">Personal FST & PST Results</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Read-only</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Grades entered by your assigned trainer or QDS lead.</p>
            </div>

            {/* FST Summary Box */}
            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#042C51]">FST (Days 1–14) Average</span>
                <strong className="text-base font-black text-[#042C51]">
                  {fstAvg !== null ? fstAvg + "%" : "Not scored"}
                </strong>
              </div>
              <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${fstAvg || 0}%` }} />
              </div>
            </div>

            {/* PST Summary Box */}
            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#042C51]">PST (Days 15–28) Average</span>
                <strong className="text-base font-black text-[#FF5C28]">
                  {pstAvg !== null ? pstAvg + "%" : "Not scored"}
                </strong>
              </div>
              <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${pstAvg || 0}%` }} />
              </div>
            </div>

            {/* Itemized Assessment Results */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <strong className="text-xs font-bold text-[#042C51] block">Published Skill Scorecards</strong>
              
              {assessmentResults.map(({ a, grade, pct, passed }) => (
                <div key={a.id} className="p-3 rounded-xl border border-[#E6ECF2] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{a.phase} • {a.skill}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      pct === null 
                        ? "bg-slate-100 text-slate-500" 
                        : passed 
                          ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" 
                          : "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border"
                    }`}>
                      {pct === null ? "Pending" : passed ? "Passed" : "Below target"}
                    </span>
                  </div>

                  <strong className="text-xs font-bold text-[#042C51] block">{a.title}</strong>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Score: <strong className="text-[#042C51]">{grade ? grade.score : "—"}</strong> / {a.max}</span>
                    <span>Passing: {a.passing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Material Detail & Submission Modal */}
      {activeMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{activeMaterialModal.category} • {activeMaterialModal.duration}</span>
                <h3 className="text-base font-extrabold text-[#042C51]">{activeMaterialModal.title}</h3>
              </div>
              <button onClick={() => setActiveMaterialModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{activeMaterialModal.description}</p>
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs space-y-1">
              <strong className="text-[#042C51] block">Instructions:</strong>
              <p className="text-slate-600">{activeMaterialModal.details || "Review guidelines, practice required steps, and upload or enter your completion notes below."}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#042C51] mb-1">Completion Notes / Submission Link</label>
                <textarea 
                  rows={3}
                  value={submissionNote}
                  onChange={e => setSubmissionNote(e.target.value)}
                  placeholder="Enter completion details, work simulation links, or questions for your trainer..."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMaterialModal(null)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Submit to Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
