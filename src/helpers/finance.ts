import { pluralize } from "@/utils/text";

const MONTH_DAY = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const MONTH_DAY_YEAR = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Heading of a due day in the collection queue: "Hoje", "Ontem", or the date
 * ("13 de outubro"; with the year when it isn't this year's).
 */
export function dueDayLabel(
  dueDate: string,
  daysLate: number,
  now = new Date(),
) {
  if (daysLate === 0) return "Hoje";
  if (daysLate === 1) return "Ontem";
  const date = new Date(`${dueDate}T00:00:00Z`);
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();
  return (sameYear ? MONTH_DAY : MONTH_DAY_YEAR).format(date);
}

/** "3 dias de atraso"; nothing for today. */
export function lateLabel(daysLate: number) {
  return daysLate > 0
    ? `${pluralize(daysLate, "dia", "dias")} de atraso`
    : null;
}
