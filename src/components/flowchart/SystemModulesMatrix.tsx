import React, { useState } from "react";
import { 
  BarChart2, 
  Users, 
  Building2, 
  Settings, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";
import { SYSTEM_MODULES_SUMMARY } from "./flowchartData";

interface SummaryMatrixProps {
  onSwitchModule?: (moduleKey: string) => void;
}

export default function SystemModulesMatrix({ onSwitchModule }: SummaryMatrixProps) {
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BarChart2":
        return <BarChart2 className="w-4 h-4 text-[#FF5C28]" />;
      case "Users":
        return <Users className="w-4 h-4 text-[#6B21A8]" />;
      case "Building2":
        return <Building2 className="w-4 h-4 text-[#1D68BD]" />;
      default:
        return <Settings className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleLaunchScreen = (screen: string, fallbackKey: string) => {
    if (!onSwitchModule) return;
    if (screen.includes("Overview") || screen.includes("Plan")) {
      onSwitchModule("Workforce Hiring");
    } else if (screen.includes("Job Description")) {
      onSwitchModule("Job Description");
    } else if (screen.includes("Intake")) {
      onSwitchModule("Hiring Needs Intake");
    } else if (screen.includes("Available")) {
      onSwitchModule("Available Positions");
    } else if (screen.includes("Sourcing")) {
      onSwitchModule("Sourcing Analytics");
    } else if (screen.includes("Leads")) {
      onSwitchModule("Applicant Leads");
    } else if (screen.includes("Public")) {
      onSwitchModule("Public Application Form");
    } else if (screen.includes("Talent Pool")) {
      onSwitchModule("Talent Pool");
    } else if (screen.includes("Offers")) {
      onSwitchModule("Offers");
    } else if (screen.includes("Onboarding")) {
      onSwitchModule("Onboarding");
    } else if (screen.includes("Time & Attendance")) {
      onSwitchModule("Time & Attendance");
    } else if (screen.includes("Leaves")) {
      onSwitchModule("Leaves & Time Off");
    } else if (screen.includes("Resignations")) {
      onSwitchModule("Resignation Management");
    } else if (screen.includes("Super Admin")) {
      onSwitchModule("Super Admin Dashboard");
    } else if (screen.includes("Departments")) {
      onSwitchModule("Departments");
    } else if (screen.includes("Office Locations")) {
      onSwitchModule("Office Locations");
    } else if (screen.includes("Recruitment Settings")) {
      onSwitchModule("Recruitment Settings");
    } else if (screen.includes("Email Logs")) {
      onSwitchModule("Email Logs");
    } else {
      onSwitchModule(fallbackKey);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
              OPERATIONAL MAPPING
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#042C51]">
              Summary of System Modules & Wireframe Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Official operational mapping connecting Functional Areas to Primary Screens, Actions, Outputs, and wireframe launch points.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards" ? "bg-[#042C51] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Responsive Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" ? "bg-[#1D68BD] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Full Matrix Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Table</span>
            </button>
          </div>

          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4 Core Areas</span>
          </span>
        </div>
      </div>

      {/* ==================== 1. MOBILE RESPONSIVE CARDS (SHOW ON CARDS MODE OR SMALL SCREENS) ==================== */}
      {(viewMode === "cards" || viewMode === "auto") && (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${viewMode === "auto" ? "md:hidden" : ""}`}>
          {SYSTEM_MODULES_SUMMARY.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
            >
              <div>
                {/* Card Title & Badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                      {getIcon(item.icon)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-[#042C51] leading-tight">
                        {item.area}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-black mt-1 border ${item.badgeColor}`}>
                        {item.primaryScreens.length} Active Screens
                      </span>
                    </div>
                  </div>
                  
                  {onSwitchModule && (
                    <button
                      onClick={() => onSwitchModule(item.primaryModuleKey)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#042C51] text-[#042C51] hover:text-white transition-colors cursor-pointer shrink-0"
                      title={`Open ${item.area}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Primary Screens */}
                <div className="mt-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Primary Screens & Views:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.primaryScreens.map((screen, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleLaunchScreen(screen, item.primaryModuleKey)}
                        className="px-2 py-1 bg-slate-100 hover:bg-[#1D68BD] hover:text-white rounded-lg text-[10.5px] font-extrabold text-[#042C51] border border-slate-200 transition-all cursor-pointer shadow-2xs text-left"
                        title={`Click to launch ${screen}`}
                      >
                        {screen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Actions */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Key Actions & Outputs:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {item.keyActions.map((action, aIdx) => (
                      <li key={aIdx} className="leading-snug">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Button */}
              {onSwitchModule && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSwitchModule(item.primaryModuleKey)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#042C51] hover:bg-[#1D68BD] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    <span>Launch {item.area}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==================== 2. STRUCTURED MATRIX TABLE (SHOW ON DESKTOP OR TABLE VIEW) ==================== */}
      {(viewMode === "table" || viewMode === "auto") && (
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${viewMode === "auto" ? "hidden md:block" : ""}`}>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-5">Functional Area</th>
                  <th className="py-3.5 px-4 sm:px-5">Primary Screens / Views</th>
                  <th className="py-3.5 px-4 sm:px-5">Key Actions & Outputs</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Quick Navigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {SYSTEM_MODULES_SUMMARY.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Functional Area */}
                    <td className="py-4 px-4 sm:px-5 align-top min-w-[200px]">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                          {getIcon(item.icon)}
                        </div>
                        <div>
                          <span className="font-black text-sm text-[#042C51] block">
                            {item.area}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black mt-1 border ${item.badgeColor}`}>
                            {item.primaryScreens.length} Active Screens
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Primary Screens */}
                    <td className="py-4 px-4 sm:px-5 align-top min-w-[260px]">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {item.primaryScreens.map((screen, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleLaunchScreen(screen, item.primaryModuleKey)}
                            className="px-2 py-1 bg-slate-100 hover:bg-[#1D68BD] hover:text-white rounded-lg text-[10.5px] font-extrabold text-[#042C51] border border-slate-200 transition-all cursor-pointer shadow-2xs text-left"
                            title={`Click to launch ${screen}`}
                          >
                            {screen}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Key Actions & Outputs */}
                    <td className="py-4 px-4 sm:px-5 align-top min-w-[220px]">
                      <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                        {item.keyActions.map((action, aIdx) => (
                          <li key={aIdx} className="leading-snug">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* Launch */}
                    <td className="py-4 px-4 sm:px-5 align-top text-right min-w-[140px]">
                      {onSwitchModule && (
                        <button
                          onClick={() => onSwitchModule(item.primaryModuleKey)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#042C51] hover:bg-[#1D68BD] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                          title={`Open ${item.area}`}
                        >
                          <span>Launch Area</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
