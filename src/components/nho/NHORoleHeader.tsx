import { useDemoAuth } from "../../auth/DemoAuthContext";
import React, { useState } from "react";
import { useNHO } from "./NHOContext";
import { NHORole } from "./nhoTypes";
import { 
  Users, 
  UserCheck, 
  Server, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  Info,
  Smartphone,
  Monitor,
  MapPin,
  GraduationCap,
  BookOpenCheck
} from "lucide-react";

interface NHORoleHeaderProps {
  onOpenWalkthrough: () => void;
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export default function NHORoleHeader({ onOpenWalkthrough, subTab, onSubTabChange }: NHORoleHeaderProps) {
  const {user} = useDemoAuth();
  const isAdminPreview = user?.role === 'Super Admin';
  const { 
    role, 
    setRole, 
    selectedApplicantId, 
    setSelectedApplicantId, 
    applicants, 
    activeApplicant, 
    resetDemoData,
    simulatedCurrentDate,
    setSimulatedCurrentDate,
    toast
  } = useNHO();

  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const rolesList: { id: NHORole; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    { 
      id: "TA", 
      label: "Talent Acquisition (TA)", 
      icon: Users,
      description: "Attendance, Uploaded Majors Verification, Agreement Verification, IT Endorsements" 
    },
    { 
      id: "Applicant", 
      label: "Applicant Portal", 
      icon: UserCheck,
      description: "Temp Access, Orientation Slides & Quiz, E-Signing Agreements, Doc Uploads" 
    },
    { 
      id: "IT", 
      label: "IT Manager", 
      icon: Server,
      description: "ID Creation Queue, Permitted Field Edits, Manual Kronos ID Provisioning" 
    },
    { 
      id: "QDS", 
      label: "QDS", 
      icon: BookOpenCheck,
      description: "Assign Trainer & Training Materials Package, Dispatch to Trainer (Quality Dev)" 
    },
    { 
      id: "Trainer", 
      label: "Trainer", 
      icon: GraduationCap,
      description: "Review Assigned Materials & Accept Trainee Responsibility (L&D / Ops)" 
    },
    { 
      id: "WFM", 
      label: "Workforce Management (WFM)", 
      icon: MapPin,
      description: "Production Floor Wing & Workstation Assignment (admin_access = 9)" 
    },
    { 
      id: "HR", 
      label: "HR Operations", 
      icon: ShieldCheck,
      description: "NHO Handoff Acceptance / Return, 14-Day Non-Major Oversight" 
    }
  ];

  return (
    <div className="bg-white border-b border-[#E6ECF2] shadow-xs sticky top-16 z-20">
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
            toast.type === "success" 
              ? "bg-[#2ECC71]/15 text-[#1b7a42] border-b border-[#2ECC71]/30" 
              : toast.type === "error"
                ? "bg-[#E74C3C]/15 text-[#a82415] border-b border-[#E74C3C]/30"
                : "bg-[#4B9DFE]/15 text-[#1a5fb4] border-b border-[#4B9DFE]/30"
          }`}
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-[#2ECC71] shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-[#E74C3C] shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-[#4B9DFE] shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Banner: Master Mode & Quick Walkthrough bar */}
      <div className="bg-[#042C51] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase bg-[#FF5C28] text-white">
            NHO V1 Prototype
          </span>
          <span className="font-semibold text-slate-200 hidden sm:inline">
            SiBS 360 HRIS: New Hire Orientation Interactive Wireframe
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controllable Demo Date Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B365F] px-2.5 py-1 rounded-lg border border-[#1A4C7B] text-[11px]">
            <span className="text-slate-300 font-medium hidden md:inline">Simulated Date (Asia/Manila):</span>
            <input
              type="date"
              value={simulatedCurrentDate}
              onChange={e => setSimulatedCurrentDate(e.target.value)}
              className="bg-transparent text-white font-bold font-mono focus:outline-none cursor-pointer"
              title="Change simulated date to test overdue deadlines or notice periods"
            />
          </div>

          {/* Walkthrough Guide Button */}
          {isAdminPreview && <button
            onClick={onOpenWalkthrough}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#13406D] hover:bg-[#1A4C7B] text-[#FAFCFF] font-semibold transition-colors cursor-pointer text-xs"
            title="Step-by-step interactive walkthrough guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>Interactive Walkthrough (Steps 1–16)</span>
          </button>}

          {/* Quick Scenario Selector */}
          <div className="relative">
            <button
              onClick={() => setIsScenarioDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B365F] hover:bg-[#13406D] text-slate-200 font-medium transition-colors cursor-pointer text-xs border border-[#1A4C7B]"
            >
              <span>Scenario: <strong className="text-white">{activeApplicant.fullName.split(" ")[0]}</strong></span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isScenarioDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 z-50 py-2 divide-y divide-slate-100 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Test Scenario Candidate
                </div>
                {applicants.map((cand, idx) => (
                  <button
                    key={cand.id}
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

          {/* Demo Reset Button */}
          {isAdminPreview && <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 font-semibold transition-colors cursor-pointer text-xs border border-red-800/50"
            title="Reset all applicant states to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>}
        </div>
      </div>

      {/* Role Switcher Toolbar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden lg:inline">
            Active Role:
          </span>
          {/* Visible roles in NHO interface (QDS and Trainer are managed in the separate QDS application) */}
          {(isAdminPreview ? rolesList : rolesList.filter(r=>r.id===role)).map(r => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {if(isAdminPreview) setRole(r.id);}}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#042C51] text-white shadow-xs"
                    : "bg-[#F7F9FC] text-slate-600 hover:text-[#042C51] hover:bg-slate-100 border border-[#E6ECF2]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF5C28]" : "text-slate-400"}`} />
                <span>{r.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]" />
                )}
              </button>
            );
          })}

        </div>

        {/* Current Applicant Preview & Simulated Profile Pill */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="bg-[#F7F9FC] border border-[#E6ECF2] px-3 py-1 rounded-lg flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Active Applicant:</span>
            <span className="font-bold text-[#042C51]">{activeApplicant.fullName}</span>
            <span className="text-[10px] text-slate-400">({activeApplicant.applicantNumber})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeApplicant.attendance === "Show"
                ? "bg-green-100 text-green-800"
                : activeApplicant.attendance === "No Show"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
            }`}>
              {activeApplicant.attendance === "Show" ? "Attendance: Show" : `Attendance: ${activeApplicant.attendance}`}
            </span>
          </div>
        </div>
      </div>

      {/* Role-Specific Sub-Navigation Bar */}
      {subTab && onSubTabChange && (
        <div className="px-4 py-1.5 bg-[#FAFCFF] border-t border-[#E6ECF2] flex items-center gap-2 overflow-x-auto text-xs">
          {role === "TA" && (
            <>
              {[
                { id: "dashboard", label: "1. NHO Dashboard" },
                { id: "attendance", label: "2. NHO Attendance" },
                { id: "applicant-details", label: "3. Applicant NHO Details" },
                { id: "doc-verification", label: "4. Document Verification" },
                { id: "it-endorsements", label: "5. IT Endorsements" },
                { id: "handoffs", label: "6. NHO Handoffs" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "Applicant" && (
            <>
              {[
                { id: "overview", label: "1. My NHO Overview" },
                { id: "majors", label: "2. Major Requirements (4)" },
                { id: "orientation", label: "3. SiBS Orientation" },
                { id: "agreements", label: "4. Essential Agreements (3)" },
                { id: "requirements", label: "5. Non-Major Requirements" },
                { id: "profile", label: "6. Personal Information" },
                { id: "login-sim", label: "Auth & Temporary Access Demo" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "IT" && (
            <>
              {[
                { id: "queue", label: "1. ID Creation Requests" },
                { id: "details", label: "2. Request Details & Editing" },
                { id: "provisioning", label: "3. Manual Kronos Provisioning" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "Trainer" && (
            <>
              {[
                { id: "queue", label: "1. Trainee Assignment Queue" },
                { id: "acceptance", label: "2. Trainee Acceptance Form" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "QDS" && (
            <>
              {[
                { id: "queue", label: "1. Training Materials Queue" },
                { id: "materials", label: "2. Assign & Finalize Materials" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "WFM" && (
            <>
              {[
                { id: "queue", label: "1. Production Seating Queue" },
                { id: "assignment", label: "2. Seat Assignment Form" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}

          {role === "HR" && (
            <>
              {[
                { id: "handoffs", label: "1. NHO Handoffs" },
                { id: "review", label: "2. Handoff Review & Acceptance" },
                { id: "pending-reqs", label: "3. Pending Requirements (14-Day)" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onSubTabChange(t.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
                    subTab === t.id
                      ? "bg-[#FF5C28] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#042C51] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}

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
