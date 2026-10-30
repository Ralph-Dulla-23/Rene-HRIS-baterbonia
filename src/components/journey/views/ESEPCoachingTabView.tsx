import React, { useState } from "react";
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Plus,
  Send,
  Eye,
  Check,
  X,
  Sparkles
} from "lucide-react";
import { EmployeeJourney, ESEPCoachingSession, ESEPCoachingEvaluation } from "../journeyTypes";
import { useJourney } from "../JourneyContext";
import { 
  coachingForEmployee, 
  evaluationFor, 
  kpiComparison, 
  coachingStatus 
} from "../trainerCoachingUtils";
import TrainerCoachingDetailsModal from "../TrainerCoachingDetailsModal";

interface ESEPCoachingTabViewProps {
  currentJourney?: EmployeeJourney;
  onSelectEmployee?: (journey: EmployeeJourney) => void;
  onSwitchModule?: (module: string) => void;
}

export default function ESEPCoachingTabView({
  currentJourney,
  onSelectEmployee,
  onSwitchModule
}: ESEPCoachingTabViewProps) {
  const { 
    journeys, 
    esepSessions, 
    esepEvaluations, 
    simulatedCurrentDate 
  } = useJourney();

  const fallbackJourney = currentJourney || journeys[0];

  // Selected employee to inspect details (defaults to currentJourney)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    fallbackJourney?.sibsEmployeeId || fallbackJourney?.id || ""
  );

  // Active view section tab inside ESEP Coaching tab
  const [esepSubView, setEsepSubView] = useState<"overview" | "accountability" | "grow_history">("overview");

  // View Result Modal state for employee
  const [viewResultModalEmployee, setViewResultModalEmployee] = useState<EmployeeJourney | null>(null);

  // GROW details modal state
  const [activeGrowModalSessionId, setActiveGrowModalSessionId] = useState<number | null>(null);

  // Quick Record GROW session modal state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordGoal, setRecordGoal] = useState("");
  const [recordActionPlan, setRecordActionPlan] = useState("");
  const [recordType, setRecordType] = useState("Weekly 1:1");
  const [recordSuccessToast, setRecordSuccessToast] = useState<string | null>(null);

  // Find targeted employee journey object
  const activeTrainee = journeys.find(
    j => (j.sibsEmployeeId || j.id) === selectedEmpId || j.id === selectedEmpId
  ) || fallbackJourney;

  // Coaching sessions for the targeted trainee
  const traineeSessions = coachingForEmployee(esepSessions, activeTrainee);

  // KPI calculations matching reference images
  const totalDocumentedSessions = esepSessions.length;
  const evaluatedCount = esepSessions.filter(s => evaluationFor(s, esepEvaluations)).length;
  const awaitingCount = esepSessions.filter(s => !evaluationFor(s, esepEvaluations) && (!s.due || s.due >= simulatedCurrentDate)).length;
  const overdueCount = esepSessions.filter(s => coachingStatus(s, esepEvaluations, simulatedCurrentDate) === 'Overdue').length;

  // Selected session to open in detail modal
  const modalSession = activeGrowModalSessionId 
    ? esepSessions.find(s => s.id === activeGrowModalSessionId) 
    : null;

  const triggerToast = (msg: string) => {
    setRecordSuccessToast(msg);
    setTimeout(() => setRecordSuccessToast(null), 3000);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("New GROW Coaching session recorded and added to development evidence!");
    setShowRecordModal(false);
    setRecordGoal("");
    setRecordActionPlan("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {recordSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#042C51] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#FF5C28] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#FF5C28]" />
          <span>{recordSuccessToast}</span>
        </div>
      )}

      {/* Top Header & Demo Selectors (Matching Image 2 / Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6ECF2] pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            HUMAN RESOURCES / EMPLOYEE JOURNEY
          </span>
          <h2 className="text-xl font-black text-[#042C51] tracking-tight">
            ESEP Coaching & Development
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Demo Role</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F7F9FC] border border-[#BECBDA] font-extrabold text-[#042C51] text-[11px]">
              HR Admin
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Employee</span>
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                const found = journeys.find(j => (j.sibsEmployeeId || j.id) === e.target.value || j.id === e.target.value);
                if (found && onSelectEmployee) {
                  onSelectEmployee(found);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#BECBDA] font-bold text-[#042C51] text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#FF5C28] cursor-pointer"
            >
              {journeys.slice(0, 8).map(j => (
                <option key={j.id} value={j.sibsEmployeeId || j.id}>
                  {j.fullName} ({j.sibsEmployeeId || j.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Blue Banner Card (Exact replicate of Image 2) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#042C51] text-white p-6 shadow-sm border border-[#0B365F]">
        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#042C51] via-[#1A4C7B] to-[#FF5C28]" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-[#FF5C28] uppercase">
                SIBS-ESEP-001 • REVISION 001 • SEPT 2024
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Employee Success & Empowerment
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Continuous CSR development through TL & QDS coaching, documented GROW commitments, employee feedback, and coaching effectiveness monitoring.
            </p>
          </div>

          <div className="shrink-0 self-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-black text-white">
              <Award className="w-3.5 h-3.5 text-[#FF5C28]" />
              ESEP • {journeys.length} sample CSR(s)
            </span>
          </div>
        </div>

        {/* Action Buttons inside Banner */}
        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowRecordModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B365F] hover:bg-[#13406D] text-white text-xs font-bold border border-white/20 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>+ Record GROW coaching</span>
          </button>
          <button
            type="button"
            onClick={() => triggerToast("TL EOD summary compiled and verified for today's coaching logs.")}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer"
          >
            Submit TL EOD report
          </button>
          <button
            type="button"
            onClick={() => setEsepSubView("accountability")}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer"
          >
            Review assignments
          </button>
        </div>
      </div>

      {/* Internal View Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E6ECF2] pb-2">
        <button
          type="button"
          onClick={() => setEsepSubView("overview")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            esepSubView === "overview" 
              ? "bg-[#042C51] text-white shadow-xs" 
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
          }`}
        >
          Coaching Results & Outcomes
        </button>
        <button
          type="button"
          onClick={() => setEsepSubView("accountability")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            esepSubView === "accountability" 
              ? "bg-[#042C51] text-white shadow-xs" 
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
          }`}
        >
          Coach Accountability & Weekly Coverage
        </button>
        <button
          type="button"
          onClick={() => setEsepSubView("grow_history")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            esepSubView === "grow_history" 
              ? "bg-[#042C51] text-white shadow-xs" 
              : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
          }`}
        >
          GROW Coaching History ({esepSessions.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: COACHING RESULTS OVERVIEW & OUTCOMES */}
      {/* ======================================================== */}
      {(esepSubView === "overview") && (
        <div className="space-y-6">
          {/* Coaching Results Overview Header & 4 KPI Outcome Cards (Matching Image 2) */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">
                  ESEP • EMPLOYEE DEVELOPMENT OUTCOMES
                </span>
                <h3 className="text-base font-black text-[#042C51]">Coaching Results Overview</h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Coaching records are maintained in the dedicated coaching/monitoring application. This page focuses on displaying outcomes per employee, not uploading monitoring forms.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 shrink-0 self-start sm:self-auto border border-slate-200">
                Read-only results view
              </span>
            </div>

            {/* 4 KPI Outcome Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                <strong className="text-2xl font-black text-[#042C51] tabular-nums block">
                  {totalDocumentedSessions}
                </strong>
                <span className="text-xs text-slate-600 font-semibold block mt-1">
                  Documented coaching sessions
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                <strong className="text-2xl font-black text-emerald-700 tabular-nums block">
                  {evaluatedCount}
                </strong>
                <span className="text-xs text-slate-600 font-semibold block mt-1">
                  Follow-ups evaluated
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                <strong className="text-2xl font-black text-amber-700 tabular-nums block">
                  {awaitingCount}
                </strong>
                <span className="text-xs text-slate-600 font-semibold block mt-1">
                  Awaiting evaluation
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
                <strong className="text-2xl font-black text-slate-700 tabular-nums block">
                  {overdueCount}
                </strong>
                <span className="text-xs text-slate-600 font-semibold block mt-1">
                  Overdue follow-up reviews
                </span>
              </div>
            </div>

            {/* Coaching Results Overview Table (Matching Image 2) */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">EMPLOYEE</th>
                    <th className="py-2.5 px-3">SESSIONS</th>
                    <th className="py-2.5 px-3">LATEST RESULT</th>
                    <th className="py-2.5 px-3">EFFECTIVENESS EVIDENCE</th>
                    <th className="py-2.5 px-3">FOLLOW-UP</th>
                    <th className="py-2.5 px-3 text-right">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {journeys.slice(0, 6).map((emp) => {
                    const empSessions = coachingForEmployee(esepSessions, emp);
                    const count = empSessions.length;
                    const latestSession = empSessions[0] || null;
                    const evalObj = latestSession ? evaluationFor(latestSession, esepEvaluations) : null;
                    const comp = kpiComparison(evalObj);
                    const status = latestSession ? coachingStatus(latestSession, esepEvaluations, simulatedCurrentDate) : null;
                    const isSelected = (emp.sibsEmployeeId || emp.id) === selectedEmpId || emp.id === selectedEmpId;

                    return (
                      <tr 
                        key={emp.id} 
                        onClick={() => {
                          setSelectedEmpId(emp.sibsEmployeeId || emp.id);
                          setViewResultModalEmployee(emp);
                        }}
                        className={`hover:bg-[#F7F9FC] cursor-pointer transition-colors ${
                          isSelected ? "bg-[#FFF7F2]/60 font-semibold" : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <strong className="text-xs text-[#042C51] block">{emp.fullName}</strong>
                          <span className="text-[10px] text-slate-500">{emp.sibsEmployeeId || emp.id} • {emp.account}</span>
                        </td>
                        <td className="py-3 px-3 tabular-nums font-bold text-[#042C51]">
                          {count}
                        </td>
                        <td className="py-3 px-3">
                          {count === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              No sessions
                            </span>
                          ) : status === "Evaluated" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Evaluated
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Awaiting evaluation
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {comp ? (
                            <span className="font-semibold text-emerald-700">
                              Recorded KPI: {comp.before} → {comp.after} ({comp.differenceLabel})
                            </span>
                          ) : count > 0 ? (
                            <span className="text-slate-400">Not measured</span>
                          ) : (
                            <span className="text-slate-400">Not measured</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            No overdue
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmpId(emp.sibsEmployeeId || emp.id);
                              setViewResultModalEmployee(emp);
                            }}
                            className="text-[#FF5C28] hover:text-[#e04f20] text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>View results</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Targeted Employee Coaching Outcomes Card (Exact Replicate of Image 3) */}
          <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">
                  ESEP • COACHING RESULTS
                </span>
                <h3 className="text-base font-black text-[#042C51]">
                  Coaching outcomes • {activeTrainee.fullName}
                </h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Read-only development results: coaching observations, agreed commitments, follow-up findings and measured KPI changes when recorded. The monitoring form remains in its separate app.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-slate-100 text-slate-700 border border-slate-200 shrink-0 self-start sm:self-auto">
                {traineeSessions.filter(s => evaluationFor(s, esepEvaluations)).length} evaluated / {traineeSessions.length} sessions
              </span>
            </div>

            {/* List of Coaching Sessions for Selected Trainee */}
            {traineeSessions.length > 0 ? (
              <div className="space-y-4">
                {traineeSessions.map((session) => {
                  const evaluation = evaluationFor(session, esepEvaluations);
                  const comparison = kpiComparison(evaluation);
                  const status = coachingStatus(session, esepEvaluations, simulatedCurrentDate);

                  return (
                    <div 
                      key={session.id} 
                      className="rounded-2xl border border-[#E6ECF2] bg-[#FAFCFF] p-5 space-y-4 shadow-2xs"
                    >
                      {/* Session Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#042C51]">
                            {session.type} • {session.date}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {session.facilitator} • {session.facilitatorRole} • <span className="font-mono text-slate-700 font-bold">ESEP-{session.id}</span>
                          </p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                          status === "Evaluated" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : status === "Overdue" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* 2-Column Grid (Image 3: Goal, Observed Behavior, Agreed Action, Commitment Follow-up) */}
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

                      {/* Follow-up Result Box (Image 3 teal/emerald container) */}
                      {evaluation ? (
                        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-xs space-y-1.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <strong className="text-emerald-950 font-bold">
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
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span>Awaiting supervisor follow-up evaluation. Target commitment due: <strong>{session.due}</strong></span>
                          <span className="text-[10px] font-bold uppercase text-amber-800">Pending Review</span>
                        </div>
                      )}

                      {/* View GROW details Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveGrowModalSessionId(session.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-[#BECBDA] text-[#042C51] bg-white hover:bg-[#F7F9FC] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Eye size={13} />
                          <span>View GROW details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-[#BECBDA] bg-[#FAFCFF] space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  No ESEP coaching sessions recorded for {activeTrainee.fullName}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#FF5C28] text-white text-xs font-bold hover:bg-[#e04f20] transition-colors"
                >
                  + Record Initial GROW Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: COACH ACCOUNTABILITY & WEEKLY COVERAGE */}
      {/* ======================================================== */}
      {(esepSubView === "accountability") && (
        <div className="space-y-6">
          {/* Top 4 Accountability KPI Cards (Matching Image 4) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-[#E6ECF2] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  WEEKLY TL ONE-ON-ONES
                </span>
                <strong className="text-2xl font-black text-[#042C51] tabular-nums block mt-0.5">
                  2 / 6
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">
                  Required once per CSR per week
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E6ECF2] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  TODAY • TL SESSIONS
                </span>
                <strong className="text-2xl font-black text-emerald-700 tabular-nums block mt-0.5">
                  1
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">
                  Policy target: 3-5 per TL daily
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E6ECF2] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  TODAY • QDS SESSIONS
                </span>
                <strong className="text-2xl font-black text-slate-700 tabular-nums block mt-0.5">
                  0
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">
                  Policy target: 3-5 per QDS daily
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E6ECF2] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  TL EOD SUBMITTED
                </span>
                <strong className="text-2xl font-black text-slate-700 tabular-nums block mt-0.5">
                  0
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">
                  Coaching form references required
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2-Column Tables: Daily Coaching Accountability & Weekly CSR Coverage (Image 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Table: Daily Coaching Accountability */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                    Daily coaching accountability
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Counts below are from visible sample data, not a verified company-wide compliance result.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Target: 3-5 per coach
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-2 px-2">TL / QDS</th>
                      <th className="py-2 px-2">ASSIGNED CSRS</th>
                      <th className="py-2 px-2">TODAY</th>
                      <th className="py-2 px-2">WEEKLY TL 1:1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2.5 px-2">
                        <strong className="text-xs text-[#042C51] block">Anton Reyes</strong>
                        <span className="text-[10px] text-slate-500">Team Leader</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">3 in sample</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          1 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-bold text-[#042C51]">2 / 3</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2">
                        <strong className="text-xs text-[#042C51] block">Rico Torres</strong>
                        <span className="text-[10px] text-slate-500">Team Leader</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">3 in sample</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-bold text-slate-500">0 / 3</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2">
                        <strong className="text-xs text-[#042C51] block">Elena Santos</strong>
                        <span className="text-[10px] text-slate-500">QDS / QA</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">3 in sample</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2">
                        <strong className="text-xs text-[#042C51] block">Ella Lim</strong>
                        <span className="text-[10px] text-slate-500">QDS / QA</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">3 in sample</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10.5px] text-slate-400 pt-1">
                Policy assignments are at least 25 CSRs per TL and QDS. This sample has only 6 CSR records, so full-roster coverage cannot be verified.
              </p>
            </div>

            {/* Right Table: Weekly CSR Coaching Coverage */}
            <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                  Weekly CSR coaching coverage
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reporting week: October 12, 2026 – October 18, 2026. A completed TL Weekly 1:1 is required for each CSR.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {journeys.slice(0, 6).map((csr, idx) => {
                  const hasCompleted1on1 = idx < 2; // Alyssa & Marco completed
                  return (
                    <div key={csr.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#042C51] block font-bold">{csr.fullName}</strong>
                        <span className="text-[10px] text-slate-500">
                          {csr.sibsEmployeeId || csr.id} • TL {csr.tl || "Anton Reyes"} • QDS {csr.qa || "Elena Santos"}
                        </span>
                      </div>
                      {hasCompleted1on1 ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          No 1:1 recorded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: GROW COACHING HISTORY */}
      {/* ======================================================== */}
      {(esepSubView === "grow_history") && (
        <div className="bg-white rounded-2xl border border-[#E6ECF2] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-black uppercase text-[#042C51] tracking-wider">
                GROW coaching history
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Actual saved sessions with Goal, Reality, Options and Way Forward; QA-triggered and TL 1:1 sessions.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {esepSessions.length} sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                  <th className="py-2 px-3">DATE</th>
                  <th className="py-2 px-3">CSR</th>
                  <th className="py-2 px-3">FACILITATOR</th>
                  <th className="py-2 px-3">TYPE</th>
                  <th className="py-2 px-3">GOAL & COMMITMENT</th>
                  <th className="py-2 px-3">FOLLOW-UP</th>
                  <th className="py-2 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {esepSessions.map(session => {
                  const empObj = journeys.find(j => (j.sibsEmployeeId || j.id) === session.emp || j.id === session.emp);
                  const evalObj = evaluationFor(session, esepEvaluations);
                  const comp = kpiComparison(evalObj);
                  const status = coachingStatus(session, esepEvaluations, simulatedCurrentDate);

                  return (
                    <tr key={session.id} className="hover:bg-[#F7F9FC]">
                      <td className="py-3 px-3 whitespace-nowrap font-semibold text-[#042C51]">
                        {session.date}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-[#042C51] block">{empObj?.fullName || session.emp}</strong>
                        <span className="text-[10px] text-slate-500">{session.emp}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{session.facilitator}</span>
                        <span className="text-[10px] text-slate-500 block">{session.facilitatorRole}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {session.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <strong className="text-[#042C51] block text-[11px] truncate">{session.goal}</strong>
                        <p className="text-[10.5px] text-slate-500 line-clamp-1">{session.will}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {status === "Evaluated" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {comp ? `KPI ${comp.differenceLabel}` : "Evaluated"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Due {session.due}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpId(session.emp);
                            setActiveGrowModalSessionId(session.id);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-slate-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
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
        </div>
      )}

      {/* Record GROW Coaching Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-[#E6ECF2]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF5C28]" />
                <h3 className="font-extrabold text-[#042C51] text-base">Record ESEP GROW Coaching</h3>
              </div>
              <button 
                onClick={() => setShowRecordModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Coachee / Employee</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${activeTrainee.fullName} (${activeTrainee.sibsEmployeeId || activeTrainee.id})`}
                  className="w-full p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Session Type</label>
                  <select 
                    value={recordType}
                    onChange={e => setRecordType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51]"
                  >
                    <option value="Weekly 1:1">Weekly 1:1</option>
                    <option value="QA-triggered">QA-triggered</option>
                    <option value="Ad-hoc Support">Ad-hoc Support</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Facilitator</label>
                  <input 
                    type="text" 
                    defaultValue="Anton Reyes (Team Leader)"
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">G • Coaching Goal</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Improve case resolution confidence & documentation accuracy"
                  value={recordGoal}
                  onChange={e => setRecordGoal(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#BECBDA] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">W • Agreed Action / Way Forward</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="e.g. Practice 2 case scenarios with TL and apply the checklist on next monitored calls"
                  value={recordActionPlan}
                  onChange={e => setRecordActionPlan(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#BECBDA] text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Save Coaching Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Results / GROW Coaching Detail Modal (Matching image_cbd83600.png) */}
      {(viewResultModalEmployee || modalSession) && (
        <TrainerCoachingDetailsModal
          employee={viewResultModalEmployee || activeTrainee}
          sessions={esepSessions}
          evaluations={esepEvaluations}
          asOf={simulatedCurrentDate}
          onClose={() => {
            setViewResultModalEmployee(null);
            setActiveGrowModalSessionId(null);
          }}
          initialSessionId={modalSession?.id}
        />
      )}
    </div>
  );
}
