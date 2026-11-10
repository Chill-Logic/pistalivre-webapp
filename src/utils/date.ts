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

/** How many days from `start` to `end` (yyyy-mm-dd), both included. */
export function daysInclusive(start: string, end: string) {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}

/** Day of the week of a yyyy-mm-dd (0 = Sunday). */
export function weekdayOf(day: string) {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
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

/** yyyy-mm-dd → local Date at midnight (what calendar widgets expect). */
export function fromDayString(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

/** Local Date → yyyy-mm-dd (the calendar day the user picked). */
export function toDayString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDayString(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(fromDayString(value).getTime())
  );
}

/** "dd/mm/aaaa" → "yyyy-mm-dd", or null when it is not a real date. */
export function brDateToDay(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = `${yyyy}-${mm}-${dd}`;
  const date = new Date(`${day}T00:00:00Z`);
  return date.getUTCDate() === Number(dd) &&
    date.getUTCMonth() + 1 === Number(mm)
    ? day
    : null;
}

/** Calendar date (midnight UTC ISO or yyyy-mm-dd) → "dd/mm/aaaa". */
export function dayToBrDate(value: string) {
  const [yyyy, mm, dd] = value.slice(0, 10).split("-");
  return `${dd}/${mm}/${yyyy}`;
}

/** Whole years from a birth date (calendar date) to `today` (yyyy-mm-dd). */
export function ageInYears(birthDate: string, today: string) {
  const [birthYear, birthMonth, birthDay] = calendarDay(birthDate)
    .split("-")
    .map(Number);
  const [year, month, day] = today.split("-").map(Number);
  const hadBirthday =
    month > birthMonth || (month === birthMonth && day >= birthDay);
  return year - birthYear - (hadBirthday ? 0 : 1);
}
