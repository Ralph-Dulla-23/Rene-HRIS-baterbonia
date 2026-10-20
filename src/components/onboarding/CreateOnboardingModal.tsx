import React, { useState } from "react";
import { X, UserPlus, Info, CheckCircle2, AlertTriangle, Calendar, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AcceptedOfferOption, OnboardingRecord } from "./types";

interface CreateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  acceptedOffers: AcceptedOfferOption[];
  onSave: (recordData: Partial<OnboardingRecord>) => void;
}

export default function CreateOnboardingModal({
  isOpen,
  onClose,
  acceptedOffers,
  onSave,
}: CreateOnboardingModalProps) {
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<AcceptedOfferOption | null>(null);

  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [location, setLocation] = useState("Davao");
  const [remarks, setRemarks] = useState("");

  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    const offer = acceptedOffers.find((o) => o.offerId === offerId) || null;
    setSelectedOffer(offer);
  };

  const handleReset = () => {
    setSelectedOfferId("");
    setSelectedOffer(null);
    setExpectedStartDate("");
    setLocation("Davao");
    setRemarks("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId || !expectedStartDate) return;

    onSave({
      offerId: selectedOfferId,
      candidateName: selectedOffer?.candidateName || "Candidate",
      candidateEmail: selectedOffer?.candidateEmail || "email@example.com",
      roleTitle: selectedOffer?.roleTitle || "Associate",
      account: selectedOffer?.account || "General Account",
      acceptedOfferDate: selectedOffer?.acceptedOfferDate || new Date().toISOString().split("T")[0],
      owner: selectedOffer?.owner || "TA Recruiter",
      expectedStartDate,
      location,
      remarks,
      showStatus: "Pending",
      finalOutcome: "Pending Start",
    });

    handleReset();
    onClose();
  };

  const isSaveDisabled = !selectedOfferId || !expectedStartDate;

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
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] z-10 relative"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#042C51] text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-sm font-black tracking-tight flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-[#FF5C28]" />
                  Add Onboarding Record
                </h2>
                <p className="text-[11px] text-slate-300">
                  Convert an accepted offer into an active onboarding tracking record.
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

            {/* Modal Content - Two Column Layout */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Main Form) */}
              <div className="lg:col-span-8 space-y-5">
                {/* Accepted Offer Section */}
                <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                    1. Select Accepted Offer
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Select Candidate with Accepted Offer <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedOfferId}
                      onChange={(e) => handleSelectOffer(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51] transition-all"
                      required
                    >
                      <option value="">-- Choose Accepted Offer Candidate --</option>
                      {acceptedOffers.map((off) => (
                        <option key={off.offerId} value={off.offerId}>
                          {off.candidateName} — {off.roleTitle} ({off.account} • Accepted: {off.acceptedOfferDate})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-filled Read-Only Details */}
                  {selectedOffer && (
                    <div className="pt-2 grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block">Candidate Name</span>
                        <span className="font-extrabold text-slate-900">{selectedOffer.candidateName}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block">Email Address</span>
                        <span className="font-semibold text-slate-700">{selectedOffer.candidateEmail}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block">Role & Account</span>
                        <span className="font-bold text-[#042C51]">
                          {selectedOffer.roleTitle} ({selectedOffer.account})
                        </span>
                      </div>
                      <div>
                        <span className="text-[9.5px] uppercase font-black text-slate-400 block">Accepted Date & Owner</span>
                        <span className="font-semibold text-slate-700">
                          {selectedOffer.acceptedOfferDate} • {selectedOffer.owner}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Start Details Section */}
                <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#042C51] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF5C28]" />
                    2. Start Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">
                        Expected Start Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={expectedStartDate}
                        onChange={(e) => setExpectedStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51] transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">
                        Location <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51] transition-all"
                          required
                        >
                          <option value="Davao">Davao</option>
                          <option value="Tagum">Tagum</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Remarks (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Additional pre-employment onboarding notes..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar (Info Boxes) */}
              <div className="lg:col-span-4 space-y-3">
                {/* System Relationship */}
                <div className="bg-[#042C51]/5 p-3.5 rounded-2xl border border-[#042C51]/20 text-xs text-[#042C51] space-y-1">
                  <h4 className="font-black uppercase text-[10px] flex items-center gap-1.5 text-[#042C51]">
                    <Info className="w-3.5 h-3.5 text-[#FF5C28]" /> System Relationship
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Accepted offer records populate from the Offers module. Converting here initializes pre-start tracking.
                  </p>
                </div>

                {/* Default Onboarding Status */}
                <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <h4 className="font-black uppercase text-[10px] flex items-center gap-1.5 text-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Default Initial Status
                  </h4>
                  <div className="space-y-1 text-[11px] font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Show Status:</span>
                      <span className="font-bold text-amber-700">Pending</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Final Outcome:</span>
                      <span className="font-bold text-amber-700">Pending Start</span>
                    </div>
                  </div>
                </div>

                {/* Backend Later Warning */}
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <h4 className="font-black uppercase text-[10px] flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Backend Note
                  </h4>
                  <p className="text-[10.5px] leading-tight">
                    Accepted offer endpoint automatically syncs with Onboarding records for real-time consistency.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="lg:col-span-12 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaveDisabled}
                    className="px-5 py-2.5 bg-[#FF5C28] hover:bg-[#e04b1a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Save Onboarding Record
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

