import React, { useState, useMemo } from "react";
import { useJourney } from "../JourneyContext";
import { EmployeeJourney } from "../journeyTypes";
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Award, 
  ChevronRight, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Eye,
  Link as LinkIcon
} from "lucide-react";
import { getEmphasizedEmployeeStatus } from "../employeeStatusUtils";

interface BenchmarkViewProps {
  onOpenLinkModal?: (journey: EmployeeJourney) => void;
  onSwitchModule?: (moduleKey: string) => void;
}

const SCORE_WEIGHTS = {
  "Training Assessment": 0.35,
  "QA Audit": 0.40,
  "Work Simulation": 0.25
};

export default function BenchmarkView({ onOpenLinkModal, onSwitchModule }: BenchmarkViewProps) {
  const { 
    journeys, 
    phaseTrainingScores, 
    evidence, 
    attendance, 
    assignments, 
    progress,
    coachingActions,
    simulatedCurrentDate,
    setSimulatedCurrentDate,
    setSelectedJourney,
    pendingDay30HandoffsCount 
  } = useJourney();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("All accounts");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("All trainers");
  const [selectedSite, setSelectedSite] = useState<string>("All sites");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [showOnlyHandoffDue, setShowOnlyHandoffDue] = useState(false);

  // Selected Trainee for Inspection Card
  const [inspectedEmpId, setInspectedEmpId] = useState<string | null>("SIBS-2904");
  const [inspectedDay, setInspectedDay] = useState<number>(90);

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

  // Compute Benchmark Record for Employee at Day 30, 60, 90
  const getBenchmarkRecord = (e: EmployeeJourney, day: number) => {
    const hire = e.hireDate || e.startDate || "2026-09-01";
    const start = day === 30 ? dayOffset(hire, 0) : dayOffset(hire, day - 30);
    const end = dayOffset(hire, day - 1);
    const eligible = end <= simulatedCurrentDate;

    // Phase training scores (separate FST / PST)
    const fstScoreObj = phaseTrainingScores.find(s => (s.emp === e.sibsEmployeeId || s.emp === e.id) && s.phase === "FST");
    const pstScoreObj = phaseTrainingScores.find(s => (s.emp === e.sibsEmployeeId || s.emp === e.id) && s.phase === "PST");

    // Nesting QA score or evidence
    const nestingQa = e.day30?.nestingQaScore;
    const qaEvid = evidence.filter(ev => (ev.emp === e.sibsEmployeeId || ev.emp === e.id) && ev.type === "QDS / QA");
    const qaScore = qaEvid.length > 0 ? Math.round(qaEvid.reduce((acc, ev) => acc + (ev.score || 85), 0) / qaEvid.length) : (nestingQa ?? null);

    // Trainer Assessment average in period
    const trScore = day === 30 
      ? (fstScoreObj?.score ?? nestingQa ?? null)
      : day === 60 
        ? (pstScoreObj?.score ?? fstScoreObj?.score ?? null)
        : (fstScoreObj && pstScoreObj ? Math.round((fstScoreObj.score + pstScoreObj.score) / 2) : (pstScoreObj?.score ?? fstScoreObj?.score ?? null));

    // Work simulation score
    const simScore = day === 60 ? (e.day60?.coreProductionScore ?? null) : day === 90 ? (e.day90?.compositeScore ?? null) : null;

    // Composite score
    const validScores = [trScore, qaScore, simScore].filter((s): s is number => s !== null);
    const composite = eligible && validScores.length > 0
      ? (trScore !== null && qaScore !== null && simScore !== null 
          ? Math.round(trScore * 0.35 + qaScore * 0.40 + simScore * 0.25)
          : Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length))
      : null;

    // Attendance
    const attRecords = attendance.filter(a => (a.emp === e.sibsEmployeeId || a.emp === e.id));
    let present = 0, late = 0, absent = 0, excused = 0, unrecorded = 0, totalWorkdays = 0;
    for (let cur = start; cur <= end && cur <= simulatedCurrentDate; cur = dayOffset(cur, 1)) {
      const w = new Date(cur + "T12:00:00Z").getUTCDay();
      if (w === 0 || w === 6) continue;
      totalWorkdays++;
      const match = attRecords.find(a => a.date === cur);
      const st = match?.status || "Unrecorded";
      if (st === "Present") present++;
      else if (st === "Late") late++;
      else if (st === "Absent") absent++;
      else if (st === "Excused") excused++;
      else unrecorded++;
    }
    const covered = present + late + absent + excused;
    const coverage = totalWorkdays ? Math.round((100 * covered) / totalWorkdays) : null;
    const attRate = covered ? Math.round((100 * (present + late)) / covered) : null;

    // Training activities
    const phaseAssigns = assignments.filter(a => (a.emp === e.sibsEmployeeId || a.emp === e.id) && a.date >= start && a.date <= end);
    const verifiedAssigns = phaseAssigns.filter(a => {
      const p = progress.find(pr => (pr.emp === e.sibsEmployeeId || pr.emp === e.id) && pr.assignmentId === a.id);
      return p?.status === "Verified";
    }).length;

    // Review status
    const rev = e.reviews?.[day];
    const reviewStatus = !eligible ? "Upcoming" : rev ? (day === 90 ? (e.acknowledged ? "Acknowledged" : "Manager submitted") : (rev.hr ? "HR confirmed" : "Awaiting HR")) : "Review pending";

    return {
      day,
      start,
      end,
      eligible,
      composite,
      trScore,
      qaScore,
      simScore,
      fstScore: fstScoreObj?.score ?? null,
      pstScore: pstScoreObj?.score ?? null,
      attRate,
      coverage,
      covered,
      totalWorkdays,
      absent,
      excused,
      late,
      unrecorded,
      phaseAssignsCount: phaseAssigns.length,
      verifiedAssigns,
      reviewStatus,
      gap: trScore - qaScore
    };
  };

  // Distinct filter options
  const accounts = ["All accounts", ...Array.from(new Set(journeys.map(j => j.account).filter(Boolean)))];
  const trainers = ["All trainers", ...Array.from(new Set(journeys.map(j => j.trainerName).filter(Boolean)))];
  const sites = ["All sites", ...Array.from(new Set(journeys.map(j => j.siteLocation).filter(Boolean)))];

  // Filtered Journeys
  const visibleJourneys = useMemo(() => {
    return journeys.filter(j => {
      if (showOnlyHandoffDue) {
        const days = j.daysElapsed || 1;
        const handoff = j.day30Handoff || j.day30?.handoff;
        if (days < 20 || (handoff && handoff.status === "Accepted")) {
          return false;
        }
      }

      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = !term || 
        j.fullName.toLowerCase().includes(term) ||
        (j.sibsEmployeeId || "").toLowerCase().includes(term) ||
        (j.kronosId || "").toLowerCase().includes(term) ||
        j.account.toLowerCase().includes(term) ||
        j.siteLocation.toLowerCase().includes(term) ||
        (j.trainerName || "").toLowerCase().includes(term);

      const matchesAccount = selectedAccount === "All accounts" || j.account === selectedAccount;
      const matchesTrainer = selectedTrainer === "All trainers" || j.trainerName === selectedTrainer;
      const matchesSite = selectedSite === "All sites" || j.siteLocation === selectedSite;

      let matchesRisk = true;
      if (selectedRisk !== "all") {
        const daysToCheck = selectedPhaseFilter === "all" ? [30, 60, 90] : [Number(selectedPhaseFilter)];
        const records = daysToCheck.map(d => getBenchmarkRecord(j, d)).filter(r => r.eligible);
        if (selectedRisk === "missing") {
          matchesRisk = records.some(r => r.composite === null);
        } else if (selectedRisk === "high") {
          matchesRisk = records.some(r => r.composite !== null && r.composite >= 85);
        } else if (selectedRisk === "developing") {
          matchesRisk = records.some(r => r.composite !== null && r.composite >= 70 && r.composite < 85);
        } else if (selectedRisk === "low") {
          matchesRisk = records.some(r => r.composite !== null && r.composite < 70);
        }
      }

      return matchesSearch && matchesAccount && matchesTrainer && matchesSite && matchesRisk;
    });
  }, [journeys, searchQuery, selectedPhaseFilter, selectedAccount, selectedTrainer, selectedSite, selectedRisk, showOnlyHandoffDue, simulatedCurrentDate]);

  // Aggregate stats per milestone day (Day 30, 60, 90)
  const getAggregates = (day: number) => {
    const records = visibleJourneys.map(j => getBenchmarkRecord(j, day));
    const eligible = records.filter(r => r.eligible);
    const complete = eligible.filter(r => r.composite !== null);
    const meanComp = complete.length ? Math.round(complete.reduce((s, r) => s + (r.composite || 0), 0) / complete.length) : null;
    const qaRecords = eligible.filter(r => r.qaScore !== null && r.qaScore !== undefined && !isNaN(r.qaScore));
    const meanQA = qaRecords.length ? Math.round(qaRecords.reduce((s, r) => s + Number(r.qaScore), 0) / qaRecords.length) : null;
    const attEligible = eligible.filter(r => r.attRate !== null && !isNaN(r.attRate));
    const meanAtt = attEligible.length ? Math.round(attEligible.reduce((s, r) => s + (r.attRate || 0), 0) / attEligible.length) : null;
    const highCount = complete.filter(r => (r.composite || 0) >= 85).length;
    const lowCount = complete.filter(r => (r.composite || 0) < 70).length;
    const totalAbsent = eligible.reduce((s, r) => s + r.absent, 0);
    const totalExcused = eligible.reduce((s, r) => s + r.excused, 0);
    const totalUnrecorded = eligible.reduce((s, r) => s + r.unrecorded, 0);

    return { day, eligibleCount: eligible.length, completeCount: complete.length, meanComp, meanQA, meanAtt, highCount, lowCount, totalAbsent, totalExcused, totalUnrecorded };
  };

  const agg30 = getAggregates(30);
  const agg60 = getAggregates(60);
  const agg90 = getAggregates(90);

  const totalScored = agg30.completeCount + agg60.completeCount + agg90.completeCount;
  const totalDue = agg30.eligibleCount + agg60.eligibleCount + agg90.eligibleCount;
  const totalLow = agg30.lowCount + agg60.lowCount + agg90.lowCount;

  // Active inspected employee
  const inspectedJourney = journeys.find(j => (j.sibsEmployeeId || j.id) === inspectedEmpId) || visibleJourneys[0] || journeys[0];
  const inspectedRecord = inspectedJourney ? getBenchmarkRecord(inspectedJourney, inspectedDay) : null;

  const scoreCategoryTone = (val: number | null) => {
    if (val === null) return "sibs-tone-blue-bg sibs-tone-blue-text border border-blue-200";
    if (val >= 85) return "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border";
    if (val >= 70) return "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border";
    return "sibs-tone-red-bg sibs-tone-red-text border sibs-tone-red-border";
  };

  const columns = selectedPhaseFilter === "all" ? [30, 60, 90] : [Number(selectedPhaseFilter)];

  return (
    <div className="space-y-6">
      {/* SiBS HRIS Standard Header: White card with top accent gradient bar */}
      <section className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white shadow-xs">
        <div className="h-[3.5px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-[#E9F0FC] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#042C51]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
              Performance Intelligence • 30 / 60 / 90 Day
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#042C51]">
              Employee Performance Benchmarking
            </h1>
            <p className="text-xs text-[#667085] max-w-3xl leading-normal">
              Track cohort trainees and compare milestone scores, independent QA audits, attendance, training completion, and regularization readiness in one view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F9FC] border border-[#E6ECF2] text-[#042C51] shrink-0">
              HR Admin • Read-only Benchmarking
            </span>
            <label className="flex items-center gap-2 rounded-xl border border-[#E6ECF2] bg-white px-3 py-1.5 text-xs text-[#042C51]">
              <span className="font-medium text-slate-500">Demo date</span>
              <input
                type="date"
                value={simulatedCurrentDate}
                onChange={e => setSimulatedCurrentDate(e.target.value)}
                className="max-w-[135px] bg-transparent font-semibold text-[#042C51] outline-none cursor-pointer"
                title="Simulated milestone date"
              />
            </label>
          </div>
        </div>
      </section>

      {/* HR Urgent Notification Alert Banner for Day 30 Trainer -> Team Leader Handoff */}
      {pendingDay30HandoffsCount > 0 && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-white border-l-4 border-[#FF5C28] border-y border-r border-[#E6ECF2] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-[#FF5C28] flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-[#FF5C28]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-[#FF5C28] text-white">
                  HR Action Required
                </span>
                <h3 className="text-sm font-black text-[#042C51]">
                  Day 30 Employee Custody Handoff: Trainer → Team Leader Transition ({pendingDay30HandoffsCount} Pending)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Trainees completing Day 1–30 Nesting must receive formal Trainer readiness endorsement and Team Leader acceptance before transitioning into live operational ramp. Review pending handoffs below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowOnlyHandoffDue(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                showOnlyHandoffDue
                  ? "bg-[#042C51] text-white hover:bg-[#083a69]"
                  : "bg-[#FF5C28] text-white hover:bg-[#e04f20]"
              }`}
            >
              {showOnlyHandoffDue ? "Show All Cohort Trainees" : `Filter Handoffs Due (${pendingDay30HandoffsCount})`}
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Search trainee</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Name, ID, account or site"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#BECBDA] outline-none text-xs text-[#042C51] focus:border-[#FF5C28] focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Milestone</label>
            <select
              value={selectedPhaseFilter}
              onChange={e => setSelectedPhaseFilter(e.target.value)}
              className="w-full p-1.5 rounded-xl border border-[#BECBDA] font-semibold text-[#042C51] bg-white outline-none focus:border-[#FF5C28]"
            >
              <option value="all">All milestones</option>
              <option value="30">Day 30</option>
              <option value="60">Day 60</option>
              <option value="90">Day 90</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full p-1.5 rounded-xl border border-[#BECBDA] font-semibold text-[#042C51] bg-white outline-none focus:border-[#FF5C28]"
            >
              {accounts.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Trainer</label>
            <select
              value={selectedTrainer}
              onChange={e => setSelectedTrainer(e.target.value)}
              className="w-full p-1.5 rounded-xl border border-[#BECBDA] font-semibold text-[#042C51] bg-white outline-none focus:border-[#FF5C28]"
            >
              {trainers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="w-full p-1.5 rounded-xl border border-[#BECBDA] font-semibold text-[#042C51] bg-white outline-none focus:border-[#FF5C28]"
            >
              {sites.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Score category</label>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full p-1.5 rounded-xl border border-[#BECBDA] font-semibold text-[#042C51] bg-white outline-none focus:border-[#FF5C28]"
            >
              <option value="all">All categories</option>
              <option value="high">High (85–100)</option>
              <option value="developing">Developing (70–84)</option>
              <option value="low">Needs support (under 70)</option>
              <option value="missing">Not assessed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedPhaseFilter("all");
              setSelectedAccount("All accounts");
              setSelectedTrainer("All trainers");
              setSelectedSite("All sites");
              setSelectedRisk("all");
            }}
            className="px-3 py-1.5 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] font-semibold text-xs text-[#042C51] cursor-pointer shadow-xs transition-colors"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Compact SiBS HRIS Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 truncate">
              Trainees in View
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
              {visibleJourneys.length}
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">
              Active cohort matching filters
            </div>
          </div>
        </div>

        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 truncate">
              Completed Scorecards
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
              {totalScored} <span className="text-sm font-semibold text-slate-400">/ {totalDue}</span>
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">
              Trainer + QA + TL combined
            </div>
          </div>
        </div>

        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 truncate">
              Needs Support
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#E74C3C]">
              {totalLow}
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">
              Scorecards below 70% benchmark
            </div>
          </div>
        </div>

        <div className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 truncate">
              Pending Scorecards
            </span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#E67E22]">
              {totalDue - totalScored}
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">
              Due milestone results lacking inputs
            </div>
          </div>
        </div>

        {/* 5th KPI Card: Day 30 Trainer -> TL Handoffs */}
        <div 
          onClick={() => setShowOnlyHandoffDue(prev => !prev)}
          className={`flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border p-3 sm:p-3.5 shadow-xs transition-all hover:shadow-sm cursor-pointer col-span-2 sm:col-span-1 ${
            pendingDay30HandoffsCount > 0 
              ? "border-[#FF5C28] bg-orange-50/50 hover:bg-orange-50" 
              : "border-[#E6ECF2] bg-white"
          }`}
          title="Click to filter by trainees needing Day 30 handoff"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28] truncate">
              Day 30 TL Handoffs
            </span>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
              pendingDay30HandoffsCount > 0 
                ? "border-orange-200 bg-orange-100 text-[#FF5C28]" 
                : "border-emerald-100 bg-emerald-50 text-emerald-600"
            }`}>
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51] flex items-center gap-1.5">
              <span>{pendingDay30HandoffsCount}</span>
              {pendingDay30HandoffsCount > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FF5C28] text-white uppercase tracking-wider">
                  Action Due
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate">
              {pendingDay30HandoffsCount > 0 ? "Trainer → TL transition needed" : "All handoffs up to date"}
            </div>
          </div>
        </div>
      </div>

      {/* 30–60–90 Milestone Benchmark Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">30–60–90 Milestone Benchmark</h2>
            <p className="text-xs text-slate-500">Each milestone uses scores recorded within that phase only. Day 30 emphasizes FST + PST results.</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
            Sample data • {visibleJourneys.length} trainees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[agg30, agg60, agg90]
            .filter(a => selectedPhaseFilter === "all" || String(a.day) === selectedPhaseFilter)
            .map(a => (
              <div key={a.day} className="bg-white border border-[#E6ECF2] rounded-xl p-3.5 sm:p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#042C51]">Day {a.day} Benchmark{a.day === 30 ? " • FST + PST" : ""}</h3>
                  <span className="text-[9.5px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border px-2 py-0.5 rounded-full">
                    {a.eligibleCount} reached milestone
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <strong className="text-2xl font-black tabular-nums text-[#042C51]">
                    {a.meanComp === null ? "—" : a.meanComp + "%"}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-semibold">{a.completeCount} scorecards</span>
                </div>

                <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${a.meanComp || 0}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-lg">
                    <span className="text-[9.5px] font-semibold text-slate-500 block">Independent QA</span>
                    <strong className="text-sm font-bold text-[#042C51] block mt-0.5">{a.meanQA === null ? "N/A" : a.meanQA + "%"}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-lg">
                    <span className="text-[9.5px] font-semibold text-slate-500 block">Attendance*</span>
                    <strong className="text-sm font-bold text-[#042C51] block mt-0.5">{a.meanAtt === null ? "N/A" : a.meanAtt + "%"}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-lg">
                    <span className="text-[9.5px] font-semibold text-slate-500 block">High performers</span>
                    <strong className="text-sm font-bold text-emerald-600 block mt-0.5">{a.highCount} / {a.completeCount}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-lg">
                    <span className="text-[9.5px] font-semibold text-slate-500 block">Need support</span>
                    <strong className="text-sm font-bold text-rose-600 block mt-0.5">{a.lowCount} / {a.completeCount}</strong>
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-400 truncate">
                  {a.totalAbsent} absences • {a.totalExcused} excused • {a.totalUnrecorded} missing records
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Consolidated Employee Comparison Table */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-[#E6ECF2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">Employee Milestone Comparison</h2>
            <p className="text-xs text-slate-500">
              Consolidated trainee roster: Day 30 (FST/PST), Day 60, Day 90. Click an employee row to open their Journey, or Inspect scores for benchmark details.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFCFF] text-slate-500 font-bold text-[10px] uppercase border-b border-[#E6ECF2]">
              <tr>
                <th className="py-2.5 px-3">Trainee</th>
                <th className="py-2.5 px-3">Account / Site</th>
                <th className="py-2.5 px-3">Trainer</th>
                {columns.map(d => (
                  <th key={d} className="py-2.5 px-3 min-w-[155px]">
                    <div className="flex items-center gap-1.5">
                      <span>Day {d}</span>
                      {d === 30 && pendingDay30HandoffsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-[#FF5C28] text-white">
                          ⚠️ {pendingDay30HandoffsCount} ALERT
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-3 min-w-[130px]">Journey Progress</th>
                <th className="py-2.5 px-3">Reviews Due</th>
                <th className="py-2.5 px-3">Open Actions</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visibleJourneys.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 7} className="py-12 text-center text-slate-400 italic">
                    No trainees match your filters. Clear filters to see full cohort.
                  </td>
                </tr>
              ) : (
                visibleJourneys.map(e => {
                  const daysElapsed = e.daysElapsed || 1;
                  const progressPct = Math.min(100, Math.round((daysElapsed / 90) * 100));
                  const openActionsCount = coachingActions.filter(a => (a.emp === e.sibsEmployeeId || a.emp === e.id) && a.status !== "Done").length;
                  const pendingReviews = [30, 60, 90].filter(k => daysElapsed >= k && !e.reviews?.[k]?.hr).length;
                  const empStatus = getEmphasizedEmployeeStatus(e);

                  return (
                    <tr 
                      key={e.id}
                      className="hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                      onClick={() => setSelectedJourney(e)}
                    >
                      {/* Trainee */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#E6EAF0] text-[#042C51] font-black text-[11px] flex items-center justify-center shrink-0">
                            {e.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs text-[#042C51] block truncate">{e.fullName}</strong>
                            <span className="text-[10px] text-slate-400 block">{e.sibsEmployeeId || e.id}</span>
                            {empStatus.isHandoffDue && (
                              <span className={`mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider ${empStatus.badgeClass}`}>
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                {empStatus.shortLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Account / Site */}
                      <td className="py-2.5 px-3">
                        <strong className="text-xs text-[#042C51] block truncate">{e.account}</strong>
                        <span className="text-[10px] text-slate-400 block">{e.siteLocation}</span>
                      </td>

                      {/* Trainer */}
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {e.trainerName || "Unassigned"}
                      </td>

                      {/* Milestone Columns (30, 60, 90) */}
                      {columns.map(day => {
                        const rec = getBenchmarkRecord(e, day);
                        const handoff = e.day30Handoff || e.day30?.handoff;
                        const inHandoffWindow = day === 30 && daysElapsed >= 20;

                        // Renders prominent Day 30 Trainer -> TL Handoff Alert
                        const renderDay30HandoffStatus = () => {
                          if (!inHandoffWindow) return null;

                          if (!handoff || handoff.status === "Pending") {
                            return (
                              <div 
                                className="mt-1.5 p-1.5 rounded-lg bg-orange-50/90 border border-[#FF5C28] shadow-2xs hover:bg-orange-100 transition-colors cursor-pointer"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setSelectedJourney(e);
                                }}
                                title="Click to open Day 30 Trainer → Team Leader handoff"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#FF5C28]">
                                    <AlertTriangle className="w-3 h-3 text-[#FF5C28] shrink-0" />
                                    Trainer → TL Handoff Due
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#FF5C28] text-white shrink-0">
                                    Action →
                                  </span>
                                </div>
                                <span className="text-[8.5px] text-slate-600 block mt-0.5 truncate font-medium">
                                  {e.trainerName || "Trainer"} ➔ {e.tl || "Team Leader"}
                                </span>
                              </div>
                            );
                          }

                          if (handoff.status === "Submitted") {
                            return (
                              <div 
                                className="mt-1.5 p-1.5 rounded-lg bg-amber-50 border border-amber-300 shadow-2xs hover:bg-amber-100/70 transition-colors cursor-pointer"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setSelectedJourney(e);
                                }}
                                title="Click to accept handoff as Team Leader"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800">
                                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                    Awaiting TL Acceptance
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-600 text-white shrink-0">
                                    Sign-off →
                                  </span>
                                </div>
                                <span className="text-[8.5px] text-amber-700 block mt-0.5 truncate font-medium">
                                  Endorsed by {handoff.trainerName}
                                </span>
                              </div>
                            );
                          }

                          if (handoff.status === "Accepted") {
                            return (
                              <div 
                                className="mt-1 pt-1 border-t border-slate-100 text-[8.5px] text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer hover:text-emerald-800"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setSelectedJourney(e);
                                }}
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span className="truncate">Handed off to TL {handoff.targetTlName || e.tl}</span>
                              </div>
                            );
                          }

                          return null;
                        };

                        if (!rec.eligible) {
                          return (
                            <td key={day} className="py-2.5 px-3" onClick={ev => ev.stopPropagation()}>
                              <div className="py-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  Upcoming
                                </span>
                                <span className="text-[10px] text-slate-400 block">{dateLabel(rec.end)}</span>
                                {renderDay30HandoffStatus()}
                              </div>
                            </td>
                          );
                        }

                        const valid = rec.composite !== null;

                        return (
                          <td key={day} className="py-2.5 px-3" onClick={ev => ev.stopPropagation()}>
                            <div className="py-1 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <strong className="text-xs font-black tabular-nums text-[#042C51]">
                                  {valid ? `${rec.composite}%` : "Not scored"}
                                </strong>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${scoreCategoryTone(rec.composite)}`}>
                                  {valid ? (rec.composite! >= 85 ? "High" : rec.composite! >= 70 ? "Developing" : "Needs support") : "Incomplete"}
                                </span>
                              </div>

                              <div className="w-24 h-1 bg-[#E6EAF0] rounded-full overflow-hidden">
                                {valid ? (
                                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${rec.composite}%` }} />
                                ) : (
                                  <div className="h-full w-full bg-slate-200" />
                                )}
                              </div>

                              <div className="text-[9.5px] text-slate-500 flex items-center gap-1">
                                <span>QA {rec.qaScore ?? "—"}%</span>
                                <span>•</span>
                                <span>Att {rec.attRate !== null ? `${rec.attRate}%` : "N/A"}</span>
                              </div>

                              {day === 30 && (rec.fstScore !== null || rec.pstScore !== null) && (
                                <div className="text-[9px] text-slate-400">
                                  FST {rec.fstScore ?? "—"}% • PST {rec.pstScore ?? "—"}%
                                </div>
                              )}

                              {renderDay30HandoffStatus()}
                            </div>
                          </td>
                        );
                      })}

                      {/* Journey Progress */}
                      <td className="py-2.5 px-3">
                        <div className="w-28 space-y-0.5">
                          <div className="flex justify-between text-[10.5px]">
                            <strong className="font-bold text-[#042C51]">Day {daysElapsed}/90</strong>
                            <span className="text-slate-400">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1 bg-[#E6EAF0] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                          <span className="text-[9.5px] font-semibold text-slate-500 block truncate" title={empStatus.label}>
                            {empStatus.shortLabel}
                          </span>
                        </div>
                      </td>

                      {/* Reviews Due */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pendingReviews ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                        }`}>
                          {pendingReviews ? `${pendingReviews} pending` : "Up to date"}
                        </span>
                      </td>

                      {/* Open Actions */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          openActionsCount ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                        }`}>
                          {openActionsCount} open
                        </span>
                      </td>

                      {/* Details / Inspection Actions */}
                      <td className="py-2.5 px-3 text-right" onClick={ev => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedEmpId(e.sibsEmployeeId || e.id);
                              setInspectedDay(selectedPhaseFilter === "all" ? (daysElapsed >= 90 ? 90 : daysElapsed >= 60 ? 60 : 30) : Number(selectedPhaseFilter));
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#042C51] bg-white hover:bg-[#F7F9FC] border border-[#BECBDA] rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedJourney(e)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#FF5C28] hover:bg-[#e04f20] rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Journey →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainee Checkpoint Drill-Down Inspection Card */}
      {inspectedJourney && inspectedRecord && (
        <div id="benchmark-detail" className="bg-white rounded-xl border border-[#E6ECF2] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-widest block">TRAINEE CHECKPOINT DRILL-DOWN</span>
              <h2 className="text-base font-extrabold text-[#042C51]">
                {inspectedJourney.fullName} — Day {inspectedDay}{inspectedDay === 30 ? " (FST + PST)" : ""}
              </h2>
              <p className="text-xs text-slate-500">
                {inspectedJourney.sibsEmployeeId || inspectedJourney.id} • {inspectedJourney.account} • {inspectedJourney.siteLocation} • Trainer: {inspectedJourney.trainerName || "Unassigned"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                inspectedRecord.reviewStatus === "HR confirmed" 
                  ? "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border" 
                  : "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border"
              }`}>
                {inspectedRecord.reviewStatus}
              </span>

              <button
                type="button"
                onClick={() => setSelectedJourney(inspectedJourney)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Open Employee Journey
              </button>
            </div>
          </div>

          {/* 4 Drilldown KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Phase Performance Score</span>
              <strong className="text-xl font-black text-[#042C51] my-0.5 block">
                {inspectedRecord.composite === null ? "N/A" : inspectedRecord.composite + "%"}
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.composite === null ? "Three independent inputs required" : scoreCategoryTone(inspectedRecord.composite)}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Trainer / QA / Simulation</span>
              <strong className="text-xl font-black text-[#042C51] my-0.5 block">
                {inspectedRecord.trScore}% / {inspectedRecord.qaScore}% / {inspectedRecord.simScore}%
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.gap >= 15 ? "Scoring discrepancy requires review" : "Scores recorded separately by owner"}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Attendance / Record Coverage</span>
              <strong className="text-xl font-black text-[#042C51] my-0.5 block">
                {inspectedRecord.attRate === null ? "N/A" : inspectedRecord.attRate + "%"}{" "}
                <span className="text-xs font-semibold text-slate-500">({inspectedRecord.coverage ?? 0}% covered)</span>
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.absent} absent • {inspectedRecord.excused} excused • {inspectedRecord.late} late
              </p>
            </div>

            <div className="p-3 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Training Activities</span>
              <strong className="text-xl font-black text-[#042C51] my-0.5 block">
                {inspectedRecord.verifiedAssigns} / {inspectedRecord.phaseAssignsCount} verified
              </strong>
              <p className="text-[10px] text-slate-500">
                Owner-verified completion in phase
              </p>
            </div>
          </div>

          {/* Day 30 FST & PST breakdown bars if Day 30 */}
          {inspectedDay === 30 && (
            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-2">
              <strong className="text-xs font-bold text-[#042C51] block">First 30 days: FST and PST assessments (separate sample evidence)</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>FST assessment</span>
                    <span className="text-[#042C51]">{inspectedRecord.fstScore !== null ? inspectedRecord.fstScore + "%" : "Not scored"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${inspectedRecord.fstScore || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>PST assessment</span>
                    <span className="text-[#FF5C28]">{inspectedRecord.pstScore !== null ? inspectedRecord.pstScore + "%" : "Not scored"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${inspectedRecord.pstScore || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence and Checkpoint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 text-xs">
            <div>
              <h3 className="font-extrabold text-[#042C51] mb-2">Phase Evidence</h3>
              <p className="text-[11px] text-slate-500 mb-2.5">{dateLabel(inspectedRecord.start)} – {dateLabel(inspectedRecord.end)}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-700">Training Assessment</span>
                  <span className="text-slate-600">{inspectedRecord.trScore}% • {inspectedJourney.trainerName || "Trainer"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-700">Independent QA Audit</span>
                  <span className="text-slate-600">{inspectedRecord.qaScore}% • {inspectedJourney.qa || "QA Lead"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-700">Work Simulation</span>
                  <span className="text-slate-600">{inspectedRecord.simScore}% • {inspectedJourney.tl || "Team Leader"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-[#042C51] mb-2">Checkpoint & Development</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-700">HR Checkpoint</span>
                  <span className="font-bold text-[#042C51]">{inspectedRecord.reviewStatus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-700">Open Coaching Actions</span>
                  <span className="font-bold text-slate-700">
                    {coachingActions.filter(a => (a.emp === inspectedJourney.sibsEmployeeId || a.emp === inspectedJourney.id) && a.status !== "Done").length}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                Attendance is contextual evidence and is not weighted into performance composite. Missing records never count as absences. Final employment decisions remain with HR.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
