import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Layers
} from "lucide-react";
import { OnboardingRecord } from "./types";

interface OnboardingTableProps {
  records: OnboardingRecord[];
  onViewRecord: (record: OnboardingRecord) => void;
}

const PAGE_SIZE = 8;

export default function OnboardingTable({ records, onViewRecord }: OnboardingTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page if records change length
  const totalPages = Math.ceil(records.length / PAGE_SIZE) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return records.slice(start, start + PAGE_SIZE);
  }, [records, safePage]);

  const startIndex = records.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(safePage * PAGE_SIZE, records.length);

  const getInitials = (name: string) => {
    if (!name) return "ON";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E6ECF2] shadow-xs overflow-hidden flex flex-col">
      {/* Table Section Header Bar */}
      <div className="p-4 border-b border-[#E6ECF2] bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#042C51] text-white rounded-lg shadow-2xs">
            <Layers className="w-4 h-4 text-[#FF5C28]" />
          </span>
          <h3 className="text-xs font-black text-[#042C51] uppercase tracking-wider flex items-center gap-2">
            ACTIVE ONBOARDING RECORDS & MATRIX
          </h3>
          <span className="text-[10px] bg-blue-50 text-[#042C51] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
            Pipeline Sync Active
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span>Showing <strong className="text-slate-800">{records.length}</strong> of <strong className="text-slate-800">{records.length}</strong> records</span>
        </div>
      </div>

      {/* Desktop Table View (lg+) */}
      <div className="hidden lg:block overflow-x-auto">
        {records.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-[#042C51]/10 text-[#042C51] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No onboarding records match your current search/filters.</p>
            <p className="text-[11px] text-slate-400">Try adjusting your search terms or filter selections above.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Onboarding ID</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Role / Account</th>
                <th className="py-3.5 px-4">Accepted Offer</th>
                <th className="py-3.5 px-4">Expected Start</th>
                <th className="py-3.5 px-4">Actual Start</th>
                <th className="py-3.5 px-4">Show Status</th>
                <th className="py-3.5 px-4">Final Outcome</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/90 transition-colors group">
                  {/* Onboarding ID */}
                  <td className="py-3.5 px-4 font-mono font-black text-[#042C51]">
                    <button
                      type="button"
                      onClick={() => onViewRecord(r)}
                      className="text-[#042C51] hover:text-[#FF5C28] font-black hover:underline cursor-pointer transition-colors"
                    >
                      {r.onboardingId || r.id}
                    </button>
                  </td>

                  {/* Candidate Name + Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#042C51] text-[#FF5C28] font-black text-[11px] flex items-center justify-center shrink-0 border border-[#042C51]/10 shadow-2xs">
                        {getInitials(r.candidateName)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-900 text-xs group-hover:text-[#042C51] transition-colors">
                          {r.candidateName}
                        </p>
                        <p className="text-[10px] text-slate-500">{r.candidateEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role / Account */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 leading-tight">{r.roleTitle}</p>
                      <span className="inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold border border-slate-200/80">
                        {r.account}
                      </span>
                    </div>
                  </td>

                  {/* Accepted Offer Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    <div className="flex items-center gap-1.5 text-xs">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.acceptedOfferDate}</span>
                    </div>
                  </td>

                  {/* Expected Start Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">
                    {r.expectedStartDate}
                  </td>

                  {/* Actual Start Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {r.actualStartDate ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        {r.actualStartDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Show Status Badge */}
                  <td className="py-3.5 px-4">
                    {r.showStatus === "Show" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-100/80 text-emerald-900 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Show
                      </span>
                    )}
                    {r.showStatus === "No Show" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-100/80 text-rose-900 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        No Show
                      </span>
                    )}
                    {r.showStatus === "Withdrawn" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-orange-100/80 text-orange-900 border border-orange-300">
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                        Withdrawn
                      </span>
                    )}
                    {r.showStatus === "Pending" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-100/80 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Final Outcome Badge */}
                  <td className="py-3.5 px-4">
                    {r.finalOutcome === "True Hire" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider shadow-2xs">
                        True Hire
                      </span>
                    )}
                    {r.finalOutcome === "No Show" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200">
                        No Show
                      </span>
                    )}
                    {r.finalOutcome === "Pre-start Withdrawal" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-900 border border-orange-200">
                        Pre-start Withdrawal
                      </span>
                    )}
                    {r.finalOutcome === "Pending Start" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                        Pending Start
                      </span>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4 text-slate-700 font-semibold text-xs">
                    {r.owner}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewRecord(r)}
                      className="px-3.5 py-1.5 bg-[#042C51] hover:bg-[#FF5C28] text-white font-bold text-xs rounded-xl shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards View (below lg) */}
      <div className="lg:hidden divide-y divide-slate-200">
        {paginatedRecords.map((r) => (
          <div key={r.id} className="p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-xs text-[#042C51]">
                {r.onboardingId || r.id}
              </span>
              <div className="flex gap-1.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {r.showStatus}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#042C51] text-white">
                  {r.finalOutcome}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#042C51] text-[#FF5C28] font-black text-xs flex items-center justify-center shrink-0">
                {getInitials(r.candidateName)}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{r.candidateName}</p>
                <p className="text-xs text-slate-500">{r.candidateEmail}</p>
                <p className="text-xs font-bold text-[#042C51] mt-1">{r.roleTitle} • {r.account}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-black block">Expected Start</span>
                <span className="font-bold text-slate-900">{r.expectedStartDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-black block">Actual Start</span>
                <span className="font-bold text-slate-900">{r.actualStartDate || "—"}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-500 font-medium">Owner: {r.owner}</span>
              <button
                type="button"
                onClick={() => onViewRecord(r)}
                className="px-3.5 py-1.5 bg-[#042C51] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-t border-[#E6ECF2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <div>
          Showing <span className="font-black text-slate-900">{startIndex}</span> to{" "}
          <span className="font-black text-slate-900">{endIndex}</span> of{" "}
          <span className="font-black text-slate-900">{records.length}</span> onboarding records
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                page === safePage
                  ? "bg-[#042C51] text-white border-[#042C51]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
