import { useDemoAuth } from "../../../auth/DemoAuthContext";
import React, { useState } from "react";
import type { TrainingAssignment } from "../journeyTypes";
import { addCalendarDays, trainingDateBounds, dateWithinBounds, clampTrainingDate, clampCalendarMonth, moveCalendarMonth, calendarMonthCells, trainerForTask, trainersForDay, phaseOwnerForDay, canCreateTrainingAssignment } from "../traineeCalendarUtils";
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
  Target,
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
    addTrainingAssignment,
    verifyAssignment,
    simulatedCurrentDate,
    setSelectedJourney 
  } = useJourney();

  // Selected trainee for personal view
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return journeys[0]?.sibsEmployeeId || journeys[0]?.id || "SIBS-2901";
  });

  const [requestedTrainingDate, setTrainingDate] = useState<string>(simulatedCurrentDate || "2026-10-14");
  const [requestedCalendarMonth, setCalendarMonth] = useState<string | null>(null);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "Material" as "Material" | "Goal", title: "", details: "", duration: "20 min", priority: "Normal" as "Normal" | "High", trainer: "" });
  const [taskFilter, setTaskFilter] = useState<"All" | "To do" | "For review" | "Verified">("All");
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");

  const [activeMaterialModal, setActiveMaterialModal] = useState<any | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const ownJourney = isEmployee ? journeys.find(j => j.sibsEmployeeId === user?.journeyEmployeeId || j.id === user?.journeyEmployeeId || (user?.email && j.email?.toLowerCase() === user.email.toLowerCase())) : null;
  const currentJourney = isEmployee ? ownJourney : (journeys.find(j => j.sibsEmployeeId === selectedEmpId || j.id === selectedEmpId) || journeys[0]);
  if (!currentJourney) return <div className="p-6 rounded-xl bg-white border border-[#E6ECF2] text-slate-600">No Employee Journey is linked to your demo profile.</div>;
  const empKey = currentJourney.sibsEmployeeId || currentJourney.id;
  const journeyStartDate = currentJourney.startDate || currentJourney.hireDate;
  const dateBounds = trainingDateBounds(journeyStartDate, simulatedCurrentDate);
  const trainingDate = clampTrainingDate(requestedTrainingDate, dateBounds);
  const calendarMonth = clampCalendarMonth(requestedCalendarMonth || trainingDate.slice(0, 7), dateBounds);
  const monthCells = calendarMonthCells(calendarMonth);
  const pickTrainingDate = (date: string) => {
    if (!dateWithinBounds(date, dateBounds)) return;
    setTrainingDate(date);
    setCalendarMonth(date.slice(0, 7));
    setTaskFilter("All");
  };
  const changeMonth = (offset: number) => {
    const next = moveCalendarMonth(calendarMonth, offset);
    if (next >= dateBounds.min.slice(0, 7) && next <= dateBounds.max.slice(0, 7)) setCalendarMonth(next);
  };

  // Helper date functions
  const dayOffset = (dateStr: string, numDays: number) => {
    return addCalendarDays(dateStr, numDays);
  };

  const dateLabel = (dStr: string) => {
    if (!dStr) return "—";
    return new Date(dStr + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  };

  const weekOf = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00Z");
    const mon = dayOffset(dateStr, -((d.getUTCDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => dayOffset(mon, i));
  };

  const weekCalendarDates = weekOf(trainingDate);
  const calendarDates = calendarView === "week" ? weekCalendarDates : monthCells;
  const changeCalendarPage = (offset: number) => {
    if (calendarView === "month") {
      changeMonth(offset);
      return;
    }
    pickTrainingDate(clampTrainingDate(addCalendarDays(trainingDate, offset * 7), dateBounds));
  };
  const cannotGoPrevious = calendarView === "month"
    ? calendarMonth <= dateBounds.min.slice(0, 7)
    : weekCalendarDates[0] <= dateBounds.min;
  const cannotGoNext = calendarView === "month"
    ? calendarMonth >= dateBounds.max.slice(0, 7)
    : weekCalendarDates[6] >= dateBounds.max;

  const getAttendanceAt = (dateStr: string) => {
    if (dateStr > simulatedCurrentDate) return "Upcoming";
    if (!journeyStartDate || dateStr < journeyStartDate) return "Not scheduled";
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
  const dayTrainer = trainersForDay(selectedDayAssignments, currentJourney.trainerName);
  const phaseContact = phaseOwnerForDay(journeyStartDate, trainingDate, currentJourney.trainerName, currentJourney.tl);
  const canAddActivity = canCreateTrainingAssignment(user?.role, user?.trainerName, currentJourney.trainerName, trainingDate, dateBounds, simulatedCurrentDate, currentJourney.finalOutcome);
  const availableTrainers = Array.from(new Set(journeys.map(j => j.trainerName).filter((name): name is string => !!name)));
  const chooseTrainer = () => newActivity.trainer || (user?.role === "Trainer" ? user.trainerName || "" : currentJourney.trainerName || "");
  const materialRows = selectedDayAssignments.filter(a => a.type === "Material");
  const goalRows = selectedDayAssignments.filter(a => a.type === "Goal");
  const futureAssignedDates = Array.from(new Set(traineeAssignments
    .filter(a => a.date > trainingDate && dateWithinBounds(a.date, dateBounds))
    .map(a => a.date))).sort();
  const nextAssignedDate = futureAssignedDates[0] || null;

  const getSubmission = (item: any) => {
    return progress.find(p => (p.emp === empKey || p.emp === currentJourney.id) && p.assignmentId === item.id);
  };

  const getStatus = (item: any) => {
    return getSubmission(item)?.status || "Not started";
  };

  const readableStatus = (status: string) => status === "Submitted" ? "Awaiting trainer review"
    : status === "Revision requested" ? "Needs revision" : status;
  const statusExplanation = (status: string) => status === "Verified" ? "Trainer confirmed this activity."
    : status === "Submitted" ? "Submitted and waiting for trainer verification."
    : status === "Revision requested" ? "Review trainer feedback and resubmit."
    : status === "In progress" ? "Work started but not submitted."
    : "This activity has not been submitted yet.";
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
  const weekPct = weekMaterials.length ? Math.round((100 * weekSubmitted) / weekMaterials.length) : null;

  // Selected day stats
  const daySubmitted = materialRows.filter(a => ["Submitted", "Verified"].includes(getStatus(a))).length;
  const dayVerified = materialRows.filter(a => getStatus(a) === "Verified").length;
  const dayPct = materialRows.length ? Math.round((100 * daySubmitted) / materialRows.length) : null;
  const dailyNeedsRevision = selectedDayAssignments.filter(a => getStatus(a) === "Revision requested");
  const dailyToDo = selectedDayAssignments.filter(a => ["Not started", "In progress"].includes(getStatus(a)));
  const dailyForReview = selectedDayAssignments.filter(a => getStatus(a) === "Submitted");
  const dailyVerified = selectedDayAssignments.filter(a => getStatus(a) === "Verified");
  const nextAction = dailyNeedsRevision[0] || dailyToDo[0] || null;

  // Trainee 14-day attendance
  const traineeAttendance = attendance.filter(a => a.emp === empKey || a.emp === currentJourney?.id);
  const recent14Days = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(dStr => {
    if (!journeyStartDate || dStr < journeyStartDate) return false;
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
  const attRate = attRecorded ? Math.round(((attPresent + attLate) / attRecorded) * 100) : null;
  const attCoverage = recent14Days.length ? Math.round(attRecorded / recent14Days.length * 100) : null;

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
  const ungradedCount = assessmentResults.length - gradedItems.length;
  const latestGradedDate = traineeGrades.filter(g => assessmentResults.some(r => r.a.id === g.assessmentId))
    .map(g => g.date).filter(Boolean).sort().at(-1) || null;

  const upcomingMaterials = traineeAssignments.filter(a => a.type === "Material" && a.date > trainingDate).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTrainer = chooseTrainer();
    if (!canAddActivity || !newActivity.title.trim() || !newActivity.details.trim() || !newActivity.duration.trim() || !assignedTrainer || !availableTrainers.includes(assignedTrainer) || (user?.role === "Trainer" && assignedTrainer !== user.trainerName)) return;
    addTrainingAssignment({
      emp: empKey, date: trainingDate, type: newActivity.type, title: newActivity.title.trim(),
      description: newActivity.details.trim().slice(0, 145), details: newActivity.details.trim(),
      category: newActivity.type === "Material" ? "Learning" : "Practice",
      duration: newActivity.duration.trim(), priority: newActivity.priority,
      trainer: assignedTrainer, owner: user?.name || "Demo staff"
    });
    setNewActivity({ type: "Material", title: "", details: "", duration: "20 min", priority: "Normal", trainer: "" });
    setIsAddingAssignment(false);
    setShowSuccessToast("Training activity added to the selected day.");
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaterialModal || !isEmployee || !!currentJourney.finalOutcome || activeMaterialModal.date > simulatedCurrentDate || !["Not started", "In progress", "Revision requested"].includes(getStatus(activeMaterialModal))) return;
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
      {/* SiBS HRIS Standard Header: White card with top accent gradient bar */}
      <section className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white shadow-xs">
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                My Training Dashboard • Day {currentJourney.daysElapsed} of 90
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold ${attendanceTone(selectedAttendance)}`}>
                Selected day attendance: {selectedAttendance === "Unrecorded" ? "Not yet recorded" : selectedAttendance}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#042C51]">
              Good to see you, {currentJourney.fullName.split(" ")[0]}!
            </h1>
            <p className="text-xs text-[#667085] max-w-3xl leading-normal">
              Track your daily learning materials, FST & PST module grades, daily goals, and trainer verification status.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-slate-500">
                <strong className="text-[#042C51]">General training contact:</strong> {currentJourney.trainerName || "Not assigned"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-medium text-slate-500">
                <strong className="text-[#042C51]">Account:</strong> {currentJourney.account}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-medium text-slate-500">
                <strong className="text-[#042C51]">Site:</strong> {currentJourney.siteLocation}
              </span>
            </div>
            <p className="pt-1 text-[11px] text-[#4C6580]">Demo as-of date: <strong>{dateLabel(simulatedCurrentDate)}</strong> · Training calendar selection: <strong>{dateLabel(trainingDate)}</strong></p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isEmployee && <label className="flex items-center gap-2 bg-[#F7F9FC] border border-[#BECBDA] rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-[#042C51]">Viewing employee</span>
              <select
                value={selectedEmpId}
                onChange={e => { setSelectedEmpId(e.target.value); setCalendarMonth(null); setTrainingDate(simulatedCurrentDate); setTaskFilter("All"); }}
                className="text-xs font-semibold text-[#042C51] bg-transparent outline-none cursor-pointer"
                aria-label="Choose employee to preview"
              >
                {journeys.map(j => (
                  <option key={j.id} value={j.sibsEmployeeId || j.id}>
                    {j.fullName} ({j.sibsEmployeeId || j.kronosId || "No ID"})
                  </option>
                ))}
              </select>
            </label>}

            <button
              type="button"
              onClick={() => setSelectedJourney(currentJourney)}
              className="text-xs font-semibold text-[#042C51] bg-white hover:bg-[#F7F9FC] border border-[#BECBDA] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#FF5C28]" />
              <span>View Full Training & Journey Record</span>
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
      </section>

      {showSuccessToast && (
        <div className="sibs-tone-green-bg border sibs-tone-green-border sibs-tone-green-text text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Employee's primary action is immediately visible, even if the selected day has no work. */}
      <section aria-label="My training on the selected day" className="rounded-xl border border-[#E6ECF2] bg-white shadow-xs overflow-hidden">
        <div className="border-l-4 border-[#FF5C28] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-extrabold text-[#FF5C28]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                <span>My training · selected day</span>
              </div>
              <h2 className="text-lg font-black text-[#042C51] mt-1">{dateLabel(trainingDate)}</h2>
              <p className="text-xs text-slate-600 mt-1">{selectedDayAssignments.length
                ? `${selectedDayAssignments.length} scheduled activities · ${dailyNeedsRevision.length + dailyToDo.length} need action · ${dailyForReview.length} awaiting review · ${dailyVerified.length} verified`
                : "No training activities scheduled for this date. This is not a failed or incomplete training day."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {nextAction && <a href="#trainee-daily-work" className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5C28] px-4 py-2 text-xs font-bold text-white hover:bg-[#e04f20] shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#042C51]">View task <ChevronRight className="w-4 h-4"/></a>}
              {nextAssignedDate && <button type="button" onClick={() => pickTrainingDate(nextAssignedDate)} className="rounded-xl border border-[#BECBDA] bg-white px-3.5 py-2 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC] shadow-xs transition-colors">Next assigned day: {dateLabel(nextAssignedDate)}</button>}
              {!nextAction && !nextAssignedDate && selectedDayAssignments.length === 0 && <span className="rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] px-3.5 py-2 text-xs font-medium text-slate-600">No upcoming activities recorded in this training window.</span>}
            </div>
          </div>
          {nextAction && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F7F9FC] p-3.5 border border-[#E6ECF2]">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C28]">{getStatus(nextAction) === "Revision requested" ? "Action needed · trainer requested changes" : "Next training task"}</span>
              <p className="text-sm font-bold text-[#042C51] mt-0.5">{nextAction.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{nextAction.type === "Material" ? "Learning material" : "Training goal"} · {nextAction.trainer ? `Assigned trainer: ${nextAction.trainer}` : `General contact: ${currentJourney.trainerName || "Not assigned"}`}</p>
            </div>
            <button type="button" onClick={() => { setTaskFilter("All"); setSubmissionNote(getSubmission(nextAction)?.note || ""); setActiveMaterialModal(nextAction); }} className="rounded-xl bg-[#042C51] hover:bg-[#0B365F] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors">{getStatus(nextAction) === "Revision requested" ? "Review feedback & resubmit" : "Open activity"}</button>
          </div>}
          {!nextAction && dailyForReview.length > 0 && <p className="rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] p-3 text-xs text-[#215789]">Your activities for this date have been submitted. {dailyForReview.length} {dailyForReview.length === 1 ? "activity is" : "activities are"} awaiting trainer verification.</p>}
        </div>
      </section>

      {/* Published FST/PST scores stay above the training calendar. Missing scores are not zero. */}
      <section className="rounded-xl border border-[#E6ECF2] bg-white p-4 sm:p-5 shadow-xs" aria-label="Published FST and PST score summary">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E6ECF2]">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">My Training Scores</h2>
            <p className="text-xs text-slate-500 mt-0.5">Current published results{latestGradedDate ? ` · Latest grade: ${dateLabel(latestGradedDate)}` : ""} · Read-only. Scores do not change when selecting an earlier calendar date.</p>
          </div>
          <a href="#trainee-assessment-details" className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1">
            <span>View detailed results</span>
            <span>↓</span>
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { label: "Average of graded assessments", value: overallAvg === null ? "Not scored" : `${overallAvg}%`, note: `${gradedItems.length} graded assessments`, color: "text-[#042C51]", Icon: Award, iconClass: "border-blue-100 bg-blue-50 text-blue-600" },
            { label: "Fundamental Skills (FST)", value: fstAvg === null ? "Not scored" : `${fstAvg}%`, note: `${fstGraded.length} scored FST items`, color: "text-[#042C51]", Icon: BookOpen, iconClass: "border-sky-100 bg-sky-50 text-sky-600" },
            { label: "Product Skills (PST)", value: pstAvg === null ? "Not scored" : `${pstAvg}%`, note: `${pstGraded.length} scored PST items`, color: "text-[#FF5C28]", Icon: Target, iconClass: "border-orange-100 bg-orange-50 text-[#FF5C28]" },
            { label: "Passed / graded assessments", value: `${passedItems.length} / ${gradedItems.length}`, note: "Only graded assessments count", color: "text-emerald-700", Icon: CheckCircle2, iconClass: "border-emerald-100 bg-emerald-50 text-emerald-600" }
          ].map(metric => <div key={metric.label} className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] hover:bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 truncate">{metric.label}</span>
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${metric.iconClass}`}>
                <metric.Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1">
              <div className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight ${metric.color}`}>{metric.value}</div>
              <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">{metric.note}</div>
            </div>
          </div>)}
        </div>
        <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-[#E6ECF2]">{ungradedCount > 0 ? `${ungradedCount} published assessment${ungradedCount === 1 ? " has" : "s have"} not been scored yet. ` : ""}These grades are separate from independent QA, attendance, and Day 30/60/90 checkpoint results.</p>
      </section>

      {/* Employee-friendly week by default; full monthly calendar is preserved. */}
      <section className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4 sm:p-5 space-y-4" aria-label="Training calendar with week and month layouts">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
          <div><h2 className="text-sm font-extrabold text-[#042C51]">My Training Calendar</h2><p className="text-xs text-slate-500 mt-1">Choose a date to see scheduled work and recorded attendance. Switch to Month for the full calendar.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[#BECBDA] p-1 bg-[#F7F9FC]" role="group" aria-label="Calendar layout">
              {(["week", "month"] as const).map(view => <button key={view} type="button" onClick={() => setCalendarView(view)} aria-pressed={calendarView === view} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${calendarView === view ? "bg-[#042C51] text-white shadow-xs" : "text-[#215789] hover:bg-white"}`}>{view === "week" ? "Week" : "Month"}</button>)}
            </div>
            <button type="button" onClick={() => changeCalendarPage(-1)} disabled={cannotGoPrevious} aria-label={calendarView === "week" ? "Previous training week" : "Previous calendar month"} className="p-2 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4"/></button>
            <span className="min-w-[130px] text-center text-sm font-extrabold text-[#042C51]">{calendarView === "month" ? new Date(`${calendarMonth}-01T12:00:00Z`).toLocaleDateString("en-US", {month:"long",year:"numeric",timeZone:"UTC"}) : `${dateLabel(weekCalendarDates[0])} – ${dateLabel(weekCalendarDates[6])}`}</span>
            <button type="button" onClick={() => changeCalendarPage(1)} disabled={cannotGoNext} aria-label={calendarView === "week" ? "Next training week" : "Next calendar month"} className="p-2 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4"/></button>
            <label className="flex items-center gap-2 border border-[#BECBDA] rounded-xl px-2.5 py-1.5 text-xs text-slate-500 bg-white shadow-xs">Date
              <input type="date" value={trainingDate} min={dateBounds.min} max={dateBounds.max} onChange={e => pickTrainingDate(e.target.value)} aria-label="Choose training date" className="bg-transparent text-xs font-semibold text-[#042C51] outline-none cursor-pointer"/>
            </label>
            <button type="button" onClick={() => pickTrainingDate(clampTrainingDate(simulatedCurrentDate, dateBounds))} className="rounded-xl border border-[#BECBDA] bg-white px-3 py-2 text-xs font-bold text-[#042C51] hover:bg-[#F7F9FC] shadow-xs transition-colors">Go to demo as-of date</button>
          </div>
        </div>
        {!dateBounds.linked && <p className="text-xs rounded-xl p-3 bg-amber-50 text-amber-800 border border-amber-200">A confirmed employee start date is needed to display the full 90-day schedule. Only the demo date is available.</p>}
        <div className="hidden sm:grid grid-cols-7 gap-1.5" aria-hidden="true">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => <span key={day} className="py-1 text-center text-[10px] font-extrabold text-slate-500 uppercase">{day}</span>)}</div>
        <div className="overflow-x-auto pb-2" aria-label="Select a calendar day">
          <div className={calendarView === "week" ? "flex gap-2 sm:grid sm:grid-cols-7 sm:gap-1.5" : "grid grid-cols-7 gap-1.5 min-w-[640px] sm:min-w-0"}>
          {calendarDates.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} className="min-w-0" aria-hidden="true"/>;
            const within = dateWithinBounds(date, dateBounds);
            const dayItems = within ? traineeAssignments.filter(a => a.date === date) : [];
            const trainers = trainersForDay(dayItems, currentJourney.trainerName);
            const hasActivities = dayItems.length > 0;
            const att = within ? getAttendanceAt(date) : "Outside training period";
            const mats = dayItems.filter(a => a.type === "Material").length;
            const goals = dayItems.filter(a => a.type === "Goal").length;
            const selected = date === trainingDate;
            return <button key={date} type="button" disabled={!within} onClick={() => pickTrainingDate(date)} aria-pressed={selected}
              aria-label={`${date}: ${mats} materials, ${goals} goals; ${att}; ${hasActivities ? `training contact ${trainers.names.join(" / ") || "not assigned"}` : "no trainer-led tasks scheduled"}`}
              className={`${calendarView === "week" ? "w-[125px] shrink-0 sm:w-auto" : "min-w-0"} min-h-[82px] sm:min-h-[106px] rounded-xl border p-2 text-left flex flex-col gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#042C51] ${selected ? "bg-orange-50/70 border-2 border-[#FF5C28] ring-1 ring-[#FF5C28]/20 shadow-xs" : within && hasActivities ? "bg-blue-50/40 border-blue-200 hover:bg-blue-50 hover:border-blue-300" : within ? "bg-[#FAFCFF] border-[#E6ECF2] hover:bg-[#F7F9FC] hover:border-[#BECBDA]" : "bg-slate-50/60 border-dashed border-slate-200 opacity-50 cursor-not-allowed"}`}>
              <span className="text-xs sm:text-sm font-black text-[#042C51]"><span className="sm:hidden mr-1 text-[10px] text-slate-500">{new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {weekday:"short",timeZone:"UTC"})}</span>{Number(date.slice(-2))}{date === simulatedCurrentDate && <span className="text-[#FF5C28] font-black"> •</span>}</span>
              {within ? <>
                <span className="text-[9px] sm:text-[10px] leading-tight text-slate-600">{mats} material{mats===1?"":"s"} · {goals} goal{goals===1?"":"s"}</span>
                {hasActivities && <span className="hidden sm:block text-[9px] text-[#215789] font-bold leading-tight break-words">{trainers.explicit ? "Task trainer: " : "Contact: "}{trainers.names.join(" / ") || "Not assigned"}</span>}
                <span className={`self-start rounded-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold ${attendanceTone(att)}`}>{att === "Unrecorded" ? "Pending record" : att}</span>
              </> : <span className="text-[9px] text-slate-400">—</span>}
            </button>;
          })}
          </div>
        </div>
        <p className="text-[11px] text-slate-500">Orange border = selected date · Orange dot = demo as-of date · Soft blue = scheduled activities · Attendance is based on recorded shifts; missing records are not absences.</p>
      </section>

      {/* Trainer assignment can differ by task; staff owner and trainer are separate roles. */}
      <section className="rounded-xl border border-[#E6ECF2] bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs" aria-label="Selected-day trainers and phase owner">
        <div className="flex gap-3 items-center min-w-0">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-[#042C51] flex items-center justify-center shrink-0"><User className="w-5 h-5 text-[#042C51]"/></div>
          <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Training contact · {dateLabel(trainingDate)}</p>
            <h3 className="text-base font-black text-[#042C51] mt-0.5">{selectedDayAssignments.length === 0 ? "No trainer-led tasks scheduled" : dayTrainer.names.join(" / ") || "Trainer not assigned"}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedDayAssignments.length} scheduled activities · {selectedDayAssignments.length === 0 ? `General training contact: ${currentJourney.trainerName || "Not assigned"}` : dayTrainer.explicit ? "Each activity has an assigned trainer" : "General training contact shown where a task-specific trainer is not recorded"}</p>
          </div>
        </div>
        <div className="bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl px-3.5 py-2.5 text-xs text-slate-600 shadow-xs"><span className="block text-slate-500 text-[10.5px]">Phase owner / support contact</span><strong className="block text-[#042C51] mt-0.5 text-sm">{phaseContact.owner || "Not assigned"}</strong><span className="text-[10px] text-slate-500 font-medium">{phaseContact.phase}</span></div>
      </section>

      {canAddActivity && <div className="flex justify-end"><button type="button" onClick={() => setIsAddingAssignment(true)} className="px-4 py-2 bg-[#FF5C28] text-white font-bold text-xs rounded-xl hover:bg-[#e04f20] shadow-xs transition-colors cursor-pointer">+ Assign training activity</button></div>}

      {/* One daily view for materials and goals. Published assessment details stay below. */}
      <div id="trainee-daily-work" className="grid grid-cols-1 lg:grid-cols-2 gap-5 scroll-mt-24" aria-label="Selected day learning materials and goals">
        <div className="min-w-0 space-y-5">
          <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#042C51]">Assigned Learning Materials ({trainingDate})</h2>
                <p className="text-xs text-slate-500">Read materials, complete tasks, and submit for trainer verification.</p>
              </div>
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F7F9FC] border border-[#BECBDA] p-1 rounded-xl flex-wrap" role="group" aria-label="Learning material status filter">
                {(["All", "To do", "For review", "Verified"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    aria-pressed={taskFilter === f}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      taskFilter === f ? "bg-[#042C51] text-white shadow-xs" : "text-[#215789] hover:text-[#042C51] hover:bg-white"
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
                <p className="text-xs font-semibold text-slate-600">{materialRows.length ? `No materials match “${taskFilter}”.` : "No learning materials scheduled for this day."}</p>
                <p className="text-xs text-slate-600">{materialRows.length ? "Try viewing all statuses." : "Nothing to submit for this date."}</p>
                {materialRows.length > 0 && taskFilter !== "All" && <button type="button" className="text-xs font-bold text-[#215789] underline" onClick={() => setTaskFilter("All")}>Show all materials</button>}
                {materialRows.length === 0 && nextAssignedDate && <button type="button" className="text-xs font-bold text-[#215789] underline" onClick={() => pickTrainingDate(nextAssignedDate)}>Go to next assigned day: {dateLabel(nextAssignedDate)}</button>}
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
                            {readableStatus(st)}
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
                          <span>{item.trainer ? "Assigned trainer" : "General training contact"}: {trainerForTask(item, currentJourney.trainerName) || "Not assigned"}</span><span>•</span><span>Assigned by: {item.owner || "Not recorded"}</span>
                          <span>•</span>
                          <span>Duration: {item.duration}</span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1">{statusExplanation(st)}</p>
                        {sub?.feedback && (
                          <div className="mt-2 p-2.5 rounded-lg sibs-tone-blue-bg border sibs-tone-blue-border text-xs text-[#042C51]">
                            <strong className="block text-[10px] uppercase font-bold text-[#215789]">Trainer Feedback:</strong>
                            <p className="mt-0.5">{sub.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => { setSubmissionNote(getSubmission(item)?.note || ""); setActiveMaterialModal(item); }}
                          className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs ${
                            st === "Verified" 
                              ? "bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC]" 
                              : "bg-[#FF5C28] hover:bg-[#e04f20] text-white"
                          }`}
                        >
                          {st === "Verified" ? "View verified activity" : st === "Submitted" ? "View submission" : !isEmployee ? "View details" : st === "Revision requested" ? "Review feedback & resubmit" : "Open activity & submit"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
        {/* Today’s training goals use the existing submit/review data model. */}
        <section className="min-w-0 rounded-xl border border-[#E6ECF2] bg-white shadow-xs p-4 sm:p-5 space-y-4">
          <div><h2 className="text-sm font-extrabold text-[#042C51]">Training Goals ({trainingDate})</h2><p className="text-xs text-slate-500 mt-1">Complete practice exercises and submit progress for trainer verification.</p></div>
          {goalRows.filter(filterMatches).length === 0 ? <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2"><p>{goalRows.length ? `No training goals match “${taskFilter}”.` : "No practice goals scheduled for this day. Nothing to submit."}</p>{goalRows.length > 0 && taskFilter !== "All" && <button type="button" onClick={() => setTaskFilter("All")} className="font-bold text-[#215789] underline">Show all goals</button>}{goalRows.length === 0 && nextAssignedDate && <button type="button" onClick={() => pickTrainingDate(nextAssignedDate)} className="font-bold text-[#215789] underline">Go to next assigned day: {dateLabel(nextAssignedDate)}</button>}</div> :
            goalRows.filter(filterMatches).map(goal => {
              const st = getStatus(goal);
              const feedback = getSubmission(goal)?.feedback;
              return <article key={goal.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] space-y-2">
                <div className="flex justify-between gap-2 items-start"><strong className="text-sm text-[#042C51]">{goal.title}</strong><span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${getTone(st)}`}>{readableStatus(st)}</span></div>
                <p className="text-xs text-slate-500">{goal.description}</p><p className="text-[11px] text-slate-600">{statusExplanation(st)}</p>
                <div className="text-[10px] text-slate-500">{goal.trainer ? "Assigned trainer" : "General training contact"}: <strong className="text-[#042C51]">{trainerForTask(goal, currentJourney.trainerName) || "Not assigned"}</strong> · Assigned by {goal.owner || "Not recorded"} · {goal.duration}</div>
                {feedback && <p className="text-xs bg-blue-50 border border-blue-100 p-2 rounded-lg text-blue-900">Trainer feedback: {feedback}</p>}
                <button type="button" onClick={() => { setSubmissionNote(getSubmission(goal)?.note || ""); setActiveMaterialModal(goal); }} className="px-3 py-2 rounded-lg border border-[#BECBDA] text-xs font-bold text-[#042C51] bg-white hover:bg-[#F7F9FC]">{st === "Verified" || st === "Submitted" ? "View goal & submission" : !isEmployee ? "View goal" : st === "Revision requested" ? "Review feedback & resubmit" : "Open goal & submit progress"}</button>
              </article>;
            })}
        </section>
      </div>

      <section className="space-y-2" aria-label="Training progress and recorded attendance">
        <div><h2 className="text-sm font-extrabold text-[#042C51]">My Progress & Attendance</h2><p className="text-xs text-slate-600 mt-1">Submission totals are not the same as trainer verification. Attendance figures use recorded days only.</p></div>
      {/* 3 Compact SiBS HRIS Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Metric 1: Selected Day Materials */}
        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 truncate">
              Day Materials Submitted
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                {materialRows.length ? <>{daySubmitted} <span className="text-sm font-semibold text-slate-400">/ {materialRows.length}</span></> : <span className="text-sm">Not scheduled</span>}
              </div>
              <span className="text-xs font-bold text-[#B54708]">{dayPct === null ? "N/A" : `${dayPct}%`}</span>
            </div>
            <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${dayPct ?? 0}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10.5px] font-medium text-slate-500">
              <span>{dayVerified} verified by trainer</span>
              <span>{materialRows.length ? `${materialRows.length - daySubmitted} not submitted` : "No materials assigned"}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Weekly Progress */}
        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 truncate">
              This Week's Materials Submitted
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                {weekMaterials.length ? <>{weekSubmitted} <span className="text-sm font-semibold text-slate-400">/ {weekMaterials.length}</span></> : <span className="text-sm">Not scheduled</span>}
              </div>
              <span className="text-xs font-bold text-[#042C51]">{weekPct === null ? "N/A" : `${weekPct}%`}</span>
            </div>
            <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${weekPct ?? 0}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10.5px] font-medium text-slate-500">
              <span>{weekMaterials.length ? `${weekVerified} verified · ${dateLabel(weekDays[0])}–${dateLabel(weekDays[6])}` : "No materials scheduled this week"}</span>
              {weekRevision > 0 ? (
                <span className="text-[#E74C3C] font-bold">{weekRevision} revision needed</span>
              ) : (
                <span>0 revisions</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 3: Attendance Summary */}
        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 truncate">
              Attendance · Last 14 Days
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                {attPresent + attLate} <span className="text-xs font-medium text-slate-400">/ {attRecorded} recorded days</span>
              </div>
              <span className="text-xs font-bold text-[#042C51]">{attRate === null ? "N/A" : `${attRate}%`} recorded attendance</span>
            </div>
            <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${attRate ?? 0}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-[#4C6580]">
              <span>Record coverage: {attCoverage === null ? "N/A" : `${attCoverage}%`} ({attRecorded} of {recent14Days.length} expected workdays)</span>
              <span>{attMissing} unrecorded</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">{attLate} late · {attAbsent} absent · {attExcused} excused. Missing time records are not counted as absences.</p>
          </div>
        </div>
      </div>

      </section>

      {/* Complete scorecards remain accessible without crowding the daily tasks. */}
      <section id="trainee-assessment-details" className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4 sm:p-5 space-y-4 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6ECF2] pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Detailed FST & PST Assessment Results</h2>
            <p className="text-xs text-slate-500 mt-0.5">All published assessments, including those not yet scored. Only graded assessments count toward averages and the passed/graded total. Separate from independent QA and coaching evidence.</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#F7F9FC] border border-[#E6ECF2] px-2.5 py-1 rounded-lg">Read-only</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{label:"FST · Days 1–14",avg:fstAvg},{label:"PST · Days 15–28",avg:pstAvg}].map(({label,avg})=><div key={label} className="bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl p-3.5 shadow-xs">
            <div className="flex justify-between items-center gap-2 text-xs"><strong className="text-[#042C51]">{label}</strong><span className="font-bold text-[#042C51]">{avg === null ? "Not scored" : `${avg}%`}</span></div>
            <div className="h-1.5 rounded-full bg-[#E6EAF0] overflow-hidden mt-2"><div className="h-full bg-[#FF5C28]" style={{width:`${avg ?? 0}%`}}/></div>
          </div>)}
        </div>
        {assessmentResults.length === 0 ? <p className="rounded-xl p-4 bg-[#F7F9FC] border border-[#E6ECF2] text-xs text-slate-500">No published FST/PST assessments for this account.</p> :
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{assessmentResults.map(({ a, grade, pct, passed }) => (
            <article key={a.id} className="border border-[#E6ECF2] bg-white rounded-xl p-3.5 space-y-1.5 shadow-xs hover:border-[#BECBDA] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] uppercase font-bold text-slate-400">{a.phase} · {a.skill}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pct === null ? "bg-[#F7F9FC] border border-[#E6ECF2] text-slate-600" : passed ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" : "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border"}`}>{pct === null ? "Not scored" : passed ? "Passed" : "Below target"}</span></div>
              <strong className="text-xs block text-[#042C51]">{a.title}</strong>
              <div className="flex justify-between gap-2 text-xs text-slate-500"><span>Score: <strong className="text-[#042C51]">{grade ? grade.score : "—"}</strong> / {a.max}</span><span>Passing: {a.passing}</span></div>
              {grade && <p className="text-[10px] text-slate-500 pt-0.5">Graded by {grade.grader} · {dateLabel(grade.date)}</p>}
            </article>
          ))}</div>}
      </section>

      {/* Authorized staff can assign an individual trainer to each activity. */}
      {isAddingAssignment && canAddActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setIsAddingAssignment(false); }}>
          <form onSubmit={handleCreateActivity} className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 space-y-3.5 max-h-[90vh] overflow-y-auto border border-[#E6ECF2]" aria-label="Assign training activity">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-[#042C51] text-base">New Training Activity · {dateLabel(trainingDate)}</h3>
              <button type="button" aria-label="Close assignment form" onClick={() => setIsAddingAssignment(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <label className="block text-xs font-bold text-[#042C51]">Type
              <select value={newActivity.type} onChange={e => setNewActivity(p=>({...p,type:e.target.value as "Goal"|"Material"}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]">
                <option>Material</option>
                <option>Goal</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-[#042C51]">Title
              <input required maxLength={140} value={newActivity.title} onChange={e=>setNewActivity(p=>({...p,title:e.target.value}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]" placeholder="Module or goal title..."/>
            </label>
            <label className="block text-xs font-bold text-[#042C51]">Learning instructions / success criteria
              <textarea required rows={4} value={newActivity.details} onChange={e=>setNewActivity(p=>({...p,details:e.target.value}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]" placeholder="Enter clear instructions or success metrics..."/>
            </label>
            <label className="block text-xs font-bold text-[#042C51]">Assigned trainer
              <select required value={chooseTrainer()} onChange={e=>setNewActivity(p=>({...p,trainer:e.target.value}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]">
                {availableTrainers.filter(name=>user?.role !== "Trainer" || name===user.trainerName).map(name=><option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-[#042C51]">Duration
                <input value={newActivity.duration} required onChange={e=>setNewActivity(p=>({...p,duration:e.target.value}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]"/>
              </label>
              <label className="block text-xs font-bold text-[#042C51]">Priority
                <select value={newActivity.priority} onChange={e=>setNewActivity(p=>({...p,priority:e.target.value as "Normal"|"High"}))} className="block w-full border border-[#BECBDA] rounded-xl p-2.5 mt-1 text-xs text-[#042C51] outline-none focus:border-[#FF5C28]">
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </label>
            </div>
            <p className="text-[11px] text-slate-500">Prototype records are saved in browser storage. A task's creator is separate from its assigned trainer.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={()=>setIsAddingAssignment(false)} className="border border-[#BECBDA] bg-white text-[#042C51] hover:bg-[#F7F9FC] rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="bg-[#FF5C28] hover:bg-[#e04f20] text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer">Save activity</button>
            </div>
          </form>
        </div>
      )}

      {/* Material Detail & Submission Modal */}
      {activeMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="presentation" onKeyDown={e => { if (e.key === "Escape") setActiveMaterialModal(null); }} onMouseDown={e => { if (e.target === e.currentTarget) setActiveMaterialModal(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="trainee-activity-modal-title" className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeMaterialModal.category} • {activeMaterialModal.duration}</span>
                <h3 id="trainee-activity-modal-title" className="text-base font-extrabold text-[#042C51]">{activeMaterialModal.title}</h3>
              </div>
              <button type="button" autoFocus aria-label="Close activity details" onClick={() => setActiveMaterialModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 focus-visible:outline-2 focus-visible:outline-[#042C51] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{activeMaterialModal.description}</p>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2] text-xs space-y-1">
              <strong className="text-[#042C51] block">Instructions:</strong>
              <p className="text-slate-600 leading-normal">{activeMaterialModal.details || "Review guidelines, practice required steps, and upload or enter your completion notes below."}</p>
            </div>
            <p className="text-xs text-slate-500">{activeMaterialModal.trainer ? "Assigned trainer" : "General training contact"}: <strong className="text-[#042C51]">{trainerForTask(activeMaterialModal, currentJourney.trainerName) || "Not assigned"}</strong> · Assigned by: {activeMaterialModal.owner || "Not recorded"}</p>
            <p className="text-xs text-slate-600">Status: <strong className="text-[#042C51]">{readableStatus(getStatus(activeMaterialModal))}</strong>. {statusExplanation(getStatus(activeMaterialModal))}</p>
            {getSubmission(activeMaterialModal)?.feedback && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-[#042C51]">
                <strong className="block text-[10px] uppercase font-bold text-[#215789]">Reviewer feedback:</strong>
                <p className="mt-0.5">{getSubmission(activeMaterialModal)?.feedback}</p>
              </div>
            )}
            {isEmployee && !currentJourney.finalOutcome && activeMaterialModal.date <= simulatedCurrentDate && ["Not started", "In progress", "Revision requested"].includes(getStatus(activeMaterialModal)) ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-[#042C51] mb-1">Completion Notes / Submission Link</label>
                  <textarea 
                    rows={3}
                    value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)}
                    placeholder="Enter completion details, work simulation links, or questions for your trainer..."
                    className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs text-[#042C51] outline-none focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveMaterialModal(null)}
                    className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC] shadow-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Trainer</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">{getSubmission(activeMaterialModal)?.note ? `Submission: ${getSubmission(activeMaterialModal)?.note}` : "No submission recorded."}</p>
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setActiveMaterialModal(null)} 
                    className="px-4 py-2 rounded-xl border border-[#BECBDA] bg-white text-[#042C51] hover:bg-[#F7F9FC] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
