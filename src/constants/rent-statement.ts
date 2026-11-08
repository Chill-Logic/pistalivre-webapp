import type {
  RentStatementMode,
  StatementCycleState,
  StatementDayState,
} from "@/types/rent-statement";

/** The two statement models, as tabs (`?modelo=` in the URL). */
export const STATEMENT_MODES: {
  mode: RentStatementMode;
  slug: "saldo" | "dia";
  label: string;
  hint: string;
}[] = [
  {
    mode: "OLDEST",
    slug: "saldo",
    label: "Saldo devedor",
    hint: "Cada pagamento abate o aluguel mais antigo; o que falta aparece junto, no fim.",
  },
  {
    mode: "BY_DAY",
    slug: "dia",
    label: "Dia a dia",
    hint: "Cada pagamento aparece no dia (ou na semana/mês) a que se refere, com a data em que entrou; o calendário mostra onde faltou pagamento.",
  },
];

/** Same marks and colors as the PDF, so screen and file say the same. */
export const STATEMENT_DAY_MARK: Record<StatementDayState, string> = {
  PAID: "✓",
  PARTIAL: "◐",
  OPEN: "✗",
  WAIVED: "–",
  OFF: "",
  UPCOMING: "·",
};

export const STATEMENT_DAY_CLASS: Record<StatementDayState, string> = {
  PAID: "bg-success text-success-foreground",
  PARTIAL: "bg-error text-error-foreground",
  OPEN: "bg-error text-error-foreground",
  WAIVED: "bg-muted text-muted-foreground",
  OFF: "text-muted-foreground/60",
  UPCOMING: "border border-dashed text-muted-foreground",
};

export const STATEMENT_CYCLE_BADGE: Record<
  StatementCycleState,
  "success" | "warning" | "error" | "neutral"
> = {
  PAID: "success",
  PARTIAL: "warning",
  OPEN: "error",
  WAIVED: "neutral",
  UPCOMING: "neutral",
};

export const STATEMENT_CLOSES: Record<string, string> = {
  WEEKLY: "fecha semana",
  MONTHLY: "fecha mês",
  YEARLY: "fecha ano",
};

export const STATEMENT_LEGEND: [StatementDayState, string][] = [
  ["PAID", "Pago"],
  ["WAIVED", "Abonado"],
  ["PARTIAL", "Pago em parte"],
  ["OPEN", "Falta pagar"],
  ["UPCOMING", "Ainda não venceu"],
];

export const STATEMENT_WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
