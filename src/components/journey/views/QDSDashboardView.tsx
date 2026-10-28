import React, { useState } from "react";
import { useDemoAuth } from "../../../auth/DemoAuthContext";
import type { EmployeeJourney } from "../journeyTypes";
import TrainerCoachingDetailsModal from "../TrainerCoachingDetailsModal";
import { coachingForEmployee, coachingSummary, coachingStatus, evaluationFor, averageAvailable, displayPercent } from "../trainerCoachingUtils";
import { useJourney } from "../JourneyContext";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Plus, 
  Search, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  X
} from "lucide-react";

interface QDSDashboardViewProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function QDSDashboardView({ onSwitchModule }: QDSDashboardViewProps) {
  const { user } = useDemoAuth();
  const canManageQdsRequests = user?.role === "QDS";
  const { 
    journeys, 
    phaseTrainingScores,
    assessmentGrades,
    assessments,
    evidence, 
    qdsRequests,
    esepSessions,
    esepEvaluations,
    attendance,
    assignments,
    progress,
    addQDSRequest, 
    updateQDSRequestStatus,
    simulatedCurrentDate,
    setSelectedJourney 
  } = useJourney();

  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState<string>("All trainers");
  const [coachingEmployee, setCoachingEmployee] = useState<EmployeeJourney | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [targetEmp, setTargetEmp] = useState(journeys[0]?.sibsEmployeeId || journeys[0]?.id || "SIBS-2901");
  const [requestType, setRequestType] = useState<"Independent QA recheck" | "Trainer coaching review" | "Targeted trainee support">("Independent QA recheck");
  const [assignedTo, setAssignedTo] = useState("Elena Santos (Quality Lead)");
  const [requestNotes, setRequestNotes] = useState("");
  const [dueDate, setDueDate] = useState("2026-10-25");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // All trainers
  const allTrainers = Array.from(new Set(journeys.map(j => j.trainerName).filter(Boolean))) as string[];

  // Date helper
  const dayOffset = (dateStr: string, numDays: number) => {
    const d = new Date(dateStr + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + numDays);
    return d.toISOString().slice(0, 10);
  };

  // Use the same complete-evidence weighting as Trainer Monitoring.
  const getTraineePerf = (j: EmployeeJourney) => {
    const ids = [j.sibsEmployeeId, j.id];
    const phaseScore = (phase: 'FST' | 'PST') => {
      const stored = phaseTrainingScores.filter(s => ids.includes(s.emp) && s.phase === phase);
      const scored = assessmentGrades.flatMap(g => {
        const item = assessments.find(a => a.id === g.assessmentId && a.phase === phase);
        return item && ids.includes(g.emp) ? [{ score: g.score, date: g.date }] : [];
      });
      return [...stored, ...scored].sort((a, b) => b.date.localeCompare(a.date))[0]?.score ?? null;
    };
    const trScore = averageAvailable([phaseScore('FST'), phaseScore('PST')]);
    const qaEvid = evidence.filter(e => ids.includes(e.emp) && e.type === 'QDS / QA' && typeof e.score === 'number' && Number.isFinite(e.score));
    const qaScore = qaEvid.sort((a, b) => b.date.localeCompare(a.date))[0]?.score ?? j.day30?.nestingQaScore ?? null;
    const simScore = j.day60?.coreProductionScore ?? null;
    const composite = trScore !== null && qaScore !== null && simScore !== null
      ? Math.round(trScore * .35 + qaScore * .40 + simScore * .25) : null;
    const attRecords = attendance.filter(a => ids.includes(a.emp));
    const dates = Array.from({ length: 14 }, (_, i) => dayOffset(simulatedCurrentDate, -i)).filter(date => {
      if (!j.hireDate || date < j.hireDate) return false;
      return ![0, 6].includes(new Date(date + 'T12:00:00Z').getUTCDay());
    });
    let present=0, late=0, absent=0, excused=0, missing=0;
    dates.forEach(date => {
      const status = attRecords.find(a => a.date === date)?.status ?? 'Unrecorded';
      if(status === 'Present') present++; else if(status === 'Late') late++;
      else if(status === 'Absent') absent++; else if(status === 'Excused') excused++; else missing++;
    });
    const recorded = present + late + absent + excused;
    const attRate = recorded ? Math.round((present + late) / recorded * 100) : null;
    return { trScore, qaScore, simScore, composite, attRate, absentCount: absent + excused, missingAttCount: missing };
  };

