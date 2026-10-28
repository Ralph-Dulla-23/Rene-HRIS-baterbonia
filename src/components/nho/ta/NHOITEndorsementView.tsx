import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHOApplicant } from "../nhoTypes";
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Server, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  ChevronLeft
} from "lucide-react";

interface NHOITEndorsementViewProps {
  onSelectApplicant?: (app: NHOApplicant) => void;
  onBack?: () => void;
  onOpenDetails?: (app: NHOApplicant) => void;
  onOpenAttendance?: (app: NHOApplicant) => void;
}

export default function NHOITEndorsementView({
  onSelectApplicant,
  onBack,
  onOpenDetails,
  onOpenAttendance
}: NHOITEndorsementViewProps) {
  const { applicants, activeApplicant, setSelectedApplicantId, checkITEndorsementEligibility, endorseToIT } = useNHO();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { isEligible, checks } = checkITEndorsementEligibility(activeApplicant);

  const handleConfirmEndorsement = () => {
    endorseToIT(activeApplicant.id);
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Applicant Details Header Card - follows Image 3 style */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-xs sm:p-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white border border-[#E6ECF2] hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to Dashboard"
              aria-label="Back to NHO Dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#042C51]">{activeApplicant.fullName}</h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {activeApplicant.applicantNumber}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeApplicant.outcome === "Withdrawn"
                  ? "bg-red-100 text-red-800"
                  : activeApplicant.outcome === "Completed Handoff"
                    ? "bg-green-100 text-green-800"
                    : activeApplicant.itEndorsed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
              }`}>
                {activeApplicant.itEndorsed ? `IT: ${activeApplicant.itRequestStatus}` : activeApplicant.outcome}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeApplicant.position} • {activeApplicant.department} ({activeApplicant.account})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Applicant Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Applicant:</span>
            <select
              value={activeApplicant.id}
              onChange={e => {
                const found = applicants.find(a => a.id === e.target.value);
                if (found) {
                  setSelectedApplicantId(found.id);
                  if (onSelectApplicant) onSelectApplicant(found);
                }
              }}
              className="px-2.5 py-1.5 bg-white border border-[#BECBDA] rounded-xl text-xs font-bold text-[#042C51] hover:border-[#FF5C28] transition-colors focus:outline-none cursor-pointer"
            >
              {applicants.map(a => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.applicantNumber})
                </option>
              ))}
            </select>
          </div>

          {onOpenAttendance && (
            <button
              onClick={() => onOpenAttendance(activeApplicant)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs cursor-pointer transition-colors"
            >
              Update Attendance / Majors
            </button>
          )}

          {(!activeApplicant.itEndorsed || activeApplicant.itRequestStatus === "Needs Correction") ? (
            <button
              disabled={!isEligible}
              onClick={() => setShowConfirmModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeApplicant.itRequestStatus === "Needs Correction" ? "Re-Endorse to IT" : "Endorse to IT"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dispatched to IT ({activeApplicant.itRequestStatus})</span>
            </div>
          )}

          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(activeApplicant)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#BECBDA] text-[#042C51] hover:bg-[#F7F9FC] font-semibold text-xs cursor-pointer transition-colors"
            >
              Applicant Details
            </button>
          )}
        </div>
      </section>

      {/* 9-Point Mandatory Readiness Checklist */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#042C51] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#FF5C28]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#042C51]">
                Mandatory 9-Point IT Endorsement Criteria
              </h2>
              <span className="text-[11px] text-slate-500">
                Candidate: <strong className="text-[#042C51]">{activeApplicant.fullName}</strong>
              </span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
            isEligible
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}>
            {isEligible ? "All 9 Conditions Satisfied" : "Pending Mandatory Conditions"}
          </span>
        </div>

        {/* 9 Checks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {checks.map((chk, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                chk.passed
                  ? "bg-green-50/60 border-green-200 text-green-950"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div>
                <span className="font-bold text-xs block text-[#042C51]">{chk.label}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {chk.passed ? "Condition Verified" : "Action Required"}
                </span>
              </div>
              {chk.passed ? (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* Non-Major Exemption Highlight */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-950">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Non-Major Requirements Rule (Phase 7):</strong>
            Non-major documents (e.g. TOR / College Diploma, SSS E-1, Pag-IBIG MDF) have a 14-day window following physical NHO clearance and <strong>do not prevent IT Endorsement</strong> if the 9 mandatory conditions above are satisfied.
          </div>
        </div>
      </div>

      {/* Generated ID Creation Request Preview */}
      <div className="bg-white rounded-xl border border-[#E6ECF2] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#042C51]" />
            <h3 className="text-sm font-bold text-[#042C51]">
              Prepared ID Creation Request (Payload for IT Queue)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Status: {activeApplicant.itEndorsed ? activeApplicant.itRequestStatus : "Draft"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Legal Employee Name</span>
            <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.fullName}</span>
            <span className="text-[10px] text-slate-400">(Authoritative HRIS Identity)</span>
          </div>

          <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Username</span>
            <span className="font-bold text-slate-800 text-xs block mt-1 font-mono">
              {activeApplicant.proposedKronosUsername}
            </span>
            <span className="text-[10px] text-slate-400">(IT Permitted Editable)</span>
          </div>

          <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Department</span>
            <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.assignedDepartment}</span>
            <span className="text-[10px] text-slate-400">{activeApplicant.account}</span>
          </div>

          <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#E6ECF2]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical Clearance Date</span>
            <span className="font-bold text-slate-800 text-xs block mt-1">{activeApplicant.clearedDate || "—"}</span>
            <span className="text-[10px] text-slate-400">Venue: {activeApplicant.reportingLocation.split(",")[0]}</span>
          </div>
        </div>

        {/* Terminal status warning */}
        {(activeApplicant.outcome === "Withdrawn" || activeApplicant.outcome === "Drop-Off") && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span><strong>Endorsement Blocked:</strong> Candidate is in a terminal status ({activeApplicant.outcome}). Cannot endorse to IT.</span>
          </div>
        )}

        {/* Endorse Button */}
        <div className="pt-3 flex items-center justify-between border-t border-[#E6ECF2]">
          <span className="text-xs text-slate-500">
            {activeApplicant.itEndorsed && activeApplicant.itRequestStatus !== "Needs Correction"
              ? `Endorsed by ${activeApplicant.itEndorsedBy} on ${activeApplicant.itEndorsedAt}`
              : isEligible
                ? "All 9 mandatory conditions passed. Ready for explicit TA endorsement."
                : "Endorsement locked until all 9 mandatory conditions pass."
            }
          </span>

          {!activeApplicant.itEndorsed || activeApplicant.itRequestStatus === "Needs Correction" ? (
            <button
              disabled={!isEligible}
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-40 disabled:hover:bg-[#FF5C28] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{activeApplicant.itRequestStatus === "Needs Correction" ? "Re-Endorse to IT" : "Endorse to IT"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Dispatched to IT Queue ({activeApplicant.itRequestStatus})</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#042C51]">Confirm IT Endorsement</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              You are about to endorse <strong>{activeApplicant.fullName}</strong> to the IT Queue for Kronos identity creation. All 9 mandatory conditions have been verified.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div><strong>Candidate:</strong> {activeApplicant.fullName}</div>
              <div><strong>Proposed Username:</strong> {activeApplicant.proposedKronosUsername}</div>
              <div><strong>Department:</strong> {activeApplicant.assignedDepartment}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndorsement}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirm & Dispatch to IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
