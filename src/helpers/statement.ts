import type { SelectOption } from "@/helpers/select";
import type { StatementSourceSummary } from "@/types/statement";
import { addDays, monthRange, todayInBrasilia } from "@/utils/date";

type PeriodPreset = SelectOption & { start: string; end: string };

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** How many past months (by name) the period picker offers. */
const PAST_MONTHS = 6;

export const DEFAULT_PERIOD = "30d";

/**
 * Period presets, computed from "today" in Brasília. A preset select instead
 * of a date input: the native date picker is drawn by the browser.
 */
export function periodPresets(today = todayInBrasilia()): PeriodPreset[] {
  const thisMonth = monthRange(today);
  const presets: PeriodPreset[] = [
    {
      value: "30d",
      label: "Últimos 30 dias",
      start: addDays(today, -29),
      end: today,
    },
    {
      value: "7d",
      label: "Últimos 7 dias",
      start: addDays(today, -6),
      end: today,
    },
    {
      value: "90d",
      label: "Últimos 90 dias",
      start: addDays(today, -89),
      end: today,
    },
    { value: "mes", label: "Este mês", start: thisMonth.start, end: today },
  ];
  for (let offset = 1; offset <= PAST_MONTHS; offset += 1) {
    const range = monthRange(today, -offset);
    const label = MONTH_LABEL.format(new Date(`${range.start}T00:00:00Z`));
    presets.push({
      value: range.start.slice(0, 7),
      label: label.charAt(0).toUpperCase() + label.slice(1),
      ...range,
    });
  }
  return presets;
}

export function resolvePeriod(value: string, today = todayInBrasilia()) {
  const presets = periodPresets(today);
  return presets.find((preset) => preset.value === value) ?? presets[0];
}

/** Sources that failed, for the per-source warning. */
export function failedSources(sources: StatementSourceSummary[]) {
  return sources.filter((source) => source.error);
}

/** Tag each line with its account only when more than one account answered. */
export function showsSourcePerLine(
  selected: string,
  sources: StatementSourceSummary[],
) {
  return (
    selected === "ALL" && sources.filter((source) => !source.error).length > 1
  );
}
