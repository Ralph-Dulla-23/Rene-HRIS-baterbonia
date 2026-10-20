import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Star,
  CheckCircle2,
  Send,
  MessageSquare,
  Building2,
  Briefcase,
  User,
  Mail,
  ShieldCheck,
  Tag,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  ThumbsUp,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CandidateExperienceRecord } from "./CandidateExperiencePage";

interface PublicCandidateExperienceSurveyPageProps {
  tokenParam?: string;
  onNavigateToCandidateExperience?: () => void;
}

// Default candidate dataset for pre-filled token simulation
const MOCK_SURVEY_TOKENS: Record<string, {
  candidateCode: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  account: string;
  exitStage: CandidateExperienceRecord["exitStage"];
  eventType: CandidateExperienceRecord["eventType"];
  taOwner: string;
}> = {
  "TOK-CAND-9102": {
    candidateCode: "CAND-9102",
    candidateName: "Juan Dela Cruz",
    candidateEmail: "juan.delacruz@email.com",
    role: "Customer Service Representative",
    account: "Chevron Support",
    exitStage: "Offered",
    eventType: "Offer Declined",
    taOwner: "Alena Batacan"
  },
  "TOK-CAND-9108": {
    candidateCode: "CAND-9108",
    candidateName: "Maria Santos",
    candidateEmail: "maria.santos@gmail.com",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    exitStage: "Interviewed",
    eventType: "Pipeline Drop-off",
    taOwner: "Carlos Ramos"
  },
  "TOK-CAND-9115": {
    candidateCode: "CAND-9115",
    candidateName: "Ramon Rodriguez",
    candidateEmail: "r.rodriguez@techmail.com",
    role: "Technical Support Associate",
    account: "Comcast Technical",
    exitStage: "Hired",
    eventType: "Process Completed",
    taOwner: "Alena Batacan"
  },
  "TOK-NHO-808": {
    candidateCode: "CAND-9160",
    candidateName: "Angela Mercado",
    candidateEmail: "angela.m@yahoo.com",
    role: "Healthcare Support Specialist",
    account: "Elevance Health",
    exitStage: "Hired",
    eventType: "Candidate Feedback",
    taOwner: "Alena Batacan"
  }
};

const EXPERIENCE_CATEGORIES = [
  { id: "Compensation", label: "Compensation & Benefits", icon: "💰" },
  { id: "Process Speed", label: "Recruitment Speed / Turnaround", icon: "⚡" },
  { id: "Recruiter Communication", label: "Recruiter Communication & Clarity", icon: "💬" },
  { id: "Schedule", label: "Shift Schedule & Work Hours", icon: "⏰" },
  { id: "Work Setup", label: "Work Setup (Remote / Onsite)", icon: "🏢" },
  { id: "Onboarding Smoothness", label: "Onboarding & NHO Smoothness", icon: "🚀" },
  { id: "Interview Experience", label: "Interview Fairness & Professionalism", icon: "👥" },
  { id: "Location Issue", label: "Site Location & Commute", icon: "📍" },
  { id: "Process Satisfactory", label: "Process Satisfactory / Great Experience", icon: "🌟" },
  { id: "Accepted Other Offer", label: "Accepted External Offer", icon: "🎯" }
];

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: "Poor Experience", color: "text-rose-600", desc: "Significant delays, unclear guidance, or friction encountered." },
  2: { text: "Below Expectations", color: "text-orange-600", desc: "Minor communication gaps or schedule mismatches." },
  3: { text: "Satisfactory / Average", color: "text-amber-600", desc: "Standard hiring process, met basic expectations." },
  4: { text: "Very Good", color: "text-emerald-600", desc: "Prompt communication, respectful recruiters, clear steps." },
  5: { text: "Outstanding / Seamless", color: "text-[#FF5C28]", desc: "Exceptional candidate experience from application to onboarding!" }
};

export default function PublicCandidateExperienceSurveyPage({
  tokenParam,
  onNavigateToCandidateExperience
}: PublicCandidateExperienceSurveyPageProps) {

  // Read URL query parameters if available
  const [tokenInput, setTokenInput] = useState<string>(() => {
    if (tokenParam) return tokenParam;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token") || urlParams.get("surveyToken") || "TOK-CAND-9102";
  });

  const [activeTokenData, setActiveTokenData] = useState(() => {
    return MOCK_SURVEY_TOKENS[tokenInput] || {
      candidateCode: "CAND-9900",
      candidateName: "Valued Candidate",
      candidateEmail: "candidate@email.com",
      role: "Customer Service Specialist",
      account: "Chevron Support",
      exitStage: "Interviewed" as const,
      eventType: "Candidate Feedback" as const,
      taOwner: "Alena Batacan"
    };
  });

  // Survey Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Process Satisfactory");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackTagInput, setFeedbackTagInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string>("");

  // Update token data if input changes
  useEffect(() => {
    if (MOCK_SURVEY_TOKENS[tokenInput]) {
      setActiveTokenData(MOCK_SURVEY_TOKENS[tokenInput]);
    }
  }, [tokenInput]);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  // Handle Survey Submission
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `EXP-${Math.floor(850 + Math.random() * 100)}`;
      const newRecord: CandidateExperienceRecord = {
        id: generatedId,
        candidateCode: activeTokenData.candidateCode,
        candidateName: activeTokenData.candidateName,
        candidateEmail: activeTokenData.candidateEmail,
        role: activeTokenData.role,
        account: activeTokenData.account,
        eventType: rating >= 4 ? "Candidate Feedback" : "Pipeline Drop-off",
        status: activeTokenData.exitStage === "Hired" ? "Completed" : "Drop-off",
        exitStage: activeTokenData.exitStage,
        reasonCategory: selectedCategory as any,
        reasonDescription: feedbackText.trim() || "Candidate submitted feedback via public survey portal.",
        qualitativeFeedback: feedbackText.trim() || "Feedback provided via public candidate experience survey.",
        rating: rating,
        feedbackTag: feedbackTagInput.trim() || (rating >= 4 ? "Positive VoC Survey" : `${selectedCategory} Feedback`),
        dateRecorded: new Date().toISOString().split("T")[0],
        taOwner: activeTokenData.taOwner,
        stagesPassed: [
          { stage: "Sourced", status: "Completed", timestamp: "Recent" },
          { stage: "Screened", status: "Completed", timestamp: "Recent" },
          { stage: activeTokenData.exitStage, status: "Completed", timestamp: "Today" }
        ]
      };

      // Write to localStorage for real-time dashboard sync
      try {
        const STORAGE_KEY = "sibs_candidate_experience_records";
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        let existingList: CandidateExperienceRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
        existingList = [newRecord, ...existingList];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));

        // Dispatch custom window event
        window.dispatchEvent(new CustomEvent("candidate_survey_submitted", { detail: newRecord }));
      } catch (err) {
        console.error("Failed to store survey record in localStorage", err);
      }

      setSubmittedRecordId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#101828] font-sans pb-16">
      
      {/* Public Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-[#042C51]">
              SiBS
            </span>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider hidden sm:inline">
              Candidate Feedback Survey
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToCandidateExperience && (
              <button
                type="button"
                onClick={onNavigateToCandidateExperience}
                className="px-3.5 py-1.5 bg-[#042C51] hover:bg-[#063b6d] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Return to TA Dashboard</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-800 text-[11px] font-bold">
                Token Verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Banner Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl text-[#042C51] shadow-sm mb-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-100/30 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#042C51] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#F5B800]" />
                Direct Candidate Feedback • No Login Required
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#042C51]">
                Candidate Experience & VoC Survey
              </h2>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
                Your candid feedback helps SiBS Solutions evaluate recruiter responsiveness, interview professionalism, and onboarding readiness.
              </p>
            </div>

            <div className="bg-[#042C51] text-white p-4 rounded-2xl border border-[#083A69] text-center shrink-0 w-full sm:w-auto shadow-md">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                Survey Status
              </span>
              <span className="text-sm font-black text-[#F5B800] flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitted ? "Completed" : "Ready to Submit"}</span>
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="survey-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              
              {/* Candidate Info Banner Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#042C51] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {activeTokenData.candidateName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Candidate Profile</span>
                    <h3 className="text-sm font-black text-[#042C51]">{activeTokenData.candidateName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{activeTokenData.candidateEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Applied Role / Account</span>
                    <span className="text-xs font-black text-[#042C51]">{activeTokenData.role}</span>
                    <p className="text-[11px] text-[#FF5C28] font-bold">{activeTokenData.account}</p>
                  </div>
                </div>
              </div>

              {/* Survey Form */}
              <form onSubmit={handleSubmitSurvey} className="bg-white p-6 rounded-2xl border border-[#E6ECF2] shadow-xs space-y-6">
                
                {/* 1. Star Rating Interactive Section */}
                <div className="space-y-3 text-center bg-[#F8FAFC] p-6 rounded-2xl border border-[#E6ECF2]">
                  <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider">
                    Overall Candidate Experience Rating *
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Rate your overall journey from application, interview process, recruiter communication, to onboarding / NHO.
                  </p>

                  {/* Star Icons Row */}
                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= activeRating
                              ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Rating Verbal Description */}
                  {activeRating > 0 && (
                    <motion.div
                      key={activeRating}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2 space-y-0.5"
                    >
                      <span className={`text-sm font-black ${RATING_LABELS[activeRating].color}`}>
                        {RATING_LABELS[activeRating].text} ({activeRating} / 5 Stars)
                      </span>
                      <p className="text-xs text-slate-600 italic">
                        "{RATING_LABELS[activeRating].desc}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* 2. Primary Feedback Category Chips */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Primary Experience Category *
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold">Select main driver</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EXPERIENCE_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-3.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 border cursor-pointer ${
                            isSelected
                              ? "bg-[#042C51] text-white border-[#042C51] shadow-md"
                              : "bg-[#F8FAFC] text-slate-700 border-[#E6ECF2] hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Qualitative Feedback Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FF5C28]" />
                      Qualitative Candidate Feedback (VoC)
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {feedbackText.length} / 500 chars
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    maxLength={500}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share specific details, suggestions, or praise regarding recruiter responsiveness, interview clarity, compensation explanation, or post-NHO onboarding procedures..."
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl p-3.5 text-xs text-[#042C51] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#042C51] leading-relaxed font-semibold"
                  />
                </div>

                {/* 4. Feedback Tag / Quick Summary */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500">
                    Feedback Tag / Key Topic Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackTagInput}
                    onChange={(e) => setFeedbackTagInput(e.target.value)}
                    placeholder="e.g. Smooth NHO Onboarding, Clear Recruiter Guidance, Compensation Query"
                    className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3.5 py-2.5 text-xs text-[#042C51] font-semibold focus:outline-none focus:ring-2 focus:ring-[#042C51]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full py-3.5 bg-[#042C51] hover:bg-[#FF5C28] text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Your Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#FF5C28]" />
                        <span>Submit Candidate Feedback</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            /* Confirmation Screen */
            <motion.div
              key="survey-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-emerald-200 shadow-2xl p-8 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Reference ID: {submittedRecordId}
                </span>
                <h2 className="text-2xl font-black text-[#042C51] tracking-tight">
                  Thank You for Your Feedback!
                </h2>
                <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
                  Your candidate experience response has been logged into the SiBS HRIS Talent Acquisition database. We appreciate your time in helping us elevate our hiring and onboarding standards.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E6ECF2] max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Candidate Name:</span>
                  <strong className="text-[#042C51]">{activeTokenData.candidateName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Submitted Rating:</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {rating}.0 / 5.0 Stars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Category:</span>
                  <strong className="text-[#042C51]">{selectedCategory}</strong>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setRating(5);
                    setFeedbackText("");
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Submit Additional Feedback
                </button>
                {onNavigateToCandidateExperience && (
                  <button
                    type="button"
                    onClick={onNavigateToCandidateExperience}
                    className="px-5 py-2.5 bg-[#042C51] hover:bg-[#FF5C28] text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    View TA Experience Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[10px] text-slate-400 py-4 mt-6 border-t border-slate-200">
        &copy; {new Date().getFullYear()} The Siblings Solutions &bull; SiBS HRIS & Talent Acquisition Suite &bull; Confidential & Safe
      </footer>

    </div>
  );
}
