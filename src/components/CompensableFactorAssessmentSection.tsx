import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Brain,
  HeartHandshake,
  Wind,
  Info,
  RotateCcw,
  Check,
  Edit3,
  Scale,
  FileSearch,
  Layers,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  CompensableFactorAssessmentItem,
  CompensableFactorAnalysisResponse
} from "../types/compensableFactors";
import {
  COMPENSABLE_FACTORS_CONFIG,
  FACTOR_CATEGORIES,
  FactorCategory
} from "../data/compensableFactorsConfig";

interface CompensableFactorAssessmentSectionProps {
  factors: CompensableFactorAssessmentItem[];
  onUpdateFactor: (index: number, updated: Partial<CompensableFactorAssessmentItem>) => void;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  overallSummary?: string;
  analyzedAt?: string;
  hasAnalyzed: boolean;
  onSupplyContext?: (factorKey: string, field: string, value: string) => void;
}

export const CompensableFactorAssessmentSection: React.FC<CompensableFactorAssessmentSectionProps> = ({
  factors,
  onUpdateFactor,
  onAnalyze,
  isAnalyzing,
  overallSummary,
  analyzedAt,
  hasAnalyzed,
  onSupplyContext
}) => {
  // Track open/collapsed state for each factor (by factor key)
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    education: true,
    workExperience: true,
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    COMPENSABLE_FACTORS_CONFIG.forEach((c) => {
      allOpen[c.key] = true;
    });
    setExpandedKeys(allOpen);
  };

  const collapseAll = () => {
    setExpandedKeys({});
  };

  const totalPoints = factors.reduce((sum, f) => sum + (Number(f.weightOrPoints) || 0), 0);
  const reviewedCount = factors.filter((f) => f.reviewed).length;
  const missingContextCount = factors.filter((f) => f.missingContext && f.missingContext.length > 0).length;

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            High Confidence
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Medium Confidence
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Low Confidence
          </span>
        );
      case "insufficient":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Needs Additional Context
          </span>
        );
    }
  };

  const getCategoryIcon = (category: FactorCategory) => {
    switch (category) {
      case "IQ":
        return <Brain className="w-4 h-4 text-blue-600" />;
      case "EQ":
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case "CONDITIONS":
        return <Wind className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t-2 border-slate-200" id="section-3-compensable-factors">
      {/* SECTION TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#042C51] via-[#0A3D6E] to-[#1E4E8C] text-white p-5 rounded-2xl shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5C28] text-white text-[11px] font-black uppercase tracking-wider">
              SECTION 3
            </span>
            <span className="text-blue-200 text-xs font-semibold">Job Evaluation Matrix</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Scale className="w-5 h-5 text-[#FF5C28]" />
            COMPENSABLE FACTOR ASSESSMENT
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Review the job requirements used to evaluate the relative complexity, responsibility, knowledge,
            interpersonal demands, and working conditions of the position.
          </p>
        </div>

        {/* ANALYZE ACTION BUTTON */}
        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
              isAnalyzing
                ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                : "bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white active:scale-95 hover:shadow-orange-500/20"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Analyzing Factors with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{hasAnalyzed ? "Re-Analyze Factors with AI" : "Analyze Compensable Factors"}</span>
              </>
            )}
          </button>

          {analyzedAt && (
            <span className="text-[10px] text-blue-200/80 text-center sm:text-right font-medium">
              Last analyzed: {new Date(analyzedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* METRICS & OVERVIEW STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Evaluated Factors</span>
          <span className="text-lg font-black text-[#042C51]">9 Official Factors</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Point Allocation</span>
          <span className="text-lg font-black text-[#FF5C28]">{totalPoints} Points</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Factors Reviewed</span>
          <span className="text-lg font-black text-emerald-600">
            {reviewedCount} / 9 <span className="text-xs text-slate-400 font-normal">checked</span>
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Context Gaps Identified</span>
          <span className={`text-lg font-black ${missingContextCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {missingContextCount} {missingContextCount === 1 ? "Factor" : "Factors"}
          </span>
        </div>
      </div>

      {/* OVERALL AI SUMMARY BANNER */}
      {overallSummary && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-[#042C51] uppercase tracking-wide">
              Evaluation Context Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{overallSummary}</p>
          </div>
        </div>
      )}

      {/* CONTROLS: EXPAND / COLLAPSE ALL */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">9 Factor Grading Breakdown</span>
          <span className="text-[11px] text-slate-400">Click any card to inspect evidence and adjust criteria</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={expandAll}
            className="text-[#042C51] hover:underline px-2 py-1 rounded hover:bg-slate-100"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-slate-500 hover:underline px-2 py-1 rounded hover:bg-slate-100"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* CATEGORY GROUPS */}
      <div className="space-y-6">
        {FACTOR_CATEGORIES.map((catGroup) => {
          const groupFactors = factors.filter((f) => f.category === catGroup.id);
          if (groupFactors.length === 0) return null;

          return (
            <div key={catGroup.id} className="space-y-3">
              {/* Category Header */}
              <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(catGroup.id)}
                  <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wide">
                    {catGroup.label}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {catGroup.numberRange}
                </span>
              </div>

              {/* Factor Cards */}
              <div className="space-y-3">
                {groupFactors.map((factor) => {
                  const factorIndex = factors.findIndex((f) => f.key === factor.key);
                  const isExpanded = Boolean(expandedKeys[factor.key]);
                  const config = COMPENSABLE_FACTORS_CONFIG.find((c) => c.key === factor.key);

                  return (
                    <div
                      key={factor.key}
                      className={`bg-white border rounded-xl transition-all shadow-xs overflow-hidden ${
                        isExpanded ? "border-[#042C51]/30 ring-1 ring-[#042C51]/10" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* CARD COLLAPSED / HEADER ROW */}
                      <div
                        onClick={() => toggleExpand(factor.key)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          {/* Factor Number Badge */}
                          <span className="w-7 h-7 rounded-lg bg-[#042C51] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {factor.factorNumber}
                          </span>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-[#042C51]">{factor.factor}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {factor.category}
                              </span>
                              {factor.reviewed && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3" /> Reviewed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {config?.shortDescription || factor.summary}
                            </p>
                          </div>
                        </div>

                        {/* Right Pill Badges & Toggle */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                          {getConfidenceBadge(factor.confidence)}

                          <div className="text-right pl-2 border-l border-slate-200">
                            <span className="text-xs font-black text-[#042C51] block">
                              {factor.weightOrPoints ?? config?.defaultPoints ?? 10} pts
                            </span>
                          </div>

                          <div className="p-1 rounded-md text-slate-400 hover:text-[#042C51]">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* EXPANDED CONTENT (PROGRESSIVE DISCLOSURE) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4 text-xs"
                          >
                            {/* Factor Context Definition */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-[#FF5C28]" />
                                What this factor measures
                              </span>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {config?.aiDefinition || config?.shortDescription}
                              </p>
                            </div>

                            {/* Qualitative Assessment & Rationale */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                  Position Assessment Rating
                                </span>
                                <div className="font-bold text-sm text-[#042C51] flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                                  <span>{factor.assessment || "Standard Operational Level"}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                  {factor.summary}
                                </p>
                              </div>

                              {/* Evidence Found in JD */}
                              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <FileSearch className="w-3.5 h-3.5 text-blue-600" />
                                    Evidence Extracted From JD
                                  </span>
                                  <span className="text-slate-400 font-normal">
                                    {factor.evidence?.length || 0} excerpts
                                  </span>
                                </span>

                                {factor.evidence && factor.evidence.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {factor.evidence.map((ev, i) => (
                                      <div
                                        key={i}
                                        className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed"
                                      >
                                        <span className="font-bold text-[#042C51] capitalize inline-block mr-1">
                                          [{ev.sourceField}]:
                                        </span>
                                        "{ev.text}"
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-800 text-[11px]">
                                    No explicit direct statements found in the current Job Description text for this factor.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Missing Context & Additional Info Needed */}
                            {factor.missingContext && factor.missingContext.length > 0 && (
                              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>Additional Information Needed / Context Gaps</span>
                                </div>
                                <ul className="space-y-1 text-xs text-amber-800 pl-5 list-disc">
                                  {factor.missingContext.map((gap, i) => (
                                    <li key={i} className="leading-relaxed">
                                      {gap}
                                    </li>
                                  ))}
                                </ul>

                                {/* Structured Quick Answers if available */}
                                {config?.structuredPrompts && config.structuredPrompts.length > 0 && (
                                  <div className="pt-2 border-t border-amber-200/60 space-y-2">
                                    {config.structuredPrompts.map((prompt) => (
                                      <div key={prompt.id} className="space-y-1.5">
                                        <span className="text-[11px] font-bold text-amber-950 block">
                                          Quick Context Specification: {prompt.label}
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {prompt.options.map((opt) => (
                                            <button
                                              key={opt.value}
                                              type="button"
                                              onClick={() => {
                                                if (onSupplyContext) {
                                                  onSupplyContext(factor.key, prompt.id, opt.label);
                                                }
                                                // Append to factor criteria
                                                const currentCriteria = factor.criteria || factor.summary || "";
                                                onUpdateFactor(factorIndex, {
                                                  criteria: `${currentCriteria}\n• ${prompt.label}: ${opt.label}`.trim(),
                                                  missingContext: factor.missingContext.filter((m) => !m.toLowerCase().includes(prompt.id.toLowerCase())),
                                                  reviewed: true,
                                                });
                                              }}
                                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-medium transition-colors shadow-2xs"
                                            >
                                              {opt.label}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* User Review / Editable Criteria & Points */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[#042C51] uppercase tracking-wide flex items-center gap-1.5">
                                  <Edit3 className="w-3.5 h-3.5 text-[#FF5C28]" />
                                  Evaluation Criteria & Statement (Editable)
                                </span>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#042C51] cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(factor.reviewed)}
                                      onChange={(e) =>
                                        onUpdateFactor(factorIndex, { reviewed: e.target.checked })
                                      }
                                      className="rounded border-slate-300 text-[#FF5C28] focus:ring-[#FF5C28]"
                                    />
                                    <span>Mark as Reviewed</span>
                                  </label>

                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-bold text-slate-500">Points:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      value={factor.weightOrPoints ?? config?.defaultPoints ?? 10}
                                      onChange={(e) =>
                                        onUpdateFactor(factorIndex, {
                                          weightOrPoints: Number(e.target.value) || 0,
                                        })
                                      }
                                      className="w-16 p-1 text-center font-black text-xs rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                                    />
                                  </div>
                                </div>
                              </div>

                              <textarea
                                rows={2}
                                value={factor.criteria || factor.summary || ""}
                                onChange={(e) =>
                                  onUpdateFactor(factorIndex, {
                                    criteria: e.target.value,
                                    source: "Manual",
                                  })
                                }
                                placeholder="Enter specific evaluation criteria for this factor..."
                                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28] text-slate-800 leading-relaxed font-sans"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompensableFactorAssessmentSection;
