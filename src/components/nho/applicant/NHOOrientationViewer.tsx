import React, { useState, useEffect, useMemo } from "react";
import { useNHO } from "../NHOContext";
import { NHOOrientationDeckConfig } from "../nhoTypes";
import { 
  NHO_QUIZ_STAGES, 
  NHO_QUIZ_QUESTIONS, 
  calculateQuizScore, 
  getStoredOrientationDeckConfig, 
  INITIAL_ORIENTATION_SLIDES 
} from "../nhoInitialData";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Check, 
  ArrowRight, 
  Award, 
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  XCircle,
  Lock
} from "lucide-react";

interface NHOOrientationViewerProps {
  onProceedToRequirements?: () => void;
}

type OrientationViewMode = "slide" | "checkpoint" | "final";

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

  // Track view mode: slide presentation, interspersed stage checkpoint, or final score/acknowledgment
  const [viewMode, setViewMode] = useState<OrientationViewMode>(() => {
    if (activeApplicant?.orientationStatus === "Completed") return "final";
    return "slide";
  });

  const [currentSlide, setCurrentSlide] = useState<number>(activeApplicant.orientationCurrentSlide || 1);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(activeApplicant.orientationQuizAnswers || {});
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
    if (activeApplicant?.orientationStatus === "Completed") {
      setViewMode("final");
    }
  }, [activeApplicant?.id]);

  const maxViewedSlide = Math.max(
    currentSlide,
    ...(activeApplicant.orientationSlidesViewed || [1])
  );

  // Check if current slide triggers an interspersed checkpoint
  const currentSlideCheckpoint = useMemo(() => {
    return NHO_QUIZ_STAGES.find(st => st.triggerAfterSlide === currentSlide);
  }, [currentSlide]);

  // Questions belonging to the active stage
  const stageQuestions = useMemo(() => {
    return NHO_QUIZ_QUESTIONS.filter(q => q.stageId === activeStageId);
  }, [activeStageId]);

  // Check if all questions in the current stage checkpoint are answered
  const isCurrentStageAnswered = useMemo(() => {
    if (!stageQuestions.length) return false;
    return stageQuestions.every(q => quizAnswers[q.id - 1] !== undefined);
  }, [stageQuestions, quizAnswers]);

  // Total answers across all checkpoints
  const totalAnsweredCount = Object.keys(quizAnswers).length;
  const allQuestionsAnswered = NHO_QUIZ_QUESTIONS.length > 0 && 
    NHO_QUIZ_QUESTIONS.every((_, idx) => quizAnswers[idx] !== undefined);

  // Current score calculation
  const scoreResult = useMemo(() => {
    return calculateQuizScore(quizAnswers);
  }, [quizAnswers]);

  // Navigation handlers
  const handleNextSlide = () => {
    // If this slide triggers a checkpoint, open that checkpoint first!
    if (currentSlideCheckpoint) {
      setActiveStageId(currentSlideCheckpoint.id);
      setViewMode("checkpoint");
      return;
    }

    const next = currentSlide + 1;
    if (next <= totalSlides) {
      setCurrentSlide(next);
      try {
        updateOrientationSlide(activeApplicant.id, next);
      } catch (e) {
        console.warn("Could not sync orientation slide to context", e);
      }
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

  const handleJumpToSlide = (slideNum: number) => {
    if (slideNum > maxViewedSlide) {
      showToast("Please review the slides in sequential order without skipping ahead.", "info");
      return;
    }
    setCurrentSlide(slideNum);
    setViewMode("slide");
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

  // Continue from a checkpoint quiz to the next part or to final review
  const handleContinueFromCheckpoint = () => {
    if (!isCurrentStageAnswered) {
      showToast("Please answer all question(s) in this checkpoint to proceed.", "error");
      return;
    }

    const activeStage = NHO_QUIZ_STAGES.find(st => st.id === activeStageId);
    const triggerSlide = activeStage ? activeStage.triggerAfterSlide : currentSlide;

    if (activeStageId < NHO_QUIZ_STAGES.length) {
      // Advance to next slide after the trigger slide
      const nextSlide = Math.min(totalSlides, triggerSlide + 1);
      setCurrentSlide(nextSlide);
      setViewMode("slide");
      try {
        updateOrientationSlide(activeApplicant.id, nextSlide);
      } catch (e) {
        console.warn("Could not sync orientation slide", e);
      }
    } else {
      // Last checkpoint completed: proceed to final review & scoring
      setViewMode("final");
    }
  };

  const handleConfirmCompletion = () => {
    if (!allQuestionsAnswered) {
      showToast(`Please answer all ${NHO_QUIZ_QUESTIONS.length} checkpoint questions first.`, "error");
      return;
    }
    if (!scoreResult.passed) {
      showToast(`Cannot complete orientation: Passing score of at least 80% (5 of 6) is strictly required. Your score: ${scoreResult.score}/${scoreResult.total} (${scoreResult.percentage}%).`, "error");
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

  // Jump to first failed checkpoint stage
  const handleJumpToFirstFailedStage = () => {
    const firstFailed = NHO_QUIZ_STAGES.find(st => {
      const qs = NHO_QUIZ_QUESTIONS.filter(q => q.stageId === st.id);
      return qs.some(q => quizAnswers[q.id - 1] !== q.correctOptionIndex);
    }) || NHO_QUIZ_STAGES[0];

    setActiveStageId(firstFailed.id);
    setViewMode("checkpoint");
  };

  // Composite progress calculation
  const compositeProgress = useMemo(() => {
    if (activeApplicant.orientationStatus === "Completed" && activeApplicant.orientationQuizPassed !== false) return 100;
    if (viewMode === "final") return scoreResult.passed ? 95 : 85;
    const slideWeight = (currentSlide / totalSlides) * 60;
    const quizWeight = (totalAnsweredCount / NHO_QUIZ_QUESTIONS.length) * 40;
    return Math.min(90, Math.round(slideWeight + quizWeight));
  }, [activeApplicant.orientationStatus, activeApplicant.orientationQuizPassed, viewMode, scoreResult.passed, currentSlide, totalSlides, totalAnsweredCount]);

  return (
    <div className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col font-jakarta relative">
      {/* Top Accent Gradient Bar */}
      <div className={`h-[3px] ${
        viewMode === "final" && !scoreResult.passed 
          ? "bg-red-500" 
          : "bg-gradient-to-r from-[#042C51] via-[#0B365F] to-[#FF5C28]"
      }`} />

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
            <h2 className="text-sm font-bold tracking-tight">Interactive SiBS Orientation &amp; Interspersed Quizzes</h2>
            <span className="text-[11px] text-slate-300">
              {viewMode === "slide" && `Slide ${currentSlide} of ${totalSlides} · Presentation Mode`}
              {viewMode === "checkpoint" && `Checkpoint Quiz: Part ${activeStageId} of 4 · Stage Knowledge Check`}
              {viewMode === "final" && (
                scoreResult.passed
                  ? "Final Scoring & Policy Acknowledgment"
                  : "Final Scoring — Passing Score (>=80%) Required to Proceed"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeApplicant.orientationStatus === "Completed" && activeApplicant.orientationQuizPassed !== false ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Orientation Completed (Score: {activeApplicant.orientationQuizScore ?? 6}/{activeApplicant.orientationQuizTotal ?? 6})</span>
            </span>
          ) : viewMode === "final" && !scoreResult.passed ? (
            <span className="px-3 py-1.5 rounded-xl bg-red-500/25 text-red-200 font-bold text-xs flex items-center gap-1.5 border border-red-500/40 animate-pulse">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Failed: {scoreResult.score}/{scoreResult.total} ({scoreResult.percentage}%) · Below 80%</span>
            </span>
          ) : viewMode === "checkpoint" ? (
            <span className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-200 font-bold text-xs flex items-center gap-1.5 border border-orange-500/30">
              <Sparkles className="w-4 h-4 text-[#FF5C28]" />
              <span>Checkpoint Part {activeStageId}/4 ({isCurrentStageAnswered ? "Answered" : "In Progress"})</span>
            </span>
          ) : viewMode === "final" ? (
            <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-200 font-bold text-xs flex items-center gap-1.5 border border-blue-500/30">
              <Award className="w-4 h-4 text-blue-300" />
              <span>Score Review: {totalAnsweredCount}/{NHO_QUIZ_QUESTIONS.length} Answered</span>
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
          className={`h-full transition-all duration-300 ${
            viewMode === "final" && !scoreResult.passed
              ? "bg-red-500"
              : "bg-gradient-to-r from-[#042C51] via-[#FF6B3D] to-[#FF5C28]"
          }`}
          style={{ width: `${compositeProgress}%` }}
        />
      </div>

      {/* VIEW MODE 1: SLIDE PRESENTATION */}
      {viewMode === "slide" && (
        <div className="flex min-h-[400px] flex-col justify-between space-y-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-[#FF5C28]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C28]" />
                {slides[currentSlide - 1]?.kicker || "SiBS Orientation"}
              </span>
              <span className="text-[11px] font-bold text-slate-400">· Slide {currentSlide} of {totalSlides}</span>
              {currentSlideCheckpoint && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[9.5px] font-bold text-blue-800">
                  <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                  Quiz Checkpoint Follows
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black text-[#042C51] tracking-tight">
              {slides[currentSlide - 1]?.title}
            </h1>
            <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {slides[currentSlide - 1]?.body}
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

            {/* Slide Indicators: strictly sequential without shortcuts */}
            <div className="order-3 flex w-full items-center justify-center gap-2 sm:order-none sm:w-auto" aria-label="Orientation slide navigation">
              {slides.map(s => {
                const canJump = s.num <= maxViewedSlide;
                const hasStage = NHO_QUIZ_STAGES.some(st => st.triggerAfterSlide === s.num);
                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!canJump}
                    onClick={() => handleJumpToSlide(s.num)}
                    className={`h-2.5 rounded-full transition-all relative ${
                      s.num === currentSlide 
                        ? "bg-[#FF5C28] w-8 shadow-xs cursor-default" 
                        : canJump
                          ? hasStage
                            ? "bg-[#042C51] w-3.5 opacity-90 hover:opacity-100 cursor-pointer"
                            : "bg-[#042C51] w-2.5 opacity-70 hover:opacity-100 cursor-pointer" 
                          : "bg-slate-200 w-2.5 cursor-not-allowed opacity-40"
                    }`}
                    title={
                      canJump 
                        ? hasStage ? `Slide ${s.num} (Has Quiz Checkpoint)` : `Go to slide ${s.num}`
                        : `Complete slide ${s.num - 1} first`
                    }
                    aria-label={`Go to slide ${s.num}`}
                    aria-current={s.num === currentSlide ? "step" : undefined}
                  />
                );
              })}
            </div>

            {/* Primary Action Button: Triggers checkpoint quiz or next slide */}
            {currentSlideCheckpoint ? (
              <button
                type="button"
                onClick={handleNextSlide}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] text-white font-bold text-xs shadow-xs cursor-pointer transition-all animate-pulse"
              >
                <span>Take Part {currentSlideCheckpoint.id} Checkpoint Quiz ({currentSlideCheckpoint.questionCount} {currentSlideCheckpoint.questionCount === 1 ? "Question" : "Questions"})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : currentSlide < totalSlides ? (
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
                onClick={() => setViewMode("final")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#042C51] hover:bg-[#073866] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <span>Review Final Scores &amp; Acknowledgment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERSPERSED CHECKPOINT QUIZ */}
      {viewMode === "checkpoint" && (() => {
        const activeStage = NHO_QUIZ_STAGES.find(st => st.id === activeStageId) || NHO_QUIZ_STAGES[0];

        return (
          <div className="p-6 md:p-8 space-y-6">
            {/* Checkpoint Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF2]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#FF5C28] uppercase tracking-wider">
                    Orientation Stage Checkpoint · Part {activeStage.id} of 4
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    (Triggered after Slide {activeStage.triggerAfterSlide})
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#042C51] mt-0.5">
                  {activeStage.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Answer the question(s) below to confirm your understanding before unlocking the next section of the orientation deck.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleJumpToSlide(activeStage.triggerAfterSlide)}
                className="text-xs font-bold text-[#042C51] hover:text-[#FF5C28] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] shadow-xs cursor-pointer transition-colors self-start sm:self-auto shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Review Slide {activeStage.triggerAfterSlide}</span>
              </button>
            </div>

            {/* Questions for This Stage */}
            <div className="space-y-6">
              {stageQuestions.map((q, idx) => {
                const questionGlobalIdx = q.id - 1;
                const selectedOpt = quizAnswers[questionGlobalIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                return (
                  <div key={q.id} className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E6ECF2] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#FF5C28] uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Part {activeStage.id} · Question {idx + 1} of {stageQuestions.length}</span>
                      </span>
                      {isAnswered ? (
                        isCorrect ? (
                          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            <span>Correct (1/1)</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Incorrect (0/1) · Option Can Be Changed</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Answer Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#042C51] leading-relaxed">
                      {q.question}
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        const isThisCorrect = optIdx === q.correctOptionIndex;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(questionGlobalIdx, optIdx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                              isSelected
                                ? isThisCorrect
                                  ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 font-bold text-emerald-950 shadow-xs"
                                  : "bg-red-50/90 border-red-500 ring-2 ring-red-500/20 font-bold text-red-950 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                              isSelected 
                                ? isThisCorrect
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-red-600 bg-red-600 text-white"
                                : "border-slate-300 text-slate-500"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-normal font-medium">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Immediate Feedback with Red/Green Status */}
                    {isAnswered && (
                      isCorrect ? (
                        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                          <strong className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Correct! Key Takeaway:</span>
                          </strong>
                          <p className="text-[11.5px] text-emerald-900 leading-relaxed font-normal">
                            {q.explanation}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50/90 border border-red-300 rounded-xl text-xs text-red-950 space-y-1">
                          <strong className="font-bold flex items-center gap-1.5 text-red-800">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>Incorrect Choice · Policy Takeaway:</span>
                          </strong>
                          <p className="text-[11.5px] text-red-900 leading-relaxed font-normal">
                            {q.explanation}
                          </p>
                          <p className="text-[10.5px] text-red-700 font-bold pt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#FF5C28]" />
                            <span>Tip: Passing threshold is 80% (5 of 6). You can choose another option above to correct your score.</span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checkpoint Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E6ECF2]">
              <button
                type="button"
                onClick={() => handleJumpToSlide(activeStage.triggerAfterSlide)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Slide {activeStage.triggerAfterSlide}</span>
              </button>

              <button
                type="button"
                onClick={handleContinueFromCheckpoint}
                disabled={!isCurrentStageAnswered}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                <span>
                  {activeStageId < NHO_QUIZ_STAGES.length
                    ? `Save & Continue to Part ${activeStageId + 1} (Slide ${activeStage.triggerAfterSlide + 1})`
                    : "Complete Checkpoints & View Final Results"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* VIEW MODE 3: FINAL SCORING & POLICY ACKNOWLEDGMENT */}
      {viewMode === "final" && (
        <div className="p-6 md:p-8 space-y-6">
          {/* Top Bar with Return Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6ECF2]">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block ${
                scoreResult.passed ? "text-[#FF5C28]" : "text-red-600"
              }`}>
                {scoreResult.passed 
                  ? "Final Orientation Review & Compliance Sign-Off" 
                  : "Orientation Checkpoint Threshold Not Met (Action Required)"}
              </span>
              <h2 className="text-xl font-black text-[#042C51]">
                Orientation Checkpoints Scoring &amp; Policy Acknowledgment
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {scoreResult.passed
                  ? "Review your performance across all four checkpoints, confirm the policy acknowledgment, and proceed to Step 2."
                  : "You must score at least 80% (5 of 6 correct) to complete orientation and unlock the Passing of Requirements."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleJumpToSlide(totalSlides)}
              className="text-xs font-bold text-[#042C51] hover:text-[#FF5C28] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BECBDA] bg-white hover:bg-[#F7F9FC] shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Review Slide Deck</span>
            </button>
          </div>

          {/* RED WARNING CARD WHEN FAILED */}
          {!scoreResult.passed && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-red-900 uppercase tracking-tight flex items-center gap-2">
                    <span>Passing Score Required — You Cannot Proceed to Requirements</span>
                  </h4>
                  <p className="text-xs text-red-800 leading-relaxed font-medium">
                    Your score is <strong>{scoreResult.score}/{scoreResult.total} ({scoreResult.percentage}%)</strong>. SiBS compliance mandates a minimum passing grade of <strong>80% (5 of 6 correct)</strong>. Passing of Requirements (Step 2) remains locked until you achieve a passing score.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJumpToFirstFailedStage}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake / Correct Checkpoints</span>
              </button>
            </div>
          )}

          {/* Comprehensive Cumulative Score Card */}
          <div className={`p-6 rounded-2xl border shadow-xs space-y-4 transition-all ${
            scoreResult.passed
              ? "bg-[#F7F9FC] border-[#E6ECF2]"
              : "bg-red-50/30 border-red-300 ring-2 ring-red-200/50"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-xs ${
                  scoreResult.passed 
                    ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300" 
                    : "bg-red-100 text-red-800 border-2 border-red-400"
                }`}>
                  <span className="text-base leading-none">{scoreResult.score}/{scoreResult.total}</span>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider mt-0.5">{scoreResult.percentage}%</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-base font-extrabold ${
                      scoreResult.passed ? "text-[#042C51]" : "text-red-950"
                    }`}>
                      Overall Checkpoints Score: {scoreResult.score}/{scoreResult.total} ({scoreResult.percentage}%)
                    </h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      scoreResult.passed 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                      {scoreResult.passed ? "Passed (>= 80% Threshold Met)" : "Failed (< 80% Threshold)"}
                    </span>
                  </div>
                  <p className={`text-[12px] font-medium mt-1 ${
                    scoreResult.passed ? "text-slate-500" : "text-red-700"
                  }`}>
                    {scoreResult.passed 
                      ? "Congratulations! You have satisfied the SiBS orientation passing threshold. This score is synchronized directly with the Talent Acquisition NHO verification registry."
                      : "You have not met the 80% minimum passing requirement. You cannot complete orientation or submit requirements until your score is corrected."}
                  </p>
                </div>
              </div>
            </div>

            {/* Checkpoint Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#E6ECF2]">
              {NHO_QUIZ_STAGES.map(stage => {
                const stageQs = NHO_QUIZ_QUESTIONS.filter(q => q.stageId === stage.id);
                let stageScore = 0;
                stageQs.forEach(q => {
                  if (quizAnswers[q.id - 1] === q.correctOptionIndex) {
                    stageScore++;
                  }
                });
                const isStagePerfect = stageScore === stageQs.length;

                return (
                  <div 
                    key={stage.id} 
                    className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                      isStagePerfect
                        ? "bg-white border-emerald-200"
                        : "bg-red-50/60 border-red-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9.5px] font-black uppercase tracking-wider ${
                          isStagePerfect ? "text-[#FF5C28]" : "text-red-700"
                        }`}>
                          Part {stage.id}
                        </span>
                        {isStagePerfect ? (
                          <span className="text-[9.5px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> Passed
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold text-red-700 flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" /> Needs Fix
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-[#042C51] line-clamp-1" title={stage.title}>
                        {stage.title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className={`text-xs font-extrabold ${
                        isStagePerfect ? "text-emerald-800" : "text-red-700"
                      }`}>
                        Score: {stageScore}/{stageQs.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStageId(stage.id);
                          setViewMode("checkpoint");
                        }}
                        className={`text-[10px] font-bold hover:underline cursor-pointer ${
                          isStagePerfect ? "text-[#FF5C28]" : "text-red-700 font-extrabold"
                        }`}
                      >
                        {isStagePerfect ? "Review Quiz →" : "Correct Answers →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Policy Acknowledgment & Submission (LOCKED IF NOT PASSED) */}
          <div className={`p-6 border rounded-2xl space-y-4 transition-all ${
            scoreResult.passed && allQuestionsAnswered
              ? "bg-orange-50/70 border-orange-200 ring-2 ring-orange-200/50" 
              : "bg-red-50/40 border-red-200"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                scoreResult.passed ? "text-orange-950" : "text-red-900"
              }`}>
                <ShieldCheck className={`w-4 h-4 ${scoreResult.passed ? "text-[#FF5C28]" : "text-red-600"}`} />
                <span>Final Orientation Acknowledgment &amp; Policy Sign-Off</span>
                {scoreResult.passed && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    Checkpoints Passed ({scoreResult.score}/{scoreResult.total})
                  </span>
                )}
              </h4>
              {!scoreResult.passed && (
                <span className="text-[11px] text-red-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-red-600" />
                  <span>Locked: Passing score of 80% (5/6) strictly required to sign and proceed</span>
                </span>
              )}
            </div>

            <label className={`flex items-start gap-3 ${
              scoreResult.passed && allQuestionsAnswered ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={acknowledgmentChecked && scoreResult.passed}
                disabled={!scoreResult.passed || !allQuestionsAnswered || activeApplicant.orientationStatus === "Completed"}
                onChange={e => setAcknowledgmentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#FF5C28] focus:ring-[#FF5C28] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className={`text-xs leading-relaxed font-medium ${
                scoreResult.passed ? "text-slate-800" : "text-red-900"
              }`}>
                I hereby confirm that I have personally reviewed all seven (7) modules of the SiBS New Hire Orientation, answered all interspersed checkpoint quizzes, achieved the required passing grade, and agree to uphold all company policies, workplace standards, information security protocols, and attendance procedures.
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {activeApplicant.orientationStatus === "Completed" && activeApplicant.orientationQuizPassed !== false && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Orientation Confirmed &amp; Synchronized with TA Registry</span>
                </span>
              )}
              <div className="flex items-center gap-3 ml-auto">
                {!scoreResult.passed ? (
                  <button
                    type="button"
                    onClick={handleJumpToFirstFailedStage}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake / Correct Checkpoint Quizzes</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmCompletion}
                    disabled={!allQuestionsAnswered || !scoreResult.passed || !acknowledgmentChecked || activeApplicant.orientationStatus === "Completed"}
                    className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#e04f20] disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {activeApplicant.orientationStatus === "Completed" ? "Orientation Confirmed" : "Confirm Orientation Completion & Submit Score"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Celebratory Post-Completion Stage: Passing of Requirements (ONLY WHEN PASSED) */}
          {activeApplicant.orientationStatus === "Completed" && activeApplicant.orientationQuizPassed !== false && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-950">
                      Orientation &amp; Interspersed Quizzes Passed!
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Quiz Score: <strong>{activeApplicant.orientationQuizScore ?? 6}/{activeApplicant.orientationQuizTotal ?? 6} ({activeApplicant.orientationQuizPercentage ?? 100}%)</strong> · Completed {activeApplicant.orientationCompletedAt || "Today"}. Requirement submission is now unlocked.
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
