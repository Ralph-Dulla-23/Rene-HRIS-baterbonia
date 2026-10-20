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
    setSelectedJourney 
  } = useJourney();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("All accounts");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("All trainers");
  const [selectedSite, setSelectedSite] = useState<string>("All sites");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");

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
  }, [journeys, searchQuery, selectedPhaseFilter, selectedAccount, selectedTrainer, selectedSite, selectedRisk, simulatedCurrentDate]);

  // Aggregate stats per milestone day (Day 30, 60, 90)
  const getAggregates = (day: number) => {
    const records = visibleJourneys.map(j => getBenchmarkRecord(j, day));
    const eligible = records.filter(r => r.eligible);
    const complete = eligible.filter(r => r.composite !== null);
    const meanComp = complete.length ? Math.round(complete.reduce((s, r) => s + (r.composite || 0), 0) / complete.length) : null;
    const meanQA = eligible.length ? Math.round(eligible.reduce((s, r) => s + r.qaScore, 0) / eligible.length) : null;
    const attEligible = eligible.filter(r => r.attRate !== null);
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
      {/* Hero Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            ADMIN PERFORMANCE INTELLIGENCE • 30 / 60 / 90 DAY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Employee performance benchmarking
          </h2>
          <p className="text-xs text-[#E6EAF0] max-w-3xl leading-relaxed">
            Track all trainees and compare milestone scores, independent QA, attendance, training completion, development actions and HR checkpoint readiness in one view.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white shrink-0">
          HR Admin • Read-only benchmarking
        </span>
      </div>

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

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trainees in View</span>
          <strong className="text-2xl font-black text-[#042C51] mt-1 block">{visibleJourneys.length}</strong>
          <span className="text-[10px] text-slate-400">Unique employees matching filters</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed Phase Scorecards</span>
          <strong className="text-2xl font-black text-[#042C51] mt-1 block">{totalScored} / {totalDue}</strong>
          <span className="text-[10px] text-slate-400">Requires Trainer + QA + TL scoring</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Needs-Support Phase Results</span>
          <strong className="text-2xl font-black text-[#E74C3C] mt-1 block">{totalLow}</strong>
          <span className="text-[10px] text-slate-400">Scored phase results below 70%</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Missing Phase Scorecards</span>
          <strong className="text-2xl font-black text-[#E67E22] mt-1 block">{totalDue - totalScored}</strong>
          <span className="text-[10px] text-slate-400">Due phase results lacking 1+ inputs</span>
        </div>
      </div>

      {/* 30–60–90 Milestone Benchmark Summary Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#042C51]">30–60–90 Milestone Benchmark</h2>
            <p className="text-xs text-slate-500">Each milestone uses scores recorded within that phase only. Day 30 emphasizes FST + PST results.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border">
            Sample data • {visibleJourneys.length} trainees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[agg30, agg60, agg90]
            .filter(a => selectedPhaseFilter === "all" || String(a.day) === selectedPhaseFilter)
            .map(a => (
              <div key={a.day} className="bg-white border border-[#E6ECF2] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#042C51]">Day {a.day} Benchmark{a.day === 30 ? " • FST + PST" : ""}</h3>
                  <span className="text-[10px] font-bold sibs-tone-blue-bg sibs-tone-blue-text border sibs-tone-blue-border px-2 py-0.5 rounded-full">
                    {a.eligibleCount} reached milestone
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-2">
                  <strong className="text-3xl font-black text-[#042C51]">
                    {a.meanComp === null ? "—" : a.meanComp + "%"}
                  </strong>
                  <span className="text-xs text-slate-500 font-semibold">{a.completeCount} complete scorecards</span>
                </div>

                <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${a.meanComp || 0}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Independent QA</span>
                    <strong className="text-base font-extrabold text-[#042C51] block mt-0.5">{a.meanQA === null ? "N/A" : a.meanQA + "%"}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Attendance*</span>
                    <strong className="text-base font-extrabold text-[#042C51] block mt-0.5">{a.meanAtt === null ? "N/A" : a.meanAtt + "%"}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                    <span className="text-[10px] text-slate-500 block">High performers</span>
                    <strong className="text-base font-extrabold text-[#042C51] block mt-0.5">{a.highCount} / {a.completeCount}</strong>
                  </div>
                  <div className="p-2 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Need support</span>
                    <strong className="text-base font-extrabold text-[#042C51] block mt-0.5">{a.lowCount} / {a.completeCount}</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  {a.totalAbsent} recorded absences • {a.totalExcused} excused days • {a.totalUnrecorded} missing records
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Consolidated Employee Comparison Table */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E6ECF2] flex items-center justify-between">
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
                <th className="py-3.5 px-4">Trainee</th>
                <th className="py-3.5 px-3">Account / Site</th>
                <th className="py-3.5 px-3">Trainer</th>
                {columns.map(d => (
                  <th key={d} className="py-3.5 px-3 min-w-[180px]">Day {d}</th>
                ))}
                <th className="py-3.5 px-3 min-w-[160px]">Journey Progress</th>
                <th className="py-3.5 px-3">Reviews Due</th>
                <th className="py-3.5 px-3">Open Actions</th>
                <th className="py-3.5 px-4 text-right">Details</th>
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

                  return (
                    <tr 
                      key={e.id}
                      className="hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                      onClick={() => setSelectedJourney(e)}
                    >
                      {/* Trainee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#E6EAF0] text-[#042C51] font-black text-xs flex items-center justify-center shrink-0">
                            {e.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <strong className="text-xs text-[#042C51] block">{e.fullName}</strong>
                            <span className="text-[10px] text-slate-400">{e.sibsEmployeeId || e.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Account / Site */}
                      <td className="py-3.5 px-3">
                        <strong className="text-xs text-[#042C51] block">{e.account}</strong>
                        <span className="text-[10px] text-slate-400">{e.siteLocation}</span>
                      </td>

                      {/* Trainer */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {e.trainerName || "Unassigned"}
                      </td>

                      {/* Milestone Columns (30, 60, 90) */}
                      {columns.map(day => {
                        const rec = getBenchmarkRecord(e, day);

                        if (!rec.eligible) {
                          return (
                            <td key={day} className="py-3.5 px-3" onClick={ev => ev.stopPropagation()}>
                              <div className="p-2 rounded-xl border border-dashed border-slate-200 bg-[#FAFCFF] text-slate-400 space-y-1">
                                <strong className="text-xs font-bold block">Upcoming</strong>
                                <span className="text-[9.5px] block">{dateLabel(rec.end)}</span>
                                <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full" />
                              </div>
                            </td>
                          );
                        }

                        const valid = rec.composite !== null;

                        return (
                          <td key={day} className="py-3.5 px-3" onClick={ev => ev.stopPropagation()}>
                            <div className="p-2.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <strong className="text-sm font-black text-[#042C51]">
                                  {valid ? rec.composite + "%" : "Not scored"}
                                </strong>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${scoreCategoryTone(rec.composite)}`}>
                                  {valid ? (rec.composite! >= 85 ? "High" : rec.composite! >= 70 ? "Developing" : "Needs support") : "Incomplete"}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden">
                                {valid ? (
                                  <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${rec.composite}%` }} />
                                ) : (
                                  <div className="h-full w-full bg-slate-200" style={{ backgroundImage: "repeating-linear-gradient(45deg, #eef2f7, #eef2f7 6px, #e3e9f2 6px, #e3e9f2 12px)" }} />
                                )}
                              </div>

                              {/* Day 30 separate FST/PST sub-splits */}
                              {day === 30 && (
                                <div className="pt-1.5 border-t border-slate-200 space-y-1 text-[10px]">
                                  <div className="flex justify-between font-semibold text-slate-700">
                                    <span>FST assessment</span>
                                    <span className="font-bold text-[#042C51]">{rec.fstScore !== null ? rec.fstScore + "%" : "Not scored"}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-slate-700">
                                    <span>PST assessment</span>
                                    <span className="font-bold text-[#FF5C28]">{rec.pstScore !== null ? rec.pstScore + "%" : "Not scored"}</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-[10px] text-slate-500 pt-0.5">
                                QA {rec.qaScore}% • Att {rec.attRate !== null ? rec.attRate + "%" : "N/A"}
                              </div>
                              <div className="text-[9.5px] font-semibold text-[#042C51]">
                                {rec.reviewStatus}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* Journey Progress */}
                      <td className="py-3.5 px-3">
                        <strong className="text-xs font-bold text-[#042C51] block">Day {daysElapsed} / 90</strong>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">{e.stage}</span>
                        <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-gradient-to-r from-[#042C51] to-[#FF5C28] rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </td>

                      {/* Reviews Due */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pendingReviews ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                        }`}>
                          {pendingReviews ? `${pendingReviews} pending` : "Up to date"}
                        </span>
                      </td>

                      {/* Open Actions */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          openActionsCount ? "sibs-tone-amber-bg sibs-tone-amber-text border sibs-tone-amber-border" : "sibs-tone-green-bg sibs-tone-green-text border sibs-tone-green-border"
                        }`}>
                          {openActionsCount} open
                        </span>
                      </td>

                      {/* Details / Inspection Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={ev => ev.stopPropagation()}>
                        <div className="space-y-1 text-right">
                          <button
                            onClick={() => {
                              setInspectedEmpId(e.sibsEmployeeId || e.id);
                              setInspectedDay(selectedPhaseFilter === "all" ? (daysElapsed >= 90 ? 90 : daysElapsed >= 60 ? 60 : 30) : Number(selectedPhaseFilter));
                            }}
                            className="text-xs font-bold text-[#042C51] hover:text-[#FF5C28] hover:underline block ml-auto transition-colors"
                          >
                            Inspect scores
                          </button>
                          <button
                            onClick={() => setSelectedJourney(e)}
                            className="text-xs font-bold text-[#FF5C28] hover:underline block ml-auto"
                          >
                            View journey →
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
        <div id="benchmark-detail" className="bg-white rounded-2xl border-2 border-[#042C51] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-widest block">TRAINEE CHECKPOINT DRILL-DOWN</span>
              <h2 className="text-lg font-extrabold text-[#042C51]">
                {inspectedJourney.fullName} — Day {inspectedDay}{inspectedDay === 30 ? " (FST + PST)" : ""}
              </h2>
              <p className="text-xs text-slate-500">
                {inspectedJourney.sibsEmployeeId || inspectedJourney.id} • {inspectedJourney.account} • {inspectedJourney.siteLocation} • Trainer {inspectedJourney.trainerName || "Unassigned"}
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
                onClick={() => setSelectedJourney(inspectedJourney)}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Open Employee Journey
              </button>
            </div>
          </div>

          {/* 4 Drilldown KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Phase Performance Score</span>
              <strong className="text-2xl font-black text-[#042C51] my-1 block">
                {inspectedRecord.composite === null ? "N/A" : inspectedRecord.composite + "%"}
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.composite === null ? "Three independent inputs required" : scoreCategoryTone(inspectedRecord.composite)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Trainer / QA / Simulation</span>
              <strong className="text-2xl font-black text-[#042C51] my-1 block">
                {inspectedRecord.trScore}% / {inspectedRecord.qaScore}% / {inspectedRecord.simScore}%
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.gap >= 15 ? "Scoring discrepancy requires review" : "Scores recorded separately by owner"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Attendance / Record Coverage</span>
              <strong className="text-2xl font-black text-[#042C51] my-1 block">
                {inspectedRecord.attRate === null ? "N/A" : inspectedRecord.attRate + "%"}{" "}
                <span className="text-xs font-semibold text-slate-500">({inspectedRecord.coverage ?? 0}% covered)</span>
              </strong>
              <p className="text-[10px] text-slate-500">
                {inspectedRecord.absent} absent • {inspectedRecord.excused} excused • {inspectedRecord.late} late
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC]">
              <span className="text-[10px] text-slate-500 font-bold block">Training Activities</span>
              <strong className="text-2xl font-black text-[#042C51] my-1 block">
                {inspectedRecord.verifiedAssigns} / {inspectedRecord.phaseAssignsCount} verified
              </strong>
              <p className="text-[10px] text-slate-500">
                Owner-verified completion in phase
              </p>
            </div>
          </div>

          {/* Day 30 FST & PST breakdown bars if Day 30 */}
          {inspectedDay === 30 && (
            <div className="p-4 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-2">
              <strong className="text-xs font-bold text-[#042C51] block">First 30 days: FST and PST assessments (separate sample evidence)</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>FST assessment</span>
                    <span className="text-[#042C51]">{inspectedRecord.fstScore !== null ? inspectedRecord.fstScore + "%" : "Not scored"}</span>
                  </div>
                  <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#042C51] rounded-full" style={{ width: `${inspectedRecord.fstScore || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>PST assessment</span>
                    <span className="text-[#FF5C28]">{inspectedRecord.pstScore !== null ? inspectedRecord.pstScore + "%" : "Not scored"}</span>
                  </div>
                  <div className="w-full h-2 bg-[#E6EAF0] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#FF5C28] rounded-full" style={{ width: `${inspectedRecord.pstScore || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence and Checkpoint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 text-xs">
            <div>
              <h3 className="font-extrabold text-[#042C51] mb-2">Phase Evidence</h3>
              <p className="text-[11px] text-slate-500 mb-3">{dateLabel(inspectedRecord.start)} – {dateLabel(inspectedRecord.end)}</p>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Training Assessment</span>
                  <span className="text-slate-600">{inspectedRecord.trScore}% • {inspectedJourney.trainerName || "Trainer"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Independent QA Audit</span>
                  <span className="text-slate-600">{inspectedRecord.qaScore}% • {inspectedJourney.qa || "QA Lead"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Work Simulation</span>
                  <span className="text-slate-600">{inspectedRecord.simScore}% • {inspectedJourney.tl || "Team Leader"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-[#042C51] mb-2">Checkpoint & Development</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">HR Checkpoint</span>
                  <span className="font-bold text-[#042C51]">{inspectedRecord.reviewStatus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Open Coaching Actions</span>
                  <span className="font-bold text-slate-700">
                    {coachingActions.filter(a => (a.emp === inspectedJourney.sibsEmployeeId || a.emp === inspectedJourney.id) && a.status !== "Done").length}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                Attendance is contextual evidence and is not weighted into performance composite. Missing records never count as absences. Final employment decisions remain with HR.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