  const trainerSummaries = allTrainers.map(tName => {
    const trainees = journeys.filter(j => j.trainerName === tName);
    const perfs = trainees.map(j => getTraineePerf(j));
    const meanComp = averageAvailable(perfs.map(p => p.composite));
    const meanQA = averageAvailable(perfs.map(p => p.qaScore));
    const meanTR = averageAvailable(perfs.map(p => p.trScore));
    const highCount = perfs.filter(p => p.composite !== null && p.composite >= 85).length;
    const supportCount = perfs.filter(p => p.composite !== null && p.composite < 70).length;
    const attMean = averageAvailable(perfs.map(p => p.attRate));
    const totalAbsences = perfs.reduce((a, p) => a + p.absentCount, 0);
    const totalMissing = perfs.reduce((a, p) => a + p.missingAttCount, 0);
    const pendingReqs = qdsRequests.filter(q => q.trainer === tName && q.status !== "Closed").length;
    const gap = meanTR !== null && meanQA !== null ? meanTR - meanQA : null;

    return {
      tName,
      trainees,
      scoredCount: perfs.filter(p => p.composite !== null).length,
      meanComp,
      meanQA,
      meanTR,
      gap,
      highCount,
      supportCount,
      attMean,
      totalAbsences,
      totalMissing,
      pendingReqs
    };
  });

  // Filtered trainees for table
  const displayedTrainees = selectedTrainerFilter === "All trainers" 
    ? journeys 
    : journeys.filter(j => j.trainerName === selectedTrainerFilter);

