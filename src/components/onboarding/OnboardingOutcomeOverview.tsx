import React from "react";
import { Info, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { OnboardingStatsData } from "./types";

interface OnboardingOutcomeOverviewProps {
  stats: OnboardingStatsData;
}

export default function OnboardingOutcomeOverview({ stats }: OnboardingOutcomeOverviewProps) {
  const bars = [
    {
      label: "True Hires",
      color: "bg-emerald-500",
      textColor: "text-emerald-800",
      pct: stats.trueHiresPct,
      count: stats.trueHires,
    },
    {
      label: "Pending Start",
      color: "bg-amber-500",
      textColor: "text-amber-800",
      pct: stats.pendingStartPct,
      count: stats.pending,
    },
    {
      label: "No Show",
      color: "bg-rose-500",
      textColor: "text-rose-800",
      pct: stats.noShowPct,
      count: stats.noShow,
    },
    {
      label: "Pre-start Withdrawal",
      color: "bg-orange-500",
      textColor: "text-orange-800",
      pct: stats.withdrawalPct,
      count: stats.withdrawals,
    },
  ];

  return (
    <section className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left Column: Progress Bars */}
      <div className="lg:col-span-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FF5C28]" />
            Onboarding Outcome Distribution
          </h3>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Total Records: {stats.total}
          </span>
        </div>

        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className={`${bar.textColor} flex items-center gap-2`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${bar.color}`}></span>
                  {bar.label}
                </span>
                <span className="text-slate-700 font-mono text-[11px]">
                  {bar.pct}% ({bar.count})
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full ${bar.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Navy Rule Box */}
      <div className="lg:col-span-5 bg-[#042C51] p-4 rounded-2xl border border-[#042C51] text-white flex items-start gap-3.5 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-28 h-28 bg-[#FF5C28]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="p-2.5 bg-[#FF5C28]/20 text-[#FF5C28] rounded-xl shrink-0 border border-[#FF5C28]/30">
          <ShieldCheck className="w-5 h-5 text-[#FF5C28]" />
        </div>
        <div className="space-y-1.5 relative z-10">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            Onboarding Governance Rule
          </h4>
          <p className="text-[11.5px] text-slate-200 leading-relaxed font-normal">
            Accepted Offer automatically generates Onboarding records. Onboarding determines if the candidate becomes a <span className="font-bold text-emerald-400">True Hire</span>. Only <span className="font-bold text-emerald-400">Show</span> moves the candidate to Hired and updates requisition count.
          </p>
        </div>
      </div>
    </section>
  );
}

