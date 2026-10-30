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

  // Counts for the 3 top metric cards matching image_cbd83600.png
  const recordedCount = records.length;
  const evaluatedCount = records.filter(s => evaluationFor(s, evaluations)).length;
  const overdueCount = records.filter(s => coachingStatus(s, evaluations, asOf) === 'Overdue').length;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#042C51]/60 backdrop-blur-xs p-3 sm:p-6" 
      role="presentation" 
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="esep-coaching-modal-title" 
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E6ECF2] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Subtle Top Accent Gradient Line matching SiBS HRIS design guidelines */}
        <div className="h-[3.5px] shrink-0 bg-gradient-to-r from-[#042C51] via-[#1A4C7B] to-[#FF5C28]" />

        {/* Modal Top Header (SiBS HRIS branded) */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E6ECF2] px-6 py-4 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#042C51] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {employee.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28] block">
                ESEP • EMPLOYEE COACHING RESULTS
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <h2 id="esep-coaching-modal-title" className="text-lg sm:text-xl font-extrabold text-[#042C51] tracking-tight">
                  {employee.fullName}
                </h2>
                <span className="font-mono text-xs font-bold text-[#042C51] bg-[#F0F4F8] border border-[#BECBDA] px-2 py-0.5 rounded-md">
                  {employee.sibsEmployeeId ?? employee.id}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                {employee.account} • Coaching forms and recorded follow-up evaluations
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close coaching details" 
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#042C51] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Container with Light Gray Background */}
        <div className="min-h-0 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-6 space-y-5">
          {/* 3 Top Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#042C51]">{recordedCount}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Recorded sessions</div>
            </div>
            <div className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {evaluatedCount}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Evaluated follow-ups</div>
            </div>
            <div className="rounded-xl border border-[#E6ECF2] bg-white p-4 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#042C51]">
                {overdueCount}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Overdue follow-ups</div>
            </div>
          </div>

          {!session ? (
            <div className="rounded-xl border border-dashed border-[#BECBDA] bg-white p-10 text-center text-sm text-slate-500">
              No coaching sessions have been recorded for this employee.
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] items-start">
              {/* Left Column: Coaching Session History */}
              <aside 
                aria-label="Coaching session history" 
                className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3 space-y-2 self-start w-full"
              >
                <div className="text-xs font-black text-[#042C51] uppercase tracking-wider px-1 py-1">
                  Coaching session history
                </div>
                <div className="space-y-2">
                  {records.map(s => {
                    const isSelected = s.id === session.id;
                    const sStatus = coachingStatus(s, evaluations, asOf);
                    return (
                      <button 
                        key={s.id} 
                        type="button" 
                        onClick={() => setSessionId(s.id)} 
                        aria-pressed={isSelected} 
                        className={`w-full text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FFF7F2] border-l-4 border-l-[#FF5C28] rounded-r-xl rounded-l-xs p-3 space-y-1 shadow-2xs' 
                            : 'bg-white border border-[#E6ECF2] rounded-xl p-3 space-y-1 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs font-bold text-[#042C51]">{s.type}</span>
                        <span className="block text-[11px] text-slate-500">{s.date} • ESEP-{s.id}</span>
                        <span className="block text-[11px] text-[#215789] font-medium">{s.facilitator}</span>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-1 ${
                          sStatus === 'Evaluated' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : sStatus === 'Overdue' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {sStatus}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Right Column: Completed Coaching Form Card */}
              <article className="min-w-0 space-y-6 rounded-xl border border-[#E6ECF2] bg-white p-5 sm:p-6 shadow-2xs">
                {/* Form Header */}
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E6ECF2] pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C28] block">
                      ESEP-{session.id} • COMPLETED COACHING FORM
                    </span>
                    <h3 className="mt-1 text-xl sm:text-2xl font-black text-[#042C51]">
                      {session.type}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 font-medium">
                      {session.date} • Coach: {session.facilitator} ({session.coachDesignation ?? session.facilitatorRole})
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    status === 'Evaluated' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : status === 'Overdue' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {status}
                  </span>
                </header>

                {/* Section 1: COACHING INFORMATION */}
                <section className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#042C51]">
                    COACHING INFORMATION
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Coach's Name (Full Name)</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.facilitator}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Coach's Designation</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.coachDesignation ?? session.facilitatorRole}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Agent / Coachee's Name</div>
                      <div className="text-xs font-bold text-[#042C51]">{employee.fullName}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Immediate Supervisor</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.coacheeSupervisor ?? session.facilitator}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Task Order</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.taskOrder ?? "TO04 PAC"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Coaching Date</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.date}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Audit Week #</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.auditWeek ?? "Week 2"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Reason For Coaching</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(session.reasons && session.reasons.length > 0 
                          ? session.reasons 
                          : ["QA Score", "Average Handle Time", "Attendance - Tardiness"]
                        ).map((reason, rIdx) => (
                          <span 
                            key={rIdx} 
                            className="inline-block bg-[#F0F4F8] text-[#042C51] border border-[#BECBDA] px-2.5 py-0.5 rounded-lg font-bold text-[10px]"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: QA SCORE DETAILS */}
                {hasQaDetails && (
                  <section className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#042C51]">
                      QA SCORE DETAILS
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                        <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Call / Case ID</div>
                        <div className="text-xs font-bold text-[#042C51]">{session.qaCallCaseId ?? "PAC-24187"}</div>
                      </div>
                      <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                        <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Line of Business (LOB)</div>
                        <div className="text-xs font-bold text-[#042C51]">{session.qaLob ?? "Call"}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedParameters.size} of 23 QA parameters selected in the coaching record. These selections do not replace an independent QA audit score.
                    </p>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                      {COACHING_QA_GROUPS.map(group => (
                        <div key={group.key} className="overflow-hidden rounded-xl border border-[#E6ECF2] bg-white shadow-2xs">
                          <div className="bg-[#F0F4F8] px-3 py-2 text-xs font-bold text-[#042C51] border-b border-[#E6ECF2]">
                            {group.title} ({group.items.filter(i => selectedParameters.has(i)).length}/{group.items.length})
                          </div>
                          <div className="space-y-2 p-3">
                            {group.items.map(item => (
                              <div key={item} className="flex items-start gap-2 text-[11px] leading-snug text-[#042C51]">
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                  selectedParameters.has(item) ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-300'
                                }`}>
                                  {selectedParameters.has(item) ? '✓' : '–'}
                                </span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3: GROW COACHING RECORD */}
                <section className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#042C51]">
                    GROW COACHING RECORD
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-[#FF5C28] uppercase tracking-wide mb-1">G • Goal</div>
                      <div className="text-xs font-semibold text-[#042C51] leading-relaxed">{session.goal ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-[#FF5C28] uppercase tracking-wide mb-1">R • Reality</div>
                      <div className="text-xs font-semibold text-[#042C51] leading-relaxed">{session.reality ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-[#FF5C28] uppercase tracking-wide mb-1">O • Options</div>
                      <div className="text-xs font-semibold text-[#042C51] leading-relaxed">{session.options ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-[#FF5C28] uppercase tracking-wide mb-1">W • Will</div>
                      <div className="text-xs font-semibold text-[#042C51] leading-relaxed">{session.will ?? "Not recorded"}</div>
                    </div>
                  </div>
                </section>

                {/* Section 4: COACHING OVERVIEW, ACTION PLAN & COMMITMENT */}
                <section className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#042C51]">
                    COACHING OVERVIEW, ACTION PLAN & COMMITMENT
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5 sm:col-span-2">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Overview</div>
                      <div className="text-xs font-medium text-slate-700 leading-relaxed">{session.overview ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Proposed Action Plan</div>
                      <div className="text-xs font-semibold text-[#042C51]">{session.actionPlan ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Coachee Commitment</div>
                      <div className="text-xs font-semibold text-[#042C51]">{session.commitment ?? "Not recorded"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Trigger / Evidence Source</div>
                      <div className="text-xs font-medium text-slate-600">{session.source ?? "Routine TL one-to-one"}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3.5">
                      <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide mb-1">Follow-up Due Date</div>
                      <div className="text-xs font-bold text-[#042C51]">{session.due ?? "Pending"}</div>
                    </div>
                  </div>
                </section>

                {/* Section 5: COACHING EFFECTIVENESS / FOLLOW-UP */}
                <section className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#042C51]">
                    COACHING EFFECTIVENESS & FOLLOW-UP EVALUATION
                  </h4>
                  {evaluation ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs leading-relaxed text-[#042C51] space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <strong className="text-emerald-950 font-black">
                            Evaluated {evaluation.date}
                          </strong>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            Effective
                          </span>
                        </div>
                        <p className="text-emerald-900 font-medium">{evaluation.notes}</p>
                        <p className="text-[11px] text-slate-500 pt-1">
                          Reviewed by {evaluation.owner} • {evaluation.source}
                        </p>
                      </div>

                      {comparison && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3">
                            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Before</div>
                            <div className="text-lg font-black text-[#042C51]">{comparison.before}{evaluation.unit ?? ''}</div>
                          </div>
                          <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3">
                            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">After</div>
                            <div className="text-lg font-black text-[#042C51]">{comparison.after}{evaluation.unit ?? ''}</div>
                          </div>
                          <div className="rounded-xl border border-[#E6ECF2] bg-[#FAFCFF] p-3">
                            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Recorded Lift</div>
                            <div className="text-lg font-black text-emerald-600">{comparison.differenceLabel}{evaluation.unit ?? ''}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between">
                      <span>No follow-up evaluation has been recorded yet. Pending does not mean unsuccessful.</span>
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Pending Evaluation</span>
                    </div>
                  )}
                </section>

                <p className="border-t border-[#E6ECF2] pt-3 text-[11px] leading-relaxed text-slate-400">
                  Illustrative local prototype records. Coaching outcomes do not change official QA, FST/PST scores, milestone decisions or employment status.
                </p>
              </article>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <footer className="flex shrink-0 justify-end border-t border-[#E6ECF2] p-4 sm:px-6 bg-[#FAFCFF]">
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-xl bg-[#042C51] hover:bg-[#0B365F] px-6 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
