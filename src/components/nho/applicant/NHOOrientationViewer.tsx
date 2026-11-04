import React, { useState, useEffect } from "react";
import { useNHO } from "../NHOContext";
import { NHOOrientationDeckConfig } from "../nhoTypes";
import { NHO_QUIZ_QUESTIONS, calculateQuizScore, getStoredOrientationDeckConfig, INITIAL_ORIENTATION_SLIDES } from "../nhoInitialData";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Sparkles, BookOpen, Check, ArrowRight, RotateCcw, Award } from "lucide-react";

interface NHOOrientationViewerProps {
  onProceedToRequirements?: () => void;
}

export default function NHOOrientationViewer({ onProceedToRequirements }: NHOOrientationViewerProps = {}) {
  const { 
    activeApplicant, 
    updateOrientationSlide, 
    submitQuizAnswer, 
    completeOrientation, 
    showToast 
  } = useNHO();

  // Dynamic Orientation Deck Configuration loaded from Recruitment Settings
  const [deckConfig, setDeckConfig] = useState<NHOOrientationDeckConfig>(() => getStoredOrientationDeckConfig());

  useEffect(() => {
    const handleConfigUpdate = () => {
      setDeckConfig(getStoredOrientationDeckConfig());
    };
    window.addEventListener("sibs_nho_orientation_config_updated", handleConfigUpdate);
    return () => {
      window.removeEventListener("sibs_nho_orientation_config_updated", handleConfigUpdate);
    };
  }, []);

  const slides = deckConfig.slides && deckConfig.slides.length > 0 ? deckConfig.slides : INITIAL_ORIENTATION_SLIDES;
  const totalSlides = slides.length;

  // Reactive local state ensures immediate 0-latency UI responsiveness
  const [currentSlide, setCurrentSlide] = useState<number>(activeApplicant.orientationCurrentSlide || 1);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(activeApplicant.orientationQuizAnswers || {});
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState<number>(0);
  const [acknowledgmentChecked, setAcknowledgmentChecked] = useState<boolean>(Boolean(activeApplicant.orientationAcknowledged));

  // Sync state whenever active candidate switches
  useEffect(() => {
    if (activeApplicant?.orientationCurrentSlide) {
      setCurrentSlide(activeApplicant.orientationCurrentSlide);
    }
    if (activeApplicant?.orientationQuizAnswers) {
      setQuizAnswers(activeApplicant.orientationQuizAnswers);
    }
    if (typeof activeApplicant?.orientationAcknowledged === "boolean") {
      setAcknowledgmentChecked(activeApplicant.orientationAcknowledged);
    }
  }, [activeApplicant?.id]);

  const isViewingSlides = currentSlide <= totalSlides;
  const isAtQuiz = currentSlide > totalSlides;

  const handleNextSlide = () => {
    const next = currentSlide + 1;
    setCurrentSlide(next);
    try {
      updateOrientationSlide(activeApplicant.id, next);
    } catch (e) {
      console.warn("Could not sync orientation slide to context", e);
    }
  };

  const handlePrevSlide = () => {
    const prev = Math.max(1, currentSlide - 1);
    setCurrentSlide(prev);
    try {
      updateOrientationSlide(activeApplicant.id, prev);
    } catch (e) {
      console.warn("Could not sync orientation slide to context", e);
    }
  };

  const maxViewedSlide = Math.max(
    currentSlide,
    ...(activeApplicant.orientationSlidesViewed || [1])
  );

  const handleJumpToSlide = (slideNum: number) => {
    // Strictly no shortcuts or skipping ahead
    if (slideNum > maxViewedSlide) {
      showToast("Please review the slides in sequential order without skipping ahead.", "info");
      return;
    }
    setCurrentSlide(slideNum);
    try {
      updateOrientationSlide(activeApplicant.id, slideNum);
    } catch (e) {
      console.warn("Could not sync orientation slide to context", e);
    }
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    try {
      submitQuizAnswer(activeApplicant.id, qIdx, optIdx);
    } catch (e) {
      console.warn("Could not sync quiz answer to context", e);
    }
  };

  const allQuestionsAnswered = NHO_QUIZ_QUESTIONS.every((_, idx) => quizAnswers[idx] !== undefined);
  const answeredCount = Object.keys(quizAnswers).length;

  const handleConfirmCompletion = () => {
    if (!allQuestionsAnswered) {
      showToast("Please respond to all 5 knowledge check questions first.", "error");
      return;
    }
    if (!acknowledgmentChecked) {
      showToast("Please check the final orientation policy acknowledgment checkbox.", "error");
      return;
    }
    const res = completeOrientation(activeApplicant.id, acknowledgmentChecked);
    if (res?.success !== false) {
      showToast("Orientation completed & acknowledged successfully!", "success");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col font-jakarta relative">
      {/* Top Accent Gradient Bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#FF5C28]" />

      {/* Sample Content Disclaimer Banner */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-950 text-[11px] flex items-center justify-between">
        <span className="font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Notice: Company-specific policy statements are sample prototype content until actual SiBS orientation material is formally approved.</span>
        </span>
        <span className="font-mono text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
          {deckConfig.version || "v1.0-sample"}
        </span>
      </div>

      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-[#042C51] text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#FF5C28]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Interactive SiBS Orientation &amp; Knowledge Check</h2>
            <span className="text-[11px] text-slate-300">
              {isViewingSlides ? `Slide ${currentSlide} of ${totalSlides} · Presentation Mode` : "Knowledge Check Quiz (5 Questions) & Acknowledgment"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeApplicant.orientationStatus === "Completed" ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Orientation Completed</span>
            </span>
          ) : isAtQuiz ? (
            <span className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-200 font-bold text-xs flex items-center gap-1.5 border border-orange-500/30">
              <Sparkles className="w-4 h-4 text-[#FF5C28]" />
              <span>Quiz: {answeredCount}/5 Answered</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 font-bold text-xs">
              Slide {currentSlide}/{totalSlides}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E9EEF5] h-1.5">
        <div 
          className="bg-gradient-to-r from-[#042C51] via-[#FF6B3D] to-[#FF5C28] h-full transition-all duration-300"
          style={{ 
            width: isViewingSlides 
              ? `${(currentSlide / (totalSlides + 1)) * 100}%` 
              : `${((totalSlides + (answeredCount / 5)) / (totalSlides + 1)) * 100}%` 
          }}
        />
      </div>

      {/* Slides Area */}
      {isViewingSlides ? (
        <div className="flex min-h-[380px] flex-col justify-between space-y-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-[#FF5C28]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                {slides[currentSlide - 1].kicker}
              </span>
              <span className="text-[11px] font-bold text-slate-400">· Slide {currentSlide} of {totalSlides}</span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-[#042C51] tracking-tight">
              {slides[currentSlide - 1].title}
            </h1>
            <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {slides[currentSlide - 1].body}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E6ECF2] pt-6">
            <button
              type="button"
              onClick={handlePrevSlide}
              disabled={currentSlide === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            {/* Slide Indicators: strictly ordered without shortcuts */}
            <div className="order-3 flex w-full items-center justify-center gap-2 sm:order-none sm:w-auto" aria-label="Orientation slide navigation">
              {slides.map(s => {
                const canJump = s.num <= maxViewedSlide;
                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!canJump}
                    onClick={() => handleJumpToSlide(s.num)}
                    className={`h-2.5 rounded-full transition-all ${
                      s.num === currentSlide 
                        ? "bg-[#FF5C28] w-8 shadow-xs cursor-default" 
                        : canJump
                          ? "bg-[#042C51] w-2.5 opacity-70 hover:opacity-100 cursor-pointer" 
                          : "bg-slate-200 w-2.5 cursor-not-allowed opacity-40"
                    }`}
                    title={canJump ? `Go to slide ${s.num}` : `Complete slide ${s.num - 1} first`}
                    aria-label={`Go to slide ${s.num}`}
                    aria-current={s.num === currentSlide ? "step" : undefined}
                  />
                );
              })}
            </div>

            {currentSlide < totalSlides ? (
              <button
                type="button"
                onClick={handleNextSlide}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#042C51] hover:bg-[#073866] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextSlide}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer transition-all animate-pulse"
              >
                <span>Take Knowledge Check Quiz (5 Questions)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Knowledge Check & Acknowledgment Section */
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF2]">
            <div>
              <span className="text-[10px] font-black text-[#FF5C28] uppercase tracking-wider block">
                Interactive Learning Activity
              </span>
              <h2 className="text-xl font-black text-[#042C51]">
                Workplace Orientation Knowledge Check (5 Questions)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Answer all 5 questions to unlock the final policy acknowledgment and complete orientation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleJumpToSlide(totalSlides)}
              className="text-xs font-bold text-[#042C51] hover:text-[#FF5C28] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Slides</span>
            </button>
          </div>

          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            {NHO_QUIZ_QUESTIONS.map((q, idx) => {
              const isAnswered = quizAnswers[idx] !== undefined;
              const isCurrent = activeQuizQuestionIdx === idx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuizQuestionIdx(idx)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isCurrent
                      ? "bg-[#042C51] text-white shadow-xs"
                      : isAnswered
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>Question {q.id}</span>
                  {isAnswered && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          {(() => {
            const currentQ = NHO_QUIZ_QUESTIONS[activeQuizQuestionIdx];
            const selectedOpt = quizAnswers[activeQuizQuestionIdx];

            return (
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FF5C28] uppercase tracking-wider">
                    Question {currentQ.id} of {NHO_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Topic: {slides[currentQ.id]?.title || "SiBS Policies"}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#042C51] leading-relaxed">
                  {currentQ.question}
                </h3>

                <div className="space-y-2.5 text-xs">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(activeQuizQuestionIdx, optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-white border-[#FF5C28] ring-2 ring-[#FF5C28]/20 font-bold text-[#042C51] shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                          isSelected ? "border-[#FF5C28] bg-[#FF5C28] text-white" : "border-slate-300 text-slate-500"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-normal font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Feedback Explanation */}
                {selectedOpt !== undefined && (
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                      <span>Key Takeaway:</span>
                    </strong>
                    <p className="text-[11.5px] text-blue-900 leading-relaxed font-normal">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Question Navigation Footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveQuizQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={activeQuizQuestionIdx === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Question</span>
                  </button>

                  {activeQuizQuestionIdx < NHO_QUIZ_QUESTIONS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveQuizQuestionIdx(prev => Math.min(NHO_QUIZ_QUESTIONS.length - 1, prev + 1))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#042C51] hover:bg-[#073866] text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>All questions reviewed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Quiz Scoring Feedback Card */}
          {allQuestionsAnswered && (() => {
            const scoreResult = calculateQuizScore(quizAnswers);
            return (
              <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E6ECF2] shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                      scoreResult.passed 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {scoreResult.score}/{scoreResult.total}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-[#042C51]">
                          Knowledge Check Score: {scoreResult.score}/{scoreResult.total} ({scoreResult.percentage}%)
                        </h4>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          scoreResult.passed 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {scoreResult.passed ? "Passed" : "Needs Review"}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                        {scoreResult.passed 
                          ? "You have satisfied the SiBS orientation passing threshold (minimum 80%). Check the acknowledgment below to finalize."
                          : "You scored below 80%. You may revisit any question above to adjust your answers before submitting."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Final Policy Acknowledgment & Submission */}
          <div className={`p-6 border rounded-2xl space-y-4 transition-all ${
            allQuestionsAnswered 
              ? "bg-orange-50/70 border-orange-200 ring-2 ring-orange-200/50" 
              : "bg-slate-50 border-slate-200 opacity-80"
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-2">
                <span>Final Orientation Acknowledgment</span>
                {allQuestionsAnswered && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    Quiz Complete (5/5)
                  </span>
                )}
              </h4>
              {!allQuestionsAnswered && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Please answer all {NHO_QUIZ_QUESTIONS.length} questions above to unlock
                </span>
              )}
            </div>

            <label className={`flex items-start gap-3 ${allQuestionsAnswered ? "cursor-pointer" : "cursor-not-allowed"}`}>
              <input
                type="checkbox"
                checked={acknowledgmentChecked}
                disabled={!allQuestionsAnswered || activeApplicant.orientationStatus === "Completed"}
                onChange={e => setAcknowledgmentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#FF5C28] focus:ring-[#FF5C28] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-800 leading-relaxed font-medium">
                I hereby confirm that I have personally reviewed all seven (7) modules of the SiBS New Hire Orientation, answered the knowledge check, and agree to uphold all company policies, workplace standards, and security obligations.
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {activeApplicant.orientationStatus === "Completed" && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Orientation Verified &amp; Recorded</span>
                </span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  disabled={!allQuestionsAnswered || !acknowledgmentChecked || activeApplicant.orientationStatus === "Completed"}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {activeApplicant.orientationStatus === "Completed" ? "Orientation Confirmed" : "Confirm Orientation Completion"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Celebratory Post-Completion Stage: Passing of Requirements */}
          {activeApplicant.orientationStatus === "Completed" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-950">
                      Orientation &amp; Knowledge Check Passed!
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Quiz Score: <strong>{activeApplicant.orientationQuizScore ?? 5}/{activeApplicant.orientationQuizTotal ?? 5} ({activeApplicant.orientationQuizPercentage ?? 100}%)</strong> · Completed {activeApplicant.orientationCompletedAt || "Today"}. Requirement submission is now unlocked.
                    </p>
                  </div>
                </div>

                {onProceedToRequirements && (
                  <button
                    type="button"
                    onClick={onProceedToRequirements}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-extrabold shadow-xs cursor-pointer transition-all animate-bounce"
                  >
                    <span>Proceed to Step 2: Passing of Requirements</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
