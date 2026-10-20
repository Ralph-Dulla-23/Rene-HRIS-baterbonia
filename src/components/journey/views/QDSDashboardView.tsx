import React, { useState } from "react";
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
  const { 
    journeys, 
    phaseTrainingScores, 
    evidence, 
    qdsRequests, 
    attendance,
    assignments,
    progress,
    addQDSRequest, 
    updateQDSRequestStatus,
    simulatedCurrentDate,
    setSelectedJourney 
  } = useJourney();

  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState<string>("All trainers");
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

  // Trainee performance helper
  const getTraineePerf = (j: any) => {
    const empKey = j.sibsEmployeeId || j.id;
    const fst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === j.id) && s.phase === "FST")?.score;
    const pst = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === j.id) && s.phase === "PST")?.score;
    const nestingQa = j.day30?.nestingQaScore;

    const trScore = fst !== undefined && pst !== undefined ? Math.round((fst + pst) / 2) : (fst ?? pst ?? nestingQa ?? null);
    const qaEvid = evidence.filter(e => (e.emp === empKey || e.emp === j.id) && e.type === "QDS / QA");
    const qaScore = qaEvid.length > 0 ? Math.round(qaEvid.reduce((acc, e) => acc + (e.score || 85), 0) / qaEvid.length) : (nestingQa ?? null);
    const simScore = j.day60?.coreProductionScore ?? j.day90?.compositeScore ?? null;

    const validScores = [trScore, qaScore, simScore].filter((s): s is number => s !== null);
    const composite = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    const delta = j.id === "SIBS-2901" ? 4 : j.id === "SIBS-2902" ? 3 : 0;

    // Attendance
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

    return { trScore, qaScore, simScore, composite, delta, attRate, absentCount: absent + excused, missingAttCount: missing };
  };

  const trainerSummaries = allTrainers.map(tName => {
    const trainees = journeys.filter(j => j.trainerName === tName);
    const perfs = trainees.map(j => getTraineePerf(j));
    const meanComp = perfs.length ? Math.round(perfs.reduce((a, p) => a + p.composite, 0) / perfs.length) : 0;
    const meanQA = perfs.length ? Math.round(perfs.reduce((a, p) => a + p.qaScore, 0) / perfs.length) : 0;
    const meanTR = perfs.length ? Math.round(perfs.reduce((a, p) => a + p.trScore, 0) / perfs.length) : 0;
    const highCount = perfs.filter(p => p.composite >= 85).length;
    const supportCount = perfs.filter(p => p.composite < 70).length;
    const attMean = perfs.length ? Math.round(perfs.reduce((a, p) => a + p.attRate, 0) / perfs.length) : 100;
    const totalAbsences = perfs.reduce((a, p) => a + p.absentCount, 0);
    const totalMissing = perfs.reduce((a, p) => a + p.missingAttCount, 0);
    const pendingReqs = qdsRequests.filter(q => q.trainer === tName && q.status !== "Closed").length;
    const gap = meanTR - meanQA;

    return {
      tName,
      trainees,
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
  const overallHigh = allPerfs.filter(p => p.composite >= 85).length;
  const overallLow = allPerfs.filter(p => p.composite < 70).length;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Hero Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            MONITORING SIDE 2 • QDS MANAGER TO TRAINER + TRAINEE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            QDS Manager quality oversight
          </h2>
          <p className="text-xs text-[#E6EAF0] max-w-3xl leading-relaxed">
            Independently evaluate trainee results by Trainer, monitor high/low performance trends, verify QA findings, and request training or quality follow-ups without replacing HR review decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quality Request</span>
          </button>
        </div>
      </div>

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
          <strong className="text-2xl font-black text-[#042C51] mt-1 block">{journeys.length}</strong>
          <span className="text-[10px] text-slate-400">3 independent inputs present</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">High Performance Rate</span>
          <strong className="text-2xl font-black text-[#2ECC71] mt-1 block">
            {journeys.length ? Math.round((100 * overallHigh) / journeys.length) + "%" : "0%"}
          </strong>
          <span className="text-[10px] text-slate-400">{overallHigh} of {journeys.length} eligible • ≥ 85%</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Low Performance Rate</span>
          <strong className="text-2xl font-black text-[#E74C3C] mt-1 block">
            {journeys.length ? Math.round((100 * overallLow) / journeys.length) + "%" : "0%"}
          </strong>
          <span className="text-[10px] text-slate-400">{overallLow} of {journeys.length} eligible • below 70%</span>
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
                  {t.trainees.length} assigned trainees • {t.trainees.length} complete scorecards
                </p>

                {/* Attendance Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl text-xs text-center">
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-bold block">Attendance rate</span>
                    <strong className="font-extrabold text-[#042C51]">{t.attMean}%</strong>
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
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{t.meanQA}%</strong>
                  </div>
                  <div className="p-2.5 border border-[#E6ECF2] rounded-xl bg-[#FAFCFF]">
                    <span className="text-[10px] text-slate-500 block">Avg. composite</span>
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{t.meanComp}%</strong>
                  </div>
                  <div className="p-2.5 border border-[#E6ECF2] rounded-xl bg-[#FAFCFF]">
                    <span className="text-[10px] text-slate-500 block">High / Needs support</span>
                    <strong className="text-base font-black text-[#042C51] mt-0.5 block">{t.highCount} / {t.supportCount}</strong>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-500 leading-relaxed bg-[#F7F9FC] p-2.5 rounded-xl border border-[#E6ECF2]">
                  High performer rate: {t.trainees.length ? Math.round((100 * t.highCount) / t.trainees.length) + "%" : "N/A"} • Trainer score minus independent QA:{" "}
                  <strong className={t.gap >= 10 ? "text-[#E74C3C] font-black" : "text-[#042C51]"}>
                    {t.gap > 0 ? "+" : ""}{t.gap} pp
                  </strong>. {t.gap >= 10 ? "A large gap warrants calibration review." : "Well-calibrated cohort."}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                  <span>Cohort composite change: <strong className="text-[#042C51]">+3 pp</strong></span>
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
                const gap = perf.trScore - perf.qaScore;

                return (
                  <tr key={j.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#042C51]">
                      <div>{j.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{j.sibsEmployeeId || j.id} • {j.account}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{j.trainerName || "Unassigned"}</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{perf.trScore}%</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{perf.qaScore}%</td>
                    <td className="py-3.5 px-3 font-extrabold text-[#042C51]">{perf.simScore}%</td>
                    <td className="py-3.5 px-3 font-black text-[#042C51]">{perf.composite}%</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gap >= 10 
                          ? "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border" 
                          : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                      }`}>
                        {gap > 0 ? "+" : ""}{gap} pp
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{perf.attRate}%</td>
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
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Create Follow-up
          </button>
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
                  {req.status !== "Closed" && (
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

      {/* New QDS Request Modal */}
      {showNewRequestModal && (
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
