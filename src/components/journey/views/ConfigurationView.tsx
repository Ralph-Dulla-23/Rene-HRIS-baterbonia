import React, { useState } from "react";
import { useJourney } from "../JourneyContext";
import { 
  Settings, 
  RotateCcw, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Database, 
  Layers, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

interface ConfigurationViewProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function ConfigurationView({ onSwitchModule }: ConfigurationViewProps) {
  const { 
    simulatedCurrentDate, 
    setSimulatedCurrentDate, 
    resetJourneysToDefault
  } = useJourney();

  const [dateInput, setDateInput] = useState(simulatedCurrentDate);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateDate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedCurrentDate(dateInput);
    setToastMessage(`Simulated system date set to ${dateInput}! Milestone timelines updated.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm("CONFIRM DEMO RESET: Are you sure you want to reset all 30/60/90 Employee Journey data to pristine baseline state?")) {
      resetJourneysToDefault();
      setDateInput("2026-10-14");
      setToastMessage("All Journey state, materials, assessments, and audit logs have been reset to default baseline.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const roleOwnership = [
    ["Trainer", "Primary Days 1–14: training logs, readiness verification, first handoff request."],
    ["QDS / QA", "Independent scored QA audits, evidence sampling and quality rechecks; cannot edit Trainer assessments."],
    ["QDS Manager", "Cross-trainer and trainee oversight, comparative performance, QA verification and follow-up requests; no HR milestone approvals."],
    ["Team Leader", "Accept trainee handoff; own day-to-day work, check-ins, coaching plans, corrective actions."],
    ["Manager", "Own Day 30 / 60 / 90 performance decisions and operational support goals."],
    ["HR Coordinator", "Coordinate evidence; confirm Day 30 / 60 manager reviews; chase overdue approvals."],
    ["Employee", "View own journey and released evidence; submit experience check-ins and acknowledge Day 90 review."],
    ["HR Process Owner", "Finalize Day 90 onboarding outcome and route continuing support to PMS / HR."],
    ["HR Admin", "Configure templates, milestones, alerts and permission assignments; cross-organization governance."]
  ];

  const apiEndpoints = [
    "GET /api/employee-journeys",
    "GET /api/employee-journeys/:id",
    "POST /api/employee-journeys/:id/evidence",
    "GET /api/employee-journeys/performance/cohorts",
    "GET /api/employee-journeys/performance/trainers",
    "POST /api/employee-journeys/:id/performance-scores",
    "POST /api/employee-journeys/:id/qds-followups",
    "POST /api/employee-journeys/:id/check-ins",
    "POST /api/employee-journeys/:id/actions",
    "POST /api/employee-journeys/:id/reviews/:day",
    "POST /api/employee-journeys/:id/reviews/:day/confirm",
    "POST /api/employee-journeys/:id/handoffs",
    "POST /api/employee-journeys/:id/final-disposition"
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner (aligned to SiBS HRIS Deep Navy theme) */}
      <div className="bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#13406D] text-white p-6 rounded-2xl shadow-xs border border-[#13406D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5C28]">
            SYSTEM SPECIFICATION & TESTING CONTROLS
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 mb-2 tracking-tight">
            Journey Configuration
          </h1>
          <p className="text-xs text-[#E6EAF0] max-w-2xl leading-relaxed">
            Role ownership specifications, proposed HRIS API endpoints, compliance rules, and time-travel testing controls.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-[#E74C3C] hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Baseline</span>
          </button>

          {onSwitchModule && (
            <button
              type="button"
              onClick={() => onSwitchModule("New Hire Orientation (NHO)")}
              className="px-3.5 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Layers className="w-4 h-4 text-[#FF5C28]" />
              <span>Back to NHO</span>
            </button>
          )}
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

      {/* Time-Travel Demo Testing Controls */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-[#042C51]">Time-Travel Testing Controller</h2>
          <p className="text-xs text-slate-500">Change simulated current date to evaluate Day 30, Day 60, and Day 90 milestone evaluation rules.</p>
        </div>

        <form onSubmit={handleUpdateDate} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-bold text-[#042C51] mb-1">Simulated System Date</label>
            <input 
              type="date"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#BECBDA] text-xs font-bold text-[#042C51] outline-none focus:border-[#FF5C28]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Apply Simulated Date
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            { label: "Baseline (Oct 14)", date: "2026-10-14" },
            { label: "Day 30 (Nov 5)", date: "2026-11-05" },
            { label: "Day 60 (Dec 5)", date: "2026-12-05" },
            { label: "Day 90+ (Jan 15)", date: "2027-01-15" }
          ].map(p => (
            <button
              key={p.date}
              type="button"
              onClick={() => {
                setDateInput(p.date);
                setSimulatedCurrentDate(p.date);
                setToastMessage(`Simulated date jumped to ${p.label}!`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="p-2.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] hover:bg-white hover:border-[#BECBDA] text-left transition-all cursor-pointer shadow-xs"
            >
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Preset</span>
              <strong className="text-xs font-bold text-[#042C51] block mt-0.5">{p.label}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Role Ownership Specification */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-[#042C51]">Role Ownership & Security Architecture</h2>
          <p className="text-xs text-slate-500">Access rules for trainers, QDS, team leaders, and HR administrators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {roleOwnership.map(([role, desc], idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#FF5C28]">{role}</span>
              <p className="text-[#042C51] font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proposed HRIS API Endpoints */}
      <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-[#042C51]">Proposed SiBS HRIS Integration Endpoints</h2>
          <p className="text-xs text-slate-500">Backend service contracts for persistent Employee Journey storage and multi-role operations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {apiEndpoints.map((ep, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] text-[#042C51]">
              {ep}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
