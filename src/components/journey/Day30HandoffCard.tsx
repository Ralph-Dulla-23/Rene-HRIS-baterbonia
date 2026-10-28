import React, { useState } from "react";
import { useJourney } from "./JourneyContext";
import { EmployeeJourney, Day30TrainerHandoff } from "./journeyTypes";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Edit3, 
  Award,
  Users,
  MapPin,
  Check,
  Send,
  Building2
} from "lucide-react";

interface Day30HandoffCardProps {
  journey: EmployeeJourney;
  onUpdateSuccess?: (message: string) => void;
  compact?: boolean;
}

const AVAILABLE_STRENGTHS = [
  "High Customer Empathy",
  "Quick Systems Navigation",
  "Accurate Dispositioning",
  "Active Listening",
  "Fast Problem Solving",
  "Compliance Adherence",
  "Punctual Attendance",
  "Positive Team Attitude"
];

const AVAILABLE_FOCUS_AREAS = [
  "Average Handle Time (AHT) Pacing",
  "Complex Inquiry Navigation",
  "Multi-tab Software Speed",
  "Edge-case Escalation Protocols",
  "Knowledge Base Search Efficiency",
  "Call De-escalation Confidence"
];

export default function Day30HandoffCard({ 
  journey, 
  onUpdateSuccess,
  compact = false 
}: Day30HandoffCardProps) {
  const { 
    submitTrainerToTlHandoff, 
    acceptTrainerToTlHandoff,
    phaseTrainingScores,
    evidence,
    attendance,
    simulatedCurrentDate
  } = useJourney();

  const currentHandoff = journey.day30Handoff || journey.day30?.handoff;
  const status: "Pending" | "Submitted" | "Accepted" = currentHandoff?.status || "Pending";

  // Phase scores
  const empKey = journey.sibsEmployeeId || journey.id;
  const fstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "FST");
  const pstScoreObj = phaseTrainingScores.find(s => (s.emp === empKey || s.emp === journey.id) && s.phase === "PST");
  const fstVal = currentHandoff?.fstScore ?? fstScoreObj?.score ?? 84;
  const pstVal = currentHandoff?.pstScore ?? pstScoreObj?.score ?? 88;
  
  const qaEvid = evidence.filter(e => (e.emp === empKey || e.emp === journey.id) && e.type === "QDS / QA");
  const qaVal = currentHandoff?.qaScore ?? (journey.id === "SIBS-2906" ? 62 : qaEvid.length ? 88 : 84);
  const attVal = currentHandoff?.attendanceRate ?? 96.5;

  // Local Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [trainerName, setTrainerName] = useState(currentHandoff?.trainerName || journey.trainerName || "Maria Cruz (Senior Trainer)");
  const [targetTlName, setTargetTlName] = useState(currentHandoff?.targetTlName || journey.tl || "Anton Reyes (Team Leader)");
  const [readinessRating, setReadinessRating] = useState<Day30TrainerHandoff["readinessRating"]>(
    currentHandoff?.readinessRating || (qaVal >= 80 ? "Floor Ready" : "Developing with Support")
  );
  const [coreStrengths, setCoreStrengths] = useState<string[]>(
    currentHandoff?.coreStrengths && currentHandoff.coreStrengths.length > 0
      ? currentHandoff.coreStrengths 
      : ["Quick Systems Navigation", "High Customer Empathy", "Accurate Dispositioning"]
  );
  const [focusAreas, setFocusAreas] = useState<string[]>(
    currentHandoff?.focusAreas && currentHandoff.focusAreas.length > 0
      ? currentHandoff.focusAreas 
      : ["Average Handle Time (AHT) Pacing"]
  );
  const [trainerNotes, setTrainerNotes] = useState(
    currentHandoff?.trainerNotes || 
    `${journey.fullName} has successfully concluded Day 1–30 Nesting. Trainee shows strong technical foundation and adherence to standard protocols. Ready for operational transfer with bi-weekly AHT spot checks.`
  );
  const [tlAcceptanceNotes, setTlAcceptanceNotes] = useState(
    currentHandoff?.tlAcceptanceNotes || 
    `Operational custody accepted by ${targetTlName}. Trainee scheduled for live queue ramp and assigned to Pod A supervisor rotation.`
  );

  const toggleStrength = (st: string) => {
    setCoreStrengths(prev => 
      prev.includes(st) ? prev.filter(x => x !== st) : [...prev, st]
    );
  };

  const toggleFocusArea = (fa: string) => {
    setFocusAreas(prev => 
      prev.includes(fa) ? prev.filter(x => x !== fa) : [...prev, fa]
    );
  };

  const handleSubmitHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    submitTrainerToTlHandoff(journey.id, {
      status: "Submitted",
      trainerName,
      targetTlName,
      readinessRating,
      coreStrengths,
      focusAreas,
      fstScore: fstVal,
      pstScore: pstVal,
      qaScore: qaVal,
      attendanceRate: attVal,
      trainerNotes
    });
    setIsFormOpen(false);
    onUpdateSuccess?.(`Day 30 Handoff endorsed by Trainer ${trainerName} to Team Leader ${targetTlName}!`);
  };

  const handleAcceptHandoff = () => {
    acceptTrainerToTlHandoff(journey.id, targetTlName, tlAcceptanceNotes);
    onUpdateSuccess?.(`Day 30 Handoff accepted! Operational custody formally transferred to ${targetTlName}.`);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6ECF2] shadow-xs overflow-hidden transition-all">
      {/* Top Accent Gradient Bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#042C51] via-[#c24b30] to-[#FF5C28]" />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Header with Alert & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6ECF2] pb-3.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#042C51] text-white">
                Day 30 Checkpoint
              </span>
              <h3 className="text-sm sm:text-base font-black text-[#042C51]">
                Employee Custody Handoff: Trainer → Team Leader
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Formal transition of supervisory and operational custody upon completion of Day 1–30 Nesting.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status === "Pending" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-[#FF5C28] border border-orange-200 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Handoff Action Due
              </span>
            )}
            {status === "Submitted" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Awaiting TL Acceptance
              </span>
            )}
            {status === "Accepted" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Custody Transferred
              </span>
            )}
          </div>
        </div>

        {/* Transition Visual Track: Trainer -> Handover -> Team Leader */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-center p-3 sm:p-4 rounded-xl bg-[#F7F9FC] border border-[#E6ECF2]">
          {/* Trainer Card */}
          <div className="md:col-span-3 bg-white p-3 rounded-xl border border-[#E6ECF2] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Departing Supervisor (L&D Nesting)
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Trainer
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-[#042C51] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(currentHandoff?.trainerName || journey.trainerName || "MC").split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <strong className="text-xs font-extrabold text-[#042C51] block truncate">
                  {currentHandoff?.trainerName || journey.trainerName || "Maria Cruz"}
                </strong>
                <span className="text-[10.5px] text-slate-500 block truncate">
                  Assigned Nesting Trainer
                </span>
              </div>
            </div>
            {currentHandoff?.submittedAt && (
              <span className="text-[9.5px] text-emerald-700 font-semibold block pt-1 border-t border-slate-100">
                ✓ Endorsed on {currentHandoff.submittedAt}
              </span>
            )}
          </div>

          {/* Transfer Flow Center Indicator */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
            <div className="w-7 h-7 rounded-full bg-[#FF5C28] text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase text-[#042C51] tracking-wider mt-1 text-center">
              Day 30 Handoff
            </span>
          </div>

          {/* Team Leader Card */}
          <div className="md:col-span-3 bg-white p-3 rounded-xl border border-[#E6ECF2] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Incoming Supervisor (Production Operations)
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Team Leader
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-full bg-[#FF5C28] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(currentHandoff?.targetTlName || journey.tl || "AR").split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <strong className="text-xs font-extrabold text-[#042C51] block truncate">
                  {currentHandoff?.targetTlName || journey.tl || "Anton Reyes"}
                </strong>
                <span className="text-[10.5px] text-slate-500 block truncate">
                  Operations Team Leader • Pod 4
                </span>
              </div>
            </div>
            {currentHandoff?.acceptedAt ? (
              <span className="text-[9.5px] text-emerald-700 font-semibold block pt-1 border-t border-slate-100">
                ✓ Accepted on {currentHandoff.acceptedAt}
              </span>
            ) : (
              <span className="text-[9.5px] text-amber-700 font-semibold block pt-1 border-t border-slate-100">
                ⏳ Pending formal acceptance
              </span>
            )}
          </div>
        </div>

        {/* Nesting Performance Summary at Day 30 */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Nesting Performance & Readiness Evidence (30-Day Checkpoint)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 text-xs">
            <div className="p-2.5 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl text-center">
              <span className="text-[9.5px] font-semibold text-slate-500 block">FST (Fundamentals)</span>
              <strong className="text-base font-black text-[#042C51] block mt-0.5">{fstVal}%</strong>
              <span className="text-[9px] text-slate-400">Days 1–14</span>
            </div>

            <div className="p-2.5 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl text-center">
              <span className="text-[9.5px] font-semibold text-slate-500 block">PST (Product)</span>
              <strong className="text-base font-black text-[#042C51] block mt-0.5">{pstVal}%</strong>
              <span className="text-[9px] text-slate-400">Days 15–28</span>
            </div>

            <div className="p-2.5 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl text-center">
              <span className="text-[9.5px] font-semibold text-slate-500 block">Independent QA</span>
              <strong className="text-base font-black text-[#042C51] block mt-0.5">{qaVal}%</strong>
              <span className="text-[9px] text-slate-400">Audit Evidence</span>
            </div>

            <div className="p-2.5 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl text-center">
              <span className="text-[9.5px] font-semibold text-slate-500 block">14-Day Attendance</span>
              <strong className="text-base font-black text-[#2ECC71] block mt-0.5">{attVal}%</strong>
              <span className="text-[9px] text-slate-400">Punctuality</span>
            </div>

            <div className="p-2.5 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-[9.5px] font-semibold text-slate-500 block">Readiness Rating</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black mt-1 ${
                readinessRating === "Floor Ready" 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : readinessRating === "Developing with Support"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}>
                {currentHandoff?.readinessRating || readinessRating}
              </span>
            </div>
          </div>
        </div>

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              Verified Core Competencies & Strengths
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(currentHandoff?.coreStrengths || coreStrengths).map(st => (
                <span key={st} className="px-2 py-0.5 bg-white border border-[#BECBDA] text-[#042C51] font-semibold text-[10.5px] rounded-lg">
                  {st}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Ramp Transition Focus Areas (For Team Leader)
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(currentHandoff?.focusAreas || focusAreas).map(fa => (
                <span key={fa} className="px-2 py-0.5 bg-white border border-amber-200 text-amber-900 font-semibold text-[10.5px] rounded-lg">
                  {fa}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Notes from Trainer & Team Leader */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#F7F9FC] border border-[#E6ECF2] rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-[#042C51] font-extrabold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#042C51]" />
                Trainer Endorsement & Handover Remarks
              </strong>
              <span className="text-[10px] text-slate-400">By {currentHandoff?.trainerName || journey.trainerName || "Trainer"}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px] italic">
              "{currentHandoff?.trainerNotes || trainerNotes}"
            </p>
          </div>

          {currentHandoff?.tlAcceptanceNotes && (
            <div className="p-3 bg-[#F0FDF4] border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-900 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Team Leader Operational Acceptance Confirmation
                </strong>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {currentHandoff.acceptedBy || targetTlName} • {currentHandoff.acceptedAt}
                </span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11.5px]">
                "{currentHandoff.tlAcceptanceNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Workstation & Station Allocation */}
        <div className="p-3 bg-[#FAFCFF] border border-[#E6ECF2] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#042C51] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-[#042C51]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Workstation Allocation</span>
              <div className="font-extrabold text-[#042C51] text-xs">
                {journey.wfmSeating ? `${journey.wfmSeating.wing} • ${journey.wfmSeating.seatNumber}` : "Main Operations Floor • Pod 4 Station"}
              </div>
            </div>
          </div>
          <span className="text-[10.5px] font-semibold text-slate-500 bg-white border border-[#E6ECF2] px-2.5 py-1 rounded-lg">
            Account: <strong className="text-[#042C51]">{journey.account}</strong> • Site: <strong className="text-[#042C51]">{journey.siteLocation}</strong>
          </span>
        </div>

        {/* Action Controls & Interactive Modals */}
        <div className="border-t border-[#E6ECF2] pt-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 font-medium">
            {status === "Pending" && (
              <span className="text-[#FF5C28] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Action required: Trainer must endorse readiness to initiate TL transition.
              </span>
            )}
            {status === "Submitted" && (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Action required: Team Leader must accept operational custody to conclude handoff.
              </span>
            )}
            {status === "Accepted" && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Handoff cycle finalized. Trainee is under active operational ramp.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status === "Pending" && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Endorse & Submit Handoff to TL</span>
              </button>
            )}

            {status === "Submitted" && (
              <>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  Edit Endorsement
                </button>
                <button
                  type="button"
                  onClick={handleAcceptHandoff}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Accept Handoff as TL ({targetTlName})</span>
                </button>
              </>
            )}

            {status === "Accepted" && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Amend Handoff Notes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Form Modal for Endorsing / Amending Handoff */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-[#E6ECF2] my-auto">
            <div className="flex items-center justify-between border-b border-[#E6ECF2] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28] block">
                  Trainer Endorsement Form
                </span>
                <h3 className="text-base font-extrabold text-[#042C51]">
                  Day 30 Handoff: {journey.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHandoff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Assigned Trainer</label>
                  <input
                    type="text"
                    value={trainerName}
                    onChange={e => setTrainerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs outline-none focus:border-[#FF5C28]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#042C51] mb-1">Target Team Leader (TL)</label>
                  <input
                    type="text"
                    value={targetTlName}
                    onChange={e => setTargetTlName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs outline-none focus:border-[#FF5C28]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">Overall Operational Readiness Rating</label>
                <select
                  value={readinessRating}
                  onChange={e => setReadinessRating(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs outline-none focus:border-[#FF5C28] bg-white"
                >
                  <option value="Floor Ready">Floor Ready (Fully endorsed for production queue)</option>
                  <option value="Developing with Support">Developing with Support (Requires bi-weekly spot checks)</option>
                  <option value="Conditional Ramp">Conditional Ramp (Paired buddy nesting required)</option>
                  <option value="At Risk">At Risk (Action plan required)</option>
                </select>
              </div>

              {/* Strengths Selector */}
              <div>
                <label className="block font-bold text-[#042C51] mb-1.5">
                  Observed Core Strengths (Click to select/unselect)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_STRENGTHS.map(st => {
                    const selected = coreStrengths.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStrength(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                          selected
                            ? "bg-[#042C51] text-white shadow-2xs"
                            : "bg-[#F7F9FC] border border-[#BECBDA] text-slate-600 hover:border-[#042C51]"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}{st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Areas Selector */}
              <div>
                <label className="block font-bold text-[#042C51] mb-1.5">
                  Transition Focus Areas for Team Leader
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_FOCUS_AREAS.map(fa => {
                    const selected = focusAreas.includes(fa);
                    return (
                      <button
                        key={fa}
                        type="button"
                        onClick={() => toggleFocusArea(fa)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                          selected
                            ? "bg-[#FF5C28] text-white shadow-2xs"
                            : "bg-[#F7F9FC] border border-[#BECBDA] text-slate-600 hover:border-[#FF5C28]"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}{fa}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#042C51] mb-1">
                  Trainer's Transition Notes & Recommendations for TL
                </label>
                <textarea
                  value={trainerNotes}
                  onChange={e => setTrainerNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs text-[#042C51] outline-none focus:border-[#FF5C28] leading-relaxed"
                  placeholder="Detail agent strengths, handling habits, and specific guidance for the incoming supervisor."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF2]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#BECBDA] text-[#042C51] font-semibold text-xs hover:bg-[#F7F9FC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Endorse & Save Handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
