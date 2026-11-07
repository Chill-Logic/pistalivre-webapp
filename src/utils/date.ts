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
