import { addDays, weekdayOf } from "@/utils/date";

/** The first yyyy-mm-dd on `weekday` (0 = Sunday) on or after `day`. */
export function onOrAfterWeekday(day: string, weekday: number): string {
  const shift = (weekday - weekdayOf(day) + 7) % 7;
  return addDays(day, shift);
}

/** The first yyyy-mm-dd on `weekday` strictly after `day`. */
export function afterWeekday(day: string, weekday: number): string {
  return onOrAfterWeekday(addDays(day, 1), weekday);
}

/**
 * Due dates of `count` weekly installments on `weekday`, the first one the
 * first such weekday after `start` (together with the weekly rent).
 */
export function weeklyDatesOn(start: string, weekday: number, count: number): string[] {
  const first = afterWeekday(start, weekday);
  return Array.from({ length: Math.max(0, count) }, (_, i) => addDays(first, i * 7));
}
