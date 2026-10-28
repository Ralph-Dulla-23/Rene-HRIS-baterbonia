import { useDemoAuth } from "../../auth/DemoAuthContext";
import React, { useState } from "react";
import { useNHO } from "./NHOContext";
import { NHORole } from "./nhoTypes";
import { 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  Info
} from "lucide-react";

interface NHORoleHeaderProps {
  onOpenWalkthrough: () => void;
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
  sectionHeader: { badge: string; title: string; description: string };
}

export default function NHORoleHeader({ onOpenWalkthrough, subTab, onSubTabChange, sectionHeader }: NHORoleHeaderProps) {
  const {user} = useDemoAuth();
  const isAdminPreview = user?.role === 'Super Admin';
  const { 
    role, 
    selectedApplicantId, 
    setSelectedApplicantId, 
    applicants, 
    activeApplicant, 
    resetDemoData,
    simulatedCurrentDate,
    setSimulatedCurrentDate,
    toast
  } = useNHO();

  // Workflow pipeline role sequence for QDS -> Trainer -> WFM handoff (QDS and Trainer hidden from UI)
  const rolesList: { id: NHORole; label: string; hidden?: boolean }[] = [
    { id: "TA", label: "Talent Acquisition (TA)" },
    { id: "Applicant", label: "Applicant Portal" },
    { id: "IT", label: "IT Operations" },
    { id: "QDS", label: "QDS", hidden: true },
    { id: "Trainer", label: "Trainer", hidden: true },
    { id: "WFM", label: "Workforce Planning (WFM)" },
    { id: "HR", label: "HR Operations" }
  ];

  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="relative z-20 px-4 pt-4 sm:px-6">
      {/* Preserve workflow notifications while adopting the standard HRIS page chrome. */}
      {toast && (
        <div role="status" className={`mb-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
          toast.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
        }`}>
          {toast.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : toast.type === "error" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Same accent header, title hierarchy, and white surface as Employee Directory. */}
      <section className="overflow-visible rounded-xl border border-[#E6ECF2] bg-white shadow-sm">
        <div className="h-[3.5px] rounded-t-xl bg-gradient-to-r from-[#042C51] via-[#C24B30] to-[#FF5C28]" />
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="min-w-0">
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#042C51]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
              {sectionHeader.badge}
            </span>
            <h1 className="text-xl font-black tracking-tight text-[#042C51]">{sectionHeader.title}</h1>
            <p className="mt-1 text-xs font-medium text-slate-500">{sectionHeader.description}</p>
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#E6ECF2] bg-white px-3 py-2 text-xs text-[#042C51]">
              <span className="font-medium text-slate-500">Demo date</span>
              <input
                type="date"
                value={simulatedCurrentDate}
                onChange={e => setSimulatedCurrentDate(e.target.value)}
                className="max-w-[135px] bg-transparent font-semibold text-[#042C51] outline-none cursor-pointer"
                aria-label="Simulated NHO date (Asia/Manila)"
                title="Simulated date (Asia/Manila) to test notice periods and deadlines"
              />
            </label>
                      {/* Quick Scenario Selector */}
          <div className="relative">
            <button
              type="button"
              aria-label="Select NHO demo scenario"
              aria-haspopup="listbox"
              aria-expanded={isScenarioDropdownOpen}
              onClick={() => setIsScenarioDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-[#E6ECF2] bg-white px-3 py-2 text-xs font-semibold text-[#042C51] transition-colors hover:border-[#FF5C28] cursor-pointer"
            >
              <span>Scenario: <strong className="text-[#FF5C28]">{activeApplicant.fullName.split(" ")[0]}</strong></span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isScenarioDropdownOpen && (
              <div role="listbox" aria-label="NHO demo candidates" className="absolute right-0 top-full mt-1.5 w-80 max-w-[90vw] bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 z-50 py-2 divide-y divide-slate-100 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Test Scenario Candidate
                </div>
                {applicants.map((cand, idx) => (
                  <button
                    key={cand.id}
                    type="button"
                    role="option"
                    aria-selected={cand.id === selectedApplicantId}
                    onClick={() => {
                      setSelectedApplicantId(cand.id);
                      setIsScenarioDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                      cand.id === selectedApplicantId ? "bg-orange-50/70 font-semibold" : ""
                    }`}
                  >
                    <div>
                      <div className="text-[#042C51] font-bold">
                        {idx + 1}. {cand.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {idx === 0 && "Ready for IT Endorsement (TOR Pending)"}
                        {idx === 1 && "Missing Major Medical (Reschedule Needed)"}
                        {idx === 2 && "No Show (Needs Phone Follow-Up)"}
                        {idx === 3 && "Orientation & Agreements Pending"}
                        {idx === 4 && "IT Completed → HR Handoff Pending"}
                        {idx === 5 && "Outstanding Overdue Document (Past 14 Days)"}
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      cand.attendance === "Show" ? "bg-green-100 text-green-800" : cand.attendance === "No Show" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {cand.attendance === "Pending" ? "Scheduled" : cand.attendance}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>


            {isAdminPreview && (
              <button type="button" onClick={onOpenWalkthrough} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6ECF2] bg-white px-3 py-2 text-xs font-semibold text-[#042C51] transition-colors hover:border-[#FF5C28]">
                <Sparkles className="h-3.5 w-3.5 text-[#FF5C28]" />
                Walkthrough
              </button>
            )}
            {isAdminPreview && (
              <button type="button" onClick={() => setShowResetConfirm(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50" title="Reset demonstration records">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset demo
              </button>
            )}
          </div>
        </div>
        {subTab && onSubTabChange && (
          <nav aria-label="New Hire Orientation sections" className="nho-tabs flex min-w-0 gap-3 overflow-x-auto border-t border-[#E6ECF2] px-4 sm:px-5">
            {(role === "TA"
          ? [
              { id: "dashboard", label: "NHO Dashboard" },
              { id: "attendance", label: "NHO Attendance" },
              { id: "applicant-details", label: "Applicant Details" },
              { id: "doc-verification", label: "Document Verification" },
              { id: "it-endorsements", label: "IT Endorsements" },
              { id: "handoffs", label: "NHO Handoffs" }
            ]
          : role === "Applicant"
            ? [
                { id: "overview", label: "My NHO Overview" },
                { id: "majors", label: "Major Requirements (4)" },
                { id: "orientation", label: "SiBS Orientation" },
                { id: "agreements", label: "Essential Agreements (3)" },
                { id: "requirements", label: "Non-Major Requirements" },
                { id: "profile", label: "Personal Information" },
                { id: "login-sim", label: "Temporary Access Demo" }
              ]
            : role === "IT"
              ? [
                  { id: "queue", label: "ID Creation Requests" },
                  { id: "details", label: "Request Details & Editing" },
                  { id: "provisioning", label: "Manual Kronos Provisioning" }
                ]
              : role === "WFM"
                ? [
                    { id: "queue", label: "Production Seating Queue" },
                    { id: "assignment", label: "Seat Assignment Form" }
                  ]
                : [
                    { id: "handoffs", label: "NHO Handoffs" },
                    { id: "review", label: "Handoff Review & Acceptance" },
                    { id: "pending-reqs", label: "Pending Requirements (14-Day)" }
                  ]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            aria-current={subTab === tab.id ? "page" : undefined}
            className={`shrink-0 border-b-2 px-2.5 py-3 text-xs font-bold transition-colors ${
              subTab === tab.id
                ? "border-[#FF5C28] text-[#FF5C28]"
                : "border-transparent text-slate-500 hover:text-[#042C51]"
            }`}
          >
            {tab.label}
          </button>
        ))}
          </nav>
        )}
      </section>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#042C51]">Confirm Demo Reset</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will reset all 6 simulated candidate states, signatures, attendance records, Kronos IDs, and HR handoffs back to the initial demo scenario states.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
              >
                Yes, Reset All Scenarios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
