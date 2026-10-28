import { EmployeeJourney } from "./journeyTypes";

export interface EmphasizedEmployeeStatus {
  label: string;
  shortLabel: string;
  sublabel: string;
  badgeClass: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  isHandoffDue: boolean;
  handoffStatus?: "Pending" | "Submitted" | "Accepted";
  isUrgent: boolean;
  category: "handoff" | "training" | "ramp" | "consistency" | "regularized" | "risk";
}

/**
 * Returns the single authoritative, non-conflicting Employee Status.
 * Specifically emphasizes the Day 30 Checkpoint Handoff (post-PST and QA audit)
 * while eliminating conflicting auxiliary badges and redundant status labels.
 */
export function getEmphasizedEmployeeStatus(journey: EmployeeJourney): EmphasizedEmployeeStatus {
  const daysElapsed = journey.daysElapsed || 1;
  const handoff = journey.day30Handoff || journey.day30?.handoff;
  
  // Day 30 Checkpoint window: post-PST (Days 15-28) and QA audit (Days 20-35)
  // or anytime handoff is active and not yet accepted
  const inDay30HandoffWindow = (daysElapsed >= 20 && daysElapsed <= 38) || (handoff && handoff.status !== "Accepted" && daysElapsed <= 45);

  if (inDay30HandoffWindow) {
    if (!handoff || handoff.status === "Pending") {
      return {
        label: "⚠️ Day 30 Handoff to TL Pending",
        shortLabel: "Day 30 Handoff Due",
        sublabel: "Post-PST & QA Audit Complete • Trainer Endorsement Due to TL (HR Notified)",
        badgeClass: "bg-[#FF5C28] text-white border border-[#FF5C28] shadow-xs animate-pulse font-black",
        pillBg: "bg-[#FF5C28]",
        pillBorder: "border-[#FF5C28]",
        pillText: "text-white",
        isHandoffDue: true,
        handoffStatus: "Pending",
        isUrgent: true,
        category: "handoff"
      };
    }
    
    if (handoff.status === "Submitted") {
      return {
        label: "⏳ Awaiting TL Handoff Acceptance",
        shortLabel: "Awaiting TL Sign-off",
        sublabel: `Endorsed by ${handoff.trainerName || "Trainer"} • Awaiting Team Leader Custody Sign-off`,
        badgeClass: "bg-[#E67E22] text-white border border-[#E67E22] shadow-xs font-black",
        pillBg: "bg-[#E67E22]",
        pillBorder: "border-[#E67E22]",
        pillText: "text-white",
        isHandoffDue: true,
        handoffStatus: "Submitted",
        isUrgent: false,
        category: "handoff"
      };
    }
    
    if (handoff.status === "Accepted") {
      return {
        label: "✓ Handed Off to Team Leader (Ramp)",
        shortLabel: "Handed Off to TL",
        sublabel: `Custody Transferred to TL ${handoff.targetTlName || journey.tl || "Team Leader"}`,
        badgeClass: "bg-emerald-600 text-white border border-emerald-700 shadow-xs font-black",
        pillBg: "bg-emerald-600",
        pillBorder: "border-emerald-700",
        pillText: "text-white",
        isHandoffDue: false,
        handoffStatus: "Accepted",
        isUrgent: false,
        category: "handoff"
      };
    }
  }

  // Outside the Day 30 Handoff window: clean single statuses (no duplicate/conflicting badges)
  if (journey.finalOutcome === "Completed" || (daysElapsed >= 90 && journey.day90?.status === "Completed")) {
    return {
      label: "✓ Regularized Employee",
      shortLabel: "Regularized",
      sublabel: "Completed 90-day milestone and signed off",
      badgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold",
      pillBg: "bg-emerald-50",
      pillBorder: "border-emerald-300",
      pillText: "text-emerald-800",
      isHandoffDue: false,
      isUrgent: false,
      category: "regularized"
    };
  }

  if (journey.stage === "At Risk" || journey.day30?.status === "At Risk" || journey.day60?.status === "At Risk") {
    return {
      label: "⚠️ Performance At Risk",
      shortLabel: "At Risk",
      sublabel: "Supervisory corrective action active",
      badgeClass: "bg-rose-50 text-rose-800 border border-rose-300 font-bold",
      pillBg: "bg-rose-50",
      pillBorder: "border-rose-300",
      pillText: "text-rose-800",
      isHandoffDue: false,
      isUrgent: true,
      category: "risk"
    };
  }

  if (daysElapsed >= 60) {
    return {
      label: "Days 61–89: Performance Consistency",
      shortLabel: "Consistency Phase",
      sublabel: "Production evaluation with Team Leader",
      badgeClass: "bg-purple-50 text-purple-900 border border-purple-200 font-bold",
      pillBg: "bg-purple-50",
      pillBorder: "border-purple-200",
      pillText: "text-purple-900",
      isHandoffDue: false,
      isUrgent: false,
      category: "consistency"
    };
  }

  if (daysElapsed >= 30) {
    return {
      label: "Days 31–59: Ramp Operations",
      shortLabel: "Ramp Operations",
      sublabel: "Under Team Leader operational supervision",
      badgeClass: "bg-blue-50 text-[#042C51] border border-blue-200 font-bold",
      pillBg: "bg-blue-50",
      pillBorder: "border-blue-200",
      pillText: "text-[#042C51]",
      isHandoffDue: false,
      isUrgent: false,
      category: "ramp"
    };
  }

  if (daysElapsed >= 15) {
    return {
      label: "Days 15–28: Product Skills Training (PST)",
      shortLabel: "PST Training",
      sublabel: "Classroom curriculum & simulations",
      badgeClass: "bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold",
      pillBg: "bg-indigo-50",
      pillBorder: "border-indigo-200",
      pillText: "text-indigo-900",
      isHandoffDue: false,
      isUrgent: false,
      category: "training"
    };
  }

  return {
    label: "Days 1–14: Fundamental Skills Training (FST)",
    shortLabel: "FST Training",
    sublabel: "Foundation tools & core competencies",
    badgeClass: "bg-sky-50 text-sky-900 border border-sky-200 font-bold",
    pillBg: "bg-sky-50",
    pillBorder: "border-sky-200",
    pillText: "text-sky-900",
    isHandoffDue: false,
    isUrgent: false,
    category: "training"
  };
}
