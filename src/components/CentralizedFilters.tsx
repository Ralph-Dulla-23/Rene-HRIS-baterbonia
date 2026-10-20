import React from "react";
import { SlidersHorizontal, RefreshCw, Search } from "lucide-react";

export interface FilterSelectConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | { label: string; value: string }[];
  placeholder?: string;
}

export interface FilterDateConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
}

interface CentralizedFiltersProps {
  title?: string;
  resetLabel?: string;
  onReset: () => void;
  
  // Optional search bar
  search?: {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };

  // List of select dropdown configurations
  selects?: FilterSelectConfig[];

  // Optional date filters (From/To)
  dateFrom?: FilterDateConfig;
  dateTo?: FilterDateConfig;
}

export default function CentralizedFilters({
  title = "Refine Filters",
  resetLabel = "Reset all",
  onReset,
  search,
  selects = [],
  dateFrom,
  dateTo,
}: CentralizedFiltersProps) {
  
  // Total number of items we want in the grid
  const itemsCount = 
    (search ? 1 : 0) + 
    selects.length + 
    (dateFrom ? 1 : 0) + 
    (dateTo ? 1 : 0);

  // Dynamically set cols based on count
  const gridColsClass = 
    itemsCount >= 5 
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" 
      : itemsCount === 4 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
        : itemsCount === 3 
          ? "grid-cols-1 sm:grid-cols-3" 
          : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E6ECF2] shadow-sm mb-6 select-none">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#042C51]" />
          <span className="text-xs font-bold text-[#042C51] uppercase tracking-wide">
            {title}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] font-black text-[#FF5C28] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          {resetLabel}
        </button>
      </div>

      <div className={`grid ${gridColsClass} gap-4`}>
        {/* Search Term Filter */}
        {search && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
              {search.label || "Search Employee"}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={search.placeholder || "Name or ID..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#042C51] focus:ring-2 focus:ring-[#FF5C28]/20 focus:border-[#FF5C28] focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Custom Selects Filters */}
        {selects.map((select, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
              {select.label}
            </label>
            <select
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {select.options.map((opt, oIdx) => {
                if (typeof opt === "string") {
                  return (
                    <option key={oIdx} value={opt}>
                      {opt}
                    </option>
                  );
                }
                return (
                  <option key={oIdx} value={opt.value}>
                    {opt.label}
                  </option>
                );
              })}
            </select>
          </div>
        ))}

        {/* From Date Filter */}
        {dateFrom && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-semibold">
              {dateFrom.label}
            </label>
            <input
              type="date"
              value={dateFrom.value}
              onChange={(e) => dateFrom.onChange(e.target.value)}
              max={dateFrom.max}
              min={dateFrom.min}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
            />
          </div>
        )}

        {/* To Date Filter */}
        {dateTo && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-semibold">
              {dateTo.label}
            </label>
            <input
              type="date"
              value={dateTo.value}
              onChange={(e) => dateTo.onChange(e.target.value)}
              max={dateTo.max}
              min={dateTo.min}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl px-3 py-2 text-xs font-bold text-[#042C51] focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/20"
            />
          </div>
        )}
      </div>
    </div>
  );
}
