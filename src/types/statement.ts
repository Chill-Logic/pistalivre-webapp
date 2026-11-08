export type StatementSource = "ASAAS" | "INTER";

/** One bank/gateway line, as exported to the accountant (read-only here). */
export type StatementLine = {
  key: string;
  /** yyyy-mm-dd */
  date: string;
  type: string;
  /** Ready-made by the API (explicit label or prettified code); null = no type. */
  typeLabel: string | null;
  originalDescription: string;
  /** Who paid / received, when the bank tells. */
  counterparty: string | null;
  /** Our own description. */
  note: string | null;
  /** Our description of a pix WE sent, offered as a suggestion. */
  suggestion: string | null;
  /** Transfer between our own accounts (out of the totals). */
  internal: boolean;
  internalSuggested: boolean;
  /** Signed: negative = money out. */
  amount: number;
  balance: number | null;
  source: StatementSource;
};

export type StatementTotals = {
  inflow: number;
  outflow: number;
  net: number;
  internalIn: number;
  internalOut: number;
  internalCount: number;
};

export type StatementSourceSummary = {
  source: StatementSource;
  totals: StatementTotals;
  /** Hit the provider's row cap: totals are partial. */
  truncated: boolean;
  /** This source failed; the others still came. */
  error: string | null;
};

export type Statement = {
  items: StatementLine[];
  total: number;
  page: number;
  pageSize: number;
  period: { start: string; end: string };
  sources: StatementSourceSummary[];
};

export type StatementFilters = {
  start: string;
  end: string;
  source: StatementSource | "ALL";
  page: number;
  pageSize: number;
};

/**
 * PATCH /finance/statement/annotation: OUR note and/or the "internal
 * transfer" mark of one line (matched by its key). `note: ""` clears it;
 * date/amount/originalDescription are the line's snapshot, for the audit.
 */
export type StatementAnnotationInput = {
  source: StatementSource;
  transactionKey: string;
  note?: string;
  internal?: boolean;
  date: string;
  amount: number;
  originalDescription: string;
};
