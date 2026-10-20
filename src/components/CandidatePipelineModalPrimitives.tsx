import React, { useEffect } from "react";
import { X, ArrowRight, User, Sparkles, History, Clock, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ==================== CANDIDATE PIPELINE MODAL PRIMITIVES ====================

export interface CandidateModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  kicker?: string;
  candidateInfo?: {
    name: string;
    email?: string;
    contactNumber?: string;
    candidateId?: string;
    currentStage?: string;
    prfStatus?: string;
    roleTitle?: string;
    account?: string;
  };
  maxWidth?: string; // e.g. "max-w-6xl", "max-w-xl", "max-w-md"
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isSubmitting?: boolean;
}

export function CandidatePipelineModalShell({
  isOpen,
  onClose,
  title,
  kicker = "Candidate Pipeline Record",
  candidateInfo,
  maxWidth = "max-w-6xl",
  headerAction,
  children,
  footer,
  isSubmitting = false,
}: CandidateModalShellProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex h-dvh items-center justify-center overflow-hidden bg-[#042C51]/60 px-2 py-2 font-jakarta backdrop-blur-sm sm:px-4 sm:py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className={`relative flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-sm:max-h-[calc(100dvh-1rem)]`}
        >
          {/* Navy Operational Header */}
          <div className="shrink-0 bg-[#042C51] px-3.5 py-2 text-white sm:px-5 2xl:py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {candidateInfo ? (
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-[#FF5C28] text-sm font-black text-white shadow-sm">
                  {candidateInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "CAN"}
                </div>
              ) : null}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wide text-white/90">
                    {kicker}
                  </span>
                  {candidateInfo?.currentStage && (
                    <span className="text-[10px] bg-[#FF5C28] text-white font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                      {candidateInfo.currentStage}
                    </span>
                  )}
                  {candidateInfo?.prfStatus && (
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      candidateInfo.prfStatus === "Matched"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : candidateInfo.prfStatus === "Not Matched"
                        ? "bg-rose-500/20 text-rose-300 border-rose-400/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                    }`}>
                      PRF: {candidateInfo.prfStatus}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-extrabold leading-tight text-white sm:text-base">
                    {candidateInfo ? candidateInfo.name : title}
                  </h3>
                </div>

                {candidateInfo && (
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-white/70">
                    {[
                      candidateInfo.roleTitle,
                      candidateInfo.account,
                      candidateInfo.candidateId ? `ID: ${candidateInfo.candidateId}` : null,
                      candidateInfo.email
                    ].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerAction}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/80 transition hover:border-[#FF5C28]/60 hover:bg-[#FF5C28] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Internally Scrollable Body */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] p-2.5 text-xs text-[#101828] sm:p-3.5 2xl:p-5 sibs-scrollbar">
            {children}
          </div>

          {/* Optional Fixed Footer */}
          {footer && (
            <div className="shrink-0 border-t border-[#E6ECF2] bg-white px-3.5 py-2 sm:px-5 2xl:py-2.5">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ==================== SHOPEE-STYLE MOVEMENT HISTORY SIDEBAR ====================

export interface MovementHistorySidebarProps {
  candidateName: string;
  currentStage: string;
  timeline: Array<{
    id: string;
    stage: string;
    date: string;
    updatedBy: string;
    reason: string;
  }>;
  onClose: () => void;
}

export function MovementHistorySidebar({
  candidateName,
  currentStage,
  timeline,
  onClose,
}: MovementHistorySidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col h-full sticky top-0"
    >
      {/* Shopee-style Sidebar Header */}
      <div className="bg-[#042C51] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#083a69] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-[#FF5C28] text-white rounded-xl shadow-2xs shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black uppercase text-white tracking-wider truncate">
              Movement History
            </h4>
            <p className="text-[10px] text-slate-300 font-medium truncate">
              Shopee-style Pipeline Audit Trail
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer shrink-0"
          title="Close Movement History Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current Stage Live Tracking Banner */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-[#042C51] text-[11px] uppercase tracking-wide">
            Live Status
          </span>
        </div>
        <span className="px-2.5 py-0.5 bg-[#FF5C28] text-white font-black text-[10px] rounded-full uppercase shadow-2xs">
          {currentStage}
        </span>
      </div>

      {/* Shopee Tracking Vertical Timeline */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
          {timeline.map((item, index) => {
            const isLatest = index === 0;
            return (
              <div key={item.id} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    isLatest
                      ? "bg-[#FF5C28] border-white text-white ring-4 ring-[#FF5C28]/20 shadow-2xs"
                      : "bg-[#042C51] border-white text-white"
                  }`}
                >
                  {isLatest ? (
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  ) : (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Event Card Container */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isLatest
                      ? "bg-orange-50/50 border-orange-200/90 shadow-2xs"
                      : "bg-[#F8FAFC] border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-black text-[#042C51] text-xs">
                      {item.stage}
                    </span>
                    {isLatest && (
                      <span className="px-1.5 py-0.5 bg-[#FF5C28] text-white font-black text-[8px] rounded uppercase tracking-wider">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                    <span>By: <strong className="text-slate-700">{item.updatedBy}</strong></span>
                    <span>{item.date}</span>
                  </div>

                  {item.reason && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200/70 text-slate-700 font-medium text-[11px] leading-snug">
                      {item.reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Audit Counter */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium shrink-0">
        Total <strong className="text-[#042C51] font-bold">{timeline.length}</strong> stage movement{timeline.length !== 1 ? "s" : ""} recorded
      </div>
    </motion.aside>
  );
}

// ==================== CANDIDATE MODAL SUMMARY ====================

export interface CandidateModalSummaryProps {
  candidate: {
    name: string;
    email?: string;
    contactNumber?: string;
    candidateId?: string;
    currentStage?: string;
    prfStatus?: string;
    roleTitle?: string;
    account?: string;
  };
  actionButton?: React.ReactNode;
}

export function CandidateModalSummary({ candidate, actionButton }: CandidateModalSummaryProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#E6ECF2] bg-white p-3 shadow-[0_8px_22px_rgba(4,44,81,0.04)] sm:flex-row sm:items-center sm:p-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#042C51] text-xs font-black text-white shadow-sm">
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "CAN"}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-xs font-extrabold uppercase text-[#042C51]">{candidate.name}</h4>
            {candidate.candidateId && (
              <span className="text-[10px] text-slate-400 font-mono font-bold">({candidate.candidateId})</span>
            )}
          </div>
          <p className="truncate text-[10px] font-semibold text-[#667085]">
            {[candidate.roleTitle, candidate.account].filter(Boolean).join(" • ") || "Candidate Application"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {candidate.currentStage && (
          <span className="px-2.5 py-1 bg-blue-50 text-[#042C51] border border-blue-100 text-[10px] font-black rounded-full uppercase">
            {candidate.currentStage}
          </span>
        )}
        {actionButton}
      </div>
    </div>
  );
}

// ==================== CANDIDATE MODAL SECTION ====================

export interface CandidateModalSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CandidateModalSection({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = "",
}: CandidateModalSectionProps) {
  return (
    <section className={`rounded-xl border border-[#E6ECF2] bg-white p-3 shadow-[0_8px_22px_rgba(4,44,81,0.04)] sm:p-3.5 2xl:p-4 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-[#EEF2F6] pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          {icon || <Sparkles className="w-4 h-4 text-[#FF5C28]" />}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#042C51]">{title}</h4>
            {subtitle && <p className="mt-0.5 text-[10px] font-semibold text-[#667085]">{subtitle}</p>}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      <div>{children}</div>
    </section>
  );
}

// ==================== BUTTON PRIMITIVES ====================

export interface CandidateModalPrimaryButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "orange" | "red" | "navy" | "emerald";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CandidateModalPrimaryButton({
  onClick,
  type = "button",
  disabled = false,
  variant = "orange",
  icon = <ArrowRight className="w-3.5 h-3.5" />,
  children,
  className = "",
}: CandidateModalPrimaryButtonProps) {
  const variantStyles = {
    orange: "bg-[#FF5C28] hover:bg-[#E94F1F] text-white focus-visible:ring-[#FF5C28]/20",
    red: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500/20",
    navy: "bg-[#042C51] hover:bg-[#063C69] text-white focus-visible:ring-[#042C51]/20",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500/20",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-xs font-extrabold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      <span>{children}</span>
      {icon}
    </button>
  );
}

export interface CandidateModalSecondaryButtonProps {
  onClick?: () => void;
  type?: "button";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CandidateModalSecondaryButton({
  onClick,
  type = "button",
  disabled = false,
  children,
  className = "",
}: CandidateModalSecondaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D7DEE8] bg-white px-4 text-xs font-extrabold text-[#042C51] transition hover:border-[#FF5C28]/40 hover:bg-[#FFF8F5] hover:text-[#FF5C28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF5C28]/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
