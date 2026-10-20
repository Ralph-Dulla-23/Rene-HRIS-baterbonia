import React, { useState } from "react";
import { useNHO } from "../NHOContext";
import { NHO_QUIZ_QUESTIONS } from "../nhoInitialData";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  RotateCcw,
  Check
} from "lucide-react";

export default function NHOOrientationViewer() {
  const { 
    activeApplicant, 
    updateOrientationSlide, 
    submitQuizAnswer, 
    completeOrientation, 
    showToast 
  } = useNHO();

  const currentSlide = activeApplicant.orientationCurrentSlide || 1;
  const quizAnswers = activeApplicant.orientationQuizAnswers || {};
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0);
  const [acknowledgmentChecked, setAcknowledgmentChecked] = useState(activeApplicant.orientationAcknowledged);

  // 7 Orientation Slides definitions
  const slides = [
    {
      num: 1,
      title: "Welcome to SiBS (The Siblings Solutions)",
      kicker: "Phase 1: Orientation Welcome",
      body: "Welcome to the SiBS family! Today marks your formal journey as a valued member of our professional team. During this orientation, you will discover our organizational heritage, core values, daily operating standards, and support channels designed to ensure your long-term career growth."
    },
    {
      num: 2,
      title: "Company Heritage & Identity",
      kicker: "Who We Are",
      body: "SiBS delivers premier enterprise business solutions, customer experience consulting, and specialized tech-enabled services to leading global brands. Our culture is founded upon mutual respect, operational rigor, client focus, and an uncompromising commitment to employee development."
    },
    {
      num: 3,
      title: "Our Mission, Vision, and Core Values",
      kicker: "The SiBS Foundation",
      body: "Mission: To empower businesses and people through compassionate, high-performing service solutions.\n\nVision: To be the benchmark partner for outsourced expertise across Asia-Pacific and North America.\n\nValues: Integrity, Accountability, Synergy, Excellence, and Continuous Learning."
    },
    {
      num: 4,
      title: "Workplace Professionalism & Code of Conduct",
      kicker: "Behavioral Standards",
      body: "We celebrate a collaborative, diverse environment. All employees are expected to maintain punctual shift attendance, respectful interpersonal dialogue, professional communication, and strict adherence to dress code standards inside all SiBS facilities."
    },
    {
      num: 5,
      title: "Company Policies & Responsibilities",
      kicker: "Operational Guidelines",
      body: "Every employee is responsible for familiarizing themselves with the SiBS Employee Handbook. Important guidelines include timely time-tracking via Kronos, attendance escalation at least two hours prior to shift commencement, and respect for company equipment."
    },
    {
      num: 6,
      title: "Information Security & Clean Desk Policy",
      kicker: "Data Protection & NDA",
      body: "Protecting our clients' sensitive financial, healthcare, and proprietary information is our highest mandate. Mobile phones, personal recording gear, and paper notes are strictly forbidden in production zones. Workstations must be locked whenever unattended."
    },
    {
      num: 7,
      title: "HR Support & People Partnership",
      kicker: "We Are Here For You",
      body: "Your HR Operations team, Talent Acquisition partners, and Employee Relations leads are your daily allies. Reach out through our official HR Ticketing portal, helpdesk email, or visit our People Hub on the 5th floor."
    }
  ];

  const totalSlides = slides.length;
  const isViewingSlides = currentSlide <= totalSlides;
  const isAtQuiz = currentSlide > totalSlides;

  const handleNextSlide = () => {
    const next = currentSlide + 1;
    updateOrientationSlide(activeApplicant.id, next);
  };

  const handlePrevSlide = () => {
    const prev = Math.max(1, currentSlide - 1);
    updateOrientationSlide(activeApplicant.id, prev);
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    submitQuizAnswer(activeApplicant.id, qIdx, optIdx);
  };

  const allQuestionsAnswered = NHO_QUIZ_QUESTIONS.every((_, idx) => quizAnswers[idx] !== undefined);
  const allSlidesViewed = [1, 2, 3, 4, 5, 6, 7].every(s => (activeApplicant.orientationSlidesViewed || []).includes(s));

  const handleConfirmCompletion = () => {
    if (!allSlidesViewed) {
      showToast("Please review all seven (7) presentation slides before confirming completion.", "error");
      return;
    }
    if (!allQuestionsAnswered) {
      showToast("Please respond to all 5 knowledge check questions first.", "error");
      return;
    }
    if (!acknowledgmentChecked) {
      showToast("Please check the final orientation policy acknowledgment checkbox.", "error");
      return;
    }
    completeOrientation(activeApplicant.id, acknowledgmentChecked);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
      {/* Sample Content Disclaimer Banner */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-950 text-[11px] flex items-center justify-between">
        <span className="font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Notice: Company-specific policy statements are sample prototype content until actual SiBS orientation material is formally approved.</span>
        </span>
        <span className="font-mono text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
          v1.0-sample
        </span>
      </div>

      {/* Header bar */}
      <div className="p-4 bg-[#042C51] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[#FF5C28]" />
          <div>
            <h2 className="text-sm font-bold tracking-tight">Interactive SiBS Orientation & Knowledge Check</h2>
            <span className="text-[11px] text-slate-300">
              {isViewingSlides ? `Slide ${currentSlide} of ${totalSlides}` : "Knowledge Check & Acknowledgment"}
            </span>
          </div>
        </div>

        {activeApplicant.orientationStatus === "Completed" && (
          <span className="px-2.5 py-1 rounded-xl bg-green-500/20 text-green-300 font-bold text-xs flex items-center gap-1.5 border border-green-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Orientation Completed</span>
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div 
          className="bg-[#FF5C28] h-full transition-all duration-300"
          style={{ 
            width: isViewingSlides 
              ? `${(currentSlide / (totalSlides + 1)) * 100}%` 
              : `${((totalSlides + (Object.keys(quizAnswers).length / 5)) / (totalSlides + 1)) * 100}%` 
          }}
        />
      </div>

      {/* Slides Area */}
      {isViewingSlides ? (
        <div className="p-8 md:p-12 min-h-[380px] flex flex-col justify-between space-y-6">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold text-[#FF5C28] uppercase tracking-wider block">
              {slides[currentSlide - 1].kicker}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-[#042C51] tracking-tight">
              {slides[currentSlide - 1].title}
            </h1>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {slides[currentSlide - 1].body}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E6ECF2]">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            <div className="flex items-center gap-1">
              {slides.map(s => (
                <button
                  key={s.num}
                  onClick={() => updateOrientationSlide(activeApplicant.id, s.num)}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    s.num === currentSlide 
                      ? "bg-[#FF5C28] w-6" 
                      : activeApplicant.orientationSlidesViewed.includes(s.num)
                        ? "bg-slate-300" 
                        : "bg-slate-200"
                  }`}
                  title={`Go to slide ${s.num}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSlide}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#042C51] hover:bg-[#0B365F] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <span>{currentSlide === totalSlides ? "Proceed to Knowledge Check" : "Next Slide"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Knowledge Check & Acknowledgment Section */
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6ECF2]">
            <div>
              <span className="text-xs font-bold text-[#FF5C28] uppercase tracking-wider block">
                Interactive Learning Activity
              </span>
              <h2 className="text-lg font-bold text-[#042C51]">
                Workplace Orientation Knowledge Check (5 Questions)
              </h2>
              <p className="text-xs text-slate-500">
                This is a learning reinforcement activity, not an examination. Answer all questions to unlock final acknowledgment.
              </p>
            </div>

            <button
              onClick={() => updateOrientationSlide(activeApplicant.id, totalSlides)}
              className="text-xs font-semibold text-slate-500 hover:text-[#042C51] flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Slides</span>
            </button>
          </div>

          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {NHO_QUIZ_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuizQuestionIdx(idx)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeQuizQuestionIdx === idx
                    ? "bg-[#042C51] text-white"
                    : quizAnswers[idx] !== undefined
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Question {q.id}</span>
                {quizAnswers[idx] !== undefined && <Check className="w-3 h-3 text-green-600" />}
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          {(() => {
            const currentQ = NHO_QUIZ_QUESTIONS[activeQuizQuestionIdx];
            const selectedOpt = quizAnswers[activeQuizQuestionIdx];

            return (
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-4">
                <h3 className="text-sm font-bold text-[#042C51] leading-relaxed">
                  {currentQ.id}. {currentQ.question}
                </h3>

                <div className="space-y-2 text-xs">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(activeQuizQuestionIdx, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-white border-[#042C51] ring-2 ring-[#042C51]/15 font-semibold text-[#042C51]"
                            : "bg-white/80 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isSelected ? "border-[#FF5C28] bg-[#FF5C28] text-white" : "border-slate-300 text-slate-500"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-normal">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Feedback Explanation */}
                {selectedOpt !== undefined && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-800">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>Key Takeaway & Explanation:</span>
                    </strong>
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Final Policy Acknowledgment */}
          <div className="p-6 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
              Final Orientation Acknowledgment
            </h4>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgmentChecked}
                onChange={e => setAcknowledgmentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#FF5C28] focus:ring-[#FF5C28]"
              />
              <span className="text-xs text-orange-950 leading-relaxed font-medium">
                I hereby confirm that I have personally reviewed all seven (7) modules of the SiBS New Hire Orientation, answered the knowledge check, and agree to uphold all company policies, workplace standards, and security obligations.
              </span>
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleConfirmCompletion}
                disabled={activeApplicant.orientationStatus === "Completed"}
                className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {activeApplicant.orientationStatus === "Completed" ? "Orientation Confirmed" : "Confirm Orientation Completion"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
