import React from "react";
import { CheckSquare, UserCheck, Clock3, UserX, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { OnboardingStatsData } from "./types";

interface OnboardingStatsProps {
  stats: OnboardingStatsData;
}

export default function OnboardingStats({ stats }: OnboardingStatsProps) {
  const cards = [
    {
      title: "Total Records",
      value: stats.total,
      subtext: "Total onboarding records",
      icon: CheckSquare,
      bgCard: "bg-white border-[#E6ECF2]",
      iconBg: "bg-slate-50 border-slate-100 text-[#042C51]",
      valueColor: "text-[#042C51]",
      subColor: "text-slate-400",
      titleColor: "text-slate-400",
      badge: null,
    },
    {
      title: "True Hires",
      value: stats.trueHires,
      subtext: "Reported & placed hires",
      icon: UserCheck,
      bgCard: "bg-white border-emerald-200/80 bg-emerald-50/10",
      iconBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
      valueColor: "text-emerald-800",
      subColor: "text-emerald-600/80",
      titleColor: "text-emerald-800",
      badge: `${stats.trueHiresPct}%`,
    },
    {
      title: "Pending Start",
      value: stats.pending,
      subtext: "Awaiting expected start date",
      icon: Clock3,
      bgCard: "bg-white border-amber-200/80 bg-amber-50/10",
      iconBg: "bg-amber-50 border-amber-100 text-amber-600",
      valueColor: "text-amber-800",
      subColor: "text-amber-600/80",
      titleColor: "text-amber-800",
      badge: `${stats.pendingStartPct}%`,
    },
    {
      title: "No Show",
      value: stats.noShow,
      subtext: "Ghosted on Day 1",
      icon: UserX,
      bgCard: "bg-white border-rose-200/80 bg-rose-50/10",
      iconBg: "bg-rose-50 border-rose-100 text-rose-600",
      valueColor: "text-rose-800",
      subColor: "text-rose-600/80",
      titleColor: "text-rose-800",
      badge: `${stats.noShowPct}%`,
    },
    {
      title: "Withdrawal",
      value: stats.withdrawals,
      subtext: "Pre-start drop-offs",
      icon: AlertTriangle,
      bgCard: "bg-white border-orange-200/80 bg-orange-50/10",
      iconBg: "bg-orange-50 border-orange-100 text-orange-600",
      valueColor: "text-orange-800",
      subColor: "text-orange-600/80",
      titleColor: "text-orange-800",
      badge: `${stats.withdrawalPct}%`,
    },
    {
      title: "Show Rate",
      value: `${stats.showRate}%`,
      subtext: "True Hires / Resolved",
      icon: TrendingUp,
      bgCard: "bg-white border-indigo-200/80 bg-indigo-50/10",
      iconBg: "bg-indigo-50 border-indigo-100 text-indigo-600",
      valueColor: "text-indigo-800",
      subColor: "text-indigo-600/80",
      titleColor: "text-indigo-800",
      badge: "KPI",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className={`p-3.5 rounded-2xl border shadow-xs flex flex-col justify-between relative overflow-hidden h-[115px] transition-all hover:shadow-md ${c.bgCard}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider ${c.titleColor}`}>
                {c.title}
              </span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${c.iconBg}`}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-1.5">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-extrabold tracking-tight ${c.valueColor}`}>
                  {c.value}
                </span>
                {c.badge && (
                  <span className="text-[10px] font-black text-slate-500 font-mono">
                    ({c.badge})
                  </span>
                )}
              </div>
              <div className={`text-[9px] font-bold mt-1 uppercase tracking-wide ${c.subColor}`}>
                {c.subtext}
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}


