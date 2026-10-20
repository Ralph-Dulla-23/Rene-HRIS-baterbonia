import React from 'react';
import { CalendarDays, Clock, FileText, UserRound } from 'lucide-react';
import { useDemoAuth } from '../auth/DemoAuthContext';
import { useJourney } from './journey/JourneyContext';

/** Employee-only demonstration panel. Replaces company-wide administrative ledgers for employee accounts. */
export default function EmployeeSelfServiceView({kind}: {kind:'attendance'|'leave'|'resignation'}) {
  const {user}=useDemoAuth();
  const {journeys,attendance,simulatedCurrentDate}=useJourney();
  const journey=journeys.find(j=>j.sibsEmployeeId===user?.journeyEmployeeId || j.id===user?.journeyEmployeeId || (user?.email && j.email?.toLowerCase()===user.email.toLowerCase()));
  const id=journey?.sibsEmployeeId||journey?.id;
  const rows=attendance.filter(a=>id && (a.emp===id||a.emp===journey?.id)).sort((a,b)=>b.date.localeCompare(a.date));
  const title=kind==='attendance'?'My Attendance':kind==='leave'?'My Leave Requests':'My Resignation';
  const Icon=kind==='attendance'?Clock:kind==='leave'?CalendarDays:FileText;
  return <div className="w-full max-w-5xl space-y-5 text-[#042C51]">
    <header className="rounded-2xl border border-[#E6ECF2] bg-white px-6 py-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#042C51] to-[#FF5C28]"/>
      <div className="flex items-center gap-3"><span className="rounded-xl bg-[#042C51] p-3 text-[#FF5C28]"><Icon size={20}/></span><div><h1 className="text-xl font-extrabold">{title}</h1><p className="text-xs text-slate-500">Personal employee workspace · prototype demo data</p></div></div>
    </header>
    <div className="rounded-2xl border border-[#E6ECF2] bg-white p-6 shadow-sm">
      <div className="flex gap-3 items-center pb-4 mb-4 border-b border-[#E6ECF2]"><UserRound className="text-[#FF5C28]"/><div><p className="font-bold">{user?.name}</p><p className="text-xs text-slate-500">{user?.sibsId} {journey ? `· Linked: ${id}` : '· Awaiting employee record linkage'}</p></div></div>
      {kind==='attendance' ? <>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {[['Recorded shifts',rows.length],['Present / Late',rows.filter(r=>r.status==='Present'||r.status==='Late').length],['Absent',rows.filter(r=>r.status==='Absent').length]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-extrabold mt-1">{value}</p></div>)}
        </div>
        <p className="text-xs text-slate-500 mb-4">Showing available attendance records for your linked demo employee. Missing days are not automatically absences. Simulated date: {simulatedCurrentDate}.</p>
        {rows.length?<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#F7F9FC] text-[#042C51]"><tr><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Source</th></tr></thead><tbody>{rows.slice(0,25).map(r=><tr key={r.id} className="border-t border-[#E6ECF2]"><td className="p-3">{r.date}</td><td className="p-3 font-semibold">{r.status}</td><td className="p-3 text-slate-500">{r.source||'Demo record'}</td></tr>)}</tbody></table></div>:<p className="text-sm text-slate-500">No personal attendance entries are available yet.</p>}
      </> : <div className="rounded-xl border border-dashed border-[#BECBDA] bg-[#F7F9FC] p-6"><p className="font-bold">No {kind==='leave'?'leave requests':'resignation request'} on this demo account</p><p className="mt-2 text-sm text-slate-500">This personal demo page is intentionally empty until an employee-owned record is linked. HR's existing administration workflow and records are unchanged.</p></div>}
    </div>
  </div>;
}
