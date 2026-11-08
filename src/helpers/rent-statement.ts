import { STATEMENT_MODES } from "@/constants/rent-statement";
import { routeTo } from "@/constants/routes";
import type { BillingPeriod } from "@/types/billing";
import type { RentStatementMode, StatementDay } from "@/types/rent-statement";
import { isDayString } from "@/utils/date";

/**
 * `?de=&ate=` (yyyy-mm-dd) → the statement window. A missing or invalid
 * end is left open (the server uses the whole rental on that side).
 */
export function statementPeriodFromParams(params: URLSearchParams) {
  const valid = (value: string | null) =>
    value && isDayString(value) ? value : undefined;
  return {
    from: valid(params.get("de")),
    through: valid(params.get("ate")),
  };
}

/** The staff statement screen, on a period (the reconciliation's) or whole. */
export function rentalStatementHref(
  rentalId: string,
  period?: BillingPeriod | null,
) {
  const base = routeTo.rentalStatement(rentalId);
  if (!period) return base;
  const query = new URLSearchParams({ de: period.from, ate: period.through });
  return `${base}?${query}`;
}

/** `?modelo=` → mode (default: "Saldo devedor"). */
export function statementModeFromParam(
  value: string | null,
): RentStatementMode {
  return value === "dia" ? "BY_DAY" : "OLDEST";
}

export function statementModeSlug(mode: RentStatementMode) {
  return STATEMENT_MODES.find((item) => item.mode === mode)?.slug ?? "saldo";
}

/** A calendar cell: a statement day, a day outside the period, or padding. */
export type StatementCell = StatementDay | number | null;

export type StatementMonth = {
  key: string;
  /** "Novembro de 2026" */
  title: string;
  weeks: StatementCell[][];
};

/**
 * The statement days by month, as calendar weeks (Sunday first). A day
 * outside the period is just its number; a week with no statement day is
 * left out (same as the PDF).
 */
export function statementMonths(days: StatementDay[]): StatementMonth[] {
  const byMonth = new Map<string, StatementDay[]>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), day]);
  }
  return [...byMonth.entries()].map(([key, monthDays]) => {
    const [year, month] = key.split("-").map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const byDay = new Map(
      monthDays.map((day) => [Number(day.date.slice(8, 10)), day]),
    );
    const cells: StatementCell[] = [];
    for (let i = 0; i < first.getUTCDay(); i += 1) cells.push(null);
    for (let n = 1; n <= lastDay; n += 1) cells.push(byDay.get(n) ?? n);
    while (cells.length % 7) cells.push(null);
    const weeks: StatementCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      if (week.some((cell) => cell !== null && typeof cell !== "number"))
        weeks.push(week);
    }
    const title = first.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return {
      key,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      weeks,
    };
  });
}
