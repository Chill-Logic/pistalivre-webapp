import { todayInBrasilia } from "@/utils/date";

/** "YYYY-MM": the month a bill refers to (how the API speaks). */
const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isMonthKey(value: string) {
  return MONTH_KEY.test(value);
}

/** The month it is now in Brasília. */
export function currentMonth(now = new Date()) {
  return todayInBrasilia(now).slice(0, 7);
}

/** "YYYY-MM" shifted by `months`. */
export function addMonths(month: string, months: number) {
  const [year, value] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, value - 1 + months, 1));
  return date.toISOString().slice(0, 7);
}

/** "novembro de 2026". */
export function formatMonth(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Date(Date.UTC(year, value - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "nov/2026" — where space is short (cards, lists). */
export function formatShortMonth(month: string) {
  const [year, value] = month.split("-").map(Number);
  const name = new Date(Date.UTC(year, value - 1, 1))
    .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
    .replace(".", "");
  return `${name}/${year}`;
}

/** Every month from `from` to `to`, newest first (both included). */
export function monthsBetween(from: string, to: string) {
  const out: string[] = [];
  for (let month = to; month >= from; month = addMonths(month, -1)) {
    out.push(month);
  }
  return out;
}
