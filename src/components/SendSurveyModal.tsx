import React, { useState } from "react";
import {
  X,
  Mail,
  Send,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  User,
  Building2,
  Briefcase,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CandidateExperienceRecord } from "./CandidateExperiencePage";

interface SendSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateRecord?: CandidateExperienceRecord | null;
  onSurveySent?: (recordId: string, surveyToken: string, triggerType: string) => void;
}

export default function SendSurveyModal({
  isOpen,
  onClose,
  candidateRecord,
  onSurveySent
}: SendSurveyModalProps) {
  const [triggerType, setTriggerType] = useState<"NHO Completion" | "Pipeline Exit" | "Manual TA Request">(
    candidateRecord?.eventType === "Process Completed" ? "NHO Completion" : "Pipeline Exit"
  );

  const [candidateName, setCandidateName] = useState(candidateRecord?.candidateName || "Juan Dela Cruz");
  const [candidateEmail, setCandidateEmail] = useState(candidateRecord?.candidateEmail || "juan.delacruz@email.com");
  const [role, setRole] = useState(candidateRecord?.role || "Customer Service Representative");
  const [account, setAccount] = useState(candidateRecord?.account || "Chevron Support");

  const [copiedLink, setCopiedLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Generate Survey Token
  const surveyToken = candidateRecord ? `TOK-${candidateRecord.candidateCode || candidateRecord.id}` : `TOK-CAND-${Math.floor(9000 + Math.random() * 999)}`;
  const publicSurveyUrl = `${window.location.origin}/public/candidate-experience-survey?token=${surveyToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicSurveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      if (onSurveySent && candidateRecord) {
        onSurveySent(candidateRecord.id, surveyToken, triggerType);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#042C51]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#042C51] text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FF5C28] text-white rounded-lg shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Send Candidate Experience Survey Email</h3>
              <p className="text-[10px] text-slate-300">Automated Journey-End &amp; Exit Survey Dispatch</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSentSuccess ? (
          <form onSubmit={handleSendEmail} className="p-6 space-y-5">
            
            {/* 1. Trigger Reason Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Automated Survey Trigger Reason *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: "NHO Completion", label: "NHO Completion", icon: "🎓", desc: "Finished Orientation" },
                  { key: "Pipeline Exit", label: "Pipeline Exit", icon: "🚪", desc: "Drop-off / Withdrawal" },
                  { key: "Manual TA Request", label: "Manual Request", icon: "✉️", desc: "Ad-hoc Dispatch" }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTriggerType(t.key as any)}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                      triggerType === t.key
                        ? "bg-[#042C51] text-white border-[#042C51] shadow-md"
                        : "bg-[#F8FAFC] text-slate-700 border-[#E6ECF2] hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </div>
                    <span className="text-[10px] font-normal block opacity-80">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Candidate Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E6ECF2]">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-white border border-[#E6ECF2] rounded-lg px-3 py-1.5 text-xs font-bold text-[#042C51]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Candidate Email</label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full bg-white border border-[#E6ECF2] rounded-lg px-3 py-1.5 text-xs font-bold text-[#042C51]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Position / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-[#E6ECF2] rounded-lg px-3 py-1.5 text-xs font-bold text-[#042C51]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Account</label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-white border border-[#E6ECF2] rounded-lg px-3 py-1.5 text-xs font-bold text-[#042C51]"
                />
              </div>
            </div>

            {/* 3. Generated Public Link & Copy Bar */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider flex justify-between items-center">
                <span>Public Candidate Survey Link</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Token: {surveyToken}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicSurveyUrl}
                  className="flex-1 bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3.5 py-2 text-xs font-mono text-[#042C51] select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#042C51] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* 4. Live Email Preview Box */}
            <div className="p-4 bg-[#FFF0EB] rounded-xl border border-[#FFE0D5] space-y-2 text-xs text-[#042C51]">
              <div className="flex items-center justify-between border-b border-[#FFE0D5] pb-2">
                <span className="font-black uppercase text-[10px] text-[#FF5C28] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FF5C28]" />
                  Simulated Outgoing Email Preview
                </span>
                <span className="text-[10px] text-slate-500">Sender: ta-survey@thesiblingssolutions.com</span>
              </div>

              <div className="space-y-1 pt-1 font-sans">
                <p className="font-bold">Subject: {triggerType === "NHO Completion" ? "Congratulations on Completing NHO! - Share Your Feedback with SiBS" : "Your Feedback Matters - SiBS Candidate Experience Survey"}</p>
                <p className="text-slate-700 leading-relaxed pt-1">
                  Dear <strong>{candidateName}</strong>,<br />
                  {triggerType === "NHO Completion" 
                    ? "Congratulations on completing your New Hire Orientation! We want to ensure your onboarding journey was smooth and welcoming." 
                    : "Thank you for taking the time to interact with our Talent Acquisition team at SiBS Solutions."
                  } Please take 2 minutes to complete our quick Candidate Experience survey.
                </p>
                <div className="pt-2 flex justify-center">
                  <a
                    href={publicSurveyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#042C51] text-white font-bold text-xs rounded-lg hover:bg-[#FF5C28] transition-colors"
                  >
                    <span>Open Public Survey Form</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF5C28]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#042C51] font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 bg-[#042C51] hover:bg-[#FF5C28] text-white font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Dispatching Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#FF5C28]" />
                    <span>Send Survey Email Now</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#042C51]">Survey Email Dispatched Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                An automated email trigger with token <strong className="text-[#042C51] font-mono">{surveyToken}</strong> was sent to <strong>{candidateEmail}</strong>.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#042C51] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Copied Link!" : "Copy Survey Link"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#042C51] text-white font-black text-xs rounded-xl hover:bg-[#FF5C28] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
