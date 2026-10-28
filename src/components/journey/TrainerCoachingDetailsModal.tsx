import React, { useEffect, useState } from 'react';
import { X, ClipboardCheck, CalendarClock, UserRound, ShieldCheck } from 'lucide-react';
import type { EmployeeJourney, ESEPCoachingEvaluation, ESEPCoachingSession } from './journeyTypes';
import { coachingForEmployee, coachingStatus, evaluationFor, kpiComparison } from './trainerCoachingUtils';
import { COACHING_QA_GROUPS } from './coachingQAParameters';

interface Props {
  employee: EmployeeJourney;
  sessions: ESEPCoachingSession[];
  evaluations: ESEPCoachingEvaluation[];
  asOf: string;
  onClose: () => void;
  initialSessionId?: number;
}

function Information({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-[#E6ECF2] bg-[#F7F9FC] p-3">
    <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="whitespace-pre-wrap break-words text-xs leading-relaxed font-semibold text-[#042C51]">{value === undefined || value === null || value === '' ? 'Not recorded' : value}</div>
  </div>;
}

export default function TrainerCoachingDetailsModal({ employee, sessions, evaluations, asOf, onClose, initialSessionId }: Props) {
  const records = coachingForEmployee(sessions, employee);
  const [sessionId, setSessionId] = useState<number | null>(initialSessionId ?? records[0]?.id ?? null);
  const session = records.find(s => s.id === sessionId) ?? records[0] ?? null;
  const evaluation = session ? evaluationFor(session, evaluations) : null;
  const comparison = kpiComparison(evaluation);
  const selectedParameters = new Set(session?.qaParameters ?? []);
  const hasQaDetails = Boolean(session && (session.reasons?.includes('QA Score') || session.qaCallCaseId || session.qaLob || selectedParameters.size));
  const status = session ? coachingStatus(session, evaluations, asOf) : null;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061C33]/65 p-3 sm:p-6" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="esep-coaching-modal-title" className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E6ECF2] bg-white shadow-2xl">
      <div className="h-[3.5px] shrink-0 bg-gradient-to-r from-[#042C51] via-[#C24B30] to-[#FF5C28]" />
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E6ECF2] px-4 py-4 sm:px-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28]">ESEP · Coaching Form & Results</span>
          <h2 id="esep-coaching-modal-title" className="mt-1 text-lg font-extrabold text-[#042C51]">{employee.fullName}</h2>
          <p className="mt-1 text-xs text-slate-500">{employee.sibsEmployeeId ?? employee.id} · {employee.account} · Read-only development evidence</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close coaching details" className="rounded-lg border border-[#E6ECF2] p-2 text-[#042C51] hover:bg-[#F7F9FC]"><X size={18} /></button>
      </div>
      <div className="min-h-0 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-6">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Information label="Coaching sessions" value={records.length}/>
          <Information label="Evaluated follow-ups" value={`${records.filter(s => evaluationFor(s, evaluations)).length} / ${records.length}`}/>
          <Information label="Outstanding follow-ups" value={records.filter(s => !evaluationFor(s, evaluations)).length}/>
        </div>
        {!session ? <div className="rounded-xl border border-dashed border-[#BECBDA] bg-white p-8 text-center text-sm text-slate-500">No coaching sessions have been recorded for this trainee.</div> :
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[215px_minmax(0,1fr)]">
            <aside aria-label="Coaching session history" className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white self-start">
              <div className="border-b border-[#E6ECF2] p-3 text-xs font-extrabold text-[#042C51]">Coaching history</div>
              {records.map(s => <button key={s.id} type="button" onClick={() => setSessionId(s.id)} aria-pressed={s.id === session.id} className={`w-full border-b border-[#E6ECF2] px-3 py-3 text-left text-xs last:border-b-0 hover:bg-[#F7F9FC] ${session.id === s.id ? 'border-l-4 border-l-[#FF5C28] bg-[#FFF7F2]' : ''}`}>
                <span className="block font-bold text-[#042C51]">{s.type}</span>
                <span className="mt-1 block text-slate-500">{s.date} · ESEP-{s.id}</span>
                <span className="mt-1 block text-slate-500">{s.facilitator}</span>
                <span className="mt-2 inline-block rounded-full bg-[#E9F0FC] px-2 py-0.5 text-[10px] font-semibold text-[#042C51]">{coachingStatus(s, evaluations, asOf)}</span>
              </button>)}
            </aside>
            <article className="min-w-0 space-y-5 rounded-xl border border-[#E6ECF2] bg-white p-4 sm:p-5">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E6ECF2] pb-4">
                <div><span className="text-[10px] font-black text-[#FF5C28]">ESEP-{session.id} · COMPLETED COACHING FORM</span><h3 className="mt-1 text-base font-extrabold text-[#042C51]">{session.type}</h3><p className="text-xs text-slate-500">{session.date} · {session.facilitator} ({session.facilitatorRole})</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === 'Evaluated' ? 'bg-emerald-50 text-emerald-700' : status === 'Overdue' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{status}</span>
              </header>
              <section className="space-y-3"><h4 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#042C51]"><UserRound size={15} /> Coaching information</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Information label="Coach's name" value={session.facilitator} /><Information label="Coach's designation" value={session.coachDesignation ?? session.facilitatorRole}/>
                  <Information label="Agent / Coachee" value={employee.fullName}/><Information label="Immediate supervisor" value={session.coacheeSupervisor}/>
                  <Information label="Task Order" value={session.taskOrder}/><Information label="Audit week" value={session.auditWeek}/>
                  <Information label="Coaching date" value={session.date}/><Information label="Reason(s) for coaching" value={session.reasons?.join(', ')}/>
                </div>
              </section>
              {hasQaDetails && <section className="space-y-3"><h4 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#042C51]"><ShieldCheck size={15} /> QA score details & parameters</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Information label="Call / Case ID" value={session.qaCallCaseId}/><Information label="LOB" value={session.qaLob}/></div>
                <p className="text-xs text-slate-500">{selectedParameters.size} of 23 QA parameters selected in the coaching record. These selections do not replace an independent QA audit score.</p>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">{COACHING_QA_GROUPS.map(group => <div key={group.key} className="overflow-hidden rounded-xl border border-[#E6ECF2]"><div className="bg-[#E9F0FC] px-3 py-2 text-xs font-bold text-[#042C51]">{group.title} ({group.items.filter(i => selectedParameters.has(i)).length}/{group.items.length})</div><div className="space-y-2 p-3">{group.items.map(item => <div key={item} className="flex items-start gap-2 text-[11px] leading-snug text-[#042C51]"><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${selectedParameters.has(item) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-300'}`}>{selectedParameters.has(item) ? '✓' : '–'}</span><span>{item}</span></div>)}</div></div>)}</div>
              </section>}
              <section className="space-y-3"><h4 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#042C51]"><ClipboardCheck size={15} /> GROW coaching record</h4><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Information label="G · Goal" value={session.goal}/><Information label="R · Reality" value={session.reality}/><Information label="O · Options" value={session.options}/><Information label="W · Will" value={session.will}/></div></section>
              <section className="space-y-3"><h4 className="text-xs font-extrabold uppercase text-[#042C51]">Coaching overview, action plan & commitment</h4><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Information label="Overview" value={session.overview}/><Information label="Proposed action plan" value={session.actionPlan}/><Information label="Coachee commitment" value={session.commitment}/><Information label="Trigger / evidence source" value={session.source}/><Information label="Follow-up due date" value={session.due}/></div></section>
              <section className="space-y-3"><h4 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#042C51]"><CalendarClock size={15} /> Coaching effectiveness / follow-up</h4>
                {evaluation ? <><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-[#042C51]"><strong>Evaluated {evaluation.date}</strong><p className="mt-1">{evaluation.notes}</p><p className="mt-2 text-[11px] text-slate-500">Reviewed by {evaluation.owner} · {evaluation.source}</p></div>{comparison ? <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Information label="Before" value={`${comparison.before}${evaluation.unit ?? ''}`}/><Information label="After" value={`${comparison.after}${evaluation.unit ?? ''}`}/><Information label="Change (original units)" value={`${comparison.differenceLabel}${evaluation.unit ?? ''}`}/></div> : <p className="text-xs text-slate-500">No numeric before/after KPI comparison was recorded.</p>}{comparison && <p className="text-[11px] text-slate-500">An increase is not necessarily an improvement: effectiveness depends on the actual KPI direction and evidence. {evaluation.metricName ? `Metric: ${evaluation.metricName}` : 'KPI type not specified.'}</p>}</> : <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">No follow-up evaluation has been recorded yet. Pending does not mean unsuccessful.</p>}
              </section>
              <p className="border-t border-[#E6ECF2] pt-3 text-[11px] leading-relaxed text-slate-500">Illustrative local prototype records. Coaching outcomes do not change official QA, FST/PST scores, milestone decisions or employment status.</p>
            </article>
          </div>}
      </div>
      <footer className="flex shrink-0 justify-end border-t border-[#E6ECF2] p-3 sm:px-6"><button type="button" onClick={onClose} className="rounded-xl bg-[#042C51] px-5 py-2 text-xs font-bold text-white">Close</button></footer>
    </section>
  </div>;
}
