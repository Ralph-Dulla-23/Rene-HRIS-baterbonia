import React from "react";
import { X, User, CheckCircle2, Clock, CalendarDays, AlertTriangle, Info, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingRecord } from "./types";

interface OnboardingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OnboardingRecord | null;
  onOpenOutcomeModal: (type: "Show" | "No Show" | "Withdrawn") => void;
}

export default function OnboardingDetailsModal({
  isOpen,
  onClose,
  record,
  onOpenOutcomeModal,
}: OnboardingDetailsModalProps) {
  if (!record) return null;

  // Compute Days to Start
  const startMs = new Date(record.expectedStartDate).getTime();
  const acceptMs = new Date(record.acceptedOfferDate).getTime();
  const daysToStart = Math.max(0, Math.ceil((startMs - acceptMs) / (1000 * 3600 * 24)));

  const isFinalOutcomeLocked = record.finalOutcome !== "Pending Start" && record.finalOutcome !== ("Pending" as any);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] z-10 relative"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#042C51] text-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Onboarding Details — {record.onboardingId || record.id}
                </h2>
                <p className="text-[11px] text-slate-300">
                  Detailed candidate onboarding profile, timeline, and outcome governance.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body - Two Column Layout */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-5">
                {/* Candidate Info Card */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h3 className="text-lg font-black text-[#042C51]">{record.candidateName}</h3>
                      <p className="text-xs font-bold text-slate-600">{record.candidateEmail}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {record.showStatus}
                      </span>
                      <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-[#042C51] text-white">
                        {record.finalOutcome}
                      </span>
                    </div>
                  </div>

                  {/* Expected Start Date Highlight Box */}
                  <div className="bg-[#042C51] text-white p-4 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#FF5C28]/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-2.5 bg-[#FF5C28]/20 rounded-xl border border-[#FF5C28]/30">
                        <CalendarDays className="w-5 h-5 text-[#FF5C28]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-300">Expected Start Date</p>
                        <p className="text-base font-black font-mono">{record.expectedStartDate}</p>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-[10px] uppercase font-bold text-slate-300">Days to Start</p>
                      <p className="text-base font-black font-mono text-[#FF5C28]">{daysToStart} Days</p>
                    </div>
                  </div>
                </div>

                {/* Onboarding Timeline Card (3-step visual timeline) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FF5C28]" />
                    Onboarding Lifecycle Timeline
                  </h4>

                  <div className="space-y-4 pl-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {/* Step 1: Offer Accepted */}
                    <div className="relative pl-7 space-y-0.5">
                      <span className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                      <p className="text-xs font-black text-blue-950">Step 1 — Offer Accepted</p>
                      <p className="text-[11px] text-slate-500 font-mono font-semibold">{record.acceptedOfferDate}</p>
                    </div>

                    {/* Step 2: Expected Start Date */}
                    <div className="relative pl-7 space-y-0.5">
                      <span className="absolute left-1.5 top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100" />
                      <p className="text-xs font-black text-amber-950">Step 2 — Expected Start Date</p>
                      <p className="text-[11px] text-slate-500 font-mono font-semibold">{record.expectedStartDate}</p>
                    </div>

                    {/* Step 3: Final Start Outcome */}
                    <div className="relative pl-7 space-y-1">
                      <span
                        className={`absolute left-1.5 top-0.5 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                          record.finalOutcome === "True Hire"
                            ? "bg-emerald-600 ring-emerald-100"
                            : record.finalOutcome === "No Show"
                            ? "bg-rose-600 ring-rose-100"
                            : record.finalOutcome === "Pre-start Withdrawal"
                            ? "bg-orange-600 ring-orange-100"
                            : "bg-slate-400 ring-slate-100"
                        }`}
                      />
                      <p className="text-xs font-black text-slate-900">Step 3 — Final Start Outcome</p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {record.actualStartDate ? `Actual Start: ${record.actualStartDate}` : `Outcome: ${record.finalOutcome}`}
                      </p>

                      {(record.showStatus === "No Show" || record.showStatus === "Withdrawn") && (
                        <div className="mt-2 bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Withdrawal / Drop-off Reason:
                          </p>
                          <p className="text-xs font-medium">{record.withdrawalReason || "No specific reason logged."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Experience Data Card (only shown when No Show or Withdrawn) */}
                {(record.showStatus === "No Show" || record.showStatus === "Withdrawn") && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                      Candidate Experience Data
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 block">Reason Category</span>
                        <span className="font-bold text-slate-900">{record.reasonCategory || record.withdrawalReason || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 block">Experience Rating</span>
                        <span className="font-bold text-slate-900">{record.experienceRating || 3} / 5</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remarks Card */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Internal Remarks</h4>
                  <p className="text-xs font-medium text-slate-700 italic">
                    "{record.remarks || "No internal notes recorded for this onboarding candidate."}"
                  </p>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                {/* Onboarding Summary Detail Rows */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-black uppercase text-[10px] text-slate-500 tracking-wider">
                    Onboarding Summary
                  </h4>

                  <div className="space-y-2 text-slate-700 divide-y divide-slate-200/80">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Onboarding ID:</span>
                      <span className="font-mono font-bold text-[#042C51]">{record.onboardingId || record.id}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Offer ID:</span>
                      <span className="font-mono font-semibold">{record.offerId || "OFF-2026-001"}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Role:</span>
                      <span className="font-bold text-slate-900 text-right">{record.roleTitle}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Account:</span>
                      <span className="font-bold text-slate-900">{record.account}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-bold text-slate-900">{record.location}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Accepted Date:</span>
                      <span className="font-mono font-bold">{record.acceptedOfferDate}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Expected Start:</span>
                      <span className="font-mono font-bold text-slate-900">{record.expectedStartDate}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Actual Start:</span>
                      <span className="font-mono font-bold text-emerald-700">{record.actualStartDate || "—"}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Days to Start:</span>
                      <span className="font-bold text-slate-900">{daysToStart} days</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Owner:</span>
                      <span className="font-bold text-slate-900">{record.owner}</span>
                    </div>
                  </div>
                </div>

                {/* Update Outcome Action Buttons (only shown when finalOutcome is not yet final) */}
                {!isFinalOutcomeLocked && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-2xs">
                    <h4 className="font-black uppercase text-[10px] text-slate-500 tracking-wider">
                      Update Outcome
                    </h4>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onOpenOutcomeModal("Show")}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        Mark as Show (True Hire)
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenOutcomeModal("No Show")}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Mark as No Show
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenOutcomeModal("Withdrawn")}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Mark as Withdrawn
                      </button>
                    </div>
                  </div>
                )}

                {/* Onboarding Rule info box */}
                <div className="bg-[#042C51]/5 p-3.5 rounded-2xl border border-[#042C51]/20 text-xs text-[#042C51] space-y-1">
                  <h4 className="font-black uppercase text-[10px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FF5C28]" /> Onboarding Governance
                  </h4>
                  <p className="text-[11px] leading-relaxed font-medium">
                    Only Show outcome registers as a True Hire and increments filled count.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#042C51] hover:bg-[#FF5C28] text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

