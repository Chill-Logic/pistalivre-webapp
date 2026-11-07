const BRASILIA = "America/Sao_Paulo";

/**
 * Today as YYYY-MM-DD in Brasília. "Today" never comes from UTC: from 21h to
 * midnight the two disagree (the server runs in UTC, the operation doesn't).
 */
export function todayInBrasilia(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: BRASILIA });
}

/** YYYY-MM-DD of a calendar date stored at midnight UTC. */
export function calendarDay(value: string) {
  return value.slice(0, 10);
}

/** yyyy-mm-dd shifted by `days` (calendar arithmetic in UTC, no DST drift). */
export function addDays(day: string, days: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** First and last day (yyyy-mm-dd) of the month `offset` months from `day`. */
export function monthRange(day: string, offset = 0) {
  const [year, month] = day.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1 + offset, 1));
  const last = new Date(Date.UTC(year, month + offset, 0));
  return {
    start: first.toISOString().slice(0, 10),
    end: last.toISOString().slice(0, 10),
  };
}
