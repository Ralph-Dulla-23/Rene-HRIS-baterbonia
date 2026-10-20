import React from "react";
import { Search, Filter, User, X, RefreshCw } from "lucide-react";

interface OnboardingFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showStatusFilter: string;
  setShowStatusFilter: (v: string) => void;
  outcomeFilter: string;
  setOutcomeFilter: (v: string) => void;
  ownerFilter: string;
  setOwnerFilter: (v: string) => void;
  ownerOptions: string[];
  clearFilters: () => void;
}

export default function OnboardingFilters({
  searchTerm,
  setSearchTerm,
  showStatusFilter,
  setShowStatusFilter,
  outcomeFilter,
  setOutcomeFilter,
  ownerFilter,
  setOwnerFilter,
  ownerOptions,
  clearFilters
}: OnboardingFiltersProps) {
  const isFiltered = searchTerm !== "" || showStatusFilter !== "All" || outcomeFilter !== "All" || ownerFilter !== "All";

  return (
    <section className="bg-white p-4 rounded-2xl border border-[#E6ECF2] shadow-xs">
      <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, onboarding ID (ONB-XXXXX), position, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#042C51]/20 focus:border-[#042C51] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Show Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">
              STATUS FILTER
            </span>
            <select
              value={showStatusFilter}
              onChange={(e) => setShowStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Show">Show (True Hire)</option>
              <option value="No Show">No Show</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">
              OUTCOME
            </span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer"
            >
              <option value="All">All Outcomes</option>
              <option value="Pending Start">Pending Start</option>
              <option value="True Hire">True Hire</option>
              <option value="No Show">No Show</option>
              <option value="Pre-start Withdrawal">Pre-start Withdrawal</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">
              OWNER
            </span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#042C51] cursor-pointer max-w-[150px] truncate"
            >
              <option value="All">All Owners</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