  const allPerfs = journeys.map(j => getTraineePerf(j));
  const overallScored = allPerfs.filter(p => p.composite !== null).length;
  const overallHigh = allPerfs.filter(p => p.composite !== null && p.composite >= 85).length;
  const overallLow = allPerfs.filter(p => p.composite !== null && p.composite < 70).length;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageQdsRequests) return;
    const targetJourney = journeys.find(j => (j.sibsEmployeeId || j.id) === targetEmp);
    addQDSRequest({
      emp: targetEmp,
      trainer: targetJourney?.trainerName || "Maria Cruz",
      assignedTo,
      type: requestType,
      notes: requestNotes,
      due: dueDate
    });
    setToastMessage("QDS follow-up request created successfully!");
    setShowNewRequestModal(false);
    setRequestNotes("");
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
              Quality Development & Standards • Independent Oversight
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#042C51]">
              QDS Quality Oversight
            </h1>
            <p className="text-xs text-[#667085] max-w-3xl leading-normal">
              Independently evaluate trainee results by Trainer, monitor high/low performance trends, verify QA audit findings, and log quality follow-ups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageQdsRequests && <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Quality Request</span>
            </button>}

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

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trainers Monitored</span>
          <strong className="text-2xl font-black text-[#042C51] mt-1 block">{allTrainers.length}</strong>
          <span className="text-[10px] text-slate-400">Sample Trainer assignments</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Eligible Trainee Scorecards</span>
          <strong className="text-2xl font-black text-[#042C51] mt-1 block">{overallScored}</strong>
          <span className="text-[10px] text-slate-400">of {journeys.length} · all three sources recorded</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">High Performance Rate</span>
          <strong className="text-2xl font-black text-[#2ECC71] mt-1 block">
            {overallScored ? Math.round((100 * overallHigh) / overallScored) + "%" : "Not assessed"}
          </strong>
          <span className="text-[10px] text-slate-400">{overallHigh} of {overallScored} scored • ≥ 85%</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Low Performance Rate</span>
          <strong className="text-2xl font-black text-[#E74C3C] mt-1 block">
            {overallScored ? Math.round((100 * overallLow) / overallScored) + "%" : "Not assessed"}
          </strong>
          <span className="text-[10px] text-slate-400">{overallLow} of {overallScored} scored • below 70%</span>
        </div>
      </div>

      {/* Trainer Effectiveness Signals Section */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Trainer Effectiveness Signals</h2>
            <p className="text-xs text-slate-500">Independent QA performance, composite results, cohort size, and variation.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">TRAINER FILTER:</span>
            <select
              value={selectedTrainerFilter}
              onChange={e => setSelectedTrainerFilter(e.target.value)}
              className="text-xs font-semibold text-[#042C51] bg-[#F7F9FC] border border-[#BECBDA] rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="All trainers">All trainers</option>
              {allTrainers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Trainer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainerSummaries
            .filter(t => selectedTrainerFilter === "All trainers" || t.tName === selectedTrainerFilter)
            .map(t => (
              <div key={t.tName} className="p-5 rounded-2xl border border-[#E6ECF2] bg-white hover:border-[#BECBDA] transition-all shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <strong className="text-base font-extrabold text-[#042C51]">{t.tName}</strong>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.supportCount 
                      ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" 
                      : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                  }`}>
                    {t.supportCount ? `${t.supportCount} trainee(s) need support` : "No low scores identified"}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  {t.trainees.length} assigned trainees • {t.scoredCount} complete scorecards
                </p>

                {/* Attendance Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs text-center">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Attendance rate</span>
                    <strong className="font-extrabold text-[#042C51]">{displayPercent(t.attMean)}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Absences</span>
                    <strong className="font-extrabold text-[#042C51]">{t.totalAbsences}</strong>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Unrecorded shifts</span>
                    <strong className="font-extrabold text-[#042C51]">{t.totalMissing}</strong>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 border border-[#E6ECF2] rounded-xl bg-[#FAFCFF]">
                    <span className="text-[10px] text-slate-500 block">Average QA audit</span>
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{displayPercent(t.meanQA)}</strong>
                  </div>
                  <div className="p-2.5 border border-[#E6ECF2] rounded-xl bg-[#FAFCFF]">
                    <span className="text-[10px] text-slate-500 block">Avg. composite</span>
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{displayPercent(t.meanComp)}</strong>
                  </div>
                  <div className="p-2.5 border border-[#E6ECF2] rounded-xl bg-[#FAFCFF]">
                    <span className="text-[10px] text-slate-500 block">High / Needs support</span>
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{t.highCount} / {t.supportCount}</strong>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed bg-[#F7F9FC] p-2.5 rounded-xl border border-[#E6ECF2]">
                  High performer rate: {t.scoredCount ? Math.round((100 * t.highCount) / t.scoredCount) + "%" : "Not assessed"} • Trainer score minus independent QA:{" "}
                  <strong className={t.gap !== null && t.gap >= 10 ? "text-[#E74C3C] font-black" : "text-[#042C51]"}>
                    {t.gap === null ? 'Insufficient data' : `${t.gap > 0 ? '+' : ''}${t.gap} pp`}
                  </strong>. {t.gap !== null && t.gap >= 10 ? "A large gap warrants calibration review." : "Comparison requires two recorded sources."}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                  <span>Composite trend: <strong className="text-[#042C51]">No comparable baseline</strong></span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.pendingReqs 
                      ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" 
                      : "sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border"
                  }`}>
                    {t.pendingReqs} open follow-up(s)
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* QDS Trainee Audit Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E6ECF2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">QDS Trainee Audit Matrix</h2>
            <p className="text-xs text-slate-500">Cross-cohort trainee performance, QA variance, and quality audit details.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFCFF] text-slate-500 font-bold text-[10px] uppercase border-b border-[#E6ECF2]">
              <tr>
                <th className="py-3.5 px-4">Trainee</th>
                <th className="py-3.5 px-3">Trainer</th>
                <th className="py-3.5 px-3">Trainer Score</th>
                <th className="py-3.5 px-3">Independent QA</th>
                <th className="py-3.5 px-3">Work Simulation</th>
                <th className="py-3.5 px-3">Composite</th>
                <th className="py-3.5 px-3">QA Variance</th>
                <th className="py-3.5 px-3">Attendance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedTrainees.map(j => {
                const perf = getTraineePerf(j);
                const gap = perf.trScore !== null && perf.qaScore !== null ? perf.trScore - perf.qaScore : null;

                return (
                  <tr key={j.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#042C51]">
                      <div>{j.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{j.sibsEmployeeId || j.id} • {j.account}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{j.trainerName || "Unassigned"}</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{displayPercent(perf.trScore)}</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{displayPercent(perf.qaScore)}</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{displayPercent(perf.simScore)}</td>
                    <td className="py-3.5 px-3 font-black text-[#042C51]">{displayPercent(perf.composite)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gap !== null && gap >= 10 
                          ? "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border" 
                          : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                      }`}>
                        {gap === null ? 'N/A' : `${gap > 0 ? '+' : ''}${gap} pp`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{displayPercent(perf.attRate)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedJourney(j)}
                        className="text-xs font-bold text-[#FF5C28] hover:underline"
                      >
                        View Record →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Follow-up Queue */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Quality & Coaching Follow-up Queue</h2>
            <p className="text-xs text-slate-500">Active QDS recheck requests and trainer coaching follow-ups.</p>
          </div>
          {canManageQdsRequests && <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Create Follow-up
          </button>}
        </div>

        <div className="space-y-3">
          {qdsRequests.map(req => {
            const empJ = journeys.find(j => (j.sibsEmployeeId || j.id) === req.emp);

            return (
              <div key={req.id} className="p-4 rounded-xl border border-[#E6ECF2] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#FF5C28]">{req.type}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      req.status === "Closed" 
                        ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" 
                        : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-extrabold text-[#042C51]">{empJ?.fullName || req.emp} — Trainer: {req.trainer}</h3>
                  <p className="text-xs text-slate-600">{req.notes}</p>
                  <span className="text-[10px] text-slate-400 block">Assigned: {req.assignedTo} • Due: {req.due}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canManageQdsRequests && req.status !== "Closed" && (
                    <button
                      onClick={() => {
                        updateQDSRequestStatus(req.id, "Closed", "Quality review complete.");
                        setToastMessage("Closed QDS request.");
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] text-[#042C51] text-xs font-semibold shadow-xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Independent QDS visibility of recorded ESEP sessions. No QA scores are modified. */}
      <section className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-xs sm:p-5" aria-label="QDS coaching evidence">
        <div className="mb-4"><span className="text-[10px] font-bold uppercase text-[#FF5C28]">ESEP · DEVELOPMENT EVIDENCE</span><h2 className="text-base font-extrabold text-[#042C51]">Trainee coaching results</h2><p className="text-xs text-slate-500">Recorded sessions and follow-up outcomes; facilitator attribution remains with the actual Team Leader or QDS, not the assigned trainer.</p></div>
        {(() => { const summary = coachingSummary(displayedTrainees, esepSessions, esepEvaluations, simulatedCurrentDate);
          return <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Trainees coached', `${summary.coached} / ${summary.total}`],
              ['Evaluated follow-ups', `${summary.evaluated} / ${summary.sessions.length}`],
              ['Numeric KPI comparisons', summary.measured],
              ['Overdue reviews', summary.overdue]
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] p-3"><div className="text-[10px] font-bold uppercase text-slate-500">{label}</div><div className="mt-1 text-xl font-black tabular-nums text-[#042C51]">{value}</div></div>)}
          </div>;
        })()}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {displayedTrainees.map(j => { const rows = coachingForEmployee(esepSessions, j);
            const evaluated = rows.filter(r => evaluationFor(r, esepEvaluations)).length;
            const overdue = rows.filter(r => coachingStatus(r, esepEvaluations, simulatedCurrentDate) === 'Overdue').length;
            return <div key={j.id} className="rounded-xl border border-[#E6ECF2] p-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs text-[#042C51]">{j.fullName}</strong><span className="text-[10px] text-slate-500">{rows.length} sessions</span></div><p className="mt-1 text-[11px] text-slate-500">{evaluated} evaluated · {overdue} overdue · {j.trainerName ?? 'Trainer not assigned'}</p><button type="button" onClick={() => setCoachingEmployee(j)} className="mt-3 rounded-lg border border-[#BECBDA] px-3 py-2 text-xs font-bold text-[#042C51] hover:bg-[#E9F0FC]">View coaching results →</button></div>;
          })}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">These recorded coaching outcomes must not be averaged into QDS audit grades or used as automatic Trainer ratings.</p>
      </section>
      {coachingEmployee && <TrainerCoachingDetailsModal employee={coachingEmployee} sessions={esepSessions} evaluations={esepEvaluations} asOf={simulatedCurrentDate} onClose={() => setCoachingEmployee(null)} />}

      {/* New QDS Request Modal */}
      {canManageQdsRequests && showNewRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#042C51]">Create Quality Follow-up Request</h3>
              <button onClick={() => setShowNewRequestModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Select Trainee</label>
                <select
                  value={targetEmp}
                  onChange={e => setTargetEmp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                >
                  {journeys.map(j => (
                    <option key={j.id} value={j.sibsEmployeeId || j.id}>
                      {j.fullName} ({j.sibsEmployeeId || j.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={e => setRequestType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                >
                  <option value="Independent QA recheck">Independent QA recheck</option>
                  <option value="Trainer coaching review">Trainer coaching review</option>
                  <option value="Targeted trainee support">Targeted trainee support</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-semibold text-[#042C51] outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  placeholder="Specify audit focal points or calibration notes..."
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs outline-none focus:border-[#FF5C28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
