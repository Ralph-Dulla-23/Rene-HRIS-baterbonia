import type { EmployeeJourney, ESEPCoachingEvaluation, ESEPCoachingSession } from './journeyTypes';

export function coachingForEmployee(sessions: ESEPCoachingSession[], employee: EmployeeJourney) {
  const ids = new Set([employee.id, employee.sibsEmployeeId].filter(Boolean));
  return sessions.filter(row => ids.has(row.emp)).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

export function evaluationFor(session: ESEPCoachingSession, evaluations: ESEPCoachingEvaluation[]) {
  return evaluations.find(e => e.sessionId === session.id) ?? null;
}

export function kpiComparison(evaluation: ESEPCoachingEvaluation | null) {
  if (!evaluation || evaluation.before === null || evaluation.after === null ||
    evaluation.before === undefined || evaluation.after === undefined ||
    !Number.isFinite(evaluation.before) || !Number.isFinite(evaluation.after)) return null;
  const difference = evaluation.after - evaluation.before;
  return { before: evaluation.before, after: evaluation.after, difference,
    differenceLabel: `${difference > 0 ? '+' : ''}${Number(difference.toFixed(2))}` };
}

export function coachingStatus(session: ESEPCoachingSession, evaluations: ESEPCoachingEvaluation[], asOf: string) {
  if (evaluationFor(session, evaluations)) return 'Evaluated' as const;
  if (session.due && session.due < asOf) return 'Overdue' as const;
  return 'Awaiting evaluation' as const;
}

export function coachingSummary(trainees: EmployeeJourney[], sessions: ESEPCoachingSession[], evaluations: ESEPCoachingEvaluation[], asOf: string) {
  const ids = new Set(trainees.flatMap(t => [t.id, t.sibsEmployeeId].filter((x): x is string => !!x)));
  const cohortSessions = sessions.filter(s => ids.has(s.emp));
  const evaluated = cohortSessions.filter(s => !!evaluationFor(s, evaluations));
  const measured = evaluated.filter(s => !!kpiComparison(evaluationFor(s, evaluations)));
  const overdue = cohortSessions.filter(s => coachingStatus(s, evaluations, asOf) === 'Overdue');
  const coached = trainees.filter(t => coachingForEmployee(cohortSessions, t).length > 0).length;
  return {
    total: trainees.length, coached,
    coverage: trainees.length ? Math.round(coached / trainees.length * 100) : null,
    sessions: cohortSessions, evaluated: evaluated.length,
    measured: measured.length, overdue: overdue.length,
    evaluationRate: cohortSessions.length ? Math.round(evaluated.length / cohortSessions.length * 100) : null
  };
}

export function averageAvailable(values: Array<number | null | undefined>) {
  const valid = values.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  return valid.length ? Math.round(valid.reduce((sum, n) => sum + n, 0) / valid.length) : null;
}

export const displayPercent = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? `${value}%` : 'Not assessed';
