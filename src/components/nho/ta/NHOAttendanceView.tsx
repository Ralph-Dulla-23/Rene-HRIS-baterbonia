import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Search, UserX, Users } from "lucide-react";
import { useNHO } from "../NHOContext";
import { NHOApplicant } from "../nhoTypes";

interface NHOAttendanceViewProps {
  onOpenAttendanceModal: (applicant: NHOApplicant) => void;
  onOpenDetails: (applicant: NHOApplicant) => void;
}

/** Dedicated attendance view; does not repeat the general NHO Dashboard. */
export default function NHOAttendanceView({ onOpenAttendanceModal, onOpenDetails }: NHOAttendanceViewProps) {
  const { applicants } = useNHO();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const metrics = useMemo(() => ({
    scheduled: applicants.length,
    show: applicants.filter(a => a.attendance === "Show").length,
    noShow: applicants.filter(a => a.attendance === "No Show").length,
    pending: applicants.filter(a => a.attendance === "Pending").length
  }), [applicants]);

  const filtered = useMemo(() => applicants.filter(app => {
    const term = search.trim().toLowerCase();
    const matches = [app.fullName, app.applicantNumber, app.position, app.account]
      .some(value => value.toLowerCase().includes(term));
    return matches && (status === "All" || app.attendance === status);
  }), [applicants, search, status]);

  const cards = [
    { label: "Scheduled", value: metrics.scheduled, note: "Orientation candidates", icon: Users, color: "text-blue-600", iconBg: "bg-blue-50 border-blue-100" },
    { label: "Show", value: metrics.show, note: "Attendance confirmed", icon: CheckCircle2, color: "text-emerald-600", iconBg: "bg-emerald-50 border-emerald-100" },
    { label: "No Show", value: metrics.noShow, note: "Follow-up or reschedule", icon: UserX, color: "text-red-600", iconBg: "bg-red-50 border-red-100" },
    { label: "Pending Attendance", value: metrics.pending, note: "Awaiting attendance tagging", icon: Clock3, color: "text-amber-600", iconBg: "bg-amber-50 border-amber-100" }
  ];

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex min-h-[86px] sm:min-h-[92px] flex-col justify-between rounded-xl border border-[#E6ECF2] bg-white p-3 shadow-xs transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${card.color} truncate`}>
                  {card.label}
                </span>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${card.iconBg} ${card.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1">
                <div className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-[#042C51]">
                  {card.value}
                </div>
                <div className="mt-0.5 text-[10.5px] font-medium text-slate-500 truncate" title={card.note}>
                  {card.note}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="min-w-0 rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#042C51]">Attendance Records</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Tag arrivals, review no-shows, and open attendance corrections for the scheduled cohort.</p>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 items-end gap-3 md:grid-cols-12">
          <label className="space-y-1 md:col-span-8">
            <span className="block text-xs font-semibold text-slate-700">Search</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant, ID, position, or account..." className="w-full rounded-xl border border-[#E6ECF2] bg-white py-2.5 pl-9 pr-3 text-xs text-[#042C51] placeholder:text-slate-400 focus:border-[#FF5C28] focus:outline-none focus:ring-1 focus:ring-[#FF5C28]" />
            </span>
          </label>
          <label className="space-y-1 md:col-span-4">
            <span className="block text-xs font-semibold text-slate-700">Attendance Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-xl border border-[#E6ECF2] bg-white px-3 py-2.5 text-xs font-semibold text-[#042C51] focus:border-[#FF5C28] focus:outline-none focus:ring-1 focus:ring-[#FF5C28]">
              <option value="All">All Attendance ({applicants.length})</option>
              <option value="Show">Show ({metrics.show})</option>
              <option value="No Show">No Show ({metrics.noShow})</option>
              <option value="Pending">Pending ({metrics.pending})</option>
            </select>
          </label>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E6ECF2] bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6ECF2] px-4 pt-2">
            <div className="flex items-center gap-2 border-b-2 border-[#FF5C28] px-1 pb-3 pt-1 text-xs font-extrabold text-[#FF5C28]">
              <CalendarDays className="h-3.5 w-3.5" /> ATTENDANCE
              <span className="rounded-full bg-[#042C51] px-2 py-0.5 text-[10px] font-black text-white">{filtered.length}</span>
            </div>
            <span className="pb-2 text-[11px] font-medium text-slate-500">{filtered.length} of {applicants.length} records</span>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[930px] border-collapse text-left text-xs">
              <thead><tr className="border-b border-[#E6ECF2] bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Applicant</th><th className="px-3 py-3">Position &amp; Account</th>
                <th className="px-3 py-3">Scheduled NHO</th><th className="px-3 py-3">Attendance</th>
                <th className="px-3 py-3">Next Step</th><th className="px-4 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#E6ECF2] text-slate-700">
                {filtered.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No attendance records match your filters.</td></tr> : filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3"><div className="font-bold text-[#042C51]">{app.fullName}</div><div className="font-mono text-[10px] text-slate-400">{app.applicantNumber}</div></td>
                    <td className="px-3 py-3"><div className="font-medium text-[#042C51]">{app.position}</div><div className="text-[11px] text-slate-500">{app.account}</div></td>
                    <td className="px-3 py-3 font-semibold text-[#042C51]">{app.scheduledNhoDate}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold ${app.attendance === "Show" ? "bg-emerald-50 text-emerald-700" : app.attendance === "No Show" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{app.attendance}</span></td>
                    <td className="px-3 py-3 text-slate-500">{app.attendance === "No Show" ? "Follow-up / Reschedule" : app.attendance === "Pending" ? "Confirm attendance" : "Review requirements"}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onOpenAttendanceModal(app)} className="rounded-lg border border-[#BECBDA] bg-white px-3 py-1.5 text-[11px] font-bold text-[#042C51] hover:bg-slate-50">{app.attendance === "Pending" ? "Tag Attendance" : "Edit Attendance"}</button>
                      <button type="button" onClick={() => onOpenDetails(app)} className="rounded-lg bg-[#042C51] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0B365F]">View Details</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
