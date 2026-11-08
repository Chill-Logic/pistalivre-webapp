/** OLDEST = "Saldo devedor" (each payment pays the oldest rent); BY_DAY = "Dia a dia". */
export type RentStatementMode = "OLDEST" | "BY_DAY";

export type StatementDayState =
  "PAID" | "PARTIAL" | "OPEN" | "WAIVED" | "OFF" | "UPCOMING";

export type StatementCycleState =
  "PAID" | "PARTIAL" | "OPEN" | "WAIVED" | "UPCOMING";

/** One day of the rent (dates are calendar dates at midnight UTC). */
export type StatementDay = {
  date: string;
  /** Why it is waived/off, when it is. */
  reason: string | null;
  state: StatementDayState;
  /** The cycle (week/month/year) this day closes, if any. */
  closesCycle: "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  missing: number;
  paidOn: string | null;
};

export type StatementCycle = {
  start: string;
  end: string;
  due: string;
  state: StatementCycleState;
  amount: number;
};

/** Texts the management prints, ready (never rewrite money in the front). */
export type StatementLabels = {
  totals: { expected: number; paid: number; advance: number };
  totalsState: { label: string; state: StatementCycleState };
  closingLegend: string | null;
  cycles: {
    range: string;
    state: string;
    due: string;
    payments: { text: string; note: string | null }[];
  }[];
};

export type RentStatementReport = {
  available: true;
  customerName: string;
  vehicleLabel: string;
  plate: string;
  generatedAtLabel: string;
  /** Rescinded rental; `reasons` comes only in the staff statement. */
  termination?: { dateLabel: string; reasons: string | null } | null;
  debts: {
    label: string;
    description: string | null;
    amount: number;
    balance: number;
  }[];
  statement: {
    mode: RentStatementMode;
    from: string;
    through: string;
    days: StatementDay[];
    /** `labels.cycles[i]` goes with `cycles[i]`. */
    cycles: StatementCycle[];
    balance: number;
    credit: number;
    totalPaid: number;
    paidThrough: string | null;
    openDays: number;
    openFrom: string | null;
    current: { due: string; amount: number } | null;
  };
  labels: StatementLabels;
};

/** GET …/statement: no rent ledger yet (e.g. no charge) → a message. */
export type RentStatement =
  RentStatementReport | { available: false; message: string };

export type RentStatementParams = {
  mode: RentStatementMode;
  from?: string;
  through?: string;
};
