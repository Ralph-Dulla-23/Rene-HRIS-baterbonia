import React, { useState, useEffect } from "react";
import { X, CheckCircle2, UserX, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingRecord, ShowStatus, FinalOutcome } from "./types";

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OnboardingRecord | null;
  type: "Show" | "No Show" | "Withdrawn";
  onSaveOutcome: (recordId: string, data: {
    showStatus: ShowStatus;
    finalOutcome: FinalOutcome;
    actualStartDate?: string;
    reasonCategory?: string;
    withdrawalReason?: string;
    experienceRating?: number;
    feedbackTag?: string;
    candidateFeedback?: string;
    remarks?: string;
  }) => void;
}

export default function OutcomeModal({
  isOpen,
  onClose,
  record,
  type,
  onSaveOutcome,
}: OutcomeModalProps) {
  const [actualStartDate, setActualStartDate] = useState("");
  const [reasonCategory, setReasonCategory] = useState("No Response");
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [experienceRating, setExperienceRating] = useState<number>(5);
  const [feedbackTag, setFeedbackTag] = useState(type === "No Show" ? "No Show" : "Pre-start Withdrawal");
  const [candidateFeedback, setCandidateFeedback] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (record) {
      setActualStartDate(record.expectedStartDate || new Date().toISOString().split("T")[0]);
      setRemarks(record.remarks || "");
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedShowStatus: ShowStatus = "Show";
    let resolvedOutcome: FinalOutcome = "True Hire";

    if (type === "Show") {
      resolvedShowStatus = "Show";
      resolvedOutcome = "True Hire";
    } else if (type === "No Show") {
      resolvedShowStatus = "No Show";
      resolvedOutcome = "No Show";
    } else {
      resolvedShowStatus = "Withdrawn";
      resolvedOutcome = "Pre-start Withdrawal";
    }

    onSaveOutcome(record.id, {
      showStatus: resolvedShowStatus,
      finalOutcome: resolvedOutcome,
      actualStartDate: type === "Show" ? actualStartDate : undefined,
      reasonCategory: type !== "Show" ? reasonCategory : undefined,
      withdrawalReason: type !== "Show" ? withdrawalReason : undefined,
      experienceRating: type !== "Show" ? Number(experienceRating) : undefined,
      feedbackTag: type !== "Show" ? feedbackTag : undefined,
      candidateFeedback: type !== "Show" ? candidateFeedback : undefined,
      remarks,
    });

    onClose();
  };

  // Dynamic Theme Colors
  const theme =
    type === "Show"
      ? {
          bgHeader: "bg-emerald-700",
          badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
          title: "Mark as True Hire (Show)",
        }
      : type === "No Show"
      ? {
          bgHeader: "bg-rose-700",
          badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
          btnColor: "bg-rose-600 hover:bg-rose-700 text-white",
          title: "Mark as No Show",
        }
      : {
          bgHeader: "bg-orange-600",
          badgeBg: "bg-orange-100 text-orange-900 border-orange-300",
          btnColor: "bg-orange-600 hover:bg-orange-700 text-white",
          title: "Mark as Pre-start Withdrawal",
        };

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
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] z-10 relative"
          >
            {/* Header */}
            <div className={`px-6 py-4 ${theme.bgHeader} text-white flex items-center justify-between`}>
              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                  Outcome Resolution
                </span>
                <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                  {type === "Show" && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                  {type === "No Show" && <UserX className="w-4 h-4 text-rose-300" />}
                  {type === "Withdrawn" && <AlertTriangle className="w-4 h-4 text-orange-300" />}
                  {theme.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Candidate Summary */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-extrabold text-slate-900">{record.candidateName}</span>
                <span className="text-slate-500 font-medium ml-1">
                  ({record.roleTitle} • {record.account})
                </span>
              </div>

              {/* If Show (True Hire) */}
              {type === "Show" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Actual Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={actualStartDate}
                      onChange={(e) => setActualStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Internal Remarks</label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes regarding candidate start attendance..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                    />
                  </div>
                </div>
              )}

              {/* If No Show or Withdrawn */}
              {type !== "Show" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Reason Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={reasonCategory}
                      onChange={(e) => setReasonCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                      required
                    >
                      <option value="No Response">No Response</option>
                      <option value="Personal Reason">Personal Reason</option>
                      <option value="Schedule">Schedule</option>
                      <option value="Accepted Other Offer">Accepted Other Offer</option>
                      <option value="Location Issue">Location Issue</option>
                      <option value="Incomplete Requirements">Incomplete Requirements</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      {type === "No Show" ? "No Show Reason" : "Withdrawal Reason"} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder={`Explain detailed ${type === "No Show" ? "no show" : "withdrawal"} reason...`}
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">Experience Rating</label>
                      <select
                        value={experienceRating}
                        onChange={(e) => setExperienceRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                      >
                        <option value={5}>5 Excellent</option>
                        <option value={4}>4 Very Good</option>
                        <option value={3}>3 Average</option>
                        <option value={2}>2 Poor</option>
                        <option value={1}>1 Terrible</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">Feedback Tag</label>
                      <input
                        type="text"
                        value={feedbackTag}
                        onChange={(e) => setFeedbackTag(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Candidate Feedback (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Direct feedback comments provided by candidate..."
                      value={candidateFeedback}
                      onChange={(e) => setCandidateFeedback(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Internal Remarks (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Internal notes..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51]"
                    />
                  </div>
                </div>
              )}

              {/* System Action Info Box */}
              <div className="bg-[#042C51]/5 p-3.5 rounded-xl border border-[#042C51]/20 text-xs text-[#042C51] space-y-1">
                <h4 className="font-black uppercase text-[10px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#FF5C28]" /> System Action
                </h4>
                <p className="text-[11px] leading-snug">
                  {type === "Show"
                    ? "Confirming will mark candidate as a True Hire. They will be added to the final placement count."
                    : "Confirming will move the candidate to Drop-offs in the Pipeline and generate a Candidate Experience record."}
                </p>
              </div>

              {/* Footer Controls */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ${theme.btnColor}`}
                >
                  Confirm Outcome
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

