import type { TrainingAssignment } from "./journeyTypes";

/** Calendar calculations use YYYY-MM-DD dates at UTC noon to avoid timezone rollovers. */
export function addCalendarDays(date: string, days: number): string {
  const parsed = new Date(date + "T12:00:00Z");
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function trainingDateBounds(startDate: string | undefined, simulatedDate: string) {
  // An unlinked journey has no assumed hire/start date: allow only the demo reference date.
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return { min: simulatedDate, max: simulatedDate, linked: false };
  }
  // The training calendar always ends on Day 90, even if the demo clock
  // advances further. Historical Journey records remain available elsewhere.
  return { min: startDate, max: addCalendarDays(startDate, 89), linked: true };
}

export const dateWithinBounds = (date: string, bounds: { min: string; max: string }) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= bounds.min && date <= bounds.max;

export const clampTrainingDate = (date: string, bounds: { min: string; max: string }) =>
  dateWithinBounds(date, bounds) ? date : date < bounds.min ? bounds.min : bounds.max;

export const clampCalendarMonth = (month: string, bounds: { min: string; max: string }) =>
  month < bounds.min.slice(0, 7) ? bounds.min.slice(0, 7) : month > bounds.max.slice(0, 7) ? bounds.max.slice(0, 7) : month;

export function moveCalendarMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  if (!year || !m || m < 1 || m > 12) return month;
  return new Date(Date.UTC(year, m - 1 + delta, 1, 12)).toISOString().slice(0, 7);
}

export function calendarMonthCells(month: string): Array<string | null> {
  const [year, m] = month.split("-").map(Number);
  const firstWeekday = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((firstWeekday + lastDay) / 7) * 7 }, (_, idx) => {
    const day = idx - firstWeekday + 1;
    return day < 1 || day > lastDay ? null : `${month}-${String(day).padStart(2, "0")}`;
  });
}

/** `owner` is who assigned the work, not automatically the trainer delivering it. */
export const trainerForTask = (assignment: Pick<TrainingAssignment, "trainer"> | null | undefined, cohortTrainer?: string): string | null =>
  assignment?.trainer?.trim() || cohortTrainer?.trim() || null;

export function trainersForDay(items: TrainingAssignment[], cohortTrainer?: string) {
  const explicit = items.length > 0 && items.every(item => !!item.trainer?.trim());
  const names = Array.from(new Set(items.map(item => trainerForTask(item, cohortTrainer)).filter((x): x is string => !!x)));
  return { names: names.length ? names : cohortTrainer ? [cohortTrainer] : [], explicit };
}

export function phaseOwnerForDay(startDate: string | undefined, date: string, trainer?: string, teamLeader?: string) {
  if (!startDate || date < startDate) return { phase: "Not started", owner: null };
  const elapsed = Math.floor((Date.parse(date + "T12:00:00Z") - Date.parse(startDate + "T12:00:00Z")) / 86400000) + 1;
  return elapsed <= 14 ? { phase: "FST · Days 1–14", owner: trainer || null }
    : elapsed <= 28 ? { phase: "PST · Days 15–28", owner: teamLeader || null }
    : { phase: `Supported journey · Day ${elapsed}`, owner: teamLeader || null };
}

export function canCreateTrainingAssignment(role: string | undefined, actorTrainer: string | undefined, traineeTrainer: string | undefined, date: string, bounds: {min: string; max: string; linked: boolean}, simulatedDate: string, finalOutcome?: string) {
  if (!bounds.linked || !!finalOutcome || !dateWithinBounds(date, bounds) || date < simulatedDate || date > addCalendarDays(bounds.min, 89)) return false;
  const elapsed = Math.floor((Date.parse(date + "T12:00:00Z") - Date.parse(bounds.min + "T12:00:00Z")) / 86400000) + 1;
  if (role === "HR Admin" || role === "Super Admin") return true;
  if (role === "Trainer") return elapsed <= 14 && !!actorTrainer && actorTrainer === traineeTrainer;
  return (role === "Team Leader" || role === "Manager") && elapsed > 14;
}
