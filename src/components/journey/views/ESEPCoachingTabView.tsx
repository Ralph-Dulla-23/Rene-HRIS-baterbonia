import React, { useState, useMemo } from "react";
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
  Search,
  Users,
  Target,
  Sparkles,
  RefreshCw
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

  // Search filter for tables
  const [searchQuery, setSearchQuery] = useState("");

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
  ) || (selectedEmpId === "ONB-2026-001" ? ({
    id: "ONB-2026-001",
    sibsEmployeeId: "ONB-2026-001",
    fullName: "Theresa Mae Santos",
    roleTitle: "Healthcare Support Specialist",
    department: "Operations",
    account: "Elevance Health",
    tl: "Anton Reyes",
    qa: "Elena Santos"
  } as any) : fallbackJourney);

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

  // Filtered journeys for overview table
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return journeys;
    const q = searchQuery.toLowerCase();
    return journeys.filter(j => 
      j.fullName.toLowerCase().includes(q) ||
      (j.sibsEmployeeId && j.sibsEmployeeId.toLowerCase().includes(q)) ||
      (j.account && j.account.toLowerCase().includes(q)) ||
      (j.tl && j.tl.toLowerCase().includes(q))
    );
  }, [journeys, searchQuery]);

  return (
    <div className="space-y-5 select-none animate-in fade-in duration-200 pb-12 font-jakarta">
      {/* Toast Notification */}
      {recordSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#042C51] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#FF5C28] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#FF5C28]" />
          <span>{recordSuccessToast}</span>
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
                <Award className="h-3 w-3 text-[#FF5C28]" />
                ESEP FRAMEWORK • SIBS-ESEP-001
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700">
                TL &amp; QDS GROW Coaching Framework
              </span>
              <span className="inline-flex items-center rounded-full border border-[#DCE5EF] bg-[#F8FAFC] px-2.5 py-1 text-[9px] font-extrabold text-[#042C51]">
                ESEP • {journeys.length} Trainees / CSRs
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#042C51] sm:text-2xl 2xl:text-[28px]">
              ESEP Coaching &amp; Development
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#667085] 2xl:text-[13px]">
              Continuous CSR development through TL &amp; QDS coaching, documented GROW commitments, employee feedback, and coaching effectiveness monitoring.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            {/* Focus Employee Dropdown */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] px-2.5 py-1.5 text-xs">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Focus:</span>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  const found = journeys.find(j => (j.sibsEmployeeId || j.id) === e.target.value || j.id === e.target.value);
                  if (found && onSelectEmployee) {
                    onSelectEmployee(found);
                  }
                }}
                className="bg-transparent font-extrabold text-[#042C51] text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="ONB-2026-001">Theresa Mae Santos (ONB-2026-001)</option>
                {journeys.map(j => (
                  <option key={j.id} value={j.sibsEmployeeId || j.id}>
                    {j.fullName} ({j.sibsEmployeeId || j.id})
                  </option>
                ))}
              </select>
            </div>

            {/* TL EOD Button */}
            <button
              type="button"
              onClick={() => triggerToast("TL EOD summary compiled and verified for today's coaching logs.")}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-3.5 text-xs font-bold text-[#042C51] shadow-2xs hover:bg-[#F8FAFC] hover:border-[#BECBDA] transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-[#042C51]" />
              <span>Submit TL EOD Report</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setShowRecordModal(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#FF5C28] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#E95324] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record GROW Coaching</span>
            </button>
          </div>
        </div>

        {/* Section Jump Quick Navigation Bar */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#E6ECF2] pt-3 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085] pr-1 shrink-0">
            Views:
          </span>

          <button
            type="button"
            onClick={() => setEsepSubView("overview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 ${
              esepSubView === "overview"
                ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                : "bg-[#F8FAFC] text-[#042C51] hover:bg-white border-[#E6ECF2]"
            }`}
          >
            <TrendingUp className={`h-3.5 w-3.5 ${esepSubView === "overview" ? "text-[#FF5C28]" : "text-[#FF5C28]"}`} />
            <span>Coaching Results &amp; Outcomes</span>
          </button>

          <button
            type="button"
            onClick={() => setEsepSubView("accountability")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 ${
              esepSubView === "accountability"
                ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                : "bg-[#F8FAFC] text-[#042C51] hover:bg-white border-[#E6ECF2]"
            }`}
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${esepSubView === "accountability" ? "text-[#FF5C28]" : "text-[#FF5C28]"}`} />
            <span>Coach Accountability &amp; Coverage</span>
          </button>

          <button
            type="button"
            onClick={() => setEsepSubView("grow_history")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 ${
              esepSubView === "grow_history"
                ? "bg-[#042C51] text-white border-[#042C51] shadow-xs"
                : "bg-[#F8FAFC] text-[#042C51] hover:bg-white border-[#E6ECF2]"
            }`}
          >
            <FileText className={`h-3.5 w-3.5 ${esepSubView === "grow_history" ? "text-[#FF5C28]" : "text-[#FF5C28]"}`} />
            <span>GROW Coaching History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-black ${
              esepSubView === "grow_history" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {esepSessions.length}
            </span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 1: COACHING RESULTS OVERVIEW & OUTCOMES */}
      {/* ======================================================== */}
      {esepSubView === "overview" && (
        <div className="space-y-5">
          {/* 4 Standard SiBS KPI Metric Cards */}
          <section className="space-y-4 select-none">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Coaching Performance &amp; Effectiveness Benchmarks
                </span>
                <span className="text-[10px] font-bold text-slate-400">4 Metrics</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 min-w-0">
                {/* 1. Documented Sessions */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Documented Sessions</span>
                    <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-[#042C51] tracking-tight">{totalDocumentedSessions}</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Documented coaching sessions</div>
                  </div>
                </div>

                {/* 2. Follow-ups Evaluated */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Follow-ups Evaluated</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-emerald-700 tracking-tight">{evaluatedCount}</div>
                    <div className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">Completed follow-ups</div>
                  </div>
                </div>

                {/* 3. Awaiting Evaluation */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Awaiting Evaluation</span>
                    <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[#E67E22]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-[#E67E22] tracking-tight">{awaitingCount}</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Commitments in progress</div>
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
                    <div className="text-xl font-extrabold text-[#E74C3C] tracking-tight">{overdueCount}</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Past due follow-up reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Master Table Card: Coaching Results Overview */}
          <section className="relative z-[10] overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)]">
            <header className="border-b border-[#E6ECF2] bg-white p-4 sm:p-5 2xl:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold tracking-tight text-[#042C51] 2xl:text-lg">
                      Coaching Results Overview
                    </h2>
                    <span className="rounded-full bg-[#042C51] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                      ESEP Outcomes
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#667085]">
                    Coaching records are maintained in the dedicated coaching/monitoring application. This view focuses on displaying outcomes per employee.
                  </p>
                </div>

                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-[10.5px] font-extrabold text-[#667085]">
                    Read-only results view
                  </span>
                  <span className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#042C51]">
                    Total: <strong className="text-[#FF5C28]">{journeys.length}</strong> CSRs
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-3.5 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by employee name, ID, account, or TL..."
                    className="h-9 w-full rounded-lg border border-[#D7E0EA] bg-[#F8FAFC] pl-8 pr-3 text-xs font-semibold text-[#042C51] placeholder-[#98A2B3] focus:border-[#FF5C28] focus:bg-white focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6ECF2] bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">SESSIONS</th>
                    <th className="py-3 px-4">LATEST RESULT</th>
                    <th className="py-3 px-4">EFFECTIVENESS EVIDENCE</th>
                    <th className="py-3 px-4">FOLLOW-UP</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECF2] font-medium">
                  {filteredEmployees.map((emp) => {
                    const empSessions = coachingForEmployee(esepSessions, emp);
                    const count = empSessions.length;
                    const latestSession = empSessions[0] || null;
                    const evalObj = latestSession ? evaluationFor(latestSession, esepEvaluations) : null;
                    const comp = kpiComparison(evalObj);
                    const status = latestSession ? coachingStatus(latestSession, esepEvaluations, simulatedCurrentDate) : null;
                    const isSelected = (emp.sibsEmployeeId || emp.id) === selectedEmpId || emp.id === selectedEmpId;
                    const initials = emp.fullName.split(" ").map(n => n[0]).slice(0, 2).join("");

                    return (
                      <tr 
                        key={emp.id} 
                        onClick={() => {
                          setSelectedEmpId(emp.sibsEmployeeId || emp.id);
                          setViewResultModalEmployee(emp);
                        }}
                        className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                          isSelected ? "bg-orange-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#042C51] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <strong className="text-xs font-extrabold text-[#042C51] block hover:text-[#FF5C28] transition-colors truncate">
                                {emp.fullName}
                              </strong>
                              <span className="text-[10.5px] font-semibold text-slate-500">
                                {emp.sibsEmployeeId || emp.id} • {emp.account}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 tabular-nums font-extrabold text-[#042C51] text-xs">
                          {count}
                        </td>

                        <td className="py-3 px-4">
                          {count === 0 ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200">
                              No sessions
                            </span>
                          ) : status === "Evaluated" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} />
                              Evaluated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#E67E22] border border-amber-200">
                              <Clock size={11} />
                              Awaiting evaluation
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {comp ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <TrendingUp size={12} className="text-emerald-600" />
                              Recorded KPI: {comp.before} → {comp.after} ({comp.differenceLabel})
                            </span>
                          ) : count > 0 ? (
                            <span className="text-xs text-slate-400 font-medium">Not measured</span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Not measured</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                            No overdue
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmpId(emp.sibsEmployeeId || emp.id);
                              setViewResultModalEmployee(emp);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-2.5 py-1 text-xs font-bold text-[#042C51] shadow-2xs hover:bg-[#042C51] hover:text-white hover:border-[#042C51] transition-all cursor-pointer"
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
          </section>

          {/* Targeted Employee Coaching Outcomes Card */}
          <section className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6ECF2] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#042C51] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                  {activeTrainee.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider">
                      ESEP • COACHING RESULTS
                    </span>
                    <span className="font-mono text-[10.5px] font-bold text-[#042C51] bg-[#F0F4F8] border border-[#BECBDA] px-1.5 py-0.2 rounded">
                      {activeTrainee.sibsEmployeeId || activeTrainee.id}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#042C51]">
                    Coaching outcomes • {activeTrainee.fullName}
                  </h3>
                  <p className="text-xs font-medium text-[#667085] mt-0.5">
                    Read-only development results: coaching observations, agreed commitments, follow-up findings, and measured KPI changes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-[10.5px] font-extrabold text-[#475467]">
                  {traineeSessions.filter(s => evaluationFor(s, esepEvaluations)).length} evaluated / {traineeSessions.length} GROW sessions
                </span>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5C28] px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs hover:bg-[#E95324] transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Assign Action Item</span>
                </button>
              </div>
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
                      className="rounded-xl border border-[#E6ECF2] bg-white p-4.5 space-y-3.5 shadow-2xs hover:border-[#BECBDA] transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF5C28]" />
                      
                      {/* Session Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6ECF2] pb-3 pl-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#042C51] flex items-center gap-2">
                            <span>{session.type}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-semibold">{session.date}</span>
                          </h4>
                          <p className="text-xs text-[#667085] mt-0.5 font-medium">
                            Facilitator: <strong className="text-[#042C51]">{session.facilitator}</strong> ({session.facilitatorRole}) • Session Ref: <span className="font-mono text-[#042C51] font-bold">ESEP-{session.id}</span>
                          </p>
                        </div>

                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold border ${
                          status === "Evaluated" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : status === "Overdue" 
                            ? "bg-rose-50 text-rose-700 border-rose-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {status === "Evaluated" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {status}
                        </span>
                      </div>

                      {/* 4-Column GROW Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pl-2">
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] space-y-1">
                          <span className="text-[10px] font-black uppercase text-[#667085] block tracking-wider">
                            G • COACHING GOAL
                          </span>
                          <p className="font-bold text-[#042C51] text-xs leading-snug">
                            {session.goal}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] space-y-1">
                          <span className="text-[10px] font-black uppercase text-[#667085] block tracking-wider">
                            R • OBSERVED REALITY
                          </span>
                          <p className="font-semibold text-slate-700 text-xs leading-snug">
                            {session.reality}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] space-y-1">
                          <span className="text-[10px] font-black uppercase text-[#667085] block tracking-wider">
                            W • AGREED ACTION PLAN
                          </span>
                          <p className="font-bold text-[#042C51] text-xs leading-snug">
                            {session.will || session.actionPlan}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E6ECF2] space-y-1">
                          <span className="text-[10px] font-black uppercase text-[#667085] block tracking-wider">
                            COMMITMENT FOLLOW-UP
                          </span>
                          <p className="font-extrabold text-[#042C51] text-xs">
                            {session.due || "Pending schedule"}
                          </p>
                        </div>
                      </div>

                      {/* Follow-up Result Box */}
                      <div className="pl-2">
                        {evaluation ? (
                          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <strong className="text-emerald-950 font-bold">
                                Follow-up Result • {comparison ? `Recorded KPI ${comparison.before} → ${comparison.after} (${comparison.differenceLabel})` : "Follow-up Evaluated"}
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
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                            <span>Awaiting supervisor follow-up evaluation. Target commitment due: <strong>{session.due}</strong></span>
                            <span className="text-[10px] font-extrabold uppercase text-amber-800">Pending Review</span>
                          </div>
                        )}
                      </div>

                      {/* View GROW details Button */}
                      <div className="flex justify-end pt-1 pl-2">
                        <button
                          type="button"
                          onClick={() => setActiveGrowModalSessionId(session.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#D7E0EA] text-[#042C51] bg-[#F8FAFC] hover:bg-[#042C51] hover:text-white hover:border-[#042C51] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
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
              <div className="p-8 text-center rounded-xl border border-dashed border-[#BECBDA] bg-[#F8FAFC] space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  No ESEP GROW coaching sessions recorded for {activeTrainee.fullName}.
                </p>
                <p className="text-[11px] text-slate-400">
                  Candidate is tracking within operational benchmarks. You can assign action items or record new coaching logs.
                </p>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF5C28] text-white text-xs font-bold hover:bg-[#e04f20] transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span>Record Initial GROW Session</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: COACH ACCOUNTABILITY & WEEKLY COVERAGE */}
      {/* ======================================================== */}
      {esepSubView === "accountability" && (
        <div className="space-y-5">
          {/* Top 4 Accountability KPI Cards */}
          <section className="space-y-4 select-none">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Coach Quota &amp; Coverage Metrics
                </span>
                <span className="text-[10px] font-bold text-slate-400">4 Metrics</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 min-w-0">
                {/* 1. Weekly TL One-on-Ones */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Weekly TL 1-on-1s</span>
                    <div className="w-7 h-7 rounded-full bg-[#E9F0FC] flex items-center justify-center text-[#042C51]">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-[#042C51] tracking-tight">2 <span className="text-xs text-slate-400 font-semibold">/ 6</span></div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Required once per CSR per week</div>
                  </div>
                </div>

                {/* 2. Today TL Sessions */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Today • TL Sessions</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-emerald-700 tracking-tight">1</div>
                    <div className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">Target: 3-5 per TL daily</div>
                  </div>
                </div>

                {/* 3. Today QDS Sessions */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Today • QDS Sessions</span>
                    <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[#E67E22]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-[#E67E22] tracking-tight">0</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Target: 3-5 per QDS daily</div>
                  </div>
                </div>

                {/* 4. TL EOD Submitted */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E6ECF2] shadow-sm flex flex-col justify-between relative overflow-hidden h-[115px] hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TL EOD Submitted</span>
                    <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E74C3C]">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl font-extrabold text-[#042C51] tracking-tight">0</div>
                    <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Coaching references required</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2-Column Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Table: Daily Coaching Accountability */}
            <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-[#042C51]">
                    Daily Coaching Accountability
                  </h4>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Visible sample cohort data monitoring coaches' daily activity against standard policy.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                  Target: 3-5 per coach
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E6ECF2] bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">TL / QDS</th>
                      <th className="py-2.5 px-3">ASSIGNED CSRS</th>
                      <th className="py-2.5 px-3">TODAY</th>
                      <th className="py-2.5 px-3">WEEKLY TL 1:1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6ECF2] font-medium">
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="text-xs text-[#042C51] block font-extrabold">Anton Reyes</strong>
                        <span className="text-[10px] text-slate-500">Team Leader</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">3 in sample</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                          1 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-[#042C51]">2 / 3</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="text-xs text-[#042C51] block font-extrabold">Rico Torres</strong>
                        <span className="text-[10px] text-slate-500">Team Leader</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">3 in sample</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-500">0 / 3</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="text-xs text-[#042C51] block font-extrabold">Elena Santos</strong>
                        <span className="text-[10px] text-slate-500">QDS / QA</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">3 in sample</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="text-xs text-[#042C51] block font-extrabold">Ella Lim</strong>
                        <span className="text-[10px] text-slate-500">QDS / QA</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">3 in sample</td>
                      <td className="py-2.5 px-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200">
                          0 / 3-5
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Table: Weekly CSR Coaching Coverage */}
            <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-3">
              <div className="border-b border-[#E6ECF2] pb-3">
                <h4 className="text-sm font-extrabold text-[#042C51]">
                  Weekly CSR Coaching Coverage
                </h4>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Reporting week: Current operational cycle. Completed TL Weekly 1:1 is required for each CSR.
                </p>
              </div>

              <div className="divide-y divide-[#E6ECF2]">
                {journeys.slice(0, 6).map((csr, idx) => {
                  const hasCompleted1on1 = idx < 2;
                  const initials = csr.fullName.split(" ").map(n => n[0]).slice(0, 2).join("");
                  return (
                    <div key={csr.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-extrabold text-[10.5px] shrink-0">
                          {initials}
                        </div>
                        <div>
                          <strong className="text-[#042C51] block font-extrabold">{csr.fullName}</strong>
                          <span className="text-[10px] text-slate-500">
                            {csr.sibsEmployeeId || csr.id} • TL: {csr.tl || "Anton Reyes"}
                          </span>
                        </div>
                      </div>
                      {hasCompleted1on1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                          <Clock size={11} />
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
      {esepSubView === "grow_history" && (
        <section className="relative z-[10] overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_8px_22px_rgba(4,44,81,0.04)] space-y-4">
          <header className="border-b border-[#E6ECF2] bg-white p-4 sm:p-5 2xl:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-[#042C51] 2xl:text-lg">
                    GROW Coaching History
                  </h2>
                  <span className="rounded-full bg-[#042C51] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    Logs &amp; Evidence
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#667085]">
                  Detailed records with Goal, Reality, Options and Way Forward; QA-triggered and TL 1:1 sessions.
                </p>
              </div>

              <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <span className="rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#042C51]">
                  Total: <strong className="text-[#FF5C28]">{esepSessions.length}</strong> Sessions
                </span>
              </div>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6ECF2] bg-[#F8FAFC]/80 text-[#667085] font-black text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">CSR</th>
                  <th className="py-3 px-4">FACILITATOR</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">GOAL &amp; COMMITMENT</th>
                  <th className="py-3 px-4">FOLLOW-UP</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2] font-medium">
                {esepSessions.map(session => {
                  const empObj = journeys.find(j => (j.sibsEmployeeId || j.id) === session.emp || j.id === session.emp);
                  const evalObj = evaluationFor(session, esepEvaluations);
                  const comp = kpiComparison(evalObj);
                  const status = coachingStatus(session, esepEvaluations, simulatedCurrentDate);
                  const initials = empObj ? empObj.fullName.split(" ").map(n => n[0]).slice(0, 2).join("") : "CS";

                  return (
                    <tr key={session.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#042C51]">
                        {session.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#042C51] text-white flex items-center justify-center font-extrabold text-[10px] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <strong className="text-[#042C51] block font-extrabold">{empObj?.fullName || session.emp}</strong>
                            <span className="text-[10px] text-slate-500 font-semibold">{session.emp}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-800">{session.facilitator}</span>
                        <span className="text-[10px] text-slate-500 block">{session.facilitatorRole}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="rounded-full bg-[#F0F4F8] border border-[#BECBDA] px-2 py-0.5 text-[10px] font-extrabold text-[#042C51]">
                          {session.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <strong className="text-[#042C51] block text-[11px] font-extrabold truncate">{session.goal}</strong>
                        <p className="text-[10.5px] text-slate-500 line-clamp-1">{session.will}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {status === "Evaluated" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} />
                            {comp ? `KPI ${comp.differenceLabel}` : "Evaluated"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                            <Clock size={11} />
                            Due {session.due}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpId(session.emp);
                            setActiveGrowModalSessionId(session.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7E0EA] bg-white px-2.5 py-1 text-xs font-bold text-[#042C51] shadow-2xs hover:bg-[#042C51] hover:text-white hover:border-[#042C51] transition-all cursor-pointer"
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
        </section>
      )}

      {/* Record GROW Coaching Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-[#042C51]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative overflow-hidden bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#DCE5EF]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#042C51] via-[#1A5A8A] to-[#FF5C28]" />
            
            <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FF5C28]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#042C51] text-base">Record ESEP GROW Coaching</h3>
                  <p className="text-[11px] text-[#667085]">Document formal GROW coaching session and action plan</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecordModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#042C51] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#042C51] mb-1">Coachee / Employee</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${activeTrainee.fullName} (${activeTrainee.sibsEmployeeId || activeTrainee.id})`}
                  className="w-full p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Session Type</label>
                  <select 
                    value={recordType}
                    onChange={e => setRecordType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
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
                    className="w-full p-2 rounded-lg border border-[#BECBDA] font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-hidden"
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
                  className="w-full p-2.5 rounded-lg border border-[#BECBDA] text-slate-800 focus:border-[#FF5C28] focus:outline-hidden"
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
                  className="w-full p-2.5 rounded-lg border border-[#BECBDA] text-slate-800 focus:border-[#FF5C28] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E6ECF2]">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#BECBDA] text-[#042C51] hover:bg-[#F8FAFC] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF5C28] hover:bg-[#e04f20] text-white font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Save Coaching Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Results / GROW Coaching Detail Modal */}
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

